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
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# Client is instantiated lazily inside evaluate_offer_letter() so that
# importing this module never raises a missing-credentials error.

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are an expert HR analyst and compensation benchmarking specialist.
Your job is to evaluate an offer letter and return a structured JSON object.

You must determine two independent tiers:

### 1. Company Tier
Assess the *hiring company* mentioned in the offer letter:

| Tier | Description | Examples |
|------|-------------|---------|
| 1    | Top-tier, globally recognised companies — MAANG, FAANG, elite consulting/finance firms, Fortune 100 companies | Google, Meta, Apple, Amazon, Netflix, Microsoft, Goldman Sachs, McKinsey, OpenAI, Stripe |
| 2    | Mid-sized, established companies with a recognisable brand, ~100+ employees, revenue roughly $1M–$100M | Well-known regional tech firms, Series B/C startups, established SMEs |
| 3    | Unknown, very small, or early-stage companies with tiny / unverifiable revenue | Unknown startups, sole proprietorships, companies with < 10 employees |

### 2. Salary Tier
Extract the annual CTC (Cost to Company) from the offer letter. Assume figures are in INR (Indian Rupees) unless stated otherwise. Convert to LPA (Lakhs Per Annum) as needed.

| Tier | Annual CTC (LPA) |
|------|-----------------|
| 1    | >= 10 LPA       |
| 2    | >= 4 LPA and < 10 LPA |
| 3    | < 4 LPA         |

### Output Format
Return ONLY a valid JSON object — no markdown, no explanation, no extra text:
{
  "company_tier": <1 | 2 | 3>,
  "salary_tier": <1 | 2 | 3>,
  "company_name": "<extracted company name>",
  "annual_ctc_lpa": <numeric value or null if not found>,
  "reasoning": {
    "company": "<one sentence explaining the company tier decision>",
    "salary": "<one sentence explaining the salary tier decision>"
  }
}
"""

# ---------------------------------------------------------------------------
# User prompt template
# ---------------------------------------------------------------------------
USER_PROMPT_TEMPLATE = """Below is the full text extracted from an offer letter.
Evaluate it and return the JSON as instructed.

--- OFFER LETTER TEXT START ---
{offer_letter_text}
--- OFFER LETTER TEXT END ---
"""


def evaluate_offer_letter(offer_letter_text: str, model: str = "openai/gpt-4o") -> dict:
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
    # ---------------------------------------------------------------------------
    # Lazy client creation — resolved at call-time so import never fails
    # ---------------------------------------------------------------------------
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    user_message = USER_PROMPT_TEMPLATE.format(offer_letter_text=offer_letter_text)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0,  # deterministic output for structured extraction
        response_format={"type": "json_object"},
    )

    raw_content = response.choices[0].message.content.strip()

    try:
        result = json.loads(raw_content)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"LLM returned non-JSON content.\nRaw response:\n{raw_content}"
        ) from e

    return result


def evaluate_offer_letter_from_pdf(pdf_path: str, model: str = "openai/gpt-4o") -> dict:
    """
    Convenience wrapper: extracts text from a PDF using Docling, then evaluates it.

    Args:
        pdf_path: Path to the offer letter PDF.
        model: OpenRouter model string to use for evaluation.

    Returns:
        Same dict as evaluate_offer_letter().
    """
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
