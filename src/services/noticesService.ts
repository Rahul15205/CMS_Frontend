/**
 * Notices Service
 */

import api from '@/lib/api';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import {
  CreateNoticeLanguageInput,
  CreateNoticeTypeInput,
  NoticeHistoryRecord,
  NoticeLanguage,
  NoticeRecord,
  NoticeType,
} from '@/components/notices/types';

type PaginatedResponse<T> = {
  data: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
};

const normalizeNotice = (notice: any): NoticeRecord => ({
  id: notice.id,
  title: notice.title,
  version: String(notice.version ?? notice.currentVersion ?? '1'),
  status: notice.status,
  lastUpdated: notice.lastUpdated || (notice.updatedAt ? new Date(notice.updatedAt).toLocaleDateString() : undefined),
  updatedAt: notice.updatedAt,
  acknowledgements: notice.acknowledgements ?? notice._count?.acknowledgements ?? 0,
  pendingAck: notice.pendingAck ?? 0,
  content: notice.content,
  typeId: notice.typeId,
  tenantId: notice.tenantId,
  _count: notice._count,
  avgReadTime: notice.avgReadTime,
  totalReadTime: notice.totalReadTime,
});

const normalizeNotices = (payload: NoticeRecord[] | PaginatedResponse<NoticeRecord>) => {
  const records = Array.isArray(payload) ? payload : payload?.data || [];
  return records.map(normalizeNotice);
};

const normalizeHistory = (payload: any[]): NoticeHistoryRecord[] =>
  (payload || []).map((item) => ({
    id: item.id,
    noticeId: item.noticeId,
    title: item.title,
    version: `v${item.version}`,
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
    author: item.author || 'System',
    changes: item.changes || 'Updated',
    content: item.content,
    createdAt: item.createdAt,
  }));

export const noticesService = {
  getAll: async (params?: Record<string, unknown>): Promise<PaginatedResponse<NoticeRecord> | NoticeRecord[] | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.get('/api/v1/notices', { params });
    if (Array.isArray(res.data)) {
      return normalizeNotices(res.data);
    }
    return {
      ...res.data,
      data: normalizeNotices(res.data),
    };
  },

  getById: async (id: string): Promise<NoticeRecord | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.get(`/api/v1/notices/${id}`);
    return normalizeNotice(res.data);
  },

  create: async (data: Partial<NoticeRecord>): Promise<NoticeRecord | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const payload = {
      title: data.title,
      content: data.content || '',
      status: data.status || 'NOTICE_DRAFT',
      tenantId: data.tenantId,
      typeId: data.typeId,
    };
    const res = await api.post('/api/v1/notices', payload);
    return normalizeNotice(res.data);
  },

  update: async (id: string, data: Partial<NoticeRecord>): Promise<NoticeRecord | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const payload = {
      title: data.title,
      content: data.content,
      status: data.status,
      typeId: data.typeId,
      tenantId: data.tenantId,
    };
    const res = await api.put(`/api/v1/notices/${id}`, payload);
    return normalizeNotice(res.data);
  },

  getTypes: async (): Promise<NoticeType[] | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.get('/api/v1/notices/types');
    return res.data;
  },

  createType: async (data: CreateNoticeTypeInput): Promise<NoticeType | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.post('/api/v1/notices/types', data);
    return res.data;
  },

  getLanguages: async (): Promise<NoticeLanguage[] | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.get('/api/v1/notices/languages');
    return res.data;
  },

  createLanguage: async (data: CreateNoticeLanguageInput): Promise<NoticeLanguage | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.post('/api/v1/notices/languages', data);
    return res.data;
  },

  updateLanguage: async (code: string, data: { isDefault: boolean }): Promise<NoticeLanguage | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const languages = await noticesService.getLanguages();
    const target = languages?.find((language) => language.code === code);
    if (!target) {
      throw new Error(`Language with code ${code} not found`);
    }

    if (data.isDefault) {
      await Promise.all(
        (languages || []).map((language) =>
          api.put(`/api/v1/notices/languages/${language.id}`, {
            isDefault: language.code === code,
          }),
        ),
      );
      return { ...target, isDefault: true };
    }

    const res = await api.put(`/api/v1/notices/languages/${target.id}`, data);
    return res.data;
  },

  deleteLanguage: async (code: string): Promise<void> => {
    if (!FEATURE_FLAGS.notices) return;
    const languages = await noticesService.getLanguages();
    const target = languages?.find((language) => language.code === code);
    if (!target) {
      throw new Error(`Language with code ${code} not found`);
    }
    await api.delete(`/api/v1/notices/languages/${target.id}`);
  },

  getGlobalHistory: async (): Promise<NoticeHistoryRecord[] | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.get('/api/v1/notices/history/global');
    return normalizeHistory(res.data);
  },

  getHistory: async (id: string): Promise<NoticeHistoryRecord[] | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.get(`/api/v1/notices/${id}/history`);
    return normalizeHistory(res.data);
  },

  getAnalytics: async (params?: Record<string, unknown>): Promise<PaginatedResponse<any> | null> => {
    if (!FEATURE_FLAGS.notices) return null;
    const res = await api.get('/api/v1/notices/analytics', { params });
    return res.data;
  },

  normalizeNotices,
};
