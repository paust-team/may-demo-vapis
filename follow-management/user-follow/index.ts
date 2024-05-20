import { serve } from "https://deno.land/std@0.131.0/http/mod.ts";
import { createClient } from "https://esm.sh/@shaple/shaple@0.2.2";
import { jsonStringify } from "https://deno.land/x/stable_stringify@v0.2.1/jsonStringify.ts";
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

    const requestBody = await req.json();
    const userId = requestBody["user_id"];
    const targetUserId = requestBody["target_user_id"];
    if (!userId || !targetUserId) {
      return new Response("Missing user-id or target-user", { status: 400 });
    }

    const shaple = createClient(
      Deno.env.get('SHAPLE_URL') ?? '',
      Deno.env.get('SHAPLE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await shaple.auth.getUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (user.id !== userId) {
      return new Response("Invalid user-id", { status: 400 });
    }

    const selectResponse = await shaple.from('follow')
      .select()
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)
      .limit(1);

    if (selectResponse.error) { throw selectResponse.error; }
    if (selectResponse.data && selectResponse.data.length > 0) {
      return new Response("Already following user", { status: 400 });
    }

    const response = await shaple.from('follow').insert({
      target_user_id: targetUserId,
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