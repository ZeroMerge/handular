import { useState } from 'react';
import { Laptop, Smartphone, ShieldCheck, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function App() {
  const [category, setCategory] = useState<'LAPTOPS' | 'PHONES'>('LAPTOPS');
  const [useCase, setUseCase] = useState<string>('coding');
  const [brand, setBrand] = useState<string>('any');
  const [budget, setBudget] = useState<number>(350000);
  const [phone, setPhone] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-neutral-200/80 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Check className="w-6 h-6" strokeWidth={2} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60 mb-3">
            Reference #REQ-8492
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 mb-2">Request Broadcasted!</h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            We are actively sourcing matching options from verified campus sellers. You will receive a direct link on WhatsApp as soon as your top offers are ready.
          </p>
          <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-4 text-left text-xs text-neutral-600 space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-400">Target Budget:</span>
              <span className="font-medium text-neutral-800">{formatNaira(budget)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Category:</span>
              <span className="font-medium text-neutral-800">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">WhatsApp:</span>
              <span className="font-medium text-neutral-800">{phone || '+234 810 000 0000'}</span>
            </div>
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="w-full h-11 bg-neutral-100 hover:bg-neutral-200/70 text-neutral-800 font-medium text-sm rounded-xl transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Cloudflare-style Minimal Nav Bar */}
      <header className="h-14 border-b border-neutral-200/70 px-4 sm:px-8 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0051c3] flex items-center justify-center text-white font-bold text-xs">
            H
          </div>
          <span className="font-semibold text-neutral-900 tracking-tight text-base">Handular</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Verified Sourcing Network
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Cloudflare Pill Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white text-neutral-800 border border-neutral-200/80 shadow-none">
            <span>Verified Campus Brokerage</span>
            <span className="text-neutral-300">•</span>
            <span className="flex items-center gap-1 text-[#0051c3]">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
              Avg match: 3 hours
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-2">
            What are you looking for?
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base max-w-md mx-auto">
            Tell us your budget and specs. We broadcast directly to verified campus sellers and curate the 3 best options.
          </p>
        </div>

        {/* Request Form Card */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Step 1: Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5">
              Select Device Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('LAPTOPS')}
                className={`flex items-center justify-center gap-2.5 h-13 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  category === 'LAPTOPS'
                    ? 'border-[#0051c3] bg-blue-50/40 text-[#0051c3] ring-1 ring-[#0051c3]'
                    : 'border-neutral-200/80 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Laptop className="w-4 h-4" strokeWidth={1.75} />
                <span>Laptop</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('PHONES')}
                className={`flex items-center justify-center gap-2.5 h-13 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  category === 'PHONES'
                    ? 'border-[#0051c3] bg-blue-50/40 text-[#0051c3] ring-1 ring-[#0051c3]'
                    : 'border-neutral-200/80 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Smartphone className="w-4 h-4" strokeWidth={1.75} />
                <span>Phone</span>
              </button>
            </div>
          </div>

          {/* Step 2: Use-Case */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5">
              Primary Use-Case
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'coding', label: '💻 Coding / Software' },
                { id: 'design', label: '🎨 Graphic & UI Design' },
                { id: 'school', label: '📚 School & Daily Work' },
                { id: 'gaming', label: '🎮 Video Editing / 3D' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setUseCase(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    useCase === item.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Preferred Brand */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5">
              Brand Preference
            </label>
            <div className="flex flex-wrap gap-2">
              {['any', 'Apple', 'Lenovo / ThinkPad', 'Dell', 'HP', 'Samsung'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    brand === b
                      ? 'bg-[#0051c3] text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  {b === 'any' ? 'Open to Any Brand' : b}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Budget Range */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Target Budget
              </label>
              <span className="text-sm font-bold text-[#0051c3]">{formatNaira(budget)}</span>
            </div>
            <input
              type="range"
              min={150000}
              max={1500000}
              step={25000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#0051c3]"
            />
            <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
              <span>₦150k</span>
              <span>₦750k</span>
              <span>₦1.5M+</span>
            </div>
          </div>

          {/* Step 5: Contact Info */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5">
              Your WhatsApp Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="0810 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-neutral-200/80 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0051c3]/20 focus:border-[#0051c3] transition-all"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">
              We only use this to send you your curated offer comparison link.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="w-full h-12 bg-[#0051c3] hover:bg-[#0043a8] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-none outline-none mt-2"
          >
            <span>Broadcast Request to Verified Sellers</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Trust Footer */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
            Physical Device Inspection
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" strokeWidth={1.75} />
            Escrow Handover
          </span>
        </div>
      </main>
    </div>
  );
}
