import { NextResponse } from "next/server";

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

  const body = await request.json().catch(() => ({}));
  const message = body.message ?? "";

  if (!message.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400, headers }
    );
  }

  const baseUrl = (process.env.LITELLM_URL || "").replace(/\/+$/, "");
  const apiKey = process.env.LITELLM_API_KEY || "";
  console.log("apikey:", apiKey);

  // NEW (Temporary Test)
  //const apiKey = "sk-uab-secure-key-123";

  const model = process.env.LITELLM_MODEL || "gpt-4o";

  if (!baseUrl || !apiKey) {
    return NextResponse.json(
      { error: "LiteLLM is not configured." },
      { status: 500, headers }
    );
  }

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: message }]
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
