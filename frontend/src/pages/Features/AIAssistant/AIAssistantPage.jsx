import { useEffect, useRef, useState } from 'react';
import MainLayout from '../../../components/Layout/MainLayout.jsx';
import Card from '../../../components/Common/Card.jsx';
import Button from '../../../components/Common/Button.jsx';
import Input from '../../../components/Common/Input.jsx';
import Loader from '../../../components/Common/Loader.jsx';
import EmptyState from '../../../components/Common/EmptyState.jsx';
import { useNotification } from '../../../hooks/useNotification.js';
import aiService from '../../../services/aiService.js';
import { Send, Leaf, MessageCircle, Sparkles, AlertCircle, CheckCircle, Cpu, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15); // Adjust typing speed here
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
};

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [useLocalLLM, setUseLocalLLM] = useState(false);
  const messagesEndRef = useRef(null);
  const { success, error: notifyError } = useNotification();

  // Predefined helpful questions
  const suggestionQueries = [
    {
      icon: AlertCircle,
      title: 'Crop Issues',
      query: 'Why are my crop leaves turning yellow?',
      color: 'text-yellow-600'
    },
    {
      icon: Leaf,
      title: 'Pest Management',
      query: 'How do I manage pests in my cotton field?',
      color: 'text-green-600'
    },
    {
      icon: Sparkles,
      title: 'Irrigation',
      query: 'What is the best irrigation method for wheat?',
      color: 'text-blue-600'
    },
    {
      icon: CheckCircle,
      title: 'Subsidies',
      query: 'What government schemes can help me buy a solar pump?',
      color: 'text-purple-600'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setQuery('');
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text: userMessage,
      timestamp: new Date(),
      isTypingComplete: true
    }]);

    setLoading(true);
    try {
      // In a real app we might pass useLocalLLM to the service
      const response = await aiService.queryAI(userMessage);

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: response.answer || response.data?.answer || 'No response generated',
        model: useLocalLLM ? 'Local Edge AI' : 'Cloud AI',
        source: response.source || 'ai',
        timestamp: new Date(),
        isTypingComplete: false
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: err.message || 'Failed to get AI response. Please try again.',
        timestamp: new Date(),
        isTypingComplete: true
      };
      setMessages(prev => [...prev, errorMessage]);
      notifyError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const markTypingComplete = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isTypingComplete: true } : m));
    scrollToBottom();
  };

  const handleSuggestion = (suggestionQuery) => {
    setQuery(suggestionQuery);
    // Focus input so user can hit enter or adjust, or just trigger submit right away
    setTimeout(() => {
      document.getElementById('chat-form')?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 50);
  };

  const clearChat = () => {
    if (window.confirm('Clear chat history?')) {
      setMessages([]);
      success('Chat cleared');
    }
  };

  return (
    <MainLayout pageTitle="AI Assistant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A1A2E] flex items-center gap-3">
              <Sparkles className="text-[#2ECC71]" size={32} />
              Neural Farm Assistant
            </h1>
            <p className="text-[#636E72] mt-1 font-bold uppercase tracking-wider text-[10px]">Instant agricultural intelligence and real-time crop strategies.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Toggle Switch */}
            <label className="flex items-center gap-3 cursor-pointer bg-white border border-[#E0E0E0] px-4 py-2 rounded-xl shadow-sm hover:border-[#2ECC71] transition-all group">
              <span className={`text-[10px] font-black uppercase tracking-widest ${!useLocalLLM ? 'text-[#2ECC71]' : 'text-[#636E72]'}`}>Cloud</span>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer z-10 top-0 left-0 transition-transform duration-300"
                  checked={useLocalLLM}
                  onChange={() => setUseLocalLLM(!useLocalLLM)}
                  style={{ transform: useLocalLLM ? 'translateX(100%)' : 'translateX(0)', borderColor: useLocalLLM ? '#2ECC71' : '#E0E0E0' }}
                />
                <div className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-300 ${useLocalLLM ? 'bg-[#2ECC71]' : 'bg-[#F1F3F5]'}`}></div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${useLocalLLM ? 'text-[#2ECC71]' : 'text-[#636E72]'} flex items-center gap-1`}>
                <Cpu size={12} /> Edge AI
              </span>
            </label>

            {messages.length > 0 && (
              <Button
                variant="outline"
                onClick={clearChat}
                className="text-red-500 hover:bg-red-50 hover:border-red-200 border-border"
              >
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="card h-[600px] flex flex-col !p-0 overflow-hidden">
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                  <EmptyState
                    title="Start a conversation"
                    description="Ask me anything about farming, crops, pests, irrigation, or government schemes"
                  />
                )}

                <AnimatePresence>
                  {messages.map((message) => {
                    const isUser = message.type === 'user';
                    const isError = message.type === 'error';

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <div className="w-9 h-9 rounded-xl bg-[#EAF9F1] flex flex-shrink-0 items-center justify-center mr-3 mt-1 shadow-sm">
                            {isError ? <AlertCircle size={18} className="text-[#E53E3E]" /> : <Sparkles size={18} className="text-[#2ECC71]" />}
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] px-6 py-4 rounded-2xl shadow-sm ${isUser
                            ? 'bg-[#2ECC71] text-[#FFFFFF] rounded-tr-sm'
                            : isError
                              ? 'bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] rounded-tl-sm'
                              : 'bg-white border border-[#E0E0E0] text-[#1A1A2E] rounded-tl-sm'
                            }`}
                        >
                          <div className="text-sm prose prose-sm max-w-none prose-p:leading-relaxed">
                            {!isUser && !message.isTypingComplete && !isError ? (
                              <Typewriter text={message.text} onComplete={() => markTypingComplete(message.id)} />
                            ) : (
                              <span className="whitespace-pre-wrap break-words inline-block">{message.text}</span>
                            )}
                          </div>
                          <div className={`flex items-center justify-end gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest ${isUser ? 'text-[#EAF9F1] opacity-80' : 'text-[#636E72]'
                            }`}>
                            {message.model && <span className="opacity-70">{message.model}</span>}
                            <span>
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {isUser && (
                          <div className="w-9 h-9 rounded-xl bg-[#F8F9FA] border border-[#E0E0E0] flex flex-shrink-0 items-center justify-center ml-3 mt-1 shadow-sm">
                            <span className="text-[10px] font-black text-[#1A1A2E]">USER</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF9F1] flex items-center justify-center mr-3 mt-1 shadow-sm">
                      <Sparkles size={18} className="text-[#2ECC71] animate-pulse" />
                    </div>
                    <div className="bg-white border border-[#E0E0E0] rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm flex items-center gap-3 text-[#636E72]">
                      <Loader size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Neural Thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="border-t border-[#E0E0E0] p-6 bg-[#F8F9FA]">
                <form
                  id="chat-form"
                  onSubmit={handleSendMessage}
                  className="flex gap-4 relative"
                >
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={useLocalLLM ? "Command Neural Engine (Offline)..." : "Ask Neural Assistant..."}
                    disabled={loading}
                    className="flex-1 bg-white border border-[#E0E0E0] rounded-2xl px-6 py-4 text-[#1A1A2E] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#2ECC71]/10 focus:border-[#2ECC71] transition-all pr-16 shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="absolute right-3 top-3 bottom-3 aspect-square bg-[#2ECC71] hover:bg-[#27AE60] text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
                <div className="flex justify-center mt-4 gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-[#A0AEC0]">
                  <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${useLocalLLM ? 'bg-orange-400' : 'bg-[#2ECC71]'}`}></div> {useLocalLLM ? 'Local Engine Active' : 'Neural Cloud Online'}</div>
                  <div className="flex items-center gap-2"><Shield size={12} className="text-[#2ECC71]" /> SECURE END-TO-END</div>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions & Info Sidebar */}
          <div className="space-y-4">
            {/* Quick Suggestions */}
            <div className="card !p-5 !bg-white">
              <h3 className="font-extrabold text-[#1A1A2E] mb-5 flex items-center gap-2 uppercase tracking-tighter text-xs">
                <MessageCircle size={14} className="text-[#2ECC71]" />
                Intelligence Suggestions
              </h3>
              <div className="space-y-3">
                {suggestionQueries.map((suggestion, idx) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(suggestion.query)}
                      disabled={loading}
                      className="w-full text-left p-4 rounded-2xl border border-[#E0E0E0] bg-white hover:border-[#2ECC71] hover:bg-[#F8F9FA] transition-all group shadow-sm hover:shadow-md active:scale-95"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-[#F8F9FA] ${suggestion.color} group-hover:bg-white`}>
                          <Icon size={16} className="flex-shrink-0" />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-[#1A1A2E] text-xs uppercase tracking-tight group-hover:text-[#2ECC71] transition-colors">{suggestion.title}</p>
                          <p className="text-[10px] text-[#636E72] font-bold mt-1 line-clamp-2 leading-relaxed tracking-wide">{suggestion.query}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tips Card */}
            <div className="p-6 bg-[#F8F9FA] border border-[#E0E0E0] rounded-2xl shadow-sm">
              <h3 className="font-black text-[#1A1A2E] mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]"><Sparkles size={14} className="text-[#2ECC71]" /> Neural Best Practices</h3>
              <ul className="space-y-3 text-[11px] text-[#636E72] font-bold">
                <li className="flex gap-3 items-start leading-normal">
                  <span className="text-[#2ECC71]">•</span>
                  <span>Specify <b>Crop Species</b> & <b>Growth Stage</b> for accurate diagnostics.</span>
                </li>
                <li className="flex gap-3 items-start leading-normal">
                  <span className="text-[#2ECC71]">•</span>
                  <span>Include <b>Visual Symptoms</b> when describing leaves or stems.</span>
                </li>
                <li className="flex gap-3 items-start leading-normal">
                  <span className="text-[#2ECC71]">•</span>
                  <span>Activate <b>Edge AI</b> for field operations with low connectivity.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Hack for Shield icon since I forgot to import it at top
const Shield = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

export default AIAssistantPage;
