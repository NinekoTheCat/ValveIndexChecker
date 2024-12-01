import * as cheerio from "https://esm.sh/cheerio@1.0.0";
import * as interval_async from "npm:set-interval-async";
import region_data from "$data/regions.json" with { type: "json" };
const current_avails = new Map<string, StockDataWithTime>();
let interval_id: undefined | interval_async.SetIntervalAsyncTimer<[]>;
export async function check_for_data() {
  console.info("checking for data...");
  const avails_to_check: Promise<[StockData, string] | null>[] = [];
  region_data.forEach((x) =>
    avails_to_check.push(get_aval_of_item_with_code(
      "https://store.steampowered.com/sub/354231",
      x.code,
    ))
  );
  const results = await Promise.allSettled(avails_to_check);
  results.forEach((x) => {
    if (x.status === "rejected" || x.value === null) {
      return;
    }
    const [price_data, country_code] = x.value;
    current_avails.set(country_code, {
      ...price_data,
      last_checked: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)),
    });
  });
  console.info("data found!", current_avails);
  globalThis.dispatchEvent(new Event("updated_avails"));
}
export async function setup_data_checking() {
  await check_for_data();
  /// check every 5 seconds
  interval_id = interval_async.setIntervalAsync(check_for_data, 5000);
}

async function get_aval_of_item_with_code(
  url: string,
  cc: string,
): Promise<[StockData, string] | null> {
  const res = await get_aval_of_item(url, cc);
  return res ? [res, cc] : null;
}

async function get_aval_of_item(
  url: string,
  cc: string,
): Promise<StockData | null> {
  const valve_current_website_rsp = await fetch(
    url + "?" + new URLSearchParams({
      cc: cc,
    }),
  );
  const valve_body = await valve_current_website_rsp.text();

  const $ = cheerio.load(valve_body);
  const buy_button_body = $(
    `.game_purchase_action > .game_purchase_action_bg:eq(2)`,
  );
  const data = buy_button_body.extract({
    price: {
      selector: ".price",
      value: "data-price-final",
    },
    stock: ".btn_addtocart > .btn_medium > span",
  });
  console.info("data is", data);
  const price = data.price !== undefined
    ? Number.parseInt(data.price) / 100
    : null;
  const stock = data.stock;
  if (stock === undefined) {
    console.error(
      "cannot get data",
      data,
      $.html(),
      buy_button_body.html(),
    );
    return null;
  }
  const data_obj: StockData = {
    price: price,
    in_stock: stock !== "Out of Stock",
  };
  console.info("parsed data is", data_obj);

  return data_obj;
}

export interface StockData {
  /**  price in local currency */
  price: number | null;
  /**  true if item is in stock */
  in_stock: boolean;
}
export interface StockDataWithTime extends StockData {
  /** time when data was checked */
  last_checked: Date;
}

export function get_avail(
  code: string,
): StockDataWithTime | null {
  if (interval_id === undefined) {
    setup_data_checking();
  }
  const avail = current_avails.get(code);
  return avail ? avail : null;
}

export async function get_avails(): Promise<Map<string, StockDataWithTime>> {
  if (interval_id === undefined) {
    await setup_data_checking();
  }
  return current_avails;
}
