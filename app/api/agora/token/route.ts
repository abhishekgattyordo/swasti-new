import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(req: NextRequest) {
  const { channelName, role = 'publisher' } = await req.json();
  const appId = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
  const uid = 0; // 0 means let Agora assign
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  let rtcRole: number;
  if (role === 'publisher') rtcRole = RtcRole.PUBLISHER;
  else if (role === 'subscriber') rtcRole = RtcRole.SUBSCRIBER;
  else rtcRole = RtcRole.PUBLISHER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    rtcRole,
    privilegeExpiredTs
  );

  return NextResponse.json({ success: true, token });
}