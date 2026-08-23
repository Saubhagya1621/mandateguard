const SALARY_WINDOW_DAYS = [1, 2, 3, 28, 29, 30, 31];

function simulateRetryOutcome(scheduledFor) {
  const dayOfMonth = new Date(scheduledFor).getDate();
  const isNearSalaryDate = SALARY_WINDOW_DAYS.includes(dayOfMonth);

  const successProbability = isNearSalaryDate ? 0.75 : 0.4;

  const roll = Math.random();
  const success = roll < successProbability;

  return {
    outcome: success ? "success" : "failed",
    failureReason: success ? null : "insufficient_funds",
  };
}

export { simulateRetryOutcome };