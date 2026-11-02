import React, { useState, useEffect } from 'react';
import { OfferData, BuyerRequestData } from '../types';
import { ShieldCheck, Battery, Cpu, HardDrive, Monitor, ArrowRight, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface OfferShowcaseProps {
  token: string;
  apiBaseUrl: string;
  onSelectOffer: (offerId: string) => void;
  onGoToTracker: () => void;
}

export const OfferShowcase: React.FC<OfferShowcaseProps> = ({
  token,
  apiBaseUrl,
  onSelectOffer,
  onGoToTracker,
}) => {
  const [request, setRequest] = useState<BuyerRequestData | null>(null);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

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

  const handleSimulateResponse = async () => {
    try {
      setSimulating(true);
      await fetch(`${apiBaseUrl}/api/v1/simulation/simulate-seller-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          sellerPhone: '2348012345678',
          message: `Boss, here is a pristine unit for ${token}: Apple MacBook Pro 14" M1 Pro 16GB RAM 512GB SSD. Battery 94% health. ₦640,000.`,
        }),
      });
      await fetchOffers();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#0051c3] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500">Loading verified offers for {token}...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2.5 py-1 rounded-full bg-blue-50 text-[#0051c3] font-semibold border border-blue-200/60">
              {token}
            </span>
            <span className="text-xs text-neutral-500">
              {request?.category} • Max Budget ₦{request ? Number(request.maxBudget).toLocaleString() : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOffers}
              className="h-8 px-3 rounded-lg border border-neutral-200/80 text-xs text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3 stroke-[2px]" />
              <span>Refresh</span>
            </button>
            <button
              onClick={onGoToTracker}
              className="h-8 px-3 rounded-lg bg-neutral-100 text-xs font-medium text-neutral-800 hover:bg-neutral-200 transition-colors"
            >
              Live Tracker
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">
          {offers.length > 0
            ? `${offers.length} Verified Match${offers.length > 1 ? 'es' : ''} Ready`
            : 'Sourcing Matching Offers...'}
        </h1>
        <p className="text-sm text-neutral-500">
          Every device has been vetted for battery integrity, genuine display, and cosmetic condition. Sourced directly from verified campus sellers.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0051c3] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 stroke-[1.75px]" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-1">
            Verified Vendors Are Responding
          </h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
            We have broadcasted your request to verified sellers on WhatsApp. Offers are ingested, OCR-analyzed by AI, and will appear here shortly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSimulateResponse}
              disabled={simulating}
              className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {simulating ? 'Simulating vendor offer...' : 'Simulate Vendor Offer (Instant Demo)'}
            </button>
            <button
              onClick={onGoToTracker}
              className="h-10 px-4 rounded-xl border border-neutral-200/80 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              View Live Pipeline Tracker ➔
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer) => {
            const specs = offer.specs || {};
            const photo =
              offer.cloudinaryPhotos && offer.cloudinaryPhotos.length > 0
                ? offer.cloudinaryPhotos[0]
                : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80';

            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-7 hover:border-neutral-300 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Photo / Visual */}
                  <div className="md:col-span-5 relative">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200/70 relative">
                      <img
                        src={photo}
                        alt={offer.model}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium">
                        AVIF Optimized
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm text-xs font-semibold text-neutral-900 border border-neutral-200/80">
                        {offer.conditionGrade}
                      </div>
                    </div>
                  </div>

                  {/* Device Specs & Details */}
                  <div className="md:col-span-7 flex flex-col justify-between">
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{offer.seller?.businessName || 'Verified Campus Vendor'}</span>
                          <span className="text-emerald-500">★ {offer.seller?.rating || '5.0'}</span>
                        </div>

                        <span className="text-[11px] font-mono text-neutral-400">
                          AI Confidence: {(offer.aiConfidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mb-3">
                        {offer.brand} {offer.model}
                      </h2>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        {specs.cpu && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 text-neutral-700">
                            <Cpu className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                            <span className="truncate">{specs.cpu}</span>
                          </div>
                        )}
                        {specs.ram && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 text-neutral-700">
                            <HardDrive className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                            <span>{specs.ram} {specs.storage ? `• ${specs.storage}` : ''}</span>
                          </div>
                        )}
                        {specs.batteryHealth && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/60 text-emerald-800 border border-emerald-100">
                            <Battery className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span className="font-medium">{specs.batteryHealth}</span>
                          </div>
                        )}
                        {specs.screen && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 text-neutral-700">
                            <Monitor className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                            <span className="truncate">{specs.screen}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price & Selection Action */}
                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-[11px] text-neutral-400 uppercase font-semibold">
                          Final Price (No Hidden Fees)
                        </span>
                        <span className="text-2xl font-extrabold text-neutral-900 font-mono tracking-tight">
                          ₦{Number(offer.price).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectOffer(offer.id)}
                        className="h-11 px-5 rounded-xl bg-[#0051c3] hover:bg-[#0043a8] text-white text-sm font-medium flex items-center gap-1.5 transition-colors shadow-none"
                      >
                        <span>Select Device</span>
                        <ArrowRight className="w-4 h-4 stroke-[2px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
