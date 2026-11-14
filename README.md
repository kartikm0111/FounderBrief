# FounderBrief: AI-Powered Company Intelligence & Executive Briefing Engine

<div align="center">

[![Live Application](https://img.shields.io/badge/Live%20Demo-founder--brief.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://founder-brief.vercel.app/)
[![Backend API](https://img.shields.io/badge/API%20Gateway-Render%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://founderbrief-z22s.onrender.com/)
[![Interactive Docs](https://img.shields.io/badge/Swagger%20UI-Interactive%20Docs-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://founderbrief-z22s.onrender.com/docs)
[![GitHub Repository](https://img.shields.io/badge/GitHub-kartikm0111%2FFounderBrief-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/kartikm0111/FounderBrief)

[![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20FastAPI%20%7C%20SQLite%20%7C%20Tailwind%20v4-6366f1.svg?style=flat-square)](https://github.com/kartikm0111/FounderBrief)
[![Compliance](https://img.shields.io/badge/Cost-%240.00%20(100%25%20Free--Tier%20Compliant)-brightgreen.svg?style=flat-square)](docs/COST_STATEMENT.md)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://github.com/kartikm0111/FounderBrief)
[![Tests](https://img.shields.io/badge/Tests-All%20Phases%20Passed%20(100%25)-success.svg?style=flat-square)](backend/test_multi_company.py)

**Autonomous Strategic Intelligence, Perimeter Monitoring & Monday Briefing Engine**  
*Built for the EDXSO AI Engineer Intern Assessment*

</div>

---

## 🌐 Live Deployments & Key Links

| Environment / Asset | Target URL / Path | Status | Description |
| :--- | :--- | :---: | :--- |
| **Production Frontend** | [https://founder-brief.vercel.app/](https://founder-brief.vercel.app/) | ![Live](https://img.shields.io/badge/Status-Online-brightgreen) | Next.js 16 (React 19, Tailwind CSS v4) executive dashboard deployed on Vercel |
| **Backend API Gateway** | [https://founderbrief-z22s.onrender.com](https://founderbrief-z22s.onrender.com) | ![Live](https://img.shields.io/badge/Status-Online-brightgreen) | FastAPI + SQLAlchemy 2.0 backend deployed as a Web Service on Render |
| **Interactive Swagger API** | [https://founderbrief-z22s.onrender.com/docs](https://founderbrief-z22s.onrender.com/docs) | ![Docs](https://img.shields.io/badge/Docs-Swagger%20UI-blue) | OpenAPI / Swagger interactive endpoint documentation and execution playground |
| **GitHub Repository** | [https://github.com/kartikm0111/FounderBrief](https://github.com/kartikm0111/FounderBrief) | ![Repo](https://img.shields.io/badge/Repo-Public-purple) | Complete verified source code, migrations, tests, and documentation |
| **Technical Architecture** | [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) | ![Docs](https://img.shields.io/badge/Pages-%E2%89%A4%205%20Pages-informational) | Comprehensive 5-page architectural specification and design document |
| **Free-Tier Cost Statement** | [docs/COST_STATEMENT.md](docs/COST_STATEMENT.md) | ![Cost](https://img.shields.io/badge/Cost-%240.00-success) | Cost breakdown proving \$0.00 infrastructure and free-tier LLM usage |

---

## 🎯 Executive Summary & Mission

Founders and executives operate in an environment of rapid market shifts, aggressive competitor feature launches, pricing alterations, regulatory volatility, and customer churn. Traditional approaches—monitoring scattered newsletters, social feeds, and manual browser bookmarks—create cognitive overload and noise without connecting raw signals to weekly business decisions.

**FounderBrief** (powered by the *Signal Stack* architecture) solves this by building an autonomous intelligence layer that:
1. Ingests a company name and URL and conducts ethical public reconnaissance (`robots.txt` compliant).
2. Distinguishes verified ground-truth facts from strategic assumptions requiring validation.
3. Conducts an **adaptive 10-question founder interview** with state memory, single-question progression, confidentiality skipping, and answer editing.
4. Dynamically builds an approved **Signal Stack of 20+ validated sources** across Customers, Competitors (5–10 profiles), Market Authorities, and Internal Systems with 3-part justifications (`Specificity | Recency | Credibility`).
5. Crawls approved sources, extracts developments answering **9 strategic dimensions**, and ranks them using a multi-dimensional composite formula ($0.30 R + 0.25 I + 0.20 U + 0.15 C + 0.05 \text{Rec} + 0.05 \text{Nov}$).
6. Generates a structured, decision-oriented **Monday Morning Intelligence Brief** across 10 strictly required executive sections with 100% traceable direct links and zero hallucinations.
7. Executes autonomous background automation via **APScheduler** for weekly Monday brief deliveries and monthly source-health audits.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph UI ["Presentation Layer (Next.js 16 + React 19 + Tailwind v4)"]
        Dashboard["Executive Dashboard\n& KPI Feeds"]
        InterviewFlow["10-Step Adaptive\nInterview Module"]
        SourceManager["Signal Stack Manager\n(Approve / Audit / Ingest)"]
        BriefReader["Monday Brief Reader\n& Markdown Exporter"]
    end

    subgraph API ["FastAPI 0.115 API Gateway (Render Cloud)"]
        CompaniesEP["/api/v1/companies"]
        InterviewEP["/api/v1/interview"]
        SourcesEP["/api/v1/sources"]
        SignalsEP["/api/v1/signals"]
        BriefsEP["/api/v1/briefs"]
        AuditEP["/api/v1/audit"]
    end

    subgraph Engine ["Core Intelligence & Automation Engine"]
        Crawler["Ethical Web Crawler\n(urllib.robotparser, 6s timeout)"]
        Discovery["Signal Stack Builder\n(4 Categories, 3-Part Justification)"]
        Ranker["6-Dimensional Ranking\n(Composite Score Formula)"]
        Compiler["Executive Brief Compiler\n(10 Mandatory Sections)"]
        Scheduler["APScheduler 3.10+\n(Weekly Briefs & Monthly Audits)"]
    end

    subgraph LLM ["Free-Tier AI Layer & Grounded Fallback"]
        Gemini["Google Gemini 2.5 Flash\n(Free Tier: 15 RPM)"]
        Groq["Groq LLaMA 3.3 70B\n(Free Tier: 30 RPM)"]
        Grounded["Grounded Domain Analyzer\n(Deterministic Offline Fallback)"]
    end

    subgraph Storage ["Persistence Layer (SQLite 3.x)"]
        DB[(signal_stack.db\nCompanies | InterviewQA | Sources\nSignals | Briefs | AuditLogs)]
    end

    UI -->|REST / JSON over HTTPS| API
    API --> Engine
    Engine --> LLM
    Engine --> Storage
    API --> Storage
```

---

## 🛡️ Anti-Failure Guardrails & Key Features

| Anti-Failure Requirement | How FounderBrief Solves & Verifies It | Implementation Evidence |
| :--- | :--- | :--- |
| **No Static News Aggregators** | Raw articles are synthesized into strategic business interpretations answering 9 decision dimensions with assigned executive owners. | `backend/app/services/intelligence_engine.py` |
| **No Boilerplate / Identical Questions** | Exactly 10 contextual questions are dynamically synthesized based on the company's verified research and strategic assumptions. | Verified 100% distinct across MeetUniversity, PostHog & Razorpay |
| **No Hard-Coded Competitor Lists** | Competitors (5–10 profiles) are discovered dynamically per company with explicit strategic rationales explaining why monitoring them matters. | Discovered 8 competitors for MeetUniversity, 7 for PostHog, 7 for Razorpay |
| **No Hallucinated Developments** | Every signal requires a verbatim evidence snippet and direct source link. If a category has no news, the report explicitly states the limitation. | 100% of signals backed by primary evidence in Source Appendix |
| **Real Working Crawler & Robots.txt** | Crawler parses `robots.txt` via `urllib.robotparser`, identifies itself as `SignalStackBot/1.0`, enforces 6s timeout, and logs HTTP status. | `backend/app/services/crawler.py` |
| **Dynamic Context Reassessment** | When business context changes post-setup, the system reassesses source relevance, demotes obsolete feeds, and adds new regional sources. | Tested Requirement 12 benchmark: pivoted MeetUniversity to European STEM |
| **Real Automated Scheduler** | In-process APScheduler manages weekly Monday brief cron jobs (`mon 06:00 UTC`) and monthly source health audits (`1st 00:00 UTC`). | `backend/app/services/scheduler.py` |

---

## 📊 Multi-Score Intelligence Ranking Formula

FounderBrief does not treat an AI confidence score as proof of truth. Every development is evaluated across six independent dimensions on a scale from $1.0$ to $10.0$:

$$\text{Composite Rank Score} = 0.30 R + 0.25 I + 0.20 U + 0.15 C + 0.05 \text{Rec} + 0.05 \text{Nov}$$

- **Relevance ($R$, 30%):** Direct alignment with the company's core monetization model and customer segments.
- **Business Impact ($I$, 25%):** Financial, operational, or pipeline consequence scale.
- **Urgency ($U$, 20%):** Decision-window sensitivity (immediate weekly directive vs ongoing monitoring).
- **Source Credibility ($C$, 15%):** Institutional authority of the publisher (government regulatory body vs unverified forum post).
- **Recency ($\text{Rec}$, 5%):** Time elapsed since the development occurred.
- **Novelty ($\text{Nov}$, 5%):** Distinctiveness relative to already known baseline developments.

---

## 📑 The 10 Mandatory Sections of the Monday Brief

Every generated brief strictly adheres to the executive report format:
1. **Executive Summary:** Top 5 developments leadership must know, ranked by composite score.
2. **Customer Signals:** Emerging friction, recurring objections, unmet needs, and verbatim customer quotes.
3. **Competitor Intelligence:** Competitor moves (pricing, feature releases, positioning), evidence, and counter-measures.
4. **Market Intelligence:** Statutory regulatory changes, visa caps, and trade shifts with direct pipeline impacts.
5. **Internal Business Intelligence:** CRM drop-off analyses, sales objections, and operational bottlenecks.
6. **Opportunities Identified:** At least 3 actionable opportunities with evidence, business impact, next steps, and priority.
7. **Risks & Threats:** Negative developments, projected damage, mitigation directives, and responsible owners.
8. **Recommended Actions for This Week:** Prioritized initiatives assigned to domain executive roles (e.g., *Head of Compliance*, *VP Growth*).
9. **What We Should Watch:** Early-stage indicators and emerging trends deserving ongoing telemetry.
10. **Source Appendix & Evidence Ledger:** Traceable table with original source title, direct URL, discovery date, publication date, evidence snippet, and verification status.

---

## 🔬 Multi-Company Benchmark & Stress-Test Evidence

The system was verified across three distinct industries using [backend/test_multi_company.py](backend/test_multi_company.py) (**Exit Code 0**):

| Benchmark Company | Industry / Domain | Discovered Sources | Competitor Profiles | Signals Collected | Exported Executive Brief |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **MeetUniversity** *(Primary)* | Higher Education & Global EdTech | **23 sources** | 8 competitors | **34 signals** | [meetuniversity_monday_brief.md](reports/meetuniversity_monday_brief.md) |
| **PostHog** | Developer Tools & Product Analytics | **21 sources** | 7 competitors | **35 signals** | [posthog_monday_brief.md](reports/posthog_monday_brief.md) |
| **Razorpay** | Fintech & Payments Infrastructure | **21 sources** | 7 competitors | **30 signals** | [razorpay_monday_brief.md](reports/razorpay_monday_brief.md) |
| **Requirement 12 Pivot Test** | European STEM Pivot (MeetUniversity) | **27 sources** *(+4 added)* | 9 competitors | **36 signals** | 3 UK/Canada demoted, 4 EU sources added |

> **Total Collected Intelligence Records:** **99 records** (exceeding the minimum assessment target of 30 records by >3x).

---

## 🛠️ Step-by-Step Implementation Changelog

### Phase 1: Project Setup & Relational Architecture
- Initialized Next.js 16 (React 19, Tailwind CSS v4, Lucide Icons) in `frontend/`.
- Initialized FastAPI 0.115 + SQLAlchemy 2.0 + SQLite in `backend/`.
- Defined and migrated 6 relational tables: `companies`, `interview_qa`, `sources`, `intelligence_signals`, `briefs`, `audit_logs`.
- Verified setup via `test_phase1` SQLite schema query.

### Phase 2: Company Setup & Adaptive AI Interview Module
- Developed `backend/app/services/scraper.py`: ethical scraping respecting `robots.txt` via `urllib.robotparser` (`SignalStackBot/1.0`).
- Implemented `backend/app/services/llm.py`: dual-layer LLM client (Google Gemini Free / Groq Free) + grounded domain analyzer separating verified primary facts from assumptions.
- Built `backend/app/api/endpoints/interview.py`: single-question state machine, confidentiality skipping (`is_skipped = True`), and retrospective answer editing.
- Verified via [backend/test_phase2.py](backend/test_phase2.py) (Exit Code 0).

### Phase 3: Dynamic Signal Stack Discovery Engine
- Created `backend/app/services/source_discovery.py`: autonomous source discovery across Customers, Competitors (5–10 profiles), Market, and Internal.
- Enforced 3-part justification standard (`Specificity | Recency | Credibility`) on every source.
- Built `backend/app/api/endpoints/sources.py`: source approval toggling, custom addition, deletion, and internal file uploads (`/internal/upload/{id}`).
- Verified via [backend/test_phase3.py](backend/test_phase3.py) (Exit Code 0).

### Phase 4: Ethical Web Crawler & Composite Ranking Engine
- Created `backend/app/services/crawler.py`: ethical crawler with 6-second timeout, rate-limiting, and HTTP health tracking.
- Created `backend/app/services/intelligence_engine.py`: answered 9 strategic dimensions, extracted evidence snippets, and computed composite score ($0.30 R + 0.25 I + 0.20 U + 0.15 C + 0.05 \text{Rec} + 0.05 \text{Nov}$).
- Built `backend/app/api/endpoints/signals.py`: multi-parameter filtering (category, posture, keyword search, composite sorting).
- Verified via [backend/test_phase4.py](backend/test_phase4.py) (Exit Code 0).

### Phase 5: Executive Brief Compiler & Background Automation
- Built `backend/app/services/brief_compiler.py`: compiled 10-section brief, assigned domain-tailored executive owners, and formatted traceable Source Appendix.
- Built `backend/app/services/scheduler.py`: integrated APScheduler for weekly Monday runs and monthly source health audits (dead URLs, duplicates, health rating).
- Built `backend/app/api/endpoints/briefs.py` & `audit.py`: brief generation, markdown export, and on-demand monthly audits.
- Verified via [backend/test_phase5.py](backend/test_phase5.py) (Exit Code 0).

### Phase 6: Multi-Company Stress Testing, Documentation & Cloud Deployments
- Created `backend/test_multi_company.py`: stress-tested MeetUniversity, PostHog, and Razorpay, plus Requirement 12 context reassessment (Exit Code 0).
- Exported 3 full markdown briefs to `reports/meetuniversity_monday_brief.md`, `reports/posthog_monday_brief.md`, and `reports/razorpay_monday_brief.md`.
- Authored 5-page [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md).
- Authored [docs/COST_STATEMENT.md](docs/COST_STATEMENT.md) proving \$0.00 free-tier compliance.
- Deployed FastAPI backend to **Render Web Service** over HTTPS (`https://founderbrief-z22s.onrender.com`).
- Deployed Next.js frontend to **Vercel** over HTTPS (`https://founder-brief.vercel.app/`).
- Configured CORS wildcards allowing seamless communication between Vercel and Render.

---

## 🚀 Local Quickstart Guide

### Prerequisites
- Python 3.10, 3.11, or 3.12+
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/kartikm0111/FounderBrief.git
cd FounderBrief
```

### 2. Backend Setup (FastAPI & SQLite)
```powershell
cd backend
python -m venv venv

# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python run.py
```
*Backend runs locally at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).*

### 3. Frontend Setup (Next.js & Tailwind CSS)
In a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs locally at `http://localhost:3000`.*

### 4. Run the Automated Multi-Company Test Suite
```powershell
cd backend
.\venv\Scripts\python.exe test_multi_company.py
```

---

## 🎬 Screen-Recorded Demo Guide (5–10 Minutes)

When recording your submission walkthrough for the evaluation team:

1. **Introduction (1 min):** Open the live dashboard at [https://founder-brief.vercel.app/](https://founder-brief.vercel.app/). Introduce FounderBrief as an active intelligence layer, pointing to the GitHub repo and free-tier compliance.
2. **Company Setup & Research (1.5 min):** Enter `MeetUniversity` (`https://www.meetuniversity.com`). Show the ethical scraper output, highlighting the strict separation between **Verified Facts** and **Strategic Assumptions**.
3. **Adaptive 10-Question Interview (2 min):** Walk through the 10-step interview. Show that questions reference verified facts, demonstrate answering one at a time, skip a confidential question (`is_skipped = True`), and edit a prior answer.
4. **Signal Stack Source Manager (1.5 min):** Navigate to the Source Manager. Highlight the 23 sources across Customers, Competitors (8 profiles), Market, and Internal. Show the **3-part justification** (`Specificity | Recency | Credibility`) and toggle source approvals.
5. **Intelligence Feed & Composite Ranking (1.5 min):** Show the extracted signals. Explain the **Composite Score Formula** ($0.30 R + 0.25 I + 0.20 U + 0.15 C + 0.05 \text{Rec} + 0.05 \text{Nov}$), filter by category, and highlight verbatim evidence snippets.
6. **Monday Morning Intelligence Brief (1.5 min):** Review the 10-section brief. Highlight the Executive Summary, Risks/Threats with assigned executive owners, Opportunities, and the **Source Appendix with clickable links**. Click "Export Markdown".
7. **Automation & Context Reassessment (1 min):** Trigger the Monthly Source Health Audit to show dead URL checks and stack health ratings. Demonstrate changing business context to European STEM and show the automated source demotion and addition.

---

## 💰 Free-Tier Compliance & Cost Statement Summary

FounderBrief was engineered to run with **\$0.00 operating costs**:
- **Inference:** Google Gemini 2.5 Flash Free Tier (15 RPM, 1M TPM, 1,500 RPD) / Groq LLaMA 3.3 70B Free Tier (30 RPM, 6,000 TPM) / Grounded Domain Offline Engine.
- **Web Scraping:** Beautiful Soup 4 + HTTPX + `urllib.robotparser` (zero paid scraping proxies or SERP APIs).
- **Database:** Embedded SQLite 3.x (`signal_stack.db`) (zero cloud database fees).
- **Hosting:** Vercel Hobby Free Tier (Frontend) + Render Free Web Service (Backend).
- *Full cost breakdown and rate-limit disclosures available in [docs/COST_STATEMENT.md](docs/COST_STATEMENT.md).*

---

## 📜 License & Evaluation Compliance

This project is licensed under the MIT License. Developed and submitted for the **EDXSO AI Engineer Intern Assessment**.

- **Live Application:** [https://founder-brief.vercel.app/](https://founder-brief.vercel.app/)
- **Live API Gateway:** [https://founderbrief-z22s.onrender.com](https://founderbrief-z22s.onrender.com)
- **GitHub Repository:** [https://github.com/kartikm0111/FounderBrief](https://github.com/kartikm0111/FounderBrief)
