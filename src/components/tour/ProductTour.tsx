import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TourStep {
  title: string;
  content: string;
  targetId: string;
}

interface ProductTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
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
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, currentStep, steps]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Overlay with Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
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
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Progress Sidebar Card (Similar to the image) */}
      <AnimatePresence>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 20, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="absolute left-4 top-24 w-80 pointer-events-auto"
        >
          <Card className="shadow-2xl border-none overflow-hidden">
            <div className="bg-primary/5 p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-sm">Learn key product features</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-4 transition-colors ${
                      idx === currentStep ? 'bg-primary/10 border-l-4 border-primary' : 'opacity-60'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      idx < currentStep ? 'bg-green-500 text-white' : 
                      idx === currentStep ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {idx < currentStep ? <Check className="h-3 w-3" /> : idx + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${idx === currentStep ? 'text-primary' : ''}`}>
                        {step.title}
                      </p>
                      {idx === currentStep && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          Explore the features of this section.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Floating Tooltip/Popover (Purple box from image) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="fixed z-[101] pointer-events-auto shadow-2xl"
          style={targetRect ? {
            left: targetRect.left + targetRect.width / 2,
            top: targetRect.bottom + 20,
            transform: 'translateX(-50%)',
            position: 'absolute'
          } : {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'fixed'
          }}
        >
          {/* Arrow (only if target exists) */}
          {targetRect && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-purple-600" />
          )}
          
          <div className="bg-purple-600 text-white p-6 rounded-2xl w-[320px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
            
            <h4 className="font-bold text-lg mb-2">{steps[currentStep].title}</h4>
            <p className="text-sm text-purple-50/90 leading-relaxed mb-6">
              {steps[currentStep].content}
            </p>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStep(Math.max(0, currentStep - 1));
                  }}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentStep < steps.length - 1) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      onClose();
                    }
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              <Button
                className="bg-white text-purple-600 hover:bg-white/90 font-bold px-6 h-9 rounded-xl shadow-lg border-none"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    onClose();
                  }
                }}
              >
                {currentStep === steps.length - 1 ? "FINISH" : "NEXT"}
              </Button>
            </div>
            
            <div className="mt-4 flex gap-1 justify-center">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-4 bg-white' : 'w-1 bg-white/30'}`} 
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
