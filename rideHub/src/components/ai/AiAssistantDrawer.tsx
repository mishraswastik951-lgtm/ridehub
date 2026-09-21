import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, StopCircle, RefreshCw, Sparkles, User, HelpCircle } from "lucide-react";
import { streamAssistantReply } from "../../api/ai";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "What is the refund if I cancel tomorrow?",
  "How does the HubX 1-month trial work?",
  "What are loyalty points & hotel coupons?",
  "Can I extend my active ride mid-trip?",
];

export const AiAssistantDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      text: "Hello! I am the RideHub AI Assistant powered by Gemini 2.5 Flash. Ask me about refund policies, HubX trial plans, points redemption, or ride extensions!",
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text: textToSend,
    };

    const assistantMsgId = `a-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      text: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (!questionText) setInput("");
    setIsStreaming(true);
    setErrorMsg(null);

    const historyForApi = messages
      .filter((m) => m.text)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      await streamAssistantReply(textToSend, historyForApi, (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      });
    } catch (err: any) {
      console.error("Assistant streaming error:", err);
      setErrorMsg("Connection issue. Showing offline response.");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text:
                  msg.text ||
                  "I don't know the exact answer offhand for this query. For exact cancellation refund amounts and booking details, please refer directly to the booking confirmation screen or terms page.",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-[#0F1F3D] hover:bg-[#1A2E54] text-white p-4 rounded-full shadow-2xl border-2 border-amber-400 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ${
          isOpen ? "hidden" : "flex"
        }`}
        aria-label="Open RideHub AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-amber-400" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span className="font-heading font-bold text-xs pr-1">Ask AI</span>
      </button>

      {/* Slide-over Drawer / Sheet */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[560px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Top Sheet Header */}
          <div className="bg-[#0F1F3D] text-white p-4 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-sm">RideHub Assistant</h3>
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded-full font-bold">
                    Gemini 2.5
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">Live AI platform support & rules guide</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-[#0A0F1D]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-amber-500 text-slate-950 font-medium rounded-br-none"
                      : "bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="flex items-center gap-1 py-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Chips */}
          <div className="p-3 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isStreaming}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 hover:text-amber-500 dark:hover:bg-amber-500/20 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-colors truncate max-w-[200px]"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              disabled={isStreaming}
              className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />

            {isStreaming ? (
              <button
                onClick={handleStop}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl text-xs transition-colors"
                title="Stop generation"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
