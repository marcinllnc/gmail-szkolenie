export type StarColor = 'none' | 'yellow' | 'red' | 'blue' | 'orange' | 'green' | 'purple';
export type EmailCategory = 'primary' | 'promotions' | 'updates' | 'social' | 'forums';

export interface Email {
  id: string;
  sender: string;
  senderName: string;
  subject: string;
  body: string;
  date: string;
  hasAttachment: boolean;
  attachmentSize?: number;
  attachmentName?: string;
  labels: string[];
  isRead: boolean;
  starColor: StarColor;
  category: EmailCategory;
  isArchived: boolean;
  isTrashed: boolean;
  snoozeUntil?: string;
  isMuted?: boolean;
}

export interface Filter {
  id: string;
  keyword: string;
  fromAddress?: string;
  actions: FilterAction[];
}

export interface FilterAction {
  type: 'markAsRead' | 'addLabel' | 'archive' | 'delete';
  label?: string;
}

export interface AutoResponder {
  enabled: boolean;
  subject: string;
  body: string;
  startDate: string;
  endDate: string;
}

export interface EmailSignature {
  enabled: boolean;
  content: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface AppState {
  emails: Email[];
  labels: string[];
  selectedIds: string[];
  openEmailId: string | null;
  searchQuery: string;
  currentFolder: string;
  activeTaskIndex: number;
  keyboardShortcutsEnabled: boolean;
  keyboardActionsUsed: string[];
  filters: Filter[];
  taskResults: Record<number, 'completed' | 'failed'>;
  showSnoozeDialog: boolean;
  showFilterDialog: boolean;
  focusedEmailIndex: number;
  autoResponder: AutoResponder;
  signature: EmailSignature;
  templates: EmailTemplate[];
}
