export default {
    async fetch(request, env) {
      // Check if request is using correct method
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }
  
      // Check for API key in Authorization header
      const authHeader = request.headers.get('Authorization');
      
      // Validate the API key
      if (!authHeader || authHeader !== `Bearer ${env.API_KEY}`) {
        return new Response("Unauthorized: Invalid or missing API key", { status: 401 });
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
        const img = Uint8Array.from(binaryString, (m) => m.codePointAt(0));
        
        return new Response(img, {
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });
      } catch (error) {
        return new Response(`Error generating image: ${error.message}`, { status: 500 });
      }
    },
  };