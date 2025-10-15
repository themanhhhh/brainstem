"use client";

import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LoadingProvider } from '../context/LoadingContext';

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CartProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

