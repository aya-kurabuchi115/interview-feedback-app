export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = async (
  err: { digest: string } & Error,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routeType: "render" | "route" | "action" | "middleware";
    routePath: string;
    revalidateReason: "on-demand" | "stale" | undefined;
    renderSource:
      | "react-server-components"
      | "react-server-components-payload"
      | "server-rendering"
      | undefined;
  }
) => {
  const { captureRequestError } = await import("@sentry/nextjs");
  captureRequestError(err, request, context);
};
