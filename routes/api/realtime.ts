import { Handlers } from "$fresh/server.ts";
import { get_avails } from "$lib/checker.ts";

export const handler: Handlers = {
  GET(_req, _ctx) {
    let callback: EventListenerOrEventListenerObject;
    const body = new ReadableStream({
      async start(controller) {
        const x = async () => {
          const avails = await get_avails();
          console.log(Object.fromEntries(avails));
          try {
            controller.enqueue(
              `data: ${JSON.stringify(Object.fromEntries(avails))}\n\n`,
            );
          } catch {
            // I do not really care about the data not being enqueued as that just seems to happen
          }
        };
        callback = () => {
          //runs when availabilities are updated
          x();
        };
        await x();
        globalThis.addEventListener("updated_avails", callback);
      },
      cancel() {
        globalThis.removeEventListener("updated_avails", callback);
      },
    });
    return new Response(body.pipeThrough(new TextEncoderStream()), {
      headers: { "content-type": "text/event-stream" },
    });
  },
};
