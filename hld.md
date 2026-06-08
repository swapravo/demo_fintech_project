# 1. Executive Summary

* **Project Name**: RentShield Platform
* **Purpose of the system**: A SaaS platform that automates tenant evaluation, property risk assessment, and rental damage claim processing using AI, Computer Vision, and automated document verification.
* **Problem Statement**: Assessing tenant reliability and house damages before and after rentals is typically a manual, subjective, and error-prone process. Landlords need a reliable way to evaluate tenants, require fair deposits/insurance, and process damage claims based on objective evidence.
* **Business Goals**: Streamline rental agreements, reduce landlord risk, provide an objective basis for damage claims, and enable varied insurance premium EMIs for tenants based on evaluation tiers.
* **Key Success Metrics**: Faster tenant evaluation turnaround times, reduced damage dispute rates, high accuracy in AI-based credibility scoring and CV-based house condition assessment.
* **Scope**: 
  * *In-scope*: Tenant evaluation (city/college, offer letter, bank statement, identity), Property evaluation, Damage assessment via "Before/After" pictures.
  * *Out-of-scope*: Direct comprehensive property management, rent payment processing (beyond insurance premiums).

---

# 2. Functional Overview

### User-Facing Features

* **Tenant Registration & Evaluation**: Upload offer letters, bank statements; input city and college details.
* **Identity Verification**: Mandatory PAN/Aadhar verification integration.
* **Property Listing**: Home owners can list properties and assess risk tiers.
* **Insurance Selection**: Premium EMI selection based on evaluated tiers (₹999, ₹1999, ₹3999).
* **Damage Assessment**: Uploading "Before" and "After" house pictures to calculate damage ratings.

### Admin Features

* **System Monitoring**: Tracking document queue and model performance.
* **Verification Audits**: Manual overrides for disputed AI/CV evaluations.
* **User & Claim Management**: Managing escalated claim disputes.

---

# 3. User Personas & Roles

| Role | Description |
| :--- | :--- |
| **Admin** | Manages system configurations, oversees AI model thresholds, resolves disputes. |
| **Home Owner** | Evaluates properties, reviews tenant scores, uploads house pictures, files damage claims. |
| **Tenant** | Registers, uploads required evaluation documents, pays insurance premiums. |

---

# 4. System Context Diagram

```text
 Tenant / Home Owner
          |
      Frontend
          |
     Backend API
          |
-----------------------------------------------------------
|          |           |            |            |        |
DB    Queue/Cache  LLM Service  CV Service  KYC API  Cloud Storage
```

---

# 5. Architecture Overview

```text
Browser / Mobile App
       |
Frontend (Next.js)
       |
API Gateway (FastAPI)
       |
Background Services (Celery Workers)
       |
Database (PostgreSQL) & File Storage (S3)
```

**Includes**:
* **Frontend**: User interface for both landlords and tenants.
* **Backend**: Core API to handle evaluations and routing.
* **Database**: Relational storage for user, property, and evaluation data.
* **Cache/Queue**: Redis for task queuing and async processing.
* **Background Jobs**: Workers for parsing PDFs (Docling), AI OCR, LLM inference, and CV processing.
* **Third-party integrations**: Identity verification APIs (didit), LLM Providers.

---

# 6. Technology Stack

### Frontend
* Next.js
* React
* Tailwind CSS
* TypeScript

### Backend
* Python
* FastAPI
* Celery

### Database & Cache
* PostgreSQL
* Redis

### Infrastructure & Storage
* AWS (S3 for documents/images, EC2/ECS for compute)
* Docker

### AI & Processing
* Docling (PDF Parsing)
* AI OCR
* LLM via OpenAI/Anthropic APIs
* Custom CV models for image comparison

---

# 7. Module Breakdown

### Tenant Evaluation
* **Responsibility**: Parse and score city, college, offer letters, and bank statements.
* **Dependencies**: LLM API, Docling, AI OCR.
* **APIs**: `POST /evaluations/tenant`

### Property Evaluation
* **Responsibility**: Score property location, rent amount, and required deposit to output an insurance premium tier.
* **Dependencies**: LLM API (for location tiering).
* **APIs**: `POST /evaluations/property`

### Damage Assessment
* **Responsibility**: Compute house condition scores using CV models on before/after pictures to calculate claim disbursements.
* **Dependencies**: CV Model Service, Cloud Storage.
* **APIs**: `POST /claims/evaluate`

### Identity Verification
* **Responsibility**: Handle PAN/Aadhar verification and securely store data.
* **Dependencies**: 'didit' API, Encryption service.
* **APIs**: `POST /verify/identity`

---

# 8. Database Design (High Level)

### Major Entities:
```text
User
TenantProfile
Property
EvaluationResult
DamageClaim
Document
```

### Entity Relationships:
```text
User
  |-- TenantProfile
  |-- Property
        |-- DamageClaim
  |-- Document (Bank Statements, Offer Letters, Pictures)
```

---

# 9. Data Flow Diagrams

### Tenant Document Evaluation
```text
Tenant
 -> Frontend
 -> Backend API
 -> Queue (Celery)
 -> Worker (Docling / AI OCR / LLM)
 -> Database
 -> Frontend (Result Polling/Webhook)
```

### Damage Claim Processing
```text
Home Owner
 -> Frontend (Uploads "After" Pictures)
 -> API
 -> Queue
 -> Worker (CV Model compares Before/After)
 -> Damage Rating Calculation
 -> Database
```

---

# 10. API Architecture

* **Type**: RESTful API
* **Auth**: Bearer tokens (JWT)
* **Versioning**: URI Versioning (e.g., `/api/v1/...`)

### Example Endpoints:
```text
POST /api/v1/auth/login
POST /api/v1/evaluations/tenant
POST /api/v1/evaluations/property
POST /api/v1/claims/process
```

---

# 11. Authentication & Authorization

### Authentication
* Email/Password or Phone/OTP
* JWT for session management

### Authorization
* **RBAC (Role-Based Access Control)**: Enforcing strict boundaries between Home Owners, Tenants, and Admins. Home Owners can only access data related to their own properties and active tenant evaluations.

---

# 12. Multi-Tenancy Design

### Tenant Isolation
While not a traditional B2B SaaS, isolation is implemented at the application level (Data filtering layer).
* Shared Database with row-level security or strict application-level scoping based on `user_id`.

```text
User ID (Tenant or Home Owner)
        |
 Data Filtering Layer (FastAPI Dependencies)
        |
 Database Queries
```

---

# 13. Infrastructure Architecture

```text
Cloudflare (DNS / CDN / WAF)
         |
    Load Balancer
         |
    Docker Cluster
         |
-------------------------
| FastAPI Backend Pods  |
| Celery Worker Pods    |
-------------------------
         |
PostgreSQL (RDS) & Redis (ElastiCache) & S3 (Bucket)
```

---

# 14. Scalability Design

| Metric | Expected Initial |
| :--- | :--- |
| Users | 1,000 |
| Properties | 500 |
| Documents/Images per day | 5,000 |

**Scaling considerations**:
* **Asynchronous Processing**: Heavy lifting (PDF parsing, CV, LLM calls) is offloaded to queues, keeping the API fast.
* **Worker Scaling**: Celery workers can be scaled horizontally independently of the API web servers based on queue depth.
* **Storage**: Utilizing S3 for scalable document and image storage.

---

# 15. Performance Requirements

* **API p95 latency**: < 300 ms (for synchronous endpoints)
* **Document Parsing & Evaluation**: < 30 seconds
* **CV Damage Calculation**: < 60 seconds
* **Image Uploads**: Direct to S3 via pre-signed URLs to reduce backend load.

---

# 16. Security Architecture

### Data Security
* **Encryption at rest**: AES-256 for database volumes; highly sensitive KYC data (PAN/Aadhar) encrypted at the application layer.
* **Encryption in transit**: TLS 1.3 across all communication.

### Application Security
* JWT for stateless authentication.
* Rate limiting on evaluation and verification endpoints to prevent abuse.
* File validation and sanitization for PDF and Image uploads.

---

# 17. External Integrations

* **didit API**: 
  * *Purpose*: Identity Verification (PAN/Aadhar)
  * *Failure Impact*: Users cannot complete registration/onboarding.
* **OpenAI / LLM API**:
  * *Purpose*: Text-based evaluation and tier scoring.
  * *Failure Impact*: Tenant evaluation is delayed. Retry queues handle temporary outages.
* **Docling**:
  * *Purpose*: Parsing complex PDF offer letters.
* **AWS S3**:
  * *Purpose*: Storing images and documents securely.

---

# 18. Background Processing Architecture

```text
API Endpoint (FastAPI)
         |
    Redis Queue
         |
---------------------------------
|      Celery Workers           |
|  - AI OCR & Parsing Task      |
|  - LLM Scoring Task           |
|  - CV Damage Assessment Task  |
---------------------------------
         |
    Database Update
```

---

# 19. File Storage Architecture

```text
Frontend (Browser)
       |  (Requests Pre-signed URL)
Backend API
       |  (Returns URL)
Frontend --(Direct Upload)--> AWS S3 Bucket
```
* Private buckets, accessible only via expiring signed URLs.
* Used for: Offer Letters, Bank Statements, House Before/After Pictures.

---

# 20. Logging & Monitoring

* **Logging**: Application logs emitted to stdout, aggregated via CloudWatch or Datadog.
* **Monitoring**: Tracking API latency, error rates, queue depths, and LLM API success rates.
* **Alerting**: Slack/Email alerts for queue build-ups or persistent third-party API failures.

---

# 21. Disaster Recovery & Backup

* **Strategy**: Automated daily snapshots of PostgreSQL database; S3 bucket versioning for documents.
* **RPO (Recovery Point Objective)**: 24 hours.
* **RTO (Recovery Time Objective)**: 2 hours.

---

# 22. Deployment Architecture

```text
GitHub Repository
       |
GitHub Actions (CI/CD)
       |
Docker Build & Push
       |
Deployment to AWS ECS / K8s
```
* **Environments**: Development, Staging, Production.

---

# 23. Assumptions & Constraints

### Assumptions
* Users have access to reasonably clear digital copies of documents and a camera for property pictures.
* The local jurisdiction supports the legality of digital verification and AI-assisted claims.

### Constraints
* Execution costs for LLM and CV model processing per user evaluation.
* File size limits on document and image uploads.

---

# 24. Risks & Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **LLM Hallucinations** | Enforce structured JSON output; implement deterministic fallback rules. |
| **CV Inaccuracies** | Allow manual override and review by admins for edge cases or disputes. |
| **Third-Party API Downtime** | Implement robust retry mechanisms and asynchronous background processing. |
| **Data Privacy Breaches** | Encrypt PII heavily and minimize stored sensitive data. |

---

# 25. Future Architecture Roadmap

* **Phase 1**: Tenant and Property Evaluation MVP (Current).
* **Phase 2**: Damage assessment models and automated claim calculation.
* **Phase 3**: Direct integration with fintech platforms or banks for rental deposit lending.
* **Phase 4**: Advanced fraud detection across multiple tenant profiles.
