import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AadhaarVerificationModal } from './AadhaarVerificationModal';
import { aadhaarService } from '@/services/aadhaarService';

// Mock the services
vi.mock('@/services/aadhaarService', () => ({
  aadhaarService: {
    initiate: vi.fn(),
    verify: vi.fn(),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('AadhaarVerificationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Step 1 initially and allows Aadhaar input', () => {
    render(<AadhaarVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    expect(screen.getByText(/Verify Aadhaar/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/XXXX XXXX XXXX/i);
    fireEvent.change(input, { target: { value: '123412341234' } });
    expect(input).toHaveValue('123412341234');
  });

  it('transitions to Step 2 after initiating verification', async () => {
    // Mock the initiate response
    (aadhaarService.initiate as any).mockResolvedValue({ transactionId: 'tx-1' });

    render(<AadhaarVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    const input = screen.getByPlaceholderText(/XXXX XXXX XXXX/i);
    fireEvent.change(input, { target: { value: '123412341234' } });
    
    const button = screen.getByText(/Get OTP/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Enter OTP/i)).toBeInTheDocument();
    });
  });

  it('shows success message after successful OTP verification', async () => {
    (aadhaarService.initiate as any).mockResolvedValue({ transactionId: 'tx-1' });
    (aadhaarService.verify as any).mockResolvedValue({ success: true });

    render(<AadhaarVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Step 1
    fireEvent.change(screen.getByPlaceholderText(/XXXX XXXX XXXX/i), { target: { value: '123412341234' } });
    fireEvent.click(screen.getByText(/Get OTP/i));

    // Wait for Step 2
    await waitFor(() => screen.getByPlaceholderText(/123456/i));
    
    // Step 2
    fireEvent.change(screen.getByPlaceholderText(/123456/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify/i));

    // Wait for Step 3
    await waitFor(() => {
      expect(screen.getByText(/Verified Successfully/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
