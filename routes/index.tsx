import region_data from "$data/regions.json" with { type: "json" };
import CountryIsland from "../islands/CountryIsland.tsx";
import { get_avail } from "$lib/checker.ts";

export default function Home() {
  const region_items = region_data.map((x) => (
    <tr>
      <CountryIsland dat={{ ...x, avali: get_avail(x.code) }} />
    </tr>
  ));
  return (
    <>
      <h1 class="text-5xl flex justify-center items-center py-10 font-bold">
        Welcome to the Valve Index Checker
      </h1>

      <span class={"justify-center items-center flex flex-col"}>
        <table class="text-left grow bg-gradient-to-br from-slate-900 to-emerald-900   to-95% text-2xl rounded border-rose-30">
          <thead class="rounded bg-slate-950">
            <tr class="rounded">
              <th
                scope="col"
                class="border-rose-300 pl-3 pr-10 border-2 rounded-full"
              >
                Availability
              </th>
              <th
                scope="col"
                class=" border-rose-300 border-2 pr-36 pl-3 rounded"
              >
                Region
              </th>
              <th
                scope="col"
                class=" border-rose-300 pl-3 border-2 pr-20 rounded"
              >
                Price
              </th>
              <th
                scope="col"
                class=" border-rose-300 pl-3 border-2 pr-14 rounded"
              >
                Last Checked
              </th>
            </tr>
          </thead>
          <tbody class={"grow"}>
            {region_items}
          </tbody>
        </table>
      </span>
    </>
  );
}
