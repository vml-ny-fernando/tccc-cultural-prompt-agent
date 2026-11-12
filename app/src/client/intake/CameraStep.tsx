import { ArrowRight, Lightbulb, Move } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { reframe, type Reframe } from '../../shared/reframe.ts';
import { recommendAngle } from '../../shared/rules.ts';
import type { LayoutOption } from '../../shared/solver.ts';
import type { Selections } from '../../shared/spec.ts';
import type { Blueprint } from '../../shared/types.ts';
import { renderSketch } from '../lib/renderProxy.ts';
import { trpc } from '../trpc.ts';
import { Alert } from '../ui/Alert.tsx';
import { Button } from '../ui/Button.tsx';
import { SkeletonText } from '../ui/Skeleton.tsx';
import { AnglePicker, type AngleView } from './AnglePicker.tsx';
import { SketchEditor } from './SketchEditor.tsx';
import { TABLE_OVERSCAN } from './TableStep.tsx';
import type { ComposeResult } from './types.ts';
import styles from './CameraStep.module.css';
import sceneStyles from './SceneStep.module.css';
import { StepActions } from './StepActions.tsx';

export function CameraStep({
  dish,
  sel,
  onCamera,
  compose,
  option,
  onLayout,
  onNext,
}: {
  /** The brief's hero dish, for the recommended angle. */
  dish: string;
  sel: Selections;
  /** Older drafts without a laid-out table: the angle alone. */
  onCamera: (c: { look: string; angle: string }) => void;
  /** The laid-out table (Tablescape): the cards show it from each angle. */
  compose?: ComposeResult | null | undefined;
  option?: LayoutOption | undefined;
  /** The table seen from the picked angle, or moved in the editor through it. */
  onLayout?: ((bp: Blueprint, camera: { look: string; angle: string }) => void) | undefined;
  onNext: () => void;
}) {
  const config = trpc.config.useQuery();
  const bp = option?.blueprint;
  const spec = compose?.spec;
  const angleIds = config.data?.angles.map((a) => a.id).join(',') ?? '';
  // The same table from every angle: the items stay put, only the camera moves.
  const frames = useMemo(() => {
    if (!bp || !spec || !angleIds) return null;
    return Object.fromEntries(angleIds.split(',').map((id) => [id, reframe(spec, bp, id)])) as Record<string, Reframe>;
  }, [bp, spec, angleIds]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    setUrls({});
    if (!frames || !compose) return;
    const raf = requestAnimationFrame(() => {
      const out: Record<string, string> = {};
      for (const [id, f] of Object.entries(frames)) if (f.ok) out[id] = renderSketch(f.blueprint, compose.lighting, { width: 640 }).url;
      setUrls(out);
    });
    return () => cancelAnimationFrame(raf);
  }, [frames, compose]);
  const [fixOpen, setFixOpen] = useState(false);

  if (config.isPending) {
    return (
      <section>
        <h1>Camera Angle</h1>
        <SkeletonText rows={5} />
      </section>
    );
  }
  if (config.isError) {
    return (
      <section>
        <h1>Camera Angle</h1>
        <Alert tone="error" title="Couldn't load the camera options">
          {config.error.message}
        </Alert>
      </section>
    );
  }

  const cfg = config.data;
  const rec = recommendAngle({ dish, prep: sel.prep, plating: sel.plating });
  const recAngle = rec && cfg.angles.find((a) => a.id === rec.angle);
  // Until the operator picks, the recommended angle is the selection.
  const cam = sel.camera ?? { ...cfg.defaults, angle: recAngle ? recAngle.id : cfg.defaults.angle };
  const selectedLook = cfg.looks.find((l) => l.id === cam.look);
  const views: Record<string, AngleView> | undefined = frames
    ? Object.fromEntries(
        Object.entries(frames).map(([id, f]) => [id, f.ok ? { url: urls[id] ?? null, problems: f.problems.map((p) => p.text) } : { url: null, unavailable: f.reason }]),
      )
    : undefined;
  const current = frames?.[cam.angle];
  const pick = (angle: string) => {
    const f = frames?.[angle];
    if (f?.ok && onLayout) onLayout(f.blueprint, { ...cam, angle });
    else onCamera({ ...cam, angle });
  };
  /** The table at the picked angle, if it isn't already seen from there (a reset on Tablescape, an older draft). */
  const applyCurrent = () => {
    if (current?.ok && onLayout && bp && current.blueprint.camera.pitchDeg !== bp.camera.pitchDeg) onLayout(current.blueprint, cam);
    else if (!sel.camera) onCamera(cam);
  };

  return (
    <section>
      <h1>Camera Angle</h1>
      <p>
        {frames
          ? 'Your table from each angle. The items stay where you put them; only the camera moves. The lens and focus are handled for you.'
          : 'Pick a camera angle. The lens and focus are handled for you.'}
      </p>
      <div className={sceneStyles.field}>
        <label className={sceneStyles.fieldLabel}>Camera angle</label>
        {rec && recAngle && (
          <p className={styles.recommendation}>
            <Lightbulb size={16} aria-hidden className={styles.recommendationIcon} />
            <span>
              <strong>Recommended for {dish || 'this dish'}: {recAngle.label.replace(/\s*\(default\)$/, '')}.</strong> {rec.reason}
              {cam.angle !== recAngle.id && (
                <>
                  {' '}
                  <button type="button" className={styles.recommendationLink} onClick={() => pick(recAngle.id)}>
                    Use it
                  </button>
                </>
              )}
            </span>
          </p>
        )}
        <AnglePicker
          aria-label="Camera angle"
          lookId={cam.look}
          lookLabel={selectedLook?.label ?? ''}
          focalMm={selectedLook?.focalMm}
          value={cam.angle}
          onChange={pick}
          options={cfg.angles.map((a) => ({ id: a.id, label: a.label, pitchDeg: a.pitchDeg }))}
          recommendedId={recAngle?.id}
          views={views}
        />
      </div>
      {current?.ok && current.problems.length > 0 && (
        <Alert tone="warning" title="Something needs fixing from this angle">
          <ul className={styles.problems}>
            {current.problems.map((p, i) => (
              <li key={i}>{p.text}</li>
            ))}
          </ul>
          <p className={styles.problemsHint}>Move it, take it off the table, or pick another angle. The editor shows the table around the frame, so you can see what the camera misses.</p>
          <Button size="sm" variant="primary" icon={<Move size={14} aria-hidden />} onPress={() => setFixOpen(true)}>
            Move items
          </Button>
        </Alert>
      )}
      {current?.ok && compose && (
        <SketchEditor
          isOpen={fixOpen}
          onClose={() => setFixOpen(false)}
          blueprint={current.blueprint}
          spec={compose.spec}
          lighting={compose.lighting}
          sourceName="the recommended layout"
          overscan={TABLE_OVERSCAN}
          focus={current.problems.find((p) => p.id)?.id}
          title="Move Items"
          lede="Your table from this angle. The red box is the camera's frame; anything in the dimmed area is outside the shot. Drag the flagged items to a new spot, or select one and press Delete to take it off the table."
          saveLabel="Save"
          note="Nothing is drawn yet, so saving is free."
          onSave={(next) => {
            setFixOpen(false);
            onLayout?.(next, cam);
          }}
        />
      )}
      {sel.scene?.seated && sel.scene.seating === 'across' && cam.angle === 'low' && (
        <div className={sceneStyles.hint}>
          Over the shoulder doesn't fit from Low: the food ends up mid-frame above the table's legs. Pick Diner's eye or Looking down, or go back
          and seat the two around a corner.
        </div>
      )}
      {cfg.looks.some((l) => l.placeholder) && (
        <div className={sceneStyles.hint}>Lens and angle values are placeholders until the team finalizes them.</div>
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
