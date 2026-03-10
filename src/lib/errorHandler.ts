/**
 * Global API Error Handler
 * 
 * Provides user-friendly toast notifications for API errors.
 * Uses the `sonner` toast library already installed in the project.
 */

import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Display a user-friendly toast notification for an API error.
 * Call this in your service layer's catch blocks.
 */
export function handleApiError(error: unknown, context?: string): void {
  // LOG EXACT ERROR FOR DEBUGGING:
  console.error("====== TRUE API ERROR CAUSE ======", error);

  if (!(error instanceof AxiosError) && !(error as any)?.response) {
    // Network or unknown error
    toast.error(context ? `${context}: Network error` : 'Network error. Please check your connection.');
    return;
  }

  const axiosError = error as AxiosError<ApiErrorResponse>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  // Extract message from response
  let message: string;
  if (Array.isArray(data?.message)) {
    message = data.message.join(', ');
  } else if (typeof data?.message === 'string') {
    message = data.message;
  } else if (data?.error) {
    message = data.error;
  } else {
    message = axiosError.message || 'Something went wrong';
  }

  const prefix = context ? `${context}: ` : '';

  switch (status) {
    case 400:
      toast.error(`${prefix}Validation Error`, { description: message });
      break;
    case 401:
      // Usually handled by interceptor, but just in case
      toast.error('Session expired. Please login again.');
      break;
    case 403:
      toast.error(`${prefix}Access Denied`, {
        description: 'You do not have permission for this action.',
      });
      break;
    case 404:
      toast.error(`${prefix}Not Found`, { description: message });
      break;
    case 409:
      toast.error(`${prefix}Conflict`, { description: message });
      break;
    case 422:
      toast.error(`${prefix}Validation Failed`, { description: message });
      break;
    case 429:
      toast.error('Too Many Requests', {
        description: 'Please wait a moment before trying again.',
      });
      break;
    default:
      if (status && status >= 500) {
        toast.error('Server Error', {
          description: 'An internal error occurred. Please try again later.',
        });
      } else {
        toast.error(`${prefix}Error`, { description: message });
      }
  }
}

/**
 * Extract a clean error message string from an axios error.
 * Useful for setting error state in components.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (Array.isArray(data?.message)) return data.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    if (data?.error) return data.error;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
