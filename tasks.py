import os
import sys
from celery import Celery
from dotenv import load_dotenv

# Ensure project root is in sys.path for celery workers
project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Load env variables (like OPENROUTER_API_KEY)
load_dotenv()

# Get Redis URL from environment, default to localhost
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

# Initialize Celery application
celery_app = Celery("tasks", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Import evaluation functions dynamically or inside tasks to avoid circular dependencies
# or early loading issues
from tenant.bank_account_evaluation import evaluate_bank_account
from tenant.college_evaluation import evaluate_college
from tenant.offer_letter_evaluation import evaluate_offer_letter_from_pdf

@celery_app.task(name="tasks.evaluate_bank_statement")
def evaluate_bank_statement_task(file_path: str) -> dict:
    """
    Asynchronous task to evaluate a bank statement PDF.
    """
    try:
        if not os.path.exists(file_path):
            return {"status": "failed", "error": f"File not found: {file_path}"}
        
        result = evaluate_bank_account(file_path)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

@celery_app.task(name="tasks.evaluate_offer_letter")
def evaluate_offer_letter_task(file_path: str) -> dict:
    """
    Asynchronous task to evaluate an offer letter PDF.
    """
    try:
        if not os.path.exists(file_path):
            return {"status": "failed", "error": f"File not found: {file_path}"}
        
        result = evaluate_offer_letter_from_pdf(file_path)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "failed", "error": str(e)}

@celery_app.task(name="tasks.evaluate_college")
def evaluate_college_task(college_name: str) -> dict:
    """
    Asynchronous task to evaluate a college tier based on name.
    """
    try:
        result = evaluate_college(college_name)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
