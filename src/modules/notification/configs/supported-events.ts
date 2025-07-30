/**
 * @constant SUPPORTED_EVENTS
 * @description Supported events
 */
export const SUPPORTED_EVENTS = [
  'notification.sent',
  'notification.failed',
  'notification.queued',
  'welcome.email.sent',
  'verification.code.sent',
  'verification.code.verified',
] as const;

/**
 * @type SupportedEvent
 * @description Supported event
 */
export type SupportedEvent = (typeof SUPPORTED_EVENTS)[number];
