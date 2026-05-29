'use client';

import { useState, useEffect, useRef } from 'react';
import { t, locationData as rawLocationData } from '@/data/constants'; // ဒီနေရာလေးကို ပြင်လိုက်ပါ
import { supabase } from '@/lib/supabase';

// Helper Functions
const locationData: Record<string, any> = rawLocationData;
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

// Types
interface Employee {
    id: string;
    emp_id: string;
    full_name: string;
    department: string;
    designation: string;
    district: string;
    township: string;
    hospital: string;
    beds: string;
    phone: string;
    email: string;
    photo: string;
    join_date: string;
    status: string;
}

export default function EmployeeDashboard({ lang = 'mm', isAdmin = false }: { lang?: string, isAdmin?: boolean }) {
    const dict = t[lang] || t['mm'];
    
    // States
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ dist: '', town: '', hosp: '' });
    
    // Selection for Bulk Delete
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'view' | 'add' | 'edit'>('view');
    const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fileImportRef = useRef<HTMLInputElement>(null);
    const photoUploadRef = useRef<HTMLInputElement>(null);

    // Initial Data Fetch
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            // is_deleted false ဖြစ်နေသော (မဖျက်ရသေးသော) ဒေတာများကိုသာ ဆွဲယူမည်
            const { data, error } = await supabase.from('employees').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
            if (data && !error) setEmployees(data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Derived Data for Filters & Cascading Dropdowns
    const districtsList = Object.keys(locationData);
    const filterTownsList = filters.dist ? Object.keys(locationData[filters.dist] || {}) : [];
    const filterHospsList = (filters.dist && filters.town) ? (locationData[filters.dist][filters.town] || []) : [];

    // Filter Logic
    const filteredEmployees = employees.filter(emp => {
        const matchSearch = (emp.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (emp.emp_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (emp.department || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchDist = filters.dist ? emp.district === filters.dist : true;
        const matchTown = filters.town ? emp.township === filters.town : true;
        const matchHosp = filters.hosp ? emp.hospital === filters.hosp : true;
        
        return matchSearch && matchDist && matchTown && matchHosp;
    });

    // Checkbox Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filteredEmployees.map(emp => emp.id));
        else setSelectedIds([]);
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Bulk Delete
    const deleteSelectedEmployees = async () => {
        if (selectedIds.length === 0) {
            alert("ကျေးဇူးပြု၍ ဖျက်လိုသော ဝန်ထမ်းများကို ရွေးချယ်ပါ။");
            return;
        }
        if (confirm(`ရွေးချယ်ထားသော ဝန်ထမ်း ${toMM(selectedIds.length)} ဦးကို ဖျက်ရန် သေချာပါသလား?`)) {
            setIsSaving(true);
            try {
                const { error } = await supabase.from('employees').update({ is_deleted: true }).in('id', selectedIds);
                if (error) {
                    if (error.code === '42501' || (error.message && error.message.includes('row-level'))) {
                        console.warn("Deleted locally due to Database RLS Error.");
                        setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
                        setSelectedIds([]);
                        alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီပယ်ဖျက်ထားပါသည်။");
                        return;
                    }
                    throw error;
                }
                setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
                setSelectedIds([]);
                alert("ပယ်ဖျက်ပြီးပါပြီ");
            } catch (err: any) {
                console.warn("Bulk delete failed", err);
                alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီပယ်ဖျက်ထားပါသည်။");
                setEmployees(prev => prev.filter(emp => !selectedIds.includes(emp.id)));
                setSelectedIds([]);
            } finally {
                setIsSaving(false);
            }
        }
    };

    // Add / Edit Modal Functions
    const openAddModal = () => {
        setModalMode('add');
        setEditingEmp(null);
        setPreviewImage(null);
        
        // Form default values
        const defaultDist = districtsList[0] || '';
        const defaultTown = defaultDist ? Object.keys(locationData[defaultDist])[0] : '';
        const defaultHosp = (defaultDist && defaultTown) ? locationData[defaultDist][defaultTown][0]?.name : '';

        setFormData({
            full_name: '', department: '', designation: '', phone: '', email: '',
            district: defaultDist, township: defaultTown, hospital: defaultHosp
        });
        setIsModalOpen(true);
    };

    const openViewModal = (emp: Employee) => {
        setModalMode('view');
        setEditingEmp(emp);
        setPreviewImage(emp.photo || null);
        setIsModalOpen(true);
    };

    const switchToEdit = () => {
        if (!editingEmp) return;
        setModalMode('edit');
        setFormData({
            full_name: editingEmp.full_name, department: editingEmp.department, designation: editingEmp.designation,
            phone: editingEmp.phone, email: editingEmp.email,
            district: editingEmp.district, township: editingEmp.township, hospital: editingEmp.hospital
        });
    };

    // Save Employee
    const saveEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        // Find beds for selected hospital
        const bedsObj = locationData[formData.district as string]?.[formData.township as string]?.find((x: any) => x.name === formData.hospital);
        
        const saveData = {
            ...formData,
            phone: toEng(formData.phone),
            beds: bedsObj ? bedsObj.beds : '',
            photo: previewImage || ""
        };

        try {
            let errorObj = null;
            let finalEmp: Employee;

            if (modalMode === 'edit' && editingEmp) {
                const { error } = await supabase.from('employees').update(saveData).eq('id', editingEmp.id);
                errorObj = error;
                finalEmp = { ...editingEmp, ...saveData } as Employee;
            } else {
                saveData.id = generateUUID();
                saveData.emp_id = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
                saveData.join_date = new Date().toISOString().split('T')[0];
                saveData.status = "Active";
                
                const { error } = await supabase.from('employees').insert([saveData]);
                errorObj = error;
                finalEmp = saveData as Employee;
            }

            if (errorObj) {
                if (errorObj.code === '42501' || (errorObj.message && errorObj.message.includes('row-level'))) {
                    console.warn("Saved locally due to RLS.");
                    alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
                    updateLocalState(finalEmp);
                    return;
                }
                throw errorObj;
            }
            
            alert(modalMode === 'add' ? "အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ" : "ပြင်ဆင်ချက်များ သိမ်းဆည်းပြီးပါပြီ");
            updateLocalState(finalEmp);
            
        } catch (err: any) {
            console.warn("Save Error", err);
            alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသိမ်းဆည်းထားပါသည်။");
            // @ts-ignore
            updateLocalState(saveData);
        } finally {
            setIsSaving(false);
        }
    };

    const updateLocalState = (emp: Employee) => {
        if (modalMode === 'edit') {
            setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
        } else {
            setEmployees(prev => [emp, ...prev]);
        }
        setIsModalOpen(false);
    };

    const deleteCurrentEmployee = async () => {
        if (!editingEmp) return;
        if (confirm("ဒီဝန်ထမ်းကို ဖျက်ရန် သေချာပါသလား?")) {
            setIsSaving(true);
            try {
                const { error } = await supabase.from('employees').update({ is_deleted: true }).eq('id', editingEmp.id);
                if (error) {
                    if (error.code === '42501') {
                        setEmployees(prev => prev.filter(e => e.id !== editingEmp.id));
                        setIsModalOpen(false);
                        alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီပယ်ဖျက်ထားပါသည်။");
                        return;
                    }
                    throw error;
                }
                setEmployees(prev => prev.filter(e => e.id !== editingEmp.id));
                setIsModalOpen(false);
                alert("ပယ်ဖျက်ပြီးပါပြီ");
            } catch (err) {
                console.warn("Delete error", err);
                setEmployees(prev => prev.filter(e => e.id !== editingEmp.id));
                setIsModalOpen(false);
                alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီပယ်ဖျက်ထားပါသည်။");
            } finally {
                setIsSaving(false);
            }
        }
    };

    // CSV Import/Export
    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Department', 'Position', 'District', 'Township', 'Hospital', 'Beds', 'Phone', 'Email', 'Join Date', 'Status'];
        const ws_data = [headers];
        employees.forEach(emp => {
            ws_data.push([emp.emp_id, emp.full_name, emp.department, emp.designation, emp.district || '', emp.township || '', emp.hospital || '', emp.beds || '', emp.phone, emp.email || '', emp.join_date, emp.status]);
        });
        const csvContent = '\uFEFF' + ws_data.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob); 
        link.download = 'Employee_List.csv';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const mapLocationName = (input: string, type: string, parentVal: any = null) => {
        if (!input) return '';
        const normalized = input.trim().toLowerCase().replace(/\s+/g, '');
        if (type === 'district') {
            for (const key of Object.keys(locationData)) {
                const cleanKey = key.toLowerCase().replace(/\s+/g, '');
                if (cleanKey.includes(normalized) || normalized.includes(cleanKey.replace(/\(.+\)/, ''))) return key;
            }
        } else if (type === 'township' && parentVal && locationData[parentVal]) {
            for (const key of Object.keys(locationData[parentVal])) {
                if (key.toLowerCase().replace(/\s+/g, '').includes(normalized)) return key;
            }
        } else if (type === 'hospital' && parentVal && locationData[parentVal.dist]?.[parentVal.town]) {
            for (const h of locationData[parentVal.dist][parentVal.town]) {
                if (h.name.toLowerCase().replace(/\s+/g, '').includes(normalized)) return h.name;
            }
        }
        return input.trim();
    };

    const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !isAdmin) return;
        
        setIsSaving(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = (event.target?.result as string).replace(/^\uFEFF/, '');
                const lines = parseCSV(text);
                if (lines.length > 1) {
                    const headers = lines[0].map(h => String(h).trim());
                    let newEmps: Employee[] = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        const rowLines = lines[i];
                        if (rowLines.length < 2) continue;
                        let row: any = {};
                        headers.forEach((h, j) => { row[h] = rowLines[j] ? String(rowLines[j]).trim() : ''; });
                        
                        const parsedEmpId = row['ID'] || row['အမှတ်စဉ်'];
                        const parsedName = row['Name'] || row['အမည်'];
                        const parsedDept = row['Department'] || row['ဌာန'];

                        if (parsedName) {
                            const rawDist = row['District'] || row['ခရိုင်'] || '';
                            const rawTown = row['Township'] || row['မြို့နယ်'] || '';
                            const rawHosp = row['Hospital'] || row['ဆေးရုံ'] || '';
                            
                            const smartDist = mapLocationName(rawDist, 'district');
                            const smartTown = mapLocationName(rawTown, 'township', smartDist);
                            const smartHosp = mapLocationName(rawHosp, 'hospital', { dist: smartDist, town: smartTown });
                            
                            const bedsObj = locationData[smartDist]?.[smartTown]?.find((x: any) => x.name === smartHosp);

                            // Duplicate မဖြစ်စေရန် - EMP ID တူတာရှိလား (သို့) အမည်နဲ့ဌာန တူတာရှိလား အရင်ရှာပါမည်
                            const existingEmp = employees.find(e => 
                                (parsedEmpId && e.emp_id === parsedEmpId) || 
                                (e.full_name === parsedName && e.department === (parsedDept || ''))
                            );

                            newEmps.push({
                                // ရှိပြီးသားဆိုလျှင် အဟောင်း ID ကိုသာ ပြန်သုံးမည်
                                id: existingEmp ? existingEmp.id : generateUUID(),
                                emp_id: existingEmp ? existingEmp.emp_id : (parsedEmpId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`),
                                full_name: parsedName || '',
                                department: parsedDept || '',
                                designation: row['Position'] || row['ရာထူး'] || '',
                                district: smartDist, township: smartTown, hospital: smartHosp,
                                beds: bedsObj ? bedsObj.beds : (row['Beds'] || row['ခုတင်အရေအတွက်'] || ''),
                                phone: toEng(row['Phone'] || row['ဖုန်းနံပါတ်'] || row['ဖုန်း'] || ''),
                                email: row['Email'] || row['အီးမေးလ်'] || '',
                                join_date: existingEmp ? existingEmp.join_date : (row['Join Date'] || new Date().toISOString().split('T')[0]),
                                status: row['Status'] || 'Active', 
                                photo: existingEmp ? existingEmp.photo : "",
                            } as Employee);
                        }
                    }

                    if (newEmps.length > 0) {
                        // insert အစား upsert ကိုပြောင်းသုံးထားပါသည် (ID တူပါက အသစ်မပွားဘဲ Update လုပ်ပေးရန်)
                        const { error } = await supabase.from('employees').upsert(newEmps);
                        
                        if (error && (error.code === '42501' || error.message?.includes('row-level'))) {
                            alert("Login မဝင်ထားသဖြင့် စနစ်ထဲတွင်သာ ယာယီသွင်းပေးထားပါသည်။");
                            fetchEmployees(); // UI Update လုပ်ရန်
                        } else if (error) {
                            throw error;
                        } else {
                            alert("CSV Data များ အောင်မြင်စွာ ထည့်သွင်း/မွမ်းမံပြီးပါပြီ!");
                            fetchEmployees(); // Database မှ နောက်ဆုံး Data ကို ပြန်ဆွဲယူမည်
                        }
                    } else {
                        alert("CSV ဖိုင်ထဲတွင် မှန်ကန်သော ဒေတာမတွေ့ပါ။");
                    }
                }
            } catch (err: any) {
                console.warn("Import Error", err);
                alert("Import Failed: " + err.message);
            } finally {
                setIsSaving(false);
                if (fileImportRef.current) fileImportRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };
    // Image Compressor
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 250;
                let w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } 
                else { if (h > MAX) { w *= MAX / h; h = MAX; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                setPreviewImage(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    // Form Cascade Handlers
    const handleFormDistChange = (val: string) => {
        const newTowns = Object.keys(locationData[val] || {});
        const firstTown = newTowns[0] || '';
        const newHosps = firstTown ? locationData[val][firstTown] : [];
        setFormData({ ...formData, district: val, township: firstTown, hospital: newHosps[0]?.name || '' });
    };

    const handleFormTownChange = (val: string) => {
        const newHosps = locationData[formData.district as string]?.[val] || [];
        setFormData({ ...formData, township: val, hospital: newHosps[0]?.name || '' });
    };

    // Form Dropdown Data
    const formTownsList = formData.district ? Object.keys(locationData[formData.district] || {}) : [];
    const formHospsList = (formData.district && formData.township) ? (locationData[formData.district][formData.township] || []) : [];


    return (
        <div className="animate-in pb-10">
            {/* Action Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0">
                        <i className="fa-solid fa-users"></i>
                    </span>
                    <span>{dict.employeeList || 'ဝန်ထမ်းအင်အားစာရင်း'}</span>
                </h3>
                
                {isAdmin && (
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto ml-0 lg:ml-auto">
                        {/* BULK DELETE */}
                        <button onClick={deleteSelectedEmployees} disabled={selectedIds.length === 0 || isSaving} className={`flex-1 sm:flex-none justify-center flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm text-sm ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'}`}>
                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-trash"></i>}
                            <span>{dict.deleteSelected || 'ရွေးချယ်ထားသည်များကိုဖျက်မည်'} {selectedIds.length > 0 && `(${toMM(selectedIds.length)})`}</span>
                        </button>
                        
                        {/* IMPORT / EXPORT */}
                        <input type="file" ref={fileImportRef} accept=".csv" className="hidden" onChange={importCSV}/>
                        <button onClick={() => fileImportRef.current?.click()} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-100 transition-all shadow-sm text-sm">
                            <i className="fa-solid fa-upload"></i><span>Import</span>
                        </button>
                        <button onClick={exportCSV} className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2.5 rounded-xl font-medium hover:bg-green-100 transition-all shadow-sm text-sm">
                            <i className="fa-solid fa-download"></i><span>Export</span>
                        </button>
                        
                        {/* ADD NEW */}
                        <button onClick={openAddModal} className="w-full sm:w-auto justify-center flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm mt-2 sm:mt-0">
                            <i className="fa-solid fa-user-plus"></i><span>{dict.addBtn || 'ဝန်ထမ်းသစ်ထည့်ရန်'}</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={dict.searchPlaceholder || "အမည်၊ ဌာန သို့မဟုတ် ID..."} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition text-sm font-medium placeholder:text-slate-400"/>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                    <select value={filters.dist} onChange={e => setFilters({dist: e.target.value, town: '', hosp: ''})} className="w-full sm:w-36 px-3 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 font-medium text-slate-700 text-sm appearance-none">
                        <option value="">{dict.filterAllDistricts || 'ခရိုင်အားလုံး'}</option>
                        {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select disabled={!filters.dist} value={filters.town} onChange={e => setFilters({...filters, town: e.target.value, hosp: ''})} className="w-full sm:w-36 px-3 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 font-medium text-slate-700 disabled:opacity-50 text-sm appearance-none">
                        <option value="">{dict.filterAllTownships || 'မြို့နယ်အားလုံး'}</option>
                        {filterTownsList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select disabled={!filters.town} value={filters.hosp} onChange={e => setFilters({...filters, hosp: e.target.value})} className="w-full sm:w-36 px-3 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 font-medium text-slate-700 disabled:opacity-50 text-sm appearance-none">
                        <option value="">{dict.filterAllHospitals || 'ဆေးရုံအားလုံး'}</option>
                        {filterHospsList.map((h:any) => <option key={h.name} value={h.name}>{h.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar-hide-mobile">
                    <table className="w-full text-left border-collapse min-w-175">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {isAdmin && (
                                    <th className="px-4 py-4 w-12 text-center">
                                        <input type="checkbox" checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"/>
                                    </th>
                                )}
                                <th className="px-4 py-4 text-sm font-bold text-slate-600">{dict.tableId || 'အမှတ်စဉ်'}</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-600">{dict.tableName || 'အမည်'}</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-600">{dict.tableLocation || 'ခရိုင် / မြို့နယ်'}</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-600">{dict.tableHospital || 'ဆေးရုံ / တိုက်နယ်'}</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-600">{dict.tableDept || 'ဌာန / ရာထူး'}</th>
                                <th className="px-4 py-4 text-sm font-bold text-slate-600 text-center">{dict.tableAction || 'အသေးစိတ်'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-slate-500"><i className="fa-solid fa-spinner fa-spin mr-2"></i> ဒေတာများ ရယူနေပါသည်...</td></tr>
                            ) : filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => (
                                    <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(emp.id) ? 'bg-blue-50/30' : ''}`}>
                                        {isAdmin && (
                                            <td className="px-4 py-4 text-center">
                                                <input type="checkbox" checked={selectedIds.includes(emp.id)} onChange={() => handleSelectOne(emp.id)} className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-blue-600"/>
                                            </td>
                                        )}
                                        <td className="px-4 py-4 text-sm text-slate-700 font-medium">{toMM(emp.emp_id)}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-800">{emp.full_name}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 font-medium">{emp.district} <br/> <span className="text-xs text-slate-400">{emp.township}</span></td>
                                        <td className="px-4 py-4 text-sm text-slate-600 font-medium">{emp.hospital}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600 font-medium">{emp.department} <br/> <span className="text-xs text-blue-500">{emp.designation}</span></td>
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => openViewModal(emp)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors">
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-slate-500">{dict.noData || 'ရှာဖွေမှုမတွေ့ရှိပါ'}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        {/* VIEW MODE HEADER */}
                        {modalMode === 'view' && editingEmp && (
                            <div className="bg-slate-900 p-6 md:p-8 text-white relative shrink-0">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className="relative group shrink-0">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profile" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-xl rotate-3 border-2 border-white/20"/>
                                        ) : (
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl md:text-3xl font-bold shadow-xl shadow-blue-500/20 rotate-3 border-2 border-white/20">{editingEmp.full_name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-bold leading-tight">{editingEmp.full_name}</h3>
                                        <p className="text-blue-400 font-medium text-sm mt-1">{toMM(editingEmp.emp_id)}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-2.5 hover:bg-white/10 rounded-full transition-colors"><i className="fa-solid fa-xmark text-lg md:text-xl"></i></button>
                            </div>
                        )}

                        {/* ADD/EDIT MODE HEADER */}
                        {(modalMode === 'add' || modalMode === 'edit') && (
                            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                                <h3 className="text-lg md:text-xl font-bold text-slate-800">{modalMode === 'add' ? dict.addBtn : dict.edit}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><i className="fa-solid fa-xmark text-lg md:text-xl"></i></button>
                            </div>
                        )}

                        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar-hide-mobile">
                            {/* FORM UI (ADD/EDIT) */}
                            {(modalMode === 'add' || modalMode === 'edit') && (
                                <form onSubmit={saveEmployee} className="space-y-4 md:space-y-5">
                                    <div className="flex flex-col items-center justify-center gap-3 pb-2 md:pb-4">
                                        <div onClick={() => photoUploadRef.current?.click()} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group">
                                            {previewImage ? (
                                                <img src={previewImage} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity"/>
                                            ) : (
                                                <i className="fa-solid fa-image text-blue-300 group-hover:text-blue-500 text-2xl md:text-3xl"></i>
                                            )}
                                        </div>
                                        <p className="text-[10px] md:text-xs font-medium text-slate-500">ဓာတ်ပုံတင်ရန်</p>
                                        <input type="file" ref={photoUploadRef} accept="image/*" className="hidden" onChange={handleImageUpload}/>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <div className="col-span-1 sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.tableName || 'အမည်'}</label>
                                            <input required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} type="text" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-medium text-slate-800 text-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.district || 'ခရိုင် / ဒေသ'}</label>
                                            <select required value={formData.district} onChange={e => handleFormDistChange(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 font-medium text-slate-800 text-sm">
                                                {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.township || 'မြို့နယ်'}</label>
                                            <select required value={formData.township} onChange={e => handleFormTownChange(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 font-medium text-slate-800 text-sm">
                                                {formTownsList.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-1 sm:col-span-2">
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.hospital || 'ဆေးရုံ / တိုက်နယ်'}</label>
                                            <select required value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none bg-slate-50 font-medium text-slate-800 text-sm">
                                                {formHospsList.map((h:any) => <option key={h.name} value={h.name}>{h.name} ({toMM(h.beds)} ခုတင်)</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.tableDept || 'ဌာန'}</label>
                                            <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} type="text" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-800 text-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.tablePos || 'ရာထူး'}</label>
                                            <input required value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} type="text" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-800 text-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.phone || 'ဖုန်းနံပါတ်'}</label>
                                            <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-800 text-sm"/>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">{dict.email || 'အီးမေးလ်'}</label>
                                            <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-800 text-sm"/>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex gap-4 mt-2 border-t border-slate-100">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 font-medium text-slate-500 hover:bg-slate-50 transition-all">{dict.cancel || 'မလုပ်တော့ပါ'}</button>
                                        <button type="submit" disabled={isSaving} className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : (modalMode === 'add' ? dict.save : dict.update)}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* VIEW UI */}
                            {modalMode === 'view' && editingEmp && (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-location-dot text-blue-500"></i><span>ခရိုင် / ဒေသ</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{editingEmp.district || '-'}</p></div>
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-location-dot text-blue-500"></i><span>မြို့နယ်</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{editingEmp.township || '-'}</p></div>
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-heart-pulse text-blue-500"></i><span>ဆေးရုံ</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{editingEmp.hospital || '-'}</p></div>
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-building text-blue-500"></i><span>ခုတင်အရေအတွက်</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{toMM(editingEmp.beds) || '-'}</p></div>
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-building text-blue-500"></i><span>ဌာန</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{editingEmp.department || '-'}</p></div>
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-briefcase text-blue-500"></i><span>ရာထူး</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{editingEmp.designation || '-'}</p></div>
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-phone text-blue-500"></i><span>ဖုန်းနံပါတ်</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{toMM(editingEmp.phone) || '-'}</p></div>
                                        <div className="space-y-1.5"><div className="flex items-center gap-2 text-slate-500 text-xs font-medium"><i className="fa-solid fa-envelope text-blue-500"></i><span>အီးမေးလ်</span></div><p className="text-slate-800 font-medium text-sm md:text-base">{editingEmp.email || '-'}</p></div>
                                    </div>
                                    {isAdmin && (
                                        <div className="pt-6 border-t border-slate-100 flex gap-4 mt-6">
                                            <button onClick={switchToEdit} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all"><i className="fa-solid fa-pen"></i><span>{dict.edit || 'ပြင်ဆင်ရန်'}</span></button>
                                            <button onClick={deleteCurrentEmployee} disabled={isSaving} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-all disabled:opacity-50"><i className="fa-solid fa-trash"></i><span>{dict.delete || 'ပယ်ဖျက်ရန်'}</span></button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}