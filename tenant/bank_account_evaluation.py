import json
import os
import base64
import fitz  # PyMuPDF
from dotenv import load_dotenv
from llm import call_llm_json

# Load environment variables from .env file
load_dotenv()

from prompts import BANK_ACCOUNT_SYSTEM_PROMPT

def pdf_to_base64_images(pdf_path: str) -> list[str]:
    """
    Converts a PDF file to a list of base64 encoded images (one per page).
    """
    doc = fitz.open(pdf_path)
    base64_images = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        # Render page to an image (pixmap) with a reasonable resolution
        zoom = 2.0    # zoom factor (2.0 gives roughly 144 DPI)
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        
        # Get image bytes (PNG)
        img_bytes = pix.tobytes("png")
        
        # Convert to base64
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")
        base64_images.append(img_base64)
        
    return base64_images

def evaluate_bank_account(pdf_path: str, model: str = "openai/gpt-4o") -> dict:
    """
    Reads a bank statement PDF as images, feeds them to an LLM, 
    and returns a structured JSON with the financial tiers.
    """
    base64_images = pdf_to_base64_images(pdf_path)
    
    content_list = [{"type": "text", "text": "Please analyze these bank statement pages."}]
    
    for img_b64 in base64_images:
        content_list.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:image/png;base64,{img_b64}"
            }
        })

    messages = [
        {"role": "system", "content": BANK_ACCOUNT_SYSTEM_PROMPT},
        {"role": "user", "content": content_list},
    ]

    return call_llm_json(messages=messages, model=model, temperature=0.0)

if __name__ == "__main__":
    import sys
    
    # Default to the given file if no argument is provided
    pdf_path = "bank_statement_priya_sharma.pdf"
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        
    print(f"Evaluating Bank Statement: {pdf_path}\n")
    
    try:
        result = evaluate_bank_account(pdf_path)
        print("=== Evaluation Result ===")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}")
