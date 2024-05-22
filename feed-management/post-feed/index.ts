import { serve } from "https://deno.land/std@0.131.0/http/mod.ts";
import { createClient } from "https://esm.sh/@shaple/shaple@0.2.2";
import { jsonStringify } from "https://deno.land/x/stable_stringify@v0.2.1/jsonStringify.ts";
import { randomUUID } from "https://deno.land/std@0.110.0/node/crypto.ts";
import * as mod from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const requestBody = await req.formData();
    if (requestBody instanceof FormData === false) {
      return new Response("Invalid request body", { status: 400 });
    }

    const shaple = createClient(
      Deno.env.get('SHAPLE_URL') ?? '',
      Deno.env.get('SHAPLE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    let title = "";
    let description = "";
    let mediaFile = null;
    let mediaFileName = "";

    for (const pair of requestBody.entries()) {
      const field = pair[0];
      const val = pair[1];

      switch (field) {
        case "title":
          title = val.toString();
          break;
        case "description":
          description = val.toString();
          break;
        case "media_file":
          mediaFile = val;
          break;
        default:
          break;
      }
    }

    if (!title || !description) {
      return new Response("Missing title or description", { status: 400 });
    }

    if (mediaFile !== null && mediaFile instanceof File) {
      const fileName = randomUUID();
      const { data, error } = await shaple.storage
        .from("feed-medias")
        .upload(fileName, await mediaFile.arrayBuffer(), {
          cacheControl: '3600',
          upsert: false,
          contentType: mediaFile.type
        });

      mediaFileName = data.path;
      if (error) {
        throw error;
      }
    }

    const response = await shaple.from('feeds').insert({
      title: title,
      description: description,
      feed_media: mediaFileName,
    });

    if (response.error) { throw response.error; }

    return new Response("Request processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      jsonStringify({ message: "Failed to process request", error: error }),
    );
  }
});