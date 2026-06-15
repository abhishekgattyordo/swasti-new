



// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import {
//   Mic,
//   MicOff,
//   Volume2,
//   VolumeX,
//   Calendar,
//   Clock,
//   Sparkles,
//   RefreshCw,
//   Send,
//   Languages,
//   ChevronRight,
//   ShieldAlert,
// } from "lucide-react";

// // -------------------------------------------------------------
// // Type Definitions
// // -------------------------------------------------------------
// export interface Doctor {
//   id: string;
//   name: string;
//   specialty: string;
//   location: string;
//   timings: string;
//   languages: string[];
// }

// export interface Appointment {
//   id: string;
//   patientName: string;
//   patientPhone: string;
//   doctorId: string;
//   doctorName: string;
//   specialty: string;
//   date: string;
//   time: string;
//   reason: string;
//   status: "booked" | "cancelled";
//   createdAt: string;
// }

// export interface Message {
//   id: string;
//   sender: "user" | "assistant";
//   text: string;
//   timestamp: Date;
// }

// interface LanguageOption {
//   code: string;
//   name: string;
//   nativeName: string;
//   locale: string;
//   samplePhrase: string;
// }

// const LANGUAGES: LanguageOption[] = [
//   { code: "en", name: "English", nativeName: "English", locale: "en-IN", samplePhrase: "I want to schedule an appointment with Dr. Shalini." },
//   { code: "hi", name: "Hindi", nativeName: "हिन्दी", locale: "hi-IN", samplePhrase: "मुझे कल डॉक्टर के साथ अपॉइंटमेंट बुक करनी है।" },
//   { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", locale: "kn-IN", samplePhrase: "ನನಗೆ ನಾಳೆ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬೇಕು." },
//   { code: "tu", name: "Tulu", nativeName: "ತುಳು", locale: "tu-IN", samplePhrase: "ಎಂಕ್ ಡಾಕ್ಟರ್ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಲ್ಪೊಡು." },
//   { code: "ta", name: "Tamil", nativeName: "தமிழ்", locale: "ta-IN", samplePhrase: "எனக்கு நாளை அப்பாயின்ட்மென்ட் வேண்டும்." },
//   { code: "te", name: "Telugu", nativeName: "తెలుగు", locale: "te-IN", samplePhrase: "నాకు రేపు అపాయింట్‌మెంట్ కావాలి." }
// ];

// export default function AarogyaPage() {
//   // System Config states
//   const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
//   const [isMuted, setIsMuted] = useState<boolean>(false);
//   const [isListening, setIsListening] = useState<boolean>(false);
//   // const { patientId } = useAuth();
//     const [patientId, setPatientId] = useState<string | null>(null);

//   // Chat Data state
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "wel-1",
//       sender: "assistant",
//       text: "Namaste! Welcome to Aarogya Clinic. I'm your digital healthcare voice assistant.\n\nI can help you:\n• Book new appointments\n• Check doctor timings\n• Reschedule or cancel appointments\n\nHow can I assist you today?",
//       timestamp: new Date()
//     }
//   ]);
//   const [inputValue, setInputValue] = useState<string>("");
//   const [isAssistantTyping, setIsAssistantTyping] = useState<boolean>(false);

//   // Doctor explorer list
//   const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
//   const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);

//   // Doctor selection & slot UI state (NEW)
//   const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
//   const [selectedDate, setSelectedDate] = useState<string>(() => {
//     const today = new Date();
//     return today.toISOString().split('T')[0];
//   });
//   const [availableSlots, setAvailableSlots] = useState<string[]>([]);
//   const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
//   const [slotError, setSlotError] = useState<string | null>(null);

//   const chatEndRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll logic for chat
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Load initial doctors directory list
//   useEffect(() => {
//     async function loadDoctors() {
//       setIsLoadingDocs(true);
//       try {
//         const res = await fetch("/api/doctors");
//         if (res.ok) {
//           const data = await res.json();
//           if (data.doctors) setAllDoctors(data.doctors);
//         }
//       } catch (err) {
//         console.error("Failed to load doctor database stats:", err);
//       } finally {
//         setIsLoadingDocs(false);
//       }
//     }
//     loadDoctors();
//   }, []);

// useEffect(() => {
//   const id = localStorage.getItem("patientId");
//   console.log("🔍 Retrieved patientId from localStorage:", id);
//   setPatientId(id);
// }, []);


//   // Fetch slots from real backend API (NO MOCK DATA)
//   const fetchSlotsForDoctor = async (doctorId: string, date: string) => {
//     if (!doctorId || !date) return;
//     setIsLoadingSlots(true);
//     setSlotError(null);
//     try {
//       const url = `/api/doctors-appoitment/${doctorId}/slots?date=${date}`;
//       const res = await fetch(url, { cache: 'no-store' });
//       const data = await res.json();
//       if (data.success && Array.isArray(data.slots)) {
//         setAvailableSlots(data.slots);
//       } else {
//         setAvailableSlots([]);
//         setSlotError(data.message || 'No slots available for this doctor on selected date.');
//       }
//     } catch (err) {
//       console.error('Slot fetch error:', err);
//       setSlotError('Failed to load slots. Please try again.');
//       setAvailableSlots([]);
//     } finally {
//       setIsLoadingSlots(false);
//     }
//   };

//   // Trigger slot fetch when doctor or date changes
//   useEffect(() => {
//     if (selectedDoctor) {
//       fetchSlotsForDoctor(selectedDoctor.id, selectedDate);
//     } else {
//       setAvailableSlots([]);
//       setSlotError(null);
//     }
//   }, [selectedDoctor, selectedDate]);

//   // Robust Speech Synthesizer with Tulu/Kannada intelligent voice mapping
//   const speakText = (text: string, langOption: LanguageOption) => {
//     if (typeof window === "undefined" || !window.speechSynthesis || isMuted) {
//       console.warn("Speech Synthesis skipped: muted or unsupported environment");
//       return;
//     }

//     try {
//       window.speechSynthesis.cancel();
//       const cleanText = text.replace(/[•*#_\[\]()-]+/g, " ");
//       const utterance = new SpeechSynthesisUtterance(cleanText);
//       utterance.rate = 0.95;

//       let targetLocale = langOption.locale;
//       if (langOption.code === "tu") {
//         targetLocale = "kn-IN";
//       }

//       const availableVoices = window.speechSynthesis.getVoices();
//       let selectedVoice = null;

//       if (availableVoices && availableVoices.length > 0) {
//         selectedVoice = availableVoices.find(
//           v => v.lang.replace("_", "-").toLowerCase() === targetLocale.toLowerCase()
//         );
//         if (!selectedVoice) {
//           const targetPrefix = targetLocale.split("-")[0].toLowerCase();
//           selectedVoice = availableVoices.find(
//             v => v.lang.replace("_", "-").toLowerCase().startsWith(targetPrefix)
//           );
//         }
//         if (!selectedVoice && (targetLocale.startsWith("kn") || targetLocale.startsWith("tu"))) {
//           selectedVoice = availableVoices.find(v => v.lang.toLowerCase().includes("in"));
//         }
//       }

//       if (selectedVoice) {
//         utterance.voice = selectedVoice;
//         utterance.lang = selectedVoice.lang;
//       } else {
//         utterance.lang = targetLocale;
//       }

//       utterance.onend = () => console.log("[TTS] Finished speaking.");
//       utterance.onerror = (e) => console.error("[TTS] Error:", e);
//       window.speechSynthesis.speak(utterance);
//     } catch (err) {
//       console.error("[TTS] Speech synthesis failure:", err);
//     }
//   };

//   // Sync welcome messages when language changes
//   const handleLanguageChange = (lang: LanguageOption) => {
//     setSelectedLang(lang);
//     let promptText = "Namaste! Welcome to Aarogya Clinic. How can I protect and assist you today?";
//     if (lang.code === "hi") promptText = "आरोग्य रिसेप्शन में आपका स्वागत है! मैं अपॉइंटमेंट बुक करने या निरस्त करने में आपकी सहायता कर सकती हूँ।";
//     if (lang.code === "kn") promptText = "ಆರೋಗ್ಯ ರಿಸೆಪ್ಷನ್ ಗೆ ಸ್ವಾಗತ! ನಾನು ನಿಮಗೆ ಹೊಸ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು ಅಥವಾ ರದ್ದು ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.";
//     if (lang.code === "tu") promptText = "ಆರೋಗ್ಯ ರಿಸೆಪ್ಷನ್ ಗೆ ಈರೆಗ್ ಎದ್ಕೊಣು ಉಲ್ಲೆ! ಡಾಕ್ಟರ್ ಬುಕ್ ಮಲ್ಪೆರೆ ರೆಡಿ ಉಲ್ಲೆರ್. ದಯಪಂದ್ ಪನ್ಲೆ?";
//     if (lang.code === "ta") promptText = "ஆரோக்யா வரவேற்பறைக்கு உங்களை வரவேற்கிறோம்! அப்பாயிண்ட்மெண்ட் முன்பதிவு செய்ய நான் உங்களுக்கு எவ்வாறு உதவ வேண்டும்?";
//     if (lang.code === "te") promptText = "ఆరోగ్య రిసెప్షన్‌కు స్వాగతం! కొత్త అపాయింట్‌మెంట్ బుక్ చేయడానికి ఏ డాక్టర్ కావాలో చెప్పండి?";

//     setMessages([
//       {
//         id: "wel-dyn",
//         sender: "assistant",
//         text: promptText,
//         timestamp: new Date()
//       }
//     ]);

//     setTimeout(() => {
//       speakText(promptText, lang);
//     }, 100);
//   };

//   // Conversational AI Sender
//   const sendChatMessage = async (textToSend: string) => {
//     if (!textToSend.trim()) return;

//     const userMsg: Message = {
//       id: "msg-" + Math.random().toString(36).substring(2, 9),
//       sender: "user",
//       text: textToSend,
//       timestamp: new Date()
//     };

//     setMessages(prev => [...prev, userMsg]);
//     setInputValue("");
//     setIsAssistantTyping(true);

//     try {
//       const payloadHistory = messages.map(m => ({
//         sender: m.sender,
//         text: m.text
//       }));

//     const res = await fetch("/api/patient/appoitment", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     message: textToSend,
//     history: payloadHistory,
//     userLanguageCode: selectedLang.code,
//     patientId: patientId   // real ID from logged-in user
//   })
// });

//       if (!res.ok) {
//         throw new Error("Assistant context request failed");
//       }

//       const data = await res.json();
      
//       const assistantMsg: Message = {
//         id: "msg-" + Math.random().toString(36).substring(2, 9),
//         sender: "assistant",
//         text: data.text || "I processed your request, how else can I help?",
//         timestamp: new Date()
//       };

//       setMessages(prev => [...prev, assistantMsg]);
//       speakText(assistantMsg.text, selectedLang);

//     } catch (err) {
//       console.error("AI Communication error:", err);
//       setMessages(prev => [
//         ...prev,
//         {
//           id: "err-" + Date.now(),
//           sender: "assistant",
//           text: "I am having temporary trouble checking slots. Please try typing or speaking your request again.",
//           timestamp: new Date()
//         }
//       ]);
//     } finally {
//       setIsAssistantTyping(false);
//     }
//   };

//   // Speech Recognition Helper
//   const toggleListening = () => {
//     if (typeof window === "undefined") return;
//     const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechLib) {
//       alert("Speech recognition isn't supported in this browser. Please type your message.");
//       return;
//     }

//     if (isListening) {
//       setIsListening(false);
//     } else {
//       const recInstance = new SpeechLib();
//       recInstance.continuous = false;
//       recInstance.lang = selectedLang.code === "tu" ? "kn-IN" : selectedLang.locale;
      
//       recInstance.onstart = () => {
//         setIsListening(true);
//         if (window.speechSynthesis) window.speechSynthesis.cancel();
//       };
//       recInstance.onend = () => {
//         setIsListening(false);
//       };
//       recInstance.onresult = (event: any) => {
//         const spokenText = event.results[0][0].transcript;
//         if (spokenText) {
//           sendChatMessage(spokenText);
//         }
//       };
//       recInstance.onerror = (__: any) => {
//         setIsListening(false);
//       };
//       recInstance.start();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col antialiased">
//       {/* Top Banner */}
//       <header className="bg-emerald-700 text-white shadow-sm border-b border-emerald-800">
//         <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
//           <div className="flex items-center space-x-3">
//             <div className="bg-emerald-600 p-2.5 rounded-xl border border-emerald-500 shadow-inner flex items-center justify-center">
//               <Sparkles className="w-6 h-6 text-emerald-100 animate-pulse" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold tracking-tight text-white flex items-center">
//                 Aarogya Clinic Portal
//                 <span className="ml-2 text-xs bg-emerald-500/30 text-emerald-100 border border-emerald-500/40 px-2 py-0.5 rounded-full font-normal">
//                   v2.0 Client
//                 </span>
//               </h1>
//               <p className="text-xs text-emerald-200">Multilingual Digital healthcare and Patient Reception Hub</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setIsMuted(!isMuted)}
//               className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-center ${
//                 isMuted
//                   ? "bg-slate-800/20 border-slate-700/30 text-emerald-200"
//                   : "bg-emerald-800/40 border-emerald-600 text-white hover:bg-emerald-800/80"
//               }`}
//               title={isMuted ? "Unmute Assistant Voice Output" : "Mute Assistant Voice Output"}
//             >
//               {isMuted ? <VolumeX className="w-5 h-5 text-red-300" /> : <Volume2 className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Container */}
//       <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
//         {/* LEFT COLUMN: Chat */}
//         <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[550px]">
//           <div className="flex flex-col flex-grow">
//             {/* Voice Assist Header */}
//             <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
//               <div className="flex items-center space-x-3">
//                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
//                 <div>
//                   <h2 className="text-sm font-semibold text-slate-800 flex items-center">
//                     AI Multilingual Receptionist
//                   </h2>
//                   <p className="text-xs text-slate-500">Auto-detects spoken languages and maps slot tools</p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
//                 <Languages className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
//                 {LANGUAGES.map(lang => (
//                   <button
//                     key={lang.code}
//                     onClick={() => handleLanguageChange(lang)}
//                     className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all shrink-0 ${
//                       selectedLang.code === lang.code
//                         ? "bg-slate-800 border-slate-800 text-white shadow-sm"
//                         : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
//                     }`}
//                   >
//                     {lang.nativeName}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Chat messages */}
//             <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-h-[450px]">
//               {messages.map((m) => (
//                 <div
//                   key={m.id}
//                   className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm ${
//                       m.sender === "user"
//                         ? "bg-emerald-600 text-white rounded-br-none"
//                         : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
//                     }`}
//                   >
//                     <div className="whitespace-pre-line font-medium leading-relaxed">{m.text}</div>
//                     <div
//                       className={`text-[10px] mt-1.5 flex justify-end ${
//                         m.sender === "user" ? "text-emerald-200" : "text-slate-400 font-mono"
//                       }`}
//                     >
//                       {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {isAssistantTyping && (
//                 <div className="flex justify-start">
//                   <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center space-x-1.5">
//                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
//                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
//                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
//                   </div>
//                 </div>
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Sample phrases */}
//             <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center">
//               <span className="text-xs text-slate-500 mr-2 shrink-0 font-medium">Try saying:</span>
//               <button
//                 onClick={() => {
//                   setInputValue(selectedLang.samplePhrase);
//                   sendChatMessage(selectedLang.samplePhrase);
//                 }}
//                 className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-none transition shrink-0"
//               >
//                 "{selectedLang.samplePhrase}"
//               </button>
//             </div>

//             {/* Chat Input */}
//             <div className="p-4 bg-white border-t border-slate-200">
//               <form
//                 onSubmit={(e) => {
//                   e.preventDefault();
//                   sendChatMessage(inputValue);
//                 }}
//                 className="flex items-center space-x-3"
//               >
//                 <button
//                   type="button"
//                   onClick={toggleListening}
//                   className={`p-3 rounded-xl border transition-all shrink-0 ${
//                     isListening
//                       ? "bg-red-500 border-red-500 text-white animate-pulse"
//                       : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
//                   }`}
//                   title={isListening ? "Listening... click to stop" : "Speak via Microphone"}
//                 >
//                   {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 flex-shrink-0" />}
//                 </button>

//                 <input
//                   type="text"
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   placeholder="Type appointment command, e.g. 'Book dental checkup tomorrow afternoon'..."
//                   className="flex-grow bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-500 text-sm font-medium px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none transition"
//                 />

//                 <button
//                   type="submit"
//                   disabled={!inputValue.trim() || isAssistantTyping}
//                   className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white transition shrink-0"
//                 >
//                   <Send className="w-5 h-5" />
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: Clinic Directory & Slots */}
//         <div className="lg:col-span-4 space-y-6">
          
//           {/* Doctors Directory (clickable) */}
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
//             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//               <h3 className="text-sm font-bold text-slate-800 flex items-center">
//                 <ChevronRight className="w-4 h-4 text-emerald-600 mr-1" />
//                 Specialist Directory
//               </h3>
//               <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
//                 {allDoctors.length} doctors
//               </span>
//             </div>

//             {isLoadingDocs ? (
//               <div className="p-10 flex justify-center items-center">
//                 <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
//               </div>
//             ) : (
//               <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
//                 {allDoctors.map((doc) => (
//                   <button
//                     key={doc.id}
//                     onClick={() => setSelectedDoctor(doc)}
//                     className={`w-full text-left group p-3 border rounded-xl transition duration-150 ${
//                       selectedDoctor?.id === doc.id
//                         ? 'border-emerald-500 bg-emerald-50 shadow-sm'
//                         : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
//                     }`}
//                   >
//                     <div className="font-semibold text-sm text-slate-800">{doc.name}</div>
//                     <div className="text-xs text-emerald-600 font-medium">{doc.specialty}</div>
//                     <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
//                       <span>Room {doc.location}</span>
//                       <span>Timing: {doc.timings}</span>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Slot Selector (appears only when a doctor is selected) */}
//           {selectedDoctor && (
//             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
//               <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//                 <h3 className="text-sm font-bold text-slate-800 flex items-center">
//                   <Calendar className="w-4 h-4 text-emerald-600 mr-1" />
//                   Available Slots – {selectedDoctor.name}
//                 </h3>
//               </div>

//               {/* Date Picker */}
//               <div>
//                 <label className="block text-xs font-medium text-slate-500 mb-1">Select Date</label>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   min={new Date().toISOString().split('T')[0]}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                 />
//               </div>

//               {/* Loading State */}
//               {isLoadingSlots && (
//                 <div className="flex justify-center py-6">
//                   <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
//                 </div>
//               )}

//               {/* Error State */}
//               {!isLoadingSlots && slotError && (
//                 <div className="text-center py-4 text-rose-600 text-sm bg-rose-50 rounded-lg">
//                   {slotError}
//                 </div>
//               )}

//               {/* No Slots */}
//               {!isLoadingSlots && !slotError && availableSlots.length === 0 && (
//                 <div className="text-center py-6 text-slate-400 text-sm">
//                   No time slots available for this date.
//                 </div>
//               )}

//               {/* Slot Grid */}
//               {!isLoadingSlots && availableSlots.length > 0 && (
//                 <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
//                   {availableSlots.map((slot) => (
//                     <button
//                       key={slot}
//                       className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium py-2 rounded-lg border border-emerald-200 transition"
//                       onClick={() => {
//                         setInputValue(`Book appointment with ${selectedDoctor.name} on ${selectedDate} at ${slot}`);
//                         sendChatMessage(`Book appointment with ${selectedDoctor.name} on ${selectedDate} at ${slot}`);
//                       }}
//                     >
//                       {slot}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               <p className="text-[10px] text-slate-400 text-center mt-2">
//                 Click a slot to instantly request booking via AI assistant
//               </p>
//             </div>
//           )}

//           {/* Info Card */}
//           <div className="bg-slate-800 text-slate-100 rounded-2xl p-6 space-y-4 border border-slate-900 shadow-xl relative overflow-hidden">
//             <div className="absolute top-0 right-0 p-4 opacity-10">
//               <ShieldAlert className="w-24 h-24 text-white" />
//             </div>
            
//             <h4 className="text-sm font-bold text-white flex items-center">
//               <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
//               Aarogya Clinic capabilities
//             </h4>
            
//             <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
//               <li className="flex items-start">
//                 <span className="text-emerald-400 mr-2 font-mono font-bold">•</span>
//                 <span>Type commands organically in your native tongue (e.g. English, Tulu, Kannada, Hindi).</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="text-emerald-400 mr-2 font-mono font-bold">•</span>
//                 <span>Includes real state-preservation tools mapping Gemini AI model directly to direct bookings database.</span>
//               </li>
//               <li className="flex items-start">
//                 <span className="text-emerald-400 mr-2 font-mono font-bold">•</span>
//                 <span>Cancel or reschedule clinic appointments organically via Conversational AI voice commands.</span>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-slate-100 border-t border-slate-200 mt-12 py-6">
//         <p className="text-center text-[11px] text-slate-400 font-medium">
//           &copy; 2026 Aarogya Healthcare Reception Systems. All rights reserved. Persistent DB powered.
//         </p>
//       </footer>
//     </div>
//   );
// }



"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  Languages,
  ChevronRight,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";
import Sidebar from "@/components/patient/Sidebar";

// -------------------------------------------------------------
// Type Definitions (unchanged)
// -------------------------------------------------------------
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  timings: string;
  languages: string[];
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  status: "booked" | "cancelled";
  createdAt: string;
}

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
  samplePhrase: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", locale: "en-IN", samplePhrase: "I want to schedule an appointment with Dr. Shalini." },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", locale: "hi-IN", samplePhrase: "मुझे कल डॉक्टर के साथ अपॉइंटमेंट बुक करनी है।" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", locale: "kn-IN", samplePhrase: "ನನಗೆ ನಾಳೆ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬೇಕು." },
  { code: "tu", name: "Tulu", nativeName: "ತುಳು", locale: "tu-IN", samplePhrase: "ಎಂಕ್ ಡಾಕ್ಟರ್ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಲ್ಪೊಡು." },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", locale: "ta-IN", samplePhrase: "எனக்கு நாளை அப்பாயின்ட்மென்ட் வேண்டும்." },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", locale: "te-IN", samplePhrase: "నాకు రేపు అపాయింట్‌మెంట్ కావాలి." }
];

export default function AarogyaPage() {
  // System Config states
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Chat Data state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "wel-1",
      sender: "assistant",
      text: "Namaste! Welcome to H.I.S. I'm your digital healthcare voice assistant.\n\nI can help you:\n• Book new appointments\n• Check doctor timings\n• Reschedule or cancel appointments\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isAssistantTyping, setIsAssistantTyping] = useState<boolean>(false);

  // Doctor explorer list
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);

  // Doctor selection & slot UI state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load initial doctors directory list
  useEffect(() => {
    async function loadDoctors() {
      setIsLoadingDocs(true);
      try {
        const res = await fetch("/api/doctors");
        if (res.ok) {
          const data = await res.json();
          if (data.doctors) setAllDoctors(data.doctors);
        }
      } catch (err) {
        console.error("Failed to load doctor database stats:", err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
    loadDoctors();
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("patientId");
    console.log("🔍 Retrieved patientId from localStorage:", id);
    setPatientId(id);
  }, []);

  // Fetch slots for selected doctor and date
  const fetchSlotsForDoctor = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setIsLoadingSlots(true);
    setSlotError(null);
    try {
      const url = `/api/doctors-appoitment/${doctorId}/slots?date=${date}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.slots)) {
        setAvailableSlots(data.slots);
      } else {
        setAvailableSlots([]);
        setSlotError(data.message || 'No slots available for this doctor on selected date.');
      }
    } catch (err) {
      console.error('Slot fetch error:', err);
      setSlotError('Failed to load slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Trigger slot fetch when doctor or date changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchSlotsForDoctor(selectedDoctor.id, selectedDate);
    } else {
      setAvailableSlots([]);
      setSlotError(null);
    }
  }, [selectedDoctor, selectedDate]);

  // Speech synthesizer (unchanged)
 const speakText = (text: string, langOption: LanguageOption) => {
  if (typeof window === "undefined" || !window.speechSynthesis || isMuted) {
    console.warn("Speech synthesis skipped: muted or unsupported environment");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[•*#_\[\]()-]+/g, " ");
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95;

  // Helper to find a voice by locale or language
  const findVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    // First try exact match (e.g., "hi-IN")
    let voice = voices.find(v => v.lang === lang);
    if (voice) return voice;
    // Then try language prefix (e.g., "hi")
    const prefix = lang.split('-')[0];
    voice = voices.find(v => v.lang.startsWith(prefix));
    if (voice) return voice;
    // For Tulu, fallback to Kannada
    if (lang === "tu-IN") {
      voice = voices.find(v => v.lang.startsWith("kn"));
    }
    return voice || null;
  };

  let targetLocale = langOption.locale;
  if (langOption.code === "tu") targetLocale = "kn-IN"; // Tulu uses Kannada voice

  // Wait for voices to load if not ready
  const trySpeak = () => {
    const selectedVoice = findVoice(targetLocale);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      // Fallback: set language but use default voice
      utterance.lang = targetLocale;
      console.warn(`No voice found for ${targetLocale}, using default`);
    }
    window.speechSynthesis.speak(utterance);
  };

  // Voices may not be loaded immediately
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      trySpeak();
      window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    trySpeak();
  }

  utterance.onerror = (e) => console.error("[TTS] Error:", e);
};

  // Language change handler (resets chat)
  const handleLanguageChange = (lang: LanguageOption) => {
  setSelectedLang(lang);
  let promptText = "Namaste! Welcome to HIS Clinic. How can I protect and assist you today?";
  if (lang.code === "hi") promptText = "एचआईएस रिसेप्शन में आपका स्वागत है! मैं अपॉइंटमेंट बुक करने या निरस्त करने में आपकी सहायता कर सकती हूँ।";
  if (lang.code === "kn") promptText = "ಎಚ್.ಐ.ಎಸ್ ರಿಸೆಪ್ಷನ್ ಗೆ ಸ್ವಾಗತ! ನಾನು ನಿಮಗೆ ಹೊಸ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು ಅಥವಾ ರದ್ದು ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.";
  if (lang.code === "tu") promptText = "ಎಚ್.ಐ.ಎಸ್ ರಿಸೆಪ್ಷನ್ ಗೆ ಈರೆಗ್ ಎದ್ಕೊಣು ಉಲ್ಲೆ! ಡಾಕ್ಟರ್ ಬುಕ್ ಮಲ್ಪೆರೆ ರೆಡಿ ಉಲ್ಲೆರ್. ದಯಪಂದ್ ಪನ್ಲೆ?";
  if (lang.code === "ta") promptText = "எச்.ஐ.எஸ் வரவேற்பறைக்கு உங்களை வரவேற்கிறோம்! அப்பாயிண்ட்மெண்ட் முன்பதிவு செய்ய நான் உங்களுக்கு எவ்வாறு உதவ வேண்டும்?";
  if (lang.code === "te") promptText = "హెచ్.ఐ.ఎస్ రిసెప్షన్‌కు స్వాగతం! కొత్త అపాయింట్‌మెంట్ బుక్ చేయడానికి ఏ డాక్టర్ కావాలో చెప్పండి?";
  setMessages([
    {
      id: "wel-dyn",
      sender: "assistant",
      text: promptText,
      timestamp: new Date()
    }
  ]);
  setTimeout(() => speakText(promptText, lang), 100);
};

  // Send chat message (unchanged)
  const sendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    const userMsg: Message = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsAssistantTyping(true);
    try {
      const payloadHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));
      const res = await fetch("/api/patient/appoitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: payloadHistory,
          userLanguageCode: selectedLang.code,
          patientId: patientId
        })
      });
      if (!res.ok) throw new Error("Assistant context request failed");
      const data = await res.json();
      const assistantMsg: Message = {
        id: "msg-" + Math.random().toString(36).substring(2, 9),
        sender: "assistant",
        text: data.text || "I processed your request, how else can I help?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      speakText(assistantMsg.text, selectedLang);
    } catch (err) {
      console.error("AI Communication error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "assistant",
          text: "I am having temporary trouble checking slots. Please try typing or speaking your request again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  // Speech recognition (unchanged)
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechLib) {
      alert("Speech recognition isn't supported in this browser. Please type your message.");
      return;
    }
    if (isListening) {
      setIsListening(false);
    } else {
      const recInstance = new SpeechLib();
      recInstance.continuous = false;
      recInstance.lang = selectedLang.code === "tu" ? "kn-IN" : selectedLang.locale;
      recInstance.onstart = () => {
        setIsListening(true);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      };
      recInstance.onend = () => setIsListening(false);
      recInstance.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) sendChatMessage(spokenText);
      };
      recInstance.onerror = () => setIsListening(false);
      recInstance.start();
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100 font-display antialiased">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-20 right-6 z-50 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto">

         

          {/* Main Container (two columns) */}
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Chat */}
            <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[550px]">
              <div className="flex flex-col flex-grow">
                {/* Voice Assist Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800 flex items-center">
                        AI Multilingual Receptionist
                      </h2>
                      <p className="text-xs text-slate-500">Auto-detects spoken languages and maps slot tools</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                    <Languages className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all shrink-0 ${
                          selectedLang.code === lang.code
                            ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-h-[450px]">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm ${
                          m.sender === "user"
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                        }`}
                      >
                        <div className="whitespace-pre-line font-medium leading-relaxed">{m.text}</div>
                        <div className={`text-[10px] mt-1.5 flex justify-end ${m.sender === "user" ? "text-emerald-200" : "text-slate-400 font-mono"}`}>
                          {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isAssistantTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-5 py-3.5 flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Sample phrases */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center">
                  <span className="text-xs text-slate-500 mr-2 shrink-0 font-medium">Try saying:</span>
                  <button
                    onClick={() => sendChatMessage(selectedLang.samplePhrase)}
                    className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-none transition shrink-0"
                  >
                    "{selectedLang.samplePhrase}"
                  </button>
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <form onSubmit={(e) => { e.preventDefault(); sendChatMessage(inputValue); }} className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-3 rounded-xl border transition-all shrink-0 ${
                        isListening
                          ? "bg-red-500 border-red-500 text-white animate-pulse"
                          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
                      }`}
                      title={isListening ? "Listening... click to stop" : "Speak via Microphone"}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 flex-shrink-0" />}
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type appointment command, e.g. 'Book dental checkup tomorrow afternoon'..."
                      className="flex-grow bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-500 text-sm font-medium px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isAssistantTyping}
                      className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white transition shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Clinic Directory & Slots (unchanged) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Doctors Directory */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center">
                    <ChevronRight className="w-4 h-4 text-emerald-600 mr-1" />
                    Specialist Directory
                  </h3>
                  <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                    {allDoctors.length} doctors
                  </span>
                </div>
                {isLoadingDocs ? (
                  <div className="p-10 flex justify-center items-center">
                    <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {allDoctors.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`w-full text-left group p-3 border rounded-xl transition duration-150 ${
                          selectedDoctor?.id === doc.id
                            ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="font-semibold text-sm text-slate-800">{doc.name}</div>
                        <div className="text-xs text-emerald-600 font-medium">{doc.specialty}</div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Room {doc.location}</span>
                          <span>Timing: {doc.timings}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Slot Selector (appears only when a doctor is selected) */}
              {selectedDoctor && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center">
                      <Calendar className="w-4 h-4 text-emerald-600 mr-1" />
                      Available Slots – {selectedDoctor.name}
                    </h3>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {isLoadingSlots && (
                    <div className="flex justify-center py-6">
                      <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                    </div>
                  )}
                  {!isLoadingSlots && slotError && (
                    <div className="text-center py-4 text-rose-600 text-sm bg-rose-50 rounded-lg">{slotError}</div>
                  )}
                  {!isLoadingSlots && !slotError && availableSlots.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm">No time slots available for this date.</div>
                  )}
                  {!isLoadingSlots && availableSlots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium py-2 rounded-lg border border-emerald-200 transition"
                          onClick={() => {
                            setInputValue(`Book appointment with ${selectedDoctor.name} on ${selectedDate} at ${slot}`);
                            sendChatMessage(`Book appointment with ${selectedDoctor.name} on ${selectedDate} at ${slot}`);
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Click a slot to instantly request booking via AI assistant
                  </p>
                </div>
              )}

              {/* Info Card */}
              <div className="bg-slate-800 text-slate-100 rounded-2xl p-6 space-y-4 border border-slate-900 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldAlert className="w-24 h-24 text-white" />
                </div>
                <h4 className="text-sm font-bold text-white flex items-center">
                  <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
                  H.I.S Clinic capabilities
                </h4>
                <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2 font-mono font-bold">•</span>
                    <span>Type commands organically in your native tongue (e.g. English, Tulu, Kannada, Hindi).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2 font-mono font-bold">•</span>
                    <span>Includes real state-preservation tools mapping Gemini AI model directly to direct bookings database.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2 font-mono font-bold">•</span>
                    <span>Cancel or reschedule clinic appointments organically via Conversational AI voice commands.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        
        </div>
      </main>
    </div>
  );
}