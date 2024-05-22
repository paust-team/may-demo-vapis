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
    const page = url.searchParams.get('page') ?? 1;
    const pageSize = url.searchParams.get('page_size') ?? 10;

    const shaple = createClient(
      Deno.env.get('SHAPLE_URL') ?? '',
      Deno.env.get('SHAPLE_ANON_KEY') ?? '',
    );

    const { data, error } = await shaple
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, (page) * pageSize);

    if (error) {
      console.error("Error fetching feeds:", error);
      return { data: [], count: 0, page, pageSize };
    }

    return new Response(
      jsonStringify({
        data,
        page: page,
        pageSize: pageSize,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      jsonStringify({ message: "Failed to process request", error: error }),
    );
  }
});