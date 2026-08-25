import { siteConfig } from '../../../data/site.js';

export async function subscribeToNewsletter() {
  if (!siteConfig.features.newsletterReady) return { ok: false, reason: 'unavailable' };
  return { ok: false, reason: 'provider-not-configured' };
}
