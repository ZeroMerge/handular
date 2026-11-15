import React, { useState, useEffect } from 'react';
import {
  Squares2X2Icon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from './ui/icons';
import { StudentUser, UserRequestSummary } from '../types';
import { Button } from './ui/button';

interface OrdersViewProps {
  apiBaseUrl: string;
  token: string;
  user: StudentUser;
  onSelectRequest: (publicToken: string) => void;
  onCreateNewRequest: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  apiBaseUrl,
  token,
  onSelectRequest,
  onCreateNewRequest,
}) => {
  const [requests, setRequests] = useState<UserRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMyRequests = async () => {
    if (!token) return;
    setIsRefreshing(true);
    const startTime = Date.now();
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.warn('Failed to fetch user requests:', err);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 700 - elapsed);
      setTimeout(() => {
        setIsRefreshing(false);
        setLoading(false);
      }, remaining);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [token]);

  const getStatusBadge = (status: string, compact = false) => {
    const sizeClasses = compact
      ? 'px-2 py-1 rounded-[6px] text-[11px]'
      : 'px-2.5 py-1.5 rounded-[7px] text-xs';

    switch (status) {
      case 'OFFERS_READY':
        return (
          <span className={`inline-flex items-center gap-1.5 ${sizeClasses} font-normal bg-[#10393b] text-[#30c5ce]`}>
            <CheckCircleIcon className="w-3.5 h-3.5 text-[#30c5ce]" />
            Offers Ready
          </span>
        );
      case 'OFFER_SELECTED':
        return (
          <span className={`inline-flex items-center gap-1.5 ${sizeClasses} font-normal bg-[#10393b] text-[#30c5ce]`}>
            <ShieldCheckIcon className="w-3.5 h-3.5 text-[#30c5ce]" />
            Deal Locked
          </span>
        );
      case 'CLOSED_WON':
        return (
          <span className={`inline-flex items-center gap-1.5 ${sizeClasses} font-normal bg-[#10393b] text-emerald-400`}>
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            Completed
          </span>
        );
      case 'BROADCASTED':
      case 'OPEN':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 ${sizeClasses} font-normal bg-[#10393b] text-[#ffad24]`}>
            <ClockIcon className="w-3.5 h-3.5 text-[#ffad24]" />
            Sourcing Sellers
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Page Header - Just Title & Square Refresh Icon Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#10393b]">
          My Orders
        </h1>
        <button
          onClick={fetchMyRequests}
          disabled={isRefreshing}
          title="Refresh orders"
          aria-label="Refresh orders"
          className="w-8 h-8 rounded-[8px] bg-[#eceae2] hover:bg-[#e4e1d7] active:bg-[#dbd8cc] text-[#10393b] flex items-center justify-center transition-all cursor-pointer disabled:opacity-80"
        >
          <ArrowPathIcon className={`w-4 h-4 shrink-0 transition-transform ${isRefreshing ? 'animate-spin-smooth' : ''}`} />
        </button>
      </div>

      {/* Table View with Small Background Gap - ZERO BORDERS, ZERO SHADOWS */}
      {isRefreshing || (loading && requests.length === 0) ? (
        <div className="py-16 text-center rounded-[14px] p-8 bg-white/70 space-y-4 animate-in fade-in duration-200">
          <div className="w-8 h-8 border-[3px] border-[#10393b]/15 border-t-[#10393b] rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-[#10393b]">Updating Orders</h3>
            <p className="text-xs text-[#777777] font-normal">
              Checking campus sellers and syncing your live matches...
            </p>
          </div>
          {/* Skeleton preview rows */}
          <div className="pt-2 space-y-2 max-w-lg mx-auto">
            <div className="h-11 rounded-[8px] bg-[#10393b]/5 animate-pulse" />
            <div className="h-11 rounded-[8px] bg-[#10393b]/5 animate-pulse [animation-delay:150ms]" />
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-16 text-center rounded-[14px] p-6 bg-white">
          <Squares2X2Icon className="w-10 h-10 text-[#aaaaaa] mx-auto mb-2" />
          <h3 className="text-base font-normal text-[#10393b] mb-1">No Orders Yet</h3>
          <p className="text-xs text-[#777777] max-w-xs mx-auto mb-4 font-normal">
            You haven&apos;t requested any devices yet.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNewRequest}
          >
            <span>Start Request</span>
            <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Table Column Headers (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-normal text-[#888888] uppercase tracking-wider">
            <div className="col-span-3">Request Code</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Budget</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {/* Orders List: Mobile Cards + Desktop Table Rows */}
          {requests.map((req) => (
            <React.Fragment key={req.id}>
              {/* Mobile Order Card: Clean, balanced layout */}
              <div
                onClick={() => onSelectRequest(req.publicToken)}
                className="md:hidden p-4 rounded-[14px] bg-white hover:bg-white/95 active:scale-[0.99] transition-all cursor-pointer space-y-3"
              >
                {/* Top: Code & Category on left, Status Badge on right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-medium text-[#10393b]">
                      #{req.publicToken}
                    </span>
                    <span className="text-xs text-[#bbbbbb]">•</span>
                    <span className="text-xs text-[#555555] font-normal capitalize">
                      {req.category.toLowerCase()}
                    </span>
                  </div>
                  {getStatusBadge(req.status, true)}
                </div>

                {/* Bottom: Budget on left, Offers badge + Action button on right */}
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#10393b]/5">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#888888] block leading-none mb-1">
                      Budget
                    </span>
                    <span className="font-mono text-sm font-medium text-[#10393b] block leading-tight">
                      ₦{Number(req.maxBudget).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.offersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-[5px] text-[11px] font-medium bg-emerald-50 text-emerald-700">
                        {req.offersCount} {req.offersCount === 1 ? 'offer' : 'offers'}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRequest(req.publicToken);
                      }}
                      className="h-8 px-3 rounded-[8px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-white text-xs font-normal flex items-center gap-1 transition-all cursor-pointer shadow-none"
                    >
                      <span>View Offers</span>
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Table Row */}
              <div className="hidden md:grid grid-cols-12 gap-3 items-center px-4 py-3.5 rounded-[10px] bg-white hover:bg-white/80 transition-all">
                <div className="col-span-3 flex items-center gap-2">
                  <span className="font-mono text-xs font-normal text-[#10393b]">
                    #{req.publicToken}
                  </span>
                  {req.offersCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] bg-emerald-50 text-emerald-700 font-normal">
                      {req.offersCount} {req.offersCount === 1 ? 'offer' : 'offers'}
                    </span>
                  )}
                </div>

                <div className="col-span-2 text-xs text-[#555555] font-normal">
                  {req.category}
                </div>

                <div className="col-span-2 text-xs text-[#10393b] font-normal font-mono">
                  ₦{Number(req.maxBudget).toLocaleString()}
                </div>

                <div className="col-span-3">
                  {getStatusBadge(req.status)}
                </div>

                <div className="col-span-2 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectRequest(req.publicToken)}
                    className="h-9 px-3.5"
                  >
                    <span>View Offers</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
