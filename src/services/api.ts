import axios from 'axios';

export interface Transaction {
  id: number;
  fiscal_year: number;
  doc_no: number;
  doc_date: string;
  posting_date: string;
  description: string;
  ref: string;
  reversal: number; // If 0 or null, not reversed
  debit_total: string;
  credit_total: string;
}

export interface AccountingItem {
  line_no: number;
  account_code: string;
  amount: string;
  dc_indicator: 'D' | 'C';
  currency: string;
  user_id: number;
  description: string;
}

export interface TransactionDetail {
  document: Transaction;
  items: AccountingItem[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  page: number;
  limit: number;
  data: T[];
}

export interface DetailResponse {
  success: boolean;
  data: TransactionDetail;
}

// API base URL from environment variables
// Vite exposes env variables prefixed with VITE_ to the client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchTransactions = async (
  page = 1,
  limit = 50,
  from?: string,
  to?: string,
  docNo?: string,
  ref?: string
): Promise<PaginatedResponse<Transaction>> => {
  const params: Record<string, any> = { page, limit };
  if (from) params.from = from;
  if (to) params.to = to;
  if (docNo) params.doc_no = docNo;
  if (ref) params.ref = ref;

  const response = await api.get<PaginatedResponse<Transaction>>('/transactions', { params });
  return response.data;
};

export const fetchTransactionDetail = async (id: number): Promise<DetailResponse> => {
  const response = await api.get<DetailResponse>(`/transactions/${id}`);
  return response.data;
};

// Mock data for development if needed
export const mockTransactions: Transaction[] = [
  {
    id: 12345,
    fiscal_year: 2024,
    doc_no: 1000001,
    doc_date: "2024-01-15T10:30:00Z",
    posting_date: "2024-01-15T10:31:12Z",
    description: "Payment from 123 to 456 via payment_gateway",
    ref: "unique-call-id-123",
    reversal: 0,
    debit_total: "1000.00",
    credit_total: "1000.00"
  }
];
