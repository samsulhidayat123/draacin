export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let interval;

  const stream = new ReadableStream({
    start(controller) {
      const sendRefresh = () => {
        controller.enqueue(encoder.encode("event: movies\ndata: refresh\n\n"));
      };

      sendRefresh();
      interval = setInterval(sendRefresh, 15000);
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
