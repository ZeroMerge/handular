import React, { useState, useEffect } from 'react';
import { BuyerRequestData } from '../types';
import { CheckCircle2, Circle, ArrowRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface LiveTrackerProps {
  token: string;
  apiBaseUrl: string;
  onViewOffers: () => void;
  onGoHome: () => void;
}

export const LiveTracker: React.FC<LiveTrackerProps> = ({
  token,
  apiBaseUrl,
  onViewOffers,
  onGoHome,
}) => {
  const [request, setRequest] = useState<BuyerRequestData | null>(null);
  const [offersCount, setOffersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const fetchTrackerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBaseUrl}/api/v1/offers/${token}`);
      if (!res.ok) {
        throw new Error(`Could not find request with code ${token}`);
      }
      const data = await res.json();
      setRequest(data.request);
      setOffersCount((data.offers || []).length);
    } catch (err: any) {
      setError(err.message || 'Error tracking request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, [token]);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      await fetch(`${apiBaseUrl}/api/v1/simulation/simulate-seller-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          sellerPhone: '2348012345678',
          message: `Boss, MacBook Pro 14" M1 Pro 16GB 512GB, pristine 94% battery health, ₦620,000.`,
        }),
      });
      await fetchTrackerData();
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#0051c3] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500">Checking status for {token}...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Request Not Found</h2>
        <p className="text-xs text-neutral-500 mb-6">{error || 'Please check your token code and try again.'}</p>
        <button
          onClick={onGoHome}
          className="h-10 px-5 rounded-xl bg-neutral-900 text-white text-xs font-medium"
        >
          Return to Request Wizard
        </button>
      </div>
    );
  }

  const milestones = [
    {
      title: 'Request Registered & Scoped',
      desc: `Categorized under ${request.category} (Max ₦${Number(request.maxBudget).toLocaleString()})`,
      done: true,
    },
    {
      title: 'Broadcasted to Verified Campus Sellers',
      desc: 'Dispatched to verified sellers on WhatsApp & Telegram',
      done: true,
    },
    {
      title: 'Multimodal AI Offer Extraction',
      desc: 'Transcribing voice notes, OCR screen specs, condition assessment',
      done: offersCount > 0,
      active: offersCount === 0,
    },
    {
      title: 'Human Staff Inspection & Verification',
      desc: 'Checking component integrity & matching against price benchmark',
      done: offersCount > 0,
      active: offersCount === 0,
    },
    {
      title: 'Curated Verified Offers Ready',
      desc: `${offersCount} inspected offer(s) available for student review`,
      done: offersCount > 0,
      highlight: true,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-sm uppercase px-3 py-1 rounded-full bg-blue-50 text-[#0051c3] font-bold border border-blue-200/60">
              {request.publicToken}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {request.status}
            </span>
          </div>

          <button
            onClick={fetchTrackerData}
            className="h-8 px-2.5 rounded-lg border border-neutral-200/80 text-xs text-neutral-500 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3 stroke-[2px]" />
            <span>Refresh</span>
          </button>
        </div>

        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-1">
          Tracking Sourcing Pipeline
        </h1>
        <p className="text-xs text-neutral-500">
          Buyer: <span className="text-neutral-800 font-medium">{request.buyerName}</span> • WhatsApp: {request.buyerPhone}
        </p>
      </div>

      {/* Pipeline Milestones */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-7 space-y-6 mb-6">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Sourcing Progress
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200/80">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-0.5">
                {m.done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 bg-white rounded-full" />
                ) : m.active ? (
                  <div className="w-5 h-5 rounded-full border-2 border-[#0051c3] bg-blue-50 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-[#0051c3]" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-neutral-300 bg-white rounded-full" />
                )}
              </div>

              <div>
                <h4 className={`text-sm font-semibold ${m.done ? 'text-neutral-900' : m.active ? 'text-[#0051c3]' : 'text-neutral-400'}`}>
                  {m.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {offersCount > 0 ? (
          <button
            onClick={onViewOffers}
            className="w-full sm:flex-1 h-12 rounded-xl bg-[#0051c3] hover:bg-[#0043a8] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <span>View Sourced Offers ({offersCount})</span>
            <ArrowRight className="w-4 h-4 stroke-[2px]" />
          </button>
        ) : (
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full sm:flex-1 h-12 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{simulating ? 'Simulating vendor response...' : 'Simulate Vendor Response (Demo Shortcut)'}</span>
          </button>
        )}

        <button
          onClick={onGoHome}
          className="w-full sm:w-auto h-12 px-5 rounded-xl border border-neutral-200/80 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Back to Wizard
        </button>
      </div>
    </div>
  );
};
