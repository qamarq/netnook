"use client"

import { useAuth } from '@/hooks/Auth'
import React from 'react'

export default function LogoutBtn({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth()
    
    return (
        <div onClick={logout}>
            {children}
        </div>
    )
}
