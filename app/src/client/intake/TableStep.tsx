// Tablescape & Camera (Fernando, 2026-11-12): the table is laid out first and the camera is
// picked on the same page. The recommended arrangement is taken for the operator and drawn
// large from the selected angle, beside the Layouts panel and as tall as it. The angle cards
// under it carry no picture (2026-11-13): tapping one shows the table from there in the large
// drawing, so every angle is seen there before Continue. Re-arrange opens the editor.
// Sketch Review then draws it.

import { AlertTriangle, ArrowRight, Lightbulb, Move } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Radio, RadioGroup } from 'react-aria-components';

import type { RuleEffects } from '../../api.ts';
import { reframe, type Reframe } from '../../shared/reframe.ts';
import { recommendAngle } from '../../shared/rules.ts';
import type { Selections } from '../../shared/spec.ts';
import type { AccentChoice, Blueprint, Decision } from '../../shared/types.ts';
import { renderSketch } from '../lib/renderProxy.ts';
import { trpc } from '../trpc.ts';
import { Button } from '../ui/Button.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import { ArrangementBar } from './ArrangementBar.tsx';
import cameraStyles from './CameraStep.module.css';
import { PrepareLayout } from './LayoutStep.tsx';
import { SketchEditor } from './SketchEditor.tsx';
import { StepActions } from './StepActions.tsx';
import styles from './ReviewStep.module.css';
import tableStyles from './TableStep.module.css';
import type { Brief, ComposeResult } from './types.ts';

/** Share of the editor's picture the camera frame takes, so the table around it shows too. */
export const TABLE_OVERSCAN = 0.6;

type Camera = NonNullable<Selections['camera']>;

/**
 * Where each notch's centre sits across the slider, in px. The end labels line up with the
 * frame's edges and each notch is centred over its label, so the rail and the knob follow
 * the labels' measured widths.
 */
function useNotchCenters(): [(el: HTMLDivElement | null) => void, number[]] {
  const [centers, setCenters] = useState<number[]>([]);
  const ro = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const next = [...el.querySelectorAll<HTMLElement>('[data-notch]')].map((n) => {
        const r = n.getBoundingClientRect();
        return r.left + r.width / 2 - box.left;
      });
      setCenters((prev) => (prev.length === next.length && prev.every((v, i) => Math.abs(v - next[i]!) < 0.5) ? prev : next));
    };
    ro.current = new ResizeObserver(measure);
    ro.current.observe(el);
    for (const child of el.children) ro.current.observe(child);
    measure();
  }, []);
  return [ref, centers];
}

export function TableStep({
  brief,
  sel,
  rules,
  accentDecision,
  onAccentDecision,
  onAccent,
  onNapkin,
  compose,
  picked,
  onCompose,
  onPick,
  onBackToSides,
  onWorkingLayout,
  onNext,
}: {
  brief: Brief;
  sel: Selections;
  rules: RuleEffects | null;
  accentDecision: Decision<AccentChoice> | null;
  onAccentDecision: (d: Decision<AccentChoice>) => void;
  onAccent: (v: AccentChoice | null) => void;
  onNapkin: () => void;
  compose: ComposeResult | null;
  picked: number | null;
  onCompose: (c: ComposeResult) => void;
  onPick: (i: number) => void;
  onBackToSides: () => void;
  /** The table as the operator left it, seen from `camera` (moved items, a new angle, or both). */
  onWorkingLayout: (bp: Blueprint, camera: Camera) => void;
  onNext: () => void;
}) {
  const config = trpc.config.useQuery();
  const option = compose && picked !== null ? compose.options[picked] : undefined;
  const bp = option?.blueprint;
  const spec = compose?.spec;
  const lighting = compose?.lighting;
  const [editOpen, setEditOpen] = useState(false);

  const angleIds = config.data?.angles.map((a) => a.id).join(',') ?? '';
  // The same table from every angle: the items stay put, only the camera moves.
  const frames = useMemo(() => {
    if (!bp || !spec || !angleIds) return null;
    return Object.fromEntries(angleIds.split(',').map((id) => [id, reframe(spec, bp, id)])) as Record<string, Reframe>;
  }, [bp, spec, angleIds]);

  const rec = recommendAngle({ dish: brief.heroDish, prep: sel.prep, plating: sel.plating });
  const recAngle = rec && config.data?.angles.find((a) => a.id === rec.angle);
  const fallback = config.data ? { ...config.data.defaults, angle: recAngle ? recAngle.id : config.data.defaults.angle } : null;
  const cam: Camera | null = sel.camera ?? fallback;
  const current = cam ? frames?.[cam.angle] : undefined;
  // The big drawing: the table from the selected angle (the layout itself when it's already seen from there).
  const shown = current?.ok ? current.blueprint : bp;

  const [big, setBig] = useState<string | null>(null);
  const [sliderRef, centers] = useNotchCenters();
  useEffect(() => {
    setBig(null);
    if (!shown || !lighting) return;
    const raf = requestAnimationFrame(() => setBig(renderSketch(shown, lighting, { width: 1280 }).url));
    return () => cancelAnimationFrame(raf);
  }, [shown, lighting]);

  if (!compose || !option || !bp || !lighting) {
    return (
      <PrepareLayout
        brief={brief}
        sel={sel}
        rules={rules}
        accentDecision={accentDecision}
        onAccentDecision={onAccentDecision}
        onAccent={onAccent}
        onNapkin={onNapkin}
        compose={compose}
        onCompose={onCompose}
        onPick={onPick}
        onBackToSides={onBackToSides}
        title="Tablescape & Camera"
        lede="Laying out the table with the recommended arrangement. Once it's ready you can see it from each camera angle and re-arrange anything."
      />
    );
  }

  const cfg = config.data;

  const pick = (angle: string) => {
    const f = frames?.[angle];
    if (cam && f?.ok) onWorkingLayout(f.blueprint, { ...cam, angle });
  };
  /** The table at the selected angle, if it isn't already seen from there (after a reset, or an older draft). */
  const applyCurrent = () => {
    if (cam && current?.ok && current.blueprint !== bp && current.blueprint.camera.pitchDeg !== bp.camera.pitchDeg) onWorkingLayout(current.blueprint, cam);
  };

  return (
    <section>
      <h1>Tablescape &amp; Camera</h1>
      <p className={styles.lede}>
        The recommended arrangement for your dish, sides and drink, drawn from the selected camera angle. Tap an angle below to see the same table
        from there: only the camera moves. Use Re-arrange to move anything or take it off the table.
      </p>

      <div className={tableStyles.top}>
        <div className={`${styles.frame} ${tableStyles.frame}`}>
          {big ? <img className={styles.sketch} src={big} alt="Line drawing of the table from the selected camera angle" /> : <SkeletonBlock height="100%" />}
          <button type="button" className={tableStyles.rearrange} onClick={() => setEditOpen(true)}>
            <Move size={14} aria-hidden />
            Re-arrange
          </button>
        </div>
        {/* As tall as the drawing: the panel scrolls inside rather than stretching the row. */}
        <div className={tableStyles.barCell}>
          <ArrangementBar
            brief={brief}
            sel={sel}
            rules={rules}
            accentDecision={accentDecision}
            onAccentDecision={onAccentDecision}
            compose={compose}
            picked={picked!}
            onPick={onPick}
            hasSketch={() => false}
            onAccent={onAccent}
            onNapkin={onNapkin}
            drawing={false}
            stage="table"
          />
        </div>
      </div>

      <div className={tableStyles.below}>

        {cfg && cam && (
          <div className={tableStyles.angles}>
            <RadioGroup aria-label="Camera angle" value={cam.angle} onChange={pick} orientation="horizontal" className={tableStyles.angleGroup}>
              <span className={tableStyles.angleLabel}>Camera angle</span>
              {/* A three-notch slider: the knob sits on the picked angle, the names and tags under the notches. */}
              <div ref={sliderRef} className={tableStyles.slider} data-measured={centers.length > 1 || undefined}>
                <span
                  className={tableStyles.track}
                  aria-hidden
                  style={{ left: centers[0] ?? 0, width: centers.length > 1 ? centers[centers.length - 1]! - centers[0]! : 0 }}
                />
                <span className={tableStyles.knob} aria-hidden style={{ ['--x' as string]: `${centers[Math.max(0, cfg.angles.findIndex((a) => a.id === cam.angle))] ?? 0}px` }} />
                {cfg.angles.map((a) => {
                  const f = frames?.[a.id];
                  const fixes = f?.ok ? f.problems.length : 0;
                  const label = a.label.replace(/\s*\(default\)$/, '');
                  const isRec = a.id === recAngle?.id;
                  const note = !f ? '' : !f.ok ? f.reason : fixes ? `${fixes} ${fixes === 1 ? 'item' : 'items'} to fix from this angle` : '';
                  return (
                    <Radio
                      key={a.id}
                      value={a.id}
                      isDisabled={!!f && !f.ok}
                      className={tableStyles.stop}
                      aria-label={[label, isRec ? 'recommended' : '', note].filter(Boolean).join(', ')}
                    >
                      <span className={tableStyles.notch} data-notch aria-hidden />
                      <span title={note || undefined} className={tableStyles.stopLabel}>
                        {label}
                        {fixes > 0 && (
                          <span className={tableStyles.fix} aria-hidden>
                            <AlertTriangle size={12} />
                            {fixes}
                          </span>
                        )}
                      </span>
                      {isRec && <span className={tableStyles.recommended}>Recommended</span>}
                    </Radio>
                  );
                })}
              </div>
            </RadioGroup>
            {current?.ok && current.problems.length > 0 && (
              <div className={tableStyles.fixNote} role="status">
                <AlertTriangle size={14} aria-hidden className={tableStyles.fixNoteIcon} />
                <span>
                  {current.problems.map((p) => p.text).join(' ')}{' '}
                  <button type="button" className={cameraStyles.recommendationLink} onClick={() => setEditOpen(true)}>
                    Re-arrange
                  </button>{' '}
                  or pick another angle.
                </span>
              </div>
            )}
            {rec && recAngle && (
              <p className={`${cameraStyles.recommendation} ${tableStyles.recommendation}`}>
                <Lightbulb size={16} aria-hidden className={cameraStyles.recommendationIcon} />
                <span>
                  <strong>Recommended for {brief.heroDish || 'this dish'}:</strong> {recAngle.label.replace(/\s*\(default\)$/, '')}.{' '}
                  {rec.reason}
                </span>
              </p>
            )}
          </div>
        )}
        {sel.scene?.seated && sel.scene.seating === 'across' && cam?.angle === 'low' && (
          <p className={styles.detailText}>
            Over the shoulder doesn't fit from Low: the food ends up mid-frame above the table's legs. Pick Diner's eye or Looking down.
          </p>
        )}
      </div>

      {shown && cam && (
        <SketchEditor
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          blueprint={shown}
          spec={compose.spec}
          lighting={lighting}
          sourceName="the recommended layout"
          overscan={TABLE_OVERSCAN}
          focus={current?.ok ? current.problems.find((p) => p.id)?.id : undefined}
          title="Re-arrange"
          lede="Your table from this angle. The red box is the camera's frame; the dimmed table around it is outside the shot. Drag an item to move it: it lands on the nearest spot with room for it. Select an item and press Delete to take it off the table. Drag the empty table to slide the frame. The Coca-Cola product and the main dish stay in every scene."
          saveLabel="Save"
          note="Nothing is drawn yet, so saving is free."
          onSave={(next) => {
            setEditOpen(false);
            onWorkingLayout(next, cam);
          }}
        />
      )}

      <StepActions>
        <Button
          variant="primary"
          iconEnd={<ArrowRight size={16} aria-hidden />}
          onPress={() => {
            applyCurrent();
            onNext();
          }}
        >
          Continue
        </Button>
      </StepActions>
    </section>
  );
}
