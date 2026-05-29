// src/components/Sidebar.tsx
'use client';

import { supabase } from '@/lib/supabase';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isAdmin: boolean;
  onOpenLogin: () => void;
}

export default function Sidebar({ currentView, setView, isAdmin, onOpenLogin }: SidebarProps) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setView('home');
    };

    return (
        <aside className="hidden lg:flex flex-col w-20 hover:w-72 transition-all duration-300 ease-in-out bg-slate-900 h-screen sticky top-0 text-white shadow-xl z-50 group whitespace-nowrap shrink-0 overflow-hidden">
            {/* Logo Section */}
            <div className="flex items-center gap-4 cursor-default p-4 md:p-6 border-b border-slate-800 shrink-0">
                <div className="bg-white p-0.5 rounded-xl shadow-lg shadow-blue-500/10 shrink-0 mx-auto group-hover:mx-0 w-10.5 h-10.5 flex items-center justify-center overflow-hidden">
                    <i className="fa-solid fa-cloud text-blue-600 text-xl"></i>
                </div>
                <h1 className="font-black text-2xl tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-clip-text text-transparent bg-linear-to-r from-white to-blue-200" style={{ fontFamily: "'Poppins', sans-serif" }}>MedDash</h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar-hide-mobile p-4 md:p-6 space-y-3 w-full">
                <button onClick={() => setView('home')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'home' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-house"></i></div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Home</span>
                </button>
                <button onClick={() => setView('orgchart')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'orgchart' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-sitemap"></i></div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">ဖွဲ့စည်းပုံ</span>
                </button>
                <button onClick={() => setView('hospitals')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'hospitals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-hospital"></i></div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">ဆေးရုံများ</span>
                </button>
                <button onClick={() => setView('documents')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'documents' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-file-pdf"></i></div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">စာရွက်စာတမ်းများ</span>
                </button>
                
                {/* Admin သာ မြင်ရမည့် Menu များ */}
                {isAdmin && (
                    <>
                        <button onClick={() => setView('tmo')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'tmo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}>
                            <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-address-book"></i></div>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">TMO Contacts</span>
                        </button>
                        <button onClick={() => setView('dashboard')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}>
                            <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-users"></i></div>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">ဝန်ထမ်းအင်အားစာရင်း</span>
                        </button>

                        <div className="h-px bg-slate-800 my-2 mx-4"></div>
                        
                        {/* Recycle Bin ခလုတ် အသစ် */}
                        <button onClick={() => setView('recyclebin')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'recyclebin' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'hover:bg-slate-800 text-slate-400'}`}>
                            <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-trash-can"></i></div>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">အမှိုက်ပုံး</span>
                        </button>
                    </>
                )}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 md:p-6 border-t border-slate-800 shrink-0 bg-slate-900/90 flex flex-col gap-2">
                
                {!isAdmin ? (
                    <button onClick={onOpenLogin} className="flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left hover:bg-slate-800 text-emerald-400">
                        <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-lock"></i></div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Admin Login</span>
                    </button>
                ) : (
                    <button onClick={handleLogout} className="flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left hover:bg-slate-800 text-red-400">
                        <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-right-from-bracket"></i></div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">Logout</span>
                    </button>
                )}

                <div className="h-px bg-slate-800 my-1 mx-2"></div>
                
                <button onClick={() => setView('settings')} className={`flex items-center gap-4 w-full p-3.5 rounded-xl transition-all font-medium text-lg text-left ${currentView === 'settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <div className="w-6 flex justify-center shrink-0"><i className="fa-solid fa-gear"></i></div>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">ဆက်တင်များ</span>
                </button>

                <div className="flex items-center gap-4 p-2 group-hover:p-4 bg-transparent group-hover:bg-slate-800/50 rounded-2xl transition-all mt-2 cursor-default">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mx-auto group-hover:mx-0 shadow-inner">
                        <div className={`w-3 h-3 rounded-full ${isAdmin ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-slate-400 font-medium mb-0.5">{isAdmin ? 'Admin Cloud' : 'Public Sync'}</p>
                        <p className="text-sm font-medium text-blue-300">Connected</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}