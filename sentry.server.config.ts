import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
  sendDefaultPii: false,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
});
