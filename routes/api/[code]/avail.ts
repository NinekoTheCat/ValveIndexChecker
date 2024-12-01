import { FreshContext } from "$fresh/server.ts";
import { get_avail } from "$lib/checker.ts";

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const body = await get_avail(
    encodeURIComponent(_ctx.params.code.slice(0, 2)),
  );
  return new Response(JSON.stringify(body));
};
