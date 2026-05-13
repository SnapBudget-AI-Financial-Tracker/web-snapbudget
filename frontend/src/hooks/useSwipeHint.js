import { useState, useEffect } from "react";

const LS_KEY = "snapbudget_swipe_hint_seen";

export function useSwipeHint(storageKey = LS_KEY) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(storageKey)) {
        setShowHint(true);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [storageKey]);

  const markSeen = () => setShowHint(false);
  return [showHint, markSeen];
}
