import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PageFlip - Animated page transition component with 3D flip effect.
 * Wraps page content and animates transitions between pages.
 */
const flipVariants = {
  enter: (direction) => ({
    rotateY: direction > 0 ? 90 : -90,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      rotateY: { type: "spring", stiffness: 200, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 }
    }
  },
  exit: (direction) => ({
    rotateY: direction < 0 ? 90 : -90,
    opacity: 0,
    scale: 0.95,
    transition: {
      rotateY: { type: "spring", stiffness: 200, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 }
    }
  })
};

export default function PageFlip({ pageKey, direction, isRTL, children }) {
  // RTL flips direction
  const effectiveDirection = isRTL ? -direction : direction;

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      <AnimatePresence mode="wait" custom={effectiveDirection}>
        <motion.div
          key={pageKey}
          custom={effectiveDirection}
          variants={flipVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
