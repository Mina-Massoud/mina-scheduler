"use client";

import SchedulerWrapper from "@/components/schedule/_components/view/schedular-view-filteration";
import { SchedulerProvider } from "@/providers/schedular-provider";

export default function Home() {
  return (
    <main className="min-h-screen">
      <SchedulerProvider weekStartsOn="monday">
        <SchedulerWrapper 
          stopDayEventSummary={true}
          classNames={{
            tabs: {
              panel: "p-0",
            },
          }}
        />
      </SchedulerProvider>
    </main>
  );
}
