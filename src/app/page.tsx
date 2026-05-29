// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Components
import SplashScreen from '@/components/SplashScreen';
import Sidebar from '@/components/Sidebar';
import HomeView from '@/components/HomeView';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import OrgChartView from '@/components/OrgChartView';
import HospitalsView from '@/components/HospitalsView';
import DocumentsView from '@/components/DocumentsView';
import TmoView from '@/components/TmoView';
import SettingsView from '@/components/SettingsView';
import LoginModal from '@/components/LoginModal';
import RecycleBinView from '@/components/RecycleBinView';

export default function Home() {
  const [currentView, setCurrentView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState('mm');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Authentication State စစ်ဆေးခြင်း
  useEffect(() => {
    // ဝင်ထားပြီးသား Session ရှိမရှိ စစ်ဆေးသည်
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session?.user);
    });

    // Login (သို့) Logout လုပ်ချိန်တွင် State ကို အလိုအလျောက် ပြောင်းပေးသည်
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMobileNav = (view: string) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      <SplashScreen />

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      <div className="min-h-screen w-full flex flex-col lg:flex-row">
        {/* Sidebar သို့ Login ဖွင့်ရန် Function ပို့ပေးသည် */}
        <Sidebar 
          currentView={currentView} 
          setView={setCurrentView} 
          isAdmin={isAdmin}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />

        <main className="flex-1 flex flex-col p-4 md:p-10 max-w-360 mx-auto w-full relative z-10 min-h-screen">
            
            {/* Header */}
            <div className="flex justify-between items-start md:items-center mb-8 md:mb-10 w-full relative z-30 shrink-0 gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">
                        {lang === 'mm' ? 'ရှမ်းပြည်နယ်(တောင်ပိုင်း)ပြည်နယ်ကုသရေးဦးစီးဌာန' : 'Shan State (South) Public Health Department'}
                    </h2>
                </div>
                
                <div className="lg:hidden relative shrink-0">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center justify-center bg-white border border-slate-200 w-12 h-12 rounded-xl hover:bg-slate-50 transition-all shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none z-50 relative">
                        <i className="fa-solid fa-bars text-xl text-slate-700"></i>
                    </button>

                    {isMenuOpen && (
                        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)}>
                            <div className="absolute top-20 right-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in overflow-y-auto max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                                <button onClick={() => handleMobileNav('home')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'home' ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-slate-700'}`}><i className="fa-solid fa-house w-6 text-center text-slate-400"></i><span>Home</span></button>
                                <button onClick={() => handleMobileNav('orgchart')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'orgchart' ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-slate-700'}`}><i className="fa-solid fa-sitemap w-6 text-center text-slate-400"></i><span>ဖွဲ့စည်းပုံ</span></button>
                                <button onClick={() => handleMobileNav('hospitals')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'hospitals' ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-slate-700'}`}><i className="fa-solid fa-hospital w-6 text-center text-slate-400"></i><span>ဆေးရုံများ</span></button>
                                <button onClick={() => handleMobileNav('documents')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'documents' ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-slate-700'}`}><i className="fa-solid fa-file-pdf w-6 text-center text-slate-400"></i><span>စာရွက်စာတမ်းများ</span></button>
                                
                                {isAdmin && (
                    <>
                        <button onClick={() => handleMobileNav('tmo')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'tmo' ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-slate-700'}`}>
                                            <i className="fa-solid fa-address-book w-6 text-center text-slate-400"></i>
                                            <span>TMO Contacts</span>
                                        </button>
                                        
                                        <button onClick={() => handleMobileNav('dashboard')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-slate-700'}`}>
                                            <i className="fa-solid fa-users w-6 text-center text-slate-400"></i>
                                            <span>ဝန်ထမ်းအင်အားစာရင်း</span>
                                        </button>

                                        <div className="h-px bg-slate-100 my-2 mx-4"></div>
                                        
                                        <button onClick={() => handleMobileNav('recyclebin')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'recyclebin' ? 'bg-red-50 text-red-600' : 'hover:bg-red-50 text-red-400'}`}>
                                            <i className="fa-solid fa-trash-can w-6 text-center text-slate-400"></i>
                                            <span>အမှိုက်ပုံး (Recycle Bin)</span>
                                        </button>
                                    </>
                                )}
                                <div className="h-px bg-slate-100 my-2 mx-4"></div>
                                
                                {!isAdmin ? (
                                    <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-4 w-full px-5 py-3.5 text-left hover:bg-emerald-50 transition-colors font-medium text-[15px] text-emerald-600"><i className="fa-solid fa-lock w-6 text-center"></i>Admin Login</button>
                                ) : (
                                    <button onClick={async () => { await supabase.auth.signOut(); setIsMenuOpen(false); setCurrentView('home'); }} className="flex items-center gap-4 w-full px-5 py-3.5 text-left hover:bg-red-50 transition-colors font-medium text-[15px] text-red-600"><i className="fa-solid fa-right-from-bracket w-6 text-center"></i>Logout</button>
                                )}
                                
                                <button onClick={() => handleMobileNav('settings')} className={`flex items-center gap-4 w-full px-5 py-3.5 text-left transition-colors font-medium text-[15px] ${currentView === 'settings' ? 'bg-slate-100 text-slate-800' : 'hover:bg-slate-50 text-slate-600'}`}><i className="fa-solid fa-gear w-6 text-center text-slate-400"></i><span>ဆက်တင်များ</span></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Views */}
            <div className="flex-1 w-full">
               {currentView === 'home' && <HomeView lang={lang} isAdmin={isAdmin} />}
               {currentView === 'dashboard' && <EmployeeDashboard lang={lang} isAdmin={isAdmin} />}
               {currentView === 'orgchart' && <OrgChartView />}
               {currentView === 'hospitals' && <HospitalsView lang={lang} isAdmin={isAdmin} />}
               {currentView === 'documents' && <DocumentsView lang={lang} isAdmin={isAdmin} />}
               {currentView === 'tmo' && <TmoView lang={lang} isAdmin={isAdmin} />}
               {currentView === 'recyclebin' && <RecycleBinView isAdmin={isAdmin} />}
               {currentView === 'settings' && <SettingsView lang={lang} setLang={setLang} isAdmin={isAdmin} />}
            </div>
            
            {/* Footer */}
            <footer className="mt-auto pt-6 pb-2 w-full text-center shrink-0">
                <p className="text-slate-400 font-medium text-xs md:text-sm flex items-center justify-center gap-2">
                    <i className="fa-regular fa-copyright"></i>
                    2026 kyawkhaung <span className="text-slate-300">|</span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">v2.5 Secured (Next.js)</span>
                </p>
            </footer>

        </main>
      </div>
    </>
  );
}