import React, { useState, useEffect } from 'react';
import {
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  ListBulletIcon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowPathIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from './components/ui/icons';
import { DashboardMetrics, AdminRequestItem, ReviewItem, SellerRecord } from './types';
import { Button } from './components/ui/button';
import { AdminLogin } from './components/AdminLogin';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

type NavTab = 'dashboard' | 'reviews' | 'requests' | 'sellers' | 'deals';

export function App() {
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const u = localStorage.getItem('handular_admin_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
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
  const [newSellerTelegram, setNewSellerTelegram] = useState('');
  const [newSellerCategory, setNewSellerCategory] = useState<'LAPTOPS' | 'PHONES'>('LAPTOPS');

  const fetchDashboardData = async () => {
    try {
      const [metricsRes, requestsRes, reviewsRes, sellersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/metrics`),
        fetch(`${API_BASE_URL}/api/v1/admin/requests`),
        fetch(`${API_BASE_URL}/api/v1/admin/reviews`),
        fetch(`${API_BASE_URL}/api/v1/admin/sellers`),
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
    if (adminUser) {
      fetchDashboardData();
    }
  }, [adminUser]);

  const handleLoginSuccess = (user: any, token: string) => {
    setAdminUser(user);
    try {
      localStorage.setItem('handular_admin_user', JSON.stringify(user));
      localStorage.setItem('handular_admin_token', token);
    } catch (e) {
      console.warn('Could not save admin session to storage', e);
    }
  };

  const handleSignOut = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('handular_admin_user');
      localStorage.removeItem('handular_admin_token');
    } catch (e) {
      console.warn('Could not clear admin storage', e);
    }
  };

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
        setActionMessage('Offer rejected and seller requested for clarification.');
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
          telegramHandle: newSellerTelegram || undefined,
          categories: [newSellerCategory],
        }),
      });
      if (res.ok) {
        setShowAddSellerModal(false);
        setNewSellerName('');
        setNewSellerContact('');
        setNewSellerPhone('');
        setNewSellerTelegram('');
        setActionMessage('New verified vendor added successfully!');
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

  // If not logged into admin, display clean AdminLogin screen
  if (!adminUser) {
    return (
      <AdminLogin
        apiBaseUrl={API_BASE_URL}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4ef] flex font-sans text-[#10393b] selection:bg-[#10393b] selection:text-white">
      {/* Sidebar - ZERO BORDERS, ZERO SHADOWS */}
      <aside className="w-64 bg-white flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Top Brand Bar - Centered Standalone Logo, Max Width */}
          <div className="h-16 px-5 flex items-center justify-center bg-[#eceae2]">
            <img
              src="/handular_icon.png"
              alt="Handular"
              className="w-10 h-10 max-w-[40px] rounded-[10px] object-contain"
            />
          </div>

          {/* Search Bar */}
          <div className="p-3">
            <div className="h-9 px-3 rounded-[10px] bg-[#eceae2] flex items-center justify-between text-xs text-[#777777]">
              <div className="flex items-center gap-2">
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#777777]" />
                <span className="font-normal">Quick search...</span>
              </div>
              <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded-[5px] text-[#555555] font-mono">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Navigation Links - ZERO SHADOWS */}
          <nav className="px-2 space-y-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full h-10 px-3 rounded-[10px] text-xs font-normal flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-[#10393b] text-white'
                  : 'text-[#555555] hover:bg-[#eceae2] hover:text-[#10393b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Squares2X2Icon className="w-4 h-4" />
                <span>Command Center</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('reviews')}
              className={`w-full h-10 px-3 rounded-[10px] text-xs font-normal flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'reviews'
                  ? 'bg-[#10393b] text-white'
                  : 'text-[#555555] hover:bg-[#eceae2] hover:text-[#10393b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                <span>Review Queue</span>
              </div>
              {reviews.length > 0 && (
                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-normal bg-[#ffad24]/20 text-[#ffad24]">
                  {reviews.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('requests')}
              className={`w-full h-10 px-3 rounded-[10px] text-xs font-normal flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'requests'
                  ? 'bg-[#10393b] text-white'
                  : 'text-[#555555] hover:bg-[#eceae2] hover:text-[#10393b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListBulletIcon className="w-4 h-4" />
                <span>Sourcing Board</span>
              </div>
              <span className={`text-[11px] font-mono ${currentTab === 'requests' ? 'text-white/70' : 'text-[#888888]'}`}>
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('sellers')}
              className={`w-full h-10 px-3 rounded-[10px] text-xs font-normal flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'sellers'
                  ? 'bg-[#10393b] text-white'
                  : 'text-[#555555] hover:bg-[#eceae2] hover:text-[#10393b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserGroupIcon className="w-4 h-4" />
                <span>Verified Vendors</span>
              </div>
              <span className={`text-[11px] font-mono ${currentTab === 'sellers' ? 'text-white/70' : 'text-[#888888]'}`}>
                {sellers.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('deals')}
              className={`w-full h-10 px-3 rounded-[10px] text-xs font-normal flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'deals'
                  ? 'bg-[#10393b] text-white'
                  : 'text-[#555555] hover:bg-[#eceae2] hover:text-[#10393b]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BanknotesIcon className="w-4 h-4" />
                <span>Settlement & Escrow</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Sign Out */}
        <div className="p-4 bg-[#f5f4ef] text-[11px] text-[#666666] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-normal text-[#10393b]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Fastify API (:4001)</span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 font-normal flex items-center gap-1 cursor-pointer"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
          <div className="text-[#888888] font-mono text-[10px]">Staff: {adminUser.email}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - ZERO BORDERS, ZERO SHADOWS, NORMAL FONT */}
        <header className="h-16 bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-normal text-[#10393b] capitalize">
              {currentTab}
            </span>
            <span className="text-xs text-[#aaaaaa] hidden sm:inline">•</span>
            <span className="text-xs text-[#666666] hidden sm:inline font-normal">
              Campus Sourcing Automation & AI Verification
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDebouncerSweep}
              title="Run debouncer sweeper on message batches"
            >
              <ArrowPathIcon className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Sweep Batches</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddSellerModal(true)}
            >
              <PlusIcon className="w-3.5 h-3.5 mr-1" />
              <span>New Vendor</span>
            </Button>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {actionMessage && (
          <div className="bg-[#10393b] text-white px-6 py-2.5 text-xs flex items-center justify-between">
            <span className="font-normal">{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs text-[#30c5ce] hover:underline font-normal cursor-pointer"
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
              {/* KPI Cards - ZERO BORDERS, ZERO SHADOWS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-[18px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Active Requests
                  </span>
                  <span className="text-3xl font-normal text-[#10393b] font-mono">
                    {metrics ? metrics.activeRequests : requests.length}
                  </span>
                  <span className="block text-[11px] text-[#666666] mt-1 font-normal">
                    Dispatched across campus sellers
                  </span>
                </div>

                <div className="bg-white rounded-[18px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Pending AI Reviews
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-normal text-[#ffad24] font-mono">
                      {reviews.length}
                    </span>
                    {reviews.length > 0 && (
                      <span className="text-xs text-[#ffad24] bg-[#ffad24]/10 px-2 py-0.5 rounded-[6px] font-normal">
                        Action Required
                      </span>
                    )}
                  </div>
                  <span className="block text-[11px] text-[#666666] mt-1 font-normal">
                    Multimodal offers needing inspection
                  </span>
                </div>

                <div className="bg-white rounded-[18px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Verified Vendors
                  </span>
                  <span className="text-3xl font-normal text-[#10393b] font-mono">
                    {sellers.length}
                  </span>
                  <span className="block text-[11px] text-[#666666] mt-1 font-normal">
                    WhatsApp & Telegram connected
                  </span>
                </div>

                <div className="bg-white rounded-[18px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Sourced Volume
                  </span>
                  <span className="text-3xl font-normal text-emerald-600 font-mono">
                    ₦{metrics ? Number(metrics.totalVolume).toLocaleString() : '0'}
                  </span>
                  <span className="block text-[11px] text-[#666666] mt-1 font-normal">
                    Commissions: ₦{metrics ? Number(metrics.totalCommissions).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              {/* Recent Requests Section */}
              <div className="bg-white rounded-[18px] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-normal text-[#10393b]">
                    Recent Buyer Requests
                  </h3>
                  <button
                    onClick={() => setCurrentTab('requests')}
                    className="text-xs text-[#10393b] hover:text-[#154b4d] font-normal flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all board</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {requests.slice(0, 5).map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-[10px] bg-[#eceae2] hover:bg-[#e4e1d7] flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[10px] bg-white flex items-center justify-center text-sm font-normal text-[#10393b]">
                          {req.category === 'LAPTOPS' ? '💻' : '📱'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-normal text-[#10393b]">
                              {req.publicToken}
                            </span>
                            <span className="text-xs text-[#333333] font-normal">
                              {req.buyerName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-[5px] bg-white text-[#555555] font-normal">
                              Max ₦{Number(req.maxBudget).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-[#666666] block mt-0.5 font-normal">
                            Broadcasted to {req.sellersBroadcasted} vendors • Status: {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`http://localhost:5180/?token=${req.publicToken}&view=offers`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-3 rounded-[10px] bg-white hover:bg-[#FAF9F6] text-xs text-[#10393b] font-normal flex items-center gap-1.5 transition-all"
                        >
                          <span>Buyer View</span>
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-[#777777]" />
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
              <div className="bg-white rounded-[18px] p-6">
                <h2 className="text-xl sm:text-2xl font-normal text-[#10393b] mb-1">
                  Multimodal AI Offer Verification Queue
                </h2>
                <p className="text-xs text-[#666666] font-normal">
                  Offers with confidence scores under 85% or detected anomalies require staff verification before publishing to students.
                </p>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-[18px] p-12 text-center">
                  <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-normal text-[#10393b] mb-1">
                    Queue is All Clear!
                  </h3>
                  <p className="text-xs text-[#666666] max-w-sm mx-auto font-normal">
                    All verified vendor offers are currently processed and published to buyers.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-[18px] p-6 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-normal px-2.5 py-1 rounded-[6px] bg-[#ffad24]/10 text-[#ffad24]">
                            {rev.requestToken}
                          </span>
                          <span className="text-xs text-[#555555] font-normal">
                            Seller: {rev.sellerName} ({rev.sellerPhone})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#777777]">
                            AI Confidence: {(rev.aiConfidenceScore * 100).toFixed(0)}%
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenReview(rev)}
                          >
                            Inspect & Verify
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-[10px] bg-[#eceae2] overflow-hidden flex-shrink-0">
                          {rev.cloudinaryPhotos[0] && (
                            <img
                              src={rev.cloudinaryPhotos[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-normal text-[#10393b]">
                            {rev.brand} {rev.model} — ₦{Number(rev.price).toLocaleString()}
                          </h4>
                          <p className="text-xs text-[#ffad24] bg-[#ffad24]/10 px-2.5 py-1 rounded-[6px] inline-block mt-1 font-normal">
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
            <div className="bg-white rounded-[18px] p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                    Active Buyer Requests Board
                  </h3>
                  <span className="text-xs text-[#666666] font-normal">
                    All student demand actively sourcing campus sellers
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchDashboardData}
                >
                  <ArrowPathIcon className="w-3.5 h-3.5 mr-1" />
                  <span>Refresh</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-[10px] bg-[#eceae2] hover:bg-[#e4e1d7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-normal text-[#10393b]">
                          {r.publicToken}
                        </span>
                        <span className="text-xs font-normal text-[#10393b]">{r.buyerName}</span>
                        <span className="text-[11px] text-[#777777] font-mono">({r.buyerPhone})</span>
                        <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-normal ${
                          r.status === 'OFFERS_READY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-white text-[#10393b]'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#666666] font-normal">
                        <span>{r.category}</span>
                        <span>•</span>
                        <span>Max ₦{Number(r.maxBudget).toLocaleString()}</span>
                        <span>•</span>
                        <span>{r.sellersBroadcasted} vendors</span>
                      </div>
                    </div>

                    <a
                      href={`http://localhost:5180/?token=${r.publicToken}&view=offers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-[10px] bg-white hover:bg-[#FAF9F6] text-xs font-normal text-[#10393b] flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
                    >
                      <span>Buyer View</span>
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-[#777777]" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED SELLERS */}
          {currentTab === 'sellers' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[18px] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                    Verified Campus Sellers Directory
                  </h2>
                  <p className="text-xs text-[#666666] font-normal">
                    Vendors vetted for genuine hardware, WhatsApp broadcast access, and warranty commitments.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddSellerModal(true)}
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-1" />
                  <span>Add Vendor</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-[18px] p-5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-normal text-sm text-[#10393b]">
                          {s.businessName}
                        </span>
                        <span className="text-xs font-normal px-2.5 py-0.5 rounded-[6px] bg-emerald-50 text-emerald-800">
                          ★ {s.rating}
                        </span>
                      </div>

                      <div className="text-xs text-[#666666] space-y-1 mb-4 font-normal">
                        <p>Contact: {s.contactName}</p>
                        <p className="font-mono text-[#10393b]">{s.whatsappNumber}</p>
                        <p>Completed Deals: {s.completedDeals}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 bg-[#f5f4ef] -mx-5 -mb-5 px-5 py-3 rounded-b-[18px]">
                      <span className="text-[10px] uppercase font-normal text-[#777777]">
                        {s.categories.join(', ')}
                      </span>
                      <a
                        href={`https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-normal"
                      >
                        <DevicePhoneMobileIcon className="w-3.5 h-3.5" />
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
            <div className="bg-white rounded-[18px] p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Deal Settlement & Commission Escrow
                </h2>
                <p className="text-xs text-[#666666] font-normal">
                  Tracks locked matches, campus pickup handovers, and Handular 5% brokerage settlement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-[10px] bg-[#eceae2]">
                  <span className="block text-xs font-normal text-[#777777] uppercase">
                    Escrow Guaranteed Deals
                  </span>
                  <span className="text-2xl font-normal text-[#10393b] font-mono mt-1 block">
                    {metrics ? metrics.completedDealsCount : 1}
                  </span>
                </div>
                <div className="p-5 rounded-[10px] bg-[#eceae2]">
                  <span className="block text-xs font-normal text-[#777777] uppercase">
                    Total Volume
                  </span>
                  <span className="text-2xl font-normal text-emerald-700 font-mono mt-1 block">
                    ₦{metrics ? Number(metrics.totalVolume).toLocaleString() : '620,000'}
                  </span>
                </div>
                <div className="p-5 rounded-[10px] bg-[#eceae2]">
                  <span className="block text-xs font-normal text-[#777777] uppercase">
                    Campus Hub Commission
                  </span>
                  <span className="text-2xl font-normal text-[#10393b] font-mono mt-1 block">
                    ₦{metrics ? Number(metrics.totalCommissions).toLocaleString() : '31,000'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-[10px] bg-[#eceae2] text-xs text-[#444444] flex items-center justify-between font-normal">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>Campus Tech Lounge Escrow verification active at Room 104.</span>
                </div>
                <span className="font-mono text-emerald-700 font-normal">100% Guaranteed</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* INSPECT & APPROVE MODAL - ZERO BORDERS, ZERO SHADOWS */}
      {activeReview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[18px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-normal px-2.5 py-1 rounded-[6px] bg-[#eceae2] text-[#10393b]">
                  {activeReview.requestToken}
                </span>
                <h3 className="text-base font-normal text-[#10393b] mt-2">
                  Human Verification: {activeReview.brand} {activeReview.model}
                </h3>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="w-8 h-8 rounded-[8px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Side-by-Side: Raw WhatsApp vs AI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[10px] bg-[#eceae2] space-y-2">
                <span className="block text-[11px] font-normal text-[#777777] uppercase tracking-wider">
                  Raw WhatsApp Inbound
                </span>
                <p className="text-xs text-[#333333] italic font-normal">
                  &quot;{activeReview.rawMessages.join(' ') || 'Vendor sent device photos and specs directly.'}&quot;
                </p>
                {activeReview.audioTranscript && (
                  <p className="text-xs text-[#10393b] bg-[#30c5ce]/10 p-2.5 rounded-[10px] font-normal">
                    Voice Note: &quot;{activeReview.audioTranscript}&quot;
                  </p>
                )}
              </div>

              <div className="p-4 rounded-[10px] bg-[#ffad24]/10 space-y-2">
                <span className="block text-[11px] font-normal text-[#ffad24] uppercase tracking-wider">
                  AI Flag & Confidence
                </span>
                <p className="text-xs text-[#333333] font-normal">
                  {activeReview.flagReason}
                </p>
                <span className="block text-xs font-mono text-[#777777]">
                  Confidence Score: {(activeReview.aiConfidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <span className="block text-xs font-normal text-[#777777] uppercase tracking-wider">
                Staff Override & Fine-Tuning
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-[#555555] mb-1.5 font-normal">Agreed Price (₦)</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm font-mono font-normal text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30"
                  />
                </div>
                <div>
                  <span className="block text-xs text-[#555555] mb-1.5 font-normal">Condition Grade</span>
                  <input
                    type="text"
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="ghost"
                size="md"
                onClick={handleRejectReview}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Reject & Ask Seller
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleApproveReview}
              >
                <span>Approve & Publish</span>
                <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL - ZERO BORDERS, ZERO SHADOWS */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSeller}
            className="bg-white rounded-[18px] w-full max-w-md p-7 space-y-4"
          >
            <h3 className="text-base font-normal text-[#10393b]">
              Add Verified Campus Vendor
            </h3>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Business Name</span>
              <input
                required
                type="text"
                placeholder="e.g. Apex Gadgets Hub"
                value={newSellerName}
                onChange={(e) => setNewSellerName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
              />
            </div>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Contact Person</span>
              <input
                required
                type="text"
                placeholder="e.g. Samuel"
                value={newSellerContact}
                onChange={(e) => setNewSellerContact(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
              />
            </div>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">WhatsApp Phone</span>
              <input
                required
                type="text"
                placeholder="e.g. 2348012345678"
                value={newSellerPhone}
                onChange={(e) => setNewSellerPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
              />
            </div>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Telegram Handle or ID (Optional)</span>
              <input
                type="text"
                placeholder="e.g. @jerus_tech"
                value={newSellerTelegram}
                onChange={(e) => setNewSellerTelegram(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal"
              />
            </div>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Primary Category</span>
              <select
                value={newSellerCategory}
                onChange={(e) => setNewSellerCategory(e.target.value as any)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal cursor-pointer"
              >
                <option value="LAPTOPS">Laptops</option>
                <option value="PHONES">Phones</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSellerModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Save Vendor
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
