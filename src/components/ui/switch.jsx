import * as React from "react";

/**
 * מרכיב מתג ויזואלי לשליטה על הגדרות ובחירות בוליאניות
 */
const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      ref={ref}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors focus-visible:outline-none 
        focus-visible:ring-2 focus-visible:ring-offset-2 
        ${checked ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-300 dark:bg-gray-700'}
        ${className || ''}
      `}
      {...props}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full
          bg-white shadow-md transition-transform
          ${checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
});

Switch.displayName = "Switch";

export { Switch };