import os
import uuid
from fastapi import FastAPI, Depends, HTTPException
from celery.result import AsyncResult
from models import SubmitRequest, DocumentType
from tasks import (
    evaluate_bank_statement_task,
    evaluate_offer_letter_task,
    evaluate_college_task,
    celery_app
)

app = FastAPI(title="Fintech Demo App with Celery")

from home_owner.property_state_evaluation import router as home_owner_router
app.include_router(home_owner_router)
# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

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
