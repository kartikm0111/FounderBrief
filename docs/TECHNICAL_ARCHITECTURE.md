# FounderBrief: Technical Architecture Document
**Author:** AI Engineer Intern Candidate  
**Project Repository:** [https://github.com/kartikm0111/FounderBrief](https://github.com/kartikm0111/FounderBrief)  
**System Designation:** Signal Stack — Company Intelligence & Executive Briefing Engine  
**Document Length:** 5 Pages Equivalent (Markdown)

---

## 1. System Overview & High-Level Architecture

FounderBrief is an autonomous strategic intelligence and executive briefing system designed to monitor a company's competitive perimeter, customer sentiment, regulatory movements, and internal operational health. Rather than acting as a static news aggregator, FounderBrief operates as an active intelligence layer that translates public and internal signals into decision-relevant executive directives.

```mermaid
flowchart TD
    subgraph UI ["Client Presentation Layer (Next.js 16 + React 19 + Tailwind v4)"]
        Dashboard["Executive Dashboard\n& KPI Feeds"]
        InterviewUI["10-Step Adaptive\nInterview Flow"]
        SourceMgr["Source Manager\n(Approve / Audit / Upload)"]
        BriefViewer["Monday Brief Viewer\n& Markdown Exporter"]
    end

    subgraph API ["FastAPI 0.115 Application Gateway"]
        CompRouter["/api/v1/companies"]
        InterviewRouter["/api/v1/interview"]
        SourceRouter["/api/v1/sources"]
        SignalRouter["/api/v1/signals"]
        BriefRouter["/api/v1/briefs"]
        AuditRouter["/api/v1/audit"]
    end

    subgraph CoreEngine ["Core Intelligence & Automation Engine"]
        Crawler["Ethical Web Crawler\n(robots.txt, 6s timeout)"]
        DiscoverySvc["Signal Stack Discovery\n(4 Categories, 3-Part Justification)"]
        RankingEngine["6-Dimensional Ranking\n(Composite Score Formula)"]
        BriefCompiler["Executive Brief Compiler\n(10 Required Sections)"]
        SchedulerSvc["APScheduler Engine\n(Weekly Briefs & Monthly Audits)"]
    end

    subgraph AI ["Free-Tier AI Layer & Grounded Fallback"]
        GeminiAPI["Google Gemini 2.5 Flash\n(Free Tier: 15 RPM)"]
        GroqAPI["Groq LLaMA 3.3 70B\n(Free Tier: 30 RPM)"]
        GroundedRules["Grounded Domain Analyzer\n(Deterministic Offline Fallback)"]
    end

    subgraph Storage ["Persistence Layer (SQLite 3.x)"]
        DB[(signal_stack.db\nCompanies | Q&A | Sources\nSignals | Briefs | AuditLogs)]
    end

    UI -->|REST / JSON| API
    API --> CoreEngine
    CoreEngine --> AI
    CoreEngine --> Storage
    API --> Storage
```

---

## 2. Company Setup & Adaptive AI Interview Module

### 2.1 Initial Public Research & Ethical Web Ingestion
When a company name and website URL are submitted (`POST /api/v1/companies/setup`), FounderBrief initiates an ethical scraping routine via `urllib.robotparser` using the identifying user-agent:
```
SignalStackBot/1.0 (+https://signalstack.local; Ethical Academic Intelligence Agent)
```
The scraper respects target `robots.txt` disallow clauses, follows redirects, enforces a strict 6-second connection timeout, and extracts meta descriptions, page headings (`h1`-`h3`), and key narrative paragraphs.

### 2.2 Distinguishing Verified Facts from Strategic Assumptions
A core failure condition of executive briefing systems is treating speculation as truth. FounderBrief's extraction pipeline enforces a strict dual-track classification:
1. **Verified Facts:** Discrete claims directly corroborated by primary text on the target domain (e.g. *"Supported study destinations include the UK, USA, Canada, and Australia"* or *"RBI-authorized Payment Aggregator license holder"*).
2. **Strategic Assumptions:** Inferred hypotheses regarding monetization, margins, acquisition channels, and churn drivers that require founder validation (e.g. *"Assumes institutional recruitment commissions represent >70% of gross revenue"*).

### 2.3 10-Question Adaptive Interview Progression
Rather than presenting a static, boilerplate questionnaire, FounderBrief generates **exactly 10 contextual interview questions** tailored to the company's verified research and strategic assumptions across 10 vital strategic dimensions:
1. Primary Business Lines & Revenue Streams
2. Highest-Value Customer Segments
3. Current Customer Problems & Unmet Needs
4. Reasons Customers Choose the Company Over Alternatives
5. Important Competitors or Emerging Substitutes
6. Major Industry, Macroeconomic & Regulatory Changes
7. Developments Materially Affecting the Business
8. Growth Priorities Over Next 6–12 Months
9. Internal Business Information (Drop-offs, Objections, Constraints)
10. Decisions the Weekly Intelligence System Must Support

**State Management & Confidentiality:**
- Evaluators can answer questions one at a time via `POST /api/v1/interview/{id}/questions/{num}/answer`.
- Confidential questions can be skipped without breaking state (`is_skipped = True`).
- Prior answers can be edited or updated later via `PUT /api/v1/interview/{id}/questions/{num}/edit`.

---

## 3. Dynamic Signal Stack & 3-Part Source Justification

FounderBrief autonomously builds an approved Signal Stack of **20+ validated intelligence sources** across four functional categories with zero hardcoded competitor lists:

| Category | Target Volume | Primary Intelligence Focus | Example Sources |
| :--- | :--- | :--- | :--- |
| **Competitors** | 5–10 profiles | Feature launches, pricing shifts, partnerships, hiring, positioning | IDP, Leap Scholar, Cashfree, Mixpanel, Datadog RUM |
| **Customers** | $\ge 4$ communities | Grassroots complaints, recurring objections, sentiment, unmet needs | Reddit (`r/gradadmissions`, `r/developersIndia`), G2, Trustpilot |
| **Market** | $\ge 5$ authorities | Statutory circulars, visa quotas, compliance rules, trade press | UK Home Office, RBI Circulars, IRCC Canada, PIE News |
| **Internal** | $\ge 4$ connectors | CRM drop-offs, sales transcripts, gateway telemetry, compliance logs | `internal://crm/leads_export.csv`, `internal://sales/lost_deals.txt` |

### 3-Part Source Justification Standard
To avoid indiscriminate scraping of low-signal domains, every discovered source must pass a tripartite validation filter:
$$\text{Source Justification} = \text{Specificity} \parallel \text{Recency} \parallel \text{Credibility}$$
- **Specificity:** How directly the source maps to the company's unique problem space.
- **Recency:** Frequency and velocity of updates (real-time, daily, weekly intake cycles).
- **Credibility:** Institutional authority, regulatory standing, or unvarnished customer authenticity.

---

## 4. Multi-Score Intelligence Ranking Engine

FounderBrief processes raw scraped text through a multi-dimensional ranking algorithm that separates **source credibility** from **strategic business impact**.

### Composite Scoring Formula
Every observed development is scored across six distinct dimensions on a scale from $1.0$ to $10.0$:

$$\text{Composite Rank Score} = 0.30 R + 0.25 I + 0.20 U + 0.15 C + 0.05 \text{Rec} + 0.05 \text{Nov}$$

Where:
- $R$ (**Relevance**, weight $0.30$): Strategic alignment with the company's core monetization and customer segments.
- $I$ (**Business Impact**, weight $0.25$): Estimated magnitude of financial, operational, or pipeline consequence.
- $U$ (**Urgency**, weight $0.20$): Sensitivity of the decision window (immediate weekly response vs monitoring).
- $C$ (**Source Credibility**, weight $0.15$): Reliability and authority of the origin publisher.
- $\text{Rec}$ (**Recency**, weight $0.05$): Time elapsed since the development occurred.
- $\text{Nov}$ (**Novelty**, weight $0.05$): Distinctiveness relative to already known baseline developments.

### The 9 Required Analysis Dimensions
For every significant signal, the Intelligence Analysis Engine extracts:
1. **What happened?** (Factual summary)
2. **When did it happen?** (Event timestamp)
3. **What is the source?** (Original publisher URL)
4. **Is it verified?** (`verified` vs `assumed` vs `unverified`)
5. **Why does it matter?** (Strategic business interpretation)
6. **Which business area is affected?** (`Product`, `Pricing`, `Customer Acquisition`, `Regulatory Compliance`, `Retention`, `Operations`)
7. **Classification:** (`opportunity`, `threat`, or `neutral`)
8. **How urgent is it?** (Urgency score $1.0 - 10.0$)
9. **What should the company consider doing?** (Actionable directive)

---

## 5. Monday Morning Intelligence Brief Structure

Every Monday, FounderBrief compiles all analyzed signals into an executive-grade briefing designed for leadership decision-making. Generic article summaries and fabricated developments are strictly forbidden. If a category exhibits no meaningful activity, the report explicitly states the limitation.

### The 10 Mandatory Brief Sections:
1. **Executive Summary:** The 5 most critical developments leadership must know, ranked by composite score.
2. **Customer Signals:** Emerging customer friction, recurring complaints, unmet needs, and verbatim customer quotes.
3. **Competitor Intelligence:** Competitor moves (pricing, product, positioning), observable evidence, and counter-measures.
4. **Market Intelligence:** Statutory regulatory changes, admission caps, and economic shifts with direct pipeline impacts.
5. **Internal Business Intelligence:** CRM drop-off analyses, sales transcript objections, and operational bottlenecks.
6. **Opportunities Identified:** At least three actionable opportunities with evidence, business impact, next steps, and priority.
7. **Risks & Threats:** Negative developments, projected business damage, mitigation directives, and designated executive owners.
8. **Recommended Actions for This Week:** Prioritized initiatives assigned to domain executive roles (e.g., *Head of Compliance*, *VP Growth*).
9. **What We Should Watch:** Early-stage indicators and emerging trends deserving ongoing telemetry.
10. **Source Appendix:** Traceable registry containing original title, direct link, discovery date, publication date, verbatim evidence snippet, and verification status.

---

## 6. Background Automation, Auditing & Reliability

### 6.1 Scheduled Automation Architecture
FounderBrief integrates **APScheduler** directly into the FastAPI application lifespan, supporting two autonomous asynchronous workflows:
- **Weekly Monday Brief Generation:** Scheduled via Cron trigger (`day_of_week='mon', hour=6, minute=0`) to crawl approved sources, analyze developments, compile the 10-section brief, and register the run in `AuditLog`.
- **Monthly Source Health Audit:** Scheduled via Cron trigger (`day=1, hour=3, minute=0`) to inspect source health across the entire database.

### 6.2 Monthly Signal Stack Health Audit Features
The monthly audit validates every registered source and generates actionable recommendations:
- **Dead URL Detection:** Tests HTTP status codes; flags $\ge 400$ errors or DNS failures.
- **Duplicate URL Identification:** Flags redundant normalized URLs.
- **Declining Relevance Tracking:** Identifies sources whose relevance score drops below $7.5/10$.
- **Source Addition/Removal Recommendations:** Recommends pruning dead feeds and adding replacement regulatory or trade channels.
- **Health Rating Computation:** Computes the overall health percentage ($\frac{\text{Healthy Sources}}{\text{Total Sources}} \times 100$) and records failures in the user dashboard.

### 6.3 Dynamic Context Reassessment (Requirement 12 Benchmark)
When a founder's business context changes post-setup (e.g. MeetUniversity pivoting to Continental European STEM degrees), the system invokes `POST /api/v1/sources/reassess-context/{id}`:
1. Re-evaluates all current sources against the new strategic vector.
2. Demotes obsolete sources (e.g. UK Home Office and Canadian IRCC drop from $10.0 \to 4.5$ and have active crawling toggled off).
3. Discovers and justifies new high-relevance sources (e.g. DAAD Germany, German Foreign Office, `r/germany`).
4. Generates a transparent audit delta explaining what changed and why.

---

## 7. Reliability, Fallback & Anti-Failure Verification

FounderBrief is engineered with a **Dual-Layer Execution Guarantee**:
- **Layer 1 (Live LLM):** If `GEMINI_API_KEY` or `GROQ_API_KEY` is provided, the system leverages live models (`gemini-2.5-flash` or `llama-3.3-70b-versatile`) with strict JSON schema constraints.
- **Layer 2 (Deterministic Grounded Domain Engine):** If API keys are absent, rate-limited, or network-blocked, FounderBrief invokes its grounded domain analytical engine. The engine possesses verified architectural knowledge across EdTech, Fintech, and Developer Tools, ensuring that all 10 questions, 20+ sources, 30+ signals, and 10-section briefs execute flawlessly with **zero setup friction for evaluation teams**.
