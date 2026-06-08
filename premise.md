# RentShield Platform Premise

**Sign Up → Account Creation**

## 1. Tenant Evaluation
The tenant evaluation process relies on various inputs to generate a credibility score (0-9). The score maps to specific tiers:
- **Tier 1:** (7-9)
- **Tier 2:** (4-6)
- **Tier 3:** (0-3)

### City & College
- **Process:** Inputs (City, College) → LLM scoring
- **Output:** Credibility Score (0-9) mapping to Tier 1, 2, or 3
- **Final Score:** Weighted Avg = `(City Score + College Score) / 2`

### Offer Letter
- **Process:** Offer letter PDF → Docling parser → LLM (text evaluation)
- **Output:** Company Score, Salary Amount Score (0-9)
- Maps to Tiers 1-3 using the standard credibility scale.

### Bank Statement
- **Process:** Bank Statement → AI OCR → Credibility Score
- **Evaluation Criteria:**
  - **Age of Account:** `< 3 months`, `6 months - 2 years`, `> 2 years`
  - **Transaction Frequency:** `< 10`, `10-30`, `> 30`
  - **Total Transaction Volume:** `< 50k`, `50k-100k`, `> 100k`

### Identity Verification
- **Process:** PAN / Aadhar → *didit* verification + Encrypted storage
- **Requirement:** Mandatory

---

## 2. Home Owner Evaluation
Home owner properties are evaluated to determine risk and required premiums.

### Property Details
- **Location:** Tier 1, 2, or 3
- **Rent Amount:**
  - `< 15k`
  - `15k-50k`
  - `> 50k`
- **Deposit Needed:**
  - `1 month`
  - `2-3 months`
  - `> 3 months`
- **Insurance Premium (EMI):** Selected from `{₹999, ₹1999, ₹3999}`

---

## 3. Damage Assessment & Claim Processing
- **Pre-Rental:** "Before" Pictures (At least 3) → CV-based "House Condition Score"
- **Post-Rental:** "After" Pictures (At least 3) → CV-based "House Condition Score"
- **Evaluation:** Calculate Damage Rating using Before & After pictures → (0-9)
- **Claim Calculation:** `Disbursable Amount = Damage Rating × Max Coverage`
