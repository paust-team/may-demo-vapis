import { serve } from "https://deno.land/std@0.131.0/http/mod.ts";
import { createClient } from "https://esm.sh/@shaple/shaple@0.2.2";
import { jsonStringify } from "https://deno.land/x/stable_stringify@v0.2.1/jsonStringify.ts";
import * as mod from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== 'GET') {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    if (!userId) {
      return new Response("Missing user-id", { status: 400 });
    }

    const shaple = createClient(
      Deno.env.get('SHAPLE_URL') ?? '',
      Deno.env.get('SHAPLE_ADMIN_KEY') ?? '',
    );

    const { data, error } = await shaple.auth.admin.getUserById(userId);
    if (error) { throw error; }

    return new Response(
      jsonStringify({
        user_name: data.user?.user_metadata?.user_name,
        full_name: data.user?.user_metadata?.full_name,
        avatar_url: data.user?.user_metadata?.avatar_url,
        email: data.user?.email,
        phone: data.user?.phone,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      jsonStringify({ message: "Failed to process request", error: error }),
    );
  }
});