# Codebase Review: Fixes, Bugs, Race Conditions, and Improvements

I have reviewed your backend implementation (specifically `main.py` and evaluation modules). Here is a detailed breakdown of issues found, categorized by severity, along with suggested improvements.

## 🚨 Critical Bugs & Race Conditions

### 1. In-Memory Session Storage & Default Token Data Leak
**Location:** `main.py` (`tenant_sessions`, `properties_db`)
**Issue:** 
- The application uses a global dictionary (`tenant_sessions`) to store session state for multi-step onboarding. This is inherently not thread-safe or scalable. If the app is run with multiple workers (e.g., via Gunicorn) or restarts, the session data is lost.
- **Critical Race Condition / Leak:** In endpoints like `/evaluations/offer-letter`, the token is fetched via `token = request.headers.get("Authorization", "default")`. If the frontend fails to send an `Authorization` header, all unauthenticated users will be grouped under the `"default"` token. This means User A's uploaded bank statement could overwrite User B's statement if both lack a token.
**Fix:**
- Move session and property state to a persistent data store (like Redis for sessions, PostgreSQL/MongoDB for properties).
- Return an HTTP 401 Unauthorized error if the `Authorization` header is missing, instead of falling back to `"default"`.

### 2. Typo in Key Name Causing Logic Bug
**Location:** `backend/home_owner/property_evaluation.py` and `backend/main.py`
**Issue:**
- The function `evaluate_property` returns the dictionary with the key `"deposit_neededd"` (with double 'd').
- In `main.py` (line 259), it consumes this as `result.get("deposit_neededd", 3)`. While this doesn't crash the app (because the typo is consistent), it is a bug waiting to happen if one file is fixed but the other isn't.
**Fix:** Rename `"deposit_neededd"` to `"deposit_needed"` in both files. *(I will apply this fix for you).*

## ⚠️ Performance & Architecture Issues

### 3. Blocking File I/O in Async Endpoints
**Location:** `main.py` (all upload endpoints)
**Issue:** 
- You are using `with open(file_path, "wb") as f:` inside `async def` endpoints. The `open` and `f.write()` functions are synchronous and blocking. In FastAPI, running blocking I/O on the main thread blocks the async event loop, heavily degrading performance under concurrent load.
**Fix:** 
- Either use `aiofiles` to write asynchronously:
  ```python
  import aiofiles
  async with aiofiles.open(file_path, 'wb') as f:
      await f.write(content)
  ```
- Or change the endpoints from `async def` to standard `def` and use `UploadFile.file.read()`, which tells FastAPI to run the endpoint in an external threadpool.

### 4. Redundant Local Imports
**Location:** `main.py` (`evaluate_tenant_endpoint` and `evaluate_property_endpoint`)
**Issue:**
- Functions like `evaluate_college`, `evaluate_offer_letter_from_pdf`, and `evaluate_property` are imported locally inside the endpoint blocks, even though they are already imported at the top of `main.py`. This adds slight overhead and clutters the code.
**Fix:** Remove the redundant imports from within the function bodies. *(I will apply this fix for you).*

### 5. Disk Space Exhaustion (Resource Leak)
**Location:** `main.py`
**Issue:**
- Endpoints like `/evaluations/education`, `/evaluations/offer-letter`, and `/submit` save uploaded files to the `UPLOAD_DIR` using UUIDs. However, these files are never deleted after the evaluation process completes. Over time, this will exhaust server disk space.
**Fix:** 
- Implement a cleanup routine. You can either delete files explicitly at the end of the `/evaluations/tenant` step, or set up a background Celery task/cron job to purge files older than 24 hours from the `uploads/` directory.

## 💡 Best Practices & Improvements

### 6. Error Handling in Evaluations
**Location:** `main.py` (`evaluate_tenant_endpoint`)
**Issue:**
- If an evaluation function throws an exception (e.g., OCR fails, LLM times out), you catch it and print it, but the score silently defaults to Tier 3.
**Improvement:** 
- Add logging instead of print statements (`import logging`).
- Consider alerting the user that a document couldn't be processed, prompting a retry, rather than silently assigning them a poor score.

### 7. File Type Validation
**Location:** `main.py`
**Issue:**
- The endpoints `/submit` and `/test/...` validate `content_type == "application/pdf"`, but the onboarding flow endpoints (`/evaluations/offer-letter`, `/evaluations/bank-statement`) do not validate file types.
**Improvement:** Add validation to ensure users don't upload executable files or unsupported image formats, preventing potential security risks and processing errors.

---

### Actions I am taking right now:
I will automatically apply the fixes for the **typo in `deposit_needed`** and the **redundant local imports** in your codebase. Let me know if you would like me to implement the Redis session store or async file writing as well!
