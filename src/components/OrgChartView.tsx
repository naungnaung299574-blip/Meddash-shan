// src/components/OrgChartView.tsx
'use client';

import { useState, ReactNode } from 'react';

// အရောင် အမျိုးအစားများကို တိတိကျကျ သတ်မှတ်ပေးခြင်း (TypeScript Error ဖြေရှင်းရန်)
type ThemeColor = 'blue' | 'emerald' | 'amber';

interface NodeProps {
    title: string;
    subtitle?: string;
    color?: ThemeColor;
}

interface VLineProps {
    color?: ThemeColor;
    height?: string;
}

interface ChildNodeProps {
    children: ReactNode;
    isFirst?: boolean;
    isLast?: boolean;
    isOnly?: boolean;
    color?: ThemeColor;
}

export default function OrgChartView({ isAdmin = false }: { isAdmin?: boolean }) {
    const [activeTab, setActiveTab] = useState<'state' | 'district' | 'township' | null>(null);

    // --- အထောက်အကူပြု UI Components များ ---
    const Node = ({ title, subtitle, color = 'blue' }: NodeProps) => {
        const borderColors: Record<ThemeColor, string> = { blue: 'border-blue-200', emerald: 'border-emerald-200', amber: 'border-amber-200' };
        const bgColors: Record<ThemeColor, string> = { blue: 'bg-blue-50', emerald: 'bg-emerald-50', amber: 'bg-amber-50' };
        const textColors: Record<ThemeColor, string> = { blue: 'text-blue-800', emerald: 'text-emerald-800', amber: 'text-amber-800' };
        
        return (
            <div className={`border-2 ${borderColors[color]} ${bgColors[color]} p-3 md:p-4 rounded-2xl shadow-sm z-10 w-44 md:w-52 text-center relative mx-auto`}>
                <h4 className={`font-bold text-[13px] md:text-sm leading-relaxed ${textColors[color]}`}>{title}</h4>
                {subtitle && <p className="text-[11px] md:text-xs mt-1 text-slate-500 font-medium">{subtitle}</p>}
            </div>
        );
    };

    const VLine = ({ color = 'blue', height = 'h-6 md:h-8' }: VLineProps) => {
        const bgs: Record<ThemeColor, string> = { blue: 'bg-blue-300', emerald: 'bg-emerald-300', amber: 'bg-amber-300' };
        return <div className={`w-0.5 ${height} ${bgs[color]} mx-auto`}></div>;
    };

    const ChildNode = ({ children, isFirst, isLast, isOnly, color = 'blue' }: ChildNodeProps) => {
        const bgs: Record<ThemeColor, string> = { blue: 'bg-blue-300', emerald: 'bg-emerald-300', amber: 'bg-amber-300' };
        let topLineWidth = "w-full";
        let topLinePosition = "left-0";
        
        if (isOnly) {
            topLineWidth = "w-0";
        } else if (isFirst) {
            topLineWidth = "w-1/2";
            topLinePosition = "right-0";
        } else if (isLast) {
            topLineWidth = "w-1/2";
            topLinePosition = "left-0";
        }

        return (
            <div className="flex flex-col items-center px-1 md:px-2 relative">
                {!isOnly && <div className={`absolute top-0 h-0.5 ${bgs[color]} ${topLineWidth} ${topLinePosition}`}></div>}
                {!isOnly && <div className={`w-0.5 h-6 md:h-8 ${bgs[color]}`}></div>}
                <div>{children}</div>
            </div>
        );
    };

    return (
        <div className="animate-in pb-10">
            <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200">
                <header className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-6">
                    <span className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                        <i className="fa-solid fa-sitemap"></i>
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
                        ဖွဲ့စည်းပုံ (Organization Chart)
                    </h3>
                </header>

                {/* ရွေးချယ်ရန် ခလုတ် (၃) ခု */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button 
                        onClick={() => setActiveTab(activeTab === 'state' ? null : 'state')} 
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'state' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-600 ring-offset-2' : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200'}`}
                    >
                        <i className="fa-solid fa-building-flag text-lg"></i> 
                        <span>ပြည်နယ်အဆင့်</span>
                        <i className={`fa-solid fa-chevron-down ml-2 transition-transform ${activeTab === 'state' ? 'rotate-180' : ''}`}></i>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab(activeTab === 'district' ? null : 'district')} 
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'district' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-600 ring-offset-2' : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200'}`}
                    >
                        <i className="fa-solid fa-building-user text-lg"></i> 
                        <span>ခရိုင်အဆင့်</span>
                        <i className={`fa-solid fa-chevron-down ml-2 transition-transform ${activeTab === 'district' ? 'rotate-180' : ''}`}></i>
                    </button>

                    <button 
                        onClick={() => setActiveTab(activeTab === 'township' ? null : 'township')} 
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'township' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-500 ring-offset-2' : 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 border border-slate-200'}`}
                    >
                        <i className="fa-solid fa-hospital text-lg"></i> 
                        <span>မြို့နယ်အဆင့်</span>
                        <i className={`fa-solid fa-chevron-down ml-2 transition-transform ${activeTab === 'township' ? 'rotate-180' : ''}`}></i>
                    </button>
                </div>

                {!activeTab && (
                    <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in">
                        <i className="fa-solid fa-hand-pointer text-4xl mb-4 text-blue-300 opacity-50"></i>
                        <p className="font-medium text-sm md:text-base text-slate-500">အထက်ပါ ခလုတ်များကို နှိပ်၍ ဖွဲ့စည်းပုံများကို ကြည့်ရှုနိုင်ပါသည်</p>
                    </div>
                )}

                {/* ပြည်နယ်အဆင့် ဖွဲ့စည်းပုံ */}
                {activeTab === 'state' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="w-full overflow-x-auto custom-scrollbar-hide-mobile bg-slate-50/50 rounded-3xl border border-slate-100 p-4 md:p-10">
                            <div className="min-w-max flex flex-col items-center mx-auto">
                                <Node title="ပြည်နယ်ကုသရေးဦးစီးဌာနမှူး" color="blue" />
                                <VLine color="blue" />
                                
                                <div className="flex justify-center w-full">
                                    <ChildNode isFirst color="blue">
                                        <Node title="ဒုတိယပြည်နယ်ဦးစီးဌာနမှူး" subtitle="(စီမံ/ဘဏ္ဍာ)" color="blue" />
                                        <VLine color="blue" />
                                        <Node title="လက်ထောက်ညွှန်ကြားရေးမှူး" color="blue" />
                                    </ChildNode>
                                    
                                    <ChildNode color="blue">
                                        <Node title="ဒုတိယပြည်နယ်ဦးစီးဌာနမှူး" subtitle="(ကုသရေး)" color="blue" />
                                        <VLine color="blue" />
                                        <Node title="လက်ထောက်ညွှန်ကြားရေးမှူး" color="blue" />
                                    </ChildNode>
                                    
                                    <ChildNode isLast color="blue">
                                        <Node title="ဒုတိယပြည်နယ်ဦးစီးဌာနမှူး" subtitle="(ပြည်သူ့ကျန်းမာရေး)" color="blue" />
                                        <VLine color="blue" />
                                        <Node title="လက်ထောက်ညွှန်ကြားရေးမှူး" color="blue" />
                                    </ChildNode>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ခရိုင်အဆင့် ဖွဲ့စည်းပုံ */}
                {activeTab === 'district' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="w-full overflow-x-auto custom-scrollbar-hide-mobile bg-emerald-50/30 rounded-3xl border border-emerald-100 p-4 md:p-10">
                            <div className="min-w-max flex flex-col items-center mx-auto">
                                <Node title="ခရိုင်ကုသရေးဦးစီးဌာနမှူး" color="emerald" />
                                <VLine color="emerald" />
                                
                                <Node title="ဒုတိယခရိုင်ဦးစီးဌာနမှူး" color="emerald" />
                                <VLine color="emerald" />
                                
                                <div className="flex justify-center w-full">
                                    <ChildNode isFirst color="emerald">
                                        <Node title="လက်ထောက်ညွှန်ကြားရေးမှူး" subtitle="(စီမံ/ဘဏ္ဍာ)" color="emerald" />
                                    </ChildNode>
                                    
                                    <ChildNode color="emerald">
                                        <Node title="လက်ထောက်ညွှန်ကြားရေးမှူး" subtitle="(ကုသရေး)" color="emerald" />
                                    </ChildNode>
                                    
                                    <ChildNode isLast color="emerald">
                                        <Node title="လက်ထောက်ညွှန်ကြားရေးမှူး" subtitle="(ရောဂါနှိမ်နင်းရေး)" color="emerald" />
                                    </ChildNode>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* မြို့နယ်အဆင့် ဖွဲ့စည်းပုံ */}
                {activeTab === 'township' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="w-full overflow-x-auto custom-scrollbar-hide-mobile bg-amber-50/30 rounded-3xl border border-amber-100 p-4 md:p-10">
                            <div className="min-w-max flex flex-col items-center mx-auto">
                                <Node title="မြို့နယ်ကုသရေးဦးစီးဌာနမှူး" color="amber" />
                                <VLine color="amber" />
                                
                                <div className="flex justify-center w-full">
                                    <ChildNode isFirst color="amber">
                                        <Node title="မြို့နယ်ပြည်သူ့ဆေးရုံ" color="amber" />
                                    </ChildNode>
                                    
                                    <ChildNode color="amber">
                                        <Node title="တိုက်နယ်ဆေးရုံများ" color="amber" />
                                    </ChildNode>
                                    
                                    <ChildNode isLast color="amber">
                                        <Node title="ကျေးလက်ကျန်းမာရေးဌာန" color="amber" />
                                    </ChildNode>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}