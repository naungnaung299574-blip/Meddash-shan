// src/components/RecycleBinView.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const toMM = (str: string | number | null | undefined) => {
    if (str === null || str === undefined || str === '') return '';
    const engToMm: Record<string, string> = { '0':'၀', '1':'၁', '2':'၂', '3':'၃', '4':'၄', '5':'၅', '6':'၆', '7':'၇', '8':'၈', '9':'၉' };
    return String(str).replace(/[0-9]/g, c => engToMm[c] || c);
};

// URL Encode ဖြစ်နေသော မြန်မာစာများကို ပြန်ပြောင်းပေးမည့် Function
const safeDecode = (str: string) => {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
};

export default function RecycleBinView({ isAdmin = false }: { isAdmin?: boolean }) {
    const [activeTab, setActiveTab] = useState<'employees' | 'tmo' | 'documents'>('employees');
    
    const [deletedEmployees, setDeletedEmployees] = useState<any[]>([]);
    const [deletedTmos, setDeletedTmos] = useState<any[]>([]);
    const [deletedDocs, setDeletedDocs] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (isAdmin) {
            fetchDeletedData();
        }
    }, [isAdmin]);

    const handleTabChange = (tab: 'employees' | 'tmo' | 'documents') => {
        setActiveTab(tab);
        setSelectedIds([]);
    };

    const fetchDeletedData = async () => {
        setLoading(true);
        try {
            const [empRes, tmoRes, stateRes] = await Promise.all([
                supabase.from('employees').select('*').eq('is_deleted', true),
                supabase.from('tmo_contacts').select('*').eq('is_deleted', true),
                supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle()
            ]);

            if (empRes.data) setDeletedEmployees(empRes.data);
            if (tmoRes.data) setDeletedTmos(tmoRes.data);
            
            if (stateRes.data) {
                const homeDataObj = stateRes.data.homedata !== undefined ? stateRes.data.homedata : (stateRes.data.homeData || {});
                const docs = homeDataObj.documentsList || [];
                setDeletedDocs(docs.filter((d: any) => d.is_deleted === true));
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const restoreSelected = async () => {
        if (selectedIds.length === 0) return;
        if (confirm(`ရွေးချယ်ထားသော ဒေတာ ${toMM(selectedIds.length)} ခုကို ပြန်လည်အသက်သွင်းရန် သေချာပါသလား?`)) {
            setIsProcessing(true);
            try {
                if (activeTab === 'employees' || activeTab === 'tmo') {
                    const table = activeTab === 'employees' ? 'employees' : 'tmo_contacts';
                    const { error } = await supabase.from(table).update({ is_deleted: false }).in('id', selectedIds);
                    if (error) throw error;
                } else if (activeTab === 'documents') {
                    const { data: stateRes } = await supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle();
                    const homeDataObj = stateRes?.homedata !== undefined ? stateRes.data.homedata : (stateRes?.data?.homeData || {});
                    let allDocs = homeDataObj.documentsList || [];
                    
                    allDocs = allDocs.map((d: any) => selectedIds.includes(d.id) ? { ...d, is_deleted: false } : d);
                    homeDataObj.documentsList = allDocs;

                    // 400 Error မတက်စေရန် Fallback ထည့်သွင်းခြင်း
                    let { error } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homedata: homeDataObj });
                    if (error && (error.code === '400' || error.code === 'PGRST204')) {
                        const { error: err2 } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homeData: homeDataObj });
                        error = err2;
                    }
                    if (error) throw error;
                }
                
                alert("ဒေတာများ အောင်မြင်စွာ ပြန်လည်ရရှိပါပြီ။");
                fetchDeletedData();
                setSelectedIds([]);
            } catch (err: any) {
                console.error("Restore Error:", err);
                alert("Restore လုပ်ရာတွင် အခက်အခဲရှိပါသည်။");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const hardDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (confirm(`သတိပေးချက်: ဤလုပ်ဆောင်ချက်သည် ပြန်လည်ရယူ၍ မရနိုင်တော့ပါ။\n\nအပြီးတိုင် ဖျက်ရန် သေချာပါသလား?`)) {
            setIsProcessing(true);
            try {
                if (activeTab === 'employees' || activeTab === 'tmo') {
                    const table = activeTab === 'employees' ? 'employees' : 'tmo_contacts';
                    const { error } = await supabase.from(table).delete().in('id', selectedIds);
                    if (error) throw error;
                } else if (activeTab === 'documents') {
                    const docsToDelete = deletedDocs.filter(d => selectedIds.includes(d.id));
                    const paths = docsToDelete.map(d => d.storage_path);
                    
                    if (paths.length > 0) {
                        await supabase.storage.from('meddash-files').remove(paths);
                    }

                    const { data: stateRes } = await supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle();
                    const homeDataObj = stateRes?.homedata !== undefined ? stateRes.data.homedata : (stateRes?.data?.homeData || {});
                    let allDocs = homeDataObj.documentsList || [];
                    
                    allDocs = allDocs.filter((d: any) => !selectedIds.includes(d.id));
                    homeDataObj.documentsList = allDocs;

                    // 400 Error မတက်စေရန် Fallback ထည့်သွင်းခြင်း
                    let { error } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homedata: homeDataObj });
                    if (error && (error.code === '400' || error.code === 'PGRST204')) {
                        const { error: err2 } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homeData: homeDataObj });
                        error = err2;
                    }
                    if (error) throw error;
                }
                
                alert("အပြီးတိုင် ဖျက်ပစ်ပြီးပါပြီ။");
                fetchDeletedData();
                setSelectedIds([]);
            } catch (err: any) {
                console.error("Hard Delete Error:", err);
                alert("အပြီးတိုင်ဖျက်ရာတွင် အခက်အခဲရှိပါသည်။");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    let currentDataList = deletedEmployees;
    if (activeTab === 'tmo') currentDataList = deletedTmos;
    if (activeTab === 'documents') currentDataList = deletedDocs;
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(currentDataList.map(item => item.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    if (!isAdmin) return <div className="p-8 text-center text-slate-500">Admin Login ဝင်ရန် လိုအပ်ပါသည်။</div>;

    return (
        <div className="animate-in pb-10">
            <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3 leading-relaxed">
                        <span className="bg-red-100 text-red-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                            <i className="fa-solid fa-trash-can-arrow-up"></i>
                        </span>
                        <span>အမှိုက်ပုံး (Recycle Bin)</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={restoreSelected} disabled={selectedIds.length === 0 || isProcessing} className={`px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-sm ${selectedIds.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}`}>
                            {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate-left"></i>} 
                            <span>ပြန်ယူမည် {selectedIds.length > 0 && `(${toMM(selectedIds.length)})`}</span>
                        </button>
                        <button onClick={hardDeleteSelected} disabled={selectedIds.length === 0 || isProcessing} className={`px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 text-sm ${selectedIds.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/30'}`}>
                            {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-fire"></i>} 
                            <span>အပြီးတိုင်ဖျက်မည် {selectedIds.length > 0 && `(${toMM(selectedIds.length)})`}</span>
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-100 overflow-x-auto custom-scrollbar-hide-mobile">
                    <button onClick={() => handleTabChange('employees')} className={`whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'employees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <i className="fa-solid fa-users mr-2"></i> ဝန်ထမ်းအင်အား <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs">{toMM(deletedEmployees.length)}</span>
                    </button>
                    <button onClick={() => handleTabChange('tmo')} className={`whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'tmo' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <i className="fa-solid fa-address-book mr-2"></i> TMO Contacts <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs">{toMM(deletedTmos.length)}</span>
                    </button>
                    <button onClick={() => handleTabChange('documents')} className={`whitespace-nowrap px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                        <i className="fa-solid fa-file-pdf mr-2"></i> စာရွက်စာတမ်းများ <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs">{toMM(deletedDocs.length)}</span>
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar-hide-mobile">
                        <table className="w-full text-left text-sm whitespace-nowrap min-w-175">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                <tr>
                                    <th className="py-4 px-4 w-12 text-center border-r border-slate-100"><input type="checkbox" checked={selectedIds.length === currentDataList.length && currentDataList.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"/></th>
                                    {activeTab === 'employees' ? (
                                        <><th className="py-4 px-4 border-r border-slate-100">ဝန်ထမ်းအမည် / ID</th><th className="py-4 px-4 border-r border-slate-100">ရာထူး / ဌာန</th><th className="py-4 px-4">မြို့နယ် / ဆေးရုံ</th></>
                                    ) : activeTab === 'tmo' ? (
                                        <><th className="py-4 px-4 border-r border-slate-100">TMO အမည်</th><th className="py-4 px-4 border-r border-slate-100">မြို့နယ်</th><th className="py-4 px-4">ဖုန်းနံပါတ်</th></>
                                    ) : (
                                        <><th className="py-4 px-4 border-r border-slate-100">ဖိုင်အမည် (File Name)</th><th className="py-4 px-4 border-r border-slate-100 text-center">ဖျက်ခဲ့သည့် ရက်စွဲ</th><th className="py-4 px-4 text-center">အမျိုးအစား</th></>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-600 bg-white opacity-80">
                                {loading || isProcessing ? (
                                    <tr><td colSpan={4} className="text-center py-10 text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2"></i> လုပ်ဆောင်နေပါသည်...</td></tr>
                                ) : currentDataList.length > 0 ? (
                                    currentDataList.map((item) => {
                                        // စာရွက်စာတမ်းအတွက် နာမည်ရှင်းလင်းခြင်း
                                        let cleanDocName = "";
                                        if (activeTab === 'documents') {
                                            const nameWithoutNum = (item.display_name || '').replace(/^\d{13}_/, '');
                                            cleanDocName = safeDecode(nameWithoutNum);
                                        }

                                        return (
                                            <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-red-50/50' : ''}`}>
                                                <td className="py-4 px-4 text-center border-r border-slate-100"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => handleSelectOne(item.id)} className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"/></td>
                                                {activeTab === 'employees' ? (
                                                    <><td className="py-4 px-4 border-r border-slate-100"><span className="font-bold text-slate-800 line-through decoration-red-400">{item.full_name}</span> <br/><span className="text-xs text-slate-400">{item.emp_id}</span></td><td className="py-4 px-4 border-r border-slate-100">{item.designation} <br/> <span className="text-xs">{item.department}</span></td><td className="py-4 px-4">{item.township} <br/> <span className="text-xs">{item.hospital}</span></td></>
                                                ) : activeTab === 'tmo' ? (
                                                    <><td className="py-4 px-4 border-r border-slate-100 font-bold text-slate-800 line-through decoration-red-400">{item.tmoName || item.tmoname || '-'}</td><td className="py-4 px-4 border-r border-slate-100">{item.township}</td><td className="py-4 px-4">{toMM(item.phone) || '-'}</td></>
                                                ) : (
                                                    <><td className="py-4 px-4 border-r border-slate-100 font-bold text-slate-800 line-through decoration-red-400 leading-relaxed max-w-75 truncate" title={cleanDocName}>{cleanDocName}</td><td className="py-4 px-4 border-r border-slate-100 text-center">{new Date(item.created_at).toLocaleDateString()}</td><td className="py-4 px-4 text-center">Document File</td></>
                                                )}
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={4} className="text-center py-12 text-slate-400 italic"><i className="fa-solid fa-box-open text-4xl mb-3 opacity-30"></i><br/>အမှိုက်ပုံးထဲတွင် ဒေတာမရှိပါ</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}