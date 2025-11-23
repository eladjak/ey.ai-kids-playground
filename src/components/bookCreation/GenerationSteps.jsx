import React from 'react';
import { Circle, CheckCircle, BookText, Image, Music } from 'lucide-react';

export default function GenerationSteps({ currentStep }) {
  const steps = [
    {
      id: "generating_story",
      title: "Generating Story",
      icon: BookText,
      description: "Creating a personalized story based on your inputs"
    },
    {
      id: "generating_images",
      title: "Creating Illustrations",
      icon: Image,
      description: "Generating beautiful illustrations for each page"
    },
    {
      id: "generating_audio",
      title: "Adding Audio",
      icon: Music,
      description: "Creating narration and sound effects"
    },
    {
      id: "complete",
      title: "Book Complete",
      icon: CheckCircle,
      description: "Your book is ready to read and share"
    }
  ];

  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="space-y-6">
      <ul className="space-y-4">
        {steps.map((step, index) => {
          // Determine step status
          const isComplete = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <li key={step.id} className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-1.5 ${
                isComplete 
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                  : isCurrent 
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse" 
                    : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}>
                {isComplete ? (
                  <CheckCircle className="h-4 w-4" />
                ) : isCurrent ? (
                  <step.icon className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className={`font-medium ${
                  isComplete 
                    ? "text-green-800 dark:text-green-300" 
                    : isCurrent 
                      ? "text-blue-800 dark:text-blue-300" 
                      : "text-gray-700 dark:text-gray-300"
                }`}>
                  {step.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}