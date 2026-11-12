import { Check, ChevronRight, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Dialog, Heading, Label, Modal, Radio, RadioGroup } from 'react-aria-components';

import { Button } from './Button.tsx';
import styles from './ChoiceCard.module.css';

export type ChoiceCardDetails = {
  /** The full description. */
  body?: ReactNode | undefined;
  /** Short labelled facts, e.g. Vessel → paella pan. */
  facts?: Array<{ label: string; value: ReactNode }> | undefined;
  /** Why the agent suggests it. */
  rationale?: ReactNode | undefined;
  /** Knowledge-base sections it relied on. */
  sources?: string[] | undefined;
  /** Buttons under the media, e.g. downloads. */
  actions?: ReactNode | undefined;
};

export type ChoiceCardOption = {
  id: string;
  /** String key used for selection; must be unique within the group. */
  value: string;
  /** Rendered above everything else — an image or other preview. */
  media?: ReactNode | undefined;
  label: ReactNode;
  /** The description under the title, shown in full (the agent keeps it to 40 words). */
  summary?: ReactNode | undefined;
  /** Everything else, shown in a "More details" dialog. */
  details?: ChoiceCardDetails | undefined;
  badge?: ReactNode | undefined;
  disabled?: boolean | undefined;
};

export type ChoiceCardGroupProps = {
  label?: ReactNode | undefined;
  'aria-label'?: string | undefined;
  value: string | null;
  onChange: (value: string) => void;
  options: ChoiceCardOption[];
  /** `grid`: three image-friendly cards per row. `list`: full-width rows with a check box, for text-only options. */
  layout?: 'grid' | 'list' | undefined;
  /** List layout only: "More details" expands under the row instead of opening a dialog (for groups already inside a dialog). */
  detailsInline?: boolean | undefined;
  className?: string | undefined;
};

function hasDetails(d: ChoiceCardDetails | undefined): d is ChoiceCardDetails {
  return !!d && !!(d.body || d.facts?.length || d.rationale || d.sources?.length);
}

/**
 * A group of selectable option cards, keyboard-navigable like any radio group.
 * The grid layout is always three equal columns (one on narrow screens), so a
 * step with one option and a step with three look alike; the list layout
 * stacks full-width rows.
 */
export function ChoiceCardGroup({
  label,
  'aria-label': ariaLabel,
  value,
  onChange,
  options,
  layout = 'grid',
  detailsInline = false,
  className,
}: ChoiceCardGroupProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const inline = detailsInline && layout === 'list';
  const open = options.find((o) => o.id === openId) ?? null;

  return (
    <RadioGroup
      aria-label={label ? undefined : ariaLabel}
      value={value ?? ''}
      onChange={onChange}
      className={[styles.group, className].filter(Boolean).join(' ')}
    >
      {label && <Label className={styles.groupLabel}>{label}</Label>}
      <div className={layout === 'list' ? styles.list : styles.grid}>
        {options.map((o) => {
          const more = hasDetails(o.details);
          if (layout === 'list') {
            return (
              <div key={o.id} className={styles.cell}>
                <Radio value={o.value} isDisabled={o.disabled} className={styles.row} data-more={more || undefined} data-media={o.media ? true : undefined}>
                  {({ isSelected }) => (
                    <>
                      <span className={styles.box} aria-hidden>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </span>
                      <div className={styles.rowHead}>
                        <div className={styles.rowTitle}>{o.label}</div>
                        {o.badge && <span className={styles.pill}>{o.badge}</span>}
                      </div>
                      {o.summary && <div className={styles.rowSummary}>{o.summary}</div>}
                      {o.media && <div className={styles.rowMedia}>{o.media}</div>}
                      {inline && expandedId === o.id && o.details && (
                        <div className={styles.rowDetails} id={`details-${o.id}`}>
                          <DetailsBody details={o.details} />
                        </div>
                      )}
                    </>
                  )}
                </Radio>
                {more &&
                  (inline ? (
                    <button
                      type="button"
                      className={styles.moreLink}
                      aria-expanded={expandedId === o.id}
                      aria-controls={`details-${o.id}`}
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                      aria-label={`${expandedId === o.id ? 'Fewer details' : 'More details'}${typeof o.label === 'string' ? `: ${o.label}` : ''}`}
                    >
                      {expandedId === o.id ? 'Fewer details' : 'More details'}
                      <ChevronRight size={14} aria-hidden className={styles.moreChevron} data-open={expandedId === o.id || undefined} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.moreLink}
                      onClick={() => setOpenId(o.id)}
                      aria-label={`More details${typeof o.label === 'string' ? `: ${o.label}` : ''}`}
                    >
                      More details
                      <ChevronRight size={14} aria-hidden />
                    </button>
                  ))}
              </div>
            );
          }
          return (
            <div key={o.id} className={styles.cell}>
              <Radio value={o.value} isDisabled={o.disabled} className={styles.card} data-more={more || undefined}>
                {({ isSelected }) => (
                  <>
                    {isSelected && <Check size={14} className={styles.check} aria-hidden />}
                    {o.media && <div className={styles.cardMedia}>{o.media}</div>}
                    {o.badge && (
                      <div className={styles.cardHead}>
                        <span className={styles.badge}>{o.badge}</span>
                      </div>
                    )}
                    <div className={styles.cardTitle}>{o.label}</div>
                    {o.summary && <div className={styles.cardSummary}>{o.summary}</div>}
                  </>
                )}
              </Radio>
              {more && (
                // A sibling of the radio, not inside it, so opening the details doesn't also select the card.
                <button
                  type="button"
                  className={styles.more}
                  onClick={() => setOpenId(o.id)}
                  aria-label={`More details${typeof o.label === 'string' ? `: ${o.label}` : ''}`}
                >
                  More details
                  <ChevronRight size={14} aria-hidden />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={open !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpenId(null);
        }}
        isDismissable
        className={styles.overlay}
      >
        <Dialog className={[styles.dialog, open?.media && styles.dialogWide].filter(Boolean).join(' ')}>
          {open && (
            <>
              <div className={styles.dialogHead}>
                <div>
                  {open.badge && <div className={styles.badge}>{open.badge}</div>}
                  <Heading slot="title" className={styles.dialogTitle}>
                    {open.label}
                  </Heading>
                </div>
                <Button size="sm" variant="ghost" icon={<X size={16} aria-hidden />} aria-label="Close" onPress={() => setOpenId(null)} />
              </div>
              <div className={styles.dialogBody}>
                {open.media && <div className={styles.dialogMedia}>{open.media}</div>}
                {open.details?.actions && <div className={styles.dialogMediaActions}>{open.details.actions}</div>}
                {open.summary && <p className={styles.dialogSummary}>{open.summary}</p>}
                {open.details && <DetailsBody details={open.details} />}
              </div>
              {/* One way out: the X above (UX review, 2026-11-11). The chosen option shows a tag, not a dead button. */}
              <div className={styles.dialogActions}>
                {value === open.value ? (
                  <span className={styles.selectedTag}>
                    <Check size={16} aria-hidden /> Selected
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    icon={<Check size={16} aria-hidden />}
                    disabled={open.disabled}
                    onPress={() => {
                      onChange(open.value);
                      setOpenId(null);
                    }}
                  >
                    Choose this option
                  </Button>
                )}
              </div>
            </>
          )}
        </Dialog>
      </Modal>
    </RadioGroup>
  );
}

/** The details beyond the summary: shared by the dialog and the inline (in-dialog) expansion. */
function DetailsBody({ details }: { details: ChoiceCardDetails }) {
  return (
    <>
      {details.body && <p className={styles.dialogText}>{details.body}</p>}
      {!!details.facts?.length && (
        <dl className={styles.facts}>
          {details.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {details.rationale && (
        <section className={styles.dialogSection}>
          <h3>Why This Option</h3>
          <p className={styles.dialogText}>{details.rationale}</p>
        </section>
      )}
      {!!details.sources?.length && (
        <section className={styles.dialogSection}>
          <h3>Knowledge-Base Sources</h3>
          <ul className={styles.sources}>
            {details.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** Splits the agent's "… (Sources: a; b)" rationale suffix into its own list. */
export function splitSources(rationale: string): { rationale: string; sources: string[] } {
  const m = rationale.match(/^([\s\S]*?)\s*\(Sources: ([\s\S]*)\)\s*$/);
  if (!m) return { rationale, sources: [] };
  return {
    rationale: m[1]!,
    sources: m[2]!
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}
