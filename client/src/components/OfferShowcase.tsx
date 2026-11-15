import React, { useState, useEffect } from 'react';
import { OfferData, BuyerRequestData } from '../types';
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  CheckIcon,
} from './ui/icons';
import { Button } from './ui/button';

interface OfferShowcaseProps {
  token: string;
  apiBaseUrl: string;
  onClose: () => void;
  onSelectOffer: (offerId: string) => void;
  onGoToTracker?: () => void;
}

export const OfferShowcase: React.FC<OfferShowcaseProps> = ({
  token,
  apiBaseUrl,
  onClose,
  onSelectOffer,
}) => {
  const [request, setRequest] = useState<BuyerRequestData | null>(null);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    setIsRefreshing(true);
    const startTime = Date.now();
    try {
      setError(null);
      const res = await fetch(`${apiBaseUrl}/api/v1/offers/${token}`);
      if (!res.ok) {
        throw new Error(`Failed to load offers for ${token}`);
      }
      const data = await res.json();
      setRequest(data.request);
      setOffers(data.offers || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching offers');
    } finally {
      // Ensure real spinning animation completes at least one full satisfying cycle (700ms)
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 700 - elapsed);
      setTimeout(() => {
        setIsRefreshing(false);
        setLoading(false);
      }, remaining);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [token]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const milestones = [
    { id: 1, name: 'Request Sent', done: true, active: false },
    { id: 2, name: 'Contacting Sellers', done: true, active: false },
    {
      id: 3,
      name: 'Checking Quality',
      done: offers.length > 0,
      active: offers.length === 0,
    },
    {
      id: 4,
      name: 'Ready to Review',
      done: offers.length > 0,
      active: false,
    },
  ];

  return (
    <>
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Close side panel"
      />

      {/* Side Peek Drawer (Right on Desktop, Bottom on Mobile) */}
      <div
        className="fixed z-50 bg-white flex flex-col md:inset-y-0 md:right-0 md:w-full md:max-w-2xl md:animate-in md:slide-in-from-right max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[92vh] max-md:rounded-t-[20px] max-md:animate-in max-md:slide-in-from-bottom duration-250 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#dcdad2]" />
        </div>

        {/* Panel Header Bar: Cancel [X] + #REQ-XXXX on Left, Square Refresh on Right */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between bg-white shrink-0 border-b border-[#10393b]/5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[8px] hover:bg-[#eceae2] flex items-center justify-center text-[#666666] hover:text-[#10393b] transition-all cursor-pointer"
              title="Close panel (Esc)"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-normal px-2.5 py-1 rounded-[6px] bg-[#10393b] text-[#30c5ce]">
              #{token}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOffers}
              disabled={isRefreshing}
              className="w-8 h-8 rounded-[8px] bg-[#eceae2] hover:bg-[#e4e1d7] active:bg-[#dbd8cc] flex items-center justify-center text-[#10393b] transition-all cursor-pointer disabled:opacity-80"
              title="Refresh quotes"
              aria-label="Refresh quotes"
            >
              <ArrowPathIcon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isRefreshing ? 'animate-spin-smooth' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with 3 Clean Widgets */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-[10px] bg-red-50 text-xs text-red-600 flex items-center gap-2 font-normal">
              <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* WIDGET 1: Clean Request Details List */}
          {request && (
            <div className="p-4 rounded-[14px] bg-[#f5f4ef] space-y-2">
              <span className="text-[10px] uppercase font-normal tracking-wider text-[#888888] block">
                Request Details
              </span>

              <div className="space-y-1.5 text-xs font-normal text-[#10393b]">
                {/* 1. Device / Brand */}
                <div className="text-sm font-medium text-[#10393b]">
                  {request.targetSpecs?.brand && request.targetSpecs.brand !== 'any'
                    ? request.targetSpecs.brand
                    : request.category}
                </div>

                {/* 2. Purpose / Use Case (Next line) */}
                {request.targetSpecs?.useCase && (
                  <div className="text-[#555555]">
                    {request.targetSpecs.useCase}
                  </div>
                )}

                {/* 3. Budget (Next line) */}
                <div className="font-mono text-[#10393b]">
                  Max ₦{Number(request.maxBudget).toLocaleString()}
                </div>

                {/* 4. Any other details added (Next line) */}
                {request.targetSpecs?.notes && (
                  <div className="text-[#666666] pt-1.5 border-t border-[#10393b]/5 leading-relaxed">
                    {request.targetSpecs.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WIDGET 2: Embedded Live Tracker */}
          <div className="p-4 rounded-[14px] bg-[#f5f4ef] space-y-3">
            <span className="text-[10px] uppercase font-normal tracking-wider text-[#888888] block">
              Sourcing Progress
            </span>

            {/* Desktop Horizontal Milestone Tracker */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-[10px] transition-all flex flex-col justify-between ${
                    m.done
                      ? 'bg-white text-[#10393b]'
                      : m.active
                      ? 'bg-[#10393b] text-white'
                      : 'bg-white/50 text-[#999999]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono opacity-80">
                      Step {m.id}
                    </span>
                    {m.done ? (
                      <span className="w-4 h-4 rounded-full bg-[#10393b] text-[#30c5ce] flex items-center justify-center">
                        <CheckIcon className="w-2.5 h-2.5" />
                      </span>
                    ) : m.active ? (
                      <span className="w-2 h-2 rounded-full bg-[#30c5ce] animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#cccccc]" />
                    )}
                  </div>
                  <span className="text-xs font-normal leading-snug">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Vertical Milestone Tracker */}
            <div className="sm:hidden space-y-2">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 relative"
                >
                  {/* Vertical connector line */}
                  {idx < milestones.length - 1 && (
                    <div
                      className={`absolute left-[13px] top-6 w-[2px] h-5 ${
                        m.done ? 'bg-[#10393b]' : 'bg-[#e0ded6]'
                      }`}
                    />
                  )}

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono transition-all ${
                      m.done
                        ? 'bg-[#10393b] text-[#30c5ce]'
                        : m.active
                        ? 'bg-[#10393b] text-white ring-2 ring-[#30c5ce]'
                        : 'bg-[#eceae2] text-[#999999]'
                    }`}
                  >
                    {m.done ? (
                      <CheckIcon className="w-3.5 h-3.5" />
                    ) : (
                      <span>{m.id}</span>
                    )}
                  </div>

                  <div className="flex-1 py-1">
                    <span
                      className={`text-xs font-normal block ${
                        m.done
                          ? 'text-[#10393b]'
                          : m.active
                          ? 'text-[#10393b] font-medium'
                          : 'text-[#999999]'
                      }`}
                    >
                      {m.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WIDGET 3: Available Devices (Offers Section) */}
          <div className="space-y-3 pt-1">
            <h2 className="text-base sm:text-lg font-normal tracking-tight text-[#10393b]">
              {offers.length > 0
                ? `${offers.length} Device${offers.length > 1 ? 's' : ''} Available`
                : 'Looking for Devices...'}
            </h2>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#888888]">
                <div className="w-6 h-6 border-2 border-[#10393b]/20 border-t-[#10393b] rounded-full animate-spin mx-auto mb-2" />
                Checking verified seller quotes...
              </div>
            ) : offers.length === 0 ? (
              /* Simplified 0-offers card: just one clean main text */
              <div className="p-8 rounded-[12px] bg-[#f5f4ef] text-center">
                <p className="text-xs text-[#555555] font-normal">
                  Campus sellers are reviewing your request.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => {
                  const specs = offer.specs || {};
                  const photo =
                    offer.cloudinaryPhotos && offer.cloudinaryPhotos.length > 0
                      ? offer.cloudinaryPhotos[0]
                      : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80';

                  return (
                    <div
                      key={offer.id}
                      className="p-4 sm:p-5 rounded-[12px] bg-[#f5f4ef] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Photo */}
                        <div className="w-full sm:w-44 h-32 rounded-[10px] overflow-hidden bg-[#eceae2] shrink-0 relative">
                          <img
                            src={photo}
                            alt={offer.model}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-[5px] bg-[#10393b]/90 text-[10px] font-normal text-white">
                            {offer.conditionGrade}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            {/* Seller badge */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] bg-[#10393b] text-white text-[11px] font-normal">
                                <ShieldCheckIcon className="w-3 h-3 text-[#30c5ce]" />
                                <span>
                                  {offer.seller?.businessName || 'Verified Vendor'}
                                </span>
                                <span className="text-[#ffad24]">
                                  ★ {offer.seller?.rating || '5.0'}
                                </span>
                              </span>
                              <span className="text-[10px] font-mono text-[#888888]">
                                AI Match: {(offer.aiConfidenceScore * 100).toFixed(0)}%
                              </span>
                            </div>

                            <h3 className="text-base font-normal text-[#10393b]">
                              {offer.brand} {offer.model}
                            </h3>
                          </div>

                          {/* Specs grid */}
                          <div className="grid grid-cols-2 gap-1.5 text-xs mt-2">
                            {specs.cpu && (
                              <span className="p-1.5 rounded-[6px] bg-white text-[#333333] truncate">
                                {specs.cpu}
                              </span>
                            )}
                            {specs.ram && (
                              <span className="p-1.5 rounded-[6px] bg-white text-[#333333] truncate">
                                {specs.ram} {specs.storage ? `• ${specs.storage}` : ''}
                              </span>
                            )}
                            {specs.batteryHealth && (
                              <span className="p-1.5 rounded-[6px] bg-white text-[#10393b] font-normal truncate">
                                🔋 {specs.batteryHealth}
                              </span>
                            )}
                            {specs.screen && (
                              <span className="p-1.5 rounded-[6px] bg-white text-[#333333] truncate">
                                {specs.screen}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price & Selection Bar */}
                      <div className="p-3 rounded-[10px] bg-white flex items-center justify-between gap-3 pt-2">
                        <div>
                          <span className="block text-[10px] text-[#777777] uppercase font-normal">
                            Verified Price
                          </span>
                          <span className="text-xl font-normal text-[#10393b] font-mono">
                            ₦{Number(offer.price).toLocaleString()}
                          </span>
                        </div>

                        <Button
                          onClick={() => onSelectOffer(offer.id)}
                          variant="primary"
                          size="sm"
                        >
                          <span>Select Device</span>
                          <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
