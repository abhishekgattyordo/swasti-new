




// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
// import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle, Pill, FileText } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import toast from 'react-hot-toast';

// interface VideoCallProps {
//   appId: string;
//   channel: string;
//   token: string | null;
//   uid: number | null;
//   onClose: () => void;
//   onOpenPrescription?: () => void;
//   onOpenVisitDocumentation?: () => void; // 👈 corrected name
// }

// export default function VideoCall({
//   appId,
//   channel,
//   token,
//   uid,
//   onClose,
//   onOpenPrescription,
//   onOpenVisitDocumentation, // 👈 corrected name
// }: VideoCallProps) {
//   // ... (all existing state and refs remain unchanged)
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

//   // Lifecycle refs (unchanged)
//   const clientRef = useRef<IAgoraRTCClient | null>(null);
//   const joiningRef = useRef(false);
//   const joinedRef = useRef(false);
//   const abortControllerRef = useRef<AbortController | null>(null);

//   // Cleanup helper (unchanged)
//   const cleanup = async () => {
//     if (localAudioTrack) {
//       localAudioTrack.stop();
//       localAudioTrack.close();
//       setLocalAudioTrack(null);
//     }
//     if (localVideoTrack) {
//       localVideoTrack.stop();
//       localVideoTrack.close();
//       setLocalVideoTrack(null);
//     }
//     if (clientRef.current) {
//       try {
//         await clientRef.current.leave();
//       } catch (_) {}
//       clientRef.current = null;
//     }
//     joinedRef.current = false;
//     setIsJoined(false);
//     setRemoteUsers([]);
//   };

//   // useEffect for Agora setup (same as before – no changes)
//   useEffect(() => {
//     let mounted = true;
//     let rtcClient: IAgoraRTCClient | null = null;
//     let retryCount = 0;

//     const init = async (retryUid?: number | null) => {
//       if (joiningRef.current || joinedRef.current) {
//         console.warn('Already joining or joined, skipping.');
//         return;
//       }

//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//       const abortController = new AbortController();
//       abortControllerRef.current = abortController;

//       joiningRef.current = true;
//       setIsConnecting(true);
//       setError(null);

//       try {
//         if (!appId || !channel) {
//           throw new Error('Missing Agora appId or channel');
//         }

//         const finalToken = token === undefined || token === '' ? null : token;
//         const finalUid = retryUid !== undefined ? retryUid : uid;

//         rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
//         if (!mounted || abortController.signal.aborted) return;
//         clientRef.current = rtcClient;
//         setClient(rtcClient);

//         // Use non-null assertion to satisfy TypeScript
//         rtcClient!.on('user-published', async (user, mediaType) => {
//           await rtcClient!.subscribe(user, mediaType);
//           if (mediaType === 'video') {
//             const remoteVideoTrack = user.videoTrack;
//             if (!remoteVideoTrack) return;
//             setRemoteUsers((prev) => {
//               if (prev.length > 0) return prev;
//               return [{ uid: user.uid, videoTrack: remoteVideoTrack }];
//             });
//           }
//           if (mediaType === 'audio') {
//             user.audioTrack?.play();
//           }
//         });

//         rtcClient.on('user-unpublished', (user, mediaType) => {
//           if (mediaType === 'video') {
//             setRemoteUsers((prev) => prev.filter((u) => String(u.uid) !== String(user.uid)));
//           }
//         });

//         await rtcClient.join(appId, channel, finalToken, finalUid);
//         if (!mounted || abortController.signal.aborted) {
//           await cleanup();
//           return;
//         }

//         joinedRef.current = true;
//         setIsJoined(true);
//         setIsConnecting(false);

//         const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
//         if (!mounted || abortController.signal.aborted) {
//           audioTrack.close();
//           videoTrack.close();
//           await cleanup();
//           return;
//         }
//         setLocalAudioTrack(audioTrack);
//         setLocalVideoTrack(videoTrack);

//         await rtcClient.publish([audioTrack, videoTrack]);

//         if (localVideoRef.current) {
//           try {
//             await videoTrack.play(localVideoRef.current);
//           } catch (_) {}
//         }
//       } catch (err: any) {
//         if (abortController.signal.aborted) return;

//         if (err.code === 'UID_CONFLICT' && retryUid === undefined && retryCount === 0) {
//           retryCount++;
//           console.warn('UID conflict, retrying with random UID...');
//           joiningRef.current = false;
//           setTimeout(() => {
//             if (mounted) {
//               init(null);
//             }
//           }, 500);
//           return;
//         }

//         if (err.message?.includes('cancel token canceled')) {
//           console.warn('Join aborted (cancelled).');
//           joiningRef.current = false;
//           setIsConnecting(false);
//           return;
//         }

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
//       } finally {
//         if (!error) {
//           joiningRef.current = false;
//         }
//       }
//     };

//     init();

//     return () => {
//       mounted = false;
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//         abortControllerRef.current = null;
//       }
//       cleanup();
//       joiningRef.current = false;
//       joinedRef.current = false;
//     };
//   }, [appId, channel, token, uid]);

//   // Controls (unchanged)
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
//     await cleanup();
//     onClose();
//   };

//   // Error / Loading states (unchanged)
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

//         {remoteUsers.map((user) => (
//           <div key={String(user.uid)} className="relative bg-gray-900 rounded-lg overflow-hidden">
//             <div
//               ref={(el) => {
//                 if (el && user.videoTrack) {
//                   try {
//                     user.videoTrack.play(el);
//                   } catch (_) {}
//                 }
//                 if (el) {
//                   remoteVideoRefs.current[String(user.uid)] = el;
//                 } else {
//                   delete remoteVideoRefs.current[String(user.uid)];
//                 }
//               }}
//               className="w-full h-full"
//             />
//             <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
//               Participant {user.uid}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Controls bar */}
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

//         {/* ✅ Visit Documentation button */}
//         {onOpenVisitDocumentation && (
//           <Button
//             variant="outline"
//             onClick={onOpenVisitDocumentation}
//             className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
//           >
//             <FileText className="h-5 w-5 mr-2" />
//             Visit Notes
//           </Button>
//         )}

//         {onOpenPrescription && (
//           <Button
//             variant="outline"
//             onClick={onOpenPrescription}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
//           >
//             <Pill className="h-5 w-5 mr-2" />
//             Prescription
//           </Button>
//         )}

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
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle, Pill, FileText, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface VideoCallProps {
  appId: string;
  channel: string;
  token: string | null;
  uid: number | null;
  onClose: () => void;
  onOpenPrescription?: () => void;
  onOpenVisitDocumentation?: () => void;
  isRecording?: boolean;
  onToggleRecording?: () => void;
  compact?: boolean;
  patientName?: string;
}

export default function VideoCall({
  appId,
  channel,
  token,
  uid,
  onClose,
  onOpenPrescription,
  onOpenVisitDocumentation,
  isRecording = false,
  onToggleRecording,
  compact = false,
  patientName,
}: VideoCallProps) {
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

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const joiningRef = useRef(false);
  const joinedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

        // ---- CREATE AUDIO & VIDEO TRACKS WITH ECHO CANCELLATION ----
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          {
            // Audio options: enable echo cancellation, noise suppression, gain control
            AEC: true,        // Acoustic Echo Cancellation
            ANS: true,        // Automatic Noise Suppression
            AGC: true,        // Automatic Gain Control
          },
          {
            encoderConfig: '720p_1', // video quality
          }
        );

        if (!mounted || abortController.signal.aborted) {
          audioTrack.close();
          videoTrack.close();
          await cleanup();
          return;
        }
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Additional audio processing (if needed)
        try {
         await (audioTrack as any).setAEC(true);
await (audioTrack as any).setANS(true);
await (audioTrack as any).setAGC(true);
        } catch (e) {
          console.warn('Could not apply audio processing:', e);
        }

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

  // ---- Layout classes ----
  const containerClass = compact
    ? 'relative bg-black/90 rounded-xl overflow-hidden shadow-lg border border-slate-700'
    : 'fixed inset-0 bg-black/90 z-50 flex flex-col';

  const videoGridClass = compact
    ? 'grid grid-cols-2 gap-2 p-2 h-[280px]'
    : 'flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4';

  const controlsClass = compact
    ? 'flex justify-center items-center gap-3 p-3 bg-gray-800 rounded-b-xl flex-wrap'
    : 'flex justify-center items-center gap-4 p-4 bg-gray-800 flex-wrap';

  const buttonSize = compact ? 'sm' : 'icon';
  const defaultButtonSize = compact ? 'sm' : 'default';

  // ---- Main UI ----
  return (
    <div className={containerClass}>
      <div className={videoGridClass}>
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
              {patientName || `Participant ${user.uid}`}
            </div>
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div className={controlsClass}>
        <Button
          variant="outline"
          size={buttonSize}
          onClick={toggleAudio}
          className={isAudioMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
        >
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Button
          variant="outline"
          size={buttonSize}
          onClick={toggleVideo}
          className={isVideoMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}
        >
          {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>

        {onOpenVisitDocumentation && (
          <Button
            variant="outline"
            size={defaultButtonSize}
            onClick={onOpenVisitDocumentation}
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            <FileText className="h-4 w-4 mr-1" />
            {compact ? 'Notes' : 'Visit Notes'}
          </Button>
        )}

        {onOpenPrescription && (
          <Button
            variant="outline"
            size={defaultButtonSize}
            onClick={onOpenPrescription}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600"
          >
            <Pill className="h-4 w-4 mr-1" />
            {compact ? 'Rx' : 'Prescription'}
          </Button>
        )}

        {onToggleRecording && (
          <Button
            variant="outline"
            size={defaultButtonSize}
            onClick={onToggleRecording}
            className={
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
            }
          >
            <Circle className={`h-4 w-4 mr-1 ${isRecording ? 'fill-white' : 'fill-white'}`} />
            {isRecording ? 'Stop' : 'Record'}
          </Button>
        )}

        <Button
          variant="destructive"
          size={defaultButtonSize}
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700"
        >
          <PhoneOff className="h-4 w-4 mr-1" />
          {compact ? 'End' : 'End Call'}
        </Button>
      </div>
    </div>
  );
}