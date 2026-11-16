// The node workspace opens as a near full-screen layer over Story & scene, on a
// dark scrim, with a large close button. Escape stays with the canvas (it clears
// the selection), so only the X closes it. A plain portal rather than a React
// Aria Modal, because the workspace opens its own Modals (lightbox, feedback)
// and those would attach to an enclosing Modal instead of opening on their own.
import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import styles from './WorkspaceOverlay.module.css';

export function WorkspaceOverlay({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return createPortal(
    <div className={styles.scrim}>
      <div className={styles.frame} role="dialog" aria-modal="true" aria-label="Node Workspace">
        <button ref={closeRef} type="button" className={styles.close} aria-label="Close the node workspace" onClick={onClose}>
          <X size={24} strokeWidth={2.5} aria-hidden />
        </button>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
