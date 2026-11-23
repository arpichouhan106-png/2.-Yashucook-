import { supabase } from './supabaseClient';

const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (url.includes('/api/videos') && (!init || init.method === 'GET' || !init.method)) {
    const { data, error } = await supabase.from('videos').select('*').order('id', { ascending: false });
    if (!error && data && data.length > 0) {
      return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (url.includes('/api/videos') && init?.method === 'POST' && init.body) {
    try {
      const body = JSON.parse(init.body as string);
      const { data, error } = await supabase.from('videos').insert([{
        title: body.title || 'New Recipe',
        video_type: body.type || 'short',
        video_url: body.video_url || '',
        views: 0
      }]).select();
      if (!error) {
        return new Response(JSON.stringify(data?.[0] || { success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    } catch (e) {}
  }

  return originalFetch(input, init);
};
