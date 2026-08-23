const RETRY_RULES = {
  insufficient_funds: { maxAttempts: 3, gapDays: 3 },
  mandate_expired: { maxAttempts: 0, gapDays: null },
  bank_server_timeout: { maxAttempts: 3, gapDays: 1 },
  account_frozen: { maxAttempts: 0, gapDays: null },
  daily_limit_hit: { maxAttempts: 3, gapDays: 1 },
  other: { maxAttempts: 2, gapDays: 2 },
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Determines whether a mandate is eligible for retry, and if so, the allowed window.
 * Pure function: no DB calls, no AI calls, no side effects.
 *
 * @param {Object} params
 * @param {string} params.failureReason - one of the RETRY_RULES keys
 * @param {number} params.retryCount - number of retries already attempted
 * @param {Date} params.mandateExpiresAt - when the mandate itself expires
 * @param {Date} [params.now] - override for current time (testing)
 * @returns {Object} eligibility result
 */
function checkRetryEligibility({ failureReason, retryCount, mandateExpiresAt, now = new Date() }) {
  const rule = RETRY_RULES[failureReason];

  if (!rule) {
    return {
      eligible: false,
      reason: `Unknown failure reason: ${failureReason}`,
    };
  }

  if (rule.maxAttempts === 0) {
    return {
      eligible: false,
      reason: `Failure reason "${failureReason}" is not retryable under compliance rules.`,
    };
  }

  if (retryCount >= rule.maxAttempts) {
    return {
      eligible: false,
      reason: `Max retry attempts (${rule.maxAttempts}) reached for reason "${failureReason}".`,
    };
  }

  const windowStart = new Date(now.getTime() + rule.gapDays * MS_PER_DAY);

  if (windowStart >= mandateExpiresAt) {
    return {
      eligible: false,
      reason: "Mandate expires before the mandatory gap-day window opens.",
    };
  }

  const windowEnd = mandateExpiresAt;

  return {
    eligible: true,
    window: { start: windowStart, end: windowEnd },
    attemptsRemaining: rule.maxAttempts - retryCount,
  };
}

export { checkRetryEligibility, RETRY_RULES };