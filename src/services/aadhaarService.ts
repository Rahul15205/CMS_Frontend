import api from '@/lib/api';

export const aadhaarService = {
  /**
   * Initiates the Aadhaar verification process.
   * @param aadhaarNumber 12-digit Aadhaar number
   * @returns transactionId for the OTP session
   */
  initiate: async (aadhaarNumber: string) => {
    const response = await api.post('/api/v1/aadhaar/initiate', { aadhaarNumber });
    return response.data;
  },

  /**
   * Verifies the OTP and completes the verification.
   * @param transactionId from the initiate response
   * @param otp 6-digit OTP
   */
  verify: async (transactionId: string, otp: string) => {
    const response = await api.post('/api/v1/aadhaar/verify', { transactionId, otp });
    return response.data;
  },
};
