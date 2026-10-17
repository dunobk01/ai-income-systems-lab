/** A claim is completed only after all durable purchase writes succeed. */
export async function processPaymentEvent(operations: {
  claim: () => Promise<string>;
  dispatch: () => Promise<void>;
  complete: () => Promise<void>;
  release: () => Promise<void>;
}) {
  const state = await operations.claim();
  if (state === "complete") return;
  if (state !== "claimed") throw new Error("Payment event is still processing; retry later");
  try {
    await operations.dispatch();
    await operations.complete();
  } catch (error) {
    await operations.release();
    throw error;
  }
}

export function assertPaymentWrite(error: { message: string } | null | undefined) {
  if (error) throw new Error(`Payment persistence failed: ${error.message}`);
}