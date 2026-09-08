'use strict';

/**
 * ExternalAIAgent
 *
 * Simulates an external AI agent proposing actions into the A-24 gate stack.
 * propose()        — deterministic (no network); use for scenario/unit tests
 * proposeWithLLM() — calls a real LLM; provider selected via AI_PROVIDER env var
 *
 * AI_PROVIDER: openai | anthropic | gemini
 * Keys:        OPENAI_API_KEY | ANTHROPIC_API_KEY | GEMINI_API_KEY
 */

const SYSTEM_PROMPT = `You are an AI agent operating inside a governed system.
Your task is to propose a single, specific action based on the user prompt.
Respond with ONLY a JSON object (no markdown fences, no commentary) with these fields:
{
  "actionId": "<short-snake-case action name, max 32 chars>",
  "sourceDomain": "<your domain, max 16 chars>",
  "targetDomain": "<target domain, max 16 chars>",
  "payloadSummary": "<one sentence describing what you're doing>"
}
Domains must be one of: ANALYTICS, BILLING, COMMS, DATA, INFRA, MEDICAL, RECORDS, REPORTS, SYSTEM.`;

async function callOpenAI(prompt) {
  const { OpenAI } = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    max_tokens: 200,
    temperature: 0,
  });
  return response.choices[0].message.content.trim();
}

async function callAnthropic(prompt) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].text.trim();
}

async function callGemini(prompt) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(
    `${SYSTEM_PROMPT}\n\nUser request: ${prompt}`
  );
  return result.response.text().trim();
}

function parseLLMResponse(raw, agentId, capability) {
  // Strip markdown code fences if LLM added them despite instructions
  const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM returned non-JSON response: ${raw}`);
  }
  return {
    actorId: agentId,
    actionId: String(parsed.actionId || 'llm-action').slice(0, 32).trim(),
    sourceDomain: String(parsed.sourceDomain || 'SYSTEM').slice(0, 16).trim(),
    targetDomain: String(parsed.targetDomain || 'SYSTEM').slice(0, 16).trim(),
    requestedCapability: capability,
    payloadSummary: parsed.payloadSummary || '',
    timestamp: new Date().toISOString(),
    provider: process.env.AI_PROVIDER || 'unknown',
  };
}

class ExternalAIAgent {
  constructor(id) {
    this.id = id;
    this.memory = [];
  }

  /**
   * Deterministic proposal — no network call. Use for scenario/unit tests.
   */
  propose({ source, payload, capability }) {
    return {
      actorId: this.id,
      source,
      payload,
      requestedCapability: capability,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * LLM-backed proposal. The LLM generates the action shape; A-24 gates it.
   * Provider selected by AI_PROVIDER env var (openai | anthropic | gemini).
   * @param {{ prompt: string, capability: number }} opts
   * @returns {Promise<object>} Structured proposal compatible with A-24 gates
   */
  async proposeWithLLM({ prompt, capability }) {
    const provider = (process.env.AI_PROVIDER || '').toLowerCase();
    let raw;
    switch (provider) {
      case 'openai':
        raw = await callOpenAI(prompt);
        break;
      case 'anthropic':
        raw = await callAnthropic(prompt);
        break;
      case 'gemini':
        raw = await callGemini(prompt);
        break;
      default:
        throw new Error(
          `AI_PROVIDER must be set to openai, anthropic, or gemini. Got: "${provider}"`
        );
    }
    return parseLLMResponse(raw, this.id, capability);
  }

  observe(result) {
    this.memory.push(result);
  }
}

module.exports = { ExternalAIAgent };