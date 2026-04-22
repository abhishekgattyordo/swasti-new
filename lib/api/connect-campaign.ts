type ConnectVariables = Record<string, string | number | boolean | null | undefined>;

type SendConnectCampaignInput = {
  to: string;
  campaignId: string;
  variables?: ConnectVariables;
  baseUrl?: string;
  accessToken?: string;
};

export async function sendConnectCampaignEmail(
  input: SendConnectCampaignInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const baseUrl =
    input.baseUrl?.trim() ||
    process.env.CONNECT_API_BASE_URL?.trim() ||
    "https://ordo-connect.vercel.app";
  const accessToken = input.accessToken?.trim() || process.env.CONNECT_ACCESS_TOKEN?.trim();
  const campaignId = input.campaignId.trim();

  if (!campaignId || !accessToken) {
    return {
      ok: false,
      error: "Connect service not configured (campaignId / CONNECT_ACCESS_TOKEN)",
    };
  }

  const payload: { to: string; variables?: Record<string, string | number | boolean> } = {
    to: input.to,
  };
  if (input.variables) {
    const cleaned = Object.fromEntries(
      Object.entries(input.variables).filter(([, value]) => value !== undefined && value !== null)
    ) as Record<string, string | number | boolean>;
    if (Object.keys(cleaned).length > 0) {
      payload.variables = cleaned;
    }
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/+$/, "")}/api/connect/campaigns/${encodeURIComponent(campaignId)}/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return { ok: false, error: `Connect send error (${response.status}): ${body}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
