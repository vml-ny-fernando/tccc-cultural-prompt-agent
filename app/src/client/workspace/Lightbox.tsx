// Full-size image view: Escape closes, focus is trapped inside, and a
// Download button next to the close button.

import { Download, MessageSquareWarning, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Dialog, Modal } from 'react-aria-components';

import { Button } from '../ui/Button.tsx';
import { triggerDownload } from '../ui/DownloadCopy.tsx';
import styles from './Lightbox.module.css';

export interface LightboxState {
  src: string;
  alt: string;
  /** Present only when this image is a rated scene result; opens the feedback dialog. */
  rate?: () => void;
  /** Shown under the image (the gallery puts the brief and prompt here). */
  caption?: ReactNode;
}

async function download(src: string, alt: string) {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    triggerDownload(`${alt.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'image'}.png`, url);
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, '_blank', 'noreferrer');
  }
}

export function Lightbox({ state, onClose }: { state: LightboxState | null; onClose: () => void }) {
  return (
    <Modal
      isOpen={state !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable
      className={styles.overlay}
    >
      <Dialog className={styles.dialog} aria-label={state ? `${state.alt}, full size` : 'Image'}>
        {state && (
          <>
            <div className={styles.head}>
              <Button size="sm" variant="ghost" icon={<Download size={14} aria-hidden />} onPress={() => download(state.src, state.alt)}>
                Download
              </Button>
              {state.rate && (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<MessageSquareWarning size={14} aria-hidden />}
                  onPress={() => {
                    state.rate?.();
                    onClose();
                  }}
                >
                  Rate image
                </Button>
              )}
              <Button size="sm" variant="ghost" icon={<X size={16} aria-hidden />} aria-label="Close" onPress={onClose} />
            </div>
            <div className={styles.imgWrap}>
              <img className={styles.img} src={state.src} alt={state.alt} />
            </div>
            {state.caption}
          </>
        )}
      </Dialog>
    </Modal>
  );
}
