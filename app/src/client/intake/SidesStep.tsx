import { useEffect } from 'react';

import { STYLING_TIPS } from '../lib/stylingTips.ts';
import type { Decision, SidesChoice } from '../../shared/types.ts';
import type { Selections } from '../../shared/spec.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import { DecisionStep } from './DecisionStep.tsx';
import { keepCustom, useCustomOption } from './useCustomOption.ts';
import { vesselLine } from './optionText.ts';
import type { Brief } from './types.ts';

export function SidesStep({
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
  sel: Selections;
  decision: Decision<SidesChoice> | null;
  selected: SidesChoice | undefined;
  clearsNote: string | null;
  onDecision: (d: Decision<SidesChoice>) => void;
  onPick: (v: SidesChoice) => void;
  onNext: () => void;
}) {
  const task = useAgentTask('sides');
  const onSignedIn = useOnSignedIn();

  const load = () => task.run({ brief, selections: sel });

  useEffect(() => {
    if (!decision) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (task.result?.kind === 'sides') onDecision(keepCustom(task.result.decision, decision));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.result]);

  const custom = useCustomOption<SidesChoice>({
    kind: 'sides',
    brief,
    sel,
    decision,
    onDecision,
    onPick,
    describe: (v) =>
      `${v.label} — ${v.accompaniments.map((a) => `${a.name} (${a.role}, ${a.vessel}${a.vesselStyle ? `, ${a.vesselStyle}` : ''})`).join('; ')}`,
    extract: (r) => (r.kind === 'sides' ? r.decision.options[0] : undefined),
  });

  useEffect(() => {
    if (decision?.status === 'resolved' && !selected) onPick(decision.options[0]!.value);
  }, [decision, selected, onPick]);

  return (
    <DecisionStep<SidesChoice>
      title="Sides &amp; Accompaniments"
      intro={
        brief.sideDishRequest
          ? `Including your request for ${brief.sideDishRequest} where it fits.`
          : 'What this dish is usually served with here.'
      }
      clearsNote={clearsNote}
      status={task.status}
      timing={task.timing}
      agentError={task.agentError}
      trpcError={task.trpcError}
      workingTips={STYLING_TIPS.sides}
      workingLabel="Pulling together some side dishes, condiments and accompaniments to go with your main dish."
      decision={decision}
      selected={selected}
      isSame={(a, b) => a.label === b.label}
      renderOption={(v) => ({
        label: v.label,
        summary: v.detail || v.accompaniments.map((a) => a.name).join(' · ') || 'No sides',
        facts: v.accompaniments.map((a) => ({
          label: a.name,
          value: `${a.role} · ${vesselLine(a.vessel, a.vesselStyle)}${a.service === 'shared' ? ' · shared' : ''}`,
        })).concat(v.cutlery ? [{ label: 'Cutlery', value: v.cutlery.length ? v.cutlery.join(' and ') : 'None, eaten by hand' }] : []),
      })}
      onPick={onPick}
      onAskAgain={load}
      onSignedIn={() => onSignedIn(load)}
      onNext={onNext}
      custom={custom}
      customExample={'Describe what you would like to see, e.g. swap one side for a simple green salad'}
    />
  );
}
