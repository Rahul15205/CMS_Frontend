import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TourStep {
  title: string;
  content: string;
  targetSelector: string;
}

interface ProductTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({
  steps,
  isOpen,
  onClose,
  currentStep,
  setCurrentStep,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const element = document.querySelector(steps[currentStep].targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 100);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, currentStep, steps]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: targetRect.left - 8,
                  y: targetRect.top - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Floating Tooltip Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="fixed z-[150] pointer-events-auto"
          style={(() => {
            if (!targetRect) {
              return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
            }
            
            const isBottomHalf = targetRect.top > window.innerHeight * 0.6;
            return {
              left: targetRect.left + targetRect.width / 2,
              top: isBottomHalf ? targetRect.top - 20 : targetRect.bottom + 20,
              transform: `translateX(-50%) ${isBottomHalf ? 'translateY(-100%)' : ''}`,
              position: 'fixed'
            };
          })()}
        >
          <Card className="bg-white text-slate-900 border-none rounded-2xl shadow-2xl w-[320px] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    <h4 className="font-bold text-lg leading-tight">{steps[currentStep].title}</h4>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {steps[currentStep].content}
                </p>
                
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStep(prev => typeof prev === 'number' ? Math.max(0, prev - 1) : prev);
                    }}
                    disabled={currentStep === 0}
                  >
                    ← Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-muted-foreground hover:text-foreground text-xs"
                      onClick={onClose}
                    >
                      Skip
                    </Button>
                    <Button
                      className="bg-primary text-white hover:bg-primary/90 font-bold px-5 h-9 rounded-xl shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentStep < steps.length - 1) {
                          setCurrentStep(prev => typeof prev === 'number' ? prev + 1 : prev);
                        } else {
                          onClose();
                        }
                      }}
                    >
                      {currentStep === steps.length - 1 ? "Finish" : "Next →"}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1 bg-slate-100 w-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Arrow */}
          {targetRect && (
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent ${
                targetRect.top > window.innerHeight * 0.6 
                  ? 'border-t-[8px] border-t-white -bottom-2' 
                  : 'border-b-[8px] border-b-white -top-2'
              }`} 
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
