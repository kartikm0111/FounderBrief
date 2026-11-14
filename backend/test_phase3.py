from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- 1. Fetching Active Company ---")
companies = client.get("/api/v1/companies/").json()
assert len(companies) > 0, "No company found"
company_id = companies[0]["id"]
print(f"Testing on Company ID {company_id}: {companies[0]['name']}")

print("\n--- 2. Triggering Autonomous Signal Stack Source Discovery ---")
res = client.post(f"/api/v1/sources/discover/{company_id}")
print("Discovery Endpoint Status:", res.status_code)
sources = res.json()
print("Total Sources Discovered & Configured:", len(sources))
assert len(sources) >= 20, f"Expected at least 20 sources, got {len(sources)}"

# Verify Categories
categories = {}
competitors = []
for s in sources:
    cat = s["category"]
    categories[cat] = categories.get(cat, 0) + 1
    if cat == "competitors":
        competitors.append(s["competitor_name"] or s["name"])
    # Verify 3-part justification format
    reason = s["reason_for_inclusion"]
    assert "Specificity" in reason, f"Missing Specificity in: {s['name']}"
    assert "Recency" in reason, f"Missing Recency in: {s['name']}"
    assert "Credibility" in reason, f"Missing Credibility in: {s['name']}"

print("\n--- 3. Category Distribution ---")
for cat, count in categories.items():
    print(f"  • {cat.upper()}: {count} sources")

assert "customers" in categories, "Missing customers category"
assert "competitors" in categories, "Missing competitors category"
assert "market" in categories, "Missing market category"
assert "internal" in categories, "Missing internal category"

print(f"\n--- 4. Competitor Profiles ({len(competitors)} Total, Requirement: 5-10) ---")
assert 5 <= len(competitors) <= 10, f"Expected 5-10 competitors, got {len(competitors)}"
for comp in competitors:
    print(f"  ⚔️  {comp}")

print("\n--- 5. Testing Source Management Operations ---")
# Toggle Approval
test_src_id = sources[0]["id"]
toggle_res = client.put(f"/api/v1/sources/{test_src_id}/toggle-approval")
print(f"Source ID {test_src_id} Approval Toggled:", toggle_res.status_code, "is_approved =", toggle_res.json()["is_approved"])

# Add Manual Custom Source
custom_res = client.post("/api/v1/sources/", json={
    "company_id": company_id,
    "category": "market",
    "name": "Custom Regulatory Advisory Bulletin",
    "url": "https://education.gov/regulatory-advisory",
    "source_type": "regulatory_portal",
    "reason_for_inclusion": "Specificity: Custom policy tracker. | Recency: Weekly updates. | Credibility: Government agency.",
    "is_approved": True
})
print("Manual Custom Source Created:", custom_res.status_code, custom_res.json()["name"])

# Delete Custom Source
del_res = client.delete(f"/api/v1/sources/{custom_res.json()['id']}")
print("Custom Source Deleted:", del_res.status_code)

print("\n>>> All Phase 3 Backend Logic & Requirements Verified 100%! <<<")
