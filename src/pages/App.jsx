import React from 'react';
import { ToastProvider } from "@/components/ui/toast";

function App({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

export default App;