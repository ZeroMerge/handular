import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ClipboardCheck, ListFilter, Users, 
  DollarSign, Sparkles, RefreshCw, Plus, CheckCircle2, 
  ArrowRight, ExternalLink, ShieldCheck, 
  Search, Phone
} from 'lucide-react';
import { DashboardMetrics, AdminRequestItem, ReviewItem, SellerRecord } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

type NavTab = 'dashboard' | 'reviews' | 'requests' | 'sellers' | 'deals';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Review modal state
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editGrade, setEditGrade] = useState<string>('');

  // New seller modal state
  const [showAddSellerModal, setShowAddSellerModal] = useState(false);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerContact, setNewSellerContact] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('');
  const [newSellerCategory, setNewSellerCategory] = useState<'LAPTOPS' | 'PHONES'>('LAPTOPS');

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, requestsRes, reviewsRes, sellersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/metrics`),
        fetch(`${API_BASE_URL}/api/v1/admin/requests`),
        fetch(`${API_BASE_URL}/api/v1/admin/reviews`),
        fetch(`${API_BASE_URL}/api/v1/sellers`),
      ]);

      if (metricsRes.ok) {
        setMetrics(await metricsRes.json());
      }
      if (requestsRes.ok) {
        const d = await requestsRes.json();
        setRequests(d.data || []);
      }
      if (reviewsRes.ok) {
        const d = await reviewsRes.json();
        setReviews(d.data || []);
      }
      if (sellersRes.ok) {
        const d = await sellersRes.json();
        setSellers(d.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenReview = (rev: ReviewItem) => {
    setActiveReview(rev);
    setEditPrice(rev.price);
    setEditGrade(rev.conditionGrade);
  };

  const handleApproveReview = async () => {
    if (!activeReview) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews/${activeReview.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: editPrice,
          conditionGrade: editGrade,
        }),
      });
      if (res.ok) {
        setActionMessage(`Offer ${activeReview.brand} ${activeReview.model} approved and published to buyer!`);
        setActiveReview(null);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectReview = async () => {
    if (!activeReview) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/reviews/${activeReview.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Insufficient proof of battery health / unclear specs in photos',
        }),
      });
      if (res.ok) {
        setActionMessage(`Offer rejected and seller requested for clarification.`);
        setActiveReview(null);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/sellers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: newSellerName,
          contactName: newSellerContact,
          whatsappNumber: newSellerPhone,
          categories: [newSellerCategory],
        }),
      });
      if (res.ok) {
        setShowAddSellerModal(false);
        setNewSellerName('');
        setNewSellerContact('');
        setNewSellerPhone('');
        setActionMessage('New verified vendor added successfully!');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateInbound = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/simulation/simulate-seller-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerPhone: '2348012345678',
          message: 'Hello admin, I have a Lenovo ThinkPad T14 Gen 2 Core i7 16GB 512GB SSD. Battery 88%. Price ₦380,000.',
        }),
      });
      if (res.ok) {
        setActionMessage('Simulated inbound seller offer ingested and processed by AI pipeline!');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDebouncerSweep = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/debouncer/sweep`, {
        method: 'POST',
      });
      if (res.ok) {
        const d = await res.json();
        setActionMessage(`Debouncer sweep finished: processed ${d.processedCount} batches.`);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans text-neutral-900">
      {/* Cloudflare-style Left Sidebar (matching Screenshot 2) */}
      <aside className="w-64 bg-white border-r border-neutral-200/80 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Top Account & Brand Bar */}
          <div className="h-14 border-b border-neutral-200/80 px-5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0051c3] text-white flex items-center justify-center font-bold text-sm shadow-none">
              H
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-neutral-900">
                Handular Ops
              </span>
              <span className="block text-[10px] text-neutral-400 font-mono">
                admin.handular.com
              </span>
            </div>
          </div>

          {/* Quick Search Ctrl + K */}
          <div className="p-3">
            <div className="h-9 px-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 stroke-[1.75px]" />
                <span>Quick search...</span>
              </div>
              <kbd className="text-[10px] bg-white border border-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-500 font-mono">
                ctrl + K
              </kbd>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-2 space-y-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 stroke-[1.75px]" />
                <span>Command Center</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('reviews')}
              className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                currentTab === 'reviews'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-4 h-4 stroke-[1.75px]" />
                <span>Review Queue</span>
              </div>
              {reviews.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {reviews.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('requests')}
              className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                currentTab === 'requests'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListFilter className="w-4 h-4 stroke-[1.75px]" />
                <span>Sourcing Board</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('sellers')}
              className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                currentTab === 'sellers'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 stroke-[1.75px]" />
                <span>Verified Vendors</span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                {sellers.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('deals')}
              className={`w-full h-10 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                currentTab === 'deals'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 stroke-[1.75px]" />
                <span>Settlement & Escrow</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-200/80 text-[11px] text-neutral-500 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-neutral-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fastify API Live (:4001)</span>
          </div>
          <div className="text-neutral-400 font-mono">Postgres (Docker)</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-neutral-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-neutral-900 capitalize">
              {currentTab}
            </span>
            <span className="text-xs text-neutral-400 hidden sm:inline">•</span>
            <span className="text-xs text-neutral-500 hidden sm:inline">
              Campus Sourcing Automation & Multimodal AI Verification
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDebouncerSweep}
              title="Run 45s debouncer sweeper on message batches"
              className="h-8 px-2.5 rounded-lg border border-neutral-200/80 text-xs text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[1.75px]" />
              <span className="hidden sm:inline">Sweep Batches</span>
            </button>

            <button
              onClick={handleSimulateInbound}
              className="h-8 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulate Offer</span>
            </button>

            <button
              onClick={() => setShowAddSellerModal(true)}
              className="h-8 px-3 rounded-lg bg-[#0051c3] hover:bg-[#0043a8] text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2px]" />
              <span>New Vendor</span>
            </button>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {actionMessage && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 text-xs text-blue-900 flex items-center justify-between">
            <span className="font-medium">{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Pages */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* TAB 1: COMMAND CENTER / DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Cloudflare KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Active Sourcing Requests
                  </span>
                  <span className="text-3xl font-extrabold text-neutral-900 font-mono">
                    {metrics ? metrics.activeRequests : requests.length}
                  </span>
                  <span className="block text-[11px] text-neutral-500 mt-1">
                    Dispatched across campus sellers
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Pending AI Reviews
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-600 font-mono">
                      {reviews.length}
                    </span>
                    {reviews.length > 0 && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                        Action Required
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-neutral-500 mt-1">
                    Multimodal offers needing inspection
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Verified Campus Vendors
                  </span>
                  <span className="text-3xl font-extrabold text-neutral-900 font-mono">
                    {sellers.length}
                  </span>
                  <span className="block text-[11px] text-neutral-500 mt-1">
                    WhatsApp & Telegram connected
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                    Sourced Volume
                  </span>
                  <span className="text-3xl font-extrabold text-emerald-600 font-mono">
                    ₦{metrics ? Number(metrics.totalVolume).toLocaleString() : '0'}
                  </span>
                  <span className="block text-[11px] text-neutral-500 mt-1">
                    Commissions: ₦{metrics ? Number(metrics.totalCommissions).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              {/* Recent Requests Section (matching Cloudflare Screenshot 1 list) */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden">
                <div className="p-5 border-b border-neutral-200/80 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Recent Buyer Requests
                  </h3>
                  <button
                    onClick={() => setCurrentTab('requests')}
                    className="text-xs text-[#0051c3] hover:underline font-medium flex items-center gap-1"
                  >
                    <span>View all board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {requests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      className="p-4 sm:px-6 hover:bg-neutral-50/60 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-xs font-mono">
                          {req.category === 'LAPTOPS' ? '💻' : '📱'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-neutral-900">
                              {req.publicToken}
                            </span>
                            <span className="text-xs text-neutral-600 font-medium">
                              {req.buyerName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                              Max ₦{Number(req.maxBudget).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-400 block mt-0.5">
                            Broadcasted to {req.sellersBroadcasted} vendors • Status: {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5180/?token=${req.publicToken}&view=offers`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-2.5 rounded-lg border border-neutral-200/80 text-xs text-neutral-600 hover:bg-neutral-100 flex items-center gap-1 transition-colors"
                        >
                          <span>Buyer View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STAFF REVIEW QUEUE */}
          {currentTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-1">
                  Multimodal AI Offer Verification Queue
                </h2>
                <p className="text-xs text-neutral-500">
                  Offers with confidence scores under 85% or detected anomalies require staff verification before publishing to students.
                </p>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-neutral-900 mb-1">
                    Queue is All Clear!
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                    Zero offers waiting for staff review. Click simulate below to test an incoming low-confidence vendor offer.
                  </p>
                  <button
                    onClick={handleSimulateInbound}
                    className="h-9 px-4 rounded-xl bg-neutral-900 text-white text-xs font-medium"
                  >
                    Simulate Inbound Vendor Offer
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-2xl border border-neutral-200/80 p-5 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            {rev.requestToken}
                          </span>
                          <span className="text-xs text-neutral-500 font-medium">
                            Seller: {rev.sellerName} ({rev.sellerPhone})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-neutral-500">
                            AI Confidence: {(rev.aiConfidenceScore * 100).toFixed(0)}%
                          </span>
                          <button
                            onClick={() => handleOpenReview(rev)}
                            className="h-8 px-3 rounded-lg bg-[#0051c3] text-white text-xs font-medium hover:bg-[#0043a8]"
                          >
                            Inspect & Verify
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
                          {rev.cloudinaryPhotos[0] && (
                            <img
                              src={rev.cloudinaryPhotos[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900">
                            {rev.brand} {rev.model} — ₦{Number(rev.price).toLocaleString()}
                          </h4>
                          <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-block mt-1">
                            Flag Reason: {rev.flagReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REQUESTS BOARD */}
          {currentTab === 'requests' && (
            <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden">
              <div className="p-5 border-b border-neutral-200/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Active Buyer Requests Board
                  </h3>
                  <span className="text-xs text-neutral-500">
                    All student demand actively sourcing campus sellers
                  </span>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="h-8 px-3 rounded-lg border border-neutral-200/80 text-xs text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200/80">
                    <tr>
                      <th className="p-4">Token</th>
                      <th className="p-4">Buyer</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Max Budget</th>
                      <th className="p-4">Broadcasts</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-neutral-50/50">
                        <td className="p-4 font-mono font-bold text-neutral-900">
                          {r.publicToken}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-neutral-900 block">{r.buyerName}</span>
                          <span className="text-neutral-400 font-mono text-[11px]">{r.buyerPhone}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                            {r.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-semibold text-neutral-900">
                          ₦{Number(r.maxBudget).toLocaleString()}
                        </td>
                        <td className="p-4 text-neutral-600 font-mono">
                          {r.sellersBroadcasted} vendors
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            r.status === 'OFFERS_READY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-blue-50 text-[#0051c3]'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <a
                            href={`http://localhost:5180/?token=${r.publicToken}&view=offers`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0051c3] hover:underline font-medium"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED SELLERS */}
          {currentTab === 'sellers' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    Verified Campus Sellers Directory
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Vendors vetted for genuine hardware, WhatsApp broadcast access, and warranty commitments.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSellerModal(true)}
                  className="h-9 px-4 rounded-xl bg-[#0051c3] text-white text-xs font-medium hover:bg-[#0043a8]"
                >
                  + Add Vendor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-neutral-200/80 p-5 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-neutral-900">
                        {s.businessName}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        ★ {s.rating}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 space-y-1 mb-4">
                      <p>Contact: {s.contactName}</p>
                      <p className="font-mono">{s.whatsappNumber}</p>
                      <p>Completed Deals: {s.completedDeals}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">
                        {s.categories.join(', ')}
                      </span>
                      <a
                        href={`https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DEALS & ESCROW */}
          {currentTab === 'deals' && (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Deal Settlement & Commission Escrow
                </h2>
                <p className="text-xs text-neutral-500">
                  Tracks locked matches, campus pickup handovers, and Handular 5% brokerage settlement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase">
                    Escrow Guaranteed Deals
                  </span>
                  <span className="text-2xl font-extrabold text-neutral-900 font-mono mt-1 block">
                    {metrics ? metrics.completedDealsCount : 1}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase">
                    Total Volume
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono mt-1 block">
                    ₦{metrics ? Number(metrics.totalVolume).toLocaleString() : '620,000'}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase">
                    Campus Hub Commission
                  </span>
                  <span className="text-2xl font-extrabold text-[#0051c3] font-mono mt-1 block">
                    ₦{metrics ? Number(metrics.totalCommissions).toLocaleString() : '31,000'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200/80 text-xs text-neutral-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Campus Tech Lounge Escrow verification active at Room 104.</span>
                </div>
                <span className="font-mono text-emerald-600 font-semibold">100% Guaranteed</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* INSPECT & APPROVE MODAL (Screen A2) */}
      {activeReview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#0051c3]">
                  {activeReview.requestToken}
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-1">
                  Human Verification: {activeReview.brand} {activeReview.model}
                </h3>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Side-by-Side: Raw WhatsApp Message vs AI Extraction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Raw Inbound */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                <span className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Raw WhatsApp Inbound
                </span>
                <p className="text-xs text-neutral-700 italic">
                  "{activeReview.rawMessages.join(' ') || 'Vendor sent device photos and specs directly.'}"
                </p>
                {activeReview.audioTranscript && (
                  <p className="text-xs text-blue-800 bg-blue-50 p-2 rounded">
                    Voice Note Transcript: "{activeReview.audioTranscript}"
                  </p>
                )}
              </div>

              {/* AI Findings */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <span className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  AI Flag & Confidence
                </span>
                <p className="text-xs text-amber-900 font-medium">
                  {activeReview.flagReason}
                </p>
                <span className="block text-xs font-mono text-neutral-600">
                  Confidence Score: {(activeReview.aiConfidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Staff Override & Fine-Tuning
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-neutral-500 mb-1">Agreed Price (₦)</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200/80 text-sm font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="block text-xs text-neutral-500 mb-1">Condition Grade</span>
                  <input
                    type="text"
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-neutral-200/80 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleRejectReview}
                className="h-10 px-4 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Reject & Ask Seller
              </button>
              <button
                type="button"
                onClick={handleApproveReview}
                className="h-10 px-5 rounded-xl bg-[#0051c3] text-white text-xs font-semibold hover:bg-[#0043a8] transition-colors"
              >
                Approve & Publish to Student ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSeller}
            className="bg-white rounded-2xl border border-neutral-200/80 w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-neutral-900">
              Add Verified Campus Vendor
            </h3>
            <div>
              <span className="block text-xs text-neutral-500 mb-1">Business Name</span>
              <input
                required
                type="text"
                placeholder="e.g. Apex Gadgets Hub"
                value={newSellerName}
                onChange={(e) => setNewSellerName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-200/80 text-sm"
              />
            </div>
            <div>
              <span className="block text-xs text-neutral-500 mb-1">Contact Person</span>
              <input
                required
                type="text"
                placeholder="e.g. Samuel"
                value={newSellerContact}
                onChange={(e) => setNewSellerContact(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-200/80 text-sm"
              />
            </div>
            <div>
              <span className="block text-xs text-neutral-500 mb-1">WhatsApp Phone</span>
              <input
                required
                type="text"
                placeholder="e.g. 2348012345678"
                value={newSellerPhone}
                onChange={(e) => setNewSellerPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-200/80 text-sm"
              />
            </div>
            <div>
              <span className="block text-xs text-neutral-500 mb-1">Primary Category</span>
              <select
                value={newSellerCategory}
                onChange={(e) => setNewSellerCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-neutral-200/80 text-sm bg-white"
              >
                <option value="LAPTOPS">Laptops</option>
                <option value="PHONES">Phones</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSellerModal(false)}
                className="h-10 px-4 rounded-xl text-xs text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-5 rounded-xl bg-[#0051c3] text-white text-xs font-semibold hover:bg-[#0043a8]"
              >
                Save Vendor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
