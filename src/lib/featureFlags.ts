/**
 * Feature Flags for API Integration
 * 
 * Frontend is now locked to real backend APIs only.
 */

export const USE_REAL_API = true;

/**
 * Per-module flags remain for compatibility, but all are always enabled.
 */
export const FEATURE_FLAGS = {
  auth: true,
  dashboard: true,
  consent: true,
  rights: true,
  grievances: true,
  cookies: true,
  notices: true,
  configurations: true,
  integrations: true,
  reports: true,
  logs: true,
  security: true,
  users: true,
  settings: true,
} as const;

export type FeatureModule = keyof typeof FEATURE_FLAGS;
