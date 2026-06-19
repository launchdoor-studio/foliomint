import crypto from 'node:crypto';

const CHECKOUTS_URL = 'https://api.lemonsqueezy.com/v1/checkouts';

export function verifyLemonSqueezyWebhookSignature(rawBody: string, secret: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !secret) return false;

  let signature: Buffer;
  try {
    signature = Buffer.from(signatureHeader, 'hex');
  } catch {
    return false;
  }

  const hmac = Buffer.from(crypto.createHmac('sha256', secret).update(rawBody).digest('hex'), 'hex');

  if (signature.length === 0 || hmac.length === 0 || signature.length !== hmac.length) {
    return false;
  }

  return crypto.timingSafeEqual(hmac, signature);
}

/** Map Lemon Squeezy subscription `status` to our `users.subscription_status` values. */
export function mapLemonSubscriptionStatus(
  lsStatus: string,
): 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' {
  switch (lsStatus) {
    case 'active':
      return 'active';
    case 'on_trial':
      return 'trialing';
    case 'cancelled':
      return 'cancelled';
    case 'paused':
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'expired':
      return 'expired';
    default:
      return 'past_due';
  }
}

interface CreateCheckoutParams {
  apiKey: string;
  storeId: string;
  variantId: string;
  userId: string;
  email: string;
  name?: string | null;
  baseUrl: string;
}

export async function createLemonSqueezyCheckout(params: CreateCheckoutParams): Promise<{ url: string } | { error: string }> {
  const { apiKey, storeId, variantId, userId, email, name, baseUrl } = params;

  const res = await fetch(CHECKOUTS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email,
            ...(name ? { name } : {}),
            custom: {
              user_id: userId,
            },
          },
          product_options: {
            redirect_url: `${baseUrl}/dashboard?checkout=success`,
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: storeId,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    }),
  });

  const json = (await res.json()) as {
    data?: { attributes?: { url?: string } };
    errors?: Array<{ detail?: string; title?: string }>;
  };

  if (!res.ok) {
    const detail = json.errors?.map((e) => e.detail || e.title).filter(Boolean).join('; ') || res.statusText;
    return { error: detail || `Checkout request failed (${res.status})` };
  }

  const url = json.data?.attributes?.url;
  if (!url) {
    return { error: 'Checkout response did not include a URL' };
  }

  return { url };
}
