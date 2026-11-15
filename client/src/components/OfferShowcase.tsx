import React, { useState, useEffect } from 'react';
import { OfferData, BuyerRequestData } from '../types';
import {
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from './ui/icons';
import { Button } from './ui/button';

interface OfferShowcaseProps {
  token: string;
  apiBaseUrl: string;
  onClose: () => void;
  onSelectOffer: (offerId: string) => void;
  onGoToTracker: () => void;
}

export const OfferShowcase: React.FC<OfferShowcaseProps> = ({
  token,
  apiBaseUrl,
  onClose,
  onSelectOffer,
  onGoToTracker,
}) => {
  const [request, setRequest] = useState<BuyerRequestData | null>(null);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [token]);

  // Close on Escape key (Notion heuristic)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Backdrop Scrim - Clicking anywhere outside closes (Notion Side Peek UX) */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Close side panel"
      />

      {/* Notion Side Peek Drawer (Right on Desktop, Bottom on Mobile) */}
      <div
        className="fixed z-50 bg-white flex flex-col md:inset-y-0 md:right-0 md:w-full md:max-w-2xl md:animate-in md:slide-in-from-right max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[92vh] max-md:rounded-t-[20px] max-md:animate-in max-md:slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#dcdad2]" />
        </div>

        {/* Panel Header Bar (Notion Style) */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[8px] hover:bg-[#eceae2] flex items-center justify-center text-[#666666] hover:text-[#10393b] transition-colors cursor-pointer"
              title="Close panel (Esc)"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-normal px-2.5 py-1 rounded-[6px] bg-[#10393b] text-[#30c5ce]">
              #{token}
            </span>
            <span className="text-xs text-[#666666] font-normal hidden sm:inline">
              {request?.category} • Max ₦{request ? Number(request.maxBudget).toLocaleString() : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOffers}
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-[8px] bg-[#eceae2] hover:bg-[#e4e1d7] text-xs font-normal text-[#10393b] cursor-pointer"
              title="Refresh quotes"
            >
              <ArrowPathIcon className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Button
              onClick={onGoToTracker}
              variant="secondary"
              size="sm"
              className="h-8 text-xs font-normal"
            >
              Live Tracker
            </Button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-[#10393b]">
              {offers.length > 0
                ? `${offers.length} Device${offers.length > 1 ? 's' : ''} Available`
                : 'Looking for Devices...'}
            </h2>
          </div>

          {error && (
            <div className="p-3 rounded-[10px] bg-red-50 text-xs text-red-600 flex items-center gap-2 font-normal">
              <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-xs text-[#888888]">
              <div className="w-6 h-6 border-2 border-[#10393b]/20 border-t-[#10393b] rounded-full animate-spin mx-auto mb-2" />
              Checking verified seller quotes...
            </div>
          ) : offers.length === 0 ? (
            <div className="p-8 rounded-[12px] bg-[#f5f4ef] text-center">
              <div className="w-10 h-10 rounded-[10px] bg-white text-[#10393b] flex items-center justify-center mx-auto mb-3">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-normal text-[#10393b] mb-1">
                Verified Vendors Are Responding
              </h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto mb-4 font-normal">
                Your request is broadcasted to verified sellers on WhatsApp. OCR-verified offers will appear here shortly.
              </p>
              <Button
                onClick={onGoToTracker}
                variant="primary"
                size="sm"
              >
                <span>View Live Pipeline Tracker</span>
                <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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
                          {/* Seller badge with high contrast on dark */}
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] bg-[#10393b] text-white text-[11px] font-normal">
                              <ShieldCheckIcon className="w-3 h-3 text-[#30c5ce]" />
                              <span>{offer.seller?.businessName || 'Verified Vendor'}</span>
                              <span className="text-[#ffad24]">★ {offer.seller?.rating || '5.0'}</span>
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
    </>
  );
};
