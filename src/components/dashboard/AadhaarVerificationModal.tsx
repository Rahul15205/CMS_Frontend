import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aadhaarService } from '@/services/aadhaarService';
import { ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AadhaarVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AadhaarVerificationModal({ isOpen, onClose, onSuccess }: AadhaarVerificationModalProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input Aadhaar, 2: OTP, 3: Success
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleInitiate = async () => {
        if (!/^\d{12}$/.test(aadhaarNumber)) {
            toast({
                title: "Invalid Aadhaar",
                description: "Please enter a valid 12-digit Aadhaar number.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const data = await aadhaarService.initiate(aadhaarNumber);
            setTransactionId(data.transactionId);
            setStep(2);
            toast({
                title: "OTP Sent",
                description: "An OTP has been sent to your registered mobile.",
            });
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.response?.data?.message || "Failed to initiate verification.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!/^\d{6}$/.test(otp)) {
            toast({
                title: "Invalid OTP",
                description: "Please enter the 6-digit OTP.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await aadhaarService.verify(transactionId, otp);
            setStep(3);
            toast({
                title: "Success",
                description: "Your Aadhaar has been verified successfully.",
            });
            onSuccess();
        } catch (error: any) {
            toast({
                title: "OTP Failed",
                description: error.response?.data?.message || "Invalid OTP entered.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setStep(1);
        setAadhaarNumber('');
        setOtp('');
        setTransactionId('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={resetState}>
            <DialogContent className="sm:max-w-[425px]">
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Verify Aadhaar
                            </DialogTitle>
                            <DialogDescription>
                                Enter your 12-digit Aadhaar number to initiate verification.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                                <Input
                                    id="aadhaar"
                                    placeholder="XXXX XXXX XXXX"
                                    value={aadhaarNumber}
                                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                    maxLength={12}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleInitiate} disabled={isLoading || aadhaarNumber.length < 12}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Get OTP
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 2 && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-primary" />
                                Enter OTP
                            </DialogTitle>
                            <DialogDescription>
                                We've sent a 6-digit verification code to your Aadhaar-linked mobile.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="otp">Verification Code</Label>
                                <Input
                                    id="otp"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Enter the OTP received on your Aadhaar-linked mobile.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                            <Button onClick={handleVerify} disabled={isLoading || otp.length < 6}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-xl mb-2">Verified Successfully!</DialogTitle>
                        <DialogDescription className="mb-6">
                            Your identity has been verified with UIDAI records.
                        </DialogDescription>
                        <Button className="w-full" onClick={resetState}>Close</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
