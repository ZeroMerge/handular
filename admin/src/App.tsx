import React, { useState, useEffect } from 'react';
import {
  Squares2X2Icon,
  ClipboardDocumentCheckIcon,
  ListBulletIcon,
  UserGroupIcon,
  BanknotesIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ShieldCheckIcon,
  MapPinIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from './components/ui/icons';
import { DashboardMetrics, AdminRequestItem, ReviewItem, SellerRecord, AuditLogItem, DealRecord } from './types';
import { Button } from './components/ui/button';
import { AdminLogin } from './components/AdminLogin';
import { CustomDropdown, DropdownOption } from './components/ui/CustomDropdown';

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

type NavTab = 'dashboard' | 'reviews' | 'requests' | 'sellers' | 'deals' | 'audit';

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'LAPTOPS', label: 'Laptops' },
  { value: 'PHONES', label: 'Phones' },
  { value: 'ACCESSORIES', label: 'Accessories' },
];

const STATUS_OPTIONS: DropdownOption[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'OPEN', label: 'Active' },
  { value: 'BROADCASTED', label: 'Sourcing' },
  { value: 'OFFERS_READY', label: 'Offers Ready' },
  { value: 'DEAL_LOCKED', label: 'Matched' },
];

const MODAL_CATEGORY_OPTIONS: DropdownOption[] = [
  { value: 'LAPTOPS', label: 'Laptops' },
  { value: 'PHONES', label: 'Phones' },
  { value: 'ACCESSORIES', label: 'Accessories' },
];

const TIER_OPTIONS: DropdownOption[] = [
  { value: 'TIER_1_VERIFIED', label: 'Tier-1 Verified (Physical Stall)' },
  { value: 'BASIC', label: 'Basic Vendor' },
];

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
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('handular_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('handular_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Filter states on requests page
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // In-admin Request Details Modal (no client app redirect!)
  const [selectedRequest, setSelectedRequest] = useState<AdminRequestItem | null>(null);

  // Review modal state
  const [activeReview, setActiveReview] = useState<ReviewItem | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editGrade, setEditGrade] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectBox, setShowRejectBox] = useState<boolean>(false);

  // Deals page state
  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);
  const [dealsFilter, setDealsFilter] = useState<'ALL' | 'IN_PROGRESS' | 'INSPECTION' | 'SUCCESSFUL' | 'DISPUTED'>('ALL');
  const [disputeInput, setDisputeInput] = useState('');
  const [showDisputeBox, setShowDisputeBox] = useState(false);

  // New seller modal state
  const [showAddSellerModal, setShowAddSellerModal] = useState(false);
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerContact, setNewSellerContact] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('');
  const [newSellerTelegram, setNewSellerTelegram] = useState('');
  const [newSellerCategory, setNewSellerCategory] = useState<'LAPTOPS' | 'PHONES' | 'ACCESSORIES'>('LAPTOPS');
  const [newSellerLocation, setNewSellerLocation] = useState('');
  const [newSellerTier, setNewSellerTier] = useState<'BASIC' | 'TIER_1_VERIFIED'>('TIER_1_VERIFIED');
  const [newSellerStallPhoto, setNewSellerStallPhoto] = useState('');
  const [newSellerNin, setNewSellerNin] = useState('');
  const [newSellerBankName, setNewSellerBankName] = useState('');
  const [newSellerAccountNumber, setNewSellerAccountNumber] = useState('');
  const [newSellerAccountName, setNewSellerAccountName] = useState('');

  // Edit seller modal state
  const [editingSeller, setEditingSeller] = useState<SellerRecord | null>(null);
  const [editSellerName, setEditSellerName] = useState('');
  const [editSellerContact, setEditSellerContact] = useState('');
  const [editSellerPhone, setEditSellerPhone] = useState('');
  const [editSellerTelegram, setEditSellerTelegram] = useState('');
  const [editSellerCategory, setEditSellerCategory] = useState<'LAPTOPS' | 'PHONES' | 'ACCESSORIES'>('LAPTOPS');
  const [editSellerLocation, setEditSellerLocation] = useState('');
  const [editSellerTier, setEditSellerTier] = useState<'BASIC' | 'TIER_1_VERIFIED'>('TIER_1_VERIFIED');
  const [editSellerStallPhoto, setEditSellerStallPhoto] = useState('');
  const [editSellerNin, setEditSellerNin] = useState('');
  const [editSellerBankName, setEditSellerBankName] = useState('');
  const [editSellerAccountNumber, setEditSellerAccountNumber] = useState('');
  const [editSellerAccountName, setEditSellerAccountName] = useState('');

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [metricsRes, requestsRes, reviewsRes, sellersRes, dealsRes, auditRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/admin/metrics`),
        fetch(`${API_BASE_URL}/api/v1/admin/requests`),
        fetch(`${API_BASE_URL}/api/v1/admin/reviews`),
        fetch(`${API_BASE_URL}/api/v1/admin/sellers`),
        fetch(`${API_BASE_URL}/api/v1/admin/deals`),
        fetch(`${API_BASE_URL}/api/v1/admin/audit-logs`),
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
      if (dealsRes.ok) {
        const d = await dealsRes.json();
        setDeals(d.data || []);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(d.data || []);
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
    setRejectReason('');
    setShowRejectBox(false);
  };

  const handleApproveReview = async () => {
    if (!activeReview) return;
    const reviewToApprove = activeReview;
    const finalPrice = editPrice || reviewToApprove.price;
    const finalGrade = editGrade || reviewToApprove.conditionGrade;

    // Real-Time Optimistic UI Updates:
    setReviews((prev) => prev.filter((r) => r.id !== reviewToApprove.id));
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === reviewToApprove.requestId || req.publicToken === reviewToApprove.requestToken) {
          return {
            ...req,
            pendingReviews: Math.max(0, (req.pendingReviews || 1) - 1),
            offersReceived: (req.offersReceived || 0) + 1,
            status: 'OFFERS_READY',
          };
        }
        return req;
      })
    );
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'OFFER_APPROVED',
        actor: adminUser?.email || 'admin@handular.com',
        entityType: 'OFFER',
        entityId: reviewToApprove.id,
        details: `Approved offer ${reviewToApprove.brand} ${reviewToApprove.model} (₦${Number(finalPrice).toLocaleString()}) - Published to student`,
      },
      ...prev,
    ]);
    setActiveReview(null);
    setShowRejectBox(false);
    setActionMessage(`Offer for ${reviewToApprove.brand} ${reviewToApprove.model} approved & published in real time!`);

    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/reviews/${reviewToApprove.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: finalPrice,
          conditionGrade: finalGrade,
        }),
      });
      fetchDashboardData();
    } catch (e) {
      console.warn('Real-time approval sync:', e);
    }
  };

  const handleRejectReview = async (customReason?: string) => {
    if (!activeReview) return;
    const reviewToReject = activeReview;
    const finalReason = customReason || rejectReason || 'Device specifications or condition do not meet student requirements';

    // Real-Time Optimistic UI Updates:
    setReviews((prev) => prev.filter((r) => r.id !== reviewToReject.id));
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === reviewToReject.requestId || req.publicToken === reviewToReject.requestToken) {
          return {
            ...req,
            pendingReviews: Math.max(0, (req.pendingReviews || 1) - 1),
          };
        }
        return req;
      })
    );
    setAuditLogs((prev) => [
      {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'OFFER_DECLINED',
        actor: adminUser?.email || 'admin@handular.com',
        entityType: 'OFFER',
        entityId: reviewToReject.id,
        details: `Declined offer ${reviewToReject.brand} ${reviewToReject.model} - Reason: ${finalReason}`,
      },
      ...prev,
    ]);
    setActiveReview(null);
    setShowRejectBox(false);
    setActionMessage(`Offer declined and seller notified in real time.`);

    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/reviews/${reviewToReject.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: finalReason,
        }),
      });
      fetchDashboardData();
    } catch (e) {
      console.warn('Real-time decline sync:', e);
    }
  };

  const handleRebroadcast = async (requestId: string) => {
    // Real-Time Optimistic UI Update:
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            sellersBroadcasted: (r.sellersBroadcasted || 0) + 2,
            status: 'BROADCASTED',
          };
        }
        return r;
      })
    );
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest((prev) =>
        prev
          ? {
              ...prev,
              sellersBroadcasted: (prev.sellersBroadcasted || 0) + 2,
              status: 'BROADCASTED',
            }
          : null
      );
    }
    setActionMessage('Request re-broadcasted to verified campus sellers in real time!');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/requests/${requestId}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setActionMessage(data.message);
      }
      fetchDashboardData();
    } catch (e) {
      console.warn('Re-broadcast sync:', e);
    }
  };

  const handleSimulateOffer = async (requestId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/requests/${requestId}/simulate-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setActionMessage(data.message);
        fetchDashboardData();
      }
    } catch (e) {
      console.warn('Simulate offer error:', e);
    }
  };

  const handleUpdateDealStage = async (dealId: string, stage: string, disputeReason?: string) => {
    // Real-Time Optimistic UI Update:
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === dealId) {
          return {
            ...d,
            status: stage as any,
            disputeReason: disputeReason || d.disputeReason,
          };
        }
        return d;
      })
    );
    setSelectedDeal(null);
    setDisputeInput('');
    setShowDisputeBox(false);
    setActionMessage(`Deal moved to ${stage === 'INSPECTION' ? 'Campus Desk Inspection' : stage === 'SUCCESSFUL' ? 'Completed & Paid' : stage} in real time.`);

    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/deals/${dealId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          disputeReason: disputeReason || undefined,
        }),
      });
      fetchDashboardData();
    } catch (e) {
      console.warn('Deal stage sync:', e);
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
          physicalLocation: newSellerLocation || undefined,
          verificationTier: newSellerTier,
          stallPhoto: newSellerStallPhoto || undefined,
          ninOrId: newSellerNin || undefined,
          bankName: newSellerBankName || undefined,
          accountNumber: newSellerAccountNumber || undefined,
          accountName: newSellerAccountName || undefined,
        }),
      });
      if (res.ok) {
        setShowAddSellerModal(false);
        setNewSellerName('');
        setNewSellerContact('');
        setNewSellerPhone('');
        setNewSellerTelegram('');
        setNewSellerLocation('');
        setNewSellerTier('TIER_1_VERIFIED');
        setNewSellerStallPhoto('');
        setNewSellerNin('');
        setNewSellerBankName('');
        setNewSellerAccountNumber('');
        setNewSellerAccountName('');
        setActionMessage('Verified vendor registered.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditSeller = (seller: SellerRecord) => {
    setEditingSeller(seller);
    setEditSellerName(seller.businessName);
    setEditSellerContact(seller.contactName);
    setEditSellerPhone(seller.whatsappNumber);
    setEditSellerTelegram(seller.telegramHandle || '');
    setEditSellerCategory((seller.categories[0] as any) || 'LAPTOPS');
    setEditSellerLocation(seller.physicalLocation || '');
    setEditSellerTier(seller.verificationTier || 'TIER_1_VERIFIED');
    setEditSellerStallPhoto(seller.stallPhoto || '');
    setEditSellerNin(seller.ninOrId || '');
    setEditSellerBankName(seller.bankName || '');
    setEditSellerAccountNumber(seller.accountNumber || '');
    setEditSellerAccountName(seller.accountName || '');
  };

  const handleUpdateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/sellers/${editingSeller.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: editSellerName,
          contactName: editSellerContact,
          whatsappNumber: editSellerPhone,
          telegramHandle: editSellerTelegram || undefined,
          categories: [editSellerCategory],
          physicalLocation: editSellerLocation || undefined,
          verificationTier: editSellerTier,
          stallPhoto: editSellerStallPhoto || undefined,
          ninOrId: editSellerNin || undefined,
          bankName: editSellerBankName || undefined,
          accountNumber: editSellerAccountNumber || undefined,
          accountName: editSellerAccountName || undefined,
        }),
      });
      if (res.ok) {
        setEditingSeller(null);
        setActionMessage('Vendor profile updated.');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    const matchCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchCat && matchStatus;
  });

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
      {/* Sidebar - STICKY, NON-SCROLLABLE, COLLAPSIBLE (ICON-ONLY / LOGO-ONLY MODE) */}
      <aside
        className={`bg-white flex flex-col justify-between hidden md:flex shrink-0 sticky top-0 h-screen overflow-hidden transition-all duration-200 select-none ${
          isSidebarCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div>
          {/* Top Brand Logo / Header */}
          {isSidebarCollapsed ? (
            <div className="h-16 flex items-center justify-center">
              <button
                onClick={toggleSidebar}
                className="cursor-pointer p-1.5 rounded-[6px] hover:bg-[#eceae2] transition-colors"
                title="Expand sidebar"
              >
                <img
                  src="/handular_icon.png"
                  alt="Handular"
                  className="w-8 h-8 max-w-[32px] rounded-[6px] object-contain"
                />
              </button>
            </div>
          ) : (
            <div className="h-16 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/handular_icon.png"
                  alt="Handular"
                  className="w-8 h-8 max-w-[32px] rounded-[6px] object-contain"
                />
                <span className="text-sm font-medium tracking-tight text-[#10393b]">
                  Handular
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#888888] hover:text-[#10393b] hover:bg-[#eceae2] transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className={isSidebarCollapsed ? 'px-2 pt-2 space-y-1.5' : 'px-3 pt-2 space-y-1'}>
            {/* Dashboard */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => setCurrentTab('dashboard')}
                title="Dashboard"
                className={`w-10 h-10 mx-auto rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-black/10 text-[#0f2d2e]'
                    : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b]'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            ) : (
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
              </button>
            )}

            {/* Reviews */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => setCurrentTab('reviews')}
                title={`Reviews${reviews.length > 0 ? ` (${reviews.length} pending)` : ''}`}
                className={`w-10 h-10 mx-auto rounded-[6px] flex items-center justify-center transition-all cursor-pointer relative ${
                  currentTab === 'reviews'
                    ? 'bg-black/10 text-[#0f2d2e]'
                    : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b]'
                }`}
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                {reviews.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ffad24]" />
                )}
              </button>
            ) : (
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
                {reviews.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-[3px] text-[10px] font-normal bg-[#ffad24]/20 text-[#ffad24]">
                    {reviews.length}
                  </span>
                )}
              </button>
            )}

            {/* Requests */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => setCurrentTab('requests')}
                title={`Requests (${requests.length})`}
                className={`w-10 h-10 mx-auto rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
                  currentTab === 'requests'
                    ? 'bg-black/10 text-[#0f2d2e]'
                    : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b]'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            ) : (
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
                <span className="text-[11px] font-mono text-[#888888]">
                  {requests.length}
                </span>
              </button>
            )}

            {/* Vendors */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => setCurrentTab('sellers')}
                title={`Vendors (${sellers.length})`}
                className={`w-10 h-10 mx-auto rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
                  currentTab === 'sellers'
                    ? 'bg-black/10 text-[#0f2d2e]'
                    : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b]'
                }`}
              >
                <UserGroupIcon className="w-4 h-4" />
              </button>
            ) : (
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
                <span className="text-[11px] font-mono text-[#888888]">
                  {sellers.length}
                </span>
              </button>
            )}

            {/* Deals */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => setCurrentTab('deals')}
                title="Deals"
                className={`w-10 h-10 mx-auto rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
                  currentTab === 'deals'
                    ? 'bg-black/10 text-[#0f2d2e]'
                    : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b]'
                }`}
              >
                <BanknotesIcon className="w-4 h-4" />
              </button>
            ) : (
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
              </button>
            )}

            {/* Audit Log */}
            {isSidebarCollapsed ? (
              <button
                onClick={() => setCurrentTab('audit')}
                title="Audit Log"
                className={`w-10 h-10 mx-auto rounded-[6px] flex items-center justify-center transition-all cursor-pointer ${
                  currentTab === 'audit'
                    ? 'bg-black/10 text-[#0f2d2e]'
                    : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b]'
                }`}
              >
                <ClockIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('audit')}
                className={`w-full h-9 px-3 rounded-[6px] text-xs flex items-center justify-between transition-all cursor-pointer ${
                  currentTab === 'audit'
                    ? 'bg-black/10 text-[#0f2d2e] font-medium'
                    : 'text-[#10393b]/70 hover:bg-[#eceae2] hover:text-[#10393b] font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClockIcon className="w-4 h-4" />
                  <span>Audit Log</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Clean Sidebar Footer */}
        {isSidebarCollapsed ? (
          <div className="p-3 text-[11px] text-[#888888] flex justify-center">
            <button
              onClick={handleSignOut}
              className="w-10 h-10 rounded-[6px] flex items-center justify-center text-[#888888] hover:text-red-600 hover:bg-[#eceae2] transition-colors cursor-pointer"
              title={`Sign Out (${adminUser.email})`}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
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
        )}
      </aside>

      {/* Main Content Area - ZERO TOP HEADER BAR */}
      <div className="flex-1 flex flex-col min-w-0">
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
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Dashboard
                </h1>
              </div>

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
                            <button
                              type="button"
                              onClick={() => setSelectedRequest(req)}
                              className="h-8 px-3 rounded-[5px] bg-white hover:bg-[#FAF9F6] text-xs font-normal text-[#10393b] flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span>View</span>
                              <ChevronRightIcon className="w-3.5 h-3.5 text-[#777777]" />
                            </button>
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

          {/* TAB 3: REQUESTS - NO GLOBAL VENDOR BUTTON, CLEAN FILTERS */}
          {currentTab === 'requests' && (
            <div key="requests" className="bg-white rounded-[10px] p-6 space-y-5 animate-chat-morph">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Requests
                </h2>

                {/* Customized Clean Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="w-40 sm:w-44">
                    <CustomDropdown
                      options={CATEGORY_OPTIONS}
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                      buttonHeightClass="h-9"
                    />
                  </div>

                  <div className="w-36 sm:w-40">
                    <CustomDropdown
                      options={STATUS_OPTIONS}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      buttonHeightClass="h-9"
                    />
                  </div>
                </div>
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
                ) : filteredRequests.length === 0 ? (
                  <div className="p-10 text-center text-xs text-[#888888] font-normal">
                    No requests match the selected filters.
                  </div>
                ) : (
                  filteredRequests.map((r) => (
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

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] font-normal">
                            <span>{r.category}</span>
                            <span>•</span>
                            <span>Max ₦{Number(r.maxBudget).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-[#10393b] font-medium">{r.offersReceived} {r.offersReceived === 1 ? 'Offer' : 'Offers'}</span>
                            {r.pendingReviews > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rev = reviews.find((item) => item.requestId === r.id || item.requestToken === r.publicToken);
                                  if (rev) handleOpenReview(rev);
                                  else setCurrentTab('reviews');
                                }}
                                className="px-2 py-0.5 rounded-[4px] bg-[#ffad24]/20 text-[#b56e04] hover:bg-[#ffad24]/30 font-medium text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                title="Candidate offer waiting for admin review"
                              >
                                <ExclamationTriangleIcon className="w-3 h-3 text-[#b56e04]" />
                                <span>{r.pendingReviews} in Review</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* In-Admin View Details Button (No client app redirect!) */}
                        <div className="flex items-center justify-end shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(r)}
                            className="h-8 px-3 rounded-[5px] bg-white hover:bg-[#FAF9F6] text-xs font-normal text-[#10393b] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>View</span>
                            <ChevronRightIcon className="w-3.5 h-3.5 text-[#777777]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VENDORS - TALL ADD VENDOR BUTTON, VERIFICATION & PAYOUTS */}
          {currentTab === 'sellers' && (
            <div key="sellers" className="space-y-6 animate-chat-morph">
              <div className="bg-white rounded-[10px] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                    Vendors
                  </h2>
                  <p className="text-xs text-[#777777] font-normal mt-0.5">
                    Verified campus merchants, physical stall addresses, and escrow payout accounts
                  </p>
                </div>
                {/* Taller vertical padding matching client app */}
                <button
                  type="button"
                  onClick={() => setShowAddSellerModal(true)}
                  className="px-4 py-2.5 sm:py-3 bg-[#10393b] hover:bg-[#154b4d] text-white rounded-[6px] text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-none border-0"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Vendor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sellers.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-[10px] p-5 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-[#10393b]">
                          {s.businessName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-normal px-2 py-0.5 rounded-[3px] bg-emerald-50 text-emerald-800">
                            ★ {s.rating}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditSeller(s)}
                            className="p-1.5 rounded-[4px] hover:bg-[#eceae2] text-[#777777] hover:text-[#10393b] transition-colors cursor-pointer"
                            title="Edit Vendor"
                          >
                            <PencilSquareIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Tier Badge & Location */}
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-medium ${
                            s.verificationTier === 'TIER_1_VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-[#eceae2] text-[#555555]'
                          }`}>
                            <ShieldCheckIcon className="w-3 h-3 text-emerald-600" />
                            <span>{s.verificationTier === 'TIER_1_VERIFIED' ? 'Tier-1 Verified' : 'Basic Vendor'}</span>
                          </span>
                          <span className="text-[11px] text-[#777777]">{s.completedDeals} deals</span>
                        </div>

                        {s.physicalLocation && (
                          <div className="flex items-center gap-1 text-[11px] text-[#555555] font-normal">
                            <MapPinIcon className="w-3.5 h-3.5 text-[#10393b]/60 shrink-0" />
                            <span className="truncate">{s.physicalLocation}</span>
                          </div>
                        )}
                      </div>

                      {/* Payout Bank Details */}
                      <div className="p-2.5 rounded-[6px] bg-[#eceae2]/60 text-xs text-[#555555] space-y-0.5">
                        <span className="block text-[10px] text-[#888888] uppercase tracking-wider">
                          Escrow Payout
                        </span>
                        <div className="font-mono text-[#10393b] text-[11px]">
                          {s.bankName || 'Kuda Bank'} • {s.accountNumber || '2019481920'}
                        </div>
                        <div className="text-[10px] text-[#666666] truncate">
                          {s.accountName || s.businessName}
                        </div>
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

          {/* TAB 5: DEALS & DISPUTE MANAGEMENT */}
          {currentTab === 'deals' && (
            <div key="deals" className="bg-white rounded-[10px] p-6 sm:p-8 space-y-6 animate-chat-morph">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                    Deals & Escrow Settlements
                  </h2>
                  <p className="text-xs text-[#777777] font-normal mt-0.5">
                    Track device verification stages, campus drop-off handovers, and student dispute resolutions
                  </p>
                </div>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-[8px] bg-[#eceae2]">
                  <span className="block text-[11px] font-normal text-[#777777] uppercase tracking-wider">
                    Total Sourced
                  </span>
                  <span className="text-2xl font-normal text-[#10393b] font-mono mt-1 block">
                    {deals.length}
                  </span>
                </div>
                <div className="p-4 rounded-[8px] bg-[#eceae2]">
                  <span className="block text-[11px] font-normal text-[#777777] uppercase tracking-wider">
                    In Inspection
                  </span>
                  <span className="text-2xl font-normal text-blue-700 font-mono mt-1 block">
                    {deals.filter((d) => d.status === 'INSPECTION').length}
                  </span>
                </div>
                <div className="p-4 rounded-[8px] bg-[#eceae2]">
                  <span className="block text-[11px] font-normal text-[#777777] uppercase tracking-wider">
                    Completed & Paid
                  </span>
                  <span className="text-2xl font-normal text-emerald-700 font-mono mt-1 block">
                    {deals.filter((d) => d.status === 'SUCCESSFUL' || d.status === 'COMPLETED').length}
                  </span>
                </div>
                <div className="p-4 rounded-[8px] bg-[#eceae2]">
                  <span className="block text-[11px] font-normal text-[#777777] uppercase tracking-wider">
                    Disputed
                  </span>
                  <span className="text-2xl font-normal text-red-600 font-mono mt-1 block">
                    {deals.filter((d) => d.status === 'DISPUTED').length}
                  </span>
                </div>
              </div>

              {/* Deals Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#eceae2] pb-3">
                {[
                  { key: 'ALL', label: `All Deals (${deals.length})` },
                  { key: 'IN_PROGRESS', label: `Sourced / Reserved (${deals.filter((d) => d.status === 'IN_PROGRESS').length})` },
                  { key: 'INSPECTION', label: `In Inspection (${deals.filter((d) => d.status === 'INSPECTION').length})` },
                  { key: 'SUCCESSFUL', label: `Completed & Paid (${deals.filter((d) => d.status === 'SUCCESSFUL' || d.status === 'COMPLETED').length})` },
                  { key: 'DISPUTED', label: `Disputed (${deals.filter((d) => d.status === 'DISPUTED').length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDealsFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-[5px] text-xs font-normal transition-all cursor-pointer ${
                      dealsFilter === tab.key
                        ? 'bg-[#10393b] text-white'
                        : 'bg-[#eceae2] text-[#666666] hover:text-[#10393b]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Deals Data List */}
              <div className="space-y-3">
                {deals
                  .filter((d) => {
                    if (dealsFilter === 'ALL') return true;
                    if (dealsFilter === 'IN_PROGRESS') return d.status === 'IN_PROGRESS';
                    if (dealsFilter === 'INSPECTION') return d.status === 'INSPECTION';
                    if (dealsFilter === 'SUCCESSFUL') return d.status === 'SUCCESSFUL' || d.status === 'COMPLETED';
                    if (dealsFilter === 'DISPUTED') return d.status === 'DISPUTED';
                    return true;
                  })
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 sm:p-5 rounded-[8px] bg-[#eceae2] hover:bg-[#e4e1d7] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-normal text-[#10393b] bg-white px-2 py-0.5 rounded-[3px]">
                            #{deal.offer?.request?.publicToken || deal.id.slice(0, 8)}
                          </span>
                          <span className="text-sm font-medium text-[#10393b]">
                            {deal.offer?.brand} {deal.offer?.model}
                          </span>
                          <span className="text-xs text-[#666666]">
                            • {deal.offer?.conditionGrade}
                          </span>
                          {/* Stage Pill */}
                          <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-normal inline-flex items-center gap-1 ${
                            deal.status === 'SUCCESSFUL' || deal.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : deal.status === 'DISPUTED'
                              ? 'bg-red-100 text-red-800'
                              : deal.status === 'INSPECTION'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              deal.status === 'SUCCESSFUL' || deal.status === 'COMPLETED'
                                ? 'bg-emerald-600'
                                : deal.status === 'DISPUTED'
                                ? 'bg-red-600'
                                : deal.status === 'INSPECTION'
                                ? 'bg-blue-600'
                                : 'bg-amber-600'
                            }`} />
                            <span>
                              {deal.status === 'SUCCESSFUL' || deal.status === 'COMPLETED'
                                ? 'Completed & Paid'
                                : deal.status === 'DISPUTED'
                                ? 'Disputed'
                                : deal.status === 'INSPECTION'
                                ? 'Inspection in Progress'
                                : 'Deal Sourced'}
                            </span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#555555]">
                          <span>Student: <strong>{deal.offer?.request?.buyerName}</strong> ({deal.offer?.request?.buyerPhone})</span>
                          <span>•</span>
                          <span>Vendor: <strong>{deal.offer?.seller?.businessName}</strong> ({deal.offer?.seller?.physicalLocation || 'Campus Store'})</span>
                        </div>

                        {deal.status === 'DISPUTED' && deal.disputeReason && (
                          <div className="text-xs text-red-700 bg-red-100/60 p-2.5 rounded-[5px] mt-1 flex items-start gap-1.5">
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>Dispute Reason: &quot;{deal.disputeReason}&quot;</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <span className="block text-[10px] text-[#777777] uppercase font-normal">
                            Agreed Price
                          </span>
                          <span className="text-base font-normal font-mono text-[#10393b]">
                            ₦{Number(deal.finalAgreedPrice).toLocaleString()}
                          </span>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedDeal(deal);
                            setDisputeInput(deal.disputeReason || '');
                            setShowDisputeBox(false);
                          }}
                        >
                          <span>Manage</span>
                          <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 6: IMMUTABLE AUDIT LOG */}
          {currentTab === 'audit' && (
            <div key="audit" className="bg-white rounded-[10px] p-6 space-y-5 animate-chat-morph">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-normal text-[#10393b]">
                  Audit Log
                </h2>
              </div>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-[6px] bg-[#eceae2] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-mono font-medium ${
                          log.action.includes('APPROVED')
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action.includes('DECLINED')
                            ? 'bg-red-100 text-red-800'
                            : 'bg-black/10 text-[#10393b]'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-[#333333] font-normal">
                          {log.details}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#777777] font-mono">
                        Actor: {log.actor}
                      </div>
                    </div>

                    <div className="text-[11px] text-[#888888] font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
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

        <button
          onClick={() => setCurrentTab('audit')}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2.5 rounded-[6px] transition-all cursor-pointer ${
            currentTab === 'audit'
              ? 'bg-black/10 text-[#0f2d2e] font-medium'
              : 'text-[#10393b]/60 hover:text-[#10393b]'
          }`}
        >
          <ClockIcon className="w-5 h-5" />
          <span className="text-[10px]">Audit</span>
        </button>
      </nav>

      {/* IN-ADMIN REQUEST DETAILS MODAL (NO REDIRECT TO CLIENT APP) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-lg p-6 sm:p-7 space-y-5 animate-chat-morph max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-normal px-2.5 py-1 rounded-[3px] bg-[#eceae2] text-[#10393b]">
                  {selectedRequest.publicToken}
                </span>
                <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-normal ${
                  selectedRequest.status === 'OFFERS_READY'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#eceae2] text-[#10393b]'
                }`}>
                  {getFriendlyStatus(selectedRequest.status)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-[6px] bg-[#eceae2] space-y-1">
                <span className="block text-[11px] text-[#777777] uppercase tracking-wider">
                  Buyer Information
                </span>
                <p className="text-sm font-medium text-[#10393b]">
                  {selectedRequest.buyerName}
                </p>
                <p className="text-xs font-mono text-[#666666]">
                  {selectedRequest.buyerPhone}
                </p>
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#eceae2] space-y-1">
                <span className="block text-[11px] text-[#777777] uppercase tracking-wider">
                  Request Requirements
                </span>
                <div className="flex items-center justify-between text-xs text-[#10393b]">
                  <span>Category: {selectedRequest.category}</span>
                  <span className="font-mono font-medium">Max ₦{Number(selectedRequest.maxBudget).toLocaleString()}</span>
                </div>
                {selectedRequest.targetSpecs && Object.keys(selectedRequest.targetSpecs).length > 0 && (
                  <div className="text-xs text-[#555555] pt-1 space-y-0.5">
                    {selectedRequest.targetSpecs.brand && <div>Brand: <strong>{selectedRequest.targetSpecs.brand}</strong></div>}
                    {selectedRequest.targetSpecs.useCase && <div>Use case: {selectedRequest.targetSpecs.useCase}</div>}
                    {selectedRequest.targetSpecs.notes && <div>Notes: {selectedRequest.targetSpecs.notes}</div>}
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#eceae2] flex items-center justify-between text-xs text-[#555555]">
                <span>Sellers Contacted: {selectedRequest.sellersBroadcasted}</span>
                <span>Offers Received: {selectedRequest.offersReceived}</span>
              </div>

              {/* Candidate Offers Pending Admin Review */}
              {reviews.filter((r) => r.requestId === selectedRequest.id || r.requestToken === selectedRequest.publicToken).length > 0 && (
                <div className="p-3.5 rounded-[6px] bg-[#ffad24]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#b56e04] uppercase tracking-wider flex items-center gap-1.5">
                      <ExclamationTriangleIcon className="w-3.5 h-3.5 text-[#b56e04]" />
                      Candidate Offers Awaiting Review
                    </span>
                    <span className="text-xs font-mono font-medium text-[#b56e04]">
                      {reviews.filter((r) => r.requestId === selectedRequest.id || r.requestToken === selectedRequest.publicToken).length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {reviews
                      .filter((r) => r.requestId === selectedRequest.id || r.requestToken === selectedRequest.publicToken)
                      .map((rev) => (
                        <div key={rev.id} className="p-2.5 rounded-[5px] bg-white flex items-center justify-between gap-2">
                          <div className="text-xs">
                            <span className="font-medium text-[#10393b]">{rev.brand} {rev.model}</span>
                            <span className="text-[#666666]"> • ₦{Number(rev.price).toLocaleString()}</span>
                            <div className="text-[10px] text-[#888888]">{rev.sellerName}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(null);
                              handleOpenReview(rev);
                            }}
                            className="h-7 px-2.5 rounded-[4px] bg-[#10393b] text-white hover:bg-[#154b4d] text-xs font-normal cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#eceae2]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRebroadcast(selectedRequest.id)}
                  className="h-8 px-3 rounded-[5px] bg-[#eceae2] hover:bg-[#e4e1d7] text-xs font-normal text-[#10393b] flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Send notification to matching vendors on WhatsApp/Telegram"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  <span>Re-broadcast to Vendors</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateOffer(selectedRequest.id)}
                  className="h-8 px-3 rounded-[5px] bg-[#10393b] hover:bg-[#154b4d] text-xs font-normal text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Simulate incoming offer from a vendor"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Test Vendor Offer</span>
                </button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEXTUAL SIDE-BY-SIDE REVIEW MODAL */}
      {activeReview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar p-6 sm:p-7 space-y-5 animate-chat-morph">
            <div className="flex items-center justify-between border-b border-[#eceae2] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-normal px-2 py-0.5 rounded-[3px] bg-[#eceae2] text-[#10393b]">
                  #{activeReview.requestToken}
                </span>
                <h3 className="text-base font-normal text-[#10393b]">
                  Candidate Offer Review: {activeReview.brand} {activeReview.model}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReview(null)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* 2-Column Side-by-Side: Student Requirements vs Vendor Offer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* LEFT COLUMN: Student Request Requirements */}
              <div className="p-4 rounded-[8px] bg-[#eceae2] space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#dcdad2] pb-2">
                    <span className="text-[11px] font-normal uppercase tracking-wider text-[#777777]">
                      Student Request
                    </span>
                    <span className="font-mono text-xs text-[#10393b] font-medium">
                      Max ₦{Number(activeReview.maxBudget || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-[#777777]">Student Name</div>
                    <div className="text-sm font-medium text-[#10393b]">{activeReview.buyerName}</div>
                    {activeReview.buyerPhone && (
                      <div className="text-xs font-mono text-[#666666]">{activeReview.buyerPhone}</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-[#777777]">Category</div>
                    <div className="text-xs font-medium text-[#10393b]">{activeReview.category || 'LAPTOPS'}</div>
                  </div>

                  {activeReview.targetSpecs && Object.keys(activeReview.targetSpecs).length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#dcdad2]">
                      <div className="text-[11px] text-[#777777] uppercase tracking-wider">Target Specifications</div>
                      <div className="p-2.5 rounded-[5px] bg-white text-xs space-y-1 text-[#333333]">
                        {activeReview.targetSpecs.brand && <div>Brand: <strong>{activeReview.targetSpecs.brand}</strong></div>}
                        {activeReview.targetSpecs.useCase && <div>Use: {activeReview.targetSpecs.useCase}</div>}
                        {activeReview.targetSpecs.notes && <div>Notes: {activeReview.targetSpecs.notes}</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-[5px] bg-white/70 text-[11px] text-[#666666]">
                  Review this device against student budget and quality expectations before approving.
                </div>
              </div>

              {/* RIGHT COLUMN: Vendor Proposed Offer & Extracted Specs */}
              <div className="p-4 rounded-[8px] bg-[#f5f4ef] space-y-3">
                <div className="flex items-center justify-between border-b border-[#dcdad2] pb-2">
                  <span className="text-[11px] font-normal uppercase tracking-wider text-[#777777]">
                    Vendor Candidate Offer
                  </span>
                  <span className="text-xs text-emerald-800 font-medium">
                    {activeReview.sellerName}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-[#10393b]">
                    {activeReview.brand} {activeReview.model}
                  </div>
                  <div className="text-xs text-[#666666]">
                    Vendor Contact: {activeReview.sellerPhone}
                  </div>
                </div>

                {/* Specs List */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeReview.specs?.cpu && (
                    <div className="p-2 rounded-[5px] bg-white text-[#333333]">
                      <span className="block text-[10px] text-[#888888]">CPU</span>
                      <span className="truncate">{activeReview.specs.cpu}</span>
                    </div>
                  )}
                  {activeReview.specs?.ram && (
                    <div className="p-2 rounded-[5px] bg-white text-[#333333]">
                      <span className="block text-[10px] text-[#888888]">RAM</span>
                      <span className="truncate">{activeReview.specs.ram}</span>
                    </div>
                  )}
                  {activeReview.specs?.storage && (
                    <div className="p-2 rounded-[5px] bg-white text-[#333333]">
                      <span className="block text-[10px] text-[#888888]">Storage</span>
                      <span className="truncate">{activeReview.specs.storage}</span>
                    </div>
                  )}
                  {activeReview.specs?.batteryHealth && (
                    <div className="p-2 rounded-[5px] bg-white text-[#10393b]">
                      <span className="block text-[10px] text-[#888888]">Battery</span>
                      <span>🔋 {activeReview.specs.batteryHealth}</span>
                    </div>
                  )}
                </div>

                {/* Photo Previews */}
                {activeReview.cloudinaryPhotos && activeReview.cloudinaryPhotos.length > 0 && (
                  <div>
                    <span className="block text-[10px] text-[#888888] uppercase tracking-wider mb-1">
                      Uploaded Photos ({activeReview.cloudinaryPhotos.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {activeReview.cloudinaryPhotos.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="shrink-0 w-16 h-16 rounded-[6px] overflow-hidden bg-white hover:opacity-90 transition-opacity">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw messages or voice transcript */}
                {(activeReview.rawMessages?.length > 0 || activeReview.audioTranscript) && (
                  <div className="p-2.5 rounded-[5px] bg-white text-xs space-y-1">
                    <span className="block text-[10px] text-[#888888] uppercase tracking-wider">
                      Vendor Transcript
                    </span>
                    {activeReview.rawMessages?.length > 0 && (
                      <p className="text-[#444444] text-[11px] leading-relaxed">
                        {activeReview.rawMessages.join(' ')}
                      </p>
                    )}
                    {activeReview.audioTranscript && (
                      <p className="text-[#10393b] text-[11px] italic bg-[#30c5ce]/10 p-1.5 rounded-[4px]">
                        🎤 &quot;{activeReview.audioTranscript}&quot;
                      </p>
                    )}
                  </div>
                )}

                {/* Editable Price & Grade with Live Delta */}
                <div className="pt-2 border-t border-[#dcdad2] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-xs text-[#555555] mb-1">Price (₦)</span>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full h-9 px-3 rounded-[5px] bg-white text-xs font-mono font-medium text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                      />
                    </div>
                    <div>
                      <span className="block text-xs text-[#555555] mb-1">Condition</span>
                      <input
                        type="text"
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                        className="w-full h-9 px-3 rounded-[5px] bg-white text-xs text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                      />
                    </div>
                  </div>

                  {activeReview.maxBudget && (
                    <div className="text-[11px] flex items-center gap-1.5">
                      {editPrice <= activeReview.maxBudget ? (
                        <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-[3px]">
                          ✓ Fits student budget (₦{(activeReview.maxBudget - editPrice).toLocaleString()} under max)
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-[3px]">
                          ⚠️ ₦{(editPrice - activeReview.maxBudget).toLocaleString()} above student max budget
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showRejectBox ? (
              <div className="pt-3 border-t border-[#eceae2] space-y-2.5">
                <span className="block text-xs text-[#555555]">
                  Reason for declining (sent to seller via WhatsApp / Telegram):
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Battery health below 80% / Screen scratches / Price exceeds budget"
                    className="flex-1 h-9 px-3 rounded-[5px] bg-[#eceae2] text-xs text-[#10393b] outline-none focus:ring-2 focus:ring-red-400/30 border-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRejectReview();
                      }
                    }}
                  />
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRejectBox(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRejectReview()}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      Confirm Decline & Notify Seller
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eceae2]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectBox(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                >
                  Decline Offer
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApproveReview}
                  className="text-xs"
                >
                  Approve & Publish to Student
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEAL MANAGEMENT & DISPUTE RESOLUTION MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar p-6 sm:p-7 space-y-5 animate-chat-morph">
            <div className="flex items-center justify-between border-b border-[#eceae2] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-normal px-2.5 py-1 rounded-[3px] bg-[#eceae2] text-[#10393b]">
                  #{selectedDeal.offer?.request?.publicToken || selectedDeal.id.slice(0, 8)}
                </span>
                <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-normal ${
                  selectedDeal.status === 'SUCCESSFUL' || selectedDeal.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedDeal.status === 'DISPUTED'
                    ? 'bg-red-100 text-red-800'
                    : selectedDeal.status === 'INSPECTION'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedDeal.status === 'SUCCESSFUL' || selectedDeal.status === 'COMPLETED'
                    ? 'Completed & Paid'
                    : selectedDeal.status === 'DISPUTED'
                    ? 'Disputed'
                    : selectedDeal.status === 'INSPECTION'
                    ? 'Inspection in Progress'
                    : 'Deal Sourced'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDeal(null);
                  setShowDisputeBox(false);
                  setDisputeInput('');
                }}
                className="w-7 h-7 rounded-[4px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Deal Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-[6px] bg-[#eceae2] space-y-1.5">
                <span className="block text-[10px] text-[#777777] uppercase tracking-wider font-medium">
                  Student & Device
                </span>
                <div className="text-sm font-medium text-[#10393b]">
                  {selectedDeal.offer?.brand} {selectedDeal.offer?.model}
                </div>
                <div className="text-[#555555]">
                  Student: <strong>{selectedDeal.offer?.request?.buyerName}</strong> ({selectedDeal.offer?.request?.buyerPhone})
                </div>
                <div className="font-mono text-base font-normal text-[#10393b] pt-1">
                  ₦{Number(selectedDeal.finalAgreedPrice).toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-[6px] bg-[#eceae2] space-y-1.5">
                <span className="block text-[10px] text-[#777777] uppercase tracking-wider font-medium">
                  Vendor & Escrow Payout
                </span>
                <div className="text-sm font-medium text-[#10393b]">
                  {selectedDeal.offer?.seller?.businessName}
                </div>
                <div className="text-[#555555]">
                  Stall: {selectedDeal.offer?.seller?.physicalLocation || 'Campus Market'}
                </div>
                <div className="font-mono text-[11px] text-[#10393b] pt-1">
                  {selectedDeal.offer?.seller?.bankName || 'Kuda Bank'} • {selectedDeal.offer?.seller?.accountNumber || '2019481920'}
                </div>
                <div className="text-[10px] text-[#777777]">
                  Account Name: {selectedDeal.offer?.seller?.accountName || selectedDeal.offer?.seller?.businessName}
                </div>
              </div>
            </div>

            {/* Campus Desk Physical Inspection Checklist */}
            <div className="p-4 rounded-[6px] bg-[#f5f4ef] space-y-2.5">
              <span className="block text-[11px] text-[#10393b] font-medium uppercase tracking-wider">
                Campus Desk Inspection Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-[5px] bg-white text-[#333333]">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Battery Health Checked (≥ 80%)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-[5px] bg-white text-[#333333]">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Display & Keyboard Functional</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-[5px] bg-white text-[#333333]">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>iCloud / Google Lock Unlinked</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-[5px] bg-white text-[#333333]">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>7-Day Campus Warranty Registered</span>
                </div>
              </div>
            </div>

            {/* Dispute Banner if active */}
            {selectedDeal.status === 'DISPUTED' && selectedDeal.disputeReason && (
              <div className="p-3.5 rounded-[6px] bg-red-100 text-red-800 text-xs space-y-1">
                <div className="font-medium flex items-center gap-1.5">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                  Active Dispute Reported:
                </div>
                <p className="leading-relaxed">&quot;{selectedDeal.disputeReason}&quot;</p>
              </div>
            )}

            {/* Dispute Input Drawer */}
            {showDisputeBox && (
              <div className="p-3.5 rounded-[6px] bg-amber-50 space-y-2 border border-amber-200">
                <span className="block text-xs font-medium text-amber-900">
                  Enter Dispute Reason (e.g. Battery degraded, screen backlight flicker):
                </span>
                <textarea
                  rows={2}
                  value={disputeInput}
                  onChange={(e) => setDisputeInput(e.target.value)}
                  placeholder="Describe the defect or reason for hold..."
                  className="w-full p-2 rounded-[5px] bg-white text-xs text-[#10393b] outline-none focus:ring-2 focus:ring-amber-500/30 border-0"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDisputeBox(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateDealStage(selectedDeal.id, 'DISPUTED', disputeInput)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm Dispute Hold
                  </Button>
                </div>
              </div>
            )}

            {/* Stage Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#eceae2]">
              <div className="flex items-center gap-2">
                {selectedDeal.status === 'IN_PROGRESS' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateDealStage(selectedDeal.id, 'INSPECTION')}
                  >
                    Move to Desk Inspection
                  </Button>
                )}

                {selectedDeal.status === 'INSPECTION' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateDealStage(selectedDeal.id, 'SUCCESSFUL')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                      Passed: Release Escrow Payout
                    </Button>
                    {!showDisputeBox && (
                      <button
                        type="button"
                        onClick={() => setShowDisputeBox(true)}
                        className="h-8 px-3 rounded-[5px] bg-red-100 hover:bg-red-200 text-xs text-red-700 font-medium cursor-pointer transition-colors"
                      >
                        Flag Defect / Dispute
                      </button>
                    )}
                  </>
                )}

                {selectedDeal.status === 'DISPUTED' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateDealStage(selectedDeal.id, 'INSPECTION')}
                    >
                      Vendor Replaced Unit (Re-inspect)
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleUpdateDealStage(selectedDeal.id, 'CANCELLED', 'Refund issued to student')}
                      className="h-8 px-3 rounded-[5px] bg-red-100 hover:bg-red-200 text-xs text-red-700 font-medium cursor-pointer transition-colors"
                    >
                      Refund Student & Cancel Deal
                    </button>
                  </>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedDeal(null);
                  setShowDisputeBox(false);
                  setDisputeInput('');
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL - WITH CUSTOM DROPDOWN, LOCATION & ESCROW BANK */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSeller}
            className="bg-white rounded-[10px] w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar p-6 sm:p-7 space-y-4 animate-chat-morph"
          >
            <div className="flex items-center justify-between border-b border-[#eceae2] pb-2">
              <h3 className="text-base font-normal text-[#10393b]">
                Add Verified Campus Vendor
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSellerModal(false)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Business / Store Name</span>
              <input
                required
                type="text"
                placeholder="e.g. Apex Gadgets Hub"
                value={newSellerName}
                onChange={(e) => setNewSellerName(e.target.value)}
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-normal text-[#555555] mb-1.5">Category</span>
                <CustomDropdown
                  options={MODAL_CATEGORY_OPTIONS}
                  value={newSellerCategory}
                  onChange={(val) => setNewSellerCategory(val as any)}
                />
              </div>
              <div>
                <span className="block text-xs font-normal text-[#555555] mb-1.5">Verification Tier</span>
                <CustomDropdown
                  options={TIER_OPTIONS}
                  value={newSellerTier}
                  onChange={(val) => setNewSellerTier(val as any)}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Physical Stall Location</span>
              <input
                type="text"
                placeholder="e.g. Shop 14, Main Campus Market Complex"
                value={newSellerLocation}
                onChange={(e) => setNewSellerLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
              />
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#eceae2] space-y-3">
              <span className="block text-[11px] font-medium text-[#777777] uppercase tracking-wider">
                Escrow Payout Bank Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="block text-[11px] text-[#555555] mb-1">Bank Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Kuda Bank / OPay"
                    value={newSellerBankName}
                    onChange={(e) => setNewSellerBankName(e.target.value)}
                    className="w-full h-9 px-3 rounded-[5px] bg-white text-xs text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-[#555555] mb-1">Account Number</span>
                  <input
                    type="text"
                    placeholder="e.g. 2019481920"
                    value={newSellerAccountNumber}
                    onChange={(e) => setNewSellerAccountNumber(e.target.value)}
                    className="w-full h-9 px-3 rounded-[5px] bg-white text-xs font-mono text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                  />
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-[#555555] mb-1">Account Name</span>
                <input
                  type="text"
                  placeholder="e.g. Samuel Apex Enterprise"
                  value={newSellerAccountName}
                  onChange={(e) => setNewSellerAccountName(e.target.value)}
                  className="w-full h-9 px-3 rounded-[5px] bg-white text-xs text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eceae2]">
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
                Register Verified Vendor
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT VENDOR MODAL - FULL EDITING SUPPORT */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateSeller}
            className="bg-white rounded-[10px] w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar p-6 sm:p-7 space-y-4 animate-chat-morph"
          >
            <div className="flex items-center justify-between border-b border-[#eceae2] pb-2">
              <h3 className="text-base font-normal text-[#10393b]">
                Edit Vendor: {editingSeller.businessName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSeller(null)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Business Name</span>
              <input
                required
                type="text"
                value={editSellerName}
                onChange={(e) => setEditSellerName(e.target.value)}
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-normal text-[#555555] mb-1.5">Contact Person</span>
                <input
                  required
                  type="text"
                  value={editSellerContact}
                  onChange={(e) => setEditSellerContact(e.target.value)}
                  className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
                />
              </div>
              <div>
                <span className="block text-xs font-normal text-[#555555] mb-1.5">WhatsApp Phone</span>
                <input
                  required
                  type="text"
                  value={editSellerPhone}
                  onChange={(e) => setEditSellerPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-normal text-[#555555] mb-1.5">Category</span>
                <CustomDropdown
                  options={MODAL_CATEGORY_OPTIONS}
                  value={editSellerCategory}
                  onChange={(val) => setEditSellerCategory(val as any)}
                />
              </div>
              <div>
                <span className="block text-xs font-normal text-[#555555] mb-1.5">Verification Tier</span>
                <CustomDropdown
                  options={TIER_OPTIONS}
                  value={editSellerTier}
                  onChange={(val) => setEditSellerTier(val as any)}
                />
              </div>
            </div>

            <div>
              <span className="block text-xs font-normal text-[#555555] mb-1.5">Physical Stall Location</span>
              <input
                type="text"
                value={editSellerLocation}
                onChange={(e) => setEditSellerLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-[6px] bg-[#eceae2] focus:bg-white text-sm text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 font-normal border-0"
              />
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#eceae2] space-y-3">
              <span className="block text-[11px] font-medium text-[#777777] uppercase tracking-wider">
                Escrow Payout Bank Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="block text-[11px] text-[#555555] mb-1">Bank Name</span>
                  <input
                    type="text"
                    value={editSellerBankName}
                    onChange={(e) => setEditSellerBankName(e.target.value)}
                    className="w-full h-9 px-3 rounded-[5px] bg-white text-xs text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-[#555555] mb-1">Account Number</span>
                  <input
                    type="text"
                    value={editSellerAccountNumber}
                    onChange={(e) => setEditSellerAccountNumber(e.target.value)}
                    className="w-full h-9 px-3 rounded-[5px] bg-white text-xs font-mono text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                  />
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-[#555555] mb-1">Account Name</span>
                <input
                  type="text"
                  value={editSellerAccountName}
                  onChange={(e) => setEditSellerAccountName(e.target.value)}
                  className="w-full h-9 px-3 rounded-[5px] bg-white text-xs text-[#10393b] outline-none focus:ring-2 focus:ring-[#30c5ce]/30 border-0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eceae2]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingSeller(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Update Vendor Profile
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
