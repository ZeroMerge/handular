import React from 'react';
import {
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from './ui/icons';
import { Button } from './ui/button';

interface DealConfirmedProps {
  token: string;
  onGoHome: () => void;
}

export const DealConfirmed: React.FC<DealConfirmedProps> = ({ token, onGoHome }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Success Badge */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-[12px] bg-[#10393b]/10 text-[#10393b] flex items-center justify-center mx-auto mb-3">
          <ShieldCheckIcon className="w-8 h-8 text-[#30c5ce]" />
        </div>
        <span className="inline-block px-3 py-0.5 rounded-full bg-[#10393b] text-[#30c5ce] text-xs font-normal mb-1.5 font-mono">
          RESERVED • {token}
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal text-[#10393b] tracking-tight">
          Your Device is Reserved!
        </h1>
      </div>

      {/* Campus Hub Pickup Card - ZERO BORDERS, ZERO SHADOWS, 18px RADIUS */}
      <div className="bg-white rounded-[18px] p-5 sm:p-7 space-y-5 mb-5">
        {/* Hub Location Box */}
        <div className="flex items-start gap-3 p-3.5 rounded-[12px] bg-[#eceae2]">
          <MapPinIcon className="w-5 h-5 text-[#10393b] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-normal text-[#10393b]">
              Campus Verification & Pickup Hub
            </h3>
            <p className="text-xs text-[#555555] mt-0.5 font-normal">
              Handular Tech Hub • Student Center Building, 1st Floor, Room 104
            </p>
            <p className="text-[11px] text-[#777777] mt-1 flex items-center gap-1.5 font-normal">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>Available Monday to Saturday: 9:00 AM – 6:00 PM</span>
            </p>
          </div>
        </div>

        {/* 4-Step Student Pickup Protocol */}
        <div>
          <h4 className="text-xs font-normal text-[#777777] mb-2.5">
            Handular 4-Step Inspection Guarantee
          </h4>
          <div className="space-y-2.5">
            {[
              'Inspect physical chassis, screen pixels, and hinge firmness.',
              'Verify CPU, RAM, and Battery Health directly in System Settings.',
              'Test power adapter, all ports, camera, keyboard, and speaker sound.',
              'Funds are held securely by Handular until you confirm 100% satisfaction.',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#333333]">
                <CheckCircleIcon className="w-4 h-4 text-[#30c5ce] flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Warranty Badge */}
        <div className="p-4 rounded-[12px] bg-[#10393b] text-white flex items-center justify-between">
          <div>
            <span className="block text-xs font-normal text-white">
              30-Day Campus Warranty
            </span>
            <span className="text-[11px] text-white/70">
              Free repair or replacement if hardware defects arise.
            </span>
          </div>
          <span className="text-xs font-normal px-2.5 py-1 rounded-[6px] bg-white text-[#10393b]">
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
          className="w-full sm:flex-1 h-11 rounded-[10px] bg-[#10393b] hover:bg-[#154b4d] text-white text-sm font-normal flex items-center justify-center gap-2 transition-all active:translate-y-[0.5px]"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 text-[#30c5ce]" />
          <span>Chat with Handular Hub on WhatsApp</span>
        </a>

        <Button
          onClick={onGoHome}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto h-11 text-sm font-normal"
        >
          <span>Back to Home</span>
        </Button>
      </div>
    </div>
  );
};
