// app/page.tsx
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { 
  Send, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  AlertCircle, 
  ChevronRight,
  Info,
  Stethoscope,
  X,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Message type definition
interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      parts: [{ text: "👋 Hello! I'm your Hospital Appointment Assistant. How can I help you today?" }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get logged-in user ID from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user) {
        // Get patient_id or id from user object
        const id = user.patient_id || user.id;
        setUserId(id);
        setPatientId(id);
        console.log("✅ Logged-in User ID:", id);
      } else {
        console.log("⚠️ No user found in localStorage");
      }
    } catch (error) {
      console.error("Failed to get user from localStorage:", error);
    }
  }, []);

  const handleSendMessage = async (e?: FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const text = textOverride || input;
    if (!text.trim() || isLoading) return;

    const newUserMessage: Message = {
      role: "user",
      parts: [{ text }]
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Pass userId to the API
      const response = await fetch("/api/patient/ai-appoitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, newUserMessage],
          userId: userId,      // Pass the logged-in user ID
          patientId: patientId // Pass patient ID as well
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${textResponse.substring(0, 150)}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch response");
      }

      // Handle different response formats
      const responseText = data.text || data.reply || data.response || data.message || "I'm here to help with your appointment needs.";
      
      setMessages(prev => [...prev, {
        role: "model",
        parts: [{ text: responseText }]
      }]);

      // If there's an action, handle it here
      if (data.action) {
        console.log("Appointment action:", data.action);
      }

    } catch (error: any) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        role: "model",
        parts: [{ text: `⚠️ ${error.message}` }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Check Appointment", icon: Calendar, text: "Can you check my next appointment?" },
    { label: "Book New", icon: PlusCircle, text: "I want to book a new appointment" },
    { label: "Available Slots", icon: Clock, text: "What appointment slots are available?" },
    { label: "Reschedule", icon: Clock, text: "I need to reschedule my appointment" },
    { label: "Cancel", icon: X, text: "I want to cancel my appointment" },
    { label: "Late Notification", icon: AlertCircle, text: "I'm running late for my appointment" },
    { label: "Show Doctors", icon: User, text: "Show me all doctors" },
    { label: "Clinic Hours", icon: Clock, text: "What are the clinic hours?" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Clinic Info & Quick Actions */}
      

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative max-w-4xl mx-auto w-full px-4 lg:px-0">
        <header className="py-4 lg:hidden flex items-center justify-between border-b border-slate-200 mb-2">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Stethoscope size={18} />
              </div>
              <h1 className="font-bold">Saint Mary's Assistant</h1>
           </div>
           <button className="p-1 text-slate-400 hover:text-slate-600"><HelpCircle size={20}/></button>
        </header>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto pt-8 pb-4 scrollbar-hide">
          <div className="max-w-2xl mx-auto space-y-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${
                      msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-blue-600 text-white"
                    }`}>
                      {msg.role === "user" ? <User size={16} /> : <Stethoscope size={16} />}
                    </div>
                    <div>
                      <div className={`p-4 rounded-2xl shadow-sm border ${
                        msg.role === "user" 
                          ? "bg-blue-600 text-white border-blue-500 rounded-tr-none" 
                          : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
                      </div>
                      {idx === messages.length - 1 && isLoading && (
                        <div className="flex gap-1 mt-2 ml-2">
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Action Suggestions - Desktop */}
        <div className="max-w-2xl mx-auto w-full pb-4 hidden md:flex flex-wrap gap-2 justify-center">
            {["Appointments", "Hours", "Doctors", "Cancel", "Reschedule"].map(tag => (
              <button 
                key={tag}
                onClick={() => handleSendMessage(undefined, `Tell me about ${tag.toLowerCase()}`)}
                className="px-3 py-1 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {tag}
              </button>
            ))}
        </div>

        {/* Input Area */}
        <div className="max-w-2xl mx-auto w-full pb-8">
          <form 
            onSubmit={handleSendMessage}
            className="relative flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
          >
            <div className="pl-2 text-slate-400">
              <HelpCircle size={20} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here... (e.g., 'Show me doctors', 'Book appointment')"
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none text-sm py-2 px-1 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isLoading 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95" 
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-2">
            <Info size={10} /> 
            AI-powered healthcare assistant. For emergencies, please call emergency services immediately.
          </p>
        </div>
      </main>
    </div>
  );
}