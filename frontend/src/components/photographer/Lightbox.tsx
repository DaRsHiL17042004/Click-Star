import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Lightbox({ images, index, onClose, onIndex, caption }: {
  images: string[]; index: number | null; onClose: () => void; onIndex: (i: number) => void; caption?: string;
}) {
  const go = useCallback((d: number) => index != null && onIndex((index + d + images.length) % images.length), [index, images.length, onIndex]);

  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, go, onClose]);

  return (
    <AnimatePresence>
      {index != null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio viewer"
          className="fixed inset-0 z-50 flex flex-col bg-[#0d0b09] text-[#f3eee4]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between px-5 py-4 font-mono text-xs tracking-wider">
            <span>{caption}</span>
            <span className="tabular-nums">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
            <button onClick={onClose} aria-label="Close viewer" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 sm:px-16">
            <AnimatePresence mode="wait">
              <motion.img
                key={images[index]}
                src={images[index]}
                alt={`${caption ?? "Portfolio"} image ${index + 1}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="max-h-full max-w-full bg-transparent object-contain"
              />
            </AnimatePresence>
            {images.length > 1 && (
              <>
                <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:left-4">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => go(1)} aria-label="Next image" className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20 sm:right-4">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
