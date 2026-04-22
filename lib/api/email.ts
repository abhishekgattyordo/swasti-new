// lib/email.ts
import { sendConnectCampaignEmail } from '@/lib/api/connect-campaign';

async function sendViaConnectCampaign(
  to: string,
  campaignEnvKey: string,
  variables?: Record<string, string | number | boolean | null | undefined>
) {
  const campaignId = process.env[campaignEnvKey]?.trim();
  if (!campaignId) {
    throw new Error(`${campaignEnvKey} is not configured`);
  }

  const result = await sendConnectCampaignEmail({
    to,
    campaignId,
    variables,
  });

  if (!result.ok) {
    throw new Error(result.error);
  }
}

export async function sendPasswordEmail(to: string, password: string, name: string) {
  await sendViaConnectCampaign(to, 'CONNECT_PASSWORD_WELCOME_CAMPAIGN_ID', {
    userName: name,
    password,
    email: to,
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string, name: string) {
  await sendViaConnectCampaign(to, 'CONNECT_PASSWORD_RESET_CAMPAIGN_ID', {
    userName: name,
    loginLink: resetLink,
  });
}

export async function sendPatientRegistrationEmail(
  to: string,
  verificationLink: string,
  patientName: string,
  organizationName: string
) {
  await sendViaConnectCampaign(to, 'CONNECT_PATIENT_REGISTRATION_CAMPAIGN_ID', {
    verificationLink,
    organizationName,
    patientName,
  });
}