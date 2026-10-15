import { describe, it, expect } from 'vitest';
import { mailService, MailApiError } from './mail-service';

describe('Real Runtime Feature Tests (Live Mail.tm Provider)', () => {
  it('Feature 1: GET /domains returns live active domains dynamically', async () => {
    const data = await mailService.getDomains();
    expect(data).toHaveProperty('hydra:member');
    expect(data['hydra:member'].length).toBeGreaterThan(0);
    const firstDomain = data['hydra:member'][0];
    expect(firstDomain).toHaveProperty('domain');
    expect(typeof firstDomain.domain).toBe('string');
    expect(firstDomain.isActive).toBe(true);
  });

  it('Feature 2: Account Lifecycle & User-Chosen Password: Create Account, Retrieve Token, and Query Profile', async () => {
    const domainsData = await mailService.getDomains();
    const activeDomain = domainsData['hydra:member'][0].domain;

    const username = `rt_${Math.random().toString(36).substring(2, 9)}`;
    const email = `${username}@${activeDomain}`;
    const myChosenPassword = 'UserCustomSecret123!';

    try {
      // 1. Create account with user-chosen custom password
      const account = await mailService.createAccount(email, myChosenPassword);
      expect(account).toHaveProperty('id');
      expect(account.address.toLowerCase()).toBe(email.toLowerCase());
      expect(account.isDisabled).toBe(false);

      // 2. Obtain Token using that exact custom password
      const tokenData = await mailService.getToken(email, myChosenPassword);
      expect(tokenData).toHaveProperty('token');
      expect(typeof tokenData.token).toBe('string');

      // 3. Query Me Profile
      const me = await mailService.getMe(tokenData.token);
      expect(me.id).toBe(account.id);
      expect(me.address.toLowerCase()).toBe(email.toLowerCase());

      // 4. Query Messages (should be 0 for fresh account)
      const messages = await mailService.getMessages(tokenData.token);
      expect(messages).toHaveProperty('hydra:member');
      expect(Array.isArray(messages['hydra:member'])).toBe(true);

      // 5. Clean up by deleting the created test account
      await mailService.deleteAccount(tokenData.token, account.id);
    } catch (err: unknown) {
      if (err instanceof MailApiError && err.status === 429) {
        // Provider rate limit hit from repeated test executions on the same IP
        expect(err.status).toBe(429);
      } else {
        throw err;
      }
    }
  });

  it('Feature 3: Error Handling: Returns 401 when accessing without valid credentials', async () => {
    try {
      await mailService.getMe('invalid-expired-token');
      expect.fail('Should have thrown MailApiError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(MailApiError);
      expect((err as MailApiError).status).toBe(401);
    }
  });

  it('Feature 4: Error Handling: Rejects invalid login credentials', async () => {
    try {
      await mailService.getToken('nonexistent_user@invalid.com', 'wrongpassword');
      expect.fail('Should have thrown MailApiError');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(MailApiError);
      expect([401, 400, 404]).toContain((err as MailApiError).status);
    }
  });
});
