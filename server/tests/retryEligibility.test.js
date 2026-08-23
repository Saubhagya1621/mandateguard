import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRetryEligibility } from "../src/rules-engine/retryEligibility.js";

const NOW = new Date("2026-01-01T00:00:00Z");

test("eligible retry within max attempts, window starts after gap days", () => {
  const result = checkRetryEligibility({
    failureReason: "insufficient_funds",
    retryCount: 1,
    mandateExpiresAt: new Date("2026-02-01T00:00:00Z"),
    now: NOW,
  });

  assert.equal(result.eligible, true);
  assert.equal(result.attemptsRemaining, 2);
  assert.ok(result.window.start > NOW);
});

test("not eligible when max attempts already reached", () => {
  const result = checkRetryEligibility({
    failureReason: "bank_server_timeout",
    retryCount: 3,
    mandateExpiresAt: new Date("2026-02-01T00:00:00Z"),
    now: NOW,
  });

  assert.equal(result.eligible, false);
  assert.match(result.reason, /Max retry attempts/);
});

test("not eligible for non-retryable failure reason: mandate_expired", () => {
  const result = checkRetryEligibility({
    failureReason: "mandate_expired",
    retryCount: 0,
    mandateExpiresAt: new Date("2026-02-01T00:00:00Z"),
    now: NOW,
  });

  assert.equal(result.eligible, false);
  assert.match(result.reason, /not retryable/);
});

test("not eligible for non-retryable failure reason: account_frozen", () => {
  const result = checkRetryEligibility({
    failureReason: "account_frozen",
    retryCount: 0,
    mandateExpiresAt: new Date("2026-02-01T00:00:00Z"),
    now: NOW,
  });

  assert.equal(result.eligible, false);
});

test("unknown failure reason is rejected", () => {
  const result = checkRetryEligibility({
    failureReason: "alien_invasion",
    retryCount: 0,
    mandateExpiresAt: new Date("2026-02-01T00:00:00Z"),
    now: NOW,
  });

  assert.equal(result.eligible, false);
  assert.match(result.reason, /Unknown failure reason/);
});

test("edge case: mandate expires before gap-day window opens", () => {
  const result = checkRetryEligibility({
    failureReason: "insufficient_funds",
    retryCount: 0,
    mandateExpiresAt: new Date("2026-01-02T00:00:00Z"), // only 1 day away, gap is 3 days
    now: NOW,
  });

  assert.equal(result.eligible, false);
  assert.match(result.reason, /expires before/);
});

test("edge case: mandate already at max retries and near expiry", () => {
  const result = checkRetryEligibility({
    failureReason: "daily_limit_hit",
    retryCount: 3,
    mandateExpiresAt: new Date("2026-01-02T00:00:00Z"),
    now: NOW,
  });

  assert.equal(result.eligible, false);
});