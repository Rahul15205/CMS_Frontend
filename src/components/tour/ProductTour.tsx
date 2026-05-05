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


      {/* Floating Tooltip/Popover (Purple box from image) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="fixed z-[150] pointer-events-auto shadow-2xl"
          style={(() => {
            if (!targetRect) {
              return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
            }
            
            const isBottomHalf = targetRect.top > window.innerHeight * 0.6;
            return {
              left: targetRect.left + targetRect.width / 2,
              top: isBottomHalf ? targetRect.top - 20 : targetRect.bottom + 20,
              transform: `translateX(-50%) ${isBottomHalf ? 'translateY(-100%)' : ''}`,
              position: 'fixed' // Using fixed to stay in viewport
            };
          })()}
        >
          {/* Arrow */}
          {targetRect && (
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent ${
                targetRect.top > window.innerHeight * 0.6 
                  ? 'border-t-[10px] border-t-purple-600 -bottom-2' 
                  : 'border-b-[10px] border-b-purple-600 -top-2'
              }`} 
            />
          )}
          
          <div className="bg-purple-600 text-white p-6 rounded-2xl w-[340px] relative shadow-2xl ring-4 ring-white/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
            
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-200 block mb-1">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <h4 className="font-bold text-lg leading-tight">{steps[currentStep].title}</h4>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] text-purple-200 hover:text-white hover:bg-white/10 uppercase tracking-wider font-bold"
                onClick={onClose}
              >
                Skip
              </Button>
            </div>

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
