import os
import uuid
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from celery.result import AsyncResult
from models import SubmitRequest, DocumentType

# Import evaluation functions for testing endpoints
from tenant.bank_account_evaluation import evaluate_bank_account
from tenant.college_evaluation import evaluate_college
from tenant.offer_letter_evaluation import evaluate_offer_letter_from_pdf
from home_owner.property_evaluation import evaluate_property
from tasks import (
    evaluate_bank_statement_task,
    evaluate_offer_letter_task,
    evaluate_college_task,
    celery_app
)

app = FastAPI(title="Fintech Demo App with Celery")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from home_owner.property_state_evaluation import router as home_owner_router
app.include_router(home_owner_router)

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# API v1 Router for Onboarding & Auth Flows
# ---------------------------------------------------------------------------
api_v1 = APIRouter(prefix="/api/v1")

# In-memory session tracking for MVP
tenant_sessions = {}
properties_db = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class RoleRequest(BaseModel):
    role: str

class IdentityRequest(BaseModel):
    pan_number: str
    aadhaar_number: str

class PropertyRequest(BaseModel):
    name: str
    address: str
    city: str
    monthly_rent: float
    security_deposit: float

class PropertyEvaluationRequest(BaseModel):
    property_id: str

@api_v1.post("/auth/register")
async def register_endpoint(data: RegisterRequest):
    return {
        "access_token": f"mock_token_register_{uuid.uuid4().hex[:8]}",
        "token_type": "bearer"
    }

@api_v1.post("/auth/login")
async def login_endpoint(data: LoginRequest):
    return {
        "access_token": f"mock_token_login_{uuid.uuid4().hex[:8]}",
        "token_type": "bearer"
    }

@api_v1.post("/users/role")
async def set_role_endpoint(data: RoleRequest):
    if data.role not in ["tenant", "home_owner"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'tenant' or 'home_owner'.")
    return {"status": "success", "role": data.role}

@api_v1.post("/verify/identity")
async def verify_identity_endpoint(data: IdentityRequest):
    return {
        "status": "success",
        "message": "Identity verification successful."
    }

@api_v1.post("/evaluations/education")
async def submit_education_endpoint(
    request: Request,
    city: str = Form(...),
    college: str = Form(...),
    documents: Optional[List[UploadFile]] = File(None, alias="documents[]")
):
    token = request.headers.get("Authorization", "default")
    if token not in tenant_sessions:
        tenant_sessions[token] = {}
    tenant_sessions[token]["college"] = college

    if documents:
        for doc in documents:
            file_path = os.path.join(UPLOAD_DIR, f"edu_{uuid.uuid4()}_{doc.filename}")
            with open(file_path, "wb") as f:
                f.write(await doc.read())
    return {"status": "success", "city": city, "college": college}

@api_v1.post("/evaluations/offer-letter")
async def submit_offer_letter_endpoint(
    request: Request,
    offer_letter: UploadFile = File(...)
):
    token = request.headers.get("Authorization", "default")
    if token not in tenant_sessions:
        tenant_sessions[token] = {}

    file_path = os.path.join(UPLOAD_DIR, f"offer_{uuid.uuid4()}_{offer_letter.filename}")
    with open(file_path, "wb") as f:
        f.write(await offer_letter.read())
        
    tenant_sessions[token]["offer_letter"] = file_path
    return {"status": "success"}

@api_v1.post("/evaluations/bank-statement")
async def submit_bank_statement_endpoint(
    request: Request,
    bank_statement: UploadFile = File(...)
):
    token = request.headers.get("Authorization", "default")
    if token not in tenant_sessions:
        tenant_sessions[token] = {}

    file_path = os.path.join(UPLOAD_DIR, f"bank_{uuid.uuid4()}_{bank_statement.filename}")
    with open(file_path, "wb") as f:
        f.write(await bank_statement.read())

    tenant_sessions[token]["bank_statement"] = file_path
    return {"status": "success"}

@api_v1.post("/evaluations/tenant")
async def evaluate_tenant_endpoint(request: Request):
    token = request.headers.get("Authorization", "default")
    session = tenant_sessions.get(token, {})
    
    college_name = session.get("college")
    offer_letter_path = session.get("offer_letter")
    bank_statement_path = session.get("bank_statement")
    
    score = 0
    tier_details = []
    
    # Evaluate College
    if college_name:
        try:
            from tenant.college_evaluation import evaluate_college
            col_res = evaluate_college(college_name)
            tier = col_res.get("tier", 3)
            score += (4 - tier) * 10
            tier_details.append(f"College: Tier {tier}")
        except Exception as e:
            print("College evaluation failed:", e)
            
    # Evaluate Offer Letter
    if offer_letter_path and os.path.exists(offer_letter_path):
        try:
            from tenant.offer_letter_evaluation import evaluate_offer_letter_from_pdf
            off_res = evaluate_offer_letter_from_pdf(offer_letter_path)
            c_tier = off_res.get("company_tier", 3)
            s_tier = off_res.get("salary_tier", 3)
            score += (4 - c_tier) * 10 + (4 - s_tier) * 10
            tier_details.append(f"Company: Tier {c_tier}, Salary: Tier {s_tier}")
        except Exception as e:
            print("Offer letter evaluation failed:", e)
            
    # Evaluate Bank Statement
    if bank_statement_path and os.path.exists(bank_statement_path):
        try:
            from tenant.bank_account_evaluation import evaluate_bank_account
            bank_res = evaluate_bank_account(bank_statement_path)
            a_tier = bank_res.get("account_age_tier", 3)
            f_tier = bank_res.get("transaction_frequency_tier", 3)
            v_tier = bank_res.get("total_volume_tier", 3)
            score += (4 - a_tier) * 5 + (4 - f_tier) * 5 + (4 - v_tier) * 5
            tier_details.append(f"Bank: {a_tier}/{f_tier}/{v_tier}")
        except Exception as e:
            print("Bank account evaluation failed:", e)
            
    final_score = min(100, max(20, score + 40)) # baseline 40
    
    if final_score >= 80:
        final_tier = "Tier 1"
    elif final_score >= 60:
        final_tier = "Tier 2"
    else:
        final_tier = "Tier 3"
        
    summary = f"Evaluated based on provided documents. {', '.join(tier_details)}."
    
    return {
        "credibility_score": final_score,
        "tier": final_tier,
        "summary": summary
    }

@api_v1.post("/properties")
async def create_property_endpoint(data: PropertyRequest):
    property_id = f"prop_{uuid.uuid4().hex[:8]}"
    properties_db[property_id] = data
    return {
        "id": property_id,
        "name": data.name
    }

@api_v1.post("/properties/{property_id}/photos")
async def upload_property_photos_endpoint(
    property_id: str,
    before_photos: List[UploadFile] = File(..., alias="before_photos[]"),
    after_photos: Optional[List[UploadFile]] = File(None, alias="after_photos[]")
):
    for photo in before_photos:
        file_path = os.path.join(UPLOAD_DIR, f"before_{property_id}_{uuid.uuid4()}_{photo.filename}")
        with open(file_path, "wb") as f:
            f.write(await photo.read())
    if after_photos:
        for photo in after_photos:
            file_path = os.path.join(UPLOAD_DIR, f"after_{property_id}_{uuid.uuid4()}_{photo.filename}")
            with open(file_path, "wb") as f:
                f.write(await photo.read())
    return {"status": "success"}

@api_v1.post("/evaluations/property")
async def evaluate_property_endpoint(data: PropertyEvaluationRequest):
    prop = properties_db.get(data.property_id)
    if not prop:
        return {
            "risk_tier": "Unknown",
            "insurance_recommendation": "Unable to evaluate. Property not found.",
            "suggested_premium": 0
        }
        
    try:
        from home_owner.property_evaluation import evaluate_property
        deposit_months = int(prop.security_deposit / prop.monthly_rent) if prop.monthly_rent > 0 else 0
        result = evaluate_property(prop.city, int(prop.monthly_rent), deposit_months)
        
        avg_tier = (result.get("location", 3) + result.get("rent", 3) + result.get("deposit_neededd", 3)) / 3.0
        
        if avg_tier <= 1.5:
            risk = "Low Risk"
            premium = prop.monthly_rent * 0.05
            rec = "Comprehensive Cover recommended."
        elif avg_tier <= 2.5:
            risk = "Moderate Risk"
            premium = prop.monthly_rent * 0.08
            rec = "Standard Cover recommended."
        else:
            risk = "High Risk"
            premium = prop.monthly_rent * 0.12
            rec = "Basic Cover recommended. Higher deposit requested."
            
        return {
            "risk_tier": risk,
            "insurance_recommendation": rec,
            "suggested_premium": int(premium)
        }
    except Exception as e:
        print("Property evaluation failed:", e)
        return {
            "risk_tier": "Evaluation Failed",
            "insurance_recommendation": "Error occurred during evaluation.",
            "suggested_premium": 0
        }

app.include_router(api_v1)

@app.post("/submit")
async def submit_document(data: SubmitRequest = Depends()):
    """
    Endpoint to submit an evaluation request based on document type.
    Saves files locally (if applicable) and queues Celery tasks for tier evaluation.
    """
    task_id = None

    if data.document_type == DocumentType.COLLEGE_NAME:
        if not data.college_name:
            raise HTTPException(
                status_code=400,
                detail="College name string is required when document_type is 'college name'."
            )
        # Queue college evaluation
        task = evaluate_college_task.delay(data.college_name)
        task_id = task.id

    elif data.document_type == DocumentType.BANK_ACCOUNT_STATEMENT:
        if not data.bank_account_statement:
            raise HTTPException(
                status_code=400, 
                detail="Bank account statement PDF is required when document_type is 'bank account statement'."
            )
        if data.bank_account_statement.content_type != "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail="Bank account statement must be a PDF file."
            )
        
        # Save file to disk
        file_extension = ".pdf"
        file_name = f"bank_statement_{uuid.uuid4()}{file_extension}"
        file_path = os.path.abspath(os.path.join(UPLOAD_DIR, file_name))
        
        with open(file_path, "wb") as f:
            content = await data.bank_account_statement.read()
            f.write(content)
        
        # Queue bank account evaluation task
        task = evaluate_bank_statement_task.delay(file_path)
        task_id = task.id
            
    elif data.document_type == DocumentType.OFFER_LETTER:
        if not data.offer_letter:
            raise HTTPException(
                status_code=400, 
                detail="Offer letter PDF is required when document_type is 'offer letter'."
            )
        if data.offer_letter.content_type != "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail="Offer letter must be a PDF file."
            )
        
        # Save file to disk
        file_extension = ".pdf"
        file_name = f"offer_letter_{uuid.uuid4()}{file_extension}"
        file_path = os.path.abspath(os.path.join(UPLOAD_DIR, file_name))
        
        with open(file_path, "wb") as f:
            content = await data.offer_letter.read()
            f.write(content)
            
        # Queue offer letter evaluation task
        task = evaluate_offer_letter_task.delay(file_path)
        task_id = task.id

    return {
        "message": "Submission received and queued for evaluation.",
        "document_type": data.document_type,
        "task_id": task_id
    }

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """
    Get the status and result of a Celery task by ID.
    """
    result = AsyncResult(task_id, app=celery_app)
    response = {
        "task_id": task_id,
        "status": result.status,
    }
    
    if result.ready():
        if result.successful():
            response["result"] = result.result
        else:
            response["error"] = str(result.result)
            
    return response

# ---------------------------------------------------------------------------
# Direct Testing Endpoints
# ---------------------------------------------------------------------------

@app.post("/test/college")
async def test_college(college_name: str = Form(...)):
    """Synchronously test college evaluation."""
    try:
        result = evaluate_college(college_name)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/bank_statement")
async def test_bank_statement(file: UploadFile = File(...)):
    """Synchronously test bank statement evaluation."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Bank account statement must be a PDF file.")
        
    file_extension = ".pdf"
    file_name = f"test_bank_statement_{uuid.uuid4()}{file_extension}"
    file_path = os.path.abspath(os.path.join(UPLOAD_DIR, file_name))
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    try:
        result = evaluate_bank_account(file_path)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/test/offer_letter")
async def test_offer_letter(file: UploadFile = File(...)):
    """Synchronously test offer letter evaluation."""
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Offer letter must be a PDF file.")
        
    file_extension = ".pdf"
    file_name = f"test_offer_letter_{uuid.uuid4()}{file_extension}"
    file_path = os.path.abspath(os.path.join(UPLOAD_DIR, file_name))
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    try:
        result = evaluate_offer_letter_from_pdf(file_path)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/test/property")
async def test_property(
    location: str = Form(..., description="E.g. Mumbai, Bangalore, Meerut"), 
    rent: int = Form(..., description="Monthly rent amount"), 
    deposit: int = Form(..., description="Number of months of deposit needed")
):
    """Synchronously test property evaluation."""
    try:
        result = evaluate_property(location, rent, deposit)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
