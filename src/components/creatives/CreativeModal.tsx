"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { CreativeItem } from "@/data/creatives";

type CreativeModalProps = {
  items: CreativeItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function CreativeModal({
  items,
  index,
  onClose,
  onNavigate,
}: CreativeModalProps) {
  const isOpen = index !== null;
  const item = index === null ? null : items[index];

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (index === null || items.length < 2) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate((index + 1) % items.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate((index - 1 + items.length) % items.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, index, items.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          className="creative-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="creative-modal-panel"
            role="presentation"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="creative-modal-media">
              {item.type === "video" ? (
                <video
                  className="creative-modal-video"
                  src={item.src}
                  poster={item.poster}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <Image
                  className="creative-modal-image"
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1200px) 92vw, 1100px"
                />
              )}
            </div>

            <div className="creative-modal-caption">
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>

              {items.length > 1 && (
                <div className="creative-modal-nav">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNavigate((index - 1 + items.length) % items.length);
                    }}
                    aria-label="Previous item"
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onNavigate((index + 1) % items.length);
                    }}
                    aria-label="Next item"
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="creative-modal-close"
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}