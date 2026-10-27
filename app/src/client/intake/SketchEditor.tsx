// The sketch editor, opened from Edit Sketch on Review the Sketch: the layout as a
// line drawing through the photo's locked camera, where the art director drags
// items to new spots and deletes the ones the scene doesn't need. Every item lands
// on a hidden grid of real tabletop points; points that would hang off the table,
// crowd another item, leave the frame or hide the Coca-Cola product are closed
// (shared/layoutEdit.ts), and a drop with nowhere open nearby slides back with the
// reason. Seated people and the drink in a person's hand hold the pose and don't
// move. Saving hands back the new spots; the step turns them into a new
// arrangement and redraws the sketch from it.

import { RotateCcw, Trash2, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Dialog, Heading, Modal } from 'react-aria-components';
import * as THREE from 'three';

import { EditRules, editedBlueprint, isEdited, movable, placementOf, removable, type Placement, type Spot } from '../../shared/layoutEdit.ts';
import type { LightingPreset } from '../../shared/rules.ts';
import type { Blueprint, Primitive, SceneSpec } from '../../shared/types.ts';
import { renderSketch, type Sketch } from '../lib/renderProxy.ts';
import { Button } from '../ui/Button.tsx';
import { SkeletonBlock } from '../ui/Skeleton.tsx';
import styles from './SketchEditor.module.css';

const WIDTH = 1280;

/** The name on an item's chip: short enough to sit on the drawing. */
function chipName(p: Primitive): string {
  if (p.role === 'sku' || p.role === 'partner-sku') return 'Coca-Cola';
  if (p.role === 'glass' || p.role === 'partner-glass') return 'Glass';
  if (p.role === 'napkin-set' || p.role === 'partner-napkin') return 'Napkin';
  const n = p.component_name;
  return n.length > 22 ? `${n.slice(0, 21).trimEnd()}…` : n;
}

type Drag = {
  id: string;
  /** Pointer to item-centre offset on the grab plane, so the item doesn't jump under the pointer. */
  offset: Spot;
  plane: number;
  startX: number;
  startY: number;
  moved: boolean;
  open: Spot[];
  rings: Array<Array<[number, number]>>;
  /** Where it would land, or where the pointer is when nothing nearby is open. */
  at: Spot | null;
  want: Spot | null;
  blocked: string | null;
};

export function SketchEditor({
  isOpen,
  onClose,
  blueprint,
  spec,
  lighting,
  sourceName,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** The layout the sketch on screen was drawn from. */
  blueprint: Blueprint;
  spec: SceneSpec;
  lighting: LightingPreset;
  /** How the step names this arrangement, e.g. "arrangement A". */
  sourceName: string;
  onSave: (edited: Blueprint) => void;
}) {
  const rules = useMemo(() => new EditRules(blueprint, spec), [blueprint, spec]);
  const [place, setPlace] = useState<Placement>(() => placementOf(blueprint));
  const [history, setHistory] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'info' | 'warn' } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  /** The drawing on screen and the layout it shows (its hit map indexes that layout's items). */
  const [drawn, setDrawn] = useState<{ sketch: Sketch; bp: Blueprint } | null>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Every open starts from the layout on screen.
  useEffect(() => {
    if (!isOpen) return;
    setPlace(placementOf(blueprint));
    setHistory([]);
    setSelected(null);
    setMessage(null);
    setDrag(null);
    setDrawn(null);
  }, [isOpen, blueprint]);

  const edited = useMemo(() => editedBlueprint(blueprint, place, sourceName), [blueprint, place, sourceName]);
  const changed = isEdited(blueprint, place);

  // The line drawing of the edited layout, redrawn after each move (after a paint, so the old one stays meanwhile).
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => setDrawn({ sketch: renderSketch(edited, lighting, { width: WIDTH }), bp: edited }));
    return () => cancelAnimationFrame(frame);
  }, [isOpen, edited, lighting]);
  const sketch = drawn?.sketch ?? null;
  const shown = drawn?.bp ?? edited;

  const toCanvas = (x: number, y: number, d: number, w: number, h: number): [number, number] => {
    const s = rules.proj.project(x, y, d);
    return [s.x * w, (1 - s.y) * h];
  };

  /** The table point under the pointer, on the horizontal plane at `y`. */
  const tableAt = (e: { clientX: number; clientY: number }, y: number): Spot | null => {
    const el = frameRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, rules.proj.cam);
    const hit = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -y), new THREE.Vector3());
    return hit ? { x: hit.x, d: -hit.z } : null;
  };

  const itemAt = (e: { clientX: number; clientY: number }): string | null => {
    const el = frameRef.current;
    if (!el || !sketch) return null;
    const r = el.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * sketch.width);
    const y = Math.floor(((e.clientY - r.top) / r.height) * sketch.height);
    const i = sketch.hit[y * sketch.width + x] ?? 0;
    return i ? (shown.primitives[i - 1]?.id ?? null) : null;
  };

  /** Selects the item under the pointer (or `id`, pressed on its chip) and picks it up. */
  const startDrag = (e: ReactPointerEvent<HTMLElement>, id = itemAt(e)) => {
    if (e.button !== 0) return;
    setSelected(id);
    setMessage(null);
    if (!id || !place[id]) return;
    const p = rules.item(id);
    if (!movable(p)) return;
    const plane = p.dimensions.height / 2;
    const grab = tableAt(e, plane);
    if (!grab) return;
    frameRef.current?.setPointerCapture(e.pointerId);
    setDrag({
      id,
      offset: { x: place[id]!.x - grab.x, d: place[id]!.d - grab.d },
      plane,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      open: rules.openPoints(place, id),
      rings: rules.keepOut(place, id),
      at: null,
      want: null,
      blocked: null,
    });
  };

  const pendingMove = useRef<number | null>(null);
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) {
      const el = frameRef.current;
      if (el) el.dataset.pointer = itemAt(e) ? 'true' : '';
      return;
    }
    const { clientX, clientY } = e;
    if (pendingMove.current !== null) cancelAnimationFrame(pendingMove.current);
    pendingMove.current = requestAnimationFrame(() => {
      pendingMove.current = null;
      setDrag((cur) => {
        if (!cur) return cur;
        const moved = cur.moved || Math.hypot(clientX - cur.startX, clientY - cur.startY) > 4;
        if (!moved) return cur;
        const t = tableAt({ clientX, clientY }, cur.plane);
        if (!t) return { ...cur, moved };
        const want = { x: t.x + cur.offset.x, d: t.d + cur.offset.d };
        const s = rules.snap(place, cur.id, want);
        return { ...cur, moved, want, at: s.spot, blocked: s.block?.text ?? null };
      });
    });
  };

  const onPointerUp = () => {
    if (pendingMove.current !== null) cancelAnimationFrame(pendingMove.current);
    pendingMove.current = null;
    const d = drag;
    setDrag(null);
    if (!d || !d.moved) return;
    const name = rules.item(d.id).component_name;
    if (!d.at) {
      setMessage({ text: `${d.blocked ?? 'There is no room there.'} ${name} went back to its spot.`, tone: 'warn' });
      return;
    }
    const cur = place[d.id]!;
    if (Math.abs(cur.x - d.at.x) < 1e-6 && Math.abs(cur.d - d.at.d) < 1e-6) return;
    setHistory((h) => [...h, place]);
    setPlace({ ...place, [d.id]: d.at });
  };

  const remove = (id: string) => {
    const p = rules.item(id);
    if (!removable(p) || !place[id]) return;
    setHistory((h) => [...h, place]);
    const next = { ...place };
    delete next[id];
    setPlace(next);
    setSelected(null);
    setMessage({ text: `Removed ${p.component_name}. Undo brings it back.`, tone: 'info' });
  };

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory(history.slice(0, -1));
    setPlace(prev);
    setMessage(null);
  };

  const startOver = () => {
    setHistory((h) => [...h, place]);
    setPlace(placementOf(blueprint));
    setSelected(null);
    setMessage(null);
  };

  // Delete or Backspace removes the selected item.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        remove(selected);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // The guide over the drawing: the selected item tinted; while dragging, the item lifted off
  // its old spot, the open points, the keep-out rings and the item where it would land.
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !sketch) return;
    const { width: w, height: h, hit } = sketch;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    const index = selected ? shown.primitives.findIndex((p) => p.id === selected) + 1 : 0;
    if (index > 0) {
      const img = ctx.createImageData(w, h);
      const lifting = !!drag?.moved;
      for (let i = 0; i < hit.length; i++) {
        if (hit[i] !== index) continue;
        const o = i * 4;
        if (lifting) {
          img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
          img.data[o + 3] = 220;
        } else {
          img.data[o] = 231;
          img.data[o + 1] = 34;
          img.data[o + 2] = 58;
          img.data[o + 3] = 70;
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    if (!drag?.moved) return;
    const p = rules.item(drag.id);
    // Keep-out rings, dashed.
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    for (const ring of drag.rings) {
      ctx.beginPath();
      ring.forEach(([x, d], i) => {
        const [cx, cy] = toCanvas(x, 0, d, w, h);
        if (i) ctx.lineTo(cx, cy);
        else ctx.moveTo(cx, cy);
      });
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
    // Open points.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (const s of drag.open) {
      const [cx, cy] = toCanvas(s.x, 0, s.d, w, h);
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // The item where it would land (red), or where the pointer is when nothing is open (hatched grey).
    const spot = drag.at ?? drag.want;
    if (!spot) return;
    const polys = rules.silhouette(p, spot);
    ctx.save();
    ctx.lineWidth = 2.5;
    for (const poly of polys) {
      ctx.beginPath();
      poly.forEach(([sx, sy], i) => {
        const cx = sx * w,
          cy = (1 - sy) * h;
        if (i) ctx.lineTo(cx, cy);
        else ctx.moveTo(cx, cy);
      });
      ctx.closePath();
      ctx.fillStyle = drag.at ? 'rgba(231, 34, 58, 0.28)' : 'rgba(80, 80, 80, 0.18)';
      ctx.strokeStyle = drag.at ? 'rgba(231, 34, 58, 0.95)' : 'rgba(0, 0, 0, 0.55)';
      if (!drag.at) ctx.setLineDash([6, 5]);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    if (drag.at) {
      const [cx, cy] = toCanvas(drag.at.x, 0, drag.at.d, w, h);
      ctx.fillStyle = 'rgba(231, 34, 58, 1)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toCanvas reads rules, listed
  }, [sketch, selected, drag, rules, shown]);

  const sel = selected && place[selected] ? rules.item(selected) : null;
  const removedCount = blueprint.primitives.length - Object.keys(place).length;
  const movedCount = blueprint.primitives.filter((p) => {
    const at = place[p.id];
    return at && (Math.abs(at.x - p.world.x) > 1e-6 || Math.abs(at.d - p.world.d) > 1e-6);
  }).length;
  const summary = [movedCount ? `${movedCount} moved` : '', removedCount ? `${removedCount} removed` : ''].filter(Boolean).join(' · ');

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} isDismissable={!changed} isKeyboardDismissDisabled={changed} className={styles.overlay}>
      <Dialog className={styles.dialog} aria-label="Edit the sketch">
        <div className={styles.head}>
          <Heading slot="title" className={styles.title}>
            Edit Sketch
          </Heading>
          <p className={styles.lede}>
            Your layout in outline, through the photo's camera. Drag an item to move it; it lands on the nearest spot with room for it. Select an item and
            press Delete to take it off the table. The Coca-Cola product and the main dish stay in every scene.
            {blueprint.primitives.some((p) => p.role === 'person') && ' The people keep their pose and the drink in their hand; everything else moves around them, clear of their hands.'}
          </p>
        </div>

        <div className={styles.stage}>
          <div
            ref={frameRef}
            className={styles.frame}
            data-dragging={drag?.moved || undefined}
            onPointerDown={(e) => startDrag(e)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDrag(null)}
          >
            {sketch ? <img className={styles.sketch} src={sketch.url} alt="Line drawing of your edited layout, 16:9, through the photo's camera" draggable={false} /> : <SkeletonBlock height="100%" />}
            {sketch && <canvas className={styles.overlay2} ref={overlayRef} aria-hidden />}
            {sketch &&
              !drag?.moved &&
              shown.primitives.map((p, i) => {
                const a = sketch.anchors[i];
                // The people are named on Review the Sketch; here they're only what the rest moves around.
                if (!a || p.role === 'person') return null;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.chip}
                    data-selected={selected === p.id || undefined}
                    style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      startDrag(e, p.id);
                    }}
                    onClick={(e) => {
                      // Pointer presses select on the way down; this is the keyboard.
                      if (e.detail !== 0) return;
                      setSelected(selected === p.id ? null : p.id);
                      setMessage(null);
                    }}
                    aria-label={`Select ${p.component_name}`}
                  >
                    {chipName(p)}
                  </button>
                );
              })}
          </div>

          <div className={styles.bar}>
            <div className={styles.selection} aria-live="polite">
              {drag?.moved ? (
                drag.at ? (
                  <span>Drop to place {rules.item(drag.id).component_name} here.</span>
                ) : (
                  <span className={styles.warn}>{drag.blocked ?? 'No room here.'}</span>
                )
              ) : message ? (
                <span className={message.tone === 'warn' ? styles.warn : undefined}>{message.text}</span>
              ) : sel ? (
                <span>
                  <strong>{sel.component_name}</strong>
                  {!movable(sel) ? (sel.held_by ? ' stays in the hand that holds it.' : ' holds the pose you picked.') : removable(sel) ? '' : ' stays in every scene. You can move it.'}
                </span>
              ) : (
                <span className={styles.muted}>Select or drag an item.</span>
              )}
            </div>
            <div className={styles.tools}>
              <Button size="sm" variant="ghost" icon={<Trash2 size={14} aria-hidden />} onPress={() => sel && remove(sel.id)} disabled={!sel || !removable(sel)}>
                Delete
              </Button>
              <Button size="sm" variant="ghost" icon={<Undo2 size={14} aria-hidden />} onPress={undo} disabled={!history.length}>
                Undo
              </Button>
              <Button size="sm" variant="ghost" icon={<RotateCcw size={14} aria-hidden />} onPress={startOver} disabled={!changed}>
                Start over
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.foot}>
          <p className={styles.note}>
            {changed ? `${summary}. ` : ''}Saving keeps this as a new arrangement and redraws the sketch from it. A redraw counts toward your
            monthly limit.
          </p>
          <div className={styles.actions}>
            <Button onPress={onClose}>Cancel</Button>
            <Button variant="primary" disabled={!changed} onPress={() => onSave(edited)}>
              Save and redraw
            </Button>
          </div>
        </div>
      </Dialog>
    </Modal>
  );
}
