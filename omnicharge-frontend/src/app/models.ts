export interface User {
  id?: number;
  username: string;
  email: string;
  phoneNumber: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  role: string;
}

export interface RechargePlan {
  id: number;
  operatorId?: number;
  planName: string;
  price: number;
  validityDays: number;
  dataBenefits: string;
  description: string;
}

export interface TelecomOperator {
  id: number;
  name: string;
  region: string;
  active: boolean;
  plans?: RechargePlan[];
}

export interface RechargeRequest {
  id?: number;
  userId: number;
  operatorId: number;
  planId: number;
  mobileNumber: string;
  amount: number;
  status?: string;
  requestDate?: string;
}

export interface PaymentTransaction {
  id?: number;
  rechargeId: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  status?: string;
  transactionDate?: string;
}
