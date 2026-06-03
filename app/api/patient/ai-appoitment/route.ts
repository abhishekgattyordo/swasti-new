


// // app/api/patient/ai-appoitment/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";

// // ================= GEMINI =================
// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY!,
// });

// // ================= SESSION MEMORY =================
// const chatMemory = new Map<
//   string,
//   {
//     doctor?: any;
//     date?: string;
//     selectedSlot?: string;
//     patientName?: string;
//     patientPhone?: string;
//     patientId?: string;
//     userId?: string;
//     appointmentId?: string;
//     appointments?: any[];
//     selectedAppointment?: any;
//     newDate?: string;
//     newSlots?: any[];
//     step?: string;
//     slots?: any[];
//     conversationHistory?: any[];
//   }
// >();

// // ================= FETCH DOCTORS =================
// async function fetchDoctorsFromAPI() {
//   try {
//     const response = await fetch(
//       `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/doctors`,
//       { cache: "no-store" }
//     );
//     const data = await response.json();
//     return data.success ? data.data : [];
//   } catch (error) {
//     console.error("❌ Failed to fetch doctors:", error);
//     return [];
//   }
// }

// // ================= FETCH REAL SLOTS =================
// async function fetchDoctorSlots(request: NextRequest, doctorId: number, date: string) {
//   try {
//     const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//     const url = `${baseUrl}/api/doctors-appoitment/${doctorId}/slots?date=${date}`;
//     console.log("🌍 SLOT URL:", url);

//     const response = await fetch(url, {
//       method: "GET",
//       cache: "no-store",
//       headers: {
//         Cookie: request.headers.get("cookie") || "",
//         Authorization: request.headers.get("authorization") || "",
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();
//     console.log("🕒 SLOT API RESPONSE:", JSON.stringify(data, null, 2));
//     return data;
//   } catch (error) {
//     console.error("❌ Failed to fetch slots:", error);
//     return { success: false, slots: [] };
//   }
// }

// // ================= GET PATIENT APPOINTMENTS =================
// async function getPatientAppointments(patientId: string) {
//   try {
//     const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//     const url = `${baseUrl}/api/appointments/patient/${patientId}`;
    
//     console.log("📋 FETCHING APPOINTMENTS FROM:", url);
    
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
    
//     const data = await response.json();
//     console.log("📋 PATIENT APPOINTMENTS RESPONSE:", JSON.stringify(data, null, 2));
//     return data;
//   } catch (error) {
//     console.error("❌ Failed to fetch appointments:", error);
//     return null;
//   }
// }

// // ================= CREATE APPOINTMENT VIA API =================
// async function createAppointmentViaAPI(
//   request: NextRequest,
//   doctorId: string,
//   patientId: string,
//   date: string,
//   time: string,
//   consultationType: string = "in-person"
// ) {
//   try {
//     const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//     const url = `${baseUrl}/api/appointments/patient`;
    
//     const payload = {
//       doctor_id: doctorId,
//       patient_id: patientId,
//       appointment_date: date,
//       appointment_time: time,
//       consultation_type: consultationType,
//       notes: "Booked via AI Assistant",
//     };
    
//     console.log("📤 CREATING APPOINTMENT VIA API:", JSON.stringify(payload, null, 2));
    
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });
    
//     const data = await response.json();
//     console.log("✅ APPOINTMENT API RESPONSE:", JSON.stringify(data, null, 2));
    
//     return { success: response.ok, data };
//   } catch (error) {
//     console.error("❌ Failed to create appointment:", error);
//     return { success: false, error };
//   }
// }

// // ================= RESCHEDULE APPOINTMENT VIA API =================
// async function rescheduleAppointmentViaAPI(
//   appointmentId: string,
//   newDate: string,
//   newTime: string
// ) {
//   try {
//     const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//     const url = `${baseUrl}/api/appointments/${appointmentId}`;
    
//     const payload = {
//       appointment_date: newDate,
//       appointment_time: newTime,
//     };
    
//     console.log("📤 RESCHEDULING APPOINTMENT VIA API:", JSON.stringify(payload, null, 2));
//     console.log("🔗 RESCHEDULE URL:", url);
    
//     const response = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });
    
//     const data = await response.json();
//     console.log("✅ RESCHEDULE API RESPONSE:", JSON.stringify(data, null, 2));
    
//     return { success: response.ok, data };
//   } catch (error) {
//     console.error("❌ Failed to reschedule appointment:", error);
//     return { success: false, error };
//   }
// }

// // ================= CANCEL APPOINTMENT VIA API =================
// async function cancelAppointmentViaAPI(appointmentId: string) {
//   try {
//     const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
//     const url = `${baseUrl}/api/appointments/${appointmentId}`;
    
//     const payload = {
//       status: "CANCELLED",
//     };
    
//     console.log("📤 CANCELLING APPOINTMENT VIA API:", JSON.stringify(payload, null, 2));
//     console.log("🔗 CANCEL URL:", url);
    
//     const response = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });
    
//     const data = await response.json();
//     console.log("✅ CANCEL API RESPONSE:", JSON.stringify(data, null, 2));
    
//     return { success: response.ok, data };
//   } catch (error) {
//     console.error("❌ Failed to cancel appointment:", error);
//     return { success: false, error };
//   }
// }

// // ================= FORMAT SLOT =================
// function formatSlot(slot: string) {
//   const [h, m] = slot.split(":");
//   const hour = parseInt(h);
//   const ampm = hour >= 12 ? "PM" : "AM";
//   const displayHour = hour % 12 || 12;
//   return `${displayHour}:${m} ${ampm}`;
// }

// // ================= EXTRACT DOCTOR AND DATE FROM USER TEXT =================
// function extractDoctorAndDate(userText: string, realDoctors: any[]) {
//   const lowerText = userText.toLowerCase();
//   let detectedDoctor = null;
//   let detectedDate = null;
  
//   for (const doc of realDoctors) {
//     const firstName = doc.firstName?.toLowerCase() || "";
//     const lastName = doc.lastName?.toLowerCase() || "";
//     if (lowerText.includes(firstName) || lowerText.includes(lastName)) {
//       detectedDoctor = doc;
//       break;
//     }
//   }
  
//   let dateMatch = userText.match(/\d{4}-\d{2}-\d{2}/);
//   if (dateMatch) {
//     detectedDate = dateMatch[0];
//   } else {
//     const mayMatch = userText.match(/May\s+(\d{1,2})(?:st|nd|rd|th)?/i);
//     if (mayMatch) {
//       const day = mayMatch[1].padStart(2, "0");
//       detectedDate = `2026-05-${day}`;
//     }
//   }
  
//   return { detectedDoctor, detectedDate };
// }

// // ================= DETECT INTENTS =================
// function isRescheduleIntent(userText: string): boolean {
//   const lowerText = userText.toLowerCase();
//   const rescheduleKeywords = [
//     "reschedule", "change", "move", "postpone", "shift", 
//     "different time", "different date", "change my appointment",
//     "reschedule my appointment", "change appointment", "rebook"
//   ];
//   return rescheduleKeywords.some(keyword => lowerText.includes(keyword));
// }

// function isCancelIntent(userText: string): boolean {
//   const lowerText = userText.toLowerCase();
//   const cancelKeywords = [
//     "cancel", "remove", "delete", "cancel my appointment",
//     "cancel appointment", "remove appointment", "delete appointment"
//   ];
//   return cancelKeywords.some(keyword => lowerText.includes(keyword));
// }

// // ================= MAIN API =================
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { messages, sessionId = "default", userId, patientId } = body;

//     console.log("👤 User ID:", userId);
//     console.log("👤 Patient ID:", patientId);

//     if (!messages || !Array.isArray(messages)) {
//       return NextResponse.json({ error: "Invalid messages configuration" }, { status: 400 });
//     }

//     const lastMessage = messages[messages.length - 1];
//     const userText = lastMessage.parts?.[0]?.text || lastMessage.content || lastMessage.text || "";

//     console.log("\n" + "=".repeat(60));
//     console.log("📝 USER:", userText);
//     console.log("=".repeat(60));

//     const realDoctors = await fetchDoctorsFromAPI();
//     let memory = chatMemory.get(sessionId) || { step: "start", conversationHistory: [] };

//     if (userId && !memory.userId) {
//       memory.userId = userId;
//       memory.patientId = patientId || userId;
//       chatMemory.set(sessionId, memory);
//       console.log("💾 Saved patientId to memory:", memory.patientId);
//     }

//     // ========== CHECK FOR CANCEL INTENT ==========
//     if (isCancelIntent(userText)) {
//       console.log("❌ CANCEL INTENT DETECTED");
      
//       const appointmentsData = await getPatientAppointments(memory.patientId);
      
//       if (appointmentsData && appointmentsData.data && appointmentsData.data.length > 0) {
//         const upcomingAppointments = appointmentsData.data.filter((apt: any) => apt.status === "BOOKED");
        
//         if (upcomingAppointments.length === 0) {
//           return NextResponse.json({
//             text: "You don't have any upcoming appointments to cancel. Would you like to book a new appointment?"
//           });
//         }
        
//         memory.appointments = upcomingAppointments;
//         memory.step = "awaiting_cancel_selection";
//         chatMemory.set(sessionId, memory);
        
//         const appointmentList = upcomingAppointments.map((apt: any, idx: number) => {
//           return `${idx + 1}. Dr. ${apt.doctor_name} on ${apt.appointment_date} at ${apt.appointment_time}`;
//         }).join("\n");
        
//         return NextResponse.json({
//           text: `Which appointment would you like to cancel?\n\n${appointmentList}\n\nPlease reply with the number.`
//         });
//       } else {
//         return NextResponse.json({
//           text: "No upcoming appointments found to cancel. Would you like to book a new appointment?"
//         });
//       }
//     }

//     // ========== HANDLE CANCEL SELECTION ==========
//     if (memory.step === "awaiting_cancel_selection" && memory.appointments) {
//       const numberMatch = userText.match(/\d+/);
//       if (numberMatch) {
//         const selectedIndex = parseInt(numberMatch[0]) - 1;
//         if (memory.appointments[selectedIndex]) {
//           const appointment = memory.appointments[selectedIndex];
          
//           const result = await cancelAppointmentViaAPI(appointment.id);
          
//           if (result.success) {
//             chatMemory.delete(sessionId);
            
//             return NextResponse.json({
//               text: `✅ **Appointment Cancelled!**\n\nYour appointment with Dr. ${appointment.doctor_name} on ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled.\n\nWould you like to book a new appointment?`
//             });
//           } else {
//             return NextResponse.json({
//               text: `❌ **Failed to cancel appointment.** Error: ${result.data?.message || 'Please try again.'}`
//             });
//           }
//         }
//       }
//     }

//     // ========== CHECK FOR RESCHEDULE INTENT ==========
//     if (isRescheduleIntent(userText)) {
//       console.log("🔄 RESCHEDULE INTENT DETECTED");
      
//       const appointmentsData = await getPatientAppointments(memory.patientId);
      
//       if (appointmentsData && appointmentsData.data && appointmentsData.data.length > 0) {
//         const upcomingAppointments = appointmentsData.data.filter((apt: any) => apt.status === "BOOKED");
        
//         if (upcomingAppointments.length === 0) {
//           return NextResponse.json({
//             text: "You don't have any upcoming appointments to reschedule. Would you like to book a new appointment?"
//           });
//         }
        
//         memory.appointments = upcomingAppointments;
//         memory.step = "awaiting_appointment_selection";
//         chatMemory.set(sessionId, memory);
        
//         const appointmentList = upcomingAppointments.map((apt: any, idx: number) => {
//           return `${idx + 1}. Dr. ${apt.doctor_name} on ${apt.appointment_date} at ${apt.appointment_time}`;
//         }).join("\n");
        
//         return NextResponse.json({
//           text: `Which appointment would you like to reschedule?\n\n${appointmentList}\n\nPlease reply with the number.`
//         });
//       } else {
//         return NextResponse.json({
//           text: "No upcoming appointments found. Would you like to book a new appointment?"
//         });
//       }
//     }

//     // ========== HANDLE APPOINTMENT SELECTION FOR RESCHEDULE ==========
//     if (memory.step === "awaiting_appointment_selection" && memory.appointments) {
//       const numberMatch = userText.match(/\d+/);
//       if (numberMatch) {
//         const selectedIndex = parseInt(numberMatch[0]) - 1;
//         if (memory.appointments[selectedIndex]) {
//           memory.selectedAppointment = memory.appointments[selectedIndex];
//           memory.step = "awaiting_new_date";
//           chatMemory.set(sessionId, memory);
          
//           return NextResponse.json({
//             text: `You selected appointment with Dr. ${memory.selectedAppointment.doctor_name} on ${memory.selectedAppointment.appointment_date} at ${memory.selectedAppointment.appointment_time}.\n\nWhat new date would you prefer? (e.g., "May 25" or "2026-05-25")`
//           });
//         }
//       }
//     }

//     // ========== HANDLE NEW DATE FOR RESCHEDULE ==========
//     if (memory.step === "awaiting_new_date" && memory.selectedAppointment) {
//       const { detectedDate } = extractDoctorAndDate(userText, realDoctors);
      
//       if (detectedDate) {
//         memory.newDate = detectedDate;
//         memory.step = "awaiting_new_slots";
//         chatMemory.set(sessionId, memory);
        
//         const slotData = await fetchDoctorSlots(request, memory.selectedAppointment.doctor_id, detectedDate);
        
//         if (slotData.success && slotData.slots && slotData.slots.length > 0) {
//           const formattedSlots = slotData.slots
//             .map((slot: string, idx: number) => `${idx + 1}. ${formatSlot(slot)}`)
//             .join("\n");
          
//           memory.newSlots = slotData.slots;
//           chatMemory.set(sessionId, memory);
          
//           return NextResponse.json({
//             text: `📅 **Available slots for Dr. ${memory.selectedAppointment.doctor_name} on ${detectedDate}:**\n\n${formattedSlots}\n\nWhich time would you prefer?`
//           });
//         } else {
//           memory.step = "start";
//           chatMemory.set(sessionId, memory);
          
//           return NextResponse.json({
//             text: `❌ No available slots for Dr. ${memory.selectedAppointment.doctor_name} on ${detectedDate}.\n\nWould you like to try another date?`
//           });
//         }
//       } else {
//         return NextResponse.json({
//           text: `Please provide a valid date (e.g., "May 25" or "2026-05-25").`
//         });
//       }
//     }

//     // ========== HANDLE NEW SLOT SELECTION FOR RESCHEDULE ==========
//     if (memory.step === "awaiting_new_slots" && memory.newSlots && memory.selectedAppointment && memory.newDate) {
//       const slotMatch = userText.match(/\d+/);
//       if (slotMatch) {
//         const slotIndex = parseInt(slotMatch[0]) - 1;
//         if (memory.newSlots[slotIndex]) {
//           const newTime = formatSlot(memory.newSlots[slotIndex]);
          
//           const result = await rescheduleAppointmentViaAPI(
//             memory.selectedAppointment.id,
//             memory.newDate,
//             newTime
//           );
          
//           if (result.success) {
//             chatMemory.delete(sessionId);
            
//             return NextResponse.json({
//               text: `✅ **Appointment Rescheduled!**\n\n📋 **New Details:**\n• Doctor: Dr. ${memory.selectedAppointment.doctor_name}\n• Date: ${memory.newDate}\n• Time: ${newTime}\n\nYour appointment has been successfully rescheduled.`
//             });
//           } else {
//             return NextResponse.json({
//               text: `❌ **Failed to reschedule appointment.** Error: ${result.data?.message || 'Please try again.'}`
//             });
//           }
//         }
//       }
//     }

//     // ========== CHECK IF USER IS ASKING ABOUT AVAILABILITY ==========
//     const lowerText = userText.toLowerCase();
//     const isAskingAvailability = lowerText.includes("available") || 
//                                   lowerText.includes("slot") || 
//                                   lowerText.includes("free") ||
//                                   lowerText.includes("can i see") ||
//                                   lowerText.includes("is there");

//     const { detectedDoctor, detectedDate } = extractDoctorAndDate(userText, realDoctors);

//     // ========== RULE 1: IF USER ASKS ABOUT AVAILABILITY WITH DOCTOR AND DATE ==========
//     if (isAskingAvailability && detectedDoctor && detectedDate) {
//       console.log(`🔍 DIRECT SLOT FETCH FOR: ${detectedDoctor.firstName} on ${detectedDate}`);
      
//       const slotData = await fetchDoctorSlots(request, detectedDoctor.id, detectedDate);
      
//       if (slotData.success && slotData.slots && slotData.slots.length > 0) {
//         const formattedSlots = slotData.slots
//           .map((slot: string, idx: number) => `${idx + 1}. ${formatSlot(slot)}`)
//           .join("\n");
        
//         memory.doctor = detectedDoctor;
//         memory.date = detectedDate;
//         memory.slots = slotData.slots;
//         memory.step = "awaiting_slot_selection";
//         chatMemory.set(sessionId, memory);
        
//         return NextResponse.json({
//           text: `📅 **Dr. ${detectedDoctor.firstName} ${detectedDoctor.lastName} has available slots on ${detectedDate}:**\n\n${formattedSlots}\n\nWhich time would you prefer? Please reply with the slot number or time.`
//         });
//       } else {
//         return NextResponse.json({
//           text: `❌ **Dr. ${detectedDoctor.firstName} ${detectedDoctor.lastName} has NO available slots on ${detectedDate}.**\n\nWould you like to:\n• Try another date\n• See a different doctor`
//         });
//       }
//     }

//     // ========== RULE 2: IF USER ASKS ABOUT AVAILABILITY WITH ONLY DATE ==========
//     if (isAskingAvailability && detectedDate && !detectedDoctor) {
//       const doctorList = realDoctors
//         .map((d: any) => `• Dr. ${d.firstName} ${d.lastName} (${d.specialty})`)
//         .join("\n");
      
//       return NextResponse.json({
//         text: `Which doctor would you like to check availability for on **${detectedDate}**?\n\n**Available doctors:**\n${doctorList}\n\nPlease tell me the doctor's name.`
//       });
//     }

//     // ========== RULE 3: IF USER ASKS ABOUT AVAILABILITY WITH ONLY DOCTOR ==========
//     if (isAskingAvailability && detectedDoctor && !detectedDate) {
//       return NextResponse.json({
//         text: `What date would you like to check availability for **Dr. ${detectedDoctor.firstName} ${detectedDoctor.lastName}**?\n\nPlease provide a date (e.g., "May 25" or "2026-05-25").`
//       });
//     }

//     // ========== CHECK IF WE NEED TO FETCH SLOTS (from memory/state) ==========
//     const needsSlotFetch = memory.step === "awaiting_slots" && memory.doctor && memory.date;

//     if (needsSlotFetch) {
//       console.log("🔍 FETCHING SLOTS FROM MEMORY:", memory.doctor.id, memory.date);
//       const slotData = await fetchDoctorSlots(request, memory.doctor.id, memory.date);

//       if (slotData.success && slotData.slots && slotData.slots.length > 0) {
//         const formattedSlots = slotData.slots.map((slot: string, idx: number) => `${idx + 1}. ${formatSlot(slot)}`).join("\n");
        
//         memory.slots = slotData.slots;
//         memory.step = "awaiting_slot_selection";
//         chatMemory.set(sessionId, memory);

//         return NextResponse.json({
//           text: `📅 **Available slots for Dr. ${memory.doctor.firstName} ${memory.doctor.lastName} on ${memory.date}:**\n\n${formattedSlots}\n\nPlease select a time slot by replying with the number or time.`
//         });
//       } else {
//         memory.step = "start";
//         chatMemory.set(sessionId, memory);
        
//         return NextResponse.json({
//           text: `❌ **No available slots** for Dr. ${memory.doctor.firstName} ${memory.doctor.lastName} on ${memory.date}.\n\nWould you like to:\n• Try another date\n• See a different doctor`
//         });
//       }
//     }

//     // ========== CHECK IF USER IS TRYING TO BOOK (from memory) ==========
//     if (memory.step === "awaiting_slot_selection" && memory.slots) {
//       const slotMatch = userText.match(/\d+/);
//       if (slotMatch) {
//         const slotIndex = parseInt(slotMatch[0]) - 1;
//         if (memory.slots[slotIndex]) {
//           memory.selectedSlot = formatSlot(memory.slots[slotIndex]);
//           memory.step = "awaiting_name";
//           chatMemory.set(sessionId, memory);
          
//           return NextResponse.json({
//             text: `You selected **${memory.selectedSlot}**. Please provide your **full name** to complete the booking.`
//           });
//         }
//       }
      
//       const timeMatch = userText.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
//       if (timeMatch) {
//         const userTime = timeMatch[0].toUpperCase();
//         const matchedSlot = memory.slots.find((slot: string) => formatSlot(slot).toUpperCase() === userTime);
//         if (matchedSlot) {
//           memory.selectedSlot = userTime;
//           memory.step = "awaiting_name";
//           chatMemory.set(sessionId, memory);
          
//           return NextResponse.json({
//             text: `You selected **${memory.selectedSlot}**. Please provide your **full name** to complete the booking.`
//           });
//         }
//       }
//     }

//     // ========== CHECK FOR NAME ==========
//     if (memory.step === "awaiting_name" && !memory.patientName) {
//       if (userText.length > 2 && !userText.match(/\d{10}/)) {
//         memory.patientName = userText;
//         memory.step = "awaiting_phone";
//         chatMemory.set(sessionId, memory);
        
//         return NextResponse.json({
//           text: `Thank you, ${memory.patientName}. Please provide your **10-digit phone number** for confirmation.`
//         });
//       }
//     }

//     // ========== CHECK FOR PHONE AND CREATE APPOINTMENT ==========
//     if (memory.step === "awaiting_phone" && !memory.patientPhone) {
//       const phoneMatch = userText.match(/\b\d{10}\b/);
//       if (phoneMatch) {
//         memory.patientPhone = phoneMatch[0];
        
//         const patientId = memory.patientId;
        
//         if (!patientId) {
//           console.error("❌ No patientId available. User may not be logged in.");
//           return NextResponse.json({
//             text: `❌ **Unable to book appointment.** Please ensure you are logged in.`
//           });
//         }
        
//         console.log("👤 Creating appointment for Patient ID:", patientId);
        
//         let time24 = memory.selectedSlot || "09:00";
//         if (time24.includes("PM") && !time24.startsWith("12")) {
//           const hour = parseInt(time24.split(":")[0]) + 12;
//           time24 = `${hour}:${time24.split(":")[1].split(" ")[0]}`;
//         } else if (time24.includes("AM") && time24.startsWith("12")) {
//           time24 = `00:${time24.split(":")[1].split(" ")[0]}`;
//         } else {
//           time24 = time24.split(" ")[0];
//         }
        
//         const result = await createAppointmentViaAPI(
//           request,
//           String(memory.doctor?.id || "3"),
//           patientId,
//           memory.date || new Date().toISOString().split('T')[0],
//           time24,
//           "in-person"
//         );
        
//         if (result.success) {
//           chatMemory.delete(sessionId);
          
//           return NextResponse.json({
//             text: `✅ **Appointment Confirmed!**\n\n📋 **Details:**\n• Doctor: Dr. ${memory.doctor?.firstName} ${memory.doctor?.lastName}\n• Department: ${memory.doctor?.specialty}\n• Date: ${memory.date}\n• Time: ${memory.selectedSlot}\n• Patient: ${memory.patientName}\n• Phone: ${memory.patientPhone}\n\nThank you for choosing Saint Mary's Hospital.`
//           });
//         } else {
//           return NextResponse.json({
//             text: `❌ **Failed to book appointment.** Error: ${result.data?.message || 'Please try again.'}`
//           });
//         }
//       } else {
//         return NextResponse.json({
//           text: `Please provide a valid **10-digit phone number** (e.g., 9876543210).`
//         });
//       }
//     }

//     // ========== AI SYSTEM PROMPT (for general conversation) ==========
//     const doctorsList = realDoctors
//       .map((d: any) => `- Dr. ${d.firstName} ${d.lastName} (${d.specialty})`)
//       .join("\n");

//     const systemPrompt = `
// You are an intelligent, friendly AI Hospital Appointment Assistant for Saint Mary's Hospital.

// ## REAL HOSPITAL DATA:
// - Current Date: ${new Date().toLocaleDateString()}
// - Available Doctors:
// ${doctorsList}

// ## CRITICAL RULES:
// 1. NEVER say a doctor is available without real data
// 2. NEVER invent fake doctors, slots, or timings
// 3. ONLY use doctors from the list above

// ## CLINIC HOURS:
// - Monday-Friday: 8:00 AM - 8:00 PM
// - Saturday: 9:00 AM - 5:00 PM
// - Sunday: 10:00 AM - 2:00 PM

// Be helpful, warm, and professional.
// `;

//     const formattedMessages = messages.map((msg: any) => ({
//       role: msg.role === "user" ? "user" : "model",
//       parts: [{ text: msg.parts?.[0]?.text || msg.content || msg.text || "" }],
//     }));

//     const response = await ai.models.generateContent({
//       model: "gemini-3.5-flash", 
//       contents: formattedMessages,
//       config: {
//         systemInstruction: systemPrompt,
//         temperature: 0.3,
//         maxOutputTokens: 1024,
//       },
//     });

//     const aiResponse = response.text || "";

//     const { detectedDoctor: aiDoctor, detectedDate: aiDate } = extractDoctorAndDate(aiResponse, realDoctors);
    
//     if (aiDoctor && aiDate && memory.step !== "awaiting_slots") {
//       memory.doctor = aiDoctor;
//       memory.date = aiDate;
//       memory.step = "awaiting_slots";
//       chatMemory.set(sessionId, memory);
      
//       return NextResponse.json({ 
//         text: aiResponse + "\n\nI'll check available slots for you right away..." 
//       });
//     }
    
//     memory.conversationHistory = memory.conversationHistory || [];
//     memory.conversationHistory.push({ role: "user", content: userText });
//     memory.conversationHistory.push({ role: "assistant", content: aiResponse.substring(0, 200) });
    
//     if (memory.conversationHistory.length > 10) {
//       memory.conversationHistory = memory.conversationHistory.slice(-10);
//     }
    
//     chatMemory.set(sessionId, memory);

//     return NextResponse.json({ text: aiResponse });

//   } catch (err: any) {
//     console.error("❌ SERVER ERROR:", err);
//     return NextResponse.json({ error: "Hospital assistant unavailable." }, { status: 500 });
//   }
// }




// app/api/patient/ai-appoitment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ================= GEMINI =================
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// ================= SESSION MEMORY =================
const chatMemory = new Map<
  string,
  {
    doctor?: any;
    date?: string;
    selectedSlot?: string;
    patientName?: string;
    patientPhone?: string;
    patientId?: string;
    userId?: string;
    appointmentId?: string;
    appointments?: any[];
    selectedAppointment?: any;
    newDate?: string;
    newSlots?: any[];
    step?: string;
    slots?: any[];
    conversationHistory?: any[];
  }
>();

// ================= FETCH DOCTORS =================
async function fetchDoctorsFromAPI() {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/doctors`,
      { cache: "no-store" }
    );
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("❌ Failed to fetch doctors:", error);
    return [];
  }
}

// ================= FETCH REAL SLOTS =================
async function fetchDoctorSlots(request: NextRequest, doctorId: number, date: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/doctors-appoitment/${doctorId}/slots?date=${date}`;
    console.log("🌍 SLOT URL:", url);

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: request.headers.get("cookie") || "",
        Authorization: request.headers.get("authorization") || "",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("🕒 SLOT API RESPONSE:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch slots:", error);
    return { success: false, slots: [] };
  }
}

// ================= GET PATIENT APPOINTMENTS =================
async function getPatientAppointments(request: NextRequest, patientId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/appointments/patient/${patientId}`;
    
    console.log("📋 FETCHING APPOINTMENTS FROM:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
        Authorization: request.headers.get("authorization") || "",
      },
    });
    
    const data = await response.json();
    console.log("📋 PATIENT APPOINTMENTS RESPONSE:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch appointments:", error);
    return null;
  }
}

// ================= CREATE APPOINTMENT VIA API =================
async function createAppointmentViaAPI(
  request: NextRequest,
  doctorId: string,
  patientId: string,
  date: string,
  time: string,
  consultationType: string = "in-person"
) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/appointments/patient`;
    
    const payload = {
      doctor_id: doctorId,
      patient_id: patientId,
      appointment_date: date,
      appointment_time: time,
      consultation_type: consultationType,
      notes: "Booked via AI Assistant",
    };
    
    console.log("📤 CREATING APPOINTMENT VIA API:", JSON.stringify(payload, null, 2));
    
    const authHeader = request.headers.get("authorization") || "";
    const cookieHeader = request.headers.get("cookie") || "";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    console.log("✅ APPOINTMENT API RESPONSE:", JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error("❌ Failed to create appointment:", error);
    return { success: false, error };
  }
}

// ================= RESCHEDULE APPOINTMENT VIA API =================
async function rescheduleAppointmentViaAPI(
  request: NextRequest,
  appointmentId: string,
  newDate: string,
  newTime: string
) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/appointments/${appointmentId}`;
    
    const payload = {
      appointment_date: newDate,
      appointment_time: newTime,
    };
    
    console.log("📤 RESCHEDULING APPOINTMENT VIA API:", JSON.stringify(payload, null, 2));
    console.log("🔗 RESCHEDULE URL:", url);
    
    const authHeader = request.headers.get("authorization") || "";
    const cookieHeader = request.headers.get("cookie") || "";
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    console.log("✅ RESCHEDULE API RESPONSE:", JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error("❌ Failed to reschedule appointment:", error);
    return { success: false, error };
  }
}

// ================= CANCEL APPOINTMENT VIA API =================
async function cancelAppointmentViaAPI(
  request: NextRequest,
  appointmentId: string
) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/appointments/${appointmentId}`;
    
    const payload = {
      status: "CANCELLED",
    };
    
    console.log("📤 CANCELLING APPOINTMENT VIA API:", JSON.stringify(payload, null, 2));
    console.log("🔗 CANCEL URL:", url);
    
    const authHeader = request.headers.get("authorization") || "";
    const cookieHeader = request.headers.get("cookie") || "";
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    console.log("✅ CANCEL API RESPONSE:", JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error("❌ Failed to cancel appointment:", error);
    return { success: false, error };
  }
}

// ================= FORMAT SLOT =================
function formatSlot(slot: string) {
  const [h, m] = slot.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

// ================= EXTRACT DOCTOR AND DATE FROM USER TEXT =================
function extractDoctorAndDate(userText: string, realDoctors: any[]) {
  const lowerText = userText.toLowerCase();
  let detectedDoctor = null;
  let detectedDate = null;
  
  for (const doc of realDoctors) {
    const firstName = doc.firstName?.toLowerCase() || "";
    const lastName = doc.lastName?.toLowerCase() || "";
    if (lowerText.includes(firstName) || lowerText.includes(lastName)) {
      detectedDoctor = doc;
      break;
    }
  }
  
  let dateMatch = userText.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) {
    detectedDate = dateMatch[0];
  } else {
    const mayMatch = userText.match(/May\s+(\d{1,2})(?:st|nd|rd|th)?/i);
    if (mayMatch) {
      const day = mayMatch[1].padStart(2, "0");
      detectedDate = `2026-05-${day}`;
    }
  }
  
  return { detectedDoctor, detectedDate };
}

// ================= DETECT INTENTS =================
function isRescheduleIntent(userText: string): boolean {
  const lowerText = userText.toLowerCase();
  const rescheduleKeywords = [
    "reschedule", "change", "move", "postpone", "shift", 
    "different time", "different date", "change my appointment",
    "reschedule my appointment", "change appointment", "rebook"
  ];
  return rescheduleKeywords.some(keyword => lowerText.includes(keyword));
}

function isCancelIntent(userText: string): boolean {
  const lowerText = userText.toLowerCase();
  const cancelKeywords = [
    "cancel", "remove", "delete", "cancel my appointment",
    "cancel appointment", "remove appointment", "delete appointment"
  ];
  return cancelKeywords.some(keyword => lowerText.includes(keyword));
}

// ================= MAIN API =================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, sessionId = "default", userId, patientId } = body;

    console.log("👤 User ID:", userId);
    console.log("👤 Patient ID:", patientId);

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages configuration" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.parts?.[0]?.text || lastMessage.content || lastMessage.text || "";

    console.log("\n" + "=".repeat(60));
    console.log("📝 USER:", userText);
    console.log("=".repeat(60));

    const realDoctors = await fetchDoctorsFromAPI();
    let memory = chatMemory.get(sessionId) || { step: "start", conversationHistory: [] };

    if (userId && !memory.userId) {
      memory.userId = userId;
      memory.patientId = patientId || userId;
      chatMemory.set(sessionId, memory);
      console.log("💾 Saved patientId to memory:", memory.patientId);
    }

    // ========== CHECK FOR CANCEL INTENT ==========
    if (isCancelIntent(userText)) {
      console.log("❌ CANCEL INTENT DETECTED");

      if (!memory.patientId) {
  return NextResponse.json(
    { error: "Patient ID not found. Please login again." },
    { status: 401 }
  );
}
      
      const appointmentsData = await getPatientAppointments(request, memory.patientId);
      
      if (appointmentsData && appointmentsData.data && appointmentsData.data.length > 0) {
        const upcomingAppointments = appointmentsData.data.filter((apt: any) => apt.status === "BOOKED");
        
        if (upcomingAppointments.length === 0) {
          return NextResponse.json({
            text: "You don't have any upcoming appointments to cancel. Would you like to book a new appointment?"
          });
        }
        
        memory.appointments = upcomingAppointments;
        memory.step = "awaiting_cancel_selection";
        chatMemory.set(sessionId, memory);
        
        const appointmentList = upcomingAppointments.map((apt: any, idx: number) => {
          return `${idx + 1}. Dr. ${apt.doctor_name} on ${apt.appointment_date} at ${apt.appointment_time}`;
        }).join("\n");
        
        return NextResponse.json({
          text: `Which appointment would you like to cancel?\n\n${appointmentList}\n\nPlease reply with the number.`
        });
      } else {
        return NextResponse.json({
          text: "No upcoming appointments found to cancel. Would you like to book a new appointment?"
        });
      }
    }

    // ========== HANDLE CANCEL SELECTION ==========
    if (memory.step === "awaiting_cancel_selection" && memory.appointments) {
      const numberMatch = userText.match(/\d+/);
      if (numberMatch) {
        const selectedIndex = parseInt(numberMatch[0]) - 1;
        if (memory.appointments[selectedIndex]) {
          const appointment = memory.appointments[selectedIndex];
          
          const result = await cancelAppointmentViaAPI(request, appointment.id);
          
          if (result.success) {
            chatMemory.delete(sessionId);
            
            return NextResponse.json({
              text: `✅ **Appointment Cancelled!**\n\nYour appointment with Dr. ${appointment.doctor_name} on ${appointment.appointment_date} at ${appointment.appointment_time} has been cancelled.\n\nWould you like to book a new appointment?`
            });
          } else {
            return NextResponse.json({
              text: `❌ **Failed to cancel appointment.** Error: ${result.data?.message || 'Please try again.'}`
            });
          }
        }
      }
    }

    // ========== CHECK FOR RESCHEDULE INTENT ==========
    if (isRescheduleIntent(userText)) {
      console.log("🔄 RESCHEDULE INTENT DETECTED");

      if (!memory.patientId) {
  return NextResponse.json(
    { error: "Patient ID not found. Please login again." },
    { status: 401 }
  );
}

      
      const appointmentsData = await getPatientAppointments(request, memory.patientId);
      
      if (appointmentsData && appointmentsData.data && appointmentsData.data.length > 0) {
        const upcomingAppointments = appointmentsData.data.filter((apt: any) => apt.status === "BOOKED");
        
        if (upcomingAppointments.length === 0) {
          return NextResponse.json({
            text: "You don't have any upcoming appointments to reschedule. Would you like to book a new appointment?"
          });
        }
        
        memory.appointments = upcomingAppointments;
        memory.step = "awaiting_appointment_selection";
        chatMemory.set(sessionId, memory);
        
        const appointmentList = upcomingAppointments.map((apt: any, idx: number) => {
          return `${idx + 1}. Dr. ${apt.doctor_name} on ${apt.appointment_date} at ${apt.appointment_time}`;
        }).join("\n");
        
        return NextResponse.json({
          text: `Which appointment would you like to reschedule?\n\n${appointmentList}\n\nPlease reply with the number.`
        });
      } else {
        return NextResponse.json({
          text: "No upcoming appointments found. Would you like to book a new appointment?"
        });
      }
    }

    // ========== HANDLE APPOINTMENT SELECTION FOR RESCHEDULE ==========
    if (memory.step === "awaiting_appointment_selection" && memory.appointments) {
      const numberMatch = userText.match(/\d+/);
      if (numberMatch) {
        const selectedIndex = parseInt(numberMatch[0]) - 1;
        if (memory.appointments[selectedIndex]) {
          memory.selectedAppointment = memory.appointments[selectedIndex];
          memory.step = "awaiting_new_date";
          chatMemory.set(sessionId, memory);
          
          return NextResponse.json({
            text: `You selected appointment with Dr. ${memory.selectedAppointment.doctor_name} on ${memory.selectedAppointment.appointment_date} at ${memory.selectedAppointment.appointment_time}.\n\nWhat new date would you prefer? (e.g., "May 25" or "2026-05-25")`
          });
        }
      }
    }

    // ========== HANDLE NEW DATE FOR RESCHEDULE ==========
    if (memory.step === "awaiting_new_date" && memory.selectedAppointment) {
      const { detectedDate } = extractDoctorAndDate(userText, realDoctors);
      
      if (detectedDate) {
        memory.newDate = detectedDate;
        memory.step = "awaiting_new_slots";
        chatMemory.set(sessionId, memory);
        
        const slotData = await fetchDoctorSlots(request, memory.selectedAppointment.doctor_id, detectedDate);
        
        if (slotData.success && slotData.slots && slotData.slots.length > 0) {
          const formattedSlots = slotData.slots
            .map((slot: string, idx: number) => `${idx + 1}. ${formatSlot(slot)}`)
            .join("\n");
          
          memory.newSlots = slotData.slots;
          chatMemory.set(sessionId, memory);
          
          return NextResponse.json({
            text: `📅 **Available slots for Dr. ${memory.selectedAppointment.doctor_name} on ${detectedDate}:**\n\n${formattedSlots}\n\nWhich time would you prefer?`
          });
        } else {
          memory.step = "start";
          chatMemory.set(sessionId, memory);
          
          return NextResponse.json({
            text: `❌ No available slots for Dr. ${memory.selectedAppointment.doctor_name} on ${detectedDate}.\n\nWould you like to try another date?`
          });
        }
      } else {
        return NextResponse.json({
          text: `Please provide a valid date (e.g., "May 25" or "2026-05-25").`
        });
      }
    }

    // ========== HANDLE NEW SLOT SELECTION FOR RESCHEDULE ==========
    if (memory.step === "awaiting_new_slots" && memory.newSlots && memory.selectedAppointment && memory.newDate) {
      const slotMatch = userText.match(/\d+/);
      if (slotMatch) {
        const slotIndex = parseInt(slotMatch[0]) - 1;
        if (memory.newSlots[slotIndex]) {
          const newTime = formatSlot(memory.newSlots[slotIndex]);
          
          const result = await rescheduleAppointmentViaAPI(
            request,
            memory.selectedAppointment.id,
            memory.newDate,
            newTime
          );
          
          if (result.success) {
            chatMemory.delete(sessionId);
            
            return NextResponse.json({
              text: `✅ **Appointment Rescheduled!**\n\n📋 **New Details:**\n• Doctor: Dr. ${memory.selectedAppointment.doctor_name}\n• Date: ${memory.newDate}\n• Time: ${newTime}\n\nYour appointment has been successfully rescheduled.`
            });
          } else {
            return NextResponse.json({
              text: `❌ **Failed to reschedule appointment.** Error: ${result.data?.message || 'Please try again.'}`
            });
          }
        }
      }
    }

    // ========== CHECK IF USER IS ASKING ABOUT AVAILABILITY ==========
    const lowerText = userText.toLowerCase();
    const isAskingAvailability = lowerText.includes("available") || 
                                  lowerText.includes("slot") || 
                                  lowerText.includes("free") ||
                                  lowerText.includes("can i see") ||
                                  lowerText.includes("is there");

    const { detectedDoctor, detectedDate } = extractDoctorAndDate(userText, realDoctors);

    // ========== RULE 1: IF USER ASKS ABOUT AVAILABILITY WITH DOCTOR AND DATE ==========
    if (isAskingAvailability && detectedDoctor && detectedDate) {
      console.log(`🔍 DIRECT SLOT FETCH FOR: ${detectedDoctor.firstName} on ${detectedDate}`);
      
      const slotData = await fetchDoctorSlots(request, detectedDoctor.id, detectedDate);
      
      if (slotData.success && slotData.slots && slotData.slots.length > 0) {
        const formattedSlots = slotData.slots
          .map((slot: string, idx: number) => `${idx + 1}. ${formatSlot(slot)}`)
          .join("\n");
        
        memory.doctor = detectedDoctor;
        memory.date = detectedDate;
        memory.slots = slotData.slots;
        memory.step = "awaiting_slot_selection";
        chatMemory.set(sessionId, memory);
        
        return NextResponse.json({
          text: `📅 **Dr. ${detectedDoctor.firstName} ${detectedDoctor.lastName} has available slots on ${detectedDate}:**\n\n${formattedSlots}\n\nWhich time would you prefer? Please reply with the slot number or time.`
        });
      } else {
        return NextResponse.json({
          text: `❌ **Dr. ${detectedDoctor.firstName} ${detectedDoctor.lastName} has NO available slots on ${detectedDate}.**\n\nWould you like to:\n• Try another date\n• See a different doctor`
        });
      }
    }

    // ========== RULE 2: IF USER ASKS ABOUT AVAILABILITY WITH ONLY DATE ==========
    if (isAskingAvailability && detectedDate && !detectedDoctor) {
      const doctorList = realDoctors
        .map((d: any) => `• Dr. ${d.firstName} ${d.lastName} (${d.specialty})`)
        .join("\n");
      
      return NextResponse.json({
        text: `Which doctor would you like to check availability for on **${detectedDate}**?\n\n**Available doctors:**\n${doctorList}\n\nPlease tell me the doctor's name.`
      });
    }

    // ========== RULE 3: IF USER ASKS ABOUT AVAILABILITY WITH ONLY DOCTOR ==========
    if (isAskingAvailability && detectedDoctor && !detectedDate) {
      return NextResponse.json({
        text: `What date would you like to check availability for **Dr. ${detectedDoctor.firstName} ${detectedDoctor.lastName}**?\n\nPlease provide a date (e.g., "May 25" or "2026-05-25").`
      });
    }

    // ========== CHECK IF WE NEED TO FETCH SLOTS (from memory/state) ==========
    const needsSlotFetch = memory.step === "awaiting_slots" && memory.doctor && memory.date;

    if (needsSlotFetch) {
      console.log("🔍 FETCHING SLOTS FROM MEMORY:", memory.doctor.id, memory.date);

        if (!memory.doctor?.id || !memory.date) {
    return NextResponse.json(
      { error: "Missing doctor information or appointment date. Please try again." },
      { status: 400 }
    );
  }
      const slotData = await fetchDoctorSlots(request, memory.doctor.id, memory.date);

      if (slotData.success && slotData.slots && slotData.slots.length > 0) {
        const formattedSlots = slotData.slots.map((slot: string, idx: number) => `${idx + 1}. ${formatSlot(slot)}`).join("\n");
        
        memory.slots = slotData.slots;
        memory.step = "awaiting_slot_selection";
        chatMemory.set(sessionId, memory);

        return NextResponse.json({
          text: `📅 **Available slots for Dr. ${memory.doctor.firstName} ${memory.doctor.lastName} on ${memory.date}:**\n\n${formattedSlots}\n\nPlease select a time slot by replying with the number or time.`
        });
      } else {
        memory.step = "start";
        chatMemory.set(sessionId, memory);
        
        return NextResponse.json({
          text: `❌ **No available slots** for Dr. ${memory.doctor.firstName} ${memory.doctor.lastName} on ${memory.date}.\n\nWould you like to:\n• Try another date\n• See a different doctor`
        });
      }
    }

    // ========== CHECK IF USER IS TRYING TO BOOK (from memory) ==========
    if (memory.step === "awaiting_slot_selection" && memory.slots) {
      const slotMatch = userText.match(/\d+/);
      if (slotMatch) {
        const slotIndex = parseInt(slotMatch[0]) - 1;
        if (memory.slots[slotIndex]) {
          memory.selectedSlot = formatSlot(memory.slots[slotIndex]);
          memory.step = "awaiting_name";
          chatMemory.set(sessionId, memory);
          
          return NextResponse.json({
            text: `You selected **${memory.selectedSlot}**. Please provide your **full name** to complete the booking.`
          });
        }
      }
      
      const timeMatch = userText.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
      if (timeMatch) {
        const userTime = timeMatch[0].toUpperCase();
        const matchedSlot = memory.slots.find((slot: string) => formatSlot(slot).toUpperCase() === userTime);
        if (matchedSlot) {
          memory.selectedSlot = userTime;
          memory.step = "awaiting_name";
          chatMemory.set(sessionId, memory);
          
          return NextResponse.json({
            text: `You selected **${memory.selectedSlot}**. Please provide your **full name** to complete the booking.`
          });
        }
      }
    }

    // ========== CHECK FOR NAME ==========
    if (memory.step === "awaiting_name" && !memory.patientName) {
      if (userText.length > 2 && !userText.match(/\d{10}/)) {
        memory.patientName = userText;
        memory.step = "awaiting_phone";
        chatMemory.set(sessionId, memory);
        
        return NextResponse.json({
          text: `Thank you, ${memory.patientName}. Please provide your **10-digit phone number** for confirmation.`
        });
      }
    }

    // ========== CHECK FOR PHONE AND CREATE APPOINTMENT ==========
    if (memory.step === "awaiting_phone" && !memory.patientPhone) {
      const phoneMatch = userText.match(/\b\d{10}\b/);
      if (phoneMatch) {
        memory.patientPhone = phoneMatch[0];
        
        const patientId = memory.patientId;
        
        if (!patientId) {
          console.error("❌ No patientId available. User may not be logged in.");
          return NextResponse.json({
            text: `❌ **Unable to book appointment.** Please ensure you are logged in.`
          });
        }
        
        console.log("👤 Creating appointment for Patient ID:", patientId);
        
        let time24 = memory.selectedSlot || "09:00";
        if (time24.includes("PM") && !time24.startsWith("12")) {
          const hour = parseInt(time24.split(":")[0]) + 12;
          time24 = `${hour}:${time24.split(":")[1].split(" ")[0]}`;
        } else if (time24.includes("AM") && time24.startsWith("12")) {
          time24 = `00:${time24.split(":")[1].split(" ")[0]}`;
        } else {
          time24 = time24.split(" ")[0];
        }
        
        const result = await createAppointmentViaAPI(
          request,
          String(memory.doctor?.id || "3"),
          patientId,
          memory.date || new Date().toISOString().split('T')[0],
          time24,
          "in-person"
        );
        
        if (result.success) {
          chatMemory.delete(sessionId);
          
          return NextResponse.json({
            text: `✅ **Appointment Confirmed!**\n\n📋 **Details:**\n• Doctor: Dr. ${memory.doctor?.firstName} ${memory.doctor?.lastName}\n• Department: ${memory.doctor?.specialty}\n• Date: ${memory.date}\n• Time: ${memory.selectedSlot}\n• Patient: ${memory.patientName}\n• Phone: ${memory.patientPhone}\n\nThank you for choosing Saint Mary's Hospital.`
          });
        } else {
          return NextResponse.json({
            text: `❌ **Failed to book appointment.** Error: ${result.data?.message || 'Please try again.'}`
          });
        }
      } else {
        return NextResponse.json({
          text: `Please provide a valid **10-digit phone number** (e.g., 9876543210).`
        });
      }
    }

    // ========== AI SYSTEM PROMPT (for general conversation) ==========
    const doctorsList = realDoctors
      .map((d: any) => `- Dr. ${d.firstName} ${d.lastName} (${d.specialty})`)
      .join("\n");

    const systemPrompt = `
You are an intelligent, friendly AI Hospital Appointment Assistant for Saint Mary's Hospital.

## REAL HOSPITAL DATA:
- Current Date: ${new Date().toLocaleDateString()}
- Available Doctors:
${doctorsList}

## CRITICAL RULES:
1. NEVER say a doctor is available without real data
2. NEVER invent fake doctors, slots, or timings
3. ONLY use doctors from the list above

## CLINIC HOURS:
- Monday-Friday: 8:00 AM - 8:00 PM
- Saturday: 9:00 AM - 5:00 PM
- Sunday: 10:00 AM - 2:00 PM

Be helpful, warm, and professional.
`;

    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.parts?.[0]?.text || msg.content || msg.text || "" }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash", 
      contents: formattedMessages,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const aiResponse = response.text || "";

    const { detectedDoctor: aiDoctor, detectedDate: aiDate } = extractDoctorAndDate(aiResponse, realDoctors);
    
    if (aiDoctor && aiDate && memory.step !== "awaiting_slots") {
      memory.doctor = aiDoctor;
      memory.date = aiDate;
      memory.step = "awaiting_slots";
      chatMemory.set(sessionId, memory);
      
      return NextResponse.json({ 
        text: aiResponse + "\n\nI'll check available slots for you right away..." 
      });
    }
    
    memory.conversationHistory = memory.conversationHistory || [];
    memory.conversationHistory.push({ role: "user", content: userText });
    memory.conversationHistory.push({ role: "assistant", content: aiResponse.substring(0, 200) });
    
    if (memory.conversationHistory.length > 10) {
      memory.conversationHistory = memory.conversationHistory.slice(-10);
    }
    
    chatMemory.set(sessionId, memory);

    return NextResponse.json({ text: aiResponse });

  } catch (err: any) {
    console.error("❌ SERVER ERROR:", err);
    return NextResponse.json({ error: "Hospital assistant unavailable." }, { status: 500 });
  }
}