// frontend/src/components/dashboard/ChatbotWidget.jsx
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import api from "../../services/api";

const SUGGESTED_QUESTIONS = [
  "Bulan ini saya boros di kategori apa?",
  "Bagaimana cara hemat untuk sisa bulan ini?",
  "Berikan analisis pengeluaran saya",
  "Tips mengelola budget mahasiswa",
];

function ChatMessage({ message }) {
  const isBot = message.role === "assistant";
  return (
    <div className={`flex gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isBot ? "bg-teal-500" : "bg-zinc-200"}`}>
        {isBot
          ? <Bot size={14} className="text-white" />
          : <User size={14} className="text-zinc-600" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
        ${isBot
          ? "bg-white border border-teal-100 text-zinc-800 rounded-tl-sm"
          : "bg-teal-500 text-white rounded-tr-sm"
        }`}>
        {message.content}
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([
    {
      role   : "assistant",
      content: "Halo! 👋 Saya asisten keuangan SnapBudget. Saya bisa membantu menganalisis pengeluaran, memberikan tips hemat, dan menjawab pertanyaan seputar keuangan kamu. Ada yang bisa saya bantu?",
    },
  ]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef            = useRef(null);
  const inputRef                  = useRef(null);

  // Auto scroll ke bawah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input saat dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    // Tambah pesan user
    const userMessage = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Kirim ke backend
      const history = messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role, content: m.content }));

      const result = await api.post("/chatbot/chat", {
        message            : messageText,
        conversationHistory: history,
      });

      // Tambah respons bot
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: result.data.response },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role   : "assistant",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi. 🙏",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-6 w-[340px] md:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-teal-100 flex flex-col z-50 animate-fadeIn">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-teal-500 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">SnapBudget AI</p>
                <p className="text-[10px] text-teal-100">Asisten Keuangan Pribadi</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center transition-colors rounded-full w-7 h-7 bg-white/20 hover:bg-white/30"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-zinc-50">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="flex items-center justify-center flex-shrink-0 bg-teal-500 rounded-full w-7 h-7">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white border border-teal-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <Loader2 size={14} className="text-teal-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-white border-t border-zinc-100">
              <p className="text-[10px] text-zinc-400 mb-1.5 font-medium">PERTANYAAN POPULER</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100 hover:bg-teal-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-zinc-100 rounded-b-2xl">
            <div className="flex items-center gap-2 px-3 py-2 transition-all border bg-zinc-50 border-zinc-200 rounded-xl focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya seputar keuangan kamu..."
                className="flex-1 text-sm bg-transparent outline-none text-zinc-800 placeholder:text-zinc-400"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center flex-shrink-0 transition-colors bg-teal-500 rounded-lg w-7 h-7 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed z-50 flex items-center justify-center text-white transition-all bg-teal-500 rounded-full shadow-lg bottom-4 right-4 md:right-6 w-13 h-13 hover:bg-teal-600 hover:scale-105 active:scale-95"
        aria-label="Buka chatbot"
      >
        {isOpen
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
      </button>
    </>
  );
}