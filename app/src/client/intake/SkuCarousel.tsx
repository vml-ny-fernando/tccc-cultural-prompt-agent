import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, type KeyboardEvent } from 'react';

import styles from './SkuCarousel.module.css';

export interface CarouselSku {
  id: string;
  displayName: string;
  shortName: string;
  package: 'contour-glass-bottle' | 'can' | 'pet-bottle' | 'fountain-cup';
  /** Product photo shown in the window; a line drawing of the package stands in when there is none. */
  image: string | null;
}

/**
 * The brief's product picker: one SKU at a time, flipped with the arrows, the dots or ← →. The product
 * on show is the product picked — Continue confirms it, so there is no separate "use this" step.
 */
export function SkuCarousel({ skus, value, onChange }: { skus: CarouselSku[]; value: string; onChange: (skuId: string) => void }) {
  const found = skus.findIndex((s) => s.id === value);
  const index = Math.max(0, found);
  // Nothing picked yet, or the pick isn't sold in the newly chosen country: the product on show becomes the pick.
  useEffect(() => {
    if (found < 0 && skus.length > 0) onChange(skus[0]!.id);
  }, [found, skus, onChange]);

  if (skus.length === 0) {
    return (
      <div className={styles.field}>
        <span className={styles.label}>Product SKU</span>
        <div className={styles.empty}>No products are listed for this country yet.</div>
      </div>
    );
  }

  const sku = skus[index]!;
  const go = (step: number) => onChange(skus[(index + step + skus.length) % skus.length]!.id);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    }
  };

  return (
    <div className={styles.field} role="group" aria-roledescription="carousel" aria-label="Product SKU" onKeyDown={onKeyDown}>
      <span className={styles.label}>Product SKU</span>
      <div className={styles.frame}>
        <button type="button" className={styles.arrow} aria-label="Previous product" onClick={() => go(-1)}>
          <ChevronLeft size={18} aria-hidden />
        </button>
        <div className={styles.window}>
          <div className={styles.picture}>
            {sku.image ? <img src={sku.image} alt={sku.displayName} /> : <Silhouette kind={sku.package} />}
          </div>
          <div className={styles.name} aria-live="polite">
            {sku.shortName}
          </div>
        </div>
        <button type="button" className={styles.arrow} aria-label="Next product" onClick={() => go(1)}>
          <ChevronRight size={18} aria-hidden />
        </button>
        <div className={styles.dots}>
          {skus.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={styles.dot}
              data-current={i === index || undefined}
              aria-label={`Show ${s.shortName}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => onChange(s.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Stand-in drawing per package for a product with no photo yet. */
function Silhouette({ kind }: { kind: CarouselSku['package'] }) {
  return (
    <svg className={styles.silhouette} viewBox="0 0 60 160" aria-hidden>
      {kind === 'can' && (
        <>
          <path d="M14 22 Q14 14 21 12 L39 12 Q46 14 46 22 L46 140 Q46 148 39 150 L21 150 Q14 148 14 140 Z" />
          <path d="M15 24 L45 24 M15 138 L45 138" />
        </>
      )}
      {kind === 'contour-glass-bottle' && (
        <>
          <path d="M25.5 6 h9 v8 h-9 Z" />
          <path d="M27 14 L27 34 C27 44 20 50 19 62 C18 74 22 80 22 90 C22 100 17 108 17 122 L17 148 Q17 152 21 152 L39 152 Q43 152 43 148 L43 122 C43 108 38 100 38 90 C38 80 42 74 41 62 C40 50 33 44 33 34 L33 14 Z" />
        </>
      )}
      {kind === 'fountain-cup' && (
        <>
          <path d="M33 4 L33 34" />
          <path d="M9 34 h42 v6 h-42 Z" />
          <path d="M11 40 L49 40 L44 152 L16 152 Z" />
        </>
      )}
      {kind === 'pet-bottle' && (
        <>
          <path d="M25 4 h10 v10 h-10 Z" />
          <path d="M27 14 L27 22 C27 32 15 36 15 52 L15 146 Q15 152 21 152 L39 152 Q45 152 45 146 L45 52 C45 36 33 32 33 22 L33 14 Z" />
          <path d="M15 72 L45 72 M15 104 L45 104" />
        </>
      )}
    </svg>
  );
}
