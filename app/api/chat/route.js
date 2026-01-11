import { NextResponse } from "next/server";
import { getContext } from "../../../lib/rag/search";

function corsHeaders(request) {
  const allowOrigin = process.env.CHAT_API_ALLOW_ORIGIN || "*";
  const allowList = allowOrigin
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const origin = request?.headers?.get("origin") || "";
  const requestOrigin = allowList.includes("*")
    ? "*"
    : allowList.includes(origin)
    ? origin
    : "null";
  return {
    "Access-Control-Allow-Origin": requestOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400"
  };
}

export function OPTIONS(request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request) {
  const headers = corsHeaders(request);
  const expectedApiKey = process.env.CHAT_API_KEY || "";
  const providedApiKey = request.headers.get("x-api-key") || "";
  const origin = request?.headers?.get("origin") || "";
  const maskedProvidedKey = providedApiKey
    ? `${providedApiKey.slice(0, 4)}...${providedApiKey.slice(-4)}`
    : "(missing)";
  const maskedExpectedKey = expectedApiKey
    ? `${expectedApiKey.slice(0, 4)}...${expectedApiKey.slice(-4)}`
    : "(missing)";
  console.log("[/api/chat] origin:", origin);
  console.log("[/api/chat] api key:", maskedProvidedKey, "expected:", maskedExpectedKey);

  if (!expectedApiKey) {
    return NextResponse.json(
      { error: "Chat API key is not configured." },
      { status: 500, headers }
    );
  }

  if (!providedApiKey || providedApiKey !== expectedApiKey) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401, headers }
    );
  }

  const rawBody = await request.text();
  let body = {};
  try {
    body = JSON.parse(rawBody);
  } catch (e) {
    body = {};
  }
  const message = body.message ?? "";
  console.log("[/api/chat] body keys:", Object.keys(body || {}));
  console.log("[/api/chat] message length:", message.length);

  if (message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400, headers }
    );
  }

  const context = await getContext(message);
  console.log("[/api/chat] context length:", context.length);

  const systemMessage = {
    role: "system",
    content: `You are a helpful assistant. Use the following context to answer the user's question. If the context doesn't have the answer, say you don't know.
        Context:
        ${context}`
  };

  const userMessage = {
    role: "user",
    content: message
  };

  const baseUrl = (process.env.LITELLM_URL || "").replace(/\/+$/, "");
  const apiKey = process.env.LITELLM_API_KEY || "";
  const maskedLiteKey = apiKey
    ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`
    : "(missing)";

  // NEW (Temporary Test)
  //const apiKey = "sk-uab-secure-key-123";

  const model = process.env.LITELLM_MODEL || "gpt-4.1-nano";
  console.log("[/api/chat] litellm url:", baseUrl, "model:", model, "key:", maskedLiteKey);

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "LiteLLM is not configured." },
      { status: 500, headers }
    );
  }

  const url = `${baseUrl}/v1/chat/completions`;
  console.log("[/api/chat] sending to:", url);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [systemMessage, userMessage]
    })
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errorBody = await response.json();
      detail = errorBody?.error?.message || "";
    } catch {
      // Ignore parse errors to avoid masking the status.
    }
    console.log("[/api/chat] litellm error:", response.status, detail);

    return NextResponse.json(
      {
        error:
          detail || `LiteLLM request failed with status ${response.status}.`
      },
      { status: response.status, headers }
    );
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim() || "";

  return NextResponse.json(
    {
      reply: reply || "I couldn't generate a response right now."
    },
    { headers }
  );
}
