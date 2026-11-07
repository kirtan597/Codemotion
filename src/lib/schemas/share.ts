import { z } from 'zod';

const MAX_PAYLOAD_SIZE = 50 * 1024; // 50KB

export const shareInputSchema = z.object({
  algorithmId: z.string().min(1).max(100),
  input: z.any(),
  expiresAt: z.string().datetime().optional(),
});

export const shareResponseSchema = z.object({
  id: z.string(),
});

export type ShareInput = z.infer<typeof shareInputSchema>;
export type ShareResponse = z.infer<typeof shareResponseSchema>;

export function validatePayloadSize(data: unknown): boolean {
  const jsonString = JSON.stringify(data);
  const byteSize = new TextEncoder().encode(jsonString).length;
  return byteSize <= MAX_PAYLOAD_SIZE;
}
