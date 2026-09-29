import {apiClient} from './api-client.ts';
import {API_ENDPOINTS} from '../constants/api-endpoints.ts';

export interface PaymentInitiateRequest {
  booking_reference: string;
  gateway: 'STRIPE' | 'HIMALAYAN_BANK' | 'BANK_WIRE' | string;
  amount_usd?: string | number;
}

export interface PaymentInitiateResponse {
  payment_id: string;
  checkout_url?: string;
  client_secret?: string;
  amount_usd: string;
  currency: string;
  status: string;
}

export interface PaymentVerifyRequest {
  payment_id: string;
  gateway: string;
  transaction_reference?: string;
  signature?: string;
}

export const paymentsService = {
  /**
   * Initiates payment checkout session via Django /api/v1/payments/initiate/.
   */
  async initiatePayment(payload: PaymentInitiateRequest): Promise<PaymentInitiateResponse> {
    return apiClient.post<PaymentInitiateResponse>(
      API_ENDPOINTS.BACKEND.PAYMENTS.INITIATE,
      payload
    );
  },

  /**
   * Verifies gateway callback or webhook signature via Django /api/v1/payments/verify/.
   */
  async verifyPayment(payload: PaymentVerifyRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.BACKEND.PAYMENTS.VERIFY,
      payload
    );
  },

  /**
   * Retrieves payment transaction details by ID from Django /api/v1/payments/<id>/.
   */
  async getPaymentDetail(id: string) {
    return apiClient.get(API_ENDPOINTS.BACKEND.PAYMENTS.DETAIL(id));
  },
};
