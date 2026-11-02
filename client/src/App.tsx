import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RequestWizard } from './components/RequestWizard';
import { OfferShowcase } from './components/OfferShowcase';
import { DealConfirmed } from './components/DealConfirmed';
import { LiveTracker } from './components/LiveTracker';

// By default in local dev, points to our running Fastify backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

type ViewMode = 'wizard' | 'offers' | 'confirmed' | 'tracker';

export function App() {
  const [view, setView] = useState<ViewMode>('wizard');
  const [currentToken, setCurrentToken] = useState<string>('');

  // Read URL query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const viewParam = params.get('view') as ViewMode | null;

    if (token) {
      setCurrentToken(token.toUpperCase());
      if (viewParam && ['offers', 'confirmed', 'tracker'].includes(viewParam)) {
        setView(viewParam);
      } else {
        setView('offers');
      }
    }
  }, []);

  const handleRequestSubmitted = (token: string) => {
    setCurrentToken(token);
    setView('tracker');
    const url = new URL(window.location.href);
    url.searchParams.set('token', token);
    url.searchParams.set('view', 'tracker');
    window.history.pushState({}, '', url.toString());
  };

  const handleSearchToken = (token: string) => {
    setCurrentToken(token);
    setView('offers');
    const url = new URL(window.location.href);
    url.searchParams.set('token', token);
    url.searchParams.set('view', 'offers');
    window.history.pushState({}, '', url.toString());
  };

  const handleSelectOffer = async (offerId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/offers/${currentToken}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId }),
      });
      setView('confirmed');
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'confirmed');
      window.history.pushState({}, '', url.toString());
    } catch (err) {
      console.error('Failed to select offer:', err);
      setView('confirmed');
    }
  };

  const handleGoHome = () => {
    setView('wizard');
    setCurrentToken('');
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.delete('view');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans selection:bg-blue-100 selection:text-[#0051c3]">
      <Header
        onSearchToken={handleSearchToken}
        onGoHome={handleGoHome}
      />

      <main className="flex-1 pb-16">
        {view === 'wizard' && (
          <RequestWizard
            apiBaseUrl={API_BASE_URL}
            onRequestSubmitted={handleRequestSubmitted}
          />
        )}

        {view === 'offers' && currentToken && (
          <OfferShowcase
            token={currentToken}
            apiBaseUrl={API_BASE_URL}
            onSelectOffer={handleSelectOffer}
            onGoToTracker={() => setView('tracker')}
          />
        )}

        {view === 'confirmed' && currentToken && (
          <DealConfirmed
            token={currentToken}
            onGoHome={handleGoHome}
          />
        )}

        {view === 'tracker' && currentToken && (
          <LiveTracker
            token={currentToken}
            apiBaseUrl={API_BASE_URL}
            onViewOffers={() => setView('offers')}
            onGoHome={handleGoHome}
          />
        )}
      </main>

      <footer className="border-t border-neutral-200/80 bg-white py-6 px-4 text-center text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800">Handular</span>
            <span>• Verified Campus Electronics Brokerage</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Docker PostgreSQL Local</span>
            <span>Zero-Cost Infrastructure ($0)</span>
            <span>Fastify & Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
