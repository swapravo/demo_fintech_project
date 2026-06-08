import base64
import os
import sys
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException

# Ensure project root is in sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from llm import call_llm_json
from prompts import HOME_CONDITION_EVALUATION_PROMPT
from utils import ensure_env

router = APIRouter(
    prefix="/home_owner",
    tags=["Home Owner"]
)

def encode_image(file_content: bytes) -> str:
    """Encodes image bytes to base64 string."""
    return base64.b64encode(file_content).decode('utf-8')

def evaluate_property_condition(before_image_bytes: bytes, after_image_bytes: Optional[bytes] = None) -> dict:
    """
    Evaluates property condition using vision LLM.
    If only 'before_image_bytes' is provided, performs Baseline Assessment.
    If 'after_image_bytes' is also provided, performs Damage Comparison.
    """
    ensure_env("OPENROUTER_API_KEY")

    content = [
        {"type": "text", "text": HOME_CONDITION_EVALUATION_PROMPT}
    ]
    
    # Add 'before' image
    before_base64 = encode_image(before_image_bytes)
    content.append({
        "type": "image_url",
        "image_url": {
            "url": f"data:image/jpeg;base64,{before_base64}"
        }
    })
    
    # Add 'after' image if provided
    if after_image_bytes:
        after_base64 = encode_image(after_image_bytes)
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/jpeg;base64,{after_base64}"
            }
        })
        
    messages = [
        {
            "role": "user",
            "content": content
        }
    ]
    
    try:
        # call_llm_json will use config.LLM_MODEL (openai/gpt-4o) which supports vision.
        result = call_llm_json(messages)
        return result
    except Exception as e:
        print(f"Error evaluating condition: {e}")
        raise ValueError(f"Failed to evaluate property condition: {str(e)}")

@router.post("/evaluate_condition")
async def evaluate_condition_endpoint(
    before_image: UploadFile = File(..., description="Before image (JPEG/PNG/etc)"),
    after_image: Optional[UploadFile] = File(None, description="Optional after image (JPEG/PNG/etc)")
):
    """
    FastAPI endpoint to evaluate property damage/condition.
    Requires a 'before_image' and optionally an 'after_image'.
    """
    try:
        before_bytes = await before_image.read()
        after_bytes = await after_image.read() if after_image else None
        
        result = evaluate_property_condition(before_bytes, after_bytes)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
