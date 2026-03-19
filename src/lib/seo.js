/**
 * Update document head meta tags for SEO and social sharing.
 * Works with SPA — updates tags on route change.
 */
export function updateMeta({ title, description, image, url, type = 'website', locale = 'he_IL' }) {
  // Set document title
  document.title = title ? `${title} | סיפוראי` : 'סיפוראי — ספרי ילדים מותאמים אישית עם AI';

  // Helper to set/create meta tag
  const setMeta = (property, content) => {
    if (!content) return;
    let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(property.startsWith('og:') || property.startsWith('article:') ? 'property' : 'name', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // OpenGraph
  setMeta('og:title', title);
  setMeta('og:description', description);
  setMeta('og:image', image);
  setMeta('og:url', url || window.location.href);
  setMeta('og:type', type);
  setMeta('og:locale', locale);
  setMeta('og:site_name', 'Sipurai');

  // Twitter Card
  setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', image);

  // Standard
  setMeta('description', description);
}

export function resetMeta() {
  updateMeta({
    title: '',
    description: 'סיפוראי — יוצרים ספרי ילדים מותאמים אישית עם AI. בחרו דמויות, סגנון איור ושפה — וקבלו ספר שלם עם סיפור ואיורים. בעברית, אנגלית ויידיש.',
  });
}
