// src/components/SettingsView.tsx
'use client';

import { t } from '@/data/constants';

interface SettingsViewProps {
    lang: string;
    setLang: (lang: string) => void;
    isAdmin: boolean;
}

export default function SettingsView({ lang, setLang, isAdmin }: SettingsViewProps) {
    const dict = t[lang] || t['mm'];

    const toggleLanguage = () => {
        setLang(lang === 'mm' ? 'en' : 'mm');
    };

    // Database ကို JSON file အဖြစ် Download ဆွဲရန် (Admin Only Feature)
    // မှတ်ချက်: Next.js Server Components များနှင့် ချိတ်ဆက်၍ Data အားလုံးကို ဆွဲယူသင့်သော်လည်း 
    // လောလောဆယ်တွင် Demo အနေဖြင့်သာ ထားရှိပါသည်။
    const exportFullBackup = () => {
        alert("Database Backup ထုတ်ရန် API ချိတ်ဆက်မှု လိုအပ်ပါသေးသည်။\n(Supabase မှ Data အားလုံးကို ဆွဲယူမည့် Function ရေးရန် လိုပါသည်။)");
    };

    return (
        <div className="animate-in pb-10 flex-1">
            <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200 max-w-3xl mx-auto mt-4">
                
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="bg-slate-100 text-slate-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner">
                        <i className="fa-solid fa-gear"></i>
                    </span>
                    <span>{dict.settings || 'ဆက်တင်များ'}</span>
                </h3>

                <div className="space-y-4">
                    
                    {/* ဘာသာစကား ပြောင်းရန် */}
                    <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <h4 className="font-bold text-slate-800 text-base md:text-lg">{dict.languageSetting || 'ဘာသာစကားပြောင်းရန်'}</h4>
                            <p className="text-xs md:text-sm text-slate-500 font-medium">မြန်မာ / English</p>
                        </div>
                        <button onClick={toggleLanguage} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                            <i className="fa-solid fa-language text-xl"></i>
                            <span className="tracking-widest uppercase">{lang}</span>
                        </button>
                    </div>

                    {/* App Version ပြသရန် */}
                    <div className="flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                            <h4 className="font-bold text-slate-800 text-base md:text-lg">{dict.appVersion || 'App ဗားရှင်း'}</h4>
                            <p className="text-xs md:text-sm text-slate-500 font-medium">လက်ရှိအသုံးပြုနေသော ဗားရှင်း</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium tracking-wider border border-indigo-200">
                            Version 2.5 Pro Secured (Next.js)
                        </span>
                    </div>

                    {/* Database Backup (Admin သာ မြင်ရမည်) */}
                    {isAdmin && (
                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <h4 className="font-bold text-slate-800 text-base md:text-lg">Database Backup</h4>
                                <p className="text-xs md:text-sm text-slate-500 font-medium">Export all data as JSON</p>
                            </div>
                            <button onClick={exportFullBackup} className="mt-3 sm:mt-0 flex items-center justify-center w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                <i className="fa-solid fa-database"></i>
                                Download JSON
                            </button>
                        </div>
                    )}
                    
                </div>
            </div>
        </div>
    );
}