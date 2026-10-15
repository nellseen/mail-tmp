export interface MailDomain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailAccount {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailParticipant {
  address: string;
  name: string;
}

export interface MailAttachment {
  id: string;
  filename: string;
  contentType: string;
  disposition: string;
  transferEncoding: string;
  related: boolean;
  size: number;
  downloadUrl: string;
}

export interface MailMessageSummary {
  id: string;
  accountId: string;
  msgid: string;
  from: MailParticipant;
  to: MailParticipant[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailMessageDetail extends MailMessageSummary {
  cc?: MailParticipant[];
  bcc?: MailParticipant[];
  flagged?: boolean;
  verifications?: unknown[];
  retention?: boolean;
  retentionDate?: string;
  text?: string;
  html?: string[];
  attachments?: MailAttachment[];
}

export interface StoredMailboxSession {
  id: string;
  address: string;
  token: string;
  password?: string;
  createdAt: string;
  label?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number; // in seconds: 10, 30, 60, 0 (manual)
  soundAlerts: boolean;
  browserNotifications: boolean;
  blockRemoteImages: boolean;
  interfaceDensity: 'comfortable' | 'compact';
  language: 'id' | 'en';
}
