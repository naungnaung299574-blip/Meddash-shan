// src/components/HospitalsView.tsx
'use client';

import { useState, useEffect } from 'react';
import { t, locationData, DISTRICT_ORDER } from '@/data/constants';
import { supabase } from '@/lib/supabase';

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

export default function HospitalsView({ lang = 'mm', isAdmin = false }: { lang?: string, isAdmin?: boolean }) {
    const dict = t[lang] || t['mm'];
    
    // လက်ရှိ Hospital Directory ကို State ဖြင့် သိမ်းထားမည်
    const [hospDirectory, setHospDirectory] = useState<any>(locationData);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Database မှ Data ဆွဲယူမည့် Function (လိုအပ်ပါက အသုံးပြုရန်)
    useEffect(() => {
        const fetchHospData = async () => {
        try {
            // select('homedata') အစား select('*') ဖြင့် အကုန်ဆွဲယူမည် (400 Error မတက်စေရန်)
            const { data, error } = await supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle();
            if (data && !error) {
                const homeDataObj = data.homedata !== undefined ? data.homedata : data.homeData;
                if (homeDataObj?.hospitalDirectory) {
                    setHospDirectory(homeDataObj.hospitalDirectory);
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };
        fetchHospData();
    }, []);

    // --- Admin Actions များ ---
    const addDistrict = () => {
        const newDistName = 'ခရိုင်အမည်သစ် ' + Date.now().toString().slice(-4);
        setHospDirectory((prev: any) => ({
            ...prev,
            [newDistName]: {}
        }));
    };

    const addTownship = (distName: string) => {
        const newTownName = 'မြို့နယ်အမည်သစ်';
        setHospDirectory((prev: any) => ({
            ...prev,
            [distName]: {
                ...prev[distName],
                [newTownName]: []
            }
        }));
    };

    const addHospital = (distName: string, townName: string) => {
        setHospDirectory((prev: any) => {
            const currentTown = prev[distName][townName] || [];
            return {
                ...prev,
                [distName]: {
                    ...prev[distName],
                    [townName]: [...currentTown, { name: 'ဆေးရုံအမည်သစ်', beds: '16' }]
                }
            };
        });
    };

    const deleteDistrict = (distName: string) => {
        if (confirm("ဒီခရိုင်ကြီးတစ်ခုလုံးကို ဖျက်ရန် သေချာပါသလား?")) {
            setHospDirectory((prev: any) => {
                const newData = { ...prev };
                delete newData[distName];
                return newData;
            });
        }
    };

    const deleteTownship = (distName: string, townName: string) => {
        if (confirm("ဖျက်ရန် သေချာပါသလား?")) {
            setHospDirectory((prev: any) => {
                const newData = { ...prev };
                delete newData[distName][townName];
                return newData;
            });
        }
    };

    const deleteHospital = (distName: string, townName: string, hospIndex: number) => {
        if (confirm("ဖျက်ရန် သေချာပါသလား?")) {
            setHospDirectory((prev: any) => {
                const currentTown = [...prev[distName][townName]];
                currentTown.splice(hospIndex, 1);
                return {
                    ...prev,
                    [distName]: {
                        ...prev[distName],
                        [townName]: currentTown
                    }
                };
            });
        }
    };

    const handleUpdate = (distName: string, townName: string, hospIndex: number, field: 'name' | 'beds', value: string) => {
        setHospDirectory((prev: any) => {
            const currentTown = [...prev[distName][townName]];
            currentTown[hospIndex] = { ...currentTown[hospIndex], [field]: value };
            return {
                ...prev,
                [distName]: {
                    ...prev[distName],
                    [townName]: currentTown
                }
            };
        });
    };

    const saveChanges = async () => {
        setIsSaving(true);
        try {
            // select('*') ဖြင့် ပြောင်းလဲဆွဲယူမည်
            const { data: currentState } = await supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle();
            
            let newHomeData: any = {};
            if (currentState) {
                newHomeData = currentState.homedata !== undefined ? currentState.homedata : (currentState.homeData || {});
            }
            newHomeData.hospitalDirectory = hospDirectory;

            // 'homedata' ဖြင့် အရင် Save ကြည့်မည်
            let { error } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homedata: newHomeData });
            
            // Error 400 တက်ပါက Column နာမည်မှားနေခြင်းဖြစ်နိုင်သဖြင့် 'homeData' ဖြင့် ထပ် Save မည်
            if (error && (error.code === '400' || error.code === 'PGRST204' || error.message?.includes('homedata'))) {
                const { error: err2 } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homeData: newHomeData });
                error = err2;
            }

            if (error) {
                // RLS ကြောင့်ဖြစ်ပါက Local တွင်သာသိမ်းမည်
                if (error.code === '42501' || Object.keys(error).length === 0 || (error.message && error.message.includes('row-level'))) {
                    console.warn("Saved locally due to Database RLS Error.");
                    alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
                    setIsEditing(false);
                    return;
                }
                throw error;
            }
            
            setIsEditing(false);
            alert("သိမ်းဆည်းပြီးပါပြီ!");
        } catch (err: any) {
            console.warn("Save Error:", err);
            alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };
    // ခရိုင်အမည်များကို စီစဉ်ခြင်း
    const currentDistricts = Object.keys(hospDirectory).sort((a, b) => {
        const indexA = DISTRICT_ORDER.indexOf(a);
        const indexB = DISTRICT_ORDER.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    return (
        <div className="animate-in pb-10">
            <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200">
                
                {/* Header & Actions */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                            <i className="fa-solid fa-hospital"></i>
                        </span>
                        <span>{dict.hospitalList}</span>
                    </h3>
                    
                    {/* Admin Actions */}
                    {isAdmin && (
                        <div className="flex flex-wrap gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={addDistrict} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
                                        <i className="fa-solid fa-plus"></i> ခရိုင်အသစ်ထည့်မည်
                                    </button>
                                    <button onClick={saveChanges} disabled={isSaving} className="bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50">
                                        {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} 
                                        <span>သိမ်းဆည်းမည်</span>
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2">
                                    <i className="fa-solid fa-pen"></i> ဇယားကိုပြင်မည်
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Directory Content */}
                <div>
                    {currentDistricts.map(dist => (
                        <div key={dist} className="mb-6 bg-slate-50 p-5 rounded-3xl border border-slate-100 shadow-sm">
                            
                            {/* District Title */}
                            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                                <h4 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                                    <i className="fa-solid fa-map-location-dot text-blue-500"></i>
                                    {isEditing ? (
                                        // ယာယီ Content Editable ပြုလုပ်ခြင်း (React တွင် State ဖြင့် သေချာ ပြန်လုပ်သင့်သော်လည်း ရိုးရှင်းစေရန် span သုံးထားသည်)
                                        <span className="bg-yellow-100 outline-dashed outline-yellow-500 px-2 py-0.5 rounded">{dist}</span>
                                    ) : (
                                        <span>{dist}</span>
                                    )}
                                </h4>
                                {isEditing && (
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={() => addTownship(dist)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold"><i className="fa-solid fa-plus"></i> မြို့နယ်</button>
                                        <button onClick={() => deleteDistrict(dist)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-bold"><i className="fa-solid fa-trash"></i> ခရိုင်ဖျက်မည်</button>
                                    </div>
                                )}
                            </div>

                            {/* Townships Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {Object.keys(hospDirectory[dist] || {}).map(town => {
                                    const hospitals = hospDirectory[dist][town] || [];
                                    return (
                                        <div key={town} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                                            
                                            {/* Township Title */}
                                            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                                                <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                                    {isEditing ? <span className="bg-yellow-100 outline-dashed outline-yellow-500 px-2 py-0.5 rounded">{town}</span> : <span>{town}</span>}
                                                    {!isEditing && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">{toMM(hospitals.length)}</span>}
                                                </h5>
                                                {isEditing && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => addHospital(dist, town)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded text-xs font-bold">+ ဆေးရုံ</button>
                                                        <button onClick={() => deleteTownship(dist, town)} className="bg-red-50 text-red-500 hover:bg-red-100 px-2 py-1 rounded text-xs"><i className="fa-solid fa-trash"></i></button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hospitals Table */}
                                            <table className="w-full text-left text-sm border-collapse mt-1">
                                                <thead className="bg-blue-50/50 text-blue-800 text-xs">
                                                    <tr>
                                                        <th className="p-2 border border-slate-100 rounded-tl-lg font-bold">ဆေးရုံအမည်</th>
                                                        <th className="p-2 border border-slate-100 text-center w-20 font-bold">ခုတင်</th>
                                                        {isEditing && <th className="p-2 border border-slate-100 w-10 text-center rounded-tr-lg"></th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {hospitals.length === 0 && !isEditing && (
                                                        <tr><td colSpan={2} className="p-3 text-center text-slate-400 text-xs italic">ဆေးရုံမရှိပါ</td></tr>
                                                    )}
                                                    {hospitals.map((h: any, hIdx: number) => (
                                                        <tr key={hIdx} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                                                            <td className="p-2 border-r border-slate-100">
                                                                <div className="flex items-center gap-2">
                                                                    <i className="fa-solid fa-caret-right text-blue-400 text-lg"></i>
                                                                    {isEditing ? (
                                                                        <input 
                                                                            type="text" 
                                                                            value={h.name} 
                                                                            onChange={(e) => handleUpdate(dist, town, hIdx, 'name', e.target.value)} 
                                                                            className="w-full bg-yellow-50 outline-dashed outline-1 outline-yellow-400 px-2 py-1 rounded text-slate-800"
                                                                        />
                                                                    ) : (
                                                                        <span className="font-medium text-slate-700">{h.name}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-2 border-r border-slate-100 text-center">
                                                                {isEditing ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={h.beds} 
                                                                        onChange={(e) => handleUpdate(dist, town, hIdx, 'beds', toEng(e.target.value))} 
                                                                        className="w-full bg-yellow-50 outline-dashed outline-1 outline-yellow-400 px-1 py-1 rounded text-center text-slate-800"
                                                                    />
                                                                ) : (
                                                                    <span className="text-xs font-medium bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm inline-block min-w-7.5">{toMM(h.beds)}</span>
                                                                )}
                                                            </td>
                                                            {isEditing && (
                                                                <td className="p-2 text-center">
                                                                    <button onClick={() => deleteHospital(dist, town, hIdx)} className="text-red-400 hover:text-red-600 transition-colors">
                                                                        <i className="fa-solid fa-trash"></i>
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}