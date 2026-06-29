import { schedules } from "@trigger.dev/sdk/v3";

export const ingestDataTask = schedules.task({
  id: "ingest-data",
  cron: "0 * * * *", // every hour
  run: async (payload: any, { ctx }: { ctx: any }) => {
    console.log("Trigger.dev: Starting hourly ingestion task...");
    
    // Call the backend API to trigger ingestion sync
    const res = await fetch("http://localhost:3000/ingestion/sync", {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error(`Ingestion sync failed: ${await res.text()}`);
    }

    const data = await res.json();
    console.log("Trigger.dev: Ingestion completed successfully.", data);
    return data;
  },
});
