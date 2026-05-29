// src/components/LoginModal.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Modal ပိတ်ထားလျှင် ဘာမှမပေါ်စေရန်
    if (!isOpen) return null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Supabase ဖြင့် Login ဝင်ခြင်း
            const { error } = await supabase.auth.signInWithPassword({ 
                email: email, 
                password: password 
            });

            if (error) {
                throw error;
            }

            // Login အောင်မြင်ပါက Modal ကိုပိတ်မည် 
            // (App.js တွင် auth state အလိုအလျောက်ပြောင်းသွားပါမည်)
            alert("Login အောင်မြင်ပါသည်!");
            onClose();
            
        } catch (error: any) {
            console.error("Login Error:", error);
            alert("Login မအောင်မြင်ပါ။ Email နှင့် Password ကို ပြန်စစ်ဆေးပေးပါ။\n(Hint: " + error.message + ")");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
            {/* Modal Box */}
            <div className="bg-white w-full max-w-sm rounded-4xl shadow-2xl overflow-hidden relative">
                
                {/* Loading State Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <i className="fa-solid fa-spinner fa-spin text-blue-600 text-4xl mb-4"></i>
                        <p className="font-bold text-blue-600">Login ဝင်နေပါသည်...</p>
                    </div>
                )}

                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-slate-800">
                            <i className="fa-solid fa-lock text-blue-600 mr-2"></i>
                            Admin Login
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email / အီးမေးလ်</label>
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@meddash.com" 
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-slate-800 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Password / စကားဝှက်</label>
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-slate-800 text-sm" 
                            />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-medium shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all mt-4 disabled:opacity-70">
                            Login ဝင်မည်
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}