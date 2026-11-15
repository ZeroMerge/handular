import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { RequestWizard } from './components/RequestWizard';
import { OrdersView } from './components/OrdersView';
import { ProfileView } from './components/ProfileView';
import { OfferShowcase } from './components/OfferShowcase';
import { DealConfirmed } from './components/DealConfirmed';
import { LiveTracker } from './components/LiveTracker';
import { AuthScreen } from './components/AuthScreen';
import { ChatSidebar } from './components/ChatSidebar';
import { StudentUser, ChatSessionSummary } from './types';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

type ViewMode = 'wizard' | 'orders' | 'profile' | 'offers' | 'confirmed' | 'tracker';

export function App() {
  const [view, setView] = useState<ViewMode>('wizard');
  const [currentToken, setCurrentToken] = useState<string>('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);

  // ChatGPT-style Sidebar & Chat Threads State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState<ChatSessionSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('handular_token');
      const storedUser = localStorage.getItem('handular_user');
      if (storedToken && storedUser) {
        setAuthToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));

        const storedChatId = localStorage.getItem('handular_active_chat');
        if (storedChatId) {
          setActiveChatId(storedChatId);
        }

        // Revalidate session with backend
        fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Session expired');
          })
          .then((data) => {
            if (data?.user) {
              setCurrentUser(data.user);
              localStorage.setItem('handular_user', JSON.stringify(data.user));
            }
          })
          .catch(() => {
            localStorage.removeItem('handular_token');
            localStorage.removeItem('handular_user');
            setCurrentUser(null);
            setAuthToken(null);
          })
          .finally(() => {
            setIsInitializingAuth(false);
          });
        return;
      }
    } catch (e) {
      console.warn('Could not load session from storage', e);
    }
    setIsInitializingAuth(false);
  }, []);

  // Read URL query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const viewParam = params.get('view') as ViewMode | null;

    if (token) {
      setCurrentToken(token.toUpperCase());
      if (viewParam && ['offers', 'confirmed', 'tracker', 'orders', 'profile'].includes(viewParam)) {
        setView(viewParam);
      } else {
        setView('offers');
      }
    }
  }, []);

  const handleAuthSuccess = (user: StudentUser, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    try {
      localStorage.setItem('handular_user', JSON.stringify(user));
      localStorage.setItem('handular_token', token);

      // Restore and sync draft chat if one was started before signing in
      const draftRaw = localStorage.getItem('handular_draft_chat');
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft.messages && draft.messages.length > 2 && !draft.chatId) {
          fetch(`${API_BASE_URL}/api/v1/chats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: `${draft.brand || draft.category || 'New Sourcing'} Request`,
              messages: draft.messages,
            }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data?.chat?.id) {
                setActiveChatId(data.chat.id);
                try {
                  localStorage.setItem('handular_active_chat', data.chat.id);
                } catch {}
                fetchChats();
              }
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Failed to save session to localStorage:', err);
    }
  };

  const handleUpdateUser = (updatedUser: StudentUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('handular_user', JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('Failed to save updated user to localStorage:', err);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setChats([]);
    setActiveChatId(null);
    try {
      localStorage.removeItem('handular_user');
      localStorage.removeItem('handular_token');
      localStorage.removeItem('handular_active_chat');
    } catch (err) {
      console.warn('Failed to clear session:', err);
    }
    setView('wizard');
  };

  const fetchChats = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chats) setChats(data.chats);
      }
    } catch (err) {
      console.warn('Failed to fetch chats:', err);
    }
  }, [authToken]);

  useEffect(() => {
    if (currentUser && authToken) {
      fetchChats();
    }
  }, [currentUser, authToken, fetchChats]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    try {
      localStorage.setItem('handular_active_chat', chatId);
    } catch {}
    setView('wizard');
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    try {
      localStorage.removeItem('handular_active_chat');
      localStorage.removeItem('handular_draft_chat');
    } catch {}
    setView('wizard');
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          try {
            localStorage.removeItem('handular_active_chat');
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Failed to delete chat:', err);
    }
  };

  const handleRequestSubmitted = (token: string) => {
    setCurrentToken(token);
    setView('tracker');
    const url = new URL(window.location.href);
    url.searchParams.set('token', token);
    url.searchParams.set('view', 'tracker');
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

  const handleSelectTab = (tab: 'wizard' | 'orders' | 'profile') => {
    setView(tab);
    const url = new URL(window.location.href);
    if (tab === 'wizard') {
      url.searchParams.delete('token');
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', tab);
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSelectRequestFromOrders = (publicToken: string) => {
    setCurrentToken(publicToken);
    setView('offers');
    const url = new URL(window.location.href);
    url.searchParams.set('token', publicToken);
    url.searchParams.set('view', 'offers');
    window.history.pushState({}, '', url.toString());
  };

  const handleCloseOfferPeek = () => {
    setView('orders');
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    url.searchParams.set('view', 'orders');
    window.history.pushState({}, '', url.toString());
  };

  // While validating initial session token
  if (isInitializingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f4ef] flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-black/10 border-t-[#10393b] rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, render the clean Handular Login / Registration entry screen
  if (!currentUser || !authToken) {
    return (
      <AuthScreen
        apiBaseUrl={API_BASE_URL}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // Once authenticated, render main client portal
  return (
    <div className="min-h-screen bg-[#f5f4ef] text-[#10393b] flex flex-col font-sans selection:bg-[#10393b] selection:text-white">
      <Header
        activeTab={view}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* ChatGPT-Style Left Drawer Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <main className={`flex-1 ${view === 'wizard' ? 'overflow-hidden' : 'pb-24 md:pb-16'}`}>
        {view === 'wizard' && (
          <RequestWizard
            apiBaseUrl={API_BASE_URL}
            onRequestSubmitted={handleRequestSubmitted}
            currentUser={currentUser}
            activeChatId={activeChatId}
            onChatSessionCreated={(id) => {
              setActiveChatId(id);
              try {
                localStorage.setItem('handular_active_chat', id);
              } catch {}
              fetchChats();
            }}
          />
        )}

        {(view === 'orders' || view === 'offers') && (
          <OrdersView
            apiBaseUrl={API_BASE_URL}
            token={authToken}
            user={currentUser}
            onSelectRequest={handleSelectRequestFromOrders}
            onCreateNewRequest={() => handleSelectTab('wizard')}
          />
        )}

        {/* Notion-style Side Peek Drawer for Offers */}
        {view === 'offers' && currentToken && (
          <OfferShowcase
            token={currentToken}
            apiBaseUrl={API_BASE_URL}
            onClose={handleCloseOfferPeek}
            onSelectOffer={handleSelectOffer}
            onGoToTracker={() => setView('tracker')}
          />
        )}

        {view === 'profile' && (
          <ProfileView
            user={currentUser}
            token={authToken}
            apiBaseUrl={API_BASE_URL}
            onUpdateUser={handleUpdateUser}
            onSignOut={handleSignOut}
            onGoToRequests={() => handleSelectTab('wizard')}
            onGoToOrders={() => handleSelectTab('orders')}
          />
        )}

        {view === 'confirmed' && currentToken && (
          <DealConfirmed
            token={currentToken}
            onGoHome={() => handleSelectTab('wizard')}
          />
        )}

        {view === 'tracker' && currentToken && (
          <LiveTracker
            token={currentToken}
            apiBaseUrl={API_BASE_URL}
            onViewOffers={() => setView('offers')}
            onGoHome={() => handleSelectTab('wizard')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
