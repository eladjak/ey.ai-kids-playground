import React, { useState, useEffect } from "react";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";

export default function ArtStyleOption({ id, name, image, description, isSelected }) {
  const [currentLanguage, setCurrentLanguage] = useState("english");
  
  // Load language preference
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language");
    if (storedLanguage) {
      setCurrentLanguage(storedLanguage);
    }
    
    const handleStorageChange = (e) => {
      if (e.key === "language") {
        setCurrentLanguage(e.newValue || "english");
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Determine text direction
  const isRTL = currentLanguage === "hebrew" || currentLanguage === "yiddish";

  return (
    <motion.label
      htmlFor={`art-style-${id}`}
      className={`relative flex flex-col overflow-hidden rounded-xl cursor-pointer transition-all duration-300 card-hover-effect ${
        isSelected
          ? "ring-2 ring-purple-500 dark:ring-purple-400 bg-purple-50 dark:bg-purple-900/30"
          : "ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-purple-200 dark:hover:ring-purple-800"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        
        {isSelected && (
          <motion.div 
            className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </div>
      
      <div className="p-3">
        <div className={`flex items-${isRTL ? 'end' : 'start'} space-${isRTL ? 'x-reverse' : 'x'}-2 mb-1`}>
          <RadioGroupItem 
            value={id} 
            id={`art-style-${id}`} 
            className={`${isSelected ? 'border-purple-600 bg-purple-600 text-white' : ''}`}
          />
          <span className="font-medium text-gray-900 dark:text-white">{name}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </motion.label>
  );
}