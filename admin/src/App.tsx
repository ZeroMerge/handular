import { useState } from 'react';
import { 
  Laptop, Search, CheckCircle2, XCircle, 
  Clock, Sparkles, TrendingUp, Volume2, ZoomIn 
} from 'lucide-react';

interface RequestItem {
  id: string;
  token: string;
  buyerName: string;
  category: 'LAPTOPS' | 'PHONES';
  targetSpecs: string;
  maxBudget: string;
  sellersBroadcasted: number;
  offersReceived: number;
  pendingReviews: number;
  status: 'BROADCASTED' | 'OFFERS_READY' | 'COMPLETED' | 'EXPIRED';
  timeLeft: string;
}

export default function AdminApp() {
  const [activeTab, setActiveTab] = useState<'all' | 'laptops' | 'phones' | 'reviews'>('all');
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const mockRequests: RequestItem[] = [
    {
      id: '1',
      token: 'REQ-8492',
      buyerName: 'Alex Daniel',
      category: 'LAPTOPS',
      targetSpecs: 'ThinkPad T14 / Core i7 / 16GB / 512GB SSD',
      maxBudget: '₦400,000',
      sellersBroadcasted: 18,
      offersReceived: 3,
      pendingReviews: 1,
      status: 'OFFERS_READY',
      timeLeft: '2h 15m',
    },
    {
      id: '2',
      token: 'REQ-8495',
      buyerName: 'Chidinma O.',
      category: 'PHONES',
      targetSpecs: 'iPhone 13 / 128GB / Factory Unlocked / 85%+ Batt',
      maxBudget: '₦520,000',
      sellersBroadcasted: 24,
      offersReceived: 4,
      pendingReviews: 0,
      status: 'OFFERS_READY',
      timeLeft: '4h 05m',
    },
    {
      id: '3',
      token: 'REQ-8501',
      buyerName: 'Ibrahim Musa',
      category: 'LAPTOPS',
      targetSpecs: 'MacBook Air M1 / 8GB / 256GB / Space Gray',
      maxBudget: '₦480,000',
      sellersBroadcasted: 22,
      offersReceived: 1,
      pendingReviews: 1,
      status: 'BROADCASTED',
      timeLeft: '5h 42m',
    },
  ];

  const handleOpenReview = (request: RequestItem) => {
    setSelectedOffer({
      id: 'OFF-7128',
      requestToken: request.token,
      sellerName: 'Verified Seller #14 (TechPort Hub)',
      whatsapp: '+234 812 345 6789',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 1',
      cpu: 'Intel Core i7-10510U',
      ram: '16GB DDR4',
      storage: '512GB NVMe SSD',
      batteryHealth: '88% (4.5 hours capacity)',
      screen: '14.0" FHD IPS (Clean, no dead pixels)',
      conditionGrade: 'Grade A - Pristine',
      price: '360,000',
      isNegotiable: true,
      warranty: '30-Day Testing Warranty Included',
      aiConfidence: 0.78,
      flagReason: 'Price detected from informal slang ("360k last"). Verify battery report image.',
      rawMessage: 'Available boss. Clean US used T14 core i7 10th gen 16gb 512ssd battery 4hrs. 360k last price. Charger included.',
      voiceNoteDuration: '0:22',
      photos: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
      ],
    });
    setReviewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Cloudflare-style Top Admin Navigation */}
      <header className="h-14 border-b border-neutral-200/80 px-6 sm:px-8 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0051c3] flex items-center justify-center text-white font-bold text-xs">
            H
          </div>
          <span className="font-semibold text-neutral-900 tracking-tight text-sm">Handular Admin</span>
          <span className="text-neutral-300">/</span>
          <span className="text-xs font-medium text-neutral-500">Campus Sourcing Ops</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Ops Node Online
          </span>
          <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-bold">
            JM
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-6">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-none">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              <span>Active Requests</span>
              <Laptop className="w-4 h-4 text-neutral-400" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-neutral-900">14</div>
            <p className="text-xs text-neutral-400 mt-1">4 awaiting seller broadcast</p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-none">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              <span>Pending AI Review</span>
              <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-amber-600">2</div>
            <p className="text-xs text-neutral-400 mt-1">Confidence score &lt; 0.85</p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-none">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              <span>Offers Ready</span>
              <CheckCircle2 className="w-4 h-4 text-blue-500" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-[#0051c3]">8</div>
            <p className="text-xs text-neutral-400 mt-1">Curated links sent to students</p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-none">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              <span>Volume This Week</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600">₦3,840,000</div>
            <p className="text-xs text-neutral-400 mt-1">11 deals closed successfully</p>
          </div>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'laptops', label: 'Laptops' },
              { id: 'phones', label: 'Phones' },
              { id: 'reviews', label: 'Needs Review (2)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search requests, sellers..."
                className="h-9 pl-9 pr-4 bg-white border border-neutral-200/80 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0051c3]"
              />
            </div>
            <button className="h-9 px-3.5 bg-[#0051c3] hover:bg-[#0043a8] text-white rounded-xl text-xs font-medium transition-colors">
              + Manual Sourcing
            </button>
          </div>
        </div>

        {/* Requests Data Table */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafafa] border-b border-neutral-200/80 text-neutral-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Target Specs</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Sellers</th>
                  <th className="py-3 px-4">Offers</th>
                  <th className="py-3 px-4">Time Left</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/60 text-neutral-700">
                {mockRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-900">
                      {req.token}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-900">
                      {req.buyerName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700">
                        {req.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-neutral-600">
                      {req.targetSpecs}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900">
                      {req.maxBudget}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-neutral-500">{req.sellersBroadcasted} broadcasted</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-900">{req.offersReceived} ready</span>
                        {req.pendingReviews > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {req.pendingReviews} in review
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-neutral-500 font-mono">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {req.timeLeft}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {req.pendingReviews > 0 ? (
                        <button
                          onClick={() => handleOpenReview(req)}
                          className="h-7 px-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Review AI Offer
                        </button>
                      ) : (
                        <button className="h-7 px-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-medium transition-colors">
                          View Offers
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 1-Click Verification Cockpit Modal */}
      {reviewModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="h-14 px-6 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-neutral-900">Verification Cockpit</span>
                <span className="text-neutral-300">•</span>
                <span className="text-xs text-neutral-500 font-mono">{selectedOffer.id} ({selectedOffer.requestToken})</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                  AI Confidence: {Math.round(selectedOffer.aiConfidence * 100)}%
                </span>
              </div>
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Split Screen Body */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200/80 overflow-y-auto p-6 gap-6">
              {/* Left Pane: Evidence */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Raw Inbound Evidence
                </div>
                {/* Photo Strip */}
                <div className="grid grid-cols-2 gap-2">
                  {selectedOffer.photos.map((src: string, idx: number) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-neutral-200/80 group">
                      <img src={src} alt="Device Evidence" className="w-full h-36 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Raw WhatsApp Chat */}
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3.5 space-y-1">
                  <div className="text-[11px] font-semibold text-neutral-500">Seller Message:</div>
                  <p className="text-xs text-neutral-800 leading-relaxed font-mono">
                    "{selectedOffer.rawMessage}"
                  </p>
                </div>

                {/* Audio Voice Note Player */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#0051c3]">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Note ({selectedOffer.voiceNoteDuration}) — Transcribed by Cloudflare Whisper</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0051c3]">Verified</span>
                </div>

                {/* Seller Meta */}
                <div className="text-xs text-neutral-500 border-t border-neutral-100 pt-3 flex justify-between">
                  <span>Vendor: <strong className="text-neutral-800">{selectedOffer.sellerName}</strong></span>
                  <span className="font-mono text-neutral-600">{selectedOffer.whatsapp}</span>
                </div>
              </div>

              {/* Right Pane: AI Structured Fields */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex justify-between items-center">
                  <span>AI Extracted Specifications</span>
                  <span className="text-[11px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    ⚠️ Verify Price & Grade
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1">Brand</label>
                      <input 
                        defaultValue={selectedOffer.brand} 
                        className="w-full h-8 px-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Model</label>
                      <input 
                        defaultValue={selectedOffer.model} 
                        className="w-full h-8 px-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1">Processor</label>
                      <input 
                        defaultValue={selectedOffer.cpu} 
                        className="w-full h-8 px-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">RAM</label>
                      <input 
                        defaultValue={selectedOffer.ram} 
                        className="w-full h-8 px-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-neutral-400 block mb-1">Storage</label>
                      <input 
                        defaultValue={selectedOffer.storage} 
                        className="w-full h-8 px-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 block mb-1">Battery Health</label>
                      <input 
                        defaultValue={selectedOffer.batteryHealth} 
                        className="w-full h-8 px-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Condition Grade</label>
                    <select 
                      defaultValue={selectedOffer.conditionGrade}
                      className="w-full h-8 px-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                    >
                      <option>Grade A - Pristine</option>
                      <option>Grade B+ - Minor Wear</option>
                      <option>Grade B - Moderate Scratches</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Final Price (₦)</label>
                    <input 
                      defaultValue={selectedOffer.price} 
                      className="w-full h-8 px-2.5 bg-emerald-50 border border-emerald-200 font-bold text-emerald-800 rounded-lg text-xs" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Cockpit Action Bar */}
            <div className="h-16 px-6 border-t border-neutral-200/80 bg-neutral-50 flex items-center justify-between">
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="h-10 px-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Spam (Esc)</span>
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setReviewModalOpen(false)}
                  className="h-10 px-4 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 rounded-xl text-xs font-medium transition-colors"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => {
                    alert('Offer verified! Published to student comparison showcase.');
                    setReviewModalOpen(false);
                  }}
                  className="h-10 px-5 bg-[#0051c3] hover:bg-[#0043a8] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-none"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Publish to Student (Enter)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
