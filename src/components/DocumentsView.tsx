// src/components/DocumentsView.tsx
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

// URL Encode ဖြစ်နေသော မြန်မာစာများကို ပြန်ပြောင်းပေးမည့် Function
const safeDecode = (str: string) => {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
};

interface DocumentsViewProps {
    lang?: string;
    isAdmin?: boolean;
}

export default function DocumentsView({ lang = 'mm', isAdmin = false }: DocumentsViewProps) {
    const dict = t[lang] || t['mm'];
    
    const [docCategories, setDocCategories] = useState<any[]>([]);
    const [documentsList, setDocumentsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [currentUploadCategoryId, setCurrentUploadCategoryId] = useState<string | null>(null);

    // Multi-select အတွက် State
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle();
            
            if (data && !error) {
                const homeDataObj = data.homedata !== undefined ? data.homedata : (data.homeData || {});
                setDocCategories(homeDataObj.docCategories || []);
                setDocumentsList(homeDataObj.documentsList || []);
                
                const initialOpenState: Record<string, boolean> = {};
                (homeDataObj.docCategories || []).forEach((c: any) => initialOpenState[c.id] = true);
                initialOpenState['uncategorized'] = true;
                setOpenCategories(initialOpenState);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const pushToCloud = async (newCategories: any[], newDocuments: any[]) => {
        setIsSaving(true);
        try {
            const { data: stateRes } = await supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle();
            const homeDataObj = stateRes?.homedata !== undefined ? stateRes.data.homedata : (stateRes?.homeData || {});

            homeDataObj.docCategories = newCategories;
            homeDataObj.documentsList = newDocuments;

            let { error } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homedata: homeDataObj });
            
            if (error && (error.code === '400' || error.code === 'PGRST204')) {
                const { error: err2 } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homeData: homeDataObj });
                error = err2;
            }

            if (error) {
                if (error.code === '42501' || error.message?.includes('row-level')) {
                    alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
                    return false;
                }
                throw error;
            }
            return true;
        } catch (err) {
            console.error("Cloud Save Failed", err);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const syncFromStorage = async () => {
        if (!isAdmin) return;
        setIsSaving(true);
        try {
            const { data: storageFiles, error: storageError } = await supabase.storage.from('meddash-files').list();
            if (storageError) throw storageError;

            if (!storageFiles || storageFiles.length === 0) {
                alert("Supabase Storage ထဲတွင် ဖိုင်မရှိပါ။");
                return;
            }

            let newDocs = [...documentsList];
            let addedCount = 0;

            for (const file of storageFiles) {
                if (file.name.startsWith('.') || file.name === '.emptyFolderPlaceholder') continue;

                const exists = newDocs.find(d => d.storage_path === file.name);
                if (!exists) {
                    const { data: urlData } = supabase.storage.from('meddash-files').getPublicUrl(file.name);
                    
                    const originalNameMatch = file.name.match(/^\d{13}_(.*)/);
                    const cleanDisplayName = originalNameMatch ? originalNameMatch[1] : file.name;

                    newDocs.push({
                        id: 'doc_' + Date.now() + Math.random().toString(36).substring(2, 7),
                        storage_path: file.name,
                        display_name: safeDecode(cleanDisplayName), // URL Encode ပြန်ဖြေပေးမည်
                        category_id: null, 
                        public_url: urlData.publicUrl,
                        created_at: file.created_at || new Date().toISOString(),
                        is_deleted: false
                    });
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                const success = await pushToCloud(docCategories, newDocs);
                if (success) {
                    setDocumentsList(newDocs);
                    alert(`Storage ထဲမှ ဖိုင်ဟောင်း ${addedCount} ခုကို ပြန်လည်ဆွဲယူပြီးပါပြီ!`);
                }
            } else {
                alert("Storage ထဲရှိ ဖိုင်အားလုံးကို စာရင်းသွင်းပြီးသား ဖြစ်ပါသည်။ ဆွဲယူစရာ အသစ်မရှိပါ။");
            }
        } catch (err: any) {
            console.error("Sync Error:", err);
            alert("ဖိုင်များ ဆွဲယူရာတွင် အခက်အခဲရှိပါသည်။");
        } finally {
            setIsSaving(false);
        }
    };

    const promptAddCategory = async (e: any) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const name = prompt(dict.categoryName || "ကဏ္ဍအမည်:");
        if (name && name.trim()) {
            const id = 'cat_' + Date.now();
            const newCat = { id, name: name.trim() };
            const newCats = [...docCategories, newCat];
            
            setDocCategories(newCats);
            setOpenCategories(prev => ({ ...prev, [id]: true }));
            
            await pushToCloud(newCats, documentsList);
        }
    };

    const editCategory = async (e: any, id: string) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const cat = docCategories.find(c => c.id === id);
        if (!cat) return;
        
        const newName = prompt(dict.rename || "အမည်ပြောင်းမည်:", cat.name);
        if (newName && newName.trim()) {
            const newCats = docCategories.map(c => c.id === id ? { ...c, name: newName.trim() } : c);
            setDocCategories(newCats);
            await pushToCloud(newCats, documentsList);
        }
    };

    const deleteCategory = async (e: any, id: string) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (confirm("ဤကဏ္ဍကို ဖျက်ရန် သေချာပါသလား? (အထဲရှိဖိုင်များသည် အခြားစာရွက်စာတမ်းများအောက်သို့ ရောက်သွားပါမည်)")) {
            const newCats = docCategories.filter(c => c.id !== id);
            const newDocs = documentsList.map(d => d.category_id === id ? { ...d, category_id: null } : d);
            
            setDocCategories(newCats);
            setDocumentsList(newDocs);
            await pushToCloud(newCats, newDocs);
        }
    };

    const triggerUpload = (e: any, categoryId: string) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        setCurrentUploadCategoryId(categoryId === 'uncategorized' ? null : categoryId);
        fileInputRef.current?.click();
    };

    const processDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAdmin) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            // မြန်မာစာလုံးများ မပျက်စီးစေရန် spaces များကိုသာ _ ဖြင့် အစားထိုးပါမည်
            const safeFileName = file.name.replace(/\s+/g, '_');
            const fileName = `${Date.now()}_${safeFileName}`;
            
            const { error: uploadError } = await supabase.storage.from('meddash-files').upload(fileName, file, { upsert: false });
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage.from('meddash-files').getPublicUrl(fileName);

            const newDoc = {
                id: 'doc_' + Date.now(), 
                storage_path: fileName, 
                display_name: file.name, // မူလမြန်မာစာနာမည်ကို အတိုင်းသိမ်းမည်
                category_id: currentUploadCategoryId, 
                public_url: urlData.publicUrl, 
                created_at: new Date().toISOString(),
                is_deleted: false
            };

            const newDocs = [...documentsList, newDoc];
            setDocumentsList(newDocs);
            
            const success = await pushToCloud(docCategories, newDocs);
            if (success) {
                alert("ဖိုင်တင်ခြင်း အောင်မြင်ပါပြီ!");
            }
        } catch (err: any) {
            console.error("Upload error", err);
            alert("Upload failed: " + (err.message || "Network Error"));
        } finally {
            setIsSaving(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renameDocument = async (e: any, id: string) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const doc = documentsList.find(d => d.id === id);
        if (!doc) return;
        
        const cleanOldName = safeDecode(doc.display_name.replace(/^\d{13}_/, ''));
        
        const newName = prompt(dict.rename || "အမည်ပြောင်းမည်:", cleanOldName);
        if (newName && newName.trim()) {
            const newDocs = documentsList.map(d => d.id === id ? { ...d, display_name: newName.trim() } : d);
            setDocumentsList(newDocs);
            await pushToCloud(docCategories, newDocs);
        }
    };

    const moveDocument = async (e: any, docId: string) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!isAdmin) return;

        let promptText = "ပြောင်းရွှေ့လိုသော ကဏ္ဍအမှတ်စဉ်ကို ရိုက်ထည့်ပါ:\n\n0: အခြားစာရွက်စာတမ်းများ\n";
        docCategories.forEach((c, idx) => {
            promptText += `${toMM(idx + 1)}: ${c.name}\n`;
        });

        const choice = prompt(promptText);
        if (choice !== null && choice.trim() !== '') {
            const choiceNum = parseInt(choice.replace(/[၀-၉]/g, c => ({'၀':'0','၁':'1','၂':'2','၃':'3','၄':'4','၅':'5','၆':'6','၇':'7','၈':'8','၉':'9'}[c] || c))); // မြန်မာဂဏန်းလက်ခံရန်
            let newCategoryId = null;

            if (choiceNum > 0 && choiceNum <= docCategories.length) {
                newCategoryId = docCategories[choiceNum - 1].id;
            } else if (choiceNum !== 0) {
                alert("ရွေးချယ်မှု မှားယွင်းနေပါသည်။");
                return;
            }

            const newDocs = documentsList.map(d => d.id === docId ? { ...d, category_id: newCategoryId } : d);
            setDocumentsList(newDocs);
            const success = await pushToCloud(docCategories, newDocs);
            if (success) alert("ဖိုင်ကို ရွှေ့ပြောင်းပြီးပါပြီ။");
        }
    };

    const deleteDocument = async (e: any, id: string) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!isAdmin) return;
        
        if (confirm("စာရွက်စာတမ်းကို ဖျက်ရန် သေချာပါသလား? (အမှိုက်ပုံးထဲသို့ ရောက်သွားပါမည်)")) {
            const newDocs = documentsList.map(d => d.id === id ? { ...d, is_deleted: true } : d);
            setDocumentsList(newDocs); 
            
            const success = await pushToCloud(docCategories, newDocs);
            if (success) {
                alert("စာရွက်စာတမ်းကို အမှိုက်ပုံးထဲသို့ ရွှေ့လိုက်ပါပြီ။");
                setSelectedDocs(prev => prev.filter(docId => docId !== id)); 
            }
        }
    };

    // --- Bulk Action Functions (အများကြီးရွေး၍ လုပ်ဆောင်ခြင်း) ---
    const handleSelectDoc = (id: string) => {
        setSelectedDocs(prev => prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]);
    };

    const bulkMoveDocs = async () => {
        if (!isAdmin || selectedDocs.length === 0) return;

        let promptText = "ရွေးချယ်ထားသော ဖိုင်များကို ပြောင်းရွှေ့လိုသည့် ကဏ္ဍအမှတ်စဉ်ကို ရိုက်ထည့်ပါ:\n\n0: အခြားစာရွက်စာတမ်းများ\n";
        docCategories.forEach((c, idx) => {
            promptText += `${toMM(idx + 1)}: ${c.name}\n`;
        });

        const choice = prompt(promptText);
        if (choice !== null && choice.trim() !== '') {
            const choiceNum = parseInt(choice.replace(/[၀-၉]/g, c => ({'၀':'0','၁':'1','၂':'2','၃':'3','၄':'4','၅':'5','၆':'6','၇':'7','၈':'8','၉':'9'}[c] || c)));
            let newCategoryId = null;

            if (choiceNum > 0 && choiceNum <= docCategories.length) {
                newCategoryId = docCategories[choiceNum - 1].id;
            } else if (choiceNum !== 0) {
                alert("ရွေးချယ်မှု မှားယွင်းနေပါသည်။");
                return;
            }

            setIsSaving(true);
            const newDocs = documentsList.map(d => selectedDocs.includes(d.id) ? { ...d, category_id: newCategoryId } : d);
            const success = await pushToCloud(docCategories, newDocs);
            if (success) {
                setDocumentsList(newDocs);
                setSelectedDocs([]);
                alert("ဖိုင်များကို အောင်မြင်စွာ ပြောင်းရွှေ့ပြီးပါပြီ။");
            }
            setIsSaving(false);
        }
    };

    const bulkDeleteDocs = async () => {
        if (!isAdmin || selectedDocs.length === 0) return;
        
        if (confirm(`ရွေးချယ်ထားသော စာရွက်စာတမ်း ${toMM(selectedDocs.length)} ခုကို ဖျက်ရန် သေချာပါသလား? (အမှိုက်ပုံးထဲသို့ ရောက်သွားပါမည်)`)) {
            setIsSaving(true);
            const newDocs = documentsList.map(d => selectedDocs.includes(d.id) ? { ...d, is_deleted: true } : d);
            const success = await pushToCloud(docCategories, newDocs);
            if (success) {
                setDocumentsList(newDocs);
                setSelectedDocs([]);
                alert("စာရွက်စာတမ်းများကို အမှိုက်ပုံးထဲသို့ ရွှေ့လိုက်ပါပြီ။");
            }
            setIsSaving(false);
        }
    };

    const uncategorized = { id: 'uncategorized', name: dict.uncategorized || "အခြားစာရွက်စာတမ်းများ" };
    const allCats = [...docCategories, uncategorized];

    return (
        <div className="animate-in pb-10">
            <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200 relative">
                
                {isSaving && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl md:rounded-4xl">
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                            <i className="fa-solid fa-spinner fa-spin text-blue-600 text-xl"></i>
                            <span className="font-bold text-slate-700">လုပ်ဆောင်နေပါသည်...</span>
                        </div>
                    </div>
                )}

                {/* ရွေးချယ်ထားသော ဖိုင်များအတွက် Bulk Action Menu ကြီး (အပေါ်ဆုံးတွင် ပေါ်လာမည်) */}
                {isAdmin && selectedDocs.length > 0 && (
                    <div className="w-full bg-blue-50/80 border border-blue-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-inner">{toMM(selectedDocs.length)}</span>
                            <span className="text-base font-bold text-blue-800">ဖိုင် ရွေးချယ်ထားပါသည်</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={bulkMoveDocs} className="bg-white hover:bg-blue-100 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                                <i className="fa-solid fa-folder-tree"></i> ကဏ္ဍပြောင်းမည်
                            </button>
                            <button onClick={bulkDeleteDocs} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 shadow-red-500/20">
                                <i className="fa-solid fa-trash"></i> ဖျက်မည်
                            </button>
                            <button onClick={() => setSelectedDocs([])} className="bg-slate-200 hover:bg-slate-300 text-slate-600 w-10 h-10 rounded-xl flex items-center justify-center transition-all ml-1" title="Cancel">
                                <i className="fa-solid fa-times text-lg"></i>
                            </button>
                        </div>
                    </div>
                )}

                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-red-100 text-red-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                            <i className="fa-solid fa-file-pdf"></i>
                        </span>
                        <span>{dict.documentsTitle || 'စာရွက်စာတမ်းများ'}</span>
                    </h3>
                    
                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto ml-0 lg:ml-auto">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept=".pdf,.doc,.docx,.xls,.xlsx" 
                                className="hidden" 
                                onChange={processDocUpload}
                            />
                            
                            <button onClick={syncFromStorage} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm text-sm">
                                <i className="fa-solid fa-rotate"></i>
                                <span>Sync ဖိုင်ဆွဲယူမည်</span>
                            </button>

                            <button onClick={promptAddCategory} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm text-sm">
                                <i className="fa-solid fa-folder-plus"></i>
                                <span>{dict.addCategory || 'ကဏ္ဍအသစ်ထည့်မည်'}</span>
                            </button>
                        </div>
                    )}
                </header>

                <div id="documents-list-container">
                    {loading ? (
                        <div className="py-12 text-center text-slate-500">
                            <i className="fa-solid fa-spinner fa-spin text-3xl mb-4 text-blue-500"></i>
                            <p>ဒေတာများ ရယူနေပါသည်...</p>
                        </div>
                    ) : allCats.length === 1 && documentsList.filter(d => !d.is_deleted).length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                            <i className="fa-solid fa-folder-open text-5xl mb-4 opacity-20"></i>
                            <p>{dict.noDocuments || 'စာရွက်စာတမ်းများ မရှိသေးပါ'}</p>
                        </div>
                    ) : (
                        allCats.map(cat => {
                            const catDocs = documentsList.filter(d => 
                                ((cat.id === 'uncategorized' && !d.category_id) || d.category_id === cat.id) && d.is_deleted !== true
                            );

                            if (cat.id === 'uncategorized' && catDocs.length === 0 && !isAdmin) return null;

                            const isOpen = openCategories[cat.id] ?? true;

                            return (
                                <details 
                                    key={cat.id} 
                                    className="bg-slate-50 rounded-2xl border border-slate-200 mb-4 group/cat transition-all duration-300" 
                                    open={isOpen}
                                    onToggle={(e: any) => setOpenCategories(prev => ({ ...prev, [cat.id]: e.target.open }))}
                                >
                                    <summary className="p-4 md:p-6 cursor-pointer flex items-center justify-between outline-none">
                                        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2 select-none">
                                            <i className={`fa-solid fa-folder transition-colors ${isOpen ? 'text-amber-400' : 'text-blue-400'}`}></i> 
                                            {cat.name}
                                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold ml-2">
                                                {toMM(catDocs.length)}
                                            </span>
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            {isAdmin && (
                                                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover/cat:opacity-100 transition-opacity">
                                                    <button onClick={(e) => triggerUpload(e, cat.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg text-xs" title="Upload"><i className="fa-solid fa-cloud-arrow-up"></i></button>
                                                    {cat.id !== 'uncategorized' && (
                                                        <>
                                                            <button onClick={(e) => editCategory(e, cat.id)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg text-xs" title="Edit Category"><i className="fa-solid fa-pen"></i></button>
                                                            <button onClick={(e) => deleteCategory(e, cat.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg text-xs" title="Delete Category"><i className="fa-solid fa-trash"></i></button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <i className="fa-solid fa-chevron-down text-slate-400 group-open/cat:rotate-180 transition-transform"></i>
                                        </div>
                                    </summary>
                                    
                                    <div className="p-4 md:p-6 pt-0 border-t border-slate-200/60 mt-2">
                                        {catDocs.length === 0 ? (
                                            <p className="text-sm text-slate-400 font-medium py-4 text-center italic">{dict.noDocuments || 'စာရွက်စာတမ်းများ မရှိသေးပါ'}</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                                {catDocs.map(doc => {
                                                    const docName = doc.display_name || '';
                                                    const cleanName = docName.replace(/^\d{13}_/, '');
                                                    const decodedName = safeDecode(cleanName); // မြန်မာစာ ပေါ်စေရန် URL Decode ပြုလုပ်ခြင်း

                                                    const isPdf = cleanName.toLowerCase().endsWith('.pdf');
                                                    const isExcel = cleanName.toLowerCase().includes('.xls');
                                                    const isWord = cleanName.toLowerCase().includes('.doc');

                                                    let iconClass = "fa-file";
                                                    let iconColor = "text-slate-500 bg-slate-100";
                                                    if (isPdf) { iconClass = "fa-file-pdf"; iconColor = "text-red-600 bg-red-50"; } 
                                                    else if (isExcel) { iconClass = "fa-file-excel"; iconColor = "text-emerald-600 bg-emerald-50"; } 
                                                    else if (isWord) { iconClass = "fa-file-word"; iconColor = "text-blue-600 bg-blue-50"; }

                                                    let previewUrl = doc.public_url;
                                                    if (isExcel || isWord) { 
                                                        previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.public_url)}`; 
                                                    }

                                                    const isSelected = selectedDocs.includes(doc.id);

                                                    return (
                                                        <div key={doc.id} onClick={() => isAdmin && handleSelectDoc(doc.id)} className={`relative bg-white border ${isSelected ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)] bg-blue-50/20' : 'border-slate-200 hover:shadow-md'} rounded-2xl p-4 flex flex-col justify-between transition-all group cursor-pointer`}>
                                                            
                                                            {/* Checkbox ထည့်သွင်းခြင်း */}
                                                            {isAdmin && (
                                                                <div className="absolute top-4 right-4 z-10">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={isSelected}
                                                                        onChange={() => handleSelectDoc(doc.id)}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
                                                                    />
                                                                </div>
                                                            )}

                                                            <div className="flex items-start gap-3 mb-4 pr-8">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                                                                    <i className={`fa-solid ${iconClass} text-xl`}></i>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    {/* မြန်မာစာ ပြတ်မသွားစေရန် break-words နှင့် leading-relaxed အသုံးပြုထားပါသည် */}
                                                                    <h5 className="font-medium text-slate-800 text-[13px] leading-relaxed wrap-break-wordbreak-words line-clamp-2" title={decodedName}>{decodedName}</h5>
                                                                    <p className="text-[10px] md:text-xs text-slate-400 mt-1 font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-auto relative z-20">
                                                                <a href={previewUrl} target="_blank" rel="noreferrer" className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-2 rounded-xl transition-colors text-xs flex justify-center items-center gap-1.5" title="Preview" onClick={e => e.stopPropagation()}>
                                                                    <i className="fa-solid fa-eye"></i> <span>{dict.preview || 'ဖတ်မည်'}</span>
                                                                </a>
                                                                <a href={doc.public_url} download target="_blank" rel="noreferrer" className="flex-1 text-center bg-slate-50 hover:bg-blue-50 text-blue-600 font-medium py-2 rounded-xl transition-colors text-xs flex justify-center items-center gap-1.5" title="Download" onClick={e => e.stopPropagation()}>
                                                                    <i className="fa-solid fa-download"></i> <span>{dict.download || 'ဒေါင်းလုဒ်'}</span>
                                                                </a>
                                                                {isAdmin && (
                                                                    <>
                                                                        <button onClick={(e) => moveDocument(e, doc.id)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shrink-0" title="Move Category"><i className="fa-solid fa-folder-tree"></i></button>
                                                                        <button onClick={(e) => renameDocument(e, doc.id)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shrink-0" title="Rename"><i className="fa-solid fa-pen"></i></button>
                                                                        <button onClick={(e) => deleteDocument(e, doc.id)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-red-500 rounded-xl transition-colors shrink-0" title="Delete"><i className="fa-solid fa-trash"></i></button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </details>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}