import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import api from "../api/client";

const starterMessage = {
  role: "bot",
  text: "Hi, I am FleetPulse Assistant. Ask me about overdue buses, forecast, parts demand, or fleet health.",
};

function normalizeBotReply(rawText) {
  const text = String(rawText || "");

  return text
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+(\d+\.\s)/g, "\n$1")
    .replace(/\s+-\s+/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isSending, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await api.post("/chat", { message: text });
      const reply = normalizeBotReply(
        response?.reply || "I could not generate a response right now.",
      );
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: err.message || "Chat service is unavailable.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-root">
      {open ? (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <strong>FleetPulse Assistant</strong>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`chatbot-bubble ${msg.role === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-row">
            <input
              type="text"
              className="form-control"
              placeholder="Ask FleetPulse..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSend}
              disabled={isSending}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chatbot"
      >
        <MessageCircle size={20} />
      </button>
    </div>
  );
}
