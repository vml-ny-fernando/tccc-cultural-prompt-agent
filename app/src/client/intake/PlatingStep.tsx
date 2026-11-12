import { useEffect } from 'react';

import type { Decision, PlatingChoice } from '../../shared/types.ts';
import { useAgentTask } from '../lib/useAgentTask.ts';
import { useOnSignedIn } from '../lib/useOnSignedIn.ts';
import type { Selections } from '../../shared/spec.ts';
import { DecisionStep } from './DecisionStep.tsx';
import { PlatingSketch } from './OptionPictures.tsx';
import { keepCustom, useCustomOption } from './useCustomOption.ts';
import { vesselName } from './optionText.ts';
import type { Brief } from './types.ts';

export function PlatingStep({
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
  decision: Decision<PlatingChoice> | null;
  selected: PlatingChoice | undefined;
  clearsNote: string | null;
  onDecision: (d: Decision<PlatingChoice>) => void;
  onPick: (v: PlatingChoice) => void;
  onNext: () => void;
}) {
  const task = useAgentTask('plating');
  const onSignedIn = useOnSignedIn();

  const load = () => task.run({ brief, selections: sel });

  useEffect(() => {
    if (!decision) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (task.result?.kind === 'plating') onDecision(keepCustom(task.result.decision, decision));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.result]);

  const custom = useCustomOption<PlatingChoice>({
    kind: 'plating',
    brief,
    sel,
    decision,
    onDecision,
    onPick,
    describe: (v) => `${v.label} — ${v.detail} (${v.vessel}${v.vesselStyle ? `, ${v.vesselStyle}` : ''}, ${v.service} service)`,
    extract: (r) => (r.kind === 'plating' ? r.decision.options[0] : undefined),
  });

  useEffect(() => {
    if (decision?.status === 'resolved' && !selected) onPick(decision.options[0]!.value);
  }, [decision, selected, onPick]);

  return (
    <DecisionStep<PlatingChoice>
      title="How Is It Served?"
      intro="The most common way this dish reaches the table."
      clearsNote={clearsNote}
      status={task.status}
      timing={task.timing}
      agentError={task.agentError}
      trpcError={task.trpcError}
      workingLabel="We are pulling options to best serve this dish."
      decision={decision}
      selected={selected}
      isSame={(a, b) => a.label === b.label}
      renderOption={(v) => ({
        label: v.label,
        summary: v.detail,
        media: <PlatingSketch vessel={v.vessel} massClass={sel.prep?.massClass} label={v.label} />,
        facts: [
          { label: 'Vessel', value: vesselName(v.vessel) },
          ...(v.vesselStyle ? [{ label: 'Material', value: v.vesselStyle }] : []),
          {
            label: 'Service',
            value: v.service === 'shared' ? 'Family-style: the shared vessel plus one plated portion' : 'Individual plate',
          },
          { label: 'In the image', value: v.promptText },
        ],
      })}
      onPick={onPick}
      onAskAgain={load}
      onSignedIn={() => onSignedIn(load)}
      onNext={onNext}
      custom={custom}
      customExample={'Describe what you would like to see, e.g. served on a wooden board'}
    />
  );
}
