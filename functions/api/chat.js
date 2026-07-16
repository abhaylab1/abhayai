// Cloudflare Pages Function
// Lives at /functions/api/chat.js -> reachable at https://yoursite.com/api/chat
//
// This is the ONLY place your OpenRouter key should exist. It is read from
// an environment variable (set in the Cloudflare dashboard as a secret),
// never from a file you commit to your repo.

export async function onRequestPost(context) {
  const { request, env } = context;

  // Basic origin check so randoms can't hammer your key from other sites.
  // Not bulletproof (headers can be spoofed by non-browser clients), but it
  // stops casual abuse. Swap in real auth (Firebase ID token check) later.
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = [
    'https://abhaylab.fun',
    'https://www.abhaylab.fun'
  ];
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Only forward the fields we expect; ignore anything else the client sends.
  const { model, messages, stream } = body;
  if (!model || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'model and messages are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured: missing API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + env.OPENROUTER_API_KEY,
      // OpenRouter likes these set, some free models require a referer:
      'HTTP-Referer': 'https://abhaylab.fun',
      'X-Title': 'AbhayAI'
    },
    body: JSON.stringify({ model, messages, stream: !!stream })
  });

  // Stream the response straight through so your existing streaming UI
  // code in index.html keeps working unchanged.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json'
    }
  });
}

// Reject other methods explicitly (GET, etc.)
export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405 });
}
