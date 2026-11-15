import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  Squares2X2Icon,
} from './ui/icons';
import { StudentUser, UserRequestSummary } from '../types';
import { Button } from './ui/button';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StudentUser;
  token: string;
  apiBaseUrl: string;
  onSelectRequest: (token: string) => void;
  onSignOut: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  token,
  apiBaseUrl,
  onSelectRequest,
  onSignOut,
}) => {
  const [requests, setRequests] = useState<UserRequestSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyRequests = async () => {
    if (!token) return;
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyRequests();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OFFERS_READY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-normal bg-white text-emerald-700">
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />
            Offers Ready
          </span>
        );
      case 'OFFER_SELECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-normal bg-white text-[#10393b]">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-[#30c5ce]" />
            Deal Locked
          </span>
        );
      case 'CLOSED_WON':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-normal bg-white text-[#10393b]">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'BROADCASTED':
      case 'OPEN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-xs font-normal bg-white text-[#ffad24]">
            <ClockIcon className="w-3.5 h-3.5 text-[#ffad24]" />
            Sourcing Sellers
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white rounded-[18px] w-full max-w-xl overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - ZERO BORDERS, ZERO SHADOWS */}
        <div className="px-5 py-3.5 flex items-center justify-between bg-[#eceae2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#10393b] text-white flex items-center justify-center font-normal text-sm">
              {user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-normal text-[#10393b] tracking-tight">
                  {user.fullName}
                </h3>
                <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-normal bg-white text-[#10393b] uppercase tracking-wider">
                  {user.campus} Student
                </span>
              </div>
              <p className="text-xs text-[#666666] font-normal">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] hover:bg-[#dbd8cc] flex items-center justify-center text-[#777777] hover:text-[#10393b] transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* User Quick Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-6 py-3.5 bg-[#f5f4ef] text-xs">
          <div className="flex items-center gap-2 text-[#555555]">
            <DevicePhoneMobileIcon className="w-3.5 h-3.5 text-[#888888] shrink-0" />
            <span className="truncate">{user.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[#555555]">
            <MapPinIcon className="w-3.5 h-3.5 text-[#888888] shrink-0" />
            <span className="truncate">{user.campus} Campus</span>
          </div>
          <div className="flex items-center gap-2 text-[#555555] col-span-2 sm:col-span-1">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-emerald-700 font-normal">Verified Student</span>
          </div>
        </div>

        {/* Body: My Sourcing Requests */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Squares2X2Icon className="w-4 h-4 text-[#10393b]" />
              <h4 className="text-sm font-normal text-[#10393b]">
                My Sourcing Requests ({requests.length})
              </h4>
            </div>
            <button
              onClick={fetchMyRequests}
              className="text-xs text-[#666666] hover:text-[#10393b] flex items-center gap-1 font-normal cursor-pointer"
              title="Refresh requests"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading && requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#888888]">
              <div className="w-6 h-6 border-2 border-[#10393b]/20 border-t-[#10393b] rounded-full animate-spin mx-auto mb-2" />
              Loading your request history...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center rounded-[10px] p-6 bg-[#f5f4ef]">
              <Squares2X2Icon className="w-8 h-8 text-[#aaaaaa] mx-auto mb-2" />
              <p className="text-sm font-normal text-[#10393b] mb-1">No requests yet</p>
              <p className="text-xs text-[#666666] max-w-xs mx-auto mb-4 font-normal">
                You haven&apos;t submitted any device requests under this account.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
              >
                Create Device Request
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-[10px] bg-[#eceae2] hover:bg-[#e4e1d7] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-normal text-[#10393b]">
                        #{req.publicToken}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#666666]">
                      <span>{req.category}</span>
                      <span>•</span>
                      <span>Budget: ₦{Number(req.maxBudget).toLocaleString()}</span>
                      <span>•</span>
                      <span>{req.offersCount} verified {req.offersCount === 1 ? 'offer' : 'offers'}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onSelectRequest(req.publicToken);
                      onClose();
                    }}
                    className="self-start sm:self-auto shrink-0"
                  >
                    <span>View Offers</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Sign Out */}
        <div className="px-6 py-4 bg-[#f5f4ef] flex items-center justify-between">
          <span className="text-xs text-[#888888] font-normal">
            Campus Escrow Protection
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-normal"
          >
            <ArrowRightOnRectangleIcon className="w-3.5 h-3.5 mr-1" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
