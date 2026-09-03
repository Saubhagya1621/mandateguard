const STEPS = [
  { key: "failure_ingested", label: "Failure" },
  { key: "compliance_checked", label: "Compliance Check" },
  { key: "ai_suggestion_generated", label: "AI Suggestion" },
  { key: "retry_executed", label: "Executed" },
];

function MandateTimeline({ logs }) {
  const completedActions = new Set(logs.map((log) => log.action));

  const lastCompletedIndex = STEPS.reduce((acc, step, i) => {
    return completedActions.has(step.key) ? i : acc;
  }, -1);

  return (
    <div className="flex items-center mb-10">
      {STEPS.map((step, i) => {
        const isDone = i <= lastCompletedIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  isDone ? "bg-ink border-ink" : "bg-card border-line"
                }`}
              />
              <p
                className={`text-[10px] font-mono uppercase tracking-wider mt-2 text-center whitespace-nowrap ${
                  isDone ? "text-ink" : "text-ink-muted"
                }`}
              >
                {step.label}
              </p>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-px mx-2 -mt-4 ${
                  i < lastCompletedIndex ? "bg-ink" : "bg-line"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MandateTimeline;