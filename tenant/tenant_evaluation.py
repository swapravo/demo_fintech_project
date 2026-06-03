"""
tenant_evaluation.py

Reads every offer letter PDF in the project directory, extracts its text via
Docling (ai_ocr.py), evaluates it with the LLM (offer_letter_evaluation.py),
and prints a neat tier summary for each candidate / tenant.
"""

import glob
import os

from ai_ocr import extract_text_from_pdf
from offer_letter_evaluation import evaluate_offer_letter

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
OFFER_LETTER_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_PATTERN = os.path.join(OFFER_LETTER_DIR, "offer_letter*.pdf")
MODEL = "openai/gpt-4o"

TIER_LABEL = {1: "★★★ Tier 1", 2: "★★☆ Tier 2", 3: "★☆☆ Tier 3"}


def evaluate_all_offer_letters():
    pdf_files = sorted(glob.glob(PDF_PATTERN))

    if not pdf_files:
        print("No offer letter PDFs found matching pattern:", PDF_PATTERN)
        return

    print("=" * 60)
    print(f"  TENANT OFFER LETTER EVALUATION  ({len(pdf_files)} file(s) found)")
    print("=" * 60)

    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        print(f"\n📄  File : {filename}")
        print("-" * 60)

        try:
            # Step 1: Extract text from PDF via Docling
            print("  → Extracting text from PDF...")
            text = extract_text_from_pdf(pdf_path)

            if not text.strip():
                print("  ⚠️  No text could be extracted. Skipping.")
                continue

            # Step 2: Evaluate via LLM
            print("  → Evaluating with LLM...")
            result = evaluate_offer_letter(text, model=MODEL)

            # Step 3: Print results
            company_name = result.get("company_name", "Unknown")
            company_tier = result.get("company_tier")
            salary_tier = result.get("salary_tier")
            ctc_lpa = result.get("annual_ctc_lpa")
            reasoning = result.get("reasoning", {})

            ctc_display = f"{ctc_lpa} LPA" if ctc_lpa is not None else "Not found"

            print(f"  Company      : {company_name}")
            print(f"  Annual CTC   : {ctc_display}")
            print(f"  Company Tier : {TIER_LABEL.get(company_tier, company_tier)}")
            print(f"  Salary Tier  : {TIER_LABEL.get(salary_tier, salary_tier)}")
            if reasoning:
                print(f"  Reasoning    :")
                print(f"    Company → {reasoning.get('company', '')}")
                print(f"    Salary  → {reasoning.get('salary', '')}")

        except Exception as e:
            print(f"  ❌  Error processing {filename}: {e}")

    print("\n" + "=" * 60)
    print("  Evaluation complete.")
    print("=" * 60)


if __name__ == "__main__":
    evaluate_all_offer_letters()
