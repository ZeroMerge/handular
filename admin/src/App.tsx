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
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ChevronRightIcon,
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

const getFriendlyStatus = (status: string) => {
  switch (status) {
    case 'OPEN':
      return 'Active';
    case 'BROADCASTED':
      return 'Sourcing';
    case 'OFFERS_READY':
      return 'Offers Ready';
    case 'DEAL_LOCKED':
      return 'Matched';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
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
        setActionMessage(`Offer approved.`);
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
          reason: 'Insufficient details or unclear condition',
        }),
      });
      if (res.ok) {
        setActionMessage('Offer declined.');
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
        setActionMessage('Vendor added.');
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
      {/* Sidebar - CLEAN, MINIMALIST, ZERO BORDERS, ZERO SHADOWS */}
      <aside className="w-56 bg-white flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Top Brand Bar */}
          <div className="h-16 px-5 flex items-center gap-3">
            <img
              src="/handular_icon.png"
              alt="Handular"
              className="w-8 h-8 max-w-[32px] rounded-[6px] object-contain"
            />
            <span className="text-sm font-medium tracking-tight text-[#10393b]">
              Handular
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 pt-2 space-y-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full h-9 px-3 rounded-[6px] text-xs flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-black/10 text-[#0f2d2e] font-medium'
                  : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b] font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Squares2X2Icon className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              {currentTab === 'dashboard' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10393b] shrink-0" />
              )}
            </button>

            <button
              onClick={() => setCurrentTab('reviews')}
              className={`w-full h-9 px-3 rounded-[6px] text-xs flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'reviews'
                  ? 'bg-black/10 text-[#0f2d2e] font-medium'
                  : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b] font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                <span>Reviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                {reviews.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-[3px] text-[10px] font-normal bg-[#ffad24]/20 text-[#ffad24]">
                    {reviews.length}
                  </span>
                )}
                {currentTab === 'reviews' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10393b] shrink-0" />
                )}
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('requests')}
              className={`w-full h-9 px-3 rounded-[6px] text-xs flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'requests'
                  ? 'bg-black/10 text-[#0f2d2e] font-medium'
                  : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b] font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListBulletIcon className="w-4 h-4" />
                <span>Requests</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-[#888888]">
                  {requests.length}
                </span>
                {currentTab === 'requests' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10393b] shrink-0" />
                )}
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('sellers')}
              className={`w-full h-9 px-3 rounded-[6px] text-xs flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'sellers'
                  ? 'bg-black/10 text-[#0f2d2e] font-medium'
                  : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b] font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserGroupIcon className="w-4 h-4" />
                <span>Vendors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-[#888888]">
                  {sellers.length}
                </span>
                {currentTab === 'sellers' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10393b] shrink-0" />
                )}
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('deals')}
              className={`w-full h-9 px-3 rounded-[6px] text-xs flex items-center justify-between transition-all cursor-pointer ${
                currentTab === 'deals'
                  ? 'bg-black/10 text-[#0f2d2e] font-medium'
                  : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b] font-normal'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BanknotesIcon className="w-4 h-4" />
                <span>Deals</span>
              </div>
              {currentTab === 'deals' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10393b] shrink-0" />
              )}
            </button>
          </nav>
        </div>

        {/* Clean Sidebar Footer */}
        <div className="p-4 text-[11px] text-[#888888]">
          <div className="flex items-center justify-between">
            <span className="truncate max-w-[120px] font-normal text-[#666666]">
              {adminUser.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-[#888888] hover:text-red-600 font-normal flex items-center gap-1 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - CLEAN, ZERO BORDERS, ZERO SHADOWS */}
        <header className="h-16 bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img
              src="/handular_icon.png"
              alt="Handular"
              className="w-8 h-8 rounded-[4px] object-contain md:hidden"
            />
            <span className="text-base sm:text-lg font-normal text-[#10393b] capitalize">
              {currentTab === 'dashboard' ? 'Dashboard' : currentTab}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              title="Refresh data"
              className="text-xs"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin-smooth' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddSellerModal(true)}
              className="text-xs"
            >
              <PlusIcon className="w-3.5 h-3.5 mr-1" />
              <span>New Vendor</span>
            </Button>

            <button
              onClick={handleSignOut}
              className="md:hidden p-2 rounded-[4px] text-[#888888] hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Feedback Banner */}
        {actionMessage && (
          <div className="bg-[#10393b] text-white px-6 py-2.5 text-xs flex items-center justify-between animate-chat-morph">
            <span className="font-normal">{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs text-[#30c5ce] hover:underline font-normal cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Pages Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto no-scrollbar max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div key="dashboard" className="space-y-6 animate-chat-morph">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-[10px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Active Requests
                  </span>
                  <span className="text-3xl font-normal text-[#10393b] font-mono">
                    {metrics ? metrics.activeRequests : requests.length}
                  </span>
                </div>

                <div className="bg-white rounded-[10px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Pending Reviews
                  </span>
                  <span className="text-3xl font-normal text-[#ffad24] font-mono">
                    {reviews.length}
                  </span>
                </div>

                <div className="bg-white rounded-[10px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Vendors
                  </span>
                  <span className="text-3xl font-normal text-[#10393b] font-mono">
                    {sellers.length}
                  </span>
                </div>

                <div className="bg-white rounded-[10px] p-5">
                  <span className="block text-xs font-normal text-[#888888] uppercase tracking-wider mb-1">
                    Total Sales
                  </span>
                  <span className="text-3xl font-normal text-emerald-600 font-mono">
                    ₦{metrics ? Number(metrics.totalVolume).toLocaleString() : '0'}
                  </span>
                </div>
              </div>

              {/* Recent Requests Section */}
              <div className="bg-white rounded-[10px] p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-normal text-[#10393b]">
                    Recent Requests
                  </h3>
                  <button
                    onClick={() => setCurrentTab('requests')}
                    className="text-xs text-[#10393b] hover:text-[#154b4d] font-normal flex items-center gap-1 cursor-pointer"
                  >
                    <span>View all</span>
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {isRefreshing && requests.length === 0 ? (
                    <div className="space-y-2.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-[6px] bg-[#eceae2] animate-pulse space-y-2">
                          <div className="h-4 bg-[#e0ded6] rounded-[3px] w-1/4" />
                          <div className="h-3 bg-[#e0ded6] rounded-[3px] w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    requests.slice(0, 5).map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-[6px] bg-[#eceae2] hover:bg-[#e4e1d7] transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-[6px] bg-white flex items-center justify-center text-sm font-normal text-[#10393b] shrink-0">
                              {req.category === 'LAPTOPS' ? '💻' : '📱'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-normal text-[#10393b]">
                                  {req.publicToken}
                                </span>
                                <span className="text-xs text-[#333333] font-normal truncate">
                                  {req.buyerName}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-white text-[#555555] font-normal">
                                  Max ₦{Number(req.maxBudget).toLocaleString()}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-white text-[#10393b] font-normal">
                                  {getFriendlyStatus(req.status)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end shrink-0">
                            <a
                              href={`http://localhost:5180/?token=${req.publicToken}&view=offers`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-3 rounded-[5px] bg-white hover:bg-[#FAF9F6] text-xs text-[#10393b] font-normal flex items-center gap-1.5 transition-all"
                            >
                              <span>View</span>
                              <ChevronRightIcon className="w-3.5 h-3.5 text-[#777777]" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVIEWS */}
          {currentTab === 'reviews' && (
            <div key="reviews" className="space-y-6 animate-chat-morph">
              <div className="bg-white rounded-[10px] p-6">
                <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Review Offers
                </h2>
              </div>

              {reviews.length === 0 ? (
                <div className="bg-white rounded-[10px] p-12 text-center">
                  <CheckCircleIcon className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-normal text-[#10393b]">
                    No pending reviews
                  </h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white rounded-[10px] p-6 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-normal px-2 py-0.5 rounded-[3px] bg-[#ffad24]/10 text-[#ffad24]">
                            {rev.requestToken}
                          </span>
                          <span className="text-xs text-[#555555] font-normal">
                            {rev.sellerName} ({rev.sellerPhone})
                          </span>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReview(rev)}
                          className="text-xs"
                        >
                          <span>Review</span>
                          <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-[6px] bg-[#eceae2] overflow-hidden flex-shrink-0">
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
                          {rev.flagReason && (
                            <p className="text-xs text-[#ffad24] bg-[#ffad24]/10 px-2 py-0.5 rounded-[3px] inline-block mt-1 font-normal">
                              {rev.flagReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REQUESTS */}
          {currentTab === 'requests' && (
            <div key="requests" className="bg-white rounded-[10px] p-6 space-y-5 animate-chat-morph">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Requests
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={fetchDashboardData}
                  disabled={isRefreshing}
                  className="text-xs"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin-smooth' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {isRefreshing && requests.length === 0 ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 rounded-[6px] bg-[#eceae2] animate-pulse space-y-2">
                        <div className="h-4 bg-[#e0ded6] rounded-[3px] w-1/4" />
                        <div className="h-3 bg-[#e0ded6] rounded-[3px] w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  requests.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-[6px] bg-[#eceae2] hover:bg-[#e4e1d7] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-normal text-[#10393b]">
                              {r.publicToken}
                            </span>
                            <span className="text-xs font-normal text-[#10393b]">{r.buyerName}</span>
                            <span className="text-[11px] text-[#777777] font-mono">({r.buyerPhone})</span>
                            <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-normal inline-flex items-center gap-1.5 ${
                              r.status === 'OFFERS_READY'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-white text-[#10393b]'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'OFFERS_READY' ? 'bg-emerald-600' : 'bg-[#ffad24]'}`} />
                              <span>{getFriendlyStatus(r.status)}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#666666] font-normal">
                            <span>{r.category}</span>
                            <span>•</span>
                            <span>Max ₦{Number(r.maxBudget).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end shrink-0">
                          <a
                            href={`http://localhost:5180/?token=${r.publicToken}&view=offers`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-3 rounded-[5px] bg-white hover:bg-[#FAF9F6] text-xs font-normal text-[#10393b] flex items-center justify-center gap-1.5 transition-all"
                          >
                            <span>View</span>
                            <ChevronRightIcon className="w-3.5 h-3.5 text-[#777777]" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VENDORS */}
          {currentTab === 'sellers' && (
            <div key="sellers" className="space-y-6 animate-chat-morph">
              <div className="bg-white rounded-[10px] p-6 flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Vendors
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddSellerModal(true)}
                  className="text-xs"
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-1" />
                  <span>Add Vendor</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-[10px] p-5 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-normal text-sm text-[#10393b]">
                          {s.businessName}
                        </span>
                        <span className="text-xs font-normal px-2 py-0.5 rounded-[3px] bg-emerald-50 text-emerald-800">
                          ★ {s.rating}
                        </span>
                      </div>

                      <div className="text-xs text-[#666666] space-y-1 mb-4 font-normal">
                        <p>{s.contactName}</p>
                        <p className="font-mono text-[#10393b]">{s.whatsappNumber}</p>
                        <p>{s.completedDeals} deals</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 bg-[#eceae2] -mx-5 -mb-5 px-5 py-3 rounded-b-[10px]">
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
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DEALS */}
          {currentTab === 'deals' && (
            <div key="deals" className="bg-white rounded-[10px] p-6 sm:p-8 space-y-6 animate-chat-morph">
              <div>
                <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Completed Deals
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-[8px] bg-[#eceae2]">
                  <span className="block text-xs font-normal text-[#777777] uppercase">
                    Deals Closed
                  </span>
                  <span className="text-2xl font-normal text-[#10393b] font-mono mt-1 block">
                    {metrics ? metrics.completedDealsCount : 1}
                  </span>
                </div>
                <div className="p-5 rounded-[8px] bg-[#eceae2]">
                  <span className="block text-xs font-normal text-[#777777] uppercase">
                    Total Sales
                  </span>
                  <span className="text-2xl font-normal text-emerald-700 font-mono mt-1 block">
                    ₦{metrics ? Number(metrics.totalVolume).toLocaleString() : '620,000'}
                  </span>
                </div>
                <div className="p-5 rounded-[8px] bg-[#eceae2]">
                  <span className="block text-xs font-normal text-[#777777] uppercase">
                    Earnings
                  </span>
                  <span className="text-2xl font-normal text-[#10393b] font-mono mt-1 block">
                    ₦{metrics ? Number(metrics.totalCommissions).toLocaleString() : '31,000'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md h-16 flex items-center justify-around z-30 md:hidden px-2">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-black/10 text-[#0f2d2e] font-medium'
              : 'text-[#10393b]/60 hover:text-[#10393b]'
          }`}
        >
          <Squares2X2Icon className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentTab('reviews')}
          className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] transition-all cursor-pointer ${
            currentTab === 'reviews'
              ? 'bg-black/10 text-[#0f2d2e] font-medium'
              : 'text-[#10393b]/60 hover:text-[#10393b]'
          }`}
        >
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
          <span className="text-[10px]">Reviews</span>
          {reviews.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#ffad24]" />
          )}
        </button>

        <button
          onClick={() => setCurrentTab('requests')}
          className={`relative flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] transition-all cursor-pointer ${
            currentTab === 'requests'
              ? 'bg-black/10 text-[#0f2d2e] font-medium'
              : 'text-[#10393b]/60 hover:text-[#10393b]'
          }`}
        >
          <ListBulletIcon className="w-5 h-5" />
          <span className="text-[10px]">Requests</span>
          {requests.length > 0 && (
            <span className="absolute top-1 right-2 text-[9px] font-mono px-1 rounded-full bg-black/10 text-[#10393b]">
              {requests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('sellers')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] transition-all cursor-pointer ${
            currentTab === 'sellers'
              ? 'bg-black/10 text-[#0f2d2e] font-medium'
              : 'text-[#10393b]/60 hover:text-[#10393b]'
          }`}
        >
          <UserGroupIcon className="w-5 h-5" />
          <span className="text-[10px]">Vendors</span>
        </button>

        <button
          onClick={() => setCurrentTab('deals')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] transition-all cursor-pointer ${
            currentTab === 'deals'
              ? 'bg-black/10 text-[#0f2d2e] font-medium'
              : 'text-[#10393b]/60 hover:text-[#10393b]'
          }`}
        >
          <BanknotesIcon className="w-5 h-5" />
          <span className="text-[10px]">Deals</span>
        </button>
      </nav>

      {/* INSPECT & APPROVE MODAL */}
      {activeReview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar p-6 sm:p-7 space-y-6 animate-chat-morph">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-normal px-2 py-0.5 rounded-[3px] bg-[#eceae2] text-[#10393b]">
                  {activeReview.requestToken}
                </span>
                <h3 className="text-base font-normal text-[#10393b] mt-2">
                  Review Offer: {activeReview.brand} {activeReview.model}
                </h3>
              </div>
              <button
                onClick={() => setActiveReview(null)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[6px] bg-[#eceae2] space-y-2">
                <span className="block text-[11px] font-normal text-[#777777] uppercase tracking-wider">
                  Seller Message
                </span>
                <p className="text-xs text-[#333333] font-normal">
                  {activeReview.rawMessages.join(' ') || 'Device specs provided.'}
                </p>
                {activeReview.audioTranscript && (
                  <p className="text-xs text-[#10393b] bg-[#30c5ce]/10 p-2.5 rounded-[6px] font-normal">
                    Voice Note: &quot;{activeReview.audioTranscript}&quot;
                  </p>
                )}
              </div>

              <div className="p-4 rounded-[6px] bg-[#ffad24]/10 space-y-2">
                <span className="block text-[11px] font-normal text-[#ffad24] uppercase tracking-wider">
                  Notes
                </span>
                <p className="text-xs text-[#333333] font-normal">
                  {activeReview.flagReason || 'Requires manual confirmation'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="block text-xs font-normal text-[#777777] uppercase tracking-wider">
                Price & Condition
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs text-[#555555] mb-1.5 font-normal">Price (₦)</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm font-mono font-normal text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                  />
                </div>
                <div>
                  <span className="block text-xs text-[#555555] mb-1.5 font-normal">Condition</span>
                  <input
                    type="text"
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                variant="ghost"
                size="md"
                onClick={handleRejectReview}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleApproveReview}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSeller}
            className="bg-white rounded-[10px] w-full max-w-md p-6 sm:p-7 space-y-4 animate-chat-morph"
          >
            <h3 className="text-base font-normal text-[#10393b]">
              Add Vendor
            </h3>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Business Name</span>
              <input
                required
                type="text"
                placeholder="e.g. Apex Gadgets Hub"
                value={newSellerName}
                onChange={(e) => setNewSellerName(e.target.value)}
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
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
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
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
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
              />
            </div>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Telegram (Optional)</span>
              <input
                type="text"
                placeholder="e.g. @jerus_tech"
                value={newSellerTelegram}
                onChange={(e) => setNewSellerTelegram(e.target.value)}
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
              />
            </div>
            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Category</span>
              <select
                value={newSellerCategory}
                onChange={(e) => setNewSellerCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal cursor-pointer border-0"
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
