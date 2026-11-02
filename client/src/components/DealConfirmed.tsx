import React from 'react';
import { ShieldCheck, MapPin, Clock, Phone, CheckCircle, ArrowLeft } from 'lucide-react';

interface DealConfirmedProps {
  token: string;
  onGoHome: () => void;
}

export const DealConfirmed: React.FC<DealConfirmedProps> = ({ token, onGoHome }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 stroke-[2px]" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2 font-mono">
          DEAL RESERVED • {token}
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
          Your Device is Locked & Ready
        </h1>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          We have notified the campus seller. Your selected price is secured with Handular Buyer Escrow Protection.
        </p>
      </div>

      {/* Campus Hub Pickup Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-7 space-y-6 mb-6">
        <div className="flex items-start gap-3 pb-5 border-b border-neutral-100">
          <MapPin className="w-5 h-5 text-[#0051c3] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Campus Verification & Pickup Hub
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Handular Tech Hub • Student Center Building, 1st Floor, Room 104
            </p>
            <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Available Monday to Saturday: 9:00 AM – 6:00 PM</span>
            </p>
          </div>
        </div>

        {/* 4-Step Student Pickup Protocol */}
        <div>
          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
            Handular 4-Step Inspection Guarantee
          </h4>
          <div className="space-y-2.5">
            {[
              'Inspect physical chassis, screen pixels, and hinge firmness.',
              'Verify CPU, RAM, and Battery Health directly in System Settings.',
              'Test power adapter, all ports, camera, keyboard, and speaker sound.',
              'Funds are held securely by Handular until you confirm 100% satisfaction.',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Warranty Badge */}
        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200/60 flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-[#0051c3]">
              30-Day Campus Warranty
            </span>
            <span className="text-[11px] text-neutral-600">
              Free repair or replacement if hardware defects arise.
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-[#0051c3] text-white">
            Active
          </span>
        </div>
      </div>

      {/* Direct Contact Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href="https://wa.me/2348012345678?text=Hello%20Handular%20Team,%20I%20just%20reserved%20my%20device%20for%20request%20token%20"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Chat with Handular Hub on WhatsApp</span>
        </a>

        <button
          onClick={onGoHome}
          className="w-full sm:w-auto h-12 px-5 rounded-xl border border-neutral-200/80 text-sm font-medium text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};
