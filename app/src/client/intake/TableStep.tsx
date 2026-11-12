// Tablescape (Fernando, 2026-11-12): the table is laid out before the camera is picked.
// The recommended arrangement is taken for the operator, shown as a line drawing, and
// any item can be moved or taken off the table in the editor. The Camera Angle step
// then shows this same table from each angle; Sketch Review draws it.

import { ArrowRight, Move, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { RuleEffects } from '../../api.ts';
import type { Selections } from '../../shared/spec.ts';
import type { AccentChoice, Blueprint, Decision } from '../../shared/types.ts';
import { renderSketch } from '../lib/renderProxy.ts';
import { Button } from '../ui/Button.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import { ArrangementBar } from './ArrangementBar.tsx';
import { PrepareLayout } from './LayoutStep.tsx';
import { SketchEditor } from './SketchEditor.tsx';
import { StepActions } from './StepActions.tsx';
import type { Brief, ComposeResult } from './types.ts';
import styles from './ReviewStep.module.css';

/** Share of the editor's picture the camera frame takes, so the table around it shows too. */
export const TABLE_OVERSCAN = 0.6;

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
  /** The layout as the operator moved it. */
  onWorkingLayout: (bp: Blueprint) => void;
  onNext: () => void;
}) {
  const option = compose && picked !== null ? compose.options[picked] : undefined;
  const [editOpen, setEditOpen] = useState(false);
  const [drawing, setDrawing] = useState<string | null>(null);
  const bp = option?.blueprint;
  const lighting = compose?.lighting;

  useEffect(() => {
    if (!bp || !lighting) return;
    setDrawing(null);
    const frame = requestAnimationFrame(() => setDrawing(renderSketch(bp, lighting, { width: 1280 }).url));
    return () => cancelAnimationFrame(frame);
  }, [bp, lighting]);

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
        title="Tablescape"
        lede="Laying out the table with the recommended arrangement. You can move anything once it's ready, then pick the camera angle."
      />
    );
  }

  const edited = !!option.edit;
  const moved = bp.layout_meta.moved?.length ?? 0;
  const removed = compose.options[option.edit?.from ?? 0]!.blueprint.primitives.length - bp.primitives.length;

  return (
    <section>
      <h1>Tablescape</h1>
      <p className={styles.lede}>
        The table comes first. This is the recommended arrangement for your dish, sides and drink. Drag anything to a new spot or take it off the table,
        then pick the camera angle on the next step: the items stay where you put them.
      </p>

      <div className={styles.compare}>
        <div className={styles.frameCol}>
          <div className={styles.frame}>
            {drawing ? <img className={styles.sketch} src={drawing} alt="Line drawing of the table as it is laid out" /> : <SkeletonBlock height="100%" />}
          </div>
          <div className={styles.toolbar}>
            <Button size="sm" icon={<Move size={14} aria-hidden />} onPress={() => setEditOpen(true)}>
              Move items
            </Button>
            {edited && (
              <Button size="sm" variant="ghost" icon={<RotateCcw size={14} aria-hidden />} onPress={() => onPick(option.edit!.from)}>
                Reset to recommended
              </Button>
            )}
          </div>
          {edited && (moved > 0 || removed > 0) && (
            <p className={styles.detailText}>
              {[moved ? `${moved} moved` : '', removed > 0 ? `${removed} removed` : ''].filter(Boolean).join(' · ')}. Reset to recommended puts everything back.
            </p>
          )}
        </div>
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

      <SketchEditor
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        blueprint={bp}
        spec={compose.spec}
        lighting={lighting}
        sourceName="the recommended layout"
        overscan={TABLE_OVERSCAN}
        title="Move Items"
        lede="Your table in outline. The red box is the camera's frame; the dimmed table around it is outside the shot. Drag an item to move it: it lands on the nearest spot with room for it. Select an item and press Delete to take it off the table. The Coca-Cola product and the main dish stay in every scene."
        saveLabel="Save"
        note="Nothing is drawn yet, so saving is free."
        onSave={(next) => {
          setEditOpen(false);
          onWorkingLayout(next);
        }}
      />

      <StepActions>
        <Button variant="primary" iconEnd={<ArrowRight size={16} aria-hidden />} onPress={onNext}>
          Continue
        </Button>
      </StepActions>
    </section>
  );
}
