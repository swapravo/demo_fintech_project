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
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are an expert academic evaluator and credentials assessment specialist.
Your job is to evaluate a college or university name and return a structured JSON object assessing its tier and credibility.

### Evaluation Rules

1. **Credibility Score (0 to 9)**
   Assign a score from 0 to 9 based on the institution's prestige, ranking, and recognition:
   - **7 to 9**: Elite institutions. Top 200 colleges or schools globally or nationally (e.g., Ivy League, Stanford, MIT, IITs, IIMs, IISc, top national public universities).
   - **4 to 6**: Mid-tier institutions. Solid private universities, established regional state universities, and reputable mid-tier colleges (e.g., VIT, Manipal, Amity, decent state engineering/arts colleges).
   - **0 to 3**: Not well-known or lower-tier institutions. Small local colleges, community colleges with low visibility, unaccredited universities, or newly established unrecognized colleges.

2. **College Tier (1 to 3)**
   Map the Credibility Score to a College Tier as follows:
   - **Tier 1**: If Credibility Score is 7, 8, or 9.
   - **Tier 2**: If Credibility Score is 4, 5, or 6.
   - **Tier 3**: If Credibility Score is 0, 1, 2, or 3.

### Output Format
Return ONLY a valid JSON object — no markdown, no explanation, no extra text:
{
  "college_name": "<identified/canonical college name>",
  "credibility_score": <integer from 0 to 9>,
  "college_tier": <1 | 2 | 3>,
  "reasoning": "<one sentence explaining the credibility score and tier assignment>"
}
"""

# ---------------------------------------------------------------------------
# User prompt template
# ---------------------------------------------------------------------------
USER_PROMPT_TEMPLATE = """Below is the name of a college or university.
Evaluate it and return the JSON as instructed.

College/University Name: {college_name}
"""


def evaluate_college(college_name: str, model: str = "openai/gpt-4o") -> dict:
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
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    user_message = USER_PROMPT_TEMPLATE.format(college_name=college_name)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0,  # deterministic output for classification
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
