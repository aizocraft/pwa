export type ContactStatus = 'pending' | 'read' | 'replied' | 'spam';

export interface CreateContactRequest {
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: true;
  message: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
  repliedAt?: string;
  repliedBy?: string;
  notes?: string;
}

export interface ContactListResponse {
  success: true;
  data: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
