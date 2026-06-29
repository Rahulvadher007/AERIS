import { schedules } from "@trigger.dev/sdk/v3";

export const forecastAqiTask = schedules.task({
  id: "forecast-aqi",
  cron: "0 2 * * *", // daily at 02:00
  run: async (payload: any, { ctx }: { ctx: any }) => {
    console.log("Trigger.dev: Starting daily forecast task...");

    // Call the Coordinator Agent manual sweep endpoint to run the multi-agent workflow
    const res = await fetch("http://localhost:3000/agents/coordinate", {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error(`Orchestration sweep failed: ${await res.text()}`);
    }

    const data = await res.json();
    console.log("Trigger.dev: Orchestration sweep completed successfully.", data);
    return data;
  },
});
