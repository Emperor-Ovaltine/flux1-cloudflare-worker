import { ExportedHandler } from '@cloudflare/workers-types';

export interface Env {
  AI: any; // Cloudflare AI binding
  API_KEY: string; // API key for authorization
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Check if request is coming from Discord
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.substring('Bearer '.length);

    if (token !== env.API_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      // Parse the incoming JSON from Discord
      const data = await request.json();
      const prompt = data.prompt || "a cyberpunk lizard";

      // Run the AI model to generate the image
      const response = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
        prompt: prompt,
      });

      // Convert from base64 string
      const binaryString = atob(response.image);
      // Create byte representation
      const img = Uint8Array.from(binaryString, (m) => m.charCodeAt(0));
      
      return new Response(img, {
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });
    } catch (error) {
      return new Response(`Error generating image: ${error.message}`, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
