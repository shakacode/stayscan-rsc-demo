import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
// Base CSS is loaded from the client pack (packs/application.js), never the SSR bundle.

// Themed toast host mounted once per layout; `toast()` is re-exported so callers
// fire notifications without importing react-toastify directly.
export default function ToastHost() {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={4000}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="light"
    />
  );
}

export { toast };
