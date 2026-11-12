import { useEffect } from 'react';

import type { Selections } from '../../shared/spec.ts';
import type { Decision, PrepChoice } from '../../shared/types.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { trpc } from '../trpc.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { DecisionStep } from './DecisionStep.tsx';
import { PrepPhoto } from './OptionPictures.tsx';
import { keepCustom, useCustomOption } from './useCustomOption.ts';
import { countryPhrase, isOrAre, placeName } from './optionText.ts';
import type { Brief } from './types.ts';

export function PrepStep({
  brief,
  sel,
  decision,
  selected,
  clearsNote,
  onDecision,
  onPick,
  onNext,
}: {
  brief: Brief;
  /** The scene comes first, so the agent knows where the dish is eaten. */
  sel: Selections;
  decision: Decision<PrepChoice> | null;
  selected: PrepChoice | undefined;
  clearsNote: string | null;
  onDecision: (d: Decision<PrepChoice>) => void;
  onPick: (v: PrepChoice) => void;
  onNext: () => void;
}) {
  const task = useAgentTask('prep');
  // The region's display name for the wait message; a typed region (not in the knowledge base) is used as written.
  const config = trpc.config.useQuery();
  const regionLabel = brief.region
    && config.data
      ? (config.data.countries.find((c) => c.id === brief.country)?.regions.find((r) => r.id === brief.region)?.label ?? brief.region)
      : undefined;
  const onSignedIn = useOnSignedIn();

  const load = () => task.run({ brief, selections: { scene: sel.scene } });

  useEffect(() => {
    if (!decision) load();
    // Only ever auto-load once per mount of this step (a fresh brief remounts it).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (task.result?.kind === 'prep') onDecision(keepCustom(task.result.decision, decision));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.result]);

  const custom = useCustomOption<PrepChoice>({
    kind: 'prep',
    brief,
    sel: { scene: sel.scene },
    decision,
    onDecision,
    onPick,
    describe: (v) => `${v.label} — ${v.detail}`,
    extract: (r) => (r.kind === 'prep' ? r.decision.options[0] : undefined),
  });

  useEffect(() => {
    if (decision?.status === 'resolved' && !selected) onPick(decision.options[0]!.value);
  }, [decision, selected, onPick]);

  return (
    <DecisionStep<PrepChoice>
      title="How Is It Prepared?"
      intro={`How ${brief.heroDish || 'the dish'} ${isOrAre(brief.heroDish || 'the dish')} prepared and enjoyed in ${brief.countryLabel ? countryPhrase(brief.countryLabel) : 'this country'}.`}
      clearsNote={clearsNote}
      status={task.status}
      timing={task.timing}
      agentError={task.agentError}
      trpcError={task.trpcError}
      workingLabel={`Gathering options to show how to best prepare your meal in ${placeName(brief.countryLabel, regionLabel)}.`}
      decision={decision}
      selected={selected}
      isSame={(a, b) => a.label === b.label}
      renderOption={(v) => ({
        label: v.label,
        summary: v.detail,
        media: brief.country && brief.heroDish ? (
          <PrepPhoto country={brief.country} countryLabel={brief.countryLabel} heroDish={brief.heroDish} label={v.label} promptText={v.promptText} />
        ) : undefined,
        facts: [
          { label: 'Silhouette', value: v.massClass },
          { label: 'In the image', value: v.promptText },
        ],
      })}
      onPick={onPick}
      onAskAgain={load}
      onSignedIn={() => onSignedIn(load)}
      onNext={onNext}
      custom={custom}
      customExample={'Describe what you would like to see, e.g. grilled instead of fried'}
    />
  );
}
