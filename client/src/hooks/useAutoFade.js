// src/hooks/useAutoFade.js
import { useEffect } from "react";

// Automatically clears a message after `delay` milliseconds
export const useAutoFade = (value, setter, delay = 4000) => {
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(() => setter(null), delay);
    return () => clearTimeout(timer); // cleanup if value changes
  }, [value, setter, delay]);
};