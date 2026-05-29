// src/components/TmoView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { t } from '@/data/constants';
import { supabase } from '@/lib/supabase';

// Helper Functions
const toMM = (str: string | number | null | undefined) => {
    if (str === null || str === undefined || str === '') return '';
    const engToMm: Record<string, string> = { '0':'၀', '1':'၁', '2':'၂', '3':'၃', '4':'၄', '5':'၅', '6':'၆', '7':'၇', '8':'၈', '9':'၉' };
    return String(str).replace(/[0-9]/g, c => engToMm[c] || c);
};

const toEng = (str: string | number | null | undefined) => {
    if (str === null || str === undefined || str === '') return '';
    const mmToEng: Record<string, string> = { '၀':'0', '၁':'1', '၂':'2', '၃':'3', '၄':'4', '၅':'5', '၆':'6', '၇':'7', '၈':'8', '၉':'9' };
    return String(str).replace(/[၀-၉]/g, c => mmToEng[c] || c);
};

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
};

const parseCSV = (text: string) => {
    let res: string[][] = [], row: string[] = [], inQ = false, val = '';
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        if (c === '"' && text[i + 1] === '"') { val += '"'; i++; }
        else if (c === '"') inQ = !inQ;
        else if (c === ',' && !inQ) { row.push(val); val = ''; }
        else if (c === '\n' && !inQ) { row.push(val); val = ''; res.push(row); row = []; }
        else if (c !== '\r') val += c;
    }
    row.push(val); res.push(row);
    return res.filter(r => r.join('').trim() !== '');
};

interface TmoContact {
    id: string;
    no: string;
    township: string;
    tsEmail: string;
    tmoName: string;
    tmoEmail: string;
    phone: string;
}

export default function TmoView({ lang = 'mm', isAdmin = false }: { lang?: string, isAdmin?: boolean }) {
    const dict = t[lang] || t['mm'];
    
    const [tmoList, setTmoList] = useState<TmoContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedData, setEditedData] = useState<TmoContact[]>([]);
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchTmoData();
    }, []);

    const fetchTmoData = async () => {
        setLoading(true);
        try {
            // is_deleted = false ဖြစ်နေသော (အမှိုက်ပုံးထဲ မရောက်သေးသော) ဒေတာများကိုသာ ဆွဲထုတ်ပါမည်
            const { data, error } = await supabase.from('tmo_contacts').select('*').eq('is_deleted', false);
            
            if (data && !error) {
                const uniqueDataMap = new Map();
                
                data.forEach(item => {
                    const township = item.township || 'Unknown';
                    uniqueDataMap.set(township, {
                        id: item.id,
                        no: item.no || '',
                        township: township,
                        tsEmail: item.tsemail || item.tsEmail || '',
                        tmoName: item.tmoname || item.tmoName || '',
                        tmoEmail: item.tmoemail || item.tmoEmail || '',
                        phone: item.phone || ''
                    });
                });

                const formattedData = Array.from(uniqueDataMap.values()).sort((a, b) => {
                    const numA = parseInt(toEng(a.no)) || 0;
                    const numB = parseInt(toEng(b.no)) || 0;
                    return numA - numB;
                });
                
                setTmoList(formattedData);
                setEditedData(formattedData);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTmoList = (isEditing ? editedData : tmoList).filter(tmo => 
        (tmo.township?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || 
        (tmo.tmoName?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filteredTmoList.map(tmo => tmo.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Bulk Delete Function (အမှိုက်ပုံးသို့ ပို့မည်)
    const deleteSelectedTMOs = async () => {
        if (selectedIds.length === 0) {
            alert("ကျေးဇူးပြု၍ ဖျက်လိုသော အချက်အလက်များကို ရွေးချယ်ပါ။");
            return;
        }
        if (confirm(`ရွေးချယ်ထားသော TMO ${toMM(selectedIds.length)} ဦးကို ဖျက်ရန် သေချာပါသလား? (အမှိုက်ပုံးသို့ ရောက်သွားပါမည်)`)) {
            setIsSaving(true);
            try {
                // .delete() အစား .update({ is_deleted: true }) ကိုသုံးပြီး အမှိုက်ပုံးသို့ ပို့ပါမည်
                const { error } = await supabase.from('tmo_contacts').update({ is_deleted: true }).in('id', selectedIds);
                
                if (error) {
                    if (error.code === '42501' || (error.message && error.message.includes('row-level'))) {
                        alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီပယ်ဖျက်ထားပါသည်။");
                        setTmoList(prev => prev.filter(t => !selectedIds.includes(t.id)));
                        setEditedData(prev => prev.filter(t => !selectedIds.includes(t.id)));
                        setSelectedIds([]);
                        return;
                    }
                    throw error;
                }
                
                setTmoList(prev => prev.filter(t => !selectedIds.includes(t.id)));
                setEditedData(prev => prev.filter(t => !selectedIds.includes(t.id)));
                setSelectedIds([]);
                alert("အမှိုက်ပုံးသို့ ပို့လိုက်ပါပြီ။");
            } catch (err: any) {
                console.warn("Bulk delete failed", err);
                alert("ပယ်ဖျက်ရာတွင် အခက်အခဲရှိပါသည်။");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleInputChange = (id: string, field: keyof TmoContact, value: string) => {
        setEditedData(prev => prev.map(item => {
            if (item.id === id) {
                if (field === 'no' || field === 'phone') {
                    return { ...item, [field]: toEng(value) };
                }
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isAdmin) return;

        setIsSaving(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = (event.target?.result as string).replace(/^\uFEFF/, '');
                const lines = parseCSV(text);
                
                if (lines.length > 1) {
                    let newTmoList: TmoContact[] = [];
                    for (let i = 1; i < lines.length; i++) {
                        let cols = lines[i].map(c => toEng(String(c).trim()));
                        if (cols.length < 2) continue;
                        
                        const townshipName = cols[1] || "";
                        const existingTmo = tmoList.find(t => t.township === townshipName);
                        
                        newTmoList.push({
                            id: existingTmo ? existingTmo.id : generateUUID(),
                            no: cols[0] || (existingTmo ? existingTmo.no : ""), 
                            township: townshipName, 
                            tsEmail: cols[2] || "",
                            tmoName: cols[3] || "", 
                            tmoEmail: cols[4] || "", 
                            phone: cols[5] || ""
                        });
                    }

                    if (newTmoList.length > 0) {
                        const rowsToUpsert = newTmoList.map(row => ({
                            id: row.id,
                            no: row.no,
                            township: row.township,
                            tsemail: row.tsEmail,
                            tmoname: row.tmoName,
                            tmoemail: row.tmoEmail,
                            phone: row.phone
                        }));

                        let { error } = await supabase.from('tmo_contacts').upsert(rowsToUpsert);

                        if (error && (error.code === '400' || error.code === 'PGRST204')) {
                            const fallbackRows = newTmoList.map(row => ({
                                id: row.id, no: row.no, township: row.township,
                                tsEmail: row.tsEmail, tmoName: row.tmoName, tmoEmail: row.tmoEmail, phone: row.phone
                            }));
                            const { error: err2 } = await supabase.from('tmo_contacts').upsert(fallbackRows);
                            error = err2;
                        }

                        if (error) {
                            if (error.code === '42501' || Object.keys(error).length === 0 || (error.message && error.message.includes('row-level'))) {
                                alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
                                fetchTmoData();
                                return;
                            }
                            throw error;
                        }
                        
                        alert("CSV ဖိုင်မှ ဒေတာများကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ!");
                        fetchTmoData(); 
                    } else {
                        alert("CSV ဖိုင်ထဲတွင် မှန်ကန်သော ဒေတာမတွေ့ပါ။");
                    }
                }
            } catch (err: any) {
                console.warn("Import Error:", err);
                alert("Import Failed: " + (err.message || "CSV ဖိုင် ဖတ်ရာတွင် အခက်အခဲရှိပါသည်။"));
            } finally {
                setIsSaving(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            const changedRows = editedData.filter((editedItem) => {
                const originalItem = tmoList.find(t => t.id === editedItem.id);
                return JSON.stringify(editedItem) !== JSON.stringify(originalItem);
            });

            if (changedRows.length > 0) {
                const rowsToUpsert = changedRows.map(row => ({
                    id: row.id,
                    no: row.no,
                    township: row.township,
                    tsEmail: row.tsEmail,   
                    tmoName: row.tmoName,   
                    tmoEmail: row.tmoEmail, 
                    phone: row.phone
                }));

                let { error } = await supabase.from('tmo_contacts').upsert(rowsToUpsert);

                if (error && (error.code === '400' || error.code === 'PGRST204')) {
                    const fallbackRows = changedRows.map(row => ({
                        id: row.id, no: row.no, township: row.township,
                        tsemail: row.tsEmail, tmoname: row.tmoName, tmoemail: row.tmoEmail, phone: row.phone
                    }));
                    const { error: err2 } = await supabase.from('tmo_contacts').upsert(fallbackRows);
                    error = err2;
                }

                if (error) {
                    if (error.code === '42501' || Object.keys(error).length === 0 || (error.message && error.message.includes('row-level'))) {
                        alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
                        setTmoList(editedData); 
                        setIsEditing(false);
                        return;
                    }
                    throw error;
                }
                
                alert("အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!");
                setTmoList(editedData);
            }
            setIsEditing(false);
        } catch (err: any) {
            console.warn("Save Error:", err);
            alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
            setTmoList(editedData);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const exportCSV = () => {
        const headers = ['စဉ်', 'မြို့နယ်', 'မြို့နယ် Email လိပ်စာ', 'TMO အမည်', 'TMO Email လိပ်စာ', 'ဖုန်းနံပါတ်'];
        const rows = tmoList.map(t => [t.no, t.township, t.tsEmail, t.tmoName, t.tmoEmail, t.phone]);
        
        const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); 
        link.download = 'TMO_Contact_List.csv';
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
    };

    return (
        <div className="animate-in pb-10">
            <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200">
                
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                            <i className="fa-solid fa-address-book"></i>
                        </span>
                        <span>{dict.tmoTitle || 'TMO Contacts'}</span>
                    </h3>
                    
                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto ml-0 lg:ml-auto">
                            
                            <button 
                                onClick={deleteSelectedTMOs} 
                                disabled={selectedIds.length === 0 || isSaving} 
                                className={`flex-1 sm:flex-none justify-center flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm text-sm ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'}`}
                            >
                                {isSaving && selectedIds.length > 0 ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-trash"></i>}
                                <span>{dict.deleteSelected || 'ရွေးချယ်ထားသည်များကိုဖျက်မည်'} {selectedIds.length > 0 && `(${toMM(selectedIds.length)})`}</span>
                            </button>

                            {isEditing ? (
                                <button onClick={saveChanges} disabled={isSaving} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                                    {isSaving && selectedIds.length === 0 ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} 
                                    <span>{dict.save || 'သိမ်းဆည်းမည်'}</span>
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <i className="fa-solid fa-pen"></i>
                                    <span>ဇယားကိုပြင်မည်</span>
                                </button>
                            )}
                            
                            <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleImportCSV} />
                            
                            <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm mt-2 sm:mt-0">
                                <i className="fa-solid fa-upload"></i>
                                <span>{dict.importBtn || 'Import'}</span>
                            </button>
                            
                            <button onClick={exportCSV} className="flex-1 sm:flex-none justify-center w-full sm:w-auto flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm mt-2 sm:mt-0">
                                <i className="fa-solid fa-download"></i>
                                <span>{dict.exportBtn || 'Export'}</span>
                            </button>
                        </div>
                    )}
                </header>

                <div className="mb-6 relative w-full md:w-100">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="မြို့နယ်၊ အမည်ဖြင့် ရှာဖွေပါ..." 
                        className="w-full pl-12 pr-6 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-sm md:text-base font-medium placeholder:text-slate-400" 
                    />
                </div>

                <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar-hide-mobile">
                        <table className="w-full text-left text-sm whitespace-nowrap min-w-200">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                <tr>
                                    {isAdmin && (
                                        <th className="py-4 px-4 w-12 text-center border-r border-slate-100">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.length === filteredTmoList.length && filteredTmoList.length > 0} 
                                                onChange={handleSelectAll} 
                                                className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"
                                            />
                                        </th>
                                    )}
                                    <th className="py-4 px-4 text-center w-16 border-r border-slate-100">စဉ်</th>
                                    <th className="py-4 px-4 border-r border-slate-100">မြို့နယ်</th>
                                    <th className="py-4 px-4 border-r border-slate-100">မြို့နယ် Email လိပ်စာ</th>
                                    <th className="py-4 px-4 border-r border-slate-100">TMO အမည်</th>
                                    <th className="py-4 px-4 border-r border-slate-100">TMO Email လိပ်စာ</th>
                                    <th className="py-4 px-4">ဖုန်းနံပါတ်</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-slate-500">
                                            <i className="fa-solid fa-spinner fa-spin mr-2"></i> ဒေတာများ ရယူနေပါသည်...
                                        </td>
                                    </tr>
                                ) : filteredTmoList.length > 0 ? (
                                    filteredTmoList.map((tmo, index) => (
                                        <tr key={tmo.id} className={`hover:bg-slate-50 border-b border-slate-100 transition-colors ${selectedIds.includes(tmo.id) ? 'bg-blue-50/30' : ''}`}>
                                            
                                            {isAdmin && (
                                                <td className="py-4 px-4 text-center border-r border-slate-100">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedIds.includes(tmo.id)} 
                                                        onChange={() => handleSelectOne(tmo.id)} 
                                                        className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"
                                                    />
                                                </td>
                                            )}

                                            <td className="py-4 px-4 text-center border-r border-slate-100 text-slate-800 font-medium">
                                                {isEditing ? (
                                                    <input type="text" value={toMM(tmo.no)} onChange={(e) => handleInputChange(tmo.id, 'no', e.target.value)} className="w-12 text-center bg-yellow-50 outline-dashed outline-1 outline-yellow-400 rounded p-1" />
                                                ) : (
                                                    toMM(tmo.no)
                                                )}
                                            </td>
                                            <td className="py-4 px-4 border-r border-slate-100 font-medium text-slate-800">
                                                {isEditing ? (
                                                    <input type="text" value={tmo.township} onChange={(e) => handleInputChange(tmo.id, 'township', e.target.value)} className="w-full bg-yellow-50 outline-dashed outline-1 outline-yellow-400 rounded p-1" />
                                                ) : (
                                                    tmo.township
                                                )}
                                            </td>
                                            <td className="py-4 px-4 border-r border-slate-100 text-slate-600 font-medium">
                                                {isEditing ? (
                                                    <input type="email" value={tmo.tsEmail} onChange={(e) => handleInputChange(tmo.id, 'tsEmail', e.target.value)} className="w-full bg-yellow-50 outline-dashed outline-1 outline-yellow-400 rounded p-1" />
                                                ) : (
                                                    tmo.tsEmail || '-'
                                                )}
                                            </td>
                                            <td className="py-4 px-4 border-r border-slate-100 font-medium text-blue-700">
                                                {isEditing ? (
                                                    <input type="text" value={tmo.tmoName} onChange={(e) => handleInputChange(tmo.id, 'tmoName', e.target.value)} className="w-full bg-yellow-50 outline-dashed outline-1 outline-yellow-400 rounded p-1" />
                                                ) : (
                                                    tmo.tmoName
                                                )}
                                            </td>
                                            <td className="py-4 px-4 border-r border-slate-100 text-slate-600 font-medium">
                                                {isEditing ? (
                                                    <input type="email" value={tmo.tmoEmail} onChange={(e) => handleInputChange(tmo.id, 'tmoEmail', e.target.value)} className="w-full bg-yellow-50 outline-dashed outline-1 outline-yellow-400 rounded p-1" />
                                                ) : (
                                                    tmo.tmoEmail || '-'
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 font-medium">
                                                {isEditing ? (
                                                    <input type="text" value={toMM(tmo.phone)} onChange={(e) => handleInputChange(tmo.id, 'phone', e.target.value)} className="w-full bg-yellow-50 outline-dashed outline-1 outline-yellow-400 rounded p-1" />
                                                ) : (
                                                    toMM(tmo.phone) || '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-slate-500 font-medium">
                                            {dict.noData || 'ရှာဖွေမှုမတွေ့ရှိပါ'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}