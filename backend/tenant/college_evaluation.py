"""
college_evaluation.py

Evaluates a college or university name using an LLM (via OpenRouter) and returns a structured
JSON indicating the college tier based on a credibility score from 0 to 9.

Tier & Credibility Score Definitions
------------------------------------
Credibility Score: A rating from 0 to 9 based on reputation, ranking, and recognition.

- Tier 1: Credibility Score (7-9)
  Top 200 colleges / schools globally or nationally (e.g., IITs, IIMs, Ivy League, Stanford, IISc).
- Tier 2: Credibility Score (4-6)
  Mid-tier colleges, established private universities, and regional/state universities (e.g., VIT, Manipal, Amity, decent state engineering/arts colleges).
- Tier 3: Credibility Score (0-3)
  Not well-known colleges, small local institutions, or unaccredited/unverifiable colleges.

Output JSON format:
{
  "college_name": "<identified/canonical college name>",
  "credibility_score": <0-9>,
  "college_tier": <1 | 2 | 3>,
  "reasoning": "<one sentence explaining the rating>"
}
"""
import json
import os
import sys
from llm import call_llm_json
from config import LLM_MODEL

from prompts import COLLEGE_SYSTEM_PROMPT, COLLEGE_USER_PROMPT_TEMPLATE


def evaluate_college(college_name: str, model: str = LLM_MODEL) -> dict:
    """
    Evaluate a college name and return a dictionary with college_tier, credibility_score, etc.

    Args:
        college_name: The name of the college to evaluate.
        model: OpenRouter model string to use for evaluation.

    Returns:
        A dict with keys:
          - college_name (str): Canonical/identified name
          - credibility_score (int): Score from 0 to 9
          - college_tier (int): 1, 2, or 3
          - reasoning (str): Explanation for the decision

    Raises:
        ValueError: If the LLM response cannot be parsed as valid JSON.
        openai.APIError: On API communication failures.
    """
    user_message = COLLEGE_USER_PROMPT_TEMPLATE.format(college_name=college_name)

    messages = [
        {"role": "system", "content": COLLEGE_SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    return call_llm_json(messages=messages, model=model, temperature=0.0)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python college_evaluation.py <college_name>")
        print("\nExample:")
        print("  python college_evaluation.py \"Indian Institute of Technology, Delhi\"")
        sys.exit(1)

    college_name = sys.argv[1]
    print(f"Evaluating college: {college_name}\n")

    try:
        result = evaluate_college(college_name)
        print("=== Evaluation Result ===")
        print(json.dumps(result, indent=2))
        print()
        print(f"College Tier : {result.get('college_tier')}")
        print(f"Credibility  : {result.get('credibility_score')}/9")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
