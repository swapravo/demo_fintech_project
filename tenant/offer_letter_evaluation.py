"""
offer_letter_evaluation.py

Evaluates an offer letter using an LLM (via OpenRouter) and returns a structured
JSON with company_tier and salary_tier.

Tier Definitions
----------------
Company Tier:
  1 - MAANG-level or equivalent top-tier tech giants (Google, Meta, Apple, Amazon,
      Netflix, Microsoft, Goldman Sachs, McKinsey, etc.)
  2 - Mid-sized, established companies (~100+ employees, revenue up to ~$10M–$100M,
      known brand but not globally elite)
  3 - Unknown / small / early-stage startups with tiny or unverifiable revenue

Salary Tier (annual CTC in LPA — Lakhs Per Annum):
  1 - >= 10 LPA
  2 - >= 4 LPA and < 10 LPA
  3 - < 4 LPA
"""
import json
import os
from llm import call_llm_json
from config import LLM_MODEL
# Client is instantiated lazily inside evaluate_offer_letter() so that
# importing this module never raises a missing-credentials error.

from prompts import OFFER_LETTER_SYSTEM_PROMPT, OFFER_LETTER_USER_PROMPT_TEMPLATE


def evaluate_offer_letter(offer_letter_text: str, model: str = LLM_MODEL) -> dict:
    """
    Evaluate an offer letter and return a dictionary with company_tier and salary_tier.

    Args:
        offer_letter_text: Raw text extracted from the offer letter (e.g., via Docling).
        model: OpenRouter model string to use for evaluation.

    Returns:
        A dict with keys:
          - company_tier (int): 1, 2, or 3
          - salary_tier (int): 1, 2, or 3
          - company_name (str): Extracted company name
          - annual_ctc_lpa (float | None): Extracted annual CTC in LPA
          - reasoning (dict): Brief reasoning for each tier decision

    Raises:
        ValueError: If the LLM response cannot be parsed as valid JSON.
        openai.APIError: On API communication failures.
    """
    user_message = OFFER_LETTER_USER_PROMPT_TEMPLATE.format(offer_letter_text=offer_letter_text)

    messages = [
        {"role": "system", "content": OFFER_LETTER_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    return call_llm_json(messages=messages, model=model, temperature=0.0)


def evaluate_offer_letter_from_pdf(pdf_path: str, model: str = LLM_MODEL) -> dict:
    """
    Convenience wrapper: extracts text from a PDF using Docling, then evaluates it.

    Args:
        pdf_path: Path to the offer letter PDF.
        model: OpenRouter model string to use for evaluation.

    Returns:
        Same dict as evaluate_offer_letter().
    """
    # Ensure project root is in sys.path so 'ai_ocr' can be resolved
    import sys
    import os
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
        
    from ai_ocr import extract_text_from_pdf  # local import to avoid circular deps

    offer_letter_text = extract_text_from_pdf(pdf_path)
    return evaluate_offer_letter(offer_letter_text, model=model)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python offer_letter_evaluation.py <path_to_offer_letter.pdf>")
        print("\nExample:")
        print("  python offer_letter_evaluation.py offer_letter.pdf")
        sys.exit(1)

    pdf_path = sys.argv[1]
    print(f"Evaluating: {pdf_path}\n")

    result = evaluate_offer_letter_from_pdf(pdf_path)

    print("=== Evaluation Result ===")
    print(json.dumps(result, indent=2))
    print()
    print(f"Company Tier : {result.get('company_tier')}")
    print(f"Salary Tier  : {result.get('salary_tier')}")
