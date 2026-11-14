"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Globe, 
  HelpCircle, 
  CheckCircle2, 
  Edit3, 
  Save, 
  Sparkles, 
  Radio, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  Send, 
  Sliders, 
  Check, 
  FileCheck, 
  Layers, 
  Users, 
  Swords, 
  TrendingUp, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Upload, 
  Filter, 
  Search, 
  Zap, 
  AlertTriangle, 
  Quote, 
  FileText, 
  Download, 
  Copy, 
  Clock, 
  Activity,
  SlidersHorizontal,
  Compass,
  CheckSquare
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  website_url: string;
  industry?: string;
  description?: string;
  verified_facts?: string;
  assumptions?: string;
  initial_research?: string;
  intelligence_profile?: string;
  status: string;
  created_at: string;
}

interface InterviewQA {
  id: number;
  company_id: number;
  question_number: number;
  category: string;
  question_text: string;
  context_reason: string;
  answer_text?: string | null;
  is_skipped: boolean;
  follow_up_notes?: string | null;
}

interface InterviewStatus {
  company_id: number;
  total_questions: number;
  answered_count: number;
  skipped_count: number;
  current_question: InterviewQA | null;
  is_completed: boolean;
}

interface Source {
  id: number;
  company_id: number;
  category: "customers" | "competitors" | "market" | "internal";
  name: string;
  url: string;
  source_type: string;
  reason_for_inclusion: string;
  competitor_name?: string | null;
  is_approved: boolean;
  is_active: boolean;
  health_status: string;
  relevance_score: number;
  created_at: string;
}

interface IntelligenceSignal {
  id: number;
  company_id: number;
  source_id?: number | null;
  title: string;
  summary: string;
  category: "customers" | "competitors" | "market" | "internal";
  competitor_name?: string | null;
  event_date?: string | null;
  discovery_date: string;
  source_url: string;
  evidence_snippet: string;
  verification_status: "verified" | "unverified" | "assumed";
  business_impact: string;
  affected_business_area: string;
  classification: "opportunity" | "threat" | "neutral";
  relevance_score: number;
  impact_score: number;
  urgency_score: number;
  credibility_score: number;
  recency_score: number;
  novelty_score: number;
  composite_rank_score: number;
  ranking_explanation: string;
  suggested_action: string;
  created_at: string;
}

interface ExecutiveBrief {
  id: number;
  company_id: number;
  title: string;
  generated_at: string;
  executive_summary: string;
  customer_signals: string;
  competitor_intelligence: string;
  market_intelligence: string;
  internal_intelligence: string;
  opportunities_identified: string;
  risks_and_threats: string;
  recommended_actions: string;
  what_we_should_watch: string;
  source_appendix: string;
  raw_markdown: string;
  status: string;
}

interface AuditLog {
  id: number;
  task_type: string;
  status: string;
  summary: string;
  details?: string | null;
  executed_at: string;
}

export default function SignalStackApp() {
  const [activeTab, setActiveTab] = useState<"setup" | "interview" | "sources" | "feed" | "brief" | "profile">("setup");
  const [companyName, setCompanyName] = useState("MeetUniversity");
  const [websiteUrl, setWebsiteUrl] = useState("https://www.meetuniversity.com");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [company, setCompany] = useState<Company | null>(null);
  
  // Interview State
  const [questions, setQuestions] = useState<InterviewQA[]>([]);
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editAnswerText, setEditAnswerText] = useState("");

  // Source Manager State
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [discoveringSources, setDiscoveringSources] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceCategory, setNewSourceCategory] = useState<"customers" | "competitors" | "market" | "internal">("customers");
  const [newSourceReason, setNewSourceReason] = useState("");
  const [uploadingInternal, setUploadingInternal] = useState(false);

  // Intelligence Feed State (Phase 4)
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [crawlingSignals, setCrawlingSignals] = useState(false);
  const [feedCategory, setFeedCategory] = useState<string>("all");
  const [feedPosture, setFeedPosture] = useState<string>("all");
  const [feedSort, setFeedSort] = useState<string>("composite_rank_score");
  const [searchQuery, setSearchQuery] = useState("");

  // Monday Brief & Automation State (Phase 5)
  const [latestBrief, setLatestBrief] = useState<ExecutiveBrief | null>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [latestAudit, setLatestAudit] = useState<AuditLog | null>(null);
  const [runningAudit, setRunningAudit] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const API_URL = "http://localhost:8000/api/v1";

  // Check if existing companies exist on load
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch(`${API_URL}/companies/`);
        if (res.ok) {
          const data: Company[] = await res.json();
          if (data.length > 0) {
            setCompany(data[0]);
            loadInterview(data[0].id);
            loadSources(data[0].id);
            loadSignals(data[0].id);
            loadBrief(data[0].id);
            loadAudit(data[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading initial company:", err);
      }
    }
    loadInitial();
  }, []);

  async function loadInterview(companyId: number) {
    try {
      const [qRes, sRes] = await Promise.all([
        fetch(`${API_URL}/interview/${companyId}`),
        fetch(`${API_URL}/interview/${companyId}/status`)
      ]);
      if (qRes.ok && sRes.ok) {
        setQuestions(await qRes.json());
        setInterviewStatus(await sRes.json());
        setCurrentAnswer("");
      }
    } catch (err) {
      console.error("Error loading interview:", err);
    }
  }

  async function loadSources(companyId: number) {
    try {
      const res = await fetch(`${API_URL}/sources/${companyId}`);
      if (res.ok) setSources(await res.json());
    } catch (err) {
      console.error("Error loading sources:", err);
    }
  }

  async function loadSignals(companyId: number) {
    try {
      const res = await fetch(`${API_URL}/signals/${companyId}`);
      if (res.ok) setSignals(await res.json());
    } catch (err) {
      console.error("Error loading signals:", err);
    }
  }

  async function loadBrief(companyId: number) {
    try {
      const res = await fetch(`${API_URL}/briefs/latest/${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setLatestBrief(data);
      }
    } catch (err) {
      console.error("Error loading brief:", err);
    }
  }

  async function loadAudit(companyId: number) {
    try {
      const res = await fetch(`${API_URL}/audit/latest/${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setLatestAudit(data);
      }
    } catch (err) {
      console.error("Error loading audit:", err);
    }
  }

  // Handle Company Setup Trigger
  async function handleSetupCompany(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLoadingStep("Checking robots.txt & scraping website...");

    try {
      setTimeout(() => setLoadingStep("Extracting verified facts vs strategic assumptions..."), 1200);
      setTimeout(() => setLoadingStep("Generating 10 contextual founder interview questions..."), 2500);

      const res = await fetch(`${API_URL}/companies/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, website_url: websiteUrl })
      });

      if (!res.ok) throw new Error("Failed to setup company");
      const newCompany: Company = await res.json();
      setCompany(newCompany);
      await loadInterview(newCompany.id);
      await loadSources(newCompany.id);
      setActiveTab("interview");
    } catch (err: any) {
      alert(`Setup error: ${err.message}. Make sure backend is running on http://localhost:8000`);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  // Handle Submit Answer
  async function handleSubmitAnswer(skip: boolean = false) {
    if (!company || !interviewStatus?.current_question) return;
    setSubmittingAnswer(true);

    try {
      const qNum = interviewStatus.current_question.question_number;
      const res = await fetch(`${API_URL}/interview/${company.id}/questions/${qNum}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer_text: skip ? null : currentAnswer,
          is_skipped: skip
        })
      });

      if (!res.ok) throw new Error("Failed to submit answer");
      
      await loadInterview(company.id);
      setCurrentAnswer("");
    } catch (err: any) {
      alert(`Answer submission failed: ${err.message}`);
    } finally {
      setSubmittingAnswer(false);
    }
  }

  // Handle Edit Answer Later
  async function handleSaveEdit(qNum: number) {
    if (!company) return;
    try {
      const res = await fetch(`${API_URL}/interview/${company.id}/questions/${qNum}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer_text: editAnswerText,
          is_skipped: false
        })
      });

      if (!res.ok) throw new Error("Failed to edit answer");
      setEditingQuestionId(null);
      await loadInterview(company.id);
    } catch (err: any) {
      alert(`Edit failed: ${err.message}`);
    }
  }

  // Handle Discover Sources (Phase 3)
  async function handleDiscoverSources() {
    if (!company) return;
    setDiscoveringSources(true);
    try {
      const res = await fetch(`${API_URL}/sources/discover/${company.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to discover sources");
      const data = await res.json();
      setSources(data);
      setActiveTab("sources");
    } catch (err: any) {
      alert(`Source discovery failed: ${err.message}`);
    } finally {
      setDiscoveringSources(false);
    }
  }

  // Toggle Source Approval
  async function handleToggleApproval(sourceId: number) {
    try {
      const res = await fetch(`${API_URL}/sources/${sourceId}/toggle-approval`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to toggle approval");
      const updated: Source = await res.json();
      setSources(prev => prev.map(s => s.id === sourceId ? updated : s));
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  }

  // Delete Source
  async function handleDeleteSource(sourceId: number) {
    if (!confirm("Are you sure you want to remove this source from the Signal Stack?")) return;
    try {
      const res = await fetch(`${API_URL}/sources/${sourceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete source");
      setSources(prev => prev.filter(s => s.id !== sourceId));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  // Add Custom Source
  async function handleAddCustomSource(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    try {
      const res = await fetch(`${API_URL}/sources/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          name: newSourceName,
          url: newSourceUrl,
          category: newSourceCategory,
          reason_for_inclusion: newSourceReason,
          is_approved: true
        })
      });
      if (!res.ok) throw new Error("Failed to add custom source");
      const created: Source = await res.json();
      setSources(prev => [...prev, created]);
      setShowAddSourceModal(false);
      setNewSourceName("");
      setNewSourceUrl("");
      setNewSourceReason("");
    } catch (err: any) {
      alert(`Error adding source: ${err.message}`);
    }
  }

  // Handle Internal Ingestion Upload
  async function handleInternalUploadSimulated(e: React.ChangeEvent<HTMLInputElement>) {
    if (!company || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingInternal(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", "sales_objections_and_dropoffs");

      const res = await fetch(`${API_URL}/sources/internal/upload/${company.id}`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Failed to upload internal intelligence");
      const uploaded: Source = await res.json();
      setSources(prev => [uploaded, ...prev]);
      alert(`Internal Intelligence file "${file.name}" ingested into Signal Stack!`);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingInternal(false);
    }
  }

  // Handle Run Crawler & Analyze Signals (Phase 4)
  async function handleRunCrawler() {
    if (!company) return;
    setCrawlingSignals(true);
    try {
      const res = await fetch(`${API_URL}/signals/crawl-and-analyze/${company.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to crawl and analyze sources");
      const data = await res.json();
      setSignals(data);
      setActiveTab("feed");
    } catch (err: any) {
      alert(`Crawl & analysis failed: ${err.message}`);
    } finally {
      setCrawlingSignals(false);
    }
  }

  // Handle Generate Monday Brief (Phase 5)
  async function handleGenerateBrief() {
    if (!company) return;
    setGeneratingBrief(true);
    try {
      const res = await fetch(`${API_URL}/briefs/generate/${company.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate Monday Brief");
      const data: ExecutiveBrief = await res.json();
      setLatestBrief(data);
      setActiveTab("brief");
    } catch (err: any) {
      alert(`Brief generation failed: ${err.message}`);
    } finally {
      setGeneratingBrief(false);
    }
  }

  // Handle Trigger Monthly Audit (Phase 5)
  async function handleTriggerAudit() {
    if (!company) return;
    setRunningAudit(true);
    try {
      const res = await fetch(`${API_URL}/audit/trigger-monthly/${company.id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to execute monthly audit");
      const data: AuditLog = await res.json();
      setLatestAudit(data);
      setShowAuditModal(true);
    } catch (err: any) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      setRunningAudit(false);
    }
  }

  // Copy Markdown to Clipboard
  function copyMarkdown() {
    if (!latestBrief?.raw_markdown) return;
    navigator.clipboard.writeText(latestBrief.raw_markdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  }

  // Download Markdown file
  function downloadMarkdown() {
    if (!latestBrief?.raw_markdown) return;
    const blob = new Blob([latestBrief.raw_markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FounderBrief_${company?.name || "Brief"}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Parse JSON helpers safely
  const parsedFacts: string[] = company?.verified_facts ? JSON.parse(company.verified_facts) : [];
  const parsedAssumptions: string[] = company?.assumptions ? JSON.parse(company.assumptions) : [];
  const parsedResearch = company?.initial_research ? JSON.parse(company.initial_research) : null;
  const parsedAppendix: any[] = latestBrief?.source_appendix ? JSON.parse(latestBrief.source_appendix) : [];
  const parsedAuditDetails = latestAudit?.details ? JSON.parse(latestAudit.details) : null;

  const progressPercent = interviewStatus
    ? Math.round(((interviewStatus.answered_count + interviewStatus.skipped_count) / 10) * 100)
    : 0;

  // Filter sources
  const filteredSources = selectedCategory === "all"
    ? sources
    : sources.filter(s => s.category === selectedCategory);

  const competitorSources = sources.filter(s => s.category === "competitors");
  const customerSources = sources.filter(s => s.category === "customers");
  const marketSources = sources.filter(s => s.category === "market");
  const internalSources = sources.filter(s => s.category === "internal");
  const approvedCount = sources.filter(s => s.is_approved).length;

  // Filter & Search Signals
  const filteredSignals = signals.filter(sig => {
    if (feedCategory !== "all" && sig.category !== feedCategory) return false;
    if (feedPosture !== "all" && sig.classification !== feedPosture) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = sig.title.toLowerCase().includes(q) ||
                    sig.evidence_snippet.toLowerCase().includes(q) ||
                    sig.business_impact.toLowerCase().includes(q) ||
                    (sig.competitor_name && sig.competitor_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (feedSort === "recency") return new Date(b.discovery_date).getTime() - new Date(a.discovery_date).getTime();
    if (feedSort === "impact_score") return b.impact_score - a.impact_score;
    if (feedSort === "urgency_score") return b.urgency_score - a.urgency_score;
    return b.composite_rank_score - a.composite_rank_score;
  });

  const threatCount = signals.filter(s => s.classification === "threat").length;
  const oppCount = signals.filter(s => s.classification === "opportunity").length;
  const avgRelevance = signals.length > 0
    ? (signals.reduce((acc, s) => acc + s.relevance_score, 0) / signals.length).toFixed(1)
    : "0.0";

  // Example suggested answers for MeetUniversity
  const sampleAnswers: Record<number, string> = {
    1: "70% of revenue comes from university enrollment commissions (UK & US partner universities), while 30% comes from specialized Ivy League mentorship packages.",
    2: "Undergraduate students targeting Tier-1 UK/US institutions represent our highest LTV due to multi-year counseling and premium package pricing.",
    3: "Visa rejection ambiguity and shifting financial proof requirements in Canada and the UK are currently students' biggest anxiety points.",
    4: "Students choose us over mass aggregators like Leverage Edu because of personalized human counseling and dedicated mentors with Ivy League backgrounds.",
    5: "Primary rivals are IDP and Leap Scholar; indirect competitors include Reddit student forums and decentralized student immigration influencers.",
    6: "Canadian caps on international study permits and UK post-study work visa scrutiny have pushed 35% more applicants to evaluate Germany and Australia.",
    7: "Any alteration in destination country post-study work visa rights or university direct recruitment fee structures will impact unit economics.",
    8: "Our next 6-12 month priority is scaling partner university tie-ups in Continental Europe and launching an AI-assisted visa document validator.",
    9: "Internal bottleneck is turnaround speed on personalized statement of purpose (SOP) reviews during peak September/January intake deadlines.",
    10: "The Monday Brief should help us prioritize which country-specific visa risks to communicate to students and track competitor discount pricing campaigns."
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  FOUNDERBRIEF
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Signal Stack v1.0
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
            <button
              onClick={() => setActiveTab("setup")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "setup"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Setup
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "interview"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Interview ({progressPercent}%)
            </button>
            <button
              onClick={() => setActiveTab("sources")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "sources"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Sources ({sources.length})
            </button>
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "feed"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" /> Feed ({signals.length})
            </button>
            <button
              onClick={() => setActiveTab("brief")}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-semibold ${
                activeTab === "brief"
                  ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-indigo-400 hover:text-indigo-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Monday Brief ⚡
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" /> Profile
            </button>
          </nav>

          {/* GitHub Repo Pill */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
            <a
              href="https://github.com/kartikm0111/FounderBrief"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
            >
              <span>GitHub:</span>
              <span className="font-semibold text-indigo-400">kartikm0111/FounderBrief</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: COMPANY SETUP & INITIAL RESEARCH */}
        {/* ========================================================================= */}
        {activeTab === "setup" && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">
                Phase 1 & 2 · Onboarding
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Company Onboarding & Public Context Scraper
              </h2>
              <p className="text-sm text-slate-400">
                FounderBrief executes an ethical crawl respecting robots.txt, extracts public context, and separates verified facts from strategic assumptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
              <form onSubmit={handleSetupCompany} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-400" /> Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      placeholder="e.g. MeetUniversity"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyan-400" /> Website URL (Full Domain)
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      required
                      placeholder="https://www.meetuniversity.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-500">Quick Test Benchmark:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyName("MeetUniversity");
                      setWebsiteUrl("https://www.meetuniversity.com");
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
                  >
                    🎯 MeetUniversity (Primary Mandate)
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Respects robots.txt & ethical crawling rate limits
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> {loadingStep || "Analyzing Context..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Ingest & Generate Interview <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {company && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {company.name}
                        <span className="text-xs font-normal text-slate-400 font-mono">({company.website_url})</span>
                      </h3>
                      <p className="text-xs text-indigo-400 font-medium mt-0.5">{company.industry}</p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start">
                      Status: {company.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{company.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      Verified Facts (Public Evidence)
                    </div>
                    <ul className="space-y-2 mt-2">
                      {parsedFacts.map((fact, idx) => (
                        <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      Assumptions (To Validate in Interview)
                    </div>
                    <ul className="space-y-2 mt-2">
                      {parsedAssumptions.map((assump, idx) => (
                        <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20">
                          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{assump}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between">
                  <div className="text-xs text-indigo-200">
                    <strong>10 Contextual Questions Ready.</strong> Step into the adaptive founder interview.
                  </div>
                  <button
                    onClick={() => setActiveTab("interview")}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    Start 10-Step Interview <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ADAPTIVE AI INTERVIEW MODULE */}
        {/* ========================================================================= */}
        {activeTab === "interview" && (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-800/40">
                    Phase 2 · Adaptive Interview
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                    Executive Intelligence Interview
                  </h2>
                  <p className="text-xs text-slate-400">
                    Asks 1 question at a time, remembers previous answers, avoids repeats, and allows confidentiality skips and post-edit updates.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-slate-400">Progress: </span>
                    <span className="font-bold text-white">
                      {(interviewStatus?.answered_count || 0) + (interviewStatus?.skipped_count || 0)} / 10
                    </span>
                  </div>
                  <div className="w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {interviewStatus?.is_completed ? (
                  <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-emerald-500/40 text-center space-y-5 shadow-2xl">
                    <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">10-Question Interview Completed!</h3>
                      <p className="text-xs text-slate-300 max-w-md mx-auto">
                        Company intelligence profile synthesized. Discover dynamic sources or dive straight into the Monday Brief.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-4">
                      <button
                        onClick={handleDiscoverSources}
                        disabled={discoveringSources}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                      >
                        {discoveringSources ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Building Signal Stack...
                          </>
                        ) : (
                          <>
                            <Layers className="w-4 h-4" /> Manage Signal Stack ({sources.length}) <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : interviewStatus?.current_question ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                        Question {interviewStatus.current_question.question_number} of 10 · {interviewStatus.current_question.category}
                      </span>
                      <span className="text-xs font-mono text-slate-500">One Question At A Time</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <div className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Context Rationale (Why this question for {company?.name}):
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {interviewStatus.current_question.context_reason}
                      </p>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {interviewStatus.current_question.question_text}
                    </h3>

                    <div className="space-y-3">
                      <label className="text-xs font-medium text-slate-300">Your Response:</label>
                      <textarea
                        rows={4}
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type founder context, strategic details, or figures..."
                        className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                      />

                      {sampleAnswers[interviewStatus.current_question.question_number] && (
                        <div className="text-xs flex items-center gap-2 text-slate-400">
                          <span>Auto-fill Demo Response:</span>
                          <button
                            type="button"
                            onClick={() => setCurrentAnswer(sampleAnswers[interviewStatus.current_question!.question_number])}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] transition-colors"
                          >
                            Use MeetUniversity Test Answer
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(true)}
                        disabled={submittingAnswer}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-500" /> Skip (Confidential Question)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmitAnswer(false)}
                        disabled={submittingAnswer || !currentAnswer.trim()}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-40 transition-all cursor-pointer"
                      >
                        {submittingAnswer ? "Recording..." : (
                          <>
                            <Send className="w-3.5 h-3.5" /> Submit Answer & Continue
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-900 text-center text-slate-400 text-sm">
                    No active question found. Please run Company Setup.
                  </div>
                )}
              </div>

              {/* 10-Step Timeline */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase font-mono flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" /> 10-Step Timeline
                  </h4>
                  <span className="text-[11px] text-slate-400">Click to Edit</span>
                </div>

                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {questions.map((q) => {
                    const isCurrent = interviewStatus?.current_question?.id === q.id;
                    const isAnswered = q.answer_text && !q.is_skipped;
                    const isSkipped = q.is_skipped;
                    const isEditing = editingQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          isCurrent
                            ? "bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-950/50"
                            : isAnswered
                            ? "bg-slate-950/70 border-emerald-500/30"
                            : isSkipped
                            ? "bg-slate-950/70 border-slate-800 opacity-60"
                            : "bg-slate-950/30 border-slate-900 opacity-40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[11px] font-semibold text-slate-300">
                            Q{q.question_number}. {q.category}
                          </span>
                          {isAnswered && (
                            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Answered
                            </span>
                          )}
                          {isSkipped && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              [Skipped]
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] text-cyan-400 font-semibold animate-pulse">
                              Active
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 line-clamp-2">{q.question_text}</p>

                        {isAnswered && !isEditing && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                            <p className="text-slate-300 italic line-clamp-1 pr-2">"{q.answer_text}"</p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestionId(q.id);
                                setEditAnswerText(q.answer_text || "");
                              }}
                              className="text-indigo-400 hover:text-indigo-300 shrink-0 flex items-center gap-1 font-medium"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                          </div>
                        )}

                        {isEditing && (
                          <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
                            <textarea
                              rows={2}
                              value={editAnswerText}
                              onChange={(e) => setEditAnswerText(e.target.value)}
                              className="w-full p-2 text-xs rounded bg-slate-900 border border-indigo-500 text-white focus:outline-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingQuestionId(null)}
                                className="px-2 py-1 text-[10px] text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(q.question_number)}
                                className="px-3 py-1 text-[10px] rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" /> Save Update
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DYNAMIC SIGNAL STACK & SOURCE MANAGER */}
        {/* ========================================================================= */}
        {activeTab === "sources" && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">
                  Phase 3 · Source Manager
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Dynamic Signal Stack & Source Manager
                </h2>
                <p className="text-xs text-slate-400">
                  Autonomously discovered intelligence sources across Customers, Competitors, Market, and Internal. Zero hardcoding.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDiscoverSources}
                  disabled={discoveringSources}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${discoveringSources ? "animate-spin" : ""}`} />
                  {discoveringSources ? "Discovering..." : "Re-Discover Sources"}
                </button>

                <button
                  onClick={() => setShowAddSourceModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Custom Source
                </button>

                <button
                  onClick={handleRunCrawler}
                  disabled={crawlingSignals}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Crawl & Extract Signals
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Total Sources</span>
                <div className="text-xl font-bold text-white mt-1 flex items-baseline gap-2">
                  {sources.length}
                  <span className="text-[11px] text-emerald-400 font-normal">({approvedCount} Approved)</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedCategory("competitors")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCategory === "competitors" ? "bg-red-950/40 border-red-500/60" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <span className="text-xs text-red-400 font-mono flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" /> Competitors
                </span>
                <div className="text-xl font-bold text-white mt-1">{competitorSources.length} Profiles</div>
              </div>

              <div 
                onClick={() => setSelectedCategory("customers")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCategory === "customers" ? "bg-cyan-950/40 border-cyan-500/60" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Customers
                </span>
                <div className="text-xl font-bold text-white mt-1">{customerSources.length} Channels</div>
              </div>

              <div 
                onClick={() => setSelectedCategory("market")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCategory === "market" ? "bg-amber-950/40 border-amber-500/60" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Market/Reg
                </span>
                <div className="text-xl font-bold text-white mt-1">{marketSources.length} Portals</div>
              </div>

              <div 
                onClick={() => setSelectedCategory("internal")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCategory === "internal" ? "bg-emerald-950/40 border-emerald-500/60" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Internal
                </span>
                <div className="text-xl font-bold text-white mt-1">{internalSources.length} Feeds</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
                <span className="text-slate-500 mr-1 flex items-center gap-1 text-[11px]">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {[
                  { id: "all", label: `All (${sources.length})` },
                  { id: "competitors", label: `Competitors (${competitorSources.length})` },
                  { id: "customers", label: `Customers (${customerSources.length})` },
                  { id: "market", label: `Market (${marketSources.length})` },
                  { id: "internal", label: `Internal (${internalSources.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      selectedCategory === tab.id
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-slate-800/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto text-xs">
                <label className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingInternal ? "Ingesting..." : "Upload Internal (CSV/PDF/TXT)"}
                  <input
                    type="file"
                    accept=".csv,.pdf,.txt,.xlsx"
                    onChange={handleInternalUploadSimulated}
                    className="hidden"
                    disabled={uploadingInternal}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSources.map((s) => {
                const reasonParts = s.reason_for_inclusion.split(" | ");
                const specificity = reasonParts.find(p => p.startsWith("Specificity:"))?.replace("Specificity: ", "") || s.reason_for_inclusion;
                const recency = reasonParts.find(p => p.startsWith("Recency:"))?.replace("Recency: ", "");
                const credibility = reasonParts.find(p => p.startsWith("Credibility:"))?.replace("Credibility: ", "");

                return (
                  <div
                    key={s.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      s.is_approved
                        ? "bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-md"
                        : "bg-slate-950/40 border-slate-800/60 opacity-60"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold ${
                            s.category === "competitors"
                              ? "bg-red-950/60 text-red-400 border-red-800/50"
                              : s.category === "customers"
                              ? "bg-cyan-950/60 text-cyan-400 border-cyan-800/50"
                              : s.category === "market"
                              ? "bg-amber-950/60 text-amber-400 border-amber-800/50"
                              : "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                          }`}>
                            {s.category}
                          </span>
                          {s.competitor_name && (
                            <span className="text-[10px] text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded">
                              ⚔️ {s.competitor_name}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleApproval(s.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                            s.is_approved
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.is_approved ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}></span>
                          {s.is_approved ? "Approved" : "Rejected"}
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{s.name}</h4>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono mt-1 break-all"
                        >
                          {s.url} <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      <div className="space-y-1.5 pt-2 text-[11px] text-slate-300">
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70 space-y-1">
                          <p><strong className="text-cyan-400">Specificity:</strong> {specificity}</p>
                          {recency && <p><strong className="text-amber-400">Recency:</strong> {recency}</p>}
                          {credibility && <p><strong className="text-emerald-400">Credibility:</strong> {credibility}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {s.health_status}
                        </span>
                        <span>•</span>
                        <span>Relevance: {s.relevance_score}/10</span>
                      </div>

                      <button
                        onClick={() => handleDeleteSource(s.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Remove Source"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INTELLIGENCE FEED */}
        {/* ========================================================================= */}
        {activeTab === "feed" && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/40">
                  Phase 4 · Intelligence Engine
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Intelligence Feed & Decision Ranking
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time developments crawled from approved sources, ranked by Relevance, Business Impact, Urgency, and Credibility.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunCrawler}
                  disabled={crawlingSignals}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Zap className={`w-4 h-4 ${crawlingSignals ? "animate-spin" : ""}`} />
                  {crawlingSignals ? "Crawling & Analyzing..." : "Run Crawler & Re-Rank"}
                </button>

                <button
                  onClick={handleGenerateBrief}
                  disabled={generatingBrief}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <FileText className="w-4 h-4" /> Compile Monday Brief
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-mono">Signals Collected</span>
                <div className="text-xl font-bold text-white mt-1">{signals.length} Records</div>
              </div>

              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40">
                <span className="text-xs text-red-400 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High Threats
                </span>
                <div className="text-xl font-bold text-red-300 mt-1">{threatCount} Items</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Opportunities
                </span>
                <div className="text-xl font-bold text-emerald-300 mt-1">{oppCount} Items</div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40">
                <span className="text-xs text-indigo-400 font-mono flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Avg Relevance
                </span>
                <div className="text-xl font-bold text-indigo-300 mt-1">{avgRelevance} / 10</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords, evidence quotes, visa, competitor..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
                  <span className="text-slate-400 whitespace-nowrap flex items-center gap-1 text-[11px]">
                    <SlidersHorizontal className="w-3 h-3" /> Sort:
                  </span>
                  <select
                    value={feedSort}
                    onChange={(e) => setFeedSort(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="composite_rank_score">Composite Rank (Default)</option>
                    <option value="impact_score">Highest Business Impact</option>
                    <option value="urgency_score">Most Urgent</option>
                    <option value="recency">Most Recent Discovery</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-slate-500 text-[11px] mr-1">Category:</span>
                  {[
                    { id: "all", label: "All" },
                    { id: "competitors", label: "Competitors" },
                    { id: "customers", label: "Customers" },
                    { id: "market", label: "Market/Reg" },
                    { id: "internal", label: "Internal" }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setFeedCategory(c.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                        feedCategory === c.id
                          ? "bg-amber-600 text-white font-medium"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-500 text-[11px] mr-1">Posture:</span>
                  {[
                    { id: "all", label: "All" },
                    { id: "threat", label: "Threats" },
                    { id: "opportunity", label: "Opportunities" },
                    { id: "neutral", label: "Neutral" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFeedPosture(p.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                        feedPosture === p.id
                          ? "bg-indigo-600 text-white font-medium"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {filteredSignals.map((sig) => (
                <div
                  key={sig.id}
                  className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 shadow-xl space-y-5 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold ${
                        sig.category === "competitors"
                          ? "bg-red-950/60 text-red-400 border-red-800/50"
                          : sig.category === "customers"
                          ? "bg-cyan-950/60 text-cyan-400 border-cyan-800/50"
                          : sig.category === "market"
                          ? "bg-amber-950/60 text-amber-400 border-amber-800/50"
                          : "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                      }`}>
                        {sig.category}
                      </span>

                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${
                        sig.classification === "threat"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : sig.classification === "opportunity"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}>
                        {sig.classification === "threat" && <AlertTriangle className="w-3 h-3" />}
                        {sig.classification === "opportunity" && <Sparkles className="w-3 h-3" />}
                        {sig.classification}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Unit: {sig.affected_business_area}
                      </span>

                      {sig.competitor_name && (
                        <span className="text-[10px] text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded">
                          ⚔️ {sig.competitor_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] font-mono text-slate-400">Composite Rank:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs shadow-sm">
                        ★ {sig.composite_rank_score.toFixed(2)} / 10
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {sig.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {sig.verification_status.toUpperCase()}
                      </span>
                      <span>•</span>
                      <a
                        href={sig.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono text-[11px] truncate max-w-sm"
                      >
                        {sig.source_url} <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Quote className="w-3 h-3 text-cyan-400" />
                      <span>Grounded Observational Evidence (Source Quote):</span>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{sig.evidence_snippet}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                      <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-indigo-400" /> Strategic Impact (Why It Matters):
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sig.business_impact}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-400" /> Recommended Action:
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {sig.suggested_action}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-slate-300">
                        Relevance: <strong className="text-cyan-400">{sig.relevance_score}/10</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">
                        Impact: <strong className="text-amber-400">{sig.impact_score}/10</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">
                        Urgency: <strong className="text-red-400">{sig.urgency_score}/10</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">
                        Credibility: <strong className="text-emerald-400">{sig.credibility_score}/10</strong>
                      </span>
                    </div>

                    <div className="text-slate-500 italic truncate max-w-xs">
                      {sig.ranking_explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MONDAY MORNING EXECUTIVE BRIEF (PHASE 5) */}
        {/* ========================================================================= */}
        {activeTab === "brief" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
            {/* Header & Delivery Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
                  Phase 5 · Executive Intelligence Brief
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {latestBrief?.title || "Monday Morning Intelligence Brief"}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Traceable Evidence Led
                  </span>
                  <span>•</span>
                  <span>Autonomous APScheduler Delivery</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTriggerAudit}
                  disabled={runningAudit}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Activity className={`w-3.5 h-3.5 text-cyan-400 ${runningAudit ? "animate-spin" : ""}`} />
                  {runningAudit ? "Auditing Stack..." : "Monthly Source Audit"}
                </button>

                <button
                  onClick={copyMarkdown}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedMarkdown ? "Copied!" : "Copy Markdown"}
                </button>

                <button
                  onClick={downloadMarkdown}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download (.md)
                </button>

                <button
                  onClick={handleGenerateBrief}
                  disabled={generatingBrief}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingBrief ? "animate-spin" : ""}`} />
                  {generatingBrief ? "Compiling..." : "Re-Generate Brief"}
                </button>
              </div>
            </div>

            {/* If Brief Not Yet Generated */}
            {!latestBrief ? (
              <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Brief Compiled Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Click below to compile all analyzed signals into the structured 10-section Monday Morning Intelligence Brief.
                </p>
                <button
                  onClick={handleGenerateBrief}
                  disabled={generatingBrief}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Compile Monday Brief Now
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 1. EXECUTIVE SUMMARY */}
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-indigo-400 font-mono">01.</span> Executive Summary
                    </h3>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      Top 5 Priority Developments
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans space-y-3">
                    {latestBrief.executive_summary}
                  </div>
                </div>

                {/* 2 & 3. CUSTOMER SIGNALS & COMPETITOR INTEL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section 2 */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                      <span className="text-cyan-400 font-mono">02.</span> Customer Signals & Unmet Needs
                    </h3>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {latestBrief.customer_signals}
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                      <span className="text-red-400 font-mono">03.</span> Competitor Intelligence
                    </h3>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {latestBrief.competitor_intelligence}
                    </div>
                  </div>
                </div>

                {/* 4 & 5. MARKET INTEL & INTERNAL INTEL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section 4 */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                      <span className="text-amber-400 font-mono">04.</span> Market & Regulatory Intelligence
                    </h3>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {latestBrief.market_intelligence}
                    </div>
                  </div>

                  {/* Section 5 */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                      <span className="text-emerald-400 font-mono">05.</span> Internal Business Realities (CRM/Drop-offs)
                    </h3>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {latestBrief.internal_intelligence}
                    </div>
                  </div>
                </div>

                {/* 6 & 7. OPPORTUNITIES & RISKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section 6 */}
                  <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                      <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono">06.</span> Opportunities Identified
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-400">At Least 3 Actionable</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {latestBrief.opportunities_identified}
                    </div>
                  </div>

                  {/* Section 7 */}
                  <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                      <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="font-mono">07.</span> Risks & Threats
                      </h3>
                      <span className="text-[10px] font-mono text-red-400">Critical Negative Developments</span>
                    </div>
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {latestBrief.risks_and_threats}
                    </div>
                  </div>
                </div>

                {/* 8. RECOMMENDED ACTIONS FOR THIS WEEK */}
                <div className="p-6 sm:p-8 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                      <span className="text-indigo-400 font-mono">08.</span> Recommended Actions for This Week
                    </h3>
                    <span className="text-[11px] font-mono text-indigo-300 bg-indigo-900/50 px-2.5 py-0.5 rounded">
                      Prioritized Directives with Suggested Owners
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                    {latestBrief.recommended_actions}
                  </div>
                </div>

                {/* 9. WHAT WE SHOULD WATCH */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-mono">09.</span> What We Should Watch
                  </h3>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {latestBrief.what_we_should_watch}
                  </div>
                </div>

                {/* 10. SOURCE APPENDIX (GROUNDED EVIDENCE LEDGER) */}
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span className="text-cyan-400 font-mono">10.</span> Source Appendix & Traceable Evidence Ledger
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Every single reported development verified with direct links, discovery dates, and evidence quotes.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 self-start">
                      {parsedAppendix.length} Traceable Sources
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-96 pr-1">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Source Name / Direct URL</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Observational Quote</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {parsedAppendix.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3 font-semibold uppercase text-cyan-400 text-[10px]">
                              {item.category}
                            </td>
                            <td className="py-2.5 px-3 max-w-xs">
                              <div className="font-sans font-medium text-slate-200 truncate">{item.source_title}</div>
                              <a
                                href={item.direct_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-1 truncate"
                              >
                                {item.direct_link} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                              {item.discovery_date?.slice(0, 10)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                                {item.verification_status?.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 italic font-sans text-[11px] max-w-sm truncate">
                              "{item.evidence_snippet}"
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: STRUCTURED COMPANY INTELLIGENCE PROFILE */}
        {/* ========================================================================= */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">
                Phase 2, 3, 4 & 5 · Unified Knowledge
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Synthesized Company Intelligence Profile
              </h2>
              <p className="text-xs text-slate-400">
                Unified knowledge base compiled from verified public research, the 10-step founder interview, and active signal sources.
              </p>
            </div>

            {company && (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-2xl space-y-6">
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{company.name}</h3>
                    <p className="text-xs text-indigo-400 font-mono mt-0.5">{company.industry}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
                    Profile: {company.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Core Value Proposition</h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {parsedResearch?.value_proposition || company.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Target Segments</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(parsedResearch?.customer_segments || []).map((seg: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                          {seg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">Core Offerings</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(parsedResearch?.products_and_services || []).map((prod: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">
                    Captured Strategic Signals ({questions.filter(q => q.answer_text).length} of 10 Dimensions)
                  </h4>
                  <div className="space-y-2">
                    {questions.map((q) => (
                      <div key={q.id} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/70 text-xs flex flex-col gap-1">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="font-semibold text-slate-300">Q{q.question_number}. {q.category}</span>
                          {q.is_skipped ? (
                            <span className="text-[10px] text-slate-500">[Skipped for Confidentiality]</span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-mono">Verified</span>
                          )}
                        </div>
                        {q.answer_text ? (
                          <p className="text-slate-200 italic mt-1 bg-slate-900/50 p-2 rounded">
                            "{q.answer_text}"
                          </p>
                        ) : !q.is_skipped ? (
                          <p className="text-slate-500 italic mt-0.5">Pending answer in interview</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Monthly Signal Stack Health Audit */}
      {showAuditModal && latestAudit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" /> Monthly Signal Stack Health Audit
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="font-semibold text-white">Audit Summary:</span>
                <p className="text-slate-300 mt-1">{latestAudit.summary}</p>
              </div>

              {parsedAuditDetails && (
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 text-[11px]">Audited Sources:</span>
                    <div className="text-base font-bold text-white mt-0.5">{parsedAuditDetails.checked_sources}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-emerald-400 text-[11px]">Healthy & Active:</span>
                    <div className="text-base font-bold text-emerald-300 mt-0.5">{parsedAuditDetails.healthy_sources}</div>
                  </div>
                </div>
              )}

              {parsedAuditDetails?.recommendations && (
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300">Strategic Recommendations:</span>
                  <ul className="space-y-1.5">
                    {parsedAuditDetails.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="p-2 rounded bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 flex items-start gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Source */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Add Custom Intelligence Source
              </h3>
              <button
                onClick={() => setShowAddSourceModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddCustomSource} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Source Name</label>
                <input
                  type="text"
                  required
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. EdTech Policy Bulletin"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Target URL or Connector</label>
                <input
                  type="text"
                  required
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  placeholder="https://... or internal://..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Intelligence Category</label>
                <select
                  value={newSourceCategory}
                  onChange={(e) => setNewSourceCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="customers">Customers (Forums, Reviews, Needs)</option>
                  <option value="competitors">Competitors (Rivals & Substitutes)</option>
                  <option value="market">Market (Regulatory, Policy & Industry)</option>
                  <option value="internal">Internal Intelligence (CRM, Feedback)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Reason for Inclusion (3-Part Justification)</label>
                <textarea
                  rows={3}
                  required
                  value={newSourceReason}
                  onChange={(e) => setNewSourceReason(e.target.value)}
                  placeholder="Specificity: ... | Recency: ... | Credibility: ..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSourceModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
                >
                  Add to Signal Stack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 font-mono">
        FounderBrief — Company Intelligence & Executive Briefing Engine · GitHub: github.com/kartikm0111/FounderBrief
      </footer>
    </div>
  );
}
