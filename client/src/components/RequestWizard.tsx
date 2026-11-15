import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from './ui/icons';
import { StudentUser, OfferData } from '../types';
import { Button } from './ui/button';

interface RequestWizardProps {
  apiBaseUrl: string;
  onRequestSubmitted: (token: string) => void;
  currentUser: StudentUser | null;
  activeChatId: string | null;
  onChatSessionCreated?: (chatId: string) => void;
}

type Step = 'category' | 'brand' | 'use_case' | 'budget' | 'specs' | 'summary' | 'completed';

interface ChatMsg {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  status?: 'sending' | 'delivered';
}

interface DraftChatData {
  chatId?: string | null;
  category: 'LAPTOPS' | 'PHONES' | 'ACCESSORIES';
  brand: string;
  useCase: string;
  maxBudget: number;
  selectedSpecs: string[];
  customNotes: string;
  currentStep: Step;
  messages: ChatMsg[];
}

function inferWizardStateFromMessages(msgs: ChatMsg[]) {
  const userMsgs = msgs.filter((m) => m.sender === 'user');
  let category: 'LAPTOPS' | 'PHONES' | 'ACCESSORIES' = 'LAPTOPS';
  let brand = 'Apple MacBook';
  let useCase = 'Coding & Tech';
  let maxBudget = 400000;
  let selectedSpecs: string[] = [];
  let customNotes = '';
  let inferredStep: Step = 'category';

  if (userMsgs.length >= 1) {
    const text0 = userMsgs[0].text.toUpperCase();
    if (text0.includes('PHONE')) {
      category = 'PHONES';
      brand = 'Apple iPhone';
    } else if (text0.includes('ACCESSOR')) {
      category = 'ACCESSORIES';
      brand = 'AirPods';
    } else {
      category = 'LAPTOPS';
      brand = 'Apple MacBook';
    }
    inferredStep = 'brand';
  }

  if (userMsgs.length >= 2) {
    brand = userMsgs[1].text;
    inferredStep = 'use_case';
  }

  if (userMsgs.length >= 3) {
    useCase = userMsgs[2].text;
    inferredStep = 'budget';
  }

  if (userMsgs.length >= 4) {
    const rawBudget = userMsgs[3].text.replace(/[^0-9]/g, '');
    const parsed = parseInt(rawBudget, 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxBudget = parsed;
    }
    inferredStep = 'specs';
  }

  if (userMsgs.length >= 5) {
    const specsMsg = userMsgs[4].text;
    if (specsMsg && specsMsg !== 'Standard clean condition') {
      const parts = specsMsg.split(',').map((s) => s.trim()).filter(Boolean);
      selectedSpecs = parts;
    }
    inferredStep = 'summary';
  }

  return {
    category,
    brand,
    useCase,
    maxBudget,
    selectedSpecs,
    customNotes,
    inferredStep,
  };
}

export const RequestWizard: React.FC<RequestWizardProps> = ({
  apiBaseUrl,
  onRequestSubmitted,
  currentUser,
  activeChatId,
  onChatSessionCreated,
}) => {
  const firstName = currentUser?.fullName?.split(' ')[0] || 'there';

  // Request State
  const [category, setCategory] = useState<'LAPTOPS' | 'PHONES' | 'ACCESSORIES'>('LAPTOPS');
  const [brand, setBrand] = useState('Apple');
  const [useCase, setUseCase] = useState('Coding & Tech');
  const [maxBudget, setMaxBudget] = useState(400000);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState('');
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [_trackingCode, setTrackingCode] = useState<string | null>(null);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [isRefreshingOffers, setIsRefreshingOffers] = useState(false);

  const getFormatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGreetingText = (name: string) => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good afternoon';
    if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
    else if (hour >= 17 || hour < 5) timeGreeting = 'Good evening';
    return `${timeGreeting}, ${name}! It's a good time to find a great device today.`;
  };

  const createInitialMessages = (name: string): ChatMsg[] => [
    {
      id: 'msg-greeting',
      sender: 'bot',
      text: getGreetingText(name),
      timestamp: getFormatTime(),
    },
    {
      id: 'msg-category-prompt',
      sender: 'bot',
      text: 'What kind of device are you looking for? Pick an option below.',
      timestamp: getFormatTime(),
    },
  ];

  // Chat animation state
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(() => createInitialMessages(firstName));

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isCreatingChatRef = useRef(false);
  const activeChatIdRef = useRef<string | null>(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Helper to persist draft chat state in localStorage
  const persistDraft = (overrides?: Partial<DraftChatData>) => {
    try {
      const data: DraftChatData = {
        chatId: activeChatIdRef.current,
        category: overrides?.category ?? category,
        brand: overrides?.brand ?? brand,
        useCase: overrides?.useCase ?? useCase,
        maxBudget: overrides?.maxBudget ?? maxBudget,
        selectedSpecs: overrides?.selectedSpecs ?? selectedSpecs,
        customNotes: overrides?.customNotes ?? customNotes,
        currentStep: overrides?.currentStep ?? currentStep,
        messages: overrides?.messages ?? messages,
      };
      localStorage.setItem('handular_draft_chat', JSON.stringify(data));
    } catch {}
  };

  // Scroll management:
  // - If chat is short (content <= container height), pin at top (scrollTop = 0)
  // - If chat is long (> container height), refresh shows top then smoothly scrolls straight down to bottom
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    window.scrollTo(0, 0);

    // If chat content fits comfortably inside the container, keep top visible
    if (el.scrollHeight <= el.clientHeight + 10) {
      el.scrollTop = 0;
      return;
    }

    // If chat content overflows (long conversation):
    // Refresh shows top of the chat, then smoothly scrolls straight down to bottom
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [messages, isBotTyping, currentStep, activeChatId]);

  // Load active chat or restore local draft
  useEffect(() => {
    let isCancelled = false;

    if (activeChatId) {
      // Fetch existing session from API
      fetch(`${apiBaseUrl}/api/v1/chats/${activeChatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('handular_token') || ''}`,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data || isCancelled) return;
          const { chat } = data;
          if (chat?.messages && chat.messages.length > 0) {
            setMessages(chat.messages);
            if (chat.buyerRequest) {
              setSubmittedToken(chat.buyerRequest.publicToken);
              setTrackingCode(chat.trackingCode || `#${chat.buyerRequest.publicToken}`);
              setOffers(chat.buyerRequest.offers || []);
              setCurrentStep('completed');
            } else {
              // Mid-flow draft: restore wizard step and form choices from messages
              const inferred = inferWizardStateFromMessages(chat.messages);
              setCategory(inferred.category);
              setBrand(inferred.brand);
              setUseCase(inferred.useCase);
              setMaxBudget(inferred.maxBudget);
              setSelectedSpecs(inferred.selectedSpecs);
              setCustomNotes(inferred.customNotes);
              setCurrentStep(inferred.inferredStep);
            }
          }
        })
        .catch(() => {});
      return () => {
        isCancelled = true;
      };
    }

    // No activeChatId: check if there is an unauthenticated local draft
    try {
      const draftRaw = localStorage.getItem('handular_draft_chat');
      if (draftRaw) {
        const draft: DraftChatData = JSON.parse(draftRaw);
        // If the draft was completed or already linked to a backend chat, discard it so it does not block a new request
        if (draft.currentStep === 'completed' || draft.chatId) {
          localStorage.removeItem('handular_draft_chat');
        } else if (draft.messages && draft.messages.length > 2) {
          setMessages(draft.messages);
          if (draft.category) setCategory(draft.category);
          if (draft.brand) setBrand(draft.brand);
          if (draft.useCase) setUseCase(draft.useCase);
          if (draft.maxBudget) setMaxBudget(draft.maxBudget);
          if (draft.selectedSpecs) setSelectedSpecs(draft.selectedSpecs);
          if (draft.customNotes) setCustomNotes(draft.customNotes);
          if (draft.currentStep) setCurrentStep(draft.currentStep);
          setIsBotTyping(false);
          return;
        }
      }
    } catch {}

    // Fresh new chat: clean all request tokens and start completely fresh
    setSubmittedToken(null);
    setTrackingCode(null);
    setOffers([]);
    setCategory('LAPTOPS');
    setBrand('Apple MacBook');
    setUseCase('Coding & Tech');
    setMaxBudget(400000);
    setBudgetInput('');
    setBudgetError(null);
    setSelectedSpecs([]);
    setCustomNotes('');
    setCurrentStep('category');
    setMessages(createInitialMessages(firstName));
    setIsBotTyping(false);
  }, [activeChatId, firstName, apiBaseUrl]);

  // Sync messages to backend chat session and update local draft
  const syncChatMessages = async (
    updatedMessages: ChatMsg[],
    targetStep: Step,
    overrideState?: Partial<DraftChatData>,
    updatedTitle?: string
  ) => {
    const curCategory = overrideState?.category ?? category;
    const curBrand = overrideState?.brand ?? brand;
    const curUseCase = overrideState?.useCase ?? useCase;
    const curMaxBudget = overrideState?.maxBudget ?? maxBudget;
    const curSpecs = overrideState?.selectedSpecs ?? selectedSpecs;
    const curNotes = overrideState?.customNotes ?? customNotes;

    persistDraft({
      category: curCategory,
      brand: curBrand,
      useCase: curUseCase,
      maxBudget: curMaxBudget,
      selectedSpecs: curSpecs,
      customNotes: curNotes,
      currentStep: targetStep,
      messages: updatedMessages,
    });

    const title =
      updatedTitle ||
      (curBrand && curBrand !== 'any'
        ? `${curBrand} (${curUseCase || 'Request'})`
        : `${curCategory} Request`);

    const token = localStorage.getItem('handular_token');
    if (!token) return;

    if (activeChatIdRef.current) {
      fetch(`${apiBaseUrl}/api/v1/chats/${activeChatIdRef.current}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
          title,
        }),
      }).catch(() => {});
    } else if (!isCreatingChatRef.current && updatedMessages.length > 2) {
      isCreatingChatRef.current = true;
      try {
        const res = await fetch(`${apiBaseUrl}/api/v1/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            messages: updatedMessages,
          }),
        });
        const data = await res.json();
        if (res.ok && data?.chat?.id) {
          activeChatIdRef.current = data.chat.id;
          if (onChatSessionCreated) {
            onChatSessionCreated(data.chat.id);
          }
          persistDraft({
            chatId: data.chat.id,
            category: curCategory,
            brand: curBrand,
            useCase: curUseCase,
            maxBudget: curMaxBudget,
            selectedSpecs: curSpecs,
            customNotes: curNotes,
            currentStep: targetStep,
            messages: updatedMessages,
          });
        }
      } catch {
        // Retry next time
      } finally {
        isCreatingChatRef.current = false;
      }
    }
  };

  // Generic transition handler with WhatsApp-style delivery ticks & 3-dot typing bubble
  const handleUserChoice = (
    userText: string,
    botReplyText: string,
    nextStep: Step,
    extraAction?: () => void,
    overrideState?: Partial<DraftChatData>
  ) => {
    const time = getFormatTime();
    const userMsgId = `user-${Date.now()}`;

    // 1. Send user message with 'sending'
    const userMsg: ChatMsg = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: time,
      status: 'sending',
    };

    setMessages((prev) => {
      const intermediate = [...prev, userMsg];
      syncChatMessages(intermediate, nextStep, overrideState);
      return intermediate;
    });

    // 2. Transition to 'delivered' tick after 200ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsgId ? { ...m, status: 'delivered' } : m))
      );
      setIsBotTyping(true);

      if (extraAction) extraAction();

      // 3. Bot responds after 550ms
      setTimeout(() => {
        setIsBotTyping(false);
        const botMsg: ChatMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReplyText,
          timestamp: getFormatTime(),
        };
        setMessages((prev) => {
          const nextMsgs = [...prev, botMsg];
          syncChatMessages(nextMsgs, nextStep, overrideState);
          return nextMsgs;
        });
        setCurrentStep(nextStep);
      }, 550);
    }, 200);
  };

  // STEP 1: Select Category
  const handleSelectCategory = (cat: 'LAPTOPS' | 'PHONES' | 'ACCESSORIES', label: string) => {
    const chosenBrand =
      cat === 'LAPTOPS' ? 'Apple MacBook' : cat === 'PHONES' ? 'Apple iPhone' : 'AirPods';
    setCategory(cat);
    setBrand(chosenBrand);

    handleUserChoice(
      label,
      `Great! Which brand are you interested in? Pick an option below.`,
      'brand',
      undefined,
      { category: cat, brand: chosenBrand }
    );
  };

  // STEP 2: Select Brand
  const handleSelectBrand = (chosenBrand: string) => {
    setBrand(chosenBrand);
    handleUserChoice(
      chosenBrand,
      `Got it, ${chosenBrand}! What will you mainly use it for?`,
      'use_case',
      undefined,
      { brand: chosenBrand }
    );
  };

  // STEP 3: Select Purpose / Use Case
  const handleSelectUseCase = (purpose: string) => {
    setUseCase(purpose);
    handleUserChoice(
      purpose,
      `What is your maximum budget for this device? Tap a preset or type an amount below.`,
      'budget',
      undefined,
      { useCase: purpose }
    );
  };

  // STEP 4: Submit Budget
  const handleBudgetSelect = (amount: number, label: string) => {
    setMaxBudget(amount);
    setBudgetError(null);
    handleUserChoice(
      label,
      `Any specific requirements or specs? Tap any that matter to you, or type extra details below.`,
      'specs',
      undefined,
      { maxBudget: amount }
    );
  };

  const handleCustomBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = Number(budgetInput.replace(/[^0-9]/g, ''));
    if (!cleanNum || isNaN(cleanNum)) {
      setBudgetError('Please enter a valid amount');
      return;
    }
    if (cleanNum < 30000) {
      setBudgetError('Minimum budget is ₦30,000');
      return;
    }
    if (cleanNum > 5000000) {
      setBudgetError('Maximum budget is ₦5,000,000');
      return;
    }

    setMaxBudget(cleanNum);
    setBudgetError(null);
    setBudgetInput('');
    handleUserChoice(
      `₦${cleanNum.toLocaleString()}`,
      `Any specific requirements or specs? Tap any that matter to you, or type extra details below.`,
      'specs',
      undefined,
      { maxBudget: cleanNum }
    );
  };

  // STEP 5: Specs Selection & Notes
  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) => {
      const updated = prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec];
      persistDraft({ selectedSpecs: updated });
      return updated;
    });
  };

  const handleFinishSpecs = () => {
    const summaryItems = [...selectedSpecs];
    if (customNotes.trim()) {
      summaryItems.push(customNotes.trim());
    }
    const specsSummaryText =
      summaryItems.length > 0 ? summaryItems.join(', ') : 'Standard clean condition';

    handleUserChoice(
      specsSummaryText,
      `Here is a quick summary of your request. Tap below to find available devices across verified campus sellers.`,
      'summary',
      undefined,
      { selectedSpecs, customNotes }
    );
  };

  // STEP 6: Submit Request to Verified Campus Sellers
  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      buyerName: currentUser?.fullName || 'Campus Student',
      buyerPhone: currentUser?.phone || '08000000000',
      buyerEmail: currentUser?.email || undefined,
      category,
      brand,
      useCase,
      minBudget: Math.max(30000, Math.round(maxBudget * 0.7)),
      maxBudget,
      preferredSpecs: [...selectedSpecs, customNotes].filter(Boolean).join(', '),
      studentId: currentUser?.id,
      chatSessionId: activeChatIdRef.current || undefined,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('handular_token') || ''}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      const generatedToken = data.data.publicToken;
      const code = data.data.trackingCode || `#${generatedToken}`;
      setSubmittedToken(generatedToken);
      setTrackingCode(code);
      setCurrentStep('completed');

      // Clear draft since request is now officially submitted
      try {
        localStorage.removeItem('handular_draft_chat');
      } catch {}

      // Add success confirmation message in chat and sync
      const confirmedMsg: ChatMsg = {
        id: `bot-confirmed-${Date.now()}`,
        sender: 'bot',
        text: `Your request is live with tracking code ${code}. Verified campus sellers have been notified and will upload matching devices right here!`,
        timestamp: getFormatTime(),
      };

      setMessages((prev) => {
        const nextMsgs = [...prev, confirmedMsg];
        const token = localStorage.getItem('handular_token');
        if (token && activeChatIdRef.current) {
          fetch(`${apiBaseUrl}/api/v1/chats/${activeChatIdRef.current}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              messages: nextMsgs,
              trackingCode: code,
              title: `${brand} (${useCase})`,
            }),
          }).catch(() => {});
        }
        return nextMsgs;
      });

      // Create new chat session if not present yet
      if (!activeChatIdRef.current && onChatSessionCreated) {
        fetch(`${apiBaseUrl}/api/v1/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('handular_token') || ''}`,
          },
          body: JSON.stringify({
            title: `${brand} (${useCase})`,
            messages: [...messages, confirmedMsg],
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.chat?.id) {
              activeChatIdRef.current = d.chat.id;
              onChatSessionCreated(d.chat.id);
            }
          })
          .catch(() => {});
      }

      // Fetch offers
      fetchOffers(generatedToken);
    } catch (err: any) {
      setSubmitError(err.message || 'Error broadcasting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchOffers = async (token: string) => {
    setIsRefreshingOffers(true);
    const startTime = Date.now();
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/offers/${token}`);
      const data = await res.json();
      if (res.ok && data.offers) {
        setOffers(data.offers);
      }
    } catch {
      // Silent catch
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 700 - elapsed);
      setTimeout(() => {
        setIsRefreshingOffers(false);
      }, remaining);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 sm:py-4 flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)]">
      {/* Conversation Thread - Pure Clean Chat Flow (NO Banners, NO Start Over) */}
      <div
        ref={chatContainerRef}
        data-chat-thread
        className="flex-1 overflow-y-auto space-y-3.5 pb-4 scroll-smooth no-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full overflow-hidden bg-[#10393b] flex items-center justify-center shrink-0 mb-1 p-1.5">
                  <img
                    src="/handular_icon.png"
                    alt="Handular"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2.5 rounded-[14px] text-xs sm:text-sm font-normal leading-relaxed ${
                  isUser
                    ? 'bg-[#10393b] text-white rounded-br-[4px]'
                    : 'bg-white text-[#10393b] rounded-tl-[4px]'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {/* 3-Dot Bouncing Typing Bubble */}
        {isBotTyping && (
          <div className="flex items-end gap-2 animate-in fade-in duration-150">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#10393b] flex items-center justify-center shrink-0 mb-1 p-1.5">
              <img
                src="/handular_icon.png"
                alt="Handular"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="px-3.5 py-3 rounded-[14px] rounded-tl-[4px] bg-white flex items-center gap-1.5 shadow-none">
              <span className="w-2 h-2 rounded-full bg-[#10393b]/60 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-[#10393b]/60 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-[#10393b]/60 animate-bounce" />
            </div>
          </div>
        )}

        {/* STEP 6: Minimal Clean Summary Card in Chat Stream */}
        {currentStep === 'summary' && !isBotTyping && (
          <div className="my-3 pl-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-5 rounded-[18px] bg-white space-y-4">
              <div>
                <h3 className="text-base font-normal text-[#10393b]">
                  {brand} ({useCase})
                </h3>
                <p className="text-xs text-[#555555] mt-1 font-normal">
                  Budget: <span className="font-mono text-[#10393b]">Up to ₦{maxBudget.toLocaleString()}</span>
                </p>
                {selectedSpecs.length > 0 && (
                  <p className="text-xs text-[#777777] mt-0.5 font-normal">
                    Requirements: {selectedSpecs.join(', ')}
                  </p>
                )}
                {customNotes.trim() && (
                  <p className="text-xs text-[#777777] mt-0.5 font-normal">
                    Notes: {customNotes.trim()}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="p-2.5 rounded-[8px] bg-red-50 text-red-600 text-xs font-normal">
                  {submitError}
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="w-full h-11 text-xs font-normal"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                    <span>Broadcasting to Verified Sellers...</span>
                  </>
                ) : (
                  <>
                    <span>Find Available Devices</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 7: Completed State / Live In-Chat Offers */}
        {currentStep === 'completed' && submittedToken && (
          <div className="my-3 pl-8 space-y-3 animate-in fade-in duration-200">
            {/* Sourcing Status Header: Clean, balanced spacing */}
            <div className="p-4 rounded-[14px] bg-white flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-normal text-[#888888] block mb-0.5">
                  Current Status
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-normal bg-[#10393b] text-[#ffad24]">
                  Sourcing Sellers
                </span>
              </div>

              {/* Refresh button to see recent offers */}
              <button
                onClick={() => fetchOffers(submittedToken)}
                disabled={isRefreshingOffers}
                title="See recent offers"
                className="h-8 px-3 rounded-[8px] bg-[#eceae2] hover:bg-[#e4e1d7] text-[#10393b] text-xs font-normal flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-70"
              >
                <ArrowPathIcon className={`w-3.5 h-3.5 shrink-0 transition-transform ${isRefreshingOffers ? 'animate-spin-smooth' : ''}`} />
                <span>Refresh Offers</span>
              </button>
            </div>

            {/* In-Chat Offers List */}
            {offers.length === 0 ? (
              <div className="p-4 rounded-[14px] bg-white/70 text-center text-xs text-[#888888]">
                Sellers are matching their verified inventory. Offers will drop here in real time.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] font-normal text-[#888888] uppercase tracking-wider px-1">
                  Available Matches ({offers.length})
                </div>
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3.5 rounded-[12px] bg-white flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-medium text-[#10393b]">
                        {offer.brand} {offer.model}
                      </h4>
                      <p className="text-[11px] text-[#777777]">
                        {offer.conditionGrade} • {offer.seller?.businessName || 'Verified Seller'}
                      </p>
                      <span className="font-mono text-xs text-[#10393b] font-medium block mt-1">
                        ₦{Number(offer.price).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onRequestSubmitted(submittedToken)}
                      className="flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADAPTIVE BOTTOM DOCK: Only displays the controls needed for the active step */}
      <div className="pt-2 shrink-0">
        {/* Step 1: Device Category Options (Dark Green Mode) */}
        {currentStep === 'category' && !isBotTyping && (
          <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-200">
            <button
              onClick={() => handleSelectCategory('LAPTOPS', 'Laptops')}
              className="h-11 rounded-[10px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-xs sm:text-sm font-normal text-white transition-all cursor-pointer flex items-center justify-center shadow-none"
            >
              Laptops
            </button>
            <button
              onClick={() => handleSelectCategory('PHONES', 'Phones')}
              className="h-11 rounded-[10px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-xs sm:text-sm font-normal text-white transition-all cursor-pointer flex items-center justify-center shadow-none"
            >
              Phones
            </button>
            <button
              onClick={() => handleSelectCategory('ACCESSORIES', 'Accessories')}
              className="h-11 rounded-[10px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-xs sm:text-sm font-normal text-white transition-all cursor-pointer flex items-center justify-center shadow-none"
            >
              Accessories
            </button>
          </div>
        )}

        {/* Step 2: Brand Options (Dark Green Mode) */}
        {currentStep === 'brand' && !isBotTyping && (
          <div className="flex flex-wrap gap-2 animate-in fade-in duration-200">
            {(category === 'LAPTOPS'
              ? ['Apple MacBook', 'Dell', 'HP', 'Lenovo', 'Asus']
              : category === 'PHONES'
              ? ['Apple iPhone', 'Samsung Galaxy', 'Google Pixel', 'Xiaomi']
              : ['AirPods / Earbuds', 'Smartwatch', 'Chargers & Power']
            ).map((b) => (
              <button
                key={b}
                onClick={() => handleSelectBrand(b)}
                className="px-4 h-10 rounded-[10px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-xs font-normal text-white transition-all cursor-pointer shadow-none"
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Purpose Options (Dark Green Mode) */}
        {currentStep === 'use_case' && !isBotTyping && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-200">
            {['Coding & Tech', 'School & Projects', 'Design & Media', 'Everyday Use'].map((p) => (
              <button
                key={p}
                onClick={() => handleSelectUseCase(p)}
                className="h-11 px-2 rounded-[10px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-xs font-normal text-white transition-all cursor-pointer flex items-center justify-center text-center shadow-none"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Budget Selection (Dark Green Preset Pills + Controlled Number Input) */}
        {currentStep === 'budget' && !isBotTyping && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex flex-wrap gap-1.5">
              {[
                { amount: 150000, label: '₦150,000' },
                { amount: 250000, label: '₦250,000' },
                { amount: 400000, label: '₦400,000' },
                { amount: 650000, label: '₦650,000' },
                { amount: 1000000, label: '₦1,000,000+' },
              ].map((item) => (
                <button
                  key={item.amount}
                  onClick={() => handleBudgetSelect(item.amount, item.label)}
                  className="px-3 h-8 rounded-[8px] bg-[#10393b] hover:bg-[#154b4d] text-xs font-mono text-white transition-all cursor-pointer shadow-none"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleCustomBudgetSubmit}
              className="flex items-center gap-2 p-1.5 rounded-[12px] bg-white"
            >
              <div className="flex-1 flex items-center px-3">
                <span className="text-xs text-[#888888] mr-1 font-mono">₦</span>
                <input
                  type="text"
                  value={budgetInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    if (raw.length <= 9) {
                      setBudgetInput(raw ? Number(raw).toLocaleString() : '');
                    }
                  }}
                  placeholder="Or enter custom budget (e.g. 350,000)"
                  className="w-full h-9 bg-transparent text-xs text-[#10393b] placeholder:text-[#999999] outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!budgetInput}
                className="h-8 px-3 rounded-[8px] bg-[#10393b] text-white text-xs font-normal disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#154b4d] transition-all cursor-pointer shrink-0"
              >
                Set Budget
              </button>
            </form>

            {budgetError && (
              <p className="text-[11px] text-red-500 pl-2 font-normal">{budgetError}</p>
            )}
          </div>
        )}

        {/* Step 5: Specific Specs & 120-Char Notes (Dark Green Chips) */}
        {currentStep === 'specs' && !isBotTyping && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex flex-wrap gap-1.5">
              {[
                'Battery Health 85%+',
                'Original Charger Included',
                'Pristine / Grade A Body',
                'UK / US Used',
                'Receipt & Box Available',
              ].map((spec) => {
                const isSelected = selectedSpecs.includes(spec);
                return (
                  <button
                    key={spec}
                    onClick={() => toggleSpec(spec)}
                    className={`px-2.5 h-7 rounded-[7px] text-xs font-normal transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#30c5ce] text-[#10393b] font-medium'
                        : 'bg-[#10393b] text-white hover:bg-[#154b4d]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {spec}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded-[12px] bg-white">
              <input
                type="text"
                maxLength={120}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Any other detail? (e.g. 16GB RAM, space grey)..."
                className="flex-1 h-9 px-3 bg-transparent text-xs text-[#10393b] placeholder:text-[#999999] outline-none font-normal"
              />

              <span className="text-[10px] text-[#999999] font-mono shrink-0">
                {customNotes.length}/120
              </span>

              <button
                type="button"
                onClick={handleFinishSpecs}
                className="h-8 px-3 rounded-[8px] bg-[#10393b] text-white text-xs font-normal hover:bg-[#154b4d] transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <span>Continue</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
