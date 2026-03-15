import React, { useState, useRef, useEffect } from "react";
import { ImageOff } from "lucide-react";
import { generateSrcSet } from "@/utils/imageOptimization";

/**
 * LazyImage — loads images only when they enter the viewport.
 * Uses IntersectionObserver for efficient lazy loading.
 *
 * Props:
 *   src            — image URL
 *   alt            — alt text
 *   className      — wrapper div className
 *   placeholderClassName — className for the loading placeholder div
 *   fallback       — node rendered when src is falsy
 *   rootMargin     — IntersectionObserver rootMargin
 *   sizes          — responsive `sizes` attribute (e.g. "(max-width: 640px) 100vw, 50vw")
 *   srcSetWidths   — pixel widths array for srcset generation (CDN URLs only)
 *   quality        — image quality for CDN URLs (default 80)
 */
const LazyImage = React.memo(function LazyImage({
  src,
  alt = "",
  className = "",
  placeholderClassName = "",
  fallback = null,
  rootMargin = "200px",
  sizes,
  srcSetWidths,
  quality = 80,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  useEffect(() => {
    const element = imgRef.current;
    if (!element || !src) return;

    // If IntersectionObserver isn't available, load immediately
    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [src, rootMargin]);

  if (!src) {
    return fallback || null;
  }

  // Generate srcset for responsive images (CDN URLs only; non-CDN returns "")
  const srcSet = generateSrcSet(src, srcSetWidths, quality) || undefined;
  // If we have a real multi-entry srcset (contains a space) and no explicit
  // sizes, default to a sensible value so the browser can make a good choice.
  const resolvedSizes =
    sizes || (srcSet && srcSet.includes(" ") ? "(max-width: 768px) 100vw, 50vw" : undefined);

  return (
    <div ref={imgRef} className={className} {...props}>
      {hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
          <ImageOff className="h-8 w-8 mb-1" aria-hidden="true" />
          <span className="text-xs sr-only">{alt || "Image unavailable"}</span>
        </div>
      ) : isInView ? (
        <img
          src={src}
          srcSet={srcSet}
          sizes={resolvedSizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-full ${placeholderClassName || "bg-gray-100 dark:bg-gray-800 animate-pulse"}`} />
      )}
    </div>
  );
});

export default LazyImage;
