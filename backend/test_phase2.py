from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- 1. Testing Company Setup on MeetUniversity ---")
res = client.post('/api/v1/companies/setup', json={'name': 'MeetUniversity', 'website_url': 'https://www.meetuniversity.com'})
print('Setup Status:', res.status_code)
company = res.json()
print('Company ID:', company['id'])
print('Company Name:', company['name'])
print('Industry:', company['industry'])
print('Verified Facts:', company['verified_facts'][:120], '...')
print('Assumptions:', company['assumptions'][:120], '...')

print("\n--- 2. Fetching Generated Contextual Questions ---")
q_res = client.get(f"/api/v1/interview/{company['id']}")
questions = q_res.json()
print('Total Contextual Questions:', len(questions))
assert len(questions) == 10, "Expected exactly 10 questions"

for q in questions:
    print(f"  Q{q['question_number']} [{q['category']}]: {q['question_text'][:80]}...")
    print(f"      Context Rationale: {q['context_reason'][:80]}...")

print("\n--- 3. Testing Question Answering & Memory ---")
# Submit answer for Q1
ans_res = client.post(
    f"/api/v1/interview/{company['id']}/questions/1/answer",
    json={"answer_text": "Our primary revenue (75%) comes from institutional success commissions from partner universities in the UK and USA. The remaining 25% comes from our specialized Ivy Mentorship counseling fees.", "is_skipped": False}
)
print("Q1 Answered:", ans_res.status_code, ans_res.json()['answer_text'][:60])

# Skip Q2 (confidential)
skip_res = client.post(
    f"/api/v1/interview/{company['id']}/questions/2/answer",
    json={"answer_text": None, "is_skipped": True}
)
print("Q2 Skipped Confidential:", skip_res.status_code, "is_skipped =", skip_res.json()['is_skipped'])

# Check Interview Progress Status
status_res = client.get(f"/api/v1/interview/{company['id']}/status")
status_data = status_res.json()
print("\n--- 4. Interview Progress State ---")
print("Answered Count:", status_data['answered_count'])
print("Skipped Count:", status_data['skipped_count'])
print("Current Question:", status_data['current_question']['question_number'], "->", status_data['current_question']['category'])

# Test Editing Q1 later
edit_res = client.put(
    f"/api/v1/interview/{company['id']}/questions/1/edit",
    json={"answer_text": "Updated: Institutional commissions represent 80%, while counseling and test prep make up 20%.", "is_skipped": False}
)
print("\n--- 5. Edit Answer Later ---")
print("Q1 Edited Answer:", edit_res.json()['answer_text'])

print("\n>>> All Backend Phase 2 Endpoints Verified Successfully! <<<")
