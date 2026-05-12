import api from '@/lib/api';
import { ConsentWidgetConfig, WidgetAnalytics } from '@/components/consent-widget/types';

// ─── Mappers ──────────────────────────────────────────────────

function mapBackendWidget(data: any): ConsentWidgetConfig {
  return {
    ...data,
    applicationName: data.application?.name || 'Unknown App',
    templateName: data.template?.title || 'Unknown Template',
    templateType: data.template?.type || 'EXPLICIT',
  };
}

// ─── Service ──────────────────────────────────────────────────

export const consentWidgetService = {
  /**
   * Get all consent widget configurations.
   */
  getWidgets: async (): Promise<ConsentWidgetConfig[]> => {
    const res = await api.get('/api/v1/consent-widgets');
    return (res.data || []).map(mapBackendWidget);
  },

  /**
   * Get a single widget by ID.
   */
  getWidgetById: async (id: string): Promise<ConsentWidgetConfig> => {
    const res = await api.get(`/api/v1/consent-widgets/${id}`);
    return mapBackendWidget(res.data);
  },

  /**
   * Create a new widget configuration.
   */
  createWidget: async (data: Partial<ConsentWidgetConfig>): Promise<ConsentWidgetConfig> => {
    const res = await api.post('/api/v1/consent-widgets', data);
    return mapBackendWidget(res.data);
  },

  /**
   * Update an existing widget configuration.
   */
  updateWidget: async (id: string, data: Partial<ConsentWidgetConfig>): Promise<ConsentWidgetConfig> => {
    const res = await api.put(`/api/v1/consent-widgets/${id}`, data);
    return mapBackendWidget(res.data);
  },

  /**
   * Archive a widget.
   */
  deleteWidget: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/consent-widgets/${id}`);
  },

  /**
   * Get analytics for a widget.
   */
  getWidgetAnalytics: async (widgetId: string): Promise<WidgetAnalytics> => {
    const res = await api.get(`/api/v1/consent-widgets/${widgetId}/analytics`);
    return res.data;
  },
};
