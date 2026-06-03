import json
import os
from typing import List, Dict, Any
from openai import OpenAI
from config import LLM_MODEL

def call_llm_json(
    messages: List[Dict[str, Any]], 
    model: str = LLM_MODEL, 
    temperature: float = 0.0
) -> dict:
    """
    Centralized function to invoke OpenRouter LLM and return a parsed JSON object.
    
    Args:
        messages: A list of message dictionaries (e.g., {"role": "...", "content": "..."}).
        model: The OpenRouter model string to use.
        temperature: The temperature for the LLM call.
        
    Returns:
        A dictionary parsed from the LLM's JSON response.
        
    Raises:
        ValueError: If the LLM response cannot be parsed as valid JSON.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        response_format={"type": "json_object"},
    )

    raw_content = response.choices[0].message.content.strip()

    try:
        result = json.loads(raw_content)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM returned non-JSON content.\nRaw response:\n{raw_content}") from e

    return result
