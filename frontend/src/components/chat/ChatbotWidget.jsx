import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bot, Compass, MessageCircle, Sparkles, X } from 'lucide-react';
import { chatApi } from '../../api/chatApi';

const quickPrompts = [
  'Best beach journeys right now',
  'A gentle mountain trip for beginners',
  'How does cancellation work?',
];

const starterMessages = [
  {
    role: 'assistant',
    content:
      'Hello — I am the Wanderlust concierge. Ask me about destinations, dates, what is included, or how booking works. For anything personal, I can hand you to a specialist.',
  },
];

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      window.setTimeout(() => inputRef.current?.focus(), 180);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSend = async (messageText) => {
    const text = messageText || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const history = updatedMessages
        .slice(-6, -1)
        .map((message) => ({ role: message.role, content: message.content }));

      const res = await chatApi.sendMessage(userMessage.content, history);
      const botReply = res.data?.reply || res.data?.message || 'How else can I help your journey?';
      setMessages((current) => [...current, { role: 'assistant', content: botReply }]);
    } catch (err) {
      console.error('Chat error', err);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'I cannot reach the concierge service at the moment. You can still send us a note from the contact page and a specialist will reply personally.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI travel concierge"
          className="mb-3 flex h-[560px] max-h-[82vh] w-[calc(100vw-2rem)] animate-scale-in flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-cream-50 shadow-lift sm:w-[390px]"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-forest-deep px-4 py-4 text-cream-100">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
              style={{ background: 'radial-gradient(circle, #C75B39 0%, transparent 70%)' }}
            />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-cream-100/10 text-clay-300">
                  <Sparkles className="h-4 w-4" strokeWidth={1.7} />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-cream-50">
                    Wanderlust concierge
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </p>
                  <p className="text-[10px] font-semibold text-cream-200/55">
                    Here to help, day or night
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close concierge"
                className="grid h-8 w-8 place-items-center rounded-full text-cream-200/70 transition hover:bg-cream-100/10 hover:text-cream-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto bg-cream-100 px-4 py-4"
          >
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest text-cream-50">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-[1.7] ${
                      isUser
                        ? 'rounded-br-md bg-ink text-cream-50'
                        : 'rounded-bl-md border border-ink/[0.08] bg-cream-50 text-ink-600 shadow-soft'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-cream-50">
                  <Bot className="h-3.5 w-3.5" />
                </span>
                <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-ink/10 bg-cream-50 px-4 py-3">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-clay-400"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 2 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-ink/10 bg-cream-50 px-3 py-2.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 rounded-full border border-ink/10 bg-cream-100 px-3 py-1.5 text-[10px] font-bold text-ink-500 transition hover:border-ink/20 hover:bg-white hover:text-ink"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="border-t border-ink/10 bg-cream-50 p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-ink/10 bg-white p-1.5 pl-3.5 focus-within:border-clay-400 focus-within:ring-2 focus-within:ring-clay-500/10">
              <label htmlFor="concierge-message" className="sr-only">
                Message the concierge
              </label>
              <input
                ref={inputRef}
                id="concierge-message"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about a journey…"
                className="min-w-0 flex-1 bg-transparent py-2 text-[12px] font-medium text-ink outline-none placeholder:text-ink-300"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-cream-50 transition hover:bg-forest disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] font-semibold text-ink-300">
              AI answers can be imperfect. A specialist can always take over.
            </p>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isOpen ? 'Close AI Concierge Chat' : 'Toggle AI Concierge Chat'}
        aria-expanded={isOpen}
        className={`group flex items-center gap-2 rounded-full shadow-card transition-all duration-300 ${
          isOpen
            ? 'h-12 w-12 justify-center bg-ink text-cream-50 hover:bg-forest'
            : 'bg-ink px-4 py-3 text-cream-50 hover:-translate-y-0.5 hover:bg-forest hover:shadow-lift'
        }`}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <span className="relative grid h-7 w-7 place-items-center rounded-full bg-clay-500">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cream-50 ring-2 ring-ink" />
            </span>
            <span className="hidden items-center gap-1.5 text-[12px] font-extrabold sm:flex">
              Ask a concierge
              <Compass className="h-3.5 w-3.5 text-cream-200/60 transition group-hover:rotate-45" />
            </span>
          </>
        )}
      </button>
    </div>
  );
};
