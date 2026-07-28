"use client";

import { Children } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Page-load stagger on the feed (docs/04): 40ms intervals, once, no
 * scroll-triggered replays. Each child becomes a grid item. Reduced motion
 * disables it — the cards just appear.
 */
export function FeedStagger({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <>
      {Children.map(children, (child, i) => (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? undefined : { delay: Math.min(i * 0.04, 0.6), duration: 0.25 }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}
