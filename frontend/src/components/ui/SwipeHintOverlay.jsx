import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, ShoppingBag } from "lucide-react";

const LS_KEY = "snapbudget_swipe_hint_seen";

export default function SwipeHintOverlay({ onDone, storageKey = LS_KEY }) {
  const [phase, setPhase] = useState("idle");
  const [offset, setOffset] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const onDoneRef = useRef(onDone);
  const storageKeyRef = useRef(storageKey);

  const schedule = (fn, ms) => {
    timerRef.current = setTimeout(fn, ms);
  };

  useEffect(() => {
    const key = storageKeyRef.current;
    const done = onDoneRef.current;

    schedule(() => {
      setPhase("slideLeft");
      setOffset(-88);

      schedule(() => {
        setPhase("backFromLeft");
        setOffset(0);
        schedule(() => {
          setPhase("slideRight");
          setOffset(88);

          schedule(() => {
            setPhase("backFromRight");
            setOffset(0);
            schedule(() => {
              setPhase("exit");
              setVisible(false);
              schedule(() => {
                localStorage.setItem(key, "1");
                done?.();
              }, 400);
            }, 600);
          }, 700);
        }, 500);
      }, 700);
    }, 800);

    return () => clearTimeout(timerRef.current);
  }, []);

  const isLeft = offset < 0;
  const isRight = offset > 0;
  const absOff = Math.abs(offset);
  const ratio = absOff / 88;

  const transition =
    phase === "slideLeft" || phase === "slideRight"
      ? "transform 600ms cubic-bezier(0.34,1.2,0.64,1)"
      : "transform 400ms cubic-bezier(0.34,1.56,0.64,1)";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center pb-12 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease",
      }}
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms ease" }}
        aria-hidden="true"
      />

      {/* Floating card with mock row + labels */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Instruction label */}
        <div className="text-center mb-4">
          <p
            className="inline-block bg-white/95 text-zinc-800 text-sm font-semibold px-4 py-2 rounded-full shadow-lg"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isLeft
              ? "← Geser untuk Hapus"
              : isRight
                ? "Geser untuk Edit →"
                : "Geser baris transaksi!"}
          </p>
        </div>

        {/* Mock swipeable row */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-zinc-100">
          <div className="relative bg-white">
            {/* Edit bg (right-swipe) */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 flex items-center px-5 overflow-hidden"
              style={{
                width: isRight ? absOff : 0,
                background:
                  ratio >= 0.9
                    ? "linear-gradient(135deg,#0d9488,#0f766e)"
                    : "linear-gradient(135deg,#ccfbf1,#99f6e4)",
                transition: "width 600ms cubic-bezier(0.34,1.2,0.64,1)",
              }}
            >
              <div
                className="flex flex-col items-center gap-0.5"
                style={{
                  opacity: ratio,
                  transform: `scale(${0.8 + 0.2 * ratio})`,
                }}
              >
                <Pencil
                  size={18}
                  className={ratio >= 0.9 ? "text-white" : "text-teal-500"}
                />
                <span
                  className={`text-[10px] font-bold ${ratio >= 0.9 ? "text-white" : "text-teal-500"}`}
                >
                  Edit
                </span>
              </div>
            </div>

            {/* Delete bg (left-swipe) */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 flex items-center justify-end px-5 overflow-hidden"
              style={{
                width: isLeft ? absOff : 0,
                background:
                  ratio >= 0.9
                    ? "linear-gradient(135deg,#be123c,#e11d48)"
                    : "linear-gradient(135deg,#ffe4e6,#fecdd3)",
                transition: "width 600ms cubic-bezier(0.34,1.2,0.64,1)",
              }}
            >
              <div
                className="flex flex-col items-center gap-0.5"
                style={{
                  opacity: ratio,
                  transform: `scale(${0.8 + 0.2 * ratio})`,
                }}
              >
                <Trash2
                  size={18}
                  className={ratio >= 0.9 ? "text-white" : "text-rose-400"}
                />
                <span
                  className={`text-[10px] font-bold ${ratio >= 0.9 ? "text-white" : "text-rose-400"}`}
                >
                  Hapus
                </span>
              </div>
            </div>

            {/* Foreground mock row content */}
            <div
              className="relative flex items-center gap-3 px-4 py-4 bg-white"
              style={{ transform: `translateX(${offset}px)`, transition }}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 ring-1 ring-orange-200">
                <ShoppingBag size={17} className="text-orange-500" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900">
                  Makan siang
                </p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-500">
                  Makanan
                </span>
              </div>
              {/* Amount */}
              <span className="text-sm font-bold text-rose-600 flex-shrink-0">
                Rp 25.000
              </span>
            </div>
          </div>
        </div>

        {/* Swipe direction arrows */}
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
            <Pencil size={13} />
            <span>Kanan = Edit</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
            <span>Kiri = Hapus</span>
            <Trash2 size={13} />
          </div>
        </div>

        {/* Animated finger icon */}
        <div className="flex justify-center mt-5">
          <div
            className="text-2xl select-none"
            style={{
              transform: `translateX(${offset * 0.5}px)`,
              transition,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
            }}
            aria-hidden="true"
          >
            👆
          </div>
        </div>

        {/* Skip button */}
        <div className="text-center mt-4 pointer-events-auto">
          <button
            onClick={() => {
              clearTimeout(timerRef.current);
              setVisible(false);
              setTimeout(() => {
                localStorage.setItem(storageKey, "1");
                onDone?.();
              }, 400);
            }}
            className="text-white/70 hover:text-white text-xs underline underline-offset-2 transition-colors cursor-pointer"
          >
            Lewati
          </button>
        </div>
      </div>
    </div>
  );
}
