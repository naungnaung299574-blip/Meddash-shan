// src/components/HomeView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { t, locationData as rawLocationData } from '@/data/constants';
import { supabase } from '@/lib/supabase';
import Chart from 'chart.js/auto';

const locationData: Record<string, any> = rawLocationData;

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

const defaultHospitals = {
    title: "ပြည်သူ့ဆေးရုံများဖွင့်လှစ်နိုင်မှုအခြေအနေ",
    func: [
        { name: "ခုတင်(၂၀၀)ဆံ့အထက်", val: "0" },
        { name: "ခုတင်(၁၀၀)ဆံ့", val: "0" },
        { name: "ခုတင်(၅၀)ဆံ့", val: "0" },
        { name: "ခုတင်(၂၅)ဆံ့", val: "0" },
        { name: "၁၆ ခုတင်ဆံ့/တိုက်နယ်", val: "0" }
    ],
    closed: [
        { name: "ခုတင်(၂၀၀)ဆံ့အထက်", val: "0" },
        { name: "ခုတင်(၁၀၀)ဆံ့", val: "0" },
        { name: "ခုတင်(၅၀)ဆံ့", val: "0" },
        { name: "ခုတင်(၂၅)ဆံ့", val: "0" },
        { name: "၁၆ ခုတင်ဆံ့/တိုက်နယ်", val: "0" }
    ],
    funcTotal: "0",
    closedTotal: "0"
};

const defaultTreatments = {
    title: "ဆေးကုသရေးလုပ်ငန်းများ",
    headers: ["အမျိုးအစား", "အရေအတွက်"],
    rows: [
        ["ပြင်ပလူနာ", "0"],
        ["အတွင်းလူနာ", "0"],
        ["ခွဲစိတ်လူနာ", "0"],
        ["မီးဖွားလူနာ", "0"]
    ]
};

export default function HomeView({ lang = 'mm', isAdmin = false }: { lang?: string, isAdmin?: boolean }) {
    const dict = t[lang] || t['mm'];
    
    const [homeData, setHomeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [isEditingHosp, setIsEditingHosp] = useState(false);
    const [isEditingTreat, setIsEditingTreat] = useState(false);
    
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    // Zoom & Pan အတွက် States များ
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    
    const mapInputRef = useRef<HTMLInputElement>(null);
    const hospCsvRef = useRef<HTMLInputElement>(null);
    const treatCsvRef = useRef<HTMLInputElement>(null);

    const [chartStats, setChartStats] = useState({ funcPercent: '0', closedPercent: '0', funcTotal: 0, closedTotal: 0 });

    useEffect(() => {
        fetchHomeData();
    }, []);

    useEffect(() => {
        if (homeData && chartRef.current) {
            renderChart();
        }
    }, [homeData, isEditingHosp]);

    useEffect(() => {
        if (!isMapModalOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isMapModalOpen]);

    const fetchHomeData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('meddash_state').select('*').eq('id', 'main_doc').maybeSingle();
            
            let homeObj: any = {};
            if (data && !error) {
                homeObj = data.homedata !== undefined ? data.homedata : (data.homeData || {});
            }

            homeObj.hospitals = homeObj.hospitals || defaultHospitals;
            homeObj.treatments = homeObj.treatments || defaultTreatments;

            setHomeData(homeObj);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveToCloud = async (updatedData: any) => {
        setIsSaving(true);
        try {
            let { error } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homedata: updatedData });
            if (error && (error.code === '400' || error.code === 'PGRST204')) {
                const { error: err2 } = await supabase.from('meddash_state').upsert({ id: 'main_doc', homeData: updatedData });
                error = err2;
            }
            if (error) {
                if (error.code === '42501' || error.message?.includes('row-level')) {
                    alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
                    setHomeData(updatedData);
                    return;
                }
                throw error;
            }
            alert("အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!");
            setHomeData(updatedData);
        } catch (err: any) {
            console.error('Save error:', err);
            alert("သိမ်းဆည်းရာတွင် အခက်အခဲရှိပါသည် - " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const fileName = `map_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { error: uploadError } = await supabase.storage.from('meddash-files').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('meddash-files').getPublicUrl(fileName);
            
            const newData = JSON.parse(JSON.stringify(homeData));
            newData.mapImage = urlData.publicUrl;
            await saveToCloud(newData);
            
        } catch (err: any) {
            console.error("Map upload error", err);
            alert("မြေပုံတင်ရာတွင် အခက်အခဲရှိပါသည်။");
        } finally {
            setIsSaving(false);
            if (mapInputRef.current) mapInputRef.current.value = '';
        }
    };

    const exportHospCSV = () => {
        const headers = ['ဆောင်ရွက်နိုင်သောဆေးရုံများ_ခုတင်အဆင့်', 'အရေအတွက်', 'ရပ်ဆိုင်းနေသော‌ဆေးရုံများ_ခုတင်အဆင့်', 'အရေအတွက်'];
        const rows = homeData.hospitals.func.map((item: any, i: number) => {
            const closedItem = homeData.hospitals.closed[i] || {};
            return [item.name, item.val, closedItem.name || '', closedItem.val || ''];
        });
        
        const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map((c: any) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        downloadCSV(csvContent, 'Hospital_Status.csv');
    };

    const importHospCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = (event.target?.result as string).replace(/^\uFEFF/, '');
                const lines = parseCSV(text);
                if (lines.length > 1) {
                    let newFunc = [];
                    let newClosed = [];
                    let fTotal = 0, cTotal = 0;

                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].length < 2) continue;
                        const fName = String(lines[i][0]).trim();
                        const fVal = toEng(String(lines[i][1]).trim());
                        const cName = String(lines[i][2] || '').trim();
                        const cVal = toEng(String(lines[i][3] || '').trim());

                        newFunc.push({ name: fName, val: fVal });
                        newClosed.push({ name: cName, val: cVal });
                        
                        if (!isNaN(parseInt(fVal))) fTotal += parseInt(fVal);
                        if (!isNaN(parseInt(cVal))) cTotal += parseInt(cVal);
                    }

                    const newData = JSON.parse(JSON.stringify(homeData));
                    newData.hospitals.func = newFunc;
                    newData.hospitals.closed = newClosed;
                    newData.hospitals.funcTotal = fTotal.toString();
                    newData.hospitals.closedTotal = cTotal.toString();
                    
                    await saveToCloud(newData);
                }
            } catch (err) {
                alert("CSV ဖိုင် ဖတ်ရာတွင် အခက်အခဲရှိပါသည်။");
            } finally {
                if (hospCsvRef.current) hospCsvRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const exportTreatCSV = () => {
        const headers = homeData.treatments.headers;
        const rows = homeData.treatments.rows;
        
        const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map((c: any) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        downloadCSV(csvContent, 'Treatment_Stats.csv');
    };

    const importTreatCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = (event.target?.result as string).replace(/^\uFEFF/, '');
                const lines = parseCSV(text);
                if (lines.length > 1) {
                    const newHeaders = lines[0].map(h => String(h).trim());
                    const newRows = lines.slice(1).filter(r => r.length > 0 && r.some(c => String(c).trim() !== '')).map(r => {
                        return r.map((cell, idx) => idx === 0 ? String(cell).trim() : toEng(String(cell).trim()));
                    });

                    newRows.forEach(row => {
                        while(row.length < newHeaders.length) {
                            row.push('');
                        }
                    });

                    const newData = JSON.parse(JSON.stringify(homeData));
                    newData.treatments.headers = newHeaders;
                    newData.treatments.rows = newRows;
                    
                    await saveToCloud(newData);
                }
            } catch (err) {
                alert("CSV ဖိုင် ဖတ်ရာတွင် အခက်အခဲရှိပါသည်။");
            } finally {
                if (treatCsvRef.current) treatCsvRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const downloadCSV = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); 
        link.download = fileName;
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);
    };

    const updateHospCell = (type: 'func' | 'closed', index: number, field: 'name' | 'val', value: string) => {
        const newData = JSON.parse(JSON.stringify(homeData));
        newData.hospitals[type][index][field] = field === 'val' ? toEng(value) : value;

        let fTotal = 0, cTotal = 0;
        newData.hospitals.func.forEach((item: any) => { const v = parseInt(item.val); if (!isNaN(v)) fTotal += v; });
        newData.hospitals.closed.forEach((item: any) => { const v = parseInt(item.val); if (!isNaN(v)) cTotal += v; });
        newData.hospitals.funcTotal = fTotal.toString();
        newData.hospitals.closedTotal = cTotal.toString();
        
        setHomeData(newData);
    };

    const updateTreatCell = (rIdx: number, cIdx: number, value: string) => {
        const newData = JSON.parse(JSON.stringify(homeData));
        newData.treatments.rows[rIdx][cIdx] = cIdx === 0 ? value : toEng(value);
        setHomeData(newData);
    };

    const addTreatRow = () => {
        const newData = JSON.parse(JSON.stringify(homeData));
        const numCols = newData.treatments.headers.length;
        newData.treatments.rows.push(Array(numCols).fill('0'));
        setHomeData(newData);
    };

    const deleteTreatRow = (rIdx: number) => {
        const newData = JSON.parse(JSON.stringify(homeData));
        newData.treatments.rows.splice(rIdx, 1);
        setHomeData(newData);
    };

    const addTreatColumn = () => {
        const newData = JSON.parse(JSON.stringify(homeData));
        newData.treatments.headers.push('ကော်လံသစ်');
        newData.treatments.rows.forEach((row: any[]) => row.push('0'));
        setHomeData(newData);
    };

    const deleteTreatColumn = (cIdx: number) => {
        const newData = JSON.parse(JSON.stringify(homeData));
        newData.treatments.headers.splice(cIdx, 1);
        newData.treatments.rows.forEach((row: any[]) => row.splice(cIdx, 1));
        setHomeData(newData);
    };

    const renderChart = () => {
        if (chartInstance.current) chartInstance.current.destroy();
        const ctx = chartRef.current;
        if (!ctx) return;

        const funcVal = parseInt(homeData.hospitals?.funcTotal) || 0;
        const closedVal = parseInt(homeData.hospitals?.closedTotal) || 0;
        const totalVal = funcVal + closedVal;

        const funcPercent = totalVal === 0 ? '0' : ((funcVal / totalVal) * 100).toFixed(1);
        const closedPercent = totalVal === 0 ? '0' : ((closedVal / totalVal) * 100).toFixed(1);
        
        setChartStats({ funcPercent, closedPercent, funcTotal: funcVal, closedTotal: closedVal });

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['ဆောင်ရွက်နိုင်သော ဆေးရုံများ', 'ရပ်ဆိုင်းနေသော ဆေးရုံများ'],
                datasets: [{
                    data: [funcVal, closedVal],
                    backgroundColor: ['#2ecc71', '#ff4757'], 
                    borderWidth: 4, 
                    borderColor: '#ffffff',
                    hoverOffset: 12 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%', 
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1500, 
                    easing: 'easeOutQuart'
                },
                layout: { padding: 15 },
                plugins: { 
                    legend: { display: false }, 
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleFont: { size: 14, family: '"Pyidaungsu", sans-serif' },
                        bodyFont: { size: 14, family: '"Pyidaungsu", sans-serif', weight: 'bold' },
                        padding: 12,
                        cornerRadius: 8,
                        boxPadding: 6,
                        displayColors: true,
                        callbacks: {
                            label: function(context: any) {
                                const val = context.raw as number;
                                const dataArr = context.dataset.data;
                                let total = 0;
                                dataArr.forEach((d: number) => { total += d; });
                                
                                const percentage = total === 0 ? 0 : Math.round((val / total) * 100);
                                return ` ${toMM(val)} ရုံ (${toMM(percentage)}%)`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Zoom & Pan Functions
    const handleWheel = (e: React.WheelEvent) => {
        const scaleChange = e.deltaY * -0.002;
        setScale(prev => {
            const newScale = Math.min(Math.max(1, prev + scaleChange), 5);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const zoomIn = (e: any) => {
        e.stopPropagation();
        setScale(prev => Math.min(prev + 0.5, 5));
    };

    const zoomOut = (e: any) => {
        e.stopPropagation();
        setScale(prev => {
            const newScale = Math.max(prev - 0.5, 1);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };

    const resetZoom = (e: any) => {
        e.stopPropagation();
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    if (loading || !homeData) return <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-blue-600"></i></div>;

    const editInputStyle = "bg-yellow-50 outline-dashed outline-1 outline-yellow-400 rounded px-2 py-1.5 text-slate-800 focus:outline-blue-500 font-bold leading-relaxed";

    return (
        <div className="animate-in pb-10">
            <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200 relative">
                
                {isSaving && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl md:rounded-4xl">
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
                            <i className="fa-solid fa-spinner fa-spin text-blue-600 text-xl"></i>
                            <span className="font-bold text-slate-700">သိမ်းဆည်းနေပါသည်...</span>
                        </div>
                    </div>
                )}

                {/* Map Modal Section */}
                {isMapModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in overflow-hidden">
                        
                        <div className="absolute top-6 right-6 z-110 flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
                            <button onClick={zoomIn} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-800 hover:bg-slate-200 transition-colors shadow-sm" title="Zoom In"><i className="fa-solid fa-magnifying-glass-plus"></i></button>
                            <button onClick={zoomOut} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-800 hover:bg-slate-200 transition-colors shadow-sm" title="Zoom Out"><i className="fa-solid fa-magnifying-glass-minus"></i></button>
                            <button onClick={resetZoom} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-800 hover:bg-slate-200 transition-colors shadow-sm" title="Reset Zoom"><i className="fa-solid fa-rotate-right"></i></button>
                            <div className="w-px h-6 bg-white/30 mx-1"></div>
                            <button onClick={() => setIsMapModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm" title="Close"><i className="fa-solid fa-xmark text-lg"></i></button>
                        </div>

                        <div 
                            className={`w-full h-full flex items-center justify-center ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                            onWheel={handleWheel}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img 
                                src={homeData.mapImage || "https://placehold.co/1200x600/e2e8f0/475569?text=Map"} 
                                alt="Map Full View" 
                                draggable={false}
                                style={{ 
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    transition: isDragging ? 'none' : 'transform 0.15s ease-out' 
                                }}
                                className="max-w-[95vw] max-h-[95vh] object-contain rounded-xl shadow-2xl bg-white select-none pointer-events-none" 
                            />
                        </div>
                        
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs md:text-sm font-medium bg-black/50 px-5 py-2.5 rounded-full backdrop-blur-md pointer-events-none shadow-lg border border-white/10 flex items-center gap-2">
                            <i className="fa-solid fa-computer-mouse"></i>
                            Mouse Wheel လှိမ့်၍ချဲ့နိုင်ပြီး ဖိ၍ရွှေ့နိုင်ပါသည်
                        </div>
                    </div>
                )}

                {/* Map Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3 leading-relaxed">
                        <span className="bg-blue-100 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0"><i className="fa-solid fa-map-location-dot"></i></span>
                        <span>{dict.mapTitle || 'ဆေးရုံများတည်နေရာပြမြေပုံ'}</span>
                    </h3>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <input type="file" ref={mapInputRef} accept="image/*" className="hidden" onChange={handleMapUpload} />
                            <button onClick={() => mapInputRef.current?.click()} className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all shadow-sm flex items-center gap-2">
                                <i className="fa-solid fa-upload"></i> ပုံပြောင်းမည်
                            </button>
                        </div>
                    )}
                </div>

                <div 
                    className="w-full aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group mb-8 cursor-pointer shadow-sm"
                    onClick={() => setIsMapModalOpen(true)}
                    title="မြေပုံကို ချဲ့ကြည့်ရန် နှိပ်ပါ"
                >
                    <img src={homeData.mapImage || "https://placehold.co/1200x600/e2e8f0/475569?text=Map"} alt="Map" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                    
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                        <div className="bg-white/95 text-blue-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2">
                            <i className="fa-solid fa-magnifying-glass-plus text-lg"></i> ချဲ့ကြည့်မည်
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                        <p className="text-blue-600 font-bold text-xs mb-1 leading-relaxed">စုစုပေါင်း ခရိုင်</p>
                        <p className="text-3xl font-black text-slate-800">{toMM(Object.keys(locationData).length)}</p>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                        <p className="text-indigo-600 font-bold text-xs mb-1 leading-relaxed">စုစုပေါင်း မြို့နယ်</p>
                        <p className="text-3xl font-black text-slate-800">{toMM(56)}</p>
                    </div>
                </div>

                {/* Hospital Status Table */}
                <div className="pt-8 border-t border-slate-100">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 leading-relaxed">
                            <span className="bg-teal-100 text-teal-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0"><i className="fa-solid fa-building-circle-check"></i></span>
                            {isEditingHosp ? (
                                <input type="text" value={homeData.hospitals.title} onChange={(e) => setHomeData({...homeData, hospitals: {...homeData.hospitals, title: e.target.value}})} className={`w-full max-w-sm ${editInputStyle}`} />
                            ) : (
                                <span>{homeData.hospitals.title}</span>
                            )}
                        </h3>
                        {isAdmin && (
                            <div className="flex flex-wrap items-center gap-2">
                                <input type="file" ref={hospCsvRef} accept=".csv" className="hidden" onChange={importHospCSV} />
                                <button onClick={() => hospCsvRef.current?.click()} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <i className="fa-solid fa-upload"></i> Import CSV
                                </button>
                                <button onClick={exportHospCSV} className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <i className="fa-solid fa-download"></i> Export CSV
                                </button>
                                <button onClick={async () => { if(isEditingHosp) await saveToCloud(homeData); setIsEditingHosp(!isEditingHosp); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${isEditingHosp ? 'bg-green-600 text-white shadow-green-600/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                                    {isEditingHosp ? <><i className="fa-solid fa-save"></i> သိမ်းဆည်းမည်</> : <><i className="fa-solid fa-pen"></i> ဇယားပြင်မည်</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden mb-8">
                        <div className="overflow-x-auto custom-scrollbar-hide-mobile">
                            <table className="w-full text-left text-sm min-w-175">
                                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                                    <tr>
                                        <th colSpan={2} className="py-5 px-6 border-r border-slate-200 text-emerald-800 bg-emerald-50/50 leading-relaxed"><i className="fa-solid fa-circle-check mr-2"></i>ဆောင်ရွက်နိုင်သောဆေးရုံများ</th>
                                        <th colSpan={2} className="py-5 px-6 text-red-800 bg-red-50/50 leading-relaxed"><i className="fa-solid fa-circle-xmark mr-2"></i>ရပ်ဆိုင်းနေသော‌ဆေးရုံများ</th>
                                    </tr>
                                    <tr className="text-[13px] text-slate-600 bg-slate-100/40">
                                        <th className="py-4 px-6 border-r border-slate-200 leading-relaxed">ခုတင်အဆင့်</th>
                                        <th className="py-4 px-6 border-r border-slate-200 text-right leading-relaxed">အရေအတွက်</th>
                                        <th className="py-4 px-6 border-r border-slate-200 leading-relaxed">ခုတင်အဆင့်</th>
                                        <th className="py-4 px-6 text-right leading-relaxed">အရေအတွက်</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {homeData.hospitals.func.map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6 border-r border-slate-100 font-medium text-slate-700 leading-relaxed">
                                                {isEditingHosp ? <input type="text" value={item.name} onChange={(e) => updateHospCell('func', i, 'name', e.target.value)} className={`w-full min-w-37.5 ${editInputStyle}`} /> : item.name}
                                            </td>
                                            <td className="py-4 px-6 border-r border-slate-200 text-right font-bold text-emerald-600 leading-relaxed">
                                                {isEditingHosp ? <input type="text" value={toMM(item.val)} onChange={(e) => updateHospCell('func', i, 'val', e.target.value)} className={`w-16 text-right ${editInputStyle}`} /> : (item.val === '-' ? '-' : toMM(item.val))}
                                            </td>
                                            <td className="py-4 px-6 border-r border-slate-100 font-medium text-slate-700 leading-relaxed">
                                                {isEditingHosp ? <input type="text" value={homeData.hospitals.closed[i]?.name || ''} onChange={(e) => updateHospCell('closed', i, 'name', e.target.value)} className={`w-full min-w-37.5 ${editInputStyle}`} /> : homeData.hospitals.closed[i]?.name || ''}
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-red-500 leading-relaxed">
                                                {isEditingHosp ? <input type="text" value={toMM(homeData.hospitals.closed[i]?.val || '0')} onChange={(e) => updateHospCell('closed', i, 'val', e.target.value)} className={`w-16 text-right ${editInputStyle}`} /> : (homeData.hospitals.closed[i]?.val === '-' ? '-' : toMM(homeData.hospitals.closed[i]?.val || '0'))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50/80 font-black border-t-2 border-slate-200 text-slate-800">
                                    <tr>
                                        <td className="py-4 px-6 border-r border-slate-100 text-right text-slate-600 leading-relaxed">စုစုပေါင်း</td>
                                        <td className="py-4 px-6 border-r border-slate-200 text-right text-emerald-700 leading-relaxed">{toMM(homeData.hospitals.funcTotal)}</td>
                                        <td className="py-4 px-6 border-r border-slate-100 text-right text-slate-600 leading-relaxed">စုစုပေါင်း</td>
                                        <td className="py-4 px-6 text-right text-red-700 leading-relaxed">{toMM(homeData.hospitals.closedTotal)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Animated Chart Section */}
                <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-white rounded-3xl border border-slate-100 mb-12 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <h4 className="font-bold text-slate-800 text-lg mb-8 flex items-center gap-3 leading-relaxed">
                        <i className="fa-solid fa-chart-pie text-blue-500 text-xl"></i> 
                        ဆေးရုံဖွင့်လှစ်နိုင်မှု ရာခိုင်နှုန်းပြပုံ
                    </h4>
                    
                    <div className="relative w-64 h-64 md:w-80 md:h-80 transition-transform duration-500 hover:scale-105">
                        <canvas ref={chartRef}></canvas>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full max-w-2xl">
                        <div className="flex flex-1 items-center justify-center gap-3 px-5 py-3 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-sm font-bold shadow-sm transition-colors hover:bg-emerald-50">
                            <div className="w-3 h-3 rounded-full bg-[#2ecc71] shadow-sm"></div>
                            <span>ဆောင်ရွက်နိုင်မှု ({toMM(chartStats.funcPercent)}% - {toMM(chartStats.funcTotal)} ရုံ)</span>
                        </div>
                        <div className="flex flex-1 items-center justify-center gap-3 px-5 py-3 rounded-full border border-red-200 bg-red-50/50 text-red-600 text-sm font-bold shadow-sm transition-colors hover:bg-red-50">
                            <div className="w-3 h-3 rounded-full bg-[#ff4757] shadow-sm"></div>
                            <span>ရပ်ဆိုင်းမှု ({toMM(chartStats.closedPercent)}% - {toMM(chartStats.closedTotal)} ရုံ)</span>
                        </div>
                    </div>
                </div>

                {/* Treatment Stats Table */}
                <div className="pt-8 border-t border-slate-100">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 leading-relaxed">
                            <span className="bg-orange-100 text-orange-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0"><i className="fa-solid fa-notes-medical"></i></span>
                            {isEditingTreat ? (
                                <input type="text" value={homeData.treatments.title} onChange={(e) => setHomeData({...homeData, treatments: {...homeData.treatments, title: e.target.value}})} className={`w-full max-w-sm ${editInputStyle}`} />
                            ) : (
                                <span>{homeData.treatments.title}</span>
                            )}
                        </h3>
                        {isAdmin && (
                            <div className="flex flex-wrap items-center gap-2">
                                <input type="file" ref={treatCsvRef} accept=".csv" className="hidden" onChange={importTreatCSV} />
                                <button onClick={() => treatCsvRef.current?.click()} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <i className="fa-solid fa-upload"></i> Import CSV
                                </button>
                                <button onClick={exportTreatCSV} className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                                    <i className="fa-solid fa-download"></i> Export CSV
                                </button>
                                <button onClick={async () => { if(isEditingTreat) await saveToCloud(homeData); setIsEditingTreat(!isEditingTreat); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${isEditingTreat ? 'bg-green-600 text-white shadow-green-600/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
                                    {isEditingTreat ? <><i className="fa-solid fa-save"></i> သိမ်းဆည်းမည်</> : <><i className="fa-solid fa-pen"></i> ဇယားပြင်မည်</>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto custom-scrollbar-hide-mobile">
                            <table className="w-full text-left text-sm min-w-200">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                    <tr>
                                        {homeData.treatments.headers.map((h: string, i: number) => (
                                            <th key={i} className={`py-4 px-4 leading-relaxed ${i === 0 ? "md:px-6 border-r border-slate-100" : "text-right text-blue-700 bg-blue-50/50"}`}>
                                                <div className={`flex items-center ${i === 0 ? 'justify-start' : 'justify-end'} gap-2`}>
                                                    {isEditingTreat ? <input type="text" value={h} onChange={(e) => { const nd = JSON.parse(JSON.stringify(homeData)); nd.treatments.headers[i] = e.target.value; setHomeData(nd); }} className={`w-full min-w-25 ${i!==0 ? "text-right" : ""} ${editInputStyle}`} /> : h}
                                                    {isEditingTreat && homeData.treatments.headers.length > 1 && (
                                                        <button onClick={() => deleteTreatColumn(i)} className="text-red-400 hover:text-red-600 p-1.5 bg-white rounded-lg shadow-sm border border-red-100 shrink-0 transition-colors" title="ဒီကော်လံကိုဖျက်မည်">
                                                            <i className="fa-solid fa-trash-can"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                        {isEditingTreat && (
                                            <th className="py-4 px-2 w-14 text-center bg-blue-50/30">
                                                <button onClick={addTreatColumn} className="w-9 h-9 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl shadow-sm flex items-center justify-center transition-colors mx-auto" title="ကော်လံအသစ်ထည့်မည်">
                                                    <i className="fa-solid fa-plus"></i>
                                                </button>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {homeData.treatments.rows.map((row: string[], rIdx: number) => (
                                        <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                                            {row.map((cell: string, cIdx: number) => (
                                                <td key={cIdx} className={`py-4 px-4 leading-relaxed ${cIdx === 0 ? "md:px-6 border-r border-slate-100 text-slate-800" : "text-right"}`}>
                                                    {isEditingTreat ? (
                                                        <input type="text" value={cIdx === 0 ? cell : toMM(cell)} onChange={(e) => updateTreatCell(rIdx, cIdx, e.target.value)} className={`w-full ${cIdx!==0 ? "text-right min-w-15" : "min-w-37.5"} ${editInputStyle}`} />
                                                    ) : (
                                                        cIdx === 0 ? cell : toMM(cell)
                                                    )}
                                                </td>
                                            ))}
                                            {isEditingTreat && (
                                                <td className="py-4 px-2 text-center border-l border-slate-100">
                                                    <button onClick={() => deleteTreatRow(rIdx)} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition-colors shadow-sm mx-auto" title="ဒီစာကြောင်းကိုဖျက်မည်">
                                                        <i className="fa-solid fa-minus"></i>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {isEditingTreat && (
                                        <tr>
                                            <td colSpan={homeData.treatments.headers.length + 1} className="py-5 text-center border-t border-slate-100 bg-slate-50/50">
                                                <button onClick={addTreatRow} className="bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 mx-auto">
                                                    <i className="fa-solid fa-plus"></i> စာကြောင်း (Row) အသစ်ထည့်မည်
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}