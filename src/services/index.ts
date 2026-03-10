/**
 * Service Layer Barrel Export
 *
 * Import all services from this single file:
 *   import { authService, dashboardService, ... } from '@/services';
 */

export { authService } from './authService';
export { dashboardService } from './dashboardService';
export {
  consentTemplatesService,
  consentVersionsService,
  consentDeploymentsService,
  consentRecordsService,
  consentAnalyticsService,
  purposesService,
  dataCategoriesService,
  thirdPartiesService,
  subProcessorsService,
} from './consentService';
export { rightsService } from './rightsService';
export { grievancesService } from './grievancesService';
export {
  cookieCategoriesService,
  cookieInventoryService,
  cookieWebsitesService,
  cookieBannersService,
  cookieConsentLogsService,
  cookieComplianceService,
} from './cookiesService';
export { noticesService } from './noticesService';
export {
  slaRulesService,
  notificationRulesService,
  escalationRulesService,
  apiKeysService,
  logRetentionService,
  exportConfigsService,
  workflowConfigsService,
  encryptionConfigService,
  aadhaarConfigService,
} from './configurationsService';
export { integrationsService } from './integrationsService';
export { reportsService, securityService, systemLogsService } from './reportsLogsSecurityService';
export {
  usersService,
  rolesService,
  invitationsService,
  sessionsService,
  auditLogsService,
  accessRulesService,
} from './userSetupService';
export { settingsService } from './settingsService';
