import { StockDataWithTime } from "$lib/checker.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
const current_avails = new Map<string, StockDataWithTime>();
if (IS_BROWSER) {
  const eventSource: EventSource = new EventSource("/api/realtime");
  const callback = (msg: MessageEvent) => {
    const actual_data = Object.entries(JSON.parse(msg.data));
    console.debug(actual_data);
    actual_data.forEach(([code, data]) => {
      current_avails.set(code, data as StockDataWithTime);
    });
    globalThis.dispatchEvent(new Event("avail_data_changed"));
  };
  eventSource.addEventListener("message", callback);
}

export function get_avali_isl(code: string) {
  return current_avails.get(code);
}
