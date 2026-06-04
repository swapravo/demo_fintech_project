from enum import Enum
from dataclasses import dataclass
from typing import Optional
from fastapi import Form, File, UploadFile

class DocumentType(str, Enum):
    BANK_ACCOUNT_STATEMENT = "bank account statement"
    OFFER_LETTER = "offer letter"
    COLLEGE_NAME = "college name"

@dataclass
class SubmitRequest:
    document_type: DocumentType = Form(...)
    college_name: Optional[str] = Form(None)
    bank_account_statement: Optional[UploadFile] = File(None, description="PDF file for bank account statement")
    offer_letter: Optional[UploadFile] = File(None, description="PDF file for offer letter")
