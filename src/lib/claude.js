/**
 * src/lib/claude.js
 * Claude API wrapper.
 *
 * IMPORTANT: In production, never call the Claude API directly from the client.
 * All Claude calls must go through a Supabase Edge Function so the API key
 * stays server-side only.
 *
 * Usage during dev (VITE_CLAUDE_API_KEY in .env) will proxy directly only if
 * explicitly enabled — switch to Edge Function before going live.
 */

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

/**
 * Personalise the content feed for a user based on their wellness profile.
 * Returns an ordered list of article IDs.
 *
 * @param {object} profile  - User profile (goals, preferences, age_range)
 * @param {object[]} articles - Array of article metadata objects
 * @returns {Promise<string[]>} Ordered article IDs
 */
export async function personaliseFeed(profile, articles) {
  const prompt = `You are a wellness content curator for My Sista, an app for women aged 25-45.

User profile:
- Age range: ${profile.age_range}
- Wellness goals: ${profile.wellness_goals?.join(', ')}
- Content preferences: ${profile.content_preferences?.join(', ')}

Available articles (JSON):
${JSON.stringify(articles.map(a => ({ id: a.id, title: a.title, category: a.category, tags: a.tags })), null, 2)}

Return a JSON array of article IDs ordered by relevance for this user. Include all IDs.
Return ONLY valid JSON — no markdown, no explanation.`;

  try {
    const response = await callClaude([{ role: 'user', content: prompt }]);
    return JSON.parse(response);
  } catch (err) {
    console.error('[Claude] Feed personalisation failed:', err);
    // Fallback: return articles in original order
    return articles.map(a => a.id);
  }
}

/**
 * Generate a Sista AI companion response.
 * @param {string} userMessage
 * @param {object[]} history - Previous messages [{role, content}]
 * @returns {Promise<string>}
 */
export async function sistaAIChat(userMessage, history = []) {
  const systemPrompt = `You are Sista AI — a warm, knowledgeable wellness companion for women aged 25-45.
You give practical, evidence-based advice on nutrition, mental health, fitness, hormonal health, and relationships.
Keep responses conversational, supportive, and under 200 words unless asked for detail.
Never diagnose medical conditions — always recommend professional consultation for health concerns.
You speak with warmth and confidence — like a trusted older sister who has done the research.`;

  const messages = [
    ...history.slice(-8), // last 8 messages for context
    { role: 'user', content: userMessage },
  ];

  return callClaude(messages, systemPrompt);
}

// ─── Core Claude caller ───────────────────────────────────────────────────────

async function callClaude(messages, system = '') {
  // In production: route through Edge Function
  const edgeFunctionUrl = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`
    : null;

  if (edgeFunctionUrl) {
    const { supabase } = await import('./supabase.js');
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ messages, system, model: CLAUDE_MODEL }),
    });

    if (!res.ok) throw new Error(`Edge function error: ${res.statusText}`);
    const json = await res.json();
    return json.content;
  }

  throw new Error('[Claude] No Edge Function URL configured. Cannot call Claude API from client.');
}
