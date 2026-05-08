type AnalyticsEventName =
  | 'view_item'
  | 'add_to_cart'
  | 'view_cart'
  | 'begin_checkout'
  | 'payment_redirect_started'
  | 'quiz_started'
  | 'quiz_completed'
  | 'recommended_kit_added'
  | 'blog_article_viewed';

type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: AnalyticsParams) => void;
  }
}

export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', eventName, params);
}

export function gaItem(product: { id: string; name: string; slug: string; categoryName: string; price: number }, quantity = 1) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_slug: product.slug,
    item_category: product.categoryName,
    price: product.price,
    quantity,
  };
}
