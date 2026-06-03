from fastapi import FastAPI, Depends, HTTPException
from models import SubmitRequest, DocumentType

app = FastAPI(title="Fintech Demo App")

@app.post("/submit")
async def submit_document(data: SubmitRequest = Depends()):
    """
    Endpoint to submit a document along with a college name.
    Requires either a bank account statement (PDF) or an offer letter (PDF) based on the document type.
    """
    # Validation logic based on document type
    if data.document_type == DocumentType.BANK_ACCOUNT_STATEMENT:
        if not data.bank_account_statement:
            raise HTTPException(
                status_code=400, 
                detail="Bank account statement PDF is required when document_type is 'bank account statement'."
            )
        # Check if it's a PDF
        content_type = data.bank_account_statement.content_type
        if content_type != "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail="Bank account statement must be a PDF file."
            )
            
    elif data.document_type == DocumentType.OFFER_LETTER:
        if not data.offer_letter:
            raise HTTPException(
                status_code=400, 
                detail="Offer letter PDF is required when document_type is 'offer letter'."
            )
        # Check if it's a PDF
        content_type = data.offer_letter.content_type
        if content_type != "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail="Offer letter must be a PDF file."
            )

    return {
        "message": "Submission successful",
        "document_type": data.document_type,
        "college_name": data.college_name,
        "bank_account_statement_filename": data.bank_account_statement.filename if data.bank_account_statement else None,
        "offer_letter_filename": data.offer_letter.filename if data.offer_letter else None,
    }
