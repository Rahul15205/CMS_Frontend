import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

export interface TourStep {
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

    // Remove forced scrolling from the continuous update logic
    const updateRect = () => {
      const element = document.querySelector(steps[currentStep].targetSelector);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 100);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, currentStep, steps]);

  // Only scroll into view when the step actually changes
  useEffect(() => {
    if (!isOpen) return;
    
    const element = document.querySelector(steps[currentStep].targetSelector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
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
            
            const viewportWidth = window.innerWidth;
            const tooltipWidth = Math.min(350, viewportWidth - 40);
            const padding = 20;
            const isBottomHalf = targetRect.top > window.innerHeight * 0.6;
            const targetCenter = targetRect.left + targetRect.width / 2;
            
            // Calculate and clamp left position
            let leftPos = targetCenter - tooltipWidth / 2;
            if (leftPos + tooltipWidth > viewportWidth - padding) {
              leftPos = viewportWidth - padding - tooltipWidth;
            }
            if (leftPos < padding) {
              leftPos = padding;
            }
            
            return {
              left: leftPos,
              top: isBottomHalf ? targetRect.top - 20 : targetRect.bottom + 20,
              transform: isBottomHalf ? 'translateY(-100%)' : 'none',
              position: 'fixed',
              width: tooltipWidth,
              zIndex: 150
            };
          })()}
        >
          <Card className="bg-white text-slate-900 border-none rounded-2xl shadow-2xl w-full overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                    <h4 className="font-bold text-lg leading-tight block">{steps[currentStep].title}</h4>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-full"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {steps[currentStep].content}
                </p>
                
                <div className="flex items-center justify-between gap-2 border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-3 rounded-xl text-slate-500 hover:bg-slate-50 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStep(prev => typeof prev === 'number' ? Math.max(0, prev - 1) : prev);
                    }}
                    disabled={currentStep === 0}
                  >
                    ← Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-muted-foreground hover:text-destructive text-xs font-semibold"
                      onClick={onClose}
                    >
                      Skip
                    </Button>
                    <Button
                      className="bg-primary text-white hover:bg-primary/90 font-bold px-4 h-9 rounded-xl shadow-md transition-all active:scale-95"
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
              className={`absolute w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent ${
                targetRect.top > window.innerHeight * 0.6 
                  ? 'border-t-[8px] border-t-white -bottom-2' 
                  : 'border-b-[8px] border-b-white -top-2'
              }`}
              style={(() => {
                const viewportWidth = window.innerWidth;
                const tooltipWidth = Math.min(350, viewportWidth - 40);
                const padding = 20;
                const targetCenter = targetRect.left + targetRect.width / 2;
                
                let leftPos = targetCenter - tooltipWidth / 2;
                if (leftPos + tooltipWidth > viewportWidth - padding) {
                  leftPos = viewportWidth - padding - tooltipWidth;
                }
                if (leftPos < padding) {
                  leftPos = padding;
                }
                
                return {
                  left: targetCenter - leftPos,
                  transform: 'translateX(-50%)'
                };
              })()}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
