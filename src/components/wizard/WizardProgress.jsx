import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * WizardProgress - Visual step indicator for the book creation wizard.
 * Shows numbered circles connected by lines, with active/completed states.
 */
export default function WizardProgress({ steps, currentStep, onStepClick, isRTL }) {
  return (
    <div
      className="mb-8"
      dir={isRTL ? "rtl" : "ltr"}
      role="navigation"
      aria-label={isRTL ? "שלבי יצירת הספר" : "Book creation steps"}
    >
      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable = index < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div className="flex flex-col items-center relative">
                <motion.button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center
                    text-sm md:text-base font-bold transition-colors duration-200
                    ${isCompleted
                      ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                      : isActive
                        ? "bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-900"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default"
                    }
                  `}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  aria-label={`${step.title} - ${isCompleted ? (isRTL ? "הושלם" : "completed") : isActive ? (isRTL ? "שלב נוכחי" : "current step") : (isRTL ? "טרם הושלם" : "not completed")}`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.button>

                {/* Step label (below circle) */}
                <span
                  className={`
                    mt-2 text-xs md:text-sm font-medium text-center max-w-[80px] md:max-w-[100px]
                    ${isActive ? "text-purple-700 dark:text-purple-300" : "text-gray-500 dark:text-gray-400"}
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 md:mx-4 h-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                  <motion.div
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
