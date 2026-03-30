export interface NoticeRecord {
  id: string;
  title: string;
  version: string;
  status: string;
  lastUpdated?: string;
  updatedAt?: string;
  acknowledgements?: number;
  pendingAck?: number;
  content?: string;
  typeId?: string;
  tenantId?: string;
  _count?: {
    acknowledgements?: number;
    versions?: number;
  };
}

export interface NoticeType {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  tenantId?: string;
  _count?: {
    notices?: number;
  };
}

export interface NoticeLanguage {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  completion: number;
  tenantId?: string;
}

export interface NoticeHistoryRecord {
  id: string;
  noticeId?: string;
  title: string;
  version: string;
  date: string;
  author?: string;
  changes?: string;
  createdAt?: string;
}

export interface NoticeReference {
  id: string;
  name: string;
  version: string;
  reference: string;
}

export interface CreateNoticeTypeInput {
  name: string;
  description: string;
  required: boolean;
}

export interface CreateNoticeLanguageInput {
  code: string;
  name: string;
  isDefault: boolean;
}
