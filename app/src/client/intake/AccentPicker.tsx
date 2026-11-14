import { useEffect } from 'react';

import type { ItemKind } from '../../shared/scene.ts';
import type { AccentChoice, Decision } from '../../shared/types.ts';
import type { Selections } from '../../shared/spec.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { ChoiceCardGroup, splitSources } from '../ui/ChoiceCard.tsx';
import { vesselLine } from './optionText.ts';
import { SkeletonText } from '../ui/Skeleton.tsx';
import { AgentStatus } from './AgentStatus.tsx';
import type { Brief } from './types.ts';
import styles from './DecisionStep.module.css';

const NAPKIN_ID = 'napkin';
const NONE_ID = 'none';

const KIND_LABEL: Record<ItemKind, string> = {
  main: 'Hero dish',
  'shared-hero': 'Shared hero',
  sku: 'Coca-Cola',
  glass: 'Glass',
  side: 'Side',
  'shared-side': 'Shared side',
  bread: 'Bread',
  condiment: 'Sauce',
  accent: 'Accent',
  'napkin-set': 'Napkin set',
  'partner-main': 'Second diner’s dish',
  'partner-napkin': 'Second diner’s napkin set',
  'partner-sku': 'Second diner’s Coca-Cola',
  'partner-glass': 'Second diner’s glass',
  'plate-stack': 'Small plates',
};

export type TableItem = { kind: ItemKind; name: string };

/** The operator's wording for the dish (the preparation), rather than the brief's bare dish name. */
function itemName(item: TableItem, sel: Selections, shared: boolean): string {
  const prep = sel.prep?.label;
  if (!prep) return item.name;
  if (item.kind === 'shared-hero') return `${prep}, served family-style`;
  if (item.kind === 'main') return shared ? `A plated portion of ${prep.toLowerCase()}` : prep;
  return item.name;
}

/**
 * The accent decision, opened from Change on Sketch review (ArrangementBar),
 * which only renders it when `rules.needsAccent` is true — an odd
 * item count needs no accent, so there's nothing for this component to ask.
 */
export function AccentPicker({
  brief,
  sel,
  items,
  decision,
  selected,
  onDecision,
  onPick,
  napkin,
  onNapkin,
  inDialog = false,
}: {
  brief: Brief;
  sel: Selections;
  /** What's already on the table before the accent. */
  items: TableItem[] | undefined;
  decision: Decision<AccentChoice> | null;
  selected: AccentChoice | null | undefined;
  onDecision: (d: Decision<AccentChoice>) => void;
  /** `null` skips the accent: an even count is allowed, just not preferred. */
  onPick: (v: AccentChoice | null) => void;
  /** On the go only (other venues already set a napkin): a plain paper napkin as the third item. */
  napkin: boolean;
  onNapkin: () => void;
  /** Inside the Change-accent dialog: the dialog carries the title, and details open in place rather than in a second dialog. */
  inDialog?: boolean;
}) {
  const napkinOffer = sel.scene?.venue === 'on-the-go';
  // Dish and drink with nothing else: the tight lockup is a complete layout on its own.
  const dishAndDrink = napkinOffer && !sel.sides?.accompaniments.length;
  const cardValue = selected
    ? (decision?.options.find((o) => o.value.name === selected.name)?.id ?? null)
    : napkin && napkinOffer
      ? NAPKIN_ID
      : selected === null
        ? NONE_ID
        : null;
  const skipLabel = dishAndDrink ? 'Keep dish and drink only' : 'Skip the accent';
  const task = useAgentTask('accent');
  const onSignedIn = useOnSignedIn();
  const load = () => task.run({ brief, selections: sel });

  useEffect(() => {
    if (!decision) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once per answer: the parent's callback is a fresh function each render.
  useEffect(() => {
    if (task.result?.kind === 'accent') onDecision(task.result.decision);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.result]);

  return (
    <section className={inDialog ? `${styles.accentPicker} ${styles.accentPickerInDialog}` : styles.accentPicker}>
      {inDialog ? (
        <h3 className={styles.accentQuestion}>{dishAndDrink ? 'Dish & Drink, or a Third Item?' : 'One Small Accent'}</h3>
      ) : (
        <h2>{dishAndDrink ? 'Dish & Drink, or a Third Item' : 'One Small Accent'}</h2>
      )}
      <p>
        {dishAndDrink
          ? 'Your dish and the Coca-Cola make a complete layout on their own. Add a plain paper napkin or a small accent for a third item, or keep it at two.'
          : 'An odd item count usually composes better, so here are small accents that belong with this meal. It’s a preference, not a rule. An accent is left out automatically if no layout has room for it.'}
      </p>
      <div className={styles.composition}>
        <div className={styles.compositionList}>
          <h3>Already on the Table{items ? ` · ${items.length} items` : ''}</h3>
          {items ? (
            <ul className={styles.tableItems}>
              {items.map((item, i) => (
                <li key={i}>
                  <span className={styles.tableKind}>{KIND_LABEL[item.kind]}</span>
                  <span className={styles.tableName}>
                    {itemName(
                      item,
                      sel,
                      items.some((x) => x.kind === 'shared-hero'),
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <SkeletonText rows={4} />
          )}
        </div>
        <div className={styles.compositionOptions}>
          <ChoiceCardGroup
            layout="list"
            detailsInline={inDialog}
            aria-label="Accent"
            value={cardValue}
            onChange={(id) => {
              if (id === NONE_ID) return onPick(null);
              if (id === NAPKIN_ID) return onNapkin();
              const o = decision?.options.find((x) => x.id === id);
              if (o) onPick(o.value);
            }}
            options={[
              {
                id: NONE_ID,
                value: NONE_ID,
                label: skipLabel,
                summary: dishAndDrink
                  ? 'Just the dish and the Coca-Cola, the drink tucked in tight at its right.'
                  : `Keep the table as it is${items ? `, ${items.length} items` : ''}. An even count is allowed, just a little less balanced.`,
                badge: 'No accent',
              },
              ...(napkinOffer
                ? [
                    {
                      id: NAPKIN_ID,
                      value: NAPKIN_ID,
                      label: 'Plain paper napkin',
                      summary: 'A folded white paper napkin beside the dish. The simplest way to make it three items.',
                      details: {
                        facts: [
                          { label: 'Item', value: 'Plain white paper napkin, no print, no cutlery' },
                          { label: 'In the image', value: 'Folded flat beside the dish, on the left' },
                        ],
                      },
                      badge: 'Simple',
                    },
                  ]
                : []),
              ...(decision?.options ?? []).map((o) => ({
                id: o.id,
                value: o.id,
                label: o.value.label,
                summary: o.value.detail,
                details: {
                  facts: [
                    { label: 'Item', value: o.value.name },
                    {
                      label: 'Vessel',
                      value: vesselLine(o.value.vessel, o.value.vesselStyle),
                    },
                    { label: 'In the image', value: o.value.promptText },
                  ],
                  ...splitSources(o.rationale),
                },
                badge: decision!.options.length > 1 && o.suggested ? 'Suggested' : undefined,
              })),
            ]}
          />
          <AgentStatus
            status={task.status}
            timing={task.timing}
            agentError={task.agentError}
            trpcError={task.trpcError}
            workingLabel="The cultural agent is picking an accent"
            onSignedIn={() => onSignedIn(load)}
            onRetry={load}
            skeletonCards={3}
            skeletonLayout="list"
          />
        </div>
      </div>
    </section>
  );
}
