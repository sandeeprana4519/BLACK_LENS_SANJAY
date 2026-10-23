import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  X, 
  Minus, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Newspaper, 
  Play, 
  Pause, 
  Square,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Article } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  articles?: Array<{
    id: number;
    title: string;
    slug: string;
    featured_image?: string;
    category_name?: string;
    location?: string;
    published_at?: string;
    excerpt?: string;
  }>;
  suggestions?: string[];
  timestamp: string;
}

interface BlackLensChatWidgetProps {
  onOpenArticle?: (article: any) => void;
  onOpenContact?: () => void;
  onOpenRegister?: () => void;
  isCMSOpen?: boolean;
}

export function BlackLensChatWidget({ 
  onOpenArticle, 
  onOpenContact, 
  onOpenRegister,
  isCMSOpen = false 
}: BlackLensChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const initialGreeting: ChatMessage = {
    id: 'welcome-1',
    role: 'assistant',
    content: 'नमस्ते! 🙏 मैं **BlackLens (ब्लैक लेंस)** का आधिकारिक AI सहायक हूँ।\n\nआप मुझसे पोर्टल पर प्रकाशित ताज़ा समाचार, गाजियाबाद व उत्तर प्रदेश की खबरें, ब्लैक लेंस कार्यालय विवरण, या रिपोर्टर बनने की प्रक्रिया के बारे में पूछ सकते हैं।',
    suggestions: [
      '📰 आज की ताज़ा खबरें',
      '🏛️ उत्तर प्रदेश समाचार',
      '🏙️ गाजियाबाद व दिल्ली NCR',
      'ℹ️ ब्लैक लेंस के बारे में',
      '📞 संपर्क व कार्यालय विवरण',
      '✍️ रिपोर्टर कैसे बनें?'
    ],
    timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('blacklens_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore session error
    }
    return [initialGreeting];
  });

  // Keep session history synced
  useEffect(() => {
    try {
      sessionStorage.setItem('blacklens_chat_history', JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  // Setup SpeechSynthesis & Voice list
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          if (Array.isArray(v) && v.length > 0) {
            setAvailableVoices(v);
          }
        } catch (e) {}
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch (e) {}
      }
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const stopSpeaking = () => {
    if (synthRef.current) {
      try {
        synthRef.current.cancel();
      } catch (e) {}
      setCurrentlySpeakingId(null);
    }
  };

  const speakText = (text: string, messageId: string) => {
    if (!synthRef.current || isMuted) return;

    if (currentlySpeakingId === messageId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();

    // Clean markdown, links, hashtags, emojis for natural speech
    const cleanSpeechText = text
      .replace(/[*_#`~>]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[📰🏛️🏙️ℹ️📞✍️🙏❤️✨•]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeechText) return;

    try {
      // Unfreeze synthesis queue if paused (common Chromium issue)
      if (synthRef.current.paused) {
        synthRef.current.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
      const isHindi = /[\u0900-\u097F]/.test(cleanSpeechText);

      // Select matching voice
      const voicesList = availableVoices.length > 0 ? availableVoices : (synthRef.current.getVoices?.() || []);
      let targetVoice: SpeechSynthesisVoice | undefined;

      if (isHindi) {
        targetVoice = voicesList.find(v => 
          v.lang.toLowerCase().startsWith('hi') || 
          v.lang.toLowerCase().includes('hi-in') ||
          v.name.toLowerCase().includes('hindi')
        );
        // Fallback to Indian English or first available voice if Hindi is not installed
        if (!targetVoice) {
          targetVoice = voicesList.find(v => 
            v.lang.toLowerCase().includes('en-in') || 
            v.name.toLowerCase().includes('india')
          );
        }
      } else {
        targetVoice = voicesList.find(v => 
          v.lang.toLowerCase().includes('en-in') || 
          v.lang.toLowerCase().startsWith('en')
        );
      }

      if (targetVoice) {
        utterance.voice = targetVoice;
        utterance.lang = targetVoice.lang;
      } else {
        utterance.lang = isHindi ? 'hi-IN' : 'en-IN';
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setCurrentlySpeakingId(messageId);
      };

      utterance.onend = () => {
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = (e: any) => {
        console.warn('[SpeechSynthesis Error]:', e?.error || e);
        setCurrentlySpeakingId(null);
        // If error was language-unavailable, retry with default voice
        if (e?.error === 'language-unavailable' || e?.error === 'voice-unavailable') {
          try {
            const fallback = new SpeechSynthesisUtterance(cleanSpeechText);
            fallback.rate = 0.95;
            synthRef.current?.speak(fallback);
          } catch (retryErr) {}
        }
      };

      synthRef.current.speak(utterance);
    } catch (err: any) {
      console.warn('SpeechSynthesis speak failed:', err);
      setCurrentlySpeakingId(null);
    }
  };

  const toggleListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया टाइप करके प्रश्न पूछें।');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);

    // Warm up speech synthesis audio context during user gesture
    if (synthRef.current) {
      try {
        synthRef.current.resume();
      } catch (e) {}
    }

    // Proactively request mic permission via getUserMedia to trigger browser prompt
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (micErr: any) {
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setSpeechError('माइक्रोफ़ोन अनुमति नहीं मिली। कृपया ब्राउज़र पता बार (URL Bar) में लॉक/माइक आइकन पर क्लिक कर "Allow" करें।');
          return;
        }
      }
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = speechLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      let finalCapturedText = '';

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const combined = (final || interim).trim();
        if (combined) {
          finalCapturedText = combined;
          setInputMessage(combined);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[Speech Recognition Error]:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।');
        } else if (event.error === 'no-speech') {
          setSpeechError('कोई आवाज़ सुनाई नहीं दी। कृपया माइक बटन दबाकर दोबारा बोलें।');
        } else if (event.error === 'network') {
          setSpeechError('वॉइस नेटवर्क में व्यवधान आया। कृपया टाइप करके पूछें।');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If clear speech was captured, auto send question for seamless experience!
        if (finalCapturedText.trim()) {
          handleSendMessage(finalCapturedText.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
      setSpeechError('माइक्रोफ़ोन शुरू करने में समस्या। कृपया टाइप करके प्रश्न पूछें।');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputMessage;
    const query = rawText.trim();
    if (!query || isLoading) return;

    // Stop ongoing speech
    stopSpeaking();

    // Warm up / prime speech synthesis right on user gesture
    if (synthRef.current && !isMuted) {
      try {
        synthRef.current.resume();
        const silent = new SpeechSynthesisUtterance(' ');
        silent.volume = 0.01;
        synthRef.current.speak(silent);
      } catch (e) {}
    }

    // Check special client navigation actions
    const qLower = query.toLowerCase();
    if (qLower.includes('रिपोर्टर बनें') || qLower.includes('join reporter') || qLower.includes('रजिस्ट्रेशन')) {
      if (onOpenRegister) {
        onOpenRegister();
      }
    } else if (qLower.includes('संपर्क') || qLower.includes('contact') || qLower.includes('शिकायत') || qLower.includes('विज्ञापन पूछताछ')) {
      if (onOpenContact) {
        onOpenContact();
      }
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setSpeechError(null);

    try {
      // Call backend AI endpoint
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await res.json();

      if (data.success && data.data) {
        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.data.reply || 'यहाँ आपकी जानकारी प्रस्तुत है:',
          articles: Array.isArray(data.data.articles) ? data.data.articles : [],
          suggestions: Array.isArray(data.data.suggestions) ? data.data.suggestions : [],
          timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Auto-speak if not muted
        if (!isMuted) {
          speakText(assistantMessage.content, assistantMessage.id);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: data.message || 'तकनीकी समस्या के कारण उत्तर नहीं मिल सका। कृपया पुनः प्रयास करें।',
          timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err: any) {
      console.error('[BlackLens Chat Error]:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'नेटवर्क संपर्क में व्यवधान आया है। कृपया अपनी इंटरनेट कनेक्टिविटी की जांच करें या पुनः प्रश्न पूछें।',
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([initialGreeting]);
    sessionStorage.removeItem('blacklens_chat_history');
  };

  // If CMS desk is open full screen, hide the floating AI widget to prevent UI obstruction
  if (isCMSOpen) {
    return null;
  }

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex items-center group">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="ब्लैक लेंस AI सहायक खोलें"
            className="relative flex items-center gap-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-medium px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-xl hover:shadow-red-900/40 transition-all duration-300 transform hover:-translate-y-0.5 border border-red-400/30 ring-2 ring-red-500/20 active:scale-95"
          >
            {/* Live pulsing dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>

            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <div className="text-left leading-tight">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-200">BlackLens AI</span>
                <span className="block text-[10px] text-white/90 font-medium">न्यूज़ सहायक</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* 2. CHAT WINDOW (Compact, responsive, fits mobile & desktop without overflow) */}
      {isOpen && (
        <div 
          className={`fixed right-3 sm:right-5 bottom-3 sm:bottom-5 z-50 w-[calc(100vw-1.5rem)] sm:w-[350px] max-w-[360px] bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 font-sans backdrop-blur-md ${
            isMinimized ? 'h-14' : 'h-[460px] max-h-[calc(100dvh-2.5rem)] sm:h-[480px] sm:max-h-[500px]'
          }`}
        >
          {/* HEADER (Compact & sleek) */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between select-none shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-7 h-7 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-slate-900 rounded-full" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide truncate">
                    BLACKLENS AI
                  </h3>
                  <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                    सहायक
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  सत्यापित समाचार केंद्र
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-0.5 shrink-0 text-slate-400">
              {/* Mute/Unmute */}
              <button
                onClick={() => {
                  if (!isMuted) stopSpeaking();
                  setIsMuted(!isMuted);
                }}
                title={isMuted ? 'ध्वनि चालू करें (Unmute voice)' : 'ध्वनि बंद करें (Mute voice)'}
                className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                aria-label="ध्वनि नियंत्रण"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                title="नया चैट शुरू करें (New Chat)"
                className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                aria-label="नया चैट"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize/Maximize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'बड़ा करें (Expand)' : 'छोटा करें (Minimize)'}
                className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                aria-label="छोटा करें"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                title="बंद करें (Close)"
                className="p-1 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                aria-label="बंद करें"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* MAIN CONTENT (When not minimized) */}
          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-950/70 scroll-smooth">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-red-600 text-white rounded-tr-xs border border-red-500/40'
                          : 'bg-slate-800/95 text-slate-100 rounded-tl-xs border border-slate-700/60'
                      }`}
                    >
                      {/* Assistant text & speak button */}
                      <div className="whitespace-pre-wrap font-normal">
                        {msg.content}
                      </div>

                      {/* Read out loud button for assistant */}
                      {msg.role === 'assistant' && (
                        <div className="mt-2 pt-1.5 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                          <button
                            onClick={() => speakText(msg.content, msg.id)}
                            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 hover:bg-slate-700/80 text-slate-200 hover:text-amber-300 transition-colors border border-slate-750"
                          >
                            {currentlySpeakingId === msg.id ? (
                              <>
                                <Square className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                                <span className="text-amber-300 font-semibold">बोलना रोकें</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-red-400" />
                                <span className="font-medium text-slate-200">आवाज़ में सुनें</span>
                              </>
                            )}
                          </button>
                          <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                        </div>
                      )}
                    </div>

                    {/* Rich Matched News Cards */}
                    {msg.articles && msg.articles.length > 0 && (
                      <div className="w-full mt-2.5 space-y-1.5">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-red-400 px-0.5">
                          <Newspaper className="w-3 h-3" />
                          <span>सत्यापित समाचार ({msg.articles.length}):</span>
                        </div>

                        <div className="space-y-1.5">
                          {msg.articles.map((art) => (
                            <div
                              key={art.id}
                              onClick={() => onOpenArticle && onOpenArticle(art)}
                              className="group p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-red-500/50 transition-all cursor-pointer hover:bg-slate-850 shadow-sm"
                            >
                              <div className="flex gap-2.5">
                                {art.featured_image && (
                                  <img
                                    src={art.featured_image}
                                    alt={art.title}
                                    className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-700/50 group-hover:scale-105 transition-transform duration-200"
                                    onError={(e: any) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800/40">
                                      {art.category_name || 'समाचार'}
                                    </span>
                                    {art.location && (
                                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5 truncate">
                                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                                        {art.location}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-bold text-white group-hover:text-red-400 line-clamp-2 leading-snug">
                                    {art.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                    {art.excerpt}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {art.published_at 
                                    ? new Date(art.published_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })
                                    : 'ताज़ा'}
                                </span>
                                <span className="text-red-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                  पूरी खबर पढ़ें <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Suggestion Chips */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 px-0.5">
                        {msg.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(suggestion)}
                            className="text-[10px] sm:text-[11px] bg-slate-900/90 hover:bg-red-950/80 text-slate-300 hover:text-red-200 border border-slate-800 hover:border-red-500/40 rounded-full px-2.5 py-0.5 transition-all active:scale-95 text-left leading-tight"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-start gap-1.5">
                    <div className="bg-slate-800 border border-slate-700/60 rounded-xl rounded-tl-xs px-3 py-2 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-[11px] text-slate-300 font-medium animate-pulse">
                        सत्यापित उत्तर खोजा जा रहा है...
                      </span>
                    </div>
                  </div>
                )}

                {/* Speech Error Notice */}
                {speechError && (
                  <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-800/60 text-amber-200 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>{speechError}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT FOOTER & CONTROLS (Compact) */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 shrink-0">
                {/* Voice Status Pill */}
                {isListening && (
                  <div className="mb-1.5 px-2.5 py-1 bg-red-950/60 border border-red-700/60 rounded-lg flex items-center justify-between text-[11px] text-red-200 animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <span>सुन रहा हूँ... बोलिए ({speechLanguage === 'hi-IN' ? 'हिंदी' : 'English'})</span>
                    </div>
                    <button
                      onClick={toggleListening}
                      className="text-[10px] underline hover:text-white"
                    >
                      रोकें
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5"
                >
                  {/* Language Selector Toggle for Voice */}
                  <button
                    type="button"
                    onClick={() => setSpeechLanguage(prev => prev === 'hi-IN' ? 'en-IN' : 'hi-IN')}
                    title={`वॉइस भाषा: ${speechLanguage === 'hi-IN' ? 'हिंदी (बदलने के लिए क्लिक करें)' : 'English (Click to change)'}`}
                    className="h-8 px-2 rounded-lg bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700/60 hover:text-white hover:border-slate-600 transition-colors"
                  >
                    {speechLanguage === 'hi-IN' ? 'हिं' : 'EN'}
                  </button>

                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    title={isListening ? 'माइक बंद करें' : 'माइक से बोलें'}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-600 text-white animate-bounce ring-2 ring-red-500/40'
                        : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:border-red-500/50'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Input Field */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={isListening ? 'आप बोल रहे हैं...' : 'समाचार या सवाल पूछें...'}
                      disabled={isLoading}
                      className="w-full h-8 px-3 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-8 w-8 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white disabled:text-slate-600 rounded-lg flex items-center justify-center transition-all disabled:cursor-not-allowed shadow-sm shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Footer disclaimer */}
                <div className="mt-1 text-center">
                  <p className="text-[9px] text-slate-500">
                    केवल ब्लैक लेंस सत्यापित सामग्री पर आधारित • बाहरी इंटरनेट से मुक्त
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
