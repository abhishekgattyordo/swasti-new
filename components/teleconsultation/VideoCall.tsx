'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface VideoCallProps {
  appId: string;
  channel: string;
  token: string | null;
  uid: number | null;
  onClose: () => void;
}

export default function VideoCall({ appId, channel, token, uid, onClose }: VideoCallProps) {
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

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!appId || !channel) {
        setError('Missing Agora appId or channel');
        setIsConnecting(false);
        return;
      }

      try {
        const finalToken = token === undefined || token === '' ? null : token;

        const rtcClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        if (!mounted) return;
        setClient(rtcClient);

        rtcClient.on('user-published', async (user, mediaType) => {
          await rtcClient.subscribe(user, mediaType);
          if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            if (!remoteVideoTrack) return; // ✅ guard against undefined track
            setRemoteUsers(prev => [...prev, { uid: user.uid, videoTrack: remoteVideoTrack }]);
            const uidKey = String(user.uid);
            if (remoteVideoRefs.current[uidKey]) {
              remoteVideoTrack.play(remoteVideoRefs.current[uidKey]);
            }
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        rtcClient.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setRemoteUsers(prev => prev.filter(u => String(u.uid) !== String(user.uid)));
          }
        });

        await rtcClient.join(appId, channel, finalToken, uid);
        if (!mounted) return;
        setIsJoined(true);
        setIsConnecting(false);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        if (!mounted) return;
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        await rtcClient.publish([audioTrack, videoTrack]);

        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
      } catch (err: any) {
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
      }
    };

    init();

    return () => {
      mounted = false;
      if (localAudioTrack) localAudioTrack.close();
      if (localVideoTrack) localVideoTrack.close();
      if (client) client.leave();
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

  const endCall = () => {
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

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <div ref={localVideoRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
            You {isVideoMuted ? '(Camera off)' : ''}
          </div>
        </div>

        {remoteUsers.map(user => (
          <div key={String(user.uid)} className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div
              ref={el => {
                if (el) remoteVideoRefs.current[String(user.uid)] = el;
              }}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
              Participant {user.uid}
            </div>
          </div>
        ))}
      </div>

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
        <Button variant="destructive" onClick={endCall} className="bg-red-600 hover:bg-red-700">
          <PhoneOff className="h-5 w-5 mr-2" />
          End Call
        </Button>
      </div>
    </div>
  );
}