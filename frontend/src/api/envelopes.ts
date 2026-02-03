import api from './index';

export interface Envelope {
  id: number;
  user: number;
  category: number;
  category_name: string;
  budgeted_amount: string;
  spent_amount: string;
  remaining_amount: string;
  percentage_used: number;
  is_over_budget: boolean;
  is_near_limit: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnvelopeSummary {
  total_envelopes: number;
  total_budgeted: string;
  total_spent: string;
  total_remaining: string;
  over_budget_count: number;
  near_limit_count: number;
  envelopes: Envelope[];
}

export interface CreateEnvelopeData {
  category: number;
  budgeted_amount: string;
}

export interface UpdateEnvelopeData {
  budgeted_amount: string;
}

export const envelopesAPI = {
  getEnvelopes: (): Promise<Envelope[]> => 
    api.get('/envelopes/').then(response => response.data.results || response.data),

  getEnvelope: (id: number): Promise<Envelope> => 
    api.get(`/envelopes/${id}/`).then(response => response.data),

  createEnvelope: (data: CreateEnvelopeData): Promise<Envelope> => 
    api.post('/envelopes/', data).then(response => response.data),

  updateEnvelope: (id: number, data: UpdateEnvelopeData): Promise<Envelope> => 
    api.put(`/envelopes/${id}/`, data).then(response => response.data),

  deleteEnvelope: (id: number): Promise<void> => 
    api.delete(`/envelopes/${id}/`),

  getEnvelopeSummary: (): Promise<EnvelopeSummary> => 
    api.get('/envelopes/summary/').then(response => response.data),
};
