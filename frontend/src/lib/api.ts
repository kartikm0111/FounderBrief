const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://founderbrief-z22s.onrender.com/api/v1";

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL.replace("/api/v1", "")}/health`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Backend not responding");
    return await res.json();
  } catch (err: any) {
    return { status: "offline", error: err.message };
  }
}

export async function fetchCompanies() {
  const res = await fetch(`${API_BASE_URL}/companies/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch companies");
  return await res.json();
}
