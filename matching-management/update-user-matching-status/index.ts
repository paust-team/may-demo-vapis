import { serve } from "https://deno.land/std@0.131.0/http/mod.ts";
import { createClient } from "https://esm.sh/@shaple/shaple@0.2.2";
import { jsonStringify } from "https://deno.land/x/stable_stringify@v0.2.1/jsonStringify.ts";
import * as mod from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

serve(async (req: Request) => {
  try {
    if (req.method !== 'PATCH') {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const requestBody = await req.json();
    const status = requestBody["status"];

    if (typeof status !== 'boolean') {
      return new Response("Missing status", { status: 400 });
    }

    const shaple = createClient(
      Deno.env.get('SHAPLE_URL') ?? '',
      Deno.env.get('SHAPLE_ADMIN_KEY') ?? '',
    );

    const token = req.headers.get('Authorization').replace('Bearer ', '')
    const { data: { user } } = await shaple.auth.getUser(token);
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const response = await shaple.auth.admin.updateUserById(user.id, {
      user_metadata: {
        matching_status: status ? 'active' : 'inactive',
      }
    });
    if (response.error) { throw response.error; }

    return new Response(
      jsonStringify(response.data),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      jsonStringify({ message: "Failed to process request", error: error }),
    );
  }
})