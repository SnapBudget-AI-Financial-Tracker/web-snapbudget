import { useRef, useState, useCallback, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";

const THRESHOLD = 80;
const MAX_REVEAL = 96;
const SPRING_BACK_MS = 320;

export default function SwipeableRow({
  children,
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Hapus",
  disabled = false,
  threshold = THRESHOLD,
}) {
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isLockedRef = useRef(false);
  const rafRef = useRef(null);

  const [offset, setOffset] = useState(0);
  const [isSpringing, setIsSpringing] = useState(false);

  const clampOffset = (raw) => {
    if (raw > 0) return Math.min(raw, MAX_REVEAL);
    if (raw < 0) return Math.max(raw, -MAX_REVEAL);
    return 0;
  };

  const springBackTo = useCallback((targetOffset = 0, afterCb = null) => {
    setIsSpringing(true);
    setOffset(targetOffset);
    setTimeout(() => {
      setIsSpringing(false);
      if (afterCb) afterCb();
    }, SPRING_BACK_MS);
  }, []);

  const onPointerDown = useCallback(
    (e) => {
      if (disabled) return;
      isDraggingRef.current = true;
      isLockedRef.current = false;
      startXRef.current = e.touches ? e.touches[0].clientX : e.clientX;
      startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
      currentXRef.current = startXRef.current;
      setIsSpringing(false);
    },
    [disabled],
  );

  const onPointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dX = clientX - startXRef.current;
    const dY = clientY - startYRef.current;

    if (!isLockedRef.current && Math.abs(dY) > Math.abs(dX) + 6) {
      isLockedRef.current = true;
    }
    if (isLockedRef.current) return;
    if (e.cancelable && e.touches) e.preventDefault();

    currentXRef.current = clientX;
    const clamped = clampOffset(dX);
    setOffset(clamped);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (isLockedRef.current) return;

    const dX = currentXRef.current - startXRef.current;

    if (dX > threshold && onEdit) {
      springBackTo(0, () => onEdit());
    } else if (dX < -threshold && onDelete) {
      springBackTo(0, () => onDelete());
    } else {
      springBackTo(0);
    }
  }, [threshold, onEdit, onDelete, springBackTo]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const absOffset = Math.abs(offset);
  const ratio = Math.min(absOffset / threshold, 1);
  const isTriggered = absOffset >= threshold;

  const editOpacity = offset > 0 ? ratio : 0;
  const editScale = 0.8 + 0.2 * (offset > 0 ? ratio : 0);

  const deleteOpacity = offset < 0 ? ratio : 0;
  const deleteScale = 0.8 + 0.2 * (offset < 0 ? ratio : 0);

  const transition = isSpringing
    ? `transform ${SPRING_BACK_MS}ms cubic-bezier(0.34,1.56,0.64,1)`
    : "none";

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ touchAction: "pan-y" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex items-center px-5"
        style={{
          width: Math.max(absOffset, 0),
          background:
            isTriggered && offset > 0
              ? "linear-gradient(135deg,#0d9488,#0f766e)"
              : "linear-gradient(135deg,#ccfbf1,#99f6e4)",
          transition: isSpringing
            ? `width ${SPRING_BACK_MS}ms cubic-bezier(0.34,1.56,0.64,1)`
            : "none",
          overflow: "hidden",
        }}
      >
        <div
          className="flex flex-col items-center gap-0.5"
          style={{
            opacity: editOpacity,
            transform: `scale(${editScale})`,
            transition: "none",
          }}
        >
          <Pencil
            size={18}
            className={isTriggered ? "text-white" : "text-teal-500"}
          />
          <span
            className={`text-[10px] font-bold tracking-wide ${isTriggered ? "text-white" : "text-teal-500"}`}
          >
            {editLabel}
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 flex items-center justify-end px-5"
        style={{
          width: Math.max(-offset, 0),
          background:
            isTriggered && offset < 0
              ? "linear-gradient(135deg,#be123c,#e11d48)"
              : "linear-gradient(135deg,#ffe4e6,#fecdd3)",
          transition: isSpringing
            ? `width ${SPRING_BACK_MS}ms cubic-bezier(0.34,1.56,0.64,1)`
            : "none",
          overflow: "hidden",
        }}
      >
        <div
          className="flex flex-col items-center gap-0.5"
          style={{
            opacity: deleteOpacity,
            transform: `scale(${deleteScale})`,
            transition: "none",
          }}
        >
          <Trash2
            size={18}
            className={isTriggered ? "text-white" : "text-rose-400"}
          />
          <span
            className={`text-[10px] font-bold tracking-wide ${isTriggered ? "text-white" : "text-rose-400"}`}
          >
            {deleteLabel}
          </span>
        </div>
      </div>

      <div
        className="relative bg-white"
        style={{
          transform: `translateX(${offset}px)`,
          transition,
          cursor: disabled ? "default" : "grab",
        }}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
      >
        {children}
      </div>
    </div>
  );
}
