import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

export interface LoadingState {
  text: string;
}

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = false,
  onComplete,
}: {
  loadingStates: LoadingState[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
  onComplete?: () => void;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1)
      );
      
      // If we reached the end and not looping, trigger onComplete
      if (!loop && currentState === loadingStates.length - 2) {
        // We check length - 2 because after this timeout we will be at length - 1
        setTimeout(() => {
          if (onComplete) onComplete();
        }, duration);
      }
      
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-xl bg-[#0a0a0a]/80"
          style={{ zIndex: 100 }}
        >
          <div className="relative max-w-xl mx-auto px-8 w-full flex flex-col justify-center h-full">
            <div className="relative">
              {loadingStates.map((state, index) => {
                const distance = Math.abs(index - currentState);
                const opacity = Math.max(1 - distance * 0.2, 0); // Fade out steps further away

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: index > currentState ? 0 : opacity,
                      y: -(currentState - index) * 40,
                      scale: index === currentState ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={twMerge(
                      "text-left flex items-center gap-4 absolute left-0 right-0 w-full",
                      index === currentState ? "text-white" : "text-gray-500"
                    )}
                    style={{
                      top: "50%",
                      transform: "translateY(-50%)"
                    }}
                  >
                    <div>
                      {index < currentState ? (
                        <CheckCircle2 size={32} className="text-[var(--accent-color)]" />
                      ) : index === currentState ? (
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--accent-color)] animate-spin flex items-center justify-center" />
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-600" />
                      )}
                    </div>
                    
                    <span
                      className={twMerge(
                        "text-2xl font-heading tracking-widest uppercase transition-colors duration-300",
                        index === currentState ? "text-[var(--accent-color)]" : "text-gray-500"
                      )}
                    >
                      {state.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
