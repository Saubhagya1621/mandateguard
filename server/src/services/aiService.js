const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Suggests an optimal retry timestamp within the compliance-allowed window.
 * Returns null on any failure — caller must fall back to window.start.
 */
async function suggestRetryTiming({ windowStart, windowEnd, failureReason, retryCount }) {
  const prompt = `You are assisting a compliance-first payment retry system.
A mandate failed due to: ${failureReason}.
It has been retried ${retryCount} time(s) before.
The ONLY allowed retry window is from ${windowStart} to ${windowEnd} (ISO timestamps).

Suggest a single optimal retry timestamp strictly within this window, considering that payments
succeed more often near salary dates (month-start or month-end).

Respond with ONLY a valid ISO 8601 timestamp, nothing else. No explanation, no extra text.`;

  try {
    const raw = await callGroq([{ role: "user", content: prompt }]);
    const suggested = new Date(raw);

    if (isNaN(suggested.getTime())) {
      return null;
    }

    return suggested;
  } catch (error) {
    console.error("AI timing suggestion failed:", error.message);
    return null;
  }
}

/**
 * Generates a one-line plain-language audit note explaining the retry timing choice.
 * Returns a safe default string on any failure.
 */
async function generateAuditNote({ chosenTime, failureReason, wasAiSuggested }) {
  if (!wasAiSuggested) {
    return `Retry scheduled for ${chosenTime.toISOString()} at the earliest compliance-allowed time (AI suggestion unavailable or out of window).`;
  }

  const prompt = `Write ONE short plain-language sentence (under 25 words) explaining why a payment retry
was scheduled for ${chosenTime.toISOString()}, given the original failure reason: ${failureReason}.
This will appear in an audit log for a compliance officer. No preamble, just the sentence.`;

  try {
    const note = await callGroq([{ role: "user", content: prompt }]);
    if (!note || note.trim().length === 0) {
      return `Retry scheduled for ${chosenTime.toISOString()}. (AI returned an empty response.)`;
    }
    return note;
  } catch (error) {
    console.error("AI audit note generation failed:", error.message);
    return `Retry scheduled for ${chosenTime.toISOString()}. (Audit note generation unavailable.)`;
  }
}

export { suggestRetryTiming, generateAuditNote };