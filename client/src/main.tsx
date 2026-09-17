import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Root element #root not found');
}

createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider><CartProvider><App /></CartProvider></AuthProvider>
  </StrictMode>,
);
