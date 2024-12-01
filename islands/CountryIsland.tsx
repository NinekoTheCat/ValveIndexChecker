import { StockDataWithTime } from "$lib/checker.ts";
import { useEffect, useState } from "preact/hooks";
import { get_avali_isl } from "$island-lib/client_checker.ts";
export default function ({
  dat,
}: {
  dat: {
    code: string;
    name: string;
    currency: string;
    avali: StockDataWithTime | null;
  };
}) {
  const [data, setData] = useState(dat);
  const onDataChange = () => {
    const data2 = get_avali_isl(data.code);
    if (JSON.stringify(data2) !== JSON.stringify(data.avali) && data2) {
      setData({ ...data, avali: data2 });
      console.log(data2);
    }
  };
  useEffect(() => {
    globalThis.addEventListener("avail_data_changed", onDataChange);
    return () => {
      globalThis.removeEventListener("avail_data_changed", onDataChange);
    };
  }, []);
  return (
    <>
      <td
        class="text-center border content-center flex justify-start pl-2"
        scope="row"
        alt={`a ${data.avali?.in_stock ? "green" : "red"} circle`}
        title="this circle represents if the product is available or not in the selected region, green for available and red for not available"
      >
        <svg
          class="h-10 w-10"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            shapeRendering="geometricPrecision"
            cx="25"
            cy="25"
            r="25"
            fill={data.avali?.in_stock ? "#8bc34a" : "#e64a19"}
          />
        </svg>
      </td>
      <td class="border pl-3">{data.name ?? "Unknown"}</td>
      <td scope="row" class="border pl-3">
        {data.avali?.price
          ? data.avali!.price!.toLocaleString(navigator.language, {
            currency: data.currency,
            style: "currency",
          })
          : "Unknown"}
      </td>
      <td scope="row" class="border pl-3">
        {data.avali?.last_checked
          ? new Date(data.avali?.last_checked).toLocaleString(
            navigator.language,
            { timeStyle: "short", dateStyle: "short" },
          )
          : "N/A"}
      </td>
    </>
  );
}
