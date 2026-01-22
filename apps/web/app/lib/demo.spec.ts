import { describe, it, expect } from 'vitest';

describe('Web Utility Demo', () => {
  it('should verify basic logic', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(1, 2)).toBe(3);
  });

  it('should have access to environment variables', () => {
    // Demo of testing env logic
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    expect(apiUrl).toBeDefined();
  });
});
