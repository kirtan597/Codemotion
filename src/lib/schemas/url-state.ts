import { z } from 'zod';

export const urlStateSchema = z.object({
  algorithm: z.string().optional(),
  input: z.string().optional(), // JSON string
  speed: z.coerce.number().min(0.1).max(10).optional(),
  step: z.coerce.number().int().min(0).optional(),
});

export type UrlState = z.infer<typeof urlStateSchema>;

export function parseUrlState(searchParams: URLSearchParams): Partial<UrlState> {
  const raw = {
    algorithm: searchParams.get('algorithm'),
    input: searchParams.get('input'),
    speed: searchParams.get('speed'),
    step: searchParams.get('step'),
  };
  
  const result = urlStateSchema.safeParse(raw);
  return result.success ? result.data : {};
}

export function serializeUrlState(state: Partial<UrlState>): string {
  const params = new URLSearchParams();
  
  if (state.algorithm) params.set('algorithm', state.algorithm);
  if (state.input) params.set('input', state.input);
  if (state.speed !== undefined) params.set('speed', state.speed.toString());
  if (state.step !== undefined) params.set('step', state.step.toString());
  
  return params.toString();
}
