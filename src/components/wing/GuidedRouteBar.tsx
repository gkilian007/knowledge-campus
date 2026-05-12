type GuidedRouteStep = {
  id: string;
  title: string;
  label: string;
  note: string;
  state: 'complete' | 'current' | 'upcoming';
};

interface GuidedRouteBarProps {
  steps: GuidedRouteStep[];
}

const stateStyles: Record<GuidedRouteStep['state'], string> = {
  complete: 'border-campus-blue/20 bg-white/80 text-campus-ink shadow-sm',
  current: 'border-campus-blue bg-campus-blue text-white shadow-lg shadow-campus-blue/20',
  upcoming: 'border-campus-ink/10 bg-campus-paper/70 text-campus-ink/70',
};

const badgeStyles: Record<GuidedRouteStep['state'], string> = {
  complete: 'bg-campus-blue/10 text-campus-blue',
  current: 'bg-white/20 text-white',
  upcoming: 'bg-campus-ink/10 text-campus-ink/60',
};

export function GuidedRouteBar({ steps }: GuidedRouteBarProps) {
  return (
    <div className="rounded-[28px] border border-campus-ink/10 bg-white/75 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-campus-blue">
            Guided route
          </p>
          <p className="mt-1 text-sm text-campus-ink/70">
            A clear first pass from orientation to a usable AI output.
          </p>
        </div>
        <div className="rounded-full border border-campus-ink/10 bg-campus-paper px-3 py-1 text-xs font-medium text-campus-ink/60">
          {steps.length} rooms
        </div>
      </div>

      <ol className="grid gap-3 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.id} className="relative">
            {index < steps.length - 1 ? (
              <span className="absolute left-[calc(100%-0.75rem)] top-6 hidden h-px w-6 bg-campus-blue/20 lg:block" />
            ) : null}
            <div className={`h-full rounded-[24px] border p-4 transition ${stateStyles[step.state]}`}>
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${badgeStyles[step.state]}`}>
                  {step.label}
                </span>
                <span className="text-xs font-medium opacity-70">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 opacity-80">{step.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export type { GuidedRouteStep };
