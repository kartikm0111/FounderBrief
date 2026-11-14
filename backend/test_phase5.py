import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- 1. Fetching Active Company ---")
companies = client.get("/api/v1/companies/").json()
assert len(companies) > 0, "No company found"
company_id = companies[0]["id"]
print(f"Testing Phase 5 on Company ID {company_id}: {companies[0]['name']}")

print("\n--- 2. Generating 10-Section Monday Morning Intelligence Brief ---")
gen_res = client.post(f"/api/v1/briefs/generate/{company_id}")
print("Brief Generation Status:", gen_res.status_code)
brief = gen_res.json()
print("Generated Brief Title:", brief["title"])
print("Generated At:", brief["generated_at"])

# Verify all 10 strictly required sections
sections = [
    ("1. Executive Summary", brief.get("executive_summary")),
    ("2. Customer Signals", brief.get("customer_signals")),
    ("3. Competitor Intelligence", brief.get("competitor_intelligence")),
    ("4. Market Intelligence", brief.get("market_intelligence")),
    ("5. Internal Intelligence", brief.get("internal_intelligence")),
    ("6. Opportunities Identified", brief.get("opportunities_identified")),
    ("7. Risks & Threats", brief.get("risks_and_threats")),
    ("8. Recommended Actions", brief.get("recommended_actions")),
    ("9. What We Should Watch", brief.get("what_we_should_watch")),
    ("10. Source Appendix", brief.get("source_appendix")),
]

print("\n--- 3. Verifying the 10 Required Sections ---")
for name, content in sections:
    assert content and len(content.strip()) > 10, f"Section '{name}' is missing or empty!"
    preview = content.split('\n')[0][:80]
    print(f"  ✓ {name}: {preview}...")

# Check Source Appendix format
appendix = json.loads(brief["source_appendix"])
print(f"\nSource Appendix Entries: {len(appendix)} traceable sources")
assert len(appendix) >= 15, "Expected at least 15 traceable sources in appendix"
for entry in appendix[:2]:
    print(f"  • Source: {entry['source_title'][:40]} | Link: {entry['direct_link']} | Status: {entry['verification_status']}")
    assert "direct_link" in entry, "Missing direct link in source appendix"
    assert "evidence_snippet" in entry, "Missing evidence snippet in source appendix"

# Check Raw Exportable Markdown
assert brief.get("raw_markdown") and len(brief["raw_markdown"]) > 500
print(f"\nRaw Exportable Markdown Length: {len(brief['raw_markdown'])} chars")

print("\n--- 4. Testing Monthly Signal Stack Health Audit ---")
audit_res = client.post(f"/api/v1/audit/trigger-monthly/{company_id}")
print("Audit Execution Status:", audit_res.status_code)
audit = audit_res.json()
print("Audit Summary:", audit["summary"])
details = json.loads(audit["details"])
print(f"  • Checked Sources: {details['checked_sources']}")
print(f"  • Healthy Sources: {details['healthy_sources']}")
print(f"  • Health Percentage: {details['health_percentage']}%")
print(f"  • Recommendations: {len(details['recommendations'])}")
for r in details["recommendations"]:
    print(f"     -> {r}")

print("\n>>> All Phase 5 Brief & Automation Endpoints Verified 100%! <<<")
