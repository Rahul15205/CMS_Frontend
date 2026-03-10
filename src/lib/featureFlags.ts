/**
 * Feature Flags for API Integration
 * 
 * Controls whether each module uses real backend APIs or mock data.
 * The master switch is VITE_USE_REAL_API in .env.
 * Individual modules can be overridden for gradual rollout.
 */

// Master switch from environment
export const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

/**
 * Per-module feature flags.
 * 
 * During integration, you can override individual modules:
 *   auth: true,         // Auth uses real API
 *   dashboard: false,   // Dashboard still uses mocks
 * 
 * When VITE_USE_REAL_API=true, ALL modules default to true.
 * When VITE_USE_REAL_API=false, ALL modules default to false.
 */
export const FEATURE_FLAGS = {
  auth: USE_REAL_API,
  dashboard: USE_REAL_API,
  consent: USE_REAL_API,
  rights: USE_REAL_API,
  grievances: USE_REAL_API,
  cookies: USE_REAL_API,
  notices: USE_REAL_API,
  configurations: USE_REAL_API,
  integrations: USE_REAL_API,
  reports: USE_REAL_API,
  logs: USE_REAL_API,
  security: USE_REAL_API,
  users: USE_REAL_API,
  settings: USE_REAL_API,
} as const;

export type FeatureModule = keyof typeof FEATURE_FLAGS;
