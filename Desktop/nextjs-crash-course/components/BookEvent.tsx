"use client";

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { trackEvent } from "@/lib/analytics";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success } = await createBooking({ eventId, slug, email });

    if (success) {
      setSubmitted(true);

      // Track with PostHog
      posthog.capture("event_booked", { eventId, slug, email });

      // Track with Google Analytics
      trackEvent("event_booking", {
        event_id: eventId,
        event_slug: slug,
        user_email: email,
      });
    } else {
      console.error("Booking creation failed");
      posthog.captureException("Booking Creation Failed!");

      // Track failed booking in Google Analytics
      trackEvent("booking_failed", {
        event_id: eventId,
        event_slug: slug,
      });
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
            />
          </div>
          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
