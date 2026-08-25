import { siteConfig } from '../../../data/site.js';

export async function getReviewSummary(product) {
  if (!siteConfig.features.reviewsReady || !product?.reviews?.provider) return null;
  return null;
}

export async function listReviews(product) {
  if (!siteConfig.features.reviewsReady || !product?.reviews?.provider) return [];
  return [];
}
