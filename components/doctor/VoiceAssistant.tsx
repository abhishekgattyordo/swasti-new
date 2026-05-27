"use client";

import React, { useState } from 'react';
import { Sparkles, Mic } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceAssistantProps {
  onExtractedData: (data: Record<string, any>) => void;
  disabled?: boolean;
}

export default function VoiceAssistant({ onExtractedData, disabled = false }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice assistant not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening... Say patient details in one sentence", { duration: 3000 });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Raw transcript:", transcript);
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      setIsListening(false);
      toast.error("Failed to process voice command. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    
    try {
      const extractedData: Record<string, any> = {};
      const lowerText = text.toLowerCase();
      
      console.log("Processing:", lowerText);
      
      // ========== EXTRACT NAME ==========
      // Pattern: "name is John Doe" or "patient name John Doe" or "John Doe"
      const namePatterns = [
        /(?:name is|patient name|name:|my name is)\s+([A-Za-z\s]+?)(?:\s+(?:phone|age|date of birth|email|blood|allergy|and|$))/i,
        /^([A-Za-z\s]{2,30}?)(?:\s+(?:phone|age|date|email|blood|allergy|and|$))/i
      ];
      
      for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim().length > 2) {
          let name = match[1].trim();
          // Remove common words that might be left over
          name = name.replace(/\s+(?:phone|age|date|email|blood|allergy)\s*$/i, '');
          if (name.length > 2 && !name.match(/^(phone|age|date|email|blood|allergy)$/i)) {
            extractedData.full_name_en = name;
            break;
          }
        }
      }
      
      // ========== EXTRACT PHONE NUMBER ==========
      // Look for 10-digit number (with or without spaces)
      const phoneMatch = text.match(/(\d{10})/);
      if (phoneMatch) {
        extractedData.phone = phoneMatch[1];
      } else {
        // Try to extract digits spoken as words
        const digitWords: Record<string, string> = {
          'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
          'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
        };
        let phoneDigits = "";
        const words = text.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (digitWords[word]) {
            phoneDigits += digitWords[word];
          }
        }
        if (phoneDigits.length === 10) {
          extractedData.phone = phoneDigits;
        }
      }
      
      // ========== EXTRACT EMAIL ==========
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        extractedData.email = emailMatch[1];
      } else {
        // Try to extract email from spoken words (e.g., "john at gmail dot com")
        const emailPattern = /(\S+)\s+at\s+(\S+)\s+dot\s+(\S+)/i;
        const emailMatch2 = text.match(emailPattern);
        if (emailMatch2) {
          extractedData.email = `${emailMatch2[1]}@${emailMatch2[2]}.${emailMatch2[3]}`;
        }
      }
      
      // ========== EXTRACT DATE OF BIRTH ==========
      // Pattern: "May 15th 1990" or "15 May 1990" or "born on May 15 1990"
      const months: Record<string, string> = {
        'january': '01', 'jan': '01', 'february': '02', 'feb': '02',
        'march': '03', 'mar': '03', 'april': '04', 'apr': '04',
        'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07',
        'august': '08', 'aug': '08', 'september': '09', 'sep': '09', 'sept': '09',
        'october': '10', 'oct': '10', 'november': '11', 'nov': '11',
        'december': '12', 'dec': '12'
      };
      
      // Month Day Year
      const monthDayYear = new RegExp(`(${Object.keys(months).join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+(\\d{4})`, 'i');
      let match = text.match(monthDayYear);
      if (match) {
        const month = months[match[1].toLowerCase()];
        const day = match[2].padStart(2, '0');
        const year = match[3];
        extractedData.dob = `${year}-${month}-${day}`;
      } else {
        // Day Month Year
        const dayMonthYear = /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/i;
        match = text.match(dayMonthYear);
        if (match) {
          const day = match[1].padStart(2, '0');
          const month = months[match[2].toLowerCase()];
          const year = match[3];
          extractedData.dob = `${year}-${month}-${day}`;
        }
      }
      
      // ========== EXTRACT GENDER ==========
      if (/\b(male|man|boy|gentleman)\b/i.test(text)) {
        extractedData.gender = 'male';
      } else if (/\b(female|woman|girl|lady)\b/i.test(text)) {
        extractedData.gender = 'female';
      }
      
      // ========== EXTRACT BLOOD GROUP ==========
      const bloodMatch = text.match(/(A|B|AB|O)[+-]/i);
      if (bloodMatch) {
        extractedData.blood_group = bloodMatch[0].toUpperCase();
      }
      
      // ========== EXTRACT ALLERGIES ==========
      const allergyPatterns = [
        /allergic\s+to\s+([^.]+?)(?:\s+and|\s+$|\.)/i,
        /allergies?:?\s+([^.]+?)(?:\s+and|\s+$|\.)/i,
        /allergy\s+to\s+([^.]+?)(?:\s+and|\s+$|\.)/i
      ];
      
      for (const pattern of allergyPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          let allergies = match[1].trim();
          // Remove common trailing words
          allergies = allergies.replace(/\s+(?:phone|name|email|date|blood)$/i, '');
          if (allergies.length > 1) {
            extractedData.allergies = allergies;
            break;
          }
        }
      }
      
      console.log("Extracted data:", extractedData);
      
      if (Object.keys(extractedData).length === 0) {
        // Show examples of what to say
        toast.error(
          "Try saying: 'Patient name John Smith, phone 9876543210, born May 15th 1990'",
          { duration: 5000 }
        );
      } else {
        onExtractedData(extractedData);
        const fields = Object.keys(extractedData).join(', ');
        toast.success(`Found: ${fields}`, { duration: 3000 });
      }
      
    } catch (error) {
      console.error("Error processing voice command:", error);
      toast.error("Failed to process voice command. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={disabled || isListening || isProcessing}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${isListening 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-purple-600 text-white hover:bg-purple-700'
        }
        ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isListening ? (
        <>
          <Mic className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Listening...</span>
        </>
      ) : isProcessing ? (
        <>
          <Sparkles className="w-4 h-4 animate-spin" />
          <span className="text-sm">Processing...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">AI Voice Fill</span>
        </>
      )}
    </button>
  );
}