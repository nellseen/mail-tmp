const MAIL_TM_BASE = 'https://api.mail.tm';

export class MailApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number = 500, data?: unknown) {
    super(message);
    this.name = 'MailApiError';
    this.status = status;
    this.data = data;
  }
}

async function requestMailTm<T>(
  endpoint: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = `${MAIL_TM_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json, application/ld+json',
    ...options.headers,
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (res.status === 204) {
      return {} as T;
    }

    const contentType = res.headers.get('content-type') || '';
    let responseData: unknown = null;

    if (contentType.includes('json')) {
      responseData = await res.json().catch(() => null);
    } else {
      responseData = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const errObj = responseData as { message?: string; 'hydra:description'?: string } | null;
      const message =
        errObj?.['hydra:description'] ||
        errObj?.message ||
        `Mail.tm API error: HTTP ${res.status} ${res.statusText}`;
      throw new MailApiError(message, res.status, responseData);
    }

    return responseData as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof MailApiError) {
      throw err;
    }
    const error = err as Error;
    if (error.name === 'AbortError') {
      throw new MailApiError('Mail.tm API request timed out (12s)', 504);
    }
    throw new MailApiError(error.message || 'Network error reaching Mail.tm', 502);
  }
}

export const mailService = {
  getDomains: async (page = 1) => {
    return requestMailTm<{
      'hydra:member': Array<{
        id: string;
        domain: string;
        isActive: boolean;
        isPrivate: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
      'hydra:totalItems': number;
    }>(`/domains?page=${page}`);
  },

  createAccount: async (address: string, password: string) => {
    return requestMailTm<{
      id: string;
      address: string;
      quota: number;
      used: number;
      isDisabled: boolean;
      isDeleted: boolean;
      createdAt: string;
      updatedAt: string;
    }>('/accounts', {
      method: 'POST',
      body: { address, password },
    });
  },

  getToken: async (address: string, password: string) => {
    return requestMailTm<{
      token: string;
      id: string;
    }>('/token', {
      method: 'POST',
      body: { address, password },
    });
  },

  getMe: async (token: string) => {
    return requestMailTm<{
      id: string;
      address: string;
      quota: number;
      used: number;
      isDisabled: boolean;
      isDeleted: boolean;
      createdAt: string;
      updatedAt: string;
    }>('/me', {
      token,
    });
  },

  getMessages: async (token: string, page = 1) => {
    return requestMailTm<{
      'hydra:member': Array<{
        id: string;
        accountId: string;
        msgid: string;
        from: { address: string; name: string };
        to: Array<{ address: string; name: string }>;
        subject: string;
        intro: string;
        seen: boolean;
        isDeleted: boolean;
        hasAttachments: boolean;
        size: number;
        downloadUrl: string;
        createdAt: string;
        updatedAt: string;
      }>;
      'hydra:totalItems': number;
    }>(`/messages?page=${page}`, {
      token,
    });
  },

  getMessage: async (token: string, id: string) => {
    return requestMailTm<any>(`/messages/${id}`, {
      token,
    });
  },

  updateMessageSeen: async (token: string, id: string, seen: boolean) => {
    return requestMailTm<any>(`/messages/${id}`, {
      method: 'PATCH',
      token,
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: { seen },
    });
  },

  deleteMessage: async (token: string, id: string) => {
    return requestMailTm<any>(`/messages/${id}`, {
      method: 'DELETE',
      token,
    });
  },

  deleteAccount: async (token: string, accountId: string) => {
    return requestMailTm<any>(`/accounts/${accountId}`, {
      method: 'DELETE',
      token,
    });
  },
};
