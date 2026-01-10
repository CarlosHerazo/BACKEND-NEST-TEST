export interface WompiMerchantData {
  id: number;
  name: string;
  email: string;
  contact_name: string;
  phone_number: string;
  active: boolean;
  logo_url: string;
  legal_name: string;
  legal_id_type: string;
  legal_id: string;
  public_key: string;
  accepted_currencies: string[];
  fraud_javascript_key: string;
  fraud_groups: any[];
  accepted_payment_methods: string[];
  payment_methods: any[];
  presigned_acceptance: {
    acceptance_token: string;
    permalink: string;
    type: string;
  };
  presigned_personal_data_auth: {
    acceptance_token: string;
    permalink: string;
    type: string;
  };
}

export interface WompiPaymentMethod {
  type: string;
  token?: string;
  installments?: number;
  sandbox_status?: 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING';
}

export interface WompiShippingAddress {
  address_line_1: string;
  address_line_2?: string;
  country: string;
  region: string;
  city: string;
  name?: string;
  phone_number: string;
  postal_code?: string;
}

export interface WompiCustomerData {
  phone_number?: string;
  full_name?: string;
  legal_id?: string;
  legal_id_type?: string;
}

export interface WompiCreateTransactionRequest {
  acceptance_token: string;
  accept_personal_auth: string;
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: WompiPaymentMethod;
  reference: string;
  signature?: string;
  customer_data?: WompiCustomerData;
  shipping_address?: WompiShippingAddress;
  redirect_url?: string;
  payment_source_id?: number;
}

export interface WompiTransactionResponse {
  data: {
    id: string;
    created_at: string;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: any;
    status: string;
    status_message: string;
    shipping_address: WompiShippingAddress | null;
    redirect_url: string | null;
    payment_source_id: number | null;
    payment_link_id: number | null;
    customer_data: WompiCustomerData | null;
    billing_data: any | null;
    taxes: any[];
  };
}

export interface WompiWebhookEvent {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      customer_email: string;
      currency: string;
      payment_method_type: string;
      redirect_url: string;
      status: string;
      shipping_address: any;
      payment_link_id: any;
      created_at: string;
      finalized_at: string;
    };
  };
  sent_at: string;
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
  environment: string;
}

export enum WompiTransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  VOIDED = 'VOIDED',
  ERROR = 'ERROR',
}

export enum WompiPaymentMethodType {
  CARD = 'CARD',
  NEQUI = 'NEQUI',
  PSE = 'PSE',
  BANCOLOMBIA_TRANSFER = 'BANCOLOMBIA_TRANSFER',
  BANCOLOMBIA_COLLECT = 'BANCOLOMBIA_COLLECT',
}
