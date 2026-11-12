// Sketch review's side panel, beside the sketch: a carousel of the 3D layout guides the
// sketch can be drawn from (so the drawn one can be compared with the sketch at a glance),
// and the accent. The best-ranked layout is picked for the operator (PrepareLayout in
// LayoutStep.tsx). The arrows step through the other arrangements as previews; Draw
// switches to the one shown, with a note that it counts toward the monthly limit.

import { ChevronLeft, ChevronRight, Pencil, RotateCw } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dialog, Heading, Modal } from "react-aria-components";

import type { RuleEffects } from "../../api.ts";
import { MODEL_FRAMING_WIDEN } from "../../shared/rules.ts";
import { SKETCH_MODEL_LABEL } from "../../shared/sketch.ts";
import type { Selections } from "../../shared/spec.ts";
import type { AccentChoice, Decision } from "../../shared/types.ts";
import { renderProxy } from "../lib/renderProxy.ts";
import { Alert } from "../ui/Alert.tsx";
import { Button } from "../ui/Button.tsx";
import { SkeletonBlock } from "../ui/Skeleton.tsx";
import { AccentPicker } from "./AccentPicker.tsx";
import type { Brief, ComposeResult } from "./types.ts";
import styles from "./ArrangementBar.module.css";
import dialog from "./ReviewStep.module.css";

// Up to three from the solver, then the art director's edits (one per arrangement).
export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

type AccentAnswer = { accent: AccentChoice | null; napkin: boolean };

export function ArrangementBar({
  brief,
  sel,
  rules,
  accentDecision,
  onAccentDecision,
  compose,
  picked,
  onPick,
  hasSketch,
  onAccent,
  onNapkin,
  drawing,
  stage,
}: {
  brief: Brief;
  sel: Selections;
  rules: RuleEffects | null;
  accentDecision: Decision<AccentChoice> | null;
  onAccentDecision: (d: Decision<AccentChoice>) => void;
  compose: ComposeResult;
  picked: number;
  onPick: (i: number) => void;
  /** A detailed sketch is already saved for that arrangement, so switching to it is free. */
  hasSketch: (i: number) => boolean;
  /** Changing the accent re-composes the table: the layouts and the sketch start over. */
  onAccent: (v: AccentChoice | null) => void;
  onNapkin: () => void;
  /** A sketch is drawing: switching now would leave that draw behind. */
  drawing: boolean;
  /**
   * The table is laid out before the camera (2026-11-12): only the picked layout shows, with no
   * switching between arrangements. The accent changes on the Tablescape step ("table"), not on
   * Sketch Review ("review"). Unset: the older flow with arrangements to switch between.
   */
  stage?: "table" | "review" | undefined;
}) {
  const fixed = stage !== undefined;
  const [big, setBig] = useState<string | null>(null);
  // The arrangement shown in the layout guide before switching to it; null shows the picked one.
  const [preview, setPreview] = useState<number | null>(null);
  const [accentOpen, setAccentOpen] = useState(false);
  const [answer, setAnswer] = useState<AccentAnswer | null>(null);

  const onTheGo = sel.scene?.venue === "on-the-go";
  const options = compose.options;
  const shown = preview ?? picked;
  const bp = options[shown]!.blueprint;

  // A new set of layouts, or a switch, ends the preview.
  useEffect(() => setPreview(null), [options, picked]);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setExpanded(false), [shown]);
  // Read more only appears when the clamped text is actually cut off.
  const rationaleRef = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const el = rationaleRef.current;
    if (!el || expanded) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [bp.layout_meta.rationale, expanded]);

  // The shown arrangement's layout guide, without the composition guides: the same picture the sketch is drawn from.
  useEffect(() => {
    setBig(null);
    const frame = requestAnimationFrame(() =>
      setBig(
        renderProxy(bp, compose.lighting, {
          width: 960,
          widen: MODEL_FRAMING_WIDEN,
        }),
      ),
    );
    return () => cancelAnimationFrame(frame);
  }, [bp, compose.lighting]);

  const accentLine =
    sel.accent?.label ??
    (sel.napkin && onTheGo ? "Plain paper napkin" : "None");
  const current: AccentAnswer = {
    accent: sel.accent ?? null,
    napkin: !!sel.napkin && onTheGo,
  };
  const chosen = answer ?? current;
  const accentChanged =
    chosen.napkin !== current.napkin ||
    (chosen.accent?.name ?? null) !== (current.accent?.name ?? null);
  const openAccent = () => {
    setAnswer(null);
    setAccentOpen(true);
  };
  const applyAccent = () => {
    setAccentOpen(false);
    if (!accentChanged) return;
    if (chosen.napkin) onNapkin();
    else onAccent(chosen.accent);
  };

  const previewing = preview !== null && preview !== picked;
  const switchTo = () => {
    if (preview !== null) onPick(preview);
  };
  // Step through the arrangements, wrapping round; landing back on the drawn one ends the preview.
  const step = (by: number) => {
    const next = (shown + by + options.length) % options.length;
    setPreview(next === picked ? null : next);
  };
  const many = options.length > 1 && !fixed;

  return (
    <aside className={styles.bar} aria-label="Layouts">
      <figure className={styles.guide} data-preview={previewing || undefined}>
        <figcaption className={styles.guideHead}>
          <h3 className={styles.previewTitle}>Layouts</h3>
          <span className={styles.guideLine}>
            <span
              className={styles.guideName}
              title={`Layout guide ${OPTION_LETTERS[shown]} · ${bp.layout_meta.archetype}`}
            >
              Layout guide {OPTION_LETTERS[shown]} · {bp.layout_meta.archetype}
            </span>
            {shown === picked && many && (
              <span className={styles.inUse}>Drawn</span>
            )}
          </span>
        </figcaption>
        <div className={styles.stage}>
          <div className={styles.guideImage}>
            {big ? (
              <img
                src={big}
                alt={`3D layout guide of arrangement ${OPTION_LETTERS[shown]}, the shapes the sketch is drawn from`}
              />
            ) : (
              <SkeletonBlock height="100%" />
            )}
          </div>
          {many && (
            <>
              <button type="button" className={styles.arrow} data-side="prev" aria-label="Previous layout" onClick={() => step(-1)}>
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button type="button" className={styles.arrow} data-side="next" aria-label="Next layout" onClick={() => step(1)}>
                <ChevronRight size={18} aria-hidden />
              </button>
            </>
          )}
        </div>
        {many && (
          <div className={styles.dots} role="group" aria-label="Layouts">
            {options.map((o, i) => (
              <button
                key={i}
                type="button"
                className={styles.dot}
                data-current={i === shown || undefined}
                data-drawn={i === picked || undefined}
                aria-label={`Layout ${OPTION_LETTERS[i]}: ${o.blueprint.layout_meta.archetype}${i === 0 ? ", best fit" : ""}${i === picked ? ", drawn" : ""}`}
                aria-current={i === shown || undefined}
                onClick={() => setPreview(i === picked ? null : i)}
              />
            ))}
          </div>
        )}
        {/* Clamped to a fixed number of lines so switching arrangements never changes the panel's height; Read more opens it up. */}
        <div className={styles.rationaleWrap}>
          <p
            ref={rationaleRef}
            id="layout-rationale"
            className={styles.rationale}
            data-expanded={expanded || undefined}
            aria-live="polite"
          >
            {bp.layout_meta.rationale}
          </p>
          {(overflows || expanded) && (
            <button
              type="button"
              className={styles.more}
              aria-expanded={expanded}
              aria-controls="layout-rationale"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      </figure>

      {many && (
        <div className={styles.section}>
          <Button
            variant={previewing ? "primary" : "default"}
            icon={<RotateCw size={16} aria-hidden />}
            disabled={!previewing || drawing}
            onPress={switchTo}
          >
            {previewing
              ? hasSketch(preview)
                ? `Use ${OPTION_LETTERS[preview]}`
                : `Draw ${OPTION_LETTERS[preview]}`
              : `${OPTION_LETTERS[picked]} Is Drawn`}
          </Button>
          <p className={styles.hint}>
            {drawing && previewing
              ? "You can draw this once the current sketch has finished."
              : previewing && !hasSketch(preview)
                ? `Counts toward your monthly limit (${SKETCH_MODEL_LABEL}). Your marks on this sketch don't carry over.`
                : previewing
                  ? "Already drawn, so switching back is free."
                  : "Use the arrows to preview the other layouts."}
          </p>
        </div>
      )}

      {rules?.needsAccent && (
        <div className={styles.accentRow}>
          <span className={styles.label}>Accent</span>
          <span className={styles.value}>{accentLine}</span>
          {stage !== "review" && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Pencil size={14} aria-hidden />}
              aria-label="Change the accent"
              disabled={drawing}
              onPress={openAccent}
            >
              Change
            </Button>
          )}
        </div>
      )}

      {!!compose.notes?.length && (
        <Alert tone="info" title="Adjusted to fit">
          {compose.notes.join(" ")}
        </Alert>
      )}

      <Modal
        isOpen={accentOpen}
        onOpenChange={setAccentOpen}
        isDismissable
        className={dialog.modalOverlay}
      >
        <Dialog className={`${dialog.dialog} ${styles.accentDialog}`}>
          <div className={styles.accentHead}>
            <Heading slot="title" className={dialog.dialogTitle}>
              Change the Accent
            </Heading>
            <p className={dialog.dialogText}>
              {stage === "table"
                ? "A different accent lays the table out again, so items you moved go back to the recommended spots."
                : `A different accent re-arranges the table and draws a new sketch, which counts toward your monthly limit (${SKETCH_MODEL_LABEL}). Your marks on this sketch don't carry over.`}
            </p>
          </div>
          <div className={styles.accentBody}>
            <AccentPicker
              brief={brief}
              sel={sel}
              items={rules?.items}
              decision={accentDecision}
              selected={chosen.napkin ? undefined : chosen.accent}
              onDecision={onAccentDecision}
              onPick={(v) => setAnswer({ accent: v, napkin: false })}
              napkin={chosen.napkin}
              onNapkin={() => setAnswer({ accent: null, napkin: true })}
              inDialog
            />
          </div>
          <div className={`${dialog.dialogActions} ${styles.accentFoot}`}>
            <Button onPress={() => setAccentOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<RotateCw size={16} aria-hidden />}
              disabled={!accentChanged}
              onPress={applyAccent}
            >
              {stage === "table" ? "Apply" : "Apply and redraw"}
            </Button>
          </div>
        </Dialog>
      </Modal>
    </aside>
  );
}
