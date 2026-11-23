"use client";
import { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import SectionHeading from "./SectionHeading";

export default function ContactButton() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({});
      cal("ui", {
        styles: { branding: { brandColor: "#000000" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <section className="mt-24 w-full" id="contact">
      <SectionHeading
        title="Get in touch"
        subtitle="Book a short call to talk about work, ideas or collaboration."
      />
      <button
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        data-cal-namespace=""
        data-cal-link="ashutoshrath/talk-over-coffee"
        data-cal-config='{"layout":"month_view"}'
      >
        Schedule a call
      </button>
    </section>
  );
}
