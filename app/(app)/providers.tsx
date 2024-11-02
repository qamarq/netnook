'use client';

import { AuthProvider } from '@/hooks/Auth';
import { CartProvider } from '@/hooks/Cart';
import React from 'react';

export const Providers: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </AuthProvider>
    )
};
