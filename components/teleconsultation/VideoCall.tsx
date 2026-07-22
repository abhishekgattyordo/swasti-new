// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
// import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import toast from 'react-hot-toast';

// interface VideoCallProps {
//   appId: string;
//   channel: string;
//   token: string | null;
//   uid: number | null;
//   onClose: () => void;
// }

// export default function VideoCall({ appId, channel, token, uid, onClose }: VideoCallProps) {
//   const [client, setClient] = useState<IAgoraRTCClient | null>(null);
//   const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
//   const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
//   const [isJoined, setIsJoined] = useState(false);
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoMuted, setIsVideoMuted] = useState(false);
//   const [remoteUsers, setRemoteUsers] = useState<{ uid: string | number; videoTrack: any }[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [isConnecting, setIsConnecting] = useState(true);

//   const localVideoRef = useRef<HTMLDivElement>(null);
//   const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement }>({});

//   useEffect(() => {
//     let mounted = true;

//     const init = async () => {
//       if (!appId || !channel) {
//         setError('Missing Agora appId or channel');
//         setIsConnecting(false);
//         return;
//       }

//       try {
//         const finalToken = token === undefined || token === '' ? null : token;

//         const rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
//         if (!mounted) return;
//         setClient(rtcClient);

//         rtcClient.on('user-published', async (user, mediaType) => {
//           await rtcClient.subscribe(user, mediaType);
//           if (mediaType === 'video') {
//             const remoteVideoTrack = user.videoTrack;
//             if (!remoteVideoTrack) return; // ✅ guard against undefined track
//             setRemoteUsers(prev => [...prev, { uid: user.uid, videoTrack: remoteVideoTrack }]);
//             const uidKey = String(user.uid);
//             if (remoteVideoRefs.current[uidKey]) {
//               remoteVideoTrack.play(remoteVideoRefs.current[uidKey]);
//             }
//           }
//           if (mediaType === 'audio') {
//             user.audioTrack?.play();
//           }
//         });

//         rtcClient.on('user-unpublished', (user, mediaType) => {
//           if (mediaType === 'video') {
//             setRemoteUsers(prev => prev.filter(u => String(u.uid) !== String(user.uid)));
//           }
//         });

//         await rtcClient.join(appId, channel, finalToken, uid);
//         if (!mounted) return;
//         setIsJoined(true);
//         setIsConnecting(false);

//         const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
//         if (!mounted) return;
//         setLocalAudioTrack(audioTrack);
//         setLocalVideoTrack(videoTrack);

//         await rtcClient.publish([audioTrack, videoTrack]);

//         if (localVideoRef.current) {
//           videoTrack.play(localVideoRef.current);
//         }
//       } catch (err: any) {
//         let errorMessage = err.message || 'Unknown error';
//         if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
//           errorMessage = 'Cannot connect to Agora server. Check your network or app ID.';
//         } else if (err.code === 'ERR_INVALID_APPID') {
//           errorMessage = 'Invalid App ID. Check your Agora App ID.';
//         } else if (err.code === 'DYNAMIC_USE_STATIC_KEY') {
//           errorMessage = 'Agora project requires a token. Switch to App ID mode for testing.';
//         }
//         setError(errorMessage);
//         setIsConnecting(false);
//         toast.error(`Video call error: ${errorMessage}`);
//       }
//     };

//     init();

//     return () => {
//       mounted = false;
//       if (localAudioTrack) localAudioTrack.close();
//       if (localVideoTrack) localVideoTrack.close();
//       if (client) client.leave();
//     };
//   }, [appId, channel, token, uid]);

//   const toggleAudio = async () => {
//     if (!localAudioTrack) return;
//     await localAudioTrack.setEnabled(isAudioMuted);
//     setIsAudioMuted(!isAudioMuted);
//   };

//   const toggleVideo = async () => {
//     if (!localVideoTrack) return;
//     await localVideoTrack.setEnabled(isVideoMuted);
//     setIsVideoMuted(!isVideoMuted);
//   };

//  const endCall = async () => {
//   try {
//     if (localAudioTrack) {
//       localAudioTrack.stop();
//       localAudioTrack.close();
//     }

//     if (localVideoTrack) {
//       localVideoTrack.stop();
//       localVideoTrack.close();
//     }

//     if (client) {
//       await client.leave();
//     }

//     setIsJoined(false);
//     setRemoteUsers([]);
//   } catch (err) {
//     console.error('Error ending call:', err);
//   } finally {
//     onClose(); // close UI
//   }
// };

//   if (error) {
//     return (
//       <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
//         <div className="bg-red-500 text-white p-6 rounded-lg max-w-md text-center">
//           <AlertCircle className="h-12 w-12 mx-auto mb-4" />
//           <h3 className="text-lg font-bold mb-2">Video Call Failed</h3>
//           <p className="mb-4">{error}</p>
//           <Button onClick={endCall} variant="outline" className="bg-white text-red-500 hover:bg-gray-100">
//             Close
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (isConnecting) {
//     return (
//       <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
//         <div className="text-center text-white">
//           <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
//           <p>Connecting to video call...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isJoined) return null;

//   return (
//     <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
//       <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="relative bg-gray-900 rounded-lg overflow-hidden">
//           <div ref={localVideoRef} className="w-full h-full" />
//           <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
//             You {isVideoMuted ? '(Camera off)' : ''}
//           </div>
//         </div>

//         {remoteUsers.map(user => (
//           <div key={String(user.uid)} className="relative bg-gray-900 rounded-lg overflow-hidden">
//             <div
//               ref={el => {
//                 if (el) remoteVideoRefs.current[String(user.uid)] = el;
//               }}
//               className="w-full h-full"
//             />
//             <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
//               Participant {user.uid}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="flex justify-center items-center gap-4 p-4 bg-gray-800">
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={toggleAudio}
//           className={isAudioMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
//         >
//           {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
//         </Button>
        
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={toggleVideo}
//           className={isVideoMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
//         >
//           {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
//         </Button>
//         <Button variant="destructive" onClick={endCall} className="bg-red-600 hover:bg-red-700">
//           <PhoneOff className="h-5 w-5 mr-2" />
//           End Call
//         </Button>
//       </div>
//     </div>
//   );
// }







// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
// import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle, Plus, MessageSquare } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import toast from 'react-hot-toast';

// interface VideoCallProps {
//   appId: string;
//   channel: string;
//   token: string | null;
//   uid: number | null;
//   onClose: () => void;
// }

// export default function VideoCall({ appId, channel, token, uid, onClose }: VideoCallProps) {
//   const [client, setClient] = useState<IAgoraRTCClient | null>(null);
//   const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
//   const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
//   const [isJoined, setIsJoined] = useState(false);
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoMuted, setIsVideoMuted] = useState(false);
//   const [remoteUsers, setRemoteUsers] = useState<{ uid: string | number; videoTrack: any }[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [isConnecting, setIsConnecting] = useState(true);

//   // --- In-call text notes ---
//   const [noteInput, setNoteInput] = useState('');
//   const [notes, setNotes] = useState<string[]>([]);
//   const [showNotes, setShowNotes] = useState(false);

//   const localVideoRef = useRef<HTMLDivElement>(null);
//   const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement }>({});

//   useEffect(() => {
//     let mounted = true;

//     const init = async () => {
//       if (!appId || !channel) {
//         setError('Missing Agora appId or channel');
//         setIsConnecting(false);
//         return;
//       }

//       try {
//         const finalToken = token === undefined || token === '' ? null : token;

//         const rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
//         if (!mounted) return;
//         setClient(rtcClient);

//         rtcClient.on('user-published', async (user, mediaType) => {
//           await rtcClient.subscribe(user, mediaType);
//           if (mediaType === 'video') {
//             const remoteVideoTrack = user.videoTrack;
//             if (!remoteVideoTrack) return;
//             setRemoteUsers(prev => [...prev, { uid: user.uid, videoTrack: remoteVideoTrack }]);
//             const uidKey = String(user.uid);
//             if (remoteVideoRefs.current[uidKey]) {
//               remoteVideoTrack.play(remoteVideoRefs.current[uidKey]);
//             }
//           }
//           if (mediaType === 'audio') {
//             user.audioTrack?.play();
//           }
//         });

//         rtcClient.on('user-unpublished', (user, mediaType) => {
//           if (mediaType === 'video') {
//             setRemoteUsers(prev => prev.filter(u => String(u.uid) !== String(user.uid)));
//           }
//         });

//         await rtcClient.join(appId, channel, finalToken, uid);
//         if (!mounted) return;
//         setIsJoined(true);
//         setIsConnecting(false);

//         const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
//         if (!mounted) return;
//         setLocalAudioTrack(audioTrack);
//         setLocalVideoTrack(videoTrack);

//         await rtcClient.publish([audioTrack, videoTrack]);

//         if (localVideoRef.current) {
//           videoTrack.play(localVideoRef.current);
//         }
//       } catch (err: any) {
//         let errorMessage = err.message || 'Unknown error';
//         if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
//           errorMessage = 'Cannot connect to Agora server. Check your network or app ID.';
//         } else if (err.code === 'ERR_INVALID_APPID') {
//           errorMessage = 'Invalid App ID. Check your Agora App ID.';
//         } else if (err.code === 'DYNAMIC_USE_STATIC_KEY') {
//           errorMessage = 'Agora project requires a token. Switch to App ID mode for testing.';
//         }
//         setError(errorMessage);
//         setIsConnecting(false);
//         toast.error(`Video call error: ${errorMessage}`);
//       }
//     };

//     init();

//     return () => {
//       mounted = false;
//       if (localAudioTrack) localAudioTrack.close();
//       if (localVideoTrack) localVideoTrack.close();
//       if (client) client.leave();
//     };
//   }, [appId, channel, token, uid]);

//   // ---- Controls ----
//   const toggleAudio = async () => {
//     if (!localAudioTrack) return;
//     await localAudioTrack.setEnabled(isAudioMuted);
//     setIsAudioMuted(!isAudioMuted);
//   };

//   const toggleVideo = async () => {
//     if (!localVideoTrack) return;
//     await localVideoTrack.setEnabled(isVideoMuted);
//     setIsVideoMuted(!isVideoMuted);
//   };

//   const endCall = async () => {
//     try {
//       if (localAudioTrack) {
//         localAudioTrack.stop();
//         localAudioTrack.close();
//       }
//       if (localVideoTrack) {
//         localVideoTrack.stop();
//         localVideoTrack.close();
//       }
//       if (client) {
//         await client.leave();
//       }
//       setIsJoined(false);
//       setRemoteUsers([]);
//     } catch (err) {
//       console.error('Error ending call:', err);
//     } finally {
//       onClose(); // close UI
//     }
//   };

//   // ---- Note functions ----
//   const addNote = () => {
//     if (noteInput.trim()) {
//       setNotes([...notes, noteInput.trim()]);
//       setNoteInput('');
//     }
//   };

//   // ---- Error / Loading states ----
//   if (error) {
//     return (
//       <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
//         <div className="bg-red-500 text-white p-6 rounded-lg max-w-md text-center">
//           <AlertCircle className="h-12 w-12 mx-auto mb-4" />
//           <h3 className="text-lg font-bold mb-2">Video Call Failed</h3>
//           <p className="mb-4">{error}</p>
//           <Button onClick={endCall} variant="outline" className="bg-white text-red-500 hover:bg-gray-100">
//             Close
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (isConnecting) {
//     return (
//       <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
//         <div className="text-center text-white">
//           <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
//           <p>Connecting to video call...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isJoined) return null;

//   // ---- Main UI ----
//   return (
//     <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
//       {/* Video grid */}
//       <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="relative bg-gray-900 rounded-lg overflow-hidden">
//           <div ref={localVideoRef} className="w-full h-full" />
//           <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
//             You {isVideoMuted ? '(Camera off)' : ''}
//           </div>
//         </div>

//         {remoteUsers.map(user => (
//           <div key={String(user.uid)} className="relative bg-gray-900 rounded-lg overflow-hidden">
//             <div
//               ref={el => {
//                 if (el) remoteVideoRefs.current[String(user.uid)] = el;
//               }}
//               className="w-full h-full"
//             />
//             <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
//               Participant {user.uid}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Notes area – above controls */}
//       <div className="bg-gray-800/90 backdrop-blur p-3 border-t border-gray-700">
//         <div className="flex items-center gap-2 max-w-3xl mx-auto">
//           <MessageSquare className="h-5 w-5 text-gray-400 flex-shrink-0" />
//           <input
//             type="text"
//             value={noteInput}
//             onChange={(e) => setNoteInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && addNote()}
//             placeholder="Type a note during the call..."
//             className="flex-1 bg-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <Button
//             size="sm"
//             onClick={addNote}
//             disabled={!noteInput.trim()}
//             className="bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             <Plus className="h-4 w-4 mr-1" />
//             Add
//           </Button>
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => setShowNotes(!showNotes)}
//             className="text-gray-300 border-gray-600 hover:bg-gray-700"
//           >
//             {showNotes ? 'Hide' : 'Show'} Notes ({notes.length})
//           </Button>
//         </div>

//         {/* Notes list (collapsible) */}
//         {showNotes && notes.length > 0 && (
//           <div className="mt-2 max-w-3xl mx-auto max-h-32 overflow-y-auto space-y-1">
//             {notes.map((note, idx) => (
//               <div key={idx} className="text-sm text-gray-300 bg-gray-700/50 rounded px-3 py-1.5">
//                 {note}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Controls */}
//       <div className="flex justify-center items-center gap-4 p-4 bg-gray-800">
//         <Button
//           variant="outline"
//           size="icon"
//           onClick={toggleAudio}
//           className={isAudioMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
//         >
//           {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
//         </Button>

//         <Button
//           variant="outline"
//           size="icon"
//           onClick={toggleVideo}
//           className={isVideoMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
//         >
//           {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
//         </Button>

//         <Button variant="destructive" onClick={endCall} className="bg-red-600 hover:bg-red-700">
//           <PhoneOff className="h-5 w-5 mr-2" />
//           End Call
//         </Button>
//       </div>
//     </div>
//   );
// }










'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle, Pill, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface VideoCallProps {
  appId: string;
  channel: string;
  token: string | null;
  uid: number | null;
  onClose: () => void;
  onOpenPrescription?: () => void;
  onOpenCurrentVisit?: () => void;  // ✅ new callback
}

export default function VideoCall({
  appId,
  channel,
  token,
  uid,
  onClose,
  onOpenPrescription,
  onOpenCurrentVisit,  // ✅ new
}: VideoCallProps) {
  // ... (all existing state and refs remain unchanged)
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<{ uid: string | number; videoTrack: any }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  // Lifecycle refs (unchanged)
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const joiningRef = useRef(false);
  const joinedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup helper (unchanged)
  const cleanup = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
      setLocalVideoTrack(null);
    }
    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch (_) {}
      clientRef.current = null;
    }
    joinedRef.current = false;
    setIsJoined(false);
    setRemoteUsers([]);
  };

  // useEffect for Agora setup (same as before – no changes)
  useEffect(() => {
    let mounted = true;
    let rtcClient: IAgoraRTCClient | null = null;
    let retryCount = 0;

    const init = async (retryUid?: number | null) => {
      if (joiningRef.current || joinedRef.current) {
        console.warn('Already joining or joined, skipping.');
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      joiningRef.current = true;
      setIsConnecting(true);
      setError(null);

      try {
        if (!appId || !channel) {
          throw new Error('Missing Agora appId or channel');
        }

        const finalToken = token === undefined || token === '' ? null : token;
        const finalUid = retryUid !== undefined ? retryUid : uid;

        rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        if (!mounted || abortController.signal.aborted) return;
        clientRef.current = rtcClient;
        setClient(rtcClient);

       rtcClient!.on('user-published', async (user, mediaType) => {
  await rtcClient!.subscribe(user, mediaType);
          if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            if (!remoteVideoTrack) return;
            setRemoteUsers((prev) => {
              if (prev.length > 0) return prev;
              return [{ uid: user.uid, videoTrack: remoteVideoTrack }];
            });
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        rtcClient.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setRemoteUsers((prev) => prev.filter((u) => String(u.uid) !== String(user.uid)));
          }
        });

        await rtcClient.join(appId, channel, finalToken, finalUid);
        if (!mounted || abortController.signal.aborted) {
          await cleanup();
          return;
        }

        joinedRef.current = true;
        setIsJoined(true);
        setIsConnecting(false);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        if (!mounted || abortController.signal.aborted) {
          audioTrack.close();
          videoTrack.close();
          await cleanup();
          return;
        }
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        await rtcClient.publish([audioTrack, videoTrack]);

        if (localVideoRef.current) {
          try {
            await videoTrack.play(localVideoRef.current);
          } catch (_) {}
        }
      } catch (err: any) {
        if (abortController.signal.aborted) return;

        if (err.code === 'UID_CONFLICT' && retryUid === undefined && retryCount === 0) {
          retryCount++;
          console.warn('UID conflict, retrying with random UID...');
          joiningRef.current = false;
          setTimeout(() => {
            if (mounted) {
              init(null);
            }
          }, 500);
          return;
        }

        if (err.message?.includes('cancel token canceled')) {
          console.warn('Join aborted (cancelled).');
          joiningRef.current = false;
          setIsConnecting(false);
          return;
        }

        let errorMessage = err.message || 'Unknown error';
        if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER') {
          errorMessage = 'Cannot connect to Agora server. Check your network or app ID.';
        } else if (err.code === 'ERR_INVALID_APPID') {
          errorMessage = 'Invalid App ID. Check your Agora App ID.';
        } else if (err.code === 'DYNAMIC_USE_STATIC_KEY') {
          errorMessage = 'Agora project requires a token. Switch to App ID mode for testing.';
        }
        setError(errorMessage);
        setIsConnecting(false);
        toast.error(`Video call error: ${errorMessage}`);
      } finally {
        if (!error) {
          joiningRef.current = false;
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      cleanup();
      joiningRef.current = false;
      joinedRef.current = false;
    };
  }, [appId, channel, token, uid]);

  // Controls (unchanged)
  const toggleAudio = async () => {
    if (!localAudioTrack) return;
    await localAudioTrack.setEnabled(isAudioMuted);
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = async () => {
    if (!localVideoTrack) return;
    await localVideoTrack.setEnabled(isVideoMuted);
    setIsVideoMuted(!isVideoMuted);
  };

  const endCall = async () => {
    await cleanup();
    onClose();
  };

  // Error / Loading states (unchanged)
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="bg-red-500 text-white p-6 rounded-lg max-w-md text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Video Call Failed</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={endCall} variant="outline" className="bg-white text-red-500 hover:bg-gray-100">
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Connecting to video call...</p>
        </div>
      </div>
    );
  }

  if (!isJoined) return null;

  // ---- Main UI ----
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Video grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <div ref={localVideoRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
            You {isVideoMuted ? '(Camera off)' : ''}
          </div>
        </div>

        {remoteUsers.map((user) => (
          <div key={String(user.uid)} className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div
              ref={(el) => {
                if (el && user.videoTrack) {
                  try {
                    user.videoTrack.play(el);
                  } catch (_) {}
                }
                if (el) {
                  remoteVideoRefs.current[String(user.uid)] = el;
                } else {
                  delete remoteVideoRefs.current[String(user.uid)];
                }
              }}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
              Participant {user.uid}
            </div>
          </div>
        ))}
      </div>

      {/* Controls bar – added Current Visit button */}
      <div className="flex justify-center items-center gap-4 p-4 bg-gray-800">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleAudio}
          className={isAudioMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
        >
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleVideo}
          className={isVideoMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
        >
          {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>

        {/* ✅ Current Visit button – exactly like Prescription */}
        {onOpenCurrentVisit && (
          <Button
            variant="outline"
            onClick={onOpenCurrentVisit}
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            <FileText className="h-5 w-5 mr-2" />
            Current Visit
          </Button>
        )}

        {onOpenPrescription && (
          <Button
            variant="outline"
            onClick={onOpenPrescription}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
          >
            <Pill className="h-5 w-5 mr-2" />
            Prescription
          </Button>
        )}

        <Button variant="destructive" onClick={endCall} className="bg-red-600 hover:bg-red-700">
          <PhoneOff className="h-5 w-5 mr-2" />
          End Call
        </Button>
      </div>
    </div>
  );
}