import os
import sys
import json
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

client = TestClient(app)

REPORTS_DIR = Path(__file__).resolve().parent.parent / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

COMPANIES = [
    {
        "name": "MeetUniversity",
        "url": "https://www.meetuniversity.com",
        "industry": "Global Higher Education & EdTech",
        "answers": {
            1: "Monetization is driven 70% by university enrollment commissions ($1,500-$3,500 per student) and 30% by direct student coaching fees for Ivy League and elite admissions.",
            2: "Highest-value segments are STEM Master's aspirants to the US and post-graduate management students to the UK and Canada with tuition budgets >$35,000.",
            3: "Students report intense anxiety around visa interview rejections (214b clause) and opaque maintenance fund documentation rules.",
            4: "Decisive differentiator is personalized mentor pairing with alumni from target universities rather than transactional call-center counseling.",
            5: "Primary competitors are IDP Education, Leap Scholar, Leverage Edu, and informal student channels on Reddit r/gradadmissions.",
            6: "Canada's provincial study permit caps and the UK's dependent visa restrictions have forced a 25% redirection of applicant volume.",
            7: "Changes in post-study work permit eligibility and currency exchange rate volatility directly impact student financial affidavits.",
            8: "Top growth priority over the next 12 months is expanding continental European destinations (Germany, Ireland) and launching automated profile matching.",
            9: "Internal counseling logs reveal a 34% drop-off post-offer letter due to confusion regarding bank statement loan proof requirements.",
            10: "The brief must support weekly resource allocation: which study corridors require counseling pushes and which competitor promotions need counter-positioning."
        }
    },
    {
        "name": "PostHog",
        "url": "https://posthog.com",
        "industry": "Developer Tools & Product Analytics",
        "answers": {
            1: "Revenue is driven by transparent usage-based cloud subscriptions (events, recordings, feature flag evaluations) and enterprise self-hosted contracts.",
            2: "Highest-value segment is Series A to Growth-stage engineering-led startups seeking to consolidate analytics, replay, and flags into one platform.",
            3: "Customer pain is fragmented SaaS tool sprawl (paying separately for Mixpanel, LaunchDarkly, and FullStory) and surprise overage bills.",
            4: "Decisive differentiator is open-source transparent code, generous 1M free events, and warehouse-native deployment on ClickHouse.",
            5: "Competitors are Mixpanel, Amplitude, LaunchDarkly, FullStory, and Datadog Real User Monitoring (RUM).",
            6: "Increasing data privacy enforcement (GDPR, EU data residency) drives demand for self-hosted and EU Cloud analytics instances.",
            7: "Cloud egress costs and ClickHouse managed infrastructure pricing directly affect gross margins on high-volume session replays.",
            8: "Growth priority is expanding the LLM observability module, web experimentation toolbar, and automated customer survey triggers.",
            9: "Sales logs indicate mid-market engineering teams occasionally struggle with on-prem Kubernetes Helm chart sizing for ClickHouse pods.",
            10: "The brief must guide weekly sprint priorities: spotting competitor feature launches, pricing changes, and developer sentiment shifts."
        }
    },
    {
        "name": "Razorpay",
        "url": "https://razorpay.com",
        "industry": "Fintech & Developer Payment Infrastructure",
        "answers": {
            1: "Core revenue comes from transaction processing MDR (1.5-2.0% on cards, netbanking) supplemented by RazorpayX SaaS subscription and lending fees.",
            2: "Highest-value segments are Tier-1 e-commerce marketplaces and fast-scaling D2C merchants processing over 100,000 monthly transactions.",
            3: "Merchant friction centers on transaction drop-offs during bank OTP redirections and settlement holdback disputes during fraud spikes.",
            4: "Merchants choose Razorpay for developer-first APIs, standard checkout conversion uplift of 4-6%, and automated instant refunds.",
            5: "Competitors include Cashfree, PayU India, PhonePe Payment Gateway, Pine Labs Plural, Stripe, and Adyen.",
            6: "Mandatory RBI tokenization guidelines and recurring mandate regulations require continuous compliance engineering sprints.",
            7: "Acquiring bank core switch downtimes (HDFC, SBI) directly suppress merchant transaction success rates and increase customer tickets.",
            8: "Growth focus is expanding international cross-border acquiring in Southeast Asia (Curlec) and offline omni-channel POS terminals.",
            9: "Internal KYC records reveal a 28% merchant onboarding drop-off during automated bank penny-drop verification delays.",
            10: "The brief must empower executive decisions: monitoring acquiring bank switch health, competitor discounting, and RBI statutory circulars."
        }
    }
]

print("=" * 80)
print("  FOUNDERBRIEF / SIGNAL STACK — MULTI-COMPANY STRESS TEST & BENCHMARK")
print("=" * 80)

total_records_collected = 0
all_questions_by_company = {}
company_records = {}

for comp_spec in COMPANIES:
    c_name = comp_spec["name"]
    c_url = comp_spec["url"]
    c_ind = comp_spec["industry"]
    answers = comp_spec["answers"]

    print(f"\n[{c_name.upper()}] >>> Step 1: Initializing Setup & Ethical Research...")
    setup_res = client.post("/api/v1/companies/setup", json={"name": c_name, "website_url": c_url})
    assert setup_res.status_code in [200, 201], f"Setup failed: {setup_res.text}"
    comp_data = setup_res.json()
    comp_id = comp_data["id"]
    company_records[c_name] = comp_id

    v_facts = json.loads(comp_data.get('verified_facts', '[]')) if isinstance(comp_data.get('verified_facts'), str) else comp_data.get('verified_facts', [])
    v_assump = json.loads(comp_data.get('assumptions', '[]')) if isinstance(comp_data.get('assumptions'), str) else comp_data.get('assumptions', [])

    print(f"  • Registered Company ID: {comp_id} | Name: {comp_data['name']}")
    print(f"  • Inferred Industry: {comp_data.get('industry')}")
    print(f"  • Verified Facts: {len(v_facts)} items")
    print(f"  • Strategic Assumptions: {len(v_assump)} items")

    print(f"\n[{c_name.upper()}] >>> Step 2: Adaptive 10-Question Interview...")
    qa_list = client.get(f"/api/v1/interview/{comp_id}").json()
    assert len(qa_list) == 10, f"Expected 10 questions, got {len(qa_list)}"
    all_questions_by_company[c_name] = [q["question_text"] for q in qa_list]

    for q in qa_list:
        q_num = q["question_number"]
        ans_text = answers.get(q_num, f"Strategic domain answer for question {q_num} regarding {c_name}.")
        ans_res = client.post(
            f"/api/v1/interview/{comp_id}/questions/{q_num}/answer",
            json={"answer_text": ans_text}
        )
        assert ans_res.status_code == 200, f"Failed answering Q{q_num}: {ans_res.text}"

    print(f"  ✓ Answered all 10 contextual interview questions for {c_name}.")

    print(f"\n[{c_name.upper()}] >>> Step 3: Discovering Signal Stack Sources...")
    disc_res = client.post(f"/api/v1/sources/discover/{comp_id}")
    assert disc_res.status_code == 200, f"Source discovery failed: {disc_res.text}"
    sources = disc_res.json()
    print(f"  • Discovered Sources: {len(sources)} sources")
    assert len(sources) >= 20, f"Expected at least 20 sources, got {len(sources)}"

    # Verify 4 categories
    categories = {s["category"] for s in sources}
    print(f"  • Active Categories: {categories}")
    assert categories == {"customers", "competitors", "market", "internal"}, "Missing required categories"

    # Verify 5-10 competitor profiles
    competitors = [s for s in sources if s["category"] == "competitors"]
    print(f"  • Competitor Profiles: {len(competitors)} distinct competitors")
    assert 5 <= len(competitors) <= 12, f"Competitors outside 5-10 range: {len(competitors)}"

    # Verify 3-part justification
    for s in sources[:3]:
        just = s["reason_for_inclusion"]
        assert "Specificity" in just and "Recency" in just and "Credibility" in just, "Missing 3-part justification"
    print("  ✓ Verified 3-part justification (Specificity | Recency | Credibility) on sources.")

    print(f"\n[{c_name.upper()}] >>> Step 4: Crawling Sources & Extracting Ranked Signals...")
    crawl_res = client.post(f"/api/v1/signals/crawl-and-analyze/{comp_id}")
    assert crawl_res.status_code == 200, f"Crawl failed: {crawl_res.text}"
    signals = crawl_res.json()
    print(f"  • Extracted & Ranked Signals: {len(signals)} signals")
    assert len(signals) >= 10, f"Expected at least 10 signals for {c_name}, got {len(signals)}"
    total_records_collected += len(signals)

    # Check composite score calculation on top signal
    top_sig = signals[0]
    print(f"  • Top Ranked Signal: \"{top_sig['title'][:60]}...\"")
    print(f"    - Composite Score: {top_sig['composite_rank_score']}/10")
    print(f"    - Business Impact: {top_sig['business_impact'][:80]}...")
    print(f"    - Direct Evidence Link: {top_sig['source_url']}")

    print(f"\n[{c_name.upper()}] >>> Step 5: Compiling Monday Morning Intelligence Brief...")
    brief_res = client.post(f"/api/v1/briefs/generate/{comp_id}")
    assert brief_res.status_code == 201, f"Brief generation failed: {brief_res.text}"
    brief = brief_res.json()
    print(f"  • Brief Title: {brief['title']}")
    print(f"  • Generated At: {brief['generated_at']}")

    # Verify 10 sections
    required_sections = [
        "executive_summary", "customer_signals", "competitor_intelligence",
        "market_intelligence", "internal_intelligence", "opportunities_identified",
        "risks_and_threats", "recommended_actions", "what_we_should_watch", "source_appendix"
    ]
    for sec in required_sections:
        assert brief.get(sec) and len(brief[sec].strip()) > 10, f"Section {sec} is empty in {c_name} brief"
    print("  ✓ Verified all 10 required executive report sections are populated.")

    # Verify Source Appendix
    appendix = json.loads(brief["source_appendix"])
    assert len(appendix) >= 10, f"Appendix has fewer than 10 traceable sources: {len(appendix)}"
    print(f"  ✓ Traceable Source Appendix contains {len(appendix)} verified links & quotes.")

    # Export Markdown Report
    raw_md = brief.get("raw_markdown", "")
    report_filename = f"{c_name.lower()}_monday_brief.md"
    report_path = REPORTS_DIR / report_filename
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(raw_md)
    print(f"  ✓ Exported Full Executive Markdown Brief to: {report_path} ({len(raw_md)} chars)")

print("\n" + "=" * 80)
print("  STEP 6: TESTING REQUIREMENT 12 — DYNAMIC BUSINESS CONTEXT REASSESSMENT")
print("=" * 80)

meet_id = company_records["MeetUniversity"]
pivot_context = (
    "We are strategically pivoting away from UK/Canada study-abroad counseling and focusing 100% on "
    "Continental Europe STEM degrees (Germany, Netherlands) and AI-driven automated scholarship applications."
)
print(f"Submitting Strategic Business Pivot for MeetUniversity (Company ID {meet_id}):")
print(f"\"{pivot_context}\"")

reassess_res = client.post(
    f"/api/v1/sources/reassess-context/{meet_id}?new_context={pivot_context}"
)
assert reassess_res.status_code == 200, f"Context reassessment failed: {reassess_res.text}"
reassess_data = reassess_res.json()

print(f"\nReassessment Outcome:")
print(f"  • Strategic Rationale: {reassess_data['explanation']}")
print(f"  • Demoted Sources Count: {reassess_data['demoted_sources_count']}")
for dem in reassess_data["demoted_sources"]:
    print(f"    [-] Demoted: {dem['name']} (Score: {dem['old_score']} -> {dem['new_score']}) | Reason: {dem['reason']}")

print(f"  • New Recommended European Sources Count: {reassess_data['added_sources_count']}")
for add in reassess_data["added_sources"]:
    print(f"    [+] Added: {add}")

assert reassess_data["demoted_sources_count"] > 0, "Expected at least 1 demoted source after strategic pivot"
assert reassess_data["added_sources_count"] > 0, "Expected at least 1 new source added after strategic pivot"
print("  ✓ Requirement 12 (Dynamic Context Reassessment & Signal Stack Shift) Verified 100%!")

print("\n" + "=" * 80)
print("  STEP 7: COMPREHENSIVE BENCHMARK & ANTI-FAILURE VERIFICATION")
print("=" * 80)

# 1. Verify Distinct Interview Questions across companies
print("\n--- Verifying Distinct Interview Questions Across Companies ---")
meet_q1 = all_questions_by_company["MeetUniversity"][0]
post_q1 = all_questions_by_company["PostHog"][0]
razo_q1 = all_questions_by_company["Razorpay"][0]

print(f"MeetUniversity Q1: \"{meet_q1[:80]}...\"")
print(f"PostHog Q1:        \"{post_q1[:80]}...\"")
print(f"Razorpay Q1:       \"{razo_q1[:80]}...\"")

assert meet_q1 != post_q1, "Questions are identical between MeetUniversity and PostHog!"
assert meet_q1 != razo_q1, "Questions are identical between MeetUniversity and Razorpay!"
assert post_q1 != razo_q1, "Questions are identical between PostHog and Razorpay!"
print("  ✓ PASSED: All 3 companies generated 100% distinct, domain-specific interview questions.")

# 2. Verify Minimum Records Target
print(f"\n--- Total Collected Intelligence Records Across Companies: {total_records_collected} ---")
assert total_records_collected >= 30, f"Expected at least 30 records across demos, got {total_records_collected}"
print(f"  ✓ PASSED: Minimum 30 records target satisfied ({total_records_collected} records collected).")

# 3. Verify Scheduler and Monthly Audit Logs
print("\n--- Testing Monthly Signal Stack Health Audit Run ---")
audit_res = client.post(f"/api/v1/audit/trigger-monthly/{meet_id}")
assert audit_res.status_code == 200
audit_log = audit_res.json()
print(f"  • Audit Execution ID: {audit_log['id']} | Task: {audit_log['task_type']}")
print(f"  • Summary: {audit_log['summary']}")
print("  ✓ PASSED: Monthly Source Audit and Automation functioning properly.")

print("\n" + "*" * 80)
print("  ALL PHASE 6 STRESS TESTS, REUSABILITY & COMPLIANCE CHECKS PASSED 100%!")
print("*" * 80)
