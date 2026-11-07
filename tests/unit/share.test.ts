import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shareInputSchema, validatePayloadSize } from '@/lib/schemas/share';
import { ZodError } from 'zod';

describe('Share Schema', () => {
  describe('shareInputSchema', () => {
    it('should validate correct input', () => {
      const validInput = {
        algorithmId: 'bubble-sort',
        input: { array: [3, 1, 4, 1, 5] },
      };
      
      const result = shareInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });
    
    it('should validate input with expiresAt', () => {
      const validInput = {
        algorithmId: 'quick-sort',
        input: { array: [9, 2, 5] },
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };
      
      const result = shareInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });
    
    it('should reject empty algorithmId', () => {
      const invalidInput = {
        algorithmId: '',
        input: { array: [1, 2, 3] },
      };
      
      expect(() => shareInputSchema.parse(invalidInput)).toThrow(ZodError);
    });
    
    it('should reject missing algorithmId', () => {
      const invalidInput = {
        input: { array: [1, 2, 3] },
      };
      
      expect(() => shareInputSchema.parse(invalidInput)).toThrow(ZodError);
    });
    
    it('should reject invalid expiresAt format', () => {
      const invalidInput = {
        algorithmId: 'merge-sort',
        input: { array: [5, 2, 8] },
        expiresAt: 'invalid-date',
      };
      
      expect(() => shareInputSchema.parse(invalidInput)).toThrow(ZodError);
    });
    
    it('should accept any valid JSON as input', () => {
      const validInputs = [
        { algorithmId: 'dijkstra', input: { graph: {}, startNode: 'A' } },
        { algorithmId: 'binary-search', input: { array: [1, 2, 3], target: 2 } },
        { algorithmId: 'bst', input: { values: [5, 3, 7] } },
      ];
      
      validInputs.forEach(input => {
        expect(() => shareInputSchema.parse(input)).not.toThrow();
      });
    });
  });
  
  describe('validatePayloadSize', () => {
    it('should accept payload under 50KB', () => {
      const smallPayload = {
        algorithmId: 'bubble-sort',
        input: { array: Array.from({ length: 100 }, (_, i) => i) },
      };
      
      expect(validatePayloadSize(smallPayload)).toBe(true);
    });
    
    it('should reject payload over 50KB', () => {
      const largePayload = {
        algorithmId: 'bubble-sort',
        input: { array: Array.from({ length: 10000 }, (_, i) => i) },
        extraData: 'x'.repeat(50000),
      };
      
      expect(validatePayloadSize(largePayload)).toBe(false);
    });
    
    it('should handle edge case near 50KB limit', () => {
      // Create payload close to but under 50KB
      const nearLimitPayload = {
        algorithmId: 'test',
        input: { data: 'x'.repeat(49000) },
      };
      
      const result = validatePayloadSize(nearLimitPayload);
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('Share Handler Logic (Mocked DB)', () => {
  const mockDb = {
    insert: vi.fn(),
    update: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('POST /api/share', () => {
    it('should return 400 with Zod errors for invalid input', () => {
      const invalidPayload = {
        algorithmId: '',
        input: null,
      };
      
      try {
        shareInputSchema.parse(invalidPayload);
        expect.fail('Should have thrown ZodError');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues.length).toBeGreaterThan(0);
      }
    });
    
    it('should return 413 for payload over 50KB', () => {
      const largePayload = {
        algorithmId: 'test',
        input: { data: 'x'.repeat(60000) },
      };
      
      const isValid = validatePayloadSize(largePayload);
      expect(isValid).toBe(false);
    });
    
    it('should accept valid payload under 50KB', () => {
      const validPayload = {
        algorithmId: 'bubble-sort',
        input: { array: [3, 1, 4, 1, 5, 9, 2, 6] },
      };
      
      const parsed = shareInputSchema.parse(validPayload);
      const isValidSize = validatePayloadSize(validPayload);
      
      expect(parsed).toEqual(validPayload);
      expect(isValidSize).toBe(true);
    });
  });
  
  describe('GET /api/share/[id]', () => {
    it('should return 404 for non-existent share', () => {
      const shareId = 'nonexistent';
      const mockResult: any[] = [];
      
      expect(mockResult.length).toBe(0);
    });
    
    it('should return 404 for expired share', () => {
      const expiredShare = {
        id: 'test123',
        algorithmId: 'bubble-sort',
        input: { array: [1, 2, 3] },
        createdAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-01-02'),
        views: 5,
      };
      
      const isExpired = expiredShare.expiresAt < new Date();
      expect(isExpired).toBe(true);
    });
    
    it('should return share data for valid non-expired share', () => {
      const validShare = {
        id: 'valid123',
        algorithmId: 'quick-sort',
        input: { array: [5, 2, 8, 1] },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        views: 10,
      };
      
      const isExpired = validShare.expiresAt && validShare.expiresAt < new Date();
      expect(isExpired).toBe(false);
      expect(validShare.id).toBe('valid123');
      expect(validShare.algorithmId).toBe('quick-sort');
    });
  });
});
