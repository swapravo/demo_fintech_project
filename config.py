from utils import ensure_env

OPENROUTER_API_KEY = ensure_env("OPENROUTER_API_KEY")
REDIS_URL = ensure_env("REDIS_URL")

LLM_MODEL = "openai/gpt-4o"
