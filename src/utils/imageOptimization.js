/**
 * imageOptimization.js
 * Utilities for responsive and optimized image handling.
 */

/**
 * Default responsive breakpoints for srcset generation.
 */
const DEFAULT_SIZES = [320, 480, 640, 768, 1024, 1280];

/**
 * Detect whether a URL points to a known CDN / image service that accepts
 * width/quality query parameters.
 *
 * Supported:
 *   - Cloudinary  (?w=&q=)
 *   - Imgix       (?w=&q=)
 *   - Base44 CDN  (?width=&quality=)  — assumed convention
 *   - Unsplash    (?w=&q=)
 */
function detectCdnType(url) {
  if (!url || typeof url !== "string") return null;
  if (url.includes("cloudinary.com")) return "cloudinary";
  if (url.includes(".imgix.net")) return "imgix";
  if (url.includes("supabase.co")) return "supabase";
  if (url.includes("base44.com") || url.includes("base44.app")) return "base44";
  if (url.includes("unsplash.com")) return "unsplash";
  return null;
}

/**
 * Build the CDN-specific query string for a given width and quality.
 */
function buildCdnParams(cdnType, width, quality) {
  const q = quality ?? 80;
  switch (cdnType) {
    case "cloudinary":
    case "imgix":
    case "unsplash":
      return `w=${width}&q=${q}&auto=format`;
    case "base44":
      return `width=${width}&quality=${q}`;
    default:
      return null;
  }
}

/**
 * Append (or replace) width/quality query params on a CDN URL.
 * For non-CDN URLs the original URL is returned unchanged.
 *
 * @param {string} url
 * @param {{ width?: number, quality?: number }} options
 * @returns {string}
 */
export function getOptimizedImageUrl(url, { width, quality } = {}) {
  if (!url || typeof url !== "string") return url;

  const cdnType = detectCdnType(url);
  if (!cdnType || (!width && !quality)) return url;

  const params = buildCdnParams(cdnType, width, quality);
  if (!params) return url;

  try {
    const parsed = new URL(url);
    // Set individual params to avoid clobbering unrelated query keys
    if (width) {
      if (cdnType === "base44") {
        parsed.searchParams.set("width", String(width));
      } else {
        parsed.searchParams.set("w", String(width));
      }
    }
    if (quality != null) {
      if (cdnType === "base44") {
        parsed.searchParams.set("quality", String(quality));
      } else {
        parsed.searchParams.set("q", String(quality));
      }
      // Cloudinary / imgix benefit from automatic format selection
      if (cdnType === "cloudinary" || cdnType === "imgix") {
        parsed.searchParams.set("auto", "format");
      }
    }
    return parsed.toString();
  } catch {
    // URL parsing failed — return original
    return url;
  }
}

/**
 * Generate a `srcset` attribute string for responsive images.
 * Produces one entry per requested width; falls back gracefully for non-CDN URLs.
 *
 * @param {string} url - Base image URL
 * @param {number[]} [sizes] - Pixel widths to generate (defaults to DEFAULT_SIZES)
 * @param {number} [quality] - Image quality 1-100
 * @returns {string} - e.g. "https://…?w=320 320w, https://…?w=640 640w"
 */
export function generateSrcSet(url, sizes = DEFAULT_SIZES, quality = 80) {
  if (!url || typeof url !== "string") return "";

  const cdnType = detectCdnType(url);

  // For non-CDN URLs we can still return the original at each declared size;
  // the browser will pick the right one based on sizes attribute, but we only
  // have the single URL available.
  if (!cdnType) {
    // Return a single-entry srcset pointing at the original URL
    return url;
  }

  return sizes
    .map((w) => `${getOptimizedImageUrl(url, { width: w, quality })} ${w}w`)
    .join(", ");
}

/**
 * Preload an image by creating a hidden Image element.
 * Resolves with the loaded HTMLImageElement, rejects on error.
 *
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("preloadImage: url is required"));
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`preloadImage: failed to load ${url}`));
    img.src = url;
  });
}
