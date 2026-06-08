import json
import os
import sys

# Ensure project root is in sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from llm import call_llm_json
from prompts import PROPERTY_LOCATION_SYSTEM_PROMPT, PROPERTY_LOCATION_USER_PROMPT_TEMPLATE
from utils import ensure_env

def evaluate_property(location: str, rent: int, deposit: int) -> dict:
    """
    Evaluates property parameters for a Home Owner and returns tiers.
    
    Location:
    - Tier 1: Major cities (e.g., Mumbai, Bangalore)
    - Tier 2: Mid-sized cities (e.g., Meerut, Ghaziabad)
    - Tier 3: Small towns/villages
    
    Rent:
    - < 15k -> Tier 1
    - 15k - 50k -> Tier 2
    - > 50k -> Tier 3
    
    Deposit Needed:
    - 1 month -> Tier 1
    - 2-3 months -> Tier 2
    - > 3 months -> Tier 3
    
    Returns:
        A dictionary with location, rent, and deposit tiers.
    """
    ensure_env("OPENROUTER_API_KEY")

    # Evaluate Location Tier using LLM
    messages = [
        {"role": "system", "content": PROPERTY_LOCATION_SYSTEM_PROMPT},
        {"role": "user", "content": PROPERTY_LOCATION_USER_PROMPT_TEMPLATE.format(location=location)}
    ]
    
    try:
        llm_response = call_llm_json(messages)
        location_tier = llm_response.get("location_tier", 3)
    except Exception as e:
        # Fallback if LLM fails
        print(f"Error evaluating location tier via LLM: {e}")
        location_tier = 3

    # Evaluate Rent Tier
    if rent < 15000:
        rent_tier = 1
    elif 15000 <= rent <= 50000:
        rent_tier = 2
    else:
        rent_tier = 3

    # Evaluate Deposit Tier
    if deposit <= 1:
        deposit_tier = 1
    elif 2 <= deposit <= 3:
        deposit_tier = 2
    else:
        deposit_tier = 3

    return {
        "location": location_tier,
        "rent": rent_tier,
        "deposit_needed": deposit_tier
    }
