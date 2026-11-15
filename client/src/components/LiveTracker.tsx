import React, { useState, useEffect } from 'react';
import { BuyerRequestData } from '../types';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from './ui/icons';
import { Button } from './ui/button';

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

  const fetchTrackerData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError(null);
      const res = await fetch(`${apiBaseUrl}/api/v1/offers/${token}`);
      if (!res.ok) {
        throw new Error(`Could not find request with code ${token}`);
      }
      const data = await res.json();
      setRequest(data.request);
      setOffersCount((data.offers || []).length);
    } catch (err: any) {
      if (!isBackground) setError(err.message || 'Error tracking request');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
    const interval = setInterval(() => {
      fetchTrackerData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-black/10 border-t-[#111111] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#777777]">Checking status for {token}...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ExclamationCircleIcon className="w-10 h-10 text-[#888888] mx-auto mb-3" />
        <h2 className="text-xl font-normal text-[#10393b] mb-1">Request Not Found</h2>
        <p className="text-xs text-[#777777] mb-5">{error || 'Please check your token code and try again.'}</p>
        <Button
          onClick={onGoHome}
          variant="primary"
          size="md"
        >
          Return to Request Wizard
        </Button>
      </div>
    );
  }

  const milestones = [
    {
      title: '1. Request Received',
      desc: `Looking for ${request.category} (Up to ₦${Number(request.maxBudget).toLocaleString()})`,
      done: true,
    },
    {
      title: '2. Sent to Sellers',
      desc: 'Shared with campus sellers to find matching devices',
      done: true,
    },
    {
      title: '3. Checking Device Details',
      desc: 'Checking specs, screen condition, and battery health',
      done: offersCount > 0,
      active: offersCount === 0,
    },
    {
      title: '4. Quality Check',
      desc: 'Making sure everything is in great working shape',
      done: offersCount > 0,
      active: offersCount === 0,
    },
    {
      title: '5. Ready to Review',
      desc: `${offersCount} device${offersCount === 1 ? '' : 's'} ready for you to see`,
      done: offersCount > 0,
      highlight: true,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Card - ZERO BORDERS, ZERO SHADOWS, 18px RADIUS */}
      <div className="bg-white rounded-[18px] p-5 sm:p-6 mb-5">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="inline-flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-2.5 py-0.5 rounded-[6px] bg-[#10393b] text-[#30c5ce] font-normal">
              #{request.publicToken}
            </span>
            <span className="text-xs font-normal text-white bg-[#10393b] px-2.5 py-0.5 rounded-[6px]">
              {request.status}
            </span>
          </div>

          <Button
            onClick={() => fetchTrackerData()}
            variant="ghost"
            size="sm"
            className="text-[#666666] hover:text-[#10393b] h-8 px-2 font-normal"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 mr-1" />
            <span>Refresh</span>
          </Button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-normal text-[#10393b] tracking-tight">
          Order Status
        </h1>
      </div>

      {/* Pipeline Milestones - ZERO BORDERS, ZERO SHADOWS, 18px RADIUS */}
      <div className="bg-white rounded-[18px] p-5 sm:p-7 space-y-5 mb-5">
        <h3 className="text-xs font-normal text-[#777777]">
          Sourcing Progress
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#eceae2]">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-0.5">
                {m.done ? (
                  <CheckCircleIcon className="w-5 h-5 text-[#30c5ce] bg-white rounded-full" />
                ) : m.active ? (
                  <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10393b]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#eceae2] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#dcdad2]" />
                  </div>
                )}
              </div>

              <div>
                <h4 className={`text-sm font-normal ${m.done ? 'text-[#10393b]' : m.active ? 'text-[#10393b]' : 'text-[#888888]'}`}>
                  {m.title}
                </h4>
                <p className="text-xs text-[#666666] mt-0.5 font-normal">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {offersCount > 0 ? (
          <Button
            onClick={onViewOffers}
            variant="primary"
            size="lg"
            className="w-full sm:flex-1 h-11 text-sm font-normal"
          >
            <span>View Sourced Offers ({offersCount})</span>
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div className="w-full sm:flex-1 h-11 rounded-[10px] bg-[#eceae2] text-[#555555] text-xs font-normal flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffad24] animate-pulse" />
            <span>Awaiting vendor offers via Telegram & WhatsApp...</span>
          </div>
        )}

        <Button
          onClick={onGoHome}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto h-11 text-sm font-normal"
        >
          Back to Wizard
        </Button>
      </div>
    </div>
  );
};
