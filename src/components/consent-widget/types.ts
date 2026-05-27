// ─── Consent Widget Types ─────────────────────────────────

export type WidgetDisplayMode = 'POPUP' | 'INLINE' | 'SIDEBAR' | 'BOTTOM_BAR' | 'FLOATING';
export type WidgetTrigger = 'PAGE_LOAD' | 'BUTTON_CLICK' | 'FORM_SUBMIT' | 'MANUAL' | 'SCROLL';
export type WidgetStatus = 'WIDGET_ACTIVE' | 'WIDGET_DISABLED' | 'WIDGET_DRAFT' | 'WIDGET_ARCHIVED';

export interface ConsentWidgetConfig {
  id: string;
  name: string;

  // Links
  applicationId: string;
  applicationName?: string;
  templateId: string;
  templateName?: string;
  templateType?: string;

  // Display
  displayMode: WidgetDisplayMode;
  trigger: WidgetTrigger;
  position: string;

  // Branding
  themeColor: string;
  backgroundColor: string;
  textColor: string;
  buttonTextColor: string;
  borderRadius: number;
  fontSize: number;
  logoUrl?: string;

  // Content
  heading: string;
  description?: string;

  // Fields
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  requireAllPurposes: boolean;
  showPrivacyLink: boolean;
  privacyPolicyUrl?: string;

  // Button Labels
  acceptAllText: string;
  rejectAllText: string;
  savePrefsText: string;

  // i18n
  defaultLanguage: string;
  supportedLanguages: string[];

  // Custom CSS
  customCss?: string;

  // Status
  status: WidgetStatus;

  // Publishing (merged deployment flow)
  latestVersionId?: string | null;
  latestVersionNumber?: number | null;
  deployedVersionId?: string | null;
  deployedVersionNumber?: number | null;
  deploymentId?: string | null;
  deploymentRegion?: string | null;
  deploymentPlatform?: string[];

  // Meta
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetAnalytics {
  widgetId: string;
  widgetName: string;
  totalRecords: number;
  grantedRecords: number;
  revokedRecords: number;
  consentRate: number;
}

export const DEFAULT_WIDGET_CONFIG: Partial<ConsentWidgetConfig> = {
  displayMode: 'POPUP',
  trigger: 'MANUAL',
  position: 'center',
  themeColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  buttonTextColor: '#ffffff',
  borderRadius: 12,
  fontSize: 14,
  heading: 'We value your privacy',
  description: 'Please review and consent to the following data processing purposes before continuing.',
  collectName: false,
  collectEmail: true,
  collectPhone: false,
  requireAllPurposes: false,
  showPrivacyLink: true,
  acceptAllText: 'Accept All',
  rejectAllText: 'Reject All',
  savePrefsText: 'Save Preferences',
  defaultLanguage: 'en',
  supportedLanguages: ['en'],
  status: 'WIDGET_DRAFT',
};

export const DISPLAY_MODES: { value: WidgetDisplayMode; label: string; description: string }[] = [
  { value: 'POPUP', label: 'Popup Modal', description: 'Centered overlay dialog' },
  { value: 'INLINE', label: 'Inline Embed', description: 'Rendered inside a div element' },
  { value: 'SIDEBAR', label: 'Sidebar Panel', description: 'Slides in from the right' },
  { value: 'BOTTOM_BAR', label: 'Bottom Bar', description: 'Fixed bar at the bottom' },
  { value: 'FLOATING', label: 'Floating Button', description: 'Expandable floating action' },
];

export const TRIGGER_MODES: { value: WidgetTrigger; label: string; description: string }[] = [
  { value: 'MANUAL', label: 'Manual (API)', description: 'Triggered via ProteccioConsent.show()' },
  { value: 'PAGE_LOAD', label: 'Page Load', description: 'Shows automatically on page load' },
  { value: 'FORM_SUBMIT', label: 'Form Submit', description: 'Intercepts form submission' },
  { value: 'BUTTON_CLICK', label: 'Button Click', description: 'Triggered by a button click' },
  { value: 'SCROLL', label: 'On Scroll', description: 'Shows after scrolling 30%' },
];
