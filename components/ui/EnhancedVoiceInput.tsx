

// "use client";

// import React, { useState, useRef } from 'react';
// import { Mic, Loader2 } from 'lucide-react';
// import toast from 'react-hot-toast';

// interface EnhancedVoiceInputProps {
//   onTranscript: (text: string) => void;
//   fieldName: string;
//   className?: string;
//   disabled?: boolean;
// }

// export default function EnhancedVoiceInput({ 
//   onTranscript, 
//   fieldName,
//   className = "",
//   disabled = false 
// }: EnhancedVoiceInputProps) {
//   const [isListening, setIsListening] = useState(false);
//   const [interimTranscript, setInterimTranscript] = useState("");
//   const recognitionRef = useRef<any>(null);

//   const startListening = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
//     if (!SpeechRecognition) {
//       toast.error("Voice input not supported in this browser");
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.lang = 'en-US';
    
//     let finalText = "";
//     let interimText = "";

//     recognition.onstart = () => {
//       setIsListening(true);
//       setInterimTranscript("");
//       toast.success(`Listening... Speak into microphone`, { duration: 2000 });
//     };

//     recognition.onresult = (event: any) => {
//       interimText = "";
      
//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         const transcript = event.results[i][0].transcript;
//         if (event.results[i].isFinal) {
//           finalText += transcript + " ";
//         } else {
//           interimText += transcript;
//         }
//       }
      
//       setInterimTranscript(interimText);
      
//       // Debug logs
//       console.log(`Interim (${fieldName}):`, interimText);
//       console.log(`Final (${fieldName}):`, finalText);
//     };

//     recognition.onerror = (event: any) => {
//       console.error("Speech error:", event.error);
//       if (event.error === 'no-speech') {
//         toast.error("No speech detected. Please try again.");
//       } else if (event.error === 'network') {
//         toast.error("Network error. Please check connection.");
//       } else if (event.error === 'not-allowed') {
//         toast.error("Microphone access denied. Please allow microphone access.");
//       }
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//       if (finalText.trim()) {
//         onTranscript(finalText.trim());
//         toast.success(`Field filled!`, { duration: 1500 });
//       } else if (interimText.trim()) {
//         onTranscript(interimText.trim());
//         toast.success(`Field filled!`, { duration: 1500 });
//       }
//     };

//     recognitionRef.current = recognition;
//     recognition.start();
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//     }
//     setIsListening(false);
//   };

//   return (
//     <div className={`relative ${className}`}>
//       <button
//         type="button"
//         onClick={isListening ? stopListening : startListening}
//         disabled={disabled}
//         className={`
//           p-2 rounded-full transition-all duration-200
//           ${isListening 
//             ? 'bg-red-500 text-white animate-pulse' 
//             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//           }
//           ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
//         `}
//         title={isListening ? "Stop listening" : "Start voice input"}
//       >
//         {isListening ? (
//           <Loader2 className="w-4 h-4 animate-spin" />
//         ) : (
//           <Mic className="w-4 h-4" />
//         )}
//       </button>
      
//       {isListening && interimTranscript && (
//         <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap z-20">
//           <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full shadow-sm">
//             "{interimTranscript}"
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import React, { useState, useRef } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedVoiceInputProps {
  onTranscript: (text: string) => void;
  fieldName: string;
  className?: string;
  disabled?: boolean;
}

export default function EnhancedVoiceInput({ 
  onTranscript, 
  fieldName,
  className = "",
  disabled = false 
}: EnhancedVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    let finalText = "";
    let interimText = "";

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript("");
      toast.success(`Listening... Speak into microphone`, { duration: 2000 });
    };

    recognition.onresult = (event: any) => {
      interimText = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interimText += transcript;
        }
      }
      
      setInterimTranscript(interimText);
      
      console.log(`Interim (${fieldName}):`, interimText);
      console.log(`Final (${fieldName}):`, finalText);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
      if (event.error === 'no-speech') {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === 'network') {
        toast.error("Network error. Please check connection.");
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please allow microphone access.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalText.trim()) {
        onTranscript(finalText.trim());
        toast.success(`Field filled!`, { duration: 1500 });
      } else if (interimText.trim()) {
        onTranscript(interimText.trim());
        toast.success(`Field filled!`, { duration: 1500 });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={`
          p-2 rounded-full transition-all duration-200
          ${isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
      
      {isListening && interimTranscript && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 whitespace-nowrap z-20">
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full shadow-sm">
            "{interimTranscript}"
          </span>
        </div>
      )}
    </div>
  );
}