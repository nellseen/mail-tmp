import { describe, it, expect } from 'vitest';
import { MailApiError } from './mail-service';
import { z } from 'zod';

const CreateAccountSchema = z.object({
  address: z.string().email(),
  password: z.string().min(6),
});

describe('Mail Integration & Validation Tests', () => {
  it('correctly constructs MailApiError with status code and data', () => {
    const error = new MailApiError('Rate limited by Mail.tm', 429, { retryAfter: 60 });
    expect(error.name).toBe('MailApiError');
    expect(error.message).toBe('Rate limited by Mail.tm');
    expect(error.status).toBe(429);
    expect(error.data).toEqual({ retryAfter: 60 });
  });

  it('validates correct email and password for account creation', () => {
    const valid = CreateAccountSchema.safeParse({
      address: 'testuser@example.com',
      password: 'StrongPassword123!',
    });
    expect(valid.success).toBe(true);
  });

  it('rejects invalid email formats', () => {
    const invalid = CreateAccountSchema.safeParse({
      address: 'not-an-email',
      password: 'StrongPassword123!',
    });
    expect(invalid.success).toBe(false);
  });

  it('rejects passwords that are too short', () => {
    const invalid = CreateAccountSchema.safeParse({
      address: 'user@example.com',
      password: '123',
    });
    expect(invalid.success).toBe(false);
  });
});
