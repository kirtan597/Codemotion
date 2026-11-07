import { z } from 'zod';

export const MIN_ARRAY_SIZE = 5;
export const MAX_ARRAY_SIZE = 60;
export const MIN_ELEMENT_VALUE = 1;
export const MAX_ELEMENT_VALUE = 100;

/**
 * Zod schema for comma-separated numbers string.
 * Transforms valid strings into an array of numbers.
 */
export const commaSeparatedArraySchema = z
  .string()
  .min(1, 'Please enter at least one number')
  .transform((val, ctx) => {
    // Split by commas
    const parts = val.split(',').map((p) => p.trim()).filter((p) => p.length > 0);

    if (parts.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide at least one comma-separated number.',
      });
      return z.NEVER;
    }

    if (parts.length < MIN_ARRAY_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Array must have at least ${MIN_ARRAY_SIZE} elements (currently ${parts.length}).`,
      });
      return z.NEVER;
    }

    if (parts.length > MAX_ARRAY_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Array cannot exceed ${MAX_ARRAY_SIZE} elements (currently ${parts.length}).`,
      });
      return z.NEVER;
    }

    const numbers: number[] = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const num = Number(part);
      if (isNaN(num) || !Number.isFinite(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item #${i + 1} "${part}" is not a valid number.`,
        });
        return z.NEVER;
      }
      if (!Number.isInteger(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item #${i + 1} "${part}" must be an integer.`,
        });
        return z.NEVER;
      }
      if (num < MIN_ELEMENT_VALUE || num > MAX_ELEMENT_VALUE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item #${i + 1} (${num}) must be between ${MIN_ELEMENT_VALUE} and ${MAX_ELEMENT_VALUE}.`,
        });
        return z.NEVER;
      }
      numbers.push(num);
    }

    return numbers;
  });

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateArrayInput(input: string): ValidationResult<number[]> {
  const result = commaSeparatedArraySchema.safeParse(input);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message || 'Invalid input format. Use comma-separated integers.',
    };
  }
  return {
    success: true,
    data: result.data,
  };
}
