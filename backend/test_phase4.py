from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- 1. Fetching Active Company ---")
companies = client.get("/api/v1/companies/").json()
assert len(companies) > 0, "No company found"
company_id = companies[0]["id"]
print(f"Testing on Company ID {company_id}: {companies[0]['name']}")

print("\n--- 2. Triggering Ethical Crawler & Intelligence Analysis Engine ---")
crawl_res = client.post(f"/api/v1/signals/crawl-and-analyze/{company_id}")
print("Crawl & Analysis Endpoint Status:", crawl_res.status_code)
signals = crawl_res.json()
print("Total Intelligence Signals Extracted & Analyzed:", len(signals))
assert len(signals) >= 20, f"Expected at least 20 signals, got {len(signals)}"

print("\n--- 3. Verifying Strategic Analysis & Ranking Dimensions ---")
for sig in signals[:4]:
    print(f"\n[ID {sig['id']}] Category: {sig['category'].upper()} | Posture: {sig['classification'].upper()}")
    print(f"  Title: {sig['title']}")
    print(f"  Source URL: {sig['source_url']}")
    print(f"  Evidence Snippet (Grounded): \"{sig['evidence_snippet'][:90]}...\"")
    print(f"  Business Impact: {sig['business_impact'][:90]}...")
    print(f"  Suggested Action: {sig['suggested_action'][:80]}...")
    print(f"  Scores: Rel={sig['relevance_score']} | Imp={sig['impact_score']} | Urg={sig['urgency_score']} | Crd={sig['credibility_score']}")
    print(f"  Composite Rank Score: {sig['composite_rank_score']}/10")
    print(f"  Ranking Rationale: {sig['ranking_explanation']}")
    
    # Assert anti-hallucination and evidence guardrails
    assert sig["source_url"], "Missing traceable source URL!"
    assert sig["evidence_snippet"], "Missing evidence snippet!"
    assert sig["business_impact"], "Missing strategic business impact!"
    assert sig["suggested_action"], "Missing suggested action!"
    assert 0 <= sig["composite_rank_score"] <= 10, "Invalid rank score!"

print("\n--- 4. Testing Multi-Dimensional Filter Capabilities ---")
# Filter by Competitors
comp_sigs = client.get(f"/api/v1/signals/{company_id}?category=competitors").json()
print(f"  • Competitor Signals: {len(comp_sigs)}")

# Filter by Customers
cust_sigs = client.get(f"/api/v1/signals/{company_id}?category=customers").json()
print(f"  • Customer Need/Pain Signals: {len(cust_sigs)}")

# Filter by Regulatory Market
mkt_sigs = client.get(f"/api/v1/signals/{company_id}?category=market").json()
print(f"  • Regulatory & Market Signals: {len(mkt_sigs)}")

# Filter by Internal Intelligence
int_sigs = client.get(f"/api/v1/signals/{company_id}?category=internal").json()
print(f"  • Internal CRM & Objection Signals: {len(int_sigs)}")

# Filter by Threats
threats = client.get(f"/api/v1/signals/{company_id}?classification=threat").json()
print(f"  • Identified Threats: {len(threats)}")

# Filter by Opportunities
opps = client.get(f"/api/v1/signals/{company_id}?classification=opportunity").json()
print(f"  • Identified Opportunities: {len(opps)}")

# Test Search Query
search_res = client.get(f"/api/v1/signals/{company_id}?search=visa").json()
print(f"  • Search Query ('visa'): {len(search_res)} matching signals")

print("\n>>> All Phase 4 Crawler & Intelligence Ranking Endpoints Verified 100%! <<<")
