// A minimal enlarge-on-click image viewer: Escape or a click on the backdrop
// closes it. Plain markup (not react-aria-components, which src/client/ui/
// is the only place importing) since this is a single-purpose overlay.

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import styles from './ImageModal.module.css';

export function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={alt} tabIndex={-1} ref={dialogRef}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close enlarged image">
          <X size={24} strokeWidth={2.5} aria-hidden />
        </button>
        <img src={src} alt={alt} className={styles.image} />
      </div>
    </div>
  );
}
