import React, { useState, useRef, useEffect } from "react";

/**
 * LazyImage — loads images only when they enter the viewport.
 * Uses IntersectionObserver for efficient lazy loading.
 */
export default function LazyImage({
  src,
  alt = "",
  className = "",
  placeholderClassName = "",
  fallback = null,
  rootMargin = "200px",
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

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

  return (
    <div ref={imgRef} className={className} {...props}>
      {isInView ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      ) : (
        <div className={`w-full h-full ${placeholderClassName || "bg-gray-100 dark:bg-gray-800 animate-pulse"}`} />
      )}
    </div>
  );
}
