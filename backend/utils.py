import os
import sys
from dotenv import load_dotenv

# Load .env once upon import
load_dotenv()

def ensure_env(key: str) -> str:
    """
    Reads an environment variable and crashes the program early 
    if it is missing. Returns the variable's value.
    """
    value = os.environ.get(key)
    if value is not None:
        return value
        
    print(f"CRITICAL ERROR: Missing required environment variable: {key}")
    print("Please ensure it is defined in your .env file or environment.")
    sys.exit(1)
