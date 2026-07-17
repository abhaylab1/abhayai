// Single Worker entry point.
// Handles /api/chat itself; everything else falls through to your static
// site (index.html, tool pages, etc.) via the ASSETS binding.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat') {
      if (request.method === 'POST') {
        return handleChat(request, env);
      }
      return new Response('Method not allowed', { status: 405 });
    }

    // Everything else: serve the static site as before.
    return env.ASSETS.fetch(request);
  }
};

async function handleChat(request, env) {
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
      'HTTP-Referer': 'https://abhaylab.fun',
      'X-Title': 'AbhayAI'
    },
    body: JSON.stringify({ model, messages, stream: !!stream })
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json'
    }
  });
}
