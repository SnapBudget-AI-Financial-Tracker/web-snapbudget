// frontend/src/pages/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Bot, User, Send, Loader2, Trash2, Sparkles } from "lucide-react";
import api from "../services/api";

const SUGGESTED_QUESTIONS = [
  "Bulan ini saya boros di kategori apa?",
  "Bagaimana cara hemat untuk sisa bulan ini?",
  "Berikan analisis pengeluaran saya bulan ini",
  "Tips mengelola budget mahasiswa",
  "Prediksi pengeluaran saya 7 hari ke depan",
  "Kategori mana yang perlu saya kurangi?",
];

function ChatMessage({ message }) {
  const isBot = message.role === "assistant";
  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isBot ? "bg-teal-500" : "bg-zinc-200"}`}
      >
        {isBot ? (
          <Bot size={15} className="text-white" />
        ) : (
          <User size={15} className="text-zinc-600" />
        )}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
        ${
          isBot
            ? "bg-white border border-teal-100 text-zinc-800 rounded-tl-sm shadow-sm"
            : "bg-teal-500 text-white rounded-tr-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo! 👋 Saya asisten keuangan SnapBudget.\n\nSaya bisa membantu kamu:\n• 📊 Menganalisis pengeluaran per kategori\n• 💡 Memberikan tips hemat yang personal\n• 🔮 Menjelaskan prediksi pengeluaran AI\n• 💬 Menjawab pertanyaan seputar keuangan\n\nAda yang bisa saya bantu?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || isLoading) return;

    const userMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await api.post("/chatbot/chat", {
        message: messageText,
        conversationHistory: history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
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

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat direset! 🔄 Ada yang bisa saya bantu?",
      },
    ]);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1
                style={{ fontFamily: "var(--font-heading)" }}
                className="text-xl font-bold text-zinc-900"
              >
                SnapBudget AI
              </h1>
              <p className="text-sm text-zinc-500">
                Asisten keuangan pribadi berbasis AI
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-zinc-200"
          >
            <Trash2 size={14} />
            Reset Chat
          </button>
        </div>

        {/* Chat Container */}
        <div
          className="flex-1 flex flex-col bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden"
          style={{ minHeight: "calc(100vh - 220px)" }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-white border border-teal-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-5 py-3 border-t border-zinc-100 bg-white">
              <p className="text-xs text-zinc-400 font-medium mb-2 uppercase tracking-wide">
                Pertanyaan Populer
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full border border-teal-100 hover:bg-teal-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-4 border-t border-zinc-100 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya seputar keuangan kamu... (Enter untuk kirim)"
                  className="w-full bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 outline-none resize-none"
                  rows={1}
                  disabled={isLoading}
                  style={{ maxHeight: "120px", overflowY: "auto" }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1.5 text-center">
              AI dapat membuat kesalahan. Verifikasi informasi penting.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
