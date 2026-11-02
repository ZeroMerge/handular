import React, { useState } from 'react';
import { Laptop, Smartphone, Headphones, ArrowRight, CheckCircle2, Shield, Clock } from 'lucide-react';

interface RequestWizardProps {
  apiBaseUrl: string;
  onRequestSubmitted: (token: string) => void;
}

export const RequestWizard: React.FC<RequestWizardProps> = ({
  apiBaseUrl,
  onRequestSubmitted,
}) => {
  const [category, setCategory] = useState<'LAPTOPS' | 'PHONES' | 'ACCESSORIES'>('LAPTOPS');
  const [brand, setBrand] = useState('Apple');
  const [useCase, setUseCase] = useState('Coding & Tech');
  const [minBudget, setMinBudget] = useState(250000);
  const [maxBudget, setMaxBudget] = useState(650000);
  const [preferredSpecs, setPreferredSpecs] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const budgetPresets = [
    { label: '< ₦250k', min: 100000, max: 250000 },
    { label: '₦250k – ₦450k', min: 250000, max: 450000 },
    { label: '₦450k – ₦750k', min: 450000, max: 750000 },
    { label: '₦750k+', min: 750000, max: 1500000 },
  ];

  const laptopBrands = ['Apple', 'Lenovo / ThinkPad', 'Dell', 'HP', 'Asus', 'Any Brand'];
  const phoneBrands = ['Apple iPhone', 'Samsung Galaxy', 'Google Pixel', 'Xiaomi', 'Any Brand'];

  const useCases = [
    'Coding & Tech',
    'Design & 3D Modeling',
    'School & Everyday Study',
    'Gaming & Video Editing',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!buyerName.trim() || !buyerPhone.trim()) {
      setError('Please provide your name and WhatsApp number so sellers can send you offers.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          buyerEmail: buyerEmail.trim() || undefined,
          category,
          brand,
          useCase,
          minBudget: Number(minBudget),
          maxBudget: Number(maxBudget),
          preferredSpecs: preferredSpecs.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit request');
      }

      const res = await response.json();
      onRequestSubmitted(res.data.publicToken);
    } catch (err: any) {
      setError(err.message || 'Network error connecting to Handular backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Cloudflare-style Announcement Pill */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200/80 bg-white text-xs font-medium text-neutral-700 shadow-none">
          <span>Onboard your request to Handular</span>
          <span className="text-sm">⚡ 💻 📱 🛡️</span>
        </div>
      </div>

      {/* Hero Headline */}
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-3">
          What are we sourcing today?
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 max-w-lg mx-auto">
          Specify what you need. Handular broadcasts to verified campus sellers, AI extracts and verifies specs, and you receive inspected offers with a 30-day guarantee.
        </p>
      </div>

      {/* Main Request Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Category Picker */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            1. Select Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'LAPTOPS', label: 'Laptop', icon: Laptop, sub: 'MacBook, ThinkPad, Dell' },
              { id: 'PHONES', label: 'Phone', icon: Smartphone, sub: 'iPhone, Galaxy, Pixel' },
              { id: 'ACCESSORIES', label: 'Accessories', icon: Headphones, sub: 'AirPods, Chargers' },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-[#0051c3] bg-blue-50/20 text-[#0051c3]'
                      : 'border-neutral-200/80 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 stroke-[1.75px] ${isSelected ? 'text-[#0051c3]' : 'text-neutral-500'}`} />
                  <span className="font-semibold text-sm">{cat.label}</span>
                  <span className="text-[11px] text-neutral-400 mt-0.5 hidden sm:block">
                    {cat.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Brand & Primary Purpose */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              2. Preferred Brand
            </label>
            <div className="flex flex-wrap gap-2">
              {(category === 'LAPTOPS' ? laptopBrands : phoneBrands).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`h-9 px-3.5 rounded-full text-xs font-medium border transition-colors ${
                    brand === b
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-200/80 hover:bg-neutral-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Primary Use-Case
            </label>
            <div className="flex flex-wrap gap-2">
              {useCases.map((uc) => (
                <button
                  key={uc}
                  type="button"
                  onClick={() => setUseCase(uc)}
                  className={`h-9 px-3.5 rounded-full text-xs font-medium border transition-colors ${
                    useCase === uc
                      ? 'bg-[#0051c3] text-white border-[#0051c3]'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200/80 hover:bg-neutral-100'
                  }`}
                >
                  {uc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: Target Budget Range */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              3. Maximum Budget
            </label>
            <span className="text-base font-bold text-neutral-900 font-mono">
              ₦{Number(maxBudget).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {budgetPresets.map((bp) => (
              <button
                key={bp.label}
                type="button"
                onClick={() => {
                  setMinBudget(bp.min);
                  setMaxBudget(bp.max);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                  maxBudget === bp.max
                    ? 'border-[#0051c3] bg-blue-50/20 text-[#0051c3]'
                    : 'border-neutral-200/80 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {bp.label}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="100000"
            max="1500000"
            step="25000"
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-full accent-[#0051c3] h-1.5 bg-neutral-200 rounded-lg cursor-pointer"
          />
        </div>

        {/* Step 4: Notes / Specs */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            4. Specific Requirements (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Must have at least 16GB RAM for Android Studio & Docker, pristine battery health (>85%), with original charger."
            value={preferredSpecs}
            onChange={(e) => setPreferredSpecs(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-neutral-200/80 text-sm text-neutral-800 focus:outline-none focus:border-[#0051c3] focus:ring-1 focus:ring-[#0051c3] placeholder:text-neutral-400 resize-none"
          />
        </div>

        {/* Step 5: Student Contact for Verified Sourcing */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 space-y-4">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            5. Your Contact for Receiving Curated Offers
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-xs text-neutral-500 mb-1">Your Full Name</span>
              <input
                type="text"
                required
                placeholder="e.g. Tunde Adeyemi"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/80 text-sm focus:outline-none focus:border-[#0051c3] focus:ring-1 focus:ring-[#0051c3]"
              />
            </div>
            <div>
              <span className="block text-xs text-neutral-500 mb-1">WhatsApp Phone Number</span>
              <input
                type="tel"
                required
                placeholder="e.g. 08012345678"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/80 text-sm focus:outline-none focus:border-[#0051c3] focus:ring-1 focus:ring-[#0051c3]"
              />
            </div>
          </div>
          <div>
            <span className="block text-xs text-neutral-500 mb-1">Email Address (Optional)</span>
            <input
              type="email"
              placeholder="e.g. student@university.edu"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200/80 text-sm focus:outline-none focus:border-[#0051c3] focus:ring-1 focus:ring-[#0051c3]"
            />
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* CTA Submit Button (Cloudflare electric blue, flat, rounded-xl) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-13 py-3.5 px-6 rounded-xl bg-[#0051c3] hover:bg-[#0043a8] text-white font-medium text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Broadcasting to Verified Campus Vendors...</span>
          ) : (
            <>
              <span>Find Matching Verified Offers</span>
              <ArrowRight className="w-4 h-4 stroke-[2px]" />
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-4 h-4 text-neutral-400 mb-1" />
            <span className="text-[11px] text-neutral-500">30-Day Guarantee</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-4 h-4 text-neutral-400 mb-1" />
            <span className="text-[11px] text-neutral-500">Physical Inspection</span>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-4 h-4 text-neutral-400 mb-1" />
            <span className="text-[11px] text-neutral-500">Avg Match: 3 Hours</span>
          </div>
        </div>
      </form>
    </div>
  );
};
