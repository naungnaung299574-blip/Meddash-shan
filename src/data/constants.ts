// src/data/constants.ts

export const engToMm: Record<string, string> = {
    '0': '၀', '1': '၁', '2': '၂', '3': '၃', '4': '၄', 
    '5': '၅', '6': '၆', '7': '၇', '8': '၈', '9': '၉'
};

export const mmToEng: Record<string, string> = {
    '၀': '0', '၁': '1', '၂': '2', '၃': '3', '၄': '4', 
    '၅': '5', '၆': '6', '၇': '7', '၈': '8', '၉': '9'
};

export const locationData = {
    "တောင်ကြီးခရိုင်": {
        "တောင်ကြီး": [
            { name: "စပ်စံထွန်းပြည်သူ့ဆေးရုံကြီး", beds: "500" }, 
            { name: "အမျိုးသမီးနှင့်ကလေးဆေးရုံကြီး", beds: "200" }, 
            { name: "တောင်ကြီးတက္ကသိုလ်ဆေးရုံ", beds: "16" }, 
            { name: "အေးသာယာတိုက်နယ်ဆေးရုံ", beds: "25" }, 
            { name: "ရွှေညောင်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ကျောက်တလုံးတိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "ရပ်စောက်": [
            { name: "ရပ်စောက်မြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "အင်တောတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ပင်ဖြစ်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ကျိုင်းခမ်းတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ကျောက်ဂူတိုက်နယ်ဆေးရုံ", beds: "16" }
        ]
    },
    "ကလောခရိုင်": {
        "ကလော": [
            { name: "ကလောမြို့နယ်ဆေးရုံ", beds: "100" }, 
            { name: "အောင်ပန်းတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ဟဲဟိုးတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ဘော်ဆိုင်းတိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "ညောင်ရွှေ": [
            { name: "ညောင်ရွှေမြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "နန်းပန်တိုက်နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ဟဲယာရွာမတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "စံကားတိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "ဖယ်ခုံ": [
            { name: "ဖယ်ခုံမြို့နယ်ဆေးရုံ", beds: "25" }, 
            { name: "ဆီဘူးတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "မိုးဗြဲတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ပီကင်း/ခရက်ဒုန်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "လာအိတိုက်နယ်ဆေးရုံ", beds: "16" }
        ]
    },
    "ပအိုဝ်း (ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်ရဒေသ)": {
        "ဟိုပုံး": [
            { name: "ဟိုပုံးမြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ကျောက်တန်းတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "မိုင်းပျဉ်း-ဖာလဲတိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "ဆီဆိုင်": [
            { name: "ဆီဆိုင်မြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ပချားကလိုးတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ဆိုက်ခေါင်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ဘန်းယဉ်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "နောင်ထော်တိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "ပင်လောင်း": [
            { name: "ပင်လောင်းမြို့နယ်ဆေးရုံ", beds: "25" }, 
            { name: "တီကျစ်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "နောင်တရားတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ဆောင်းပြောင်းတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ပေါင်းလောင်းတိုက်နယ်ဆေးရုံ", beds: "16" }
        ]
    },
    "ဓနု (ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်ရဒေသ)": {
        "ပင်းတယ": [
            { name: "ပင်းတယမြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ပွေးလှတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "မိုင်းအင်တိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "ရွာငံ": [
            { name: "ရွာငံမြို့နယ်ဆေးရုံ", beds: "25" }, 
            { name: "မြိုင်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "မြို့ကြီးတိုက်နယ်ဆေးရုံ", beds: "16" }
        ]
    },
    "လွိုင်လင်ခရိုင်": {
        "လွိုင်လင်": [
            { name: "လွိုင်လင်ခရိုင်ပြည်သူ့ဆေးရုံ", beds: "200" }, 
            { name: "ပင်လုံတိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "မိုင်းပွန်တိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "လဲချား": [
            { name: "လဲချားမြို့နယ်ဆေးရုံ", beds: "50" }
        ],
        "မိုင်းကိုင်": [
            { name: "မိုင်းကိုင်မြို့နယ်ဆေးရုံ", beds: "50" }
        ],
        "နမ့်စန်": [
            { name: "နမ့်စန်မြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ခိုလမ်မြို့နယ်ခွဲဆေးရုံ", beds: "16" }
        ],
        "ကွန်ဟိန်း": [
            { name: "ကွန်ဟိန်းမြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ကာလိတိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "မိုးနဲ": [
            { name: "မိုးနဲမြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ကျိုင်းတောင်း(တုန်ဟုန်း)တိုက်နယ်ဆေးရုံ", beds: "16" }
        ]
    },
    "မိုင်းရှူးခရိုင်": {
        "မိုင်းရှူး": [
            { name: "မိုင်းရှူးခရိုင်ပြည်သူ့ဆေးရုံ", beds: "100" }, 
            { name: "လွိုင်ဆောင်ထောက်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "မိုင်းစံတိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "ကျေးသီး": [
            { name: "ကျေးသီးမြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "မိုင်းနောင်မြို့နယ်ခွဲဆေးရုံ", beds: "16" }, 
            { name: "ဝမ်ဆင်းတိုက်နယ်ဆေးရုံ", beds: "16" }
        ]
    },
    "လင်းခေးခရိုင်": {
        "လင်းခေး": [
            { name: "လင်းခေးခရိုင်ပြည်သူ့ဆေးရုံ", beds: "100" }, 
            { name: "ဝမ်ဟတ်တိုက်နယ်ဆေးရုံ", beds: "16" }, 
            { name: "ဟိုမိန်းတိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "မောက်မယ်": [
            { name: "မောက်မယ်မြို့နယ်ဆေးရုံ", beds: "50" }, 
            { name: "ဟိုနမ့်တိုက်နယ်ဆေးရုံ", beds: "16" }
        ],
        "မိုင်းပန်": [
            { name: "မိုင်းပန်မြို့နယ်ဆေးရုံ", beds: "50" }
        ]
    }
};

export const DISTRICT_ORDER = ["တောင်ကြီးခရိုင်", "ကလောခရိုင်", "ပအိုဝ်း (ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်ရဒေသ)", "ဓနု (ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်ရဒေသ)", "လွိုင်လင်ခရိုင်", "မိုင်းရှူးခရိုင်", "လင်းခေးခရိုင်"];

export const defaultTmoData = [{
    id: "1",
    no: "၁",
    township: "တောင်ကြီး",
    tsEmail: "",
    tmoName: "",
    tmoEmail: "",
    phone: ""
}, {
    id: "2",
    no: "၂",
    township: "ညောင်ရွှေ",
    tsEmail: "nyaungshwetownshiphospital@gmail.com",
    tmoName: "ဒေါက်တာ အောင်စစ်ထွန်း",
    tmoEmail: "aungsittuninlay2024@gmail.com",
    phone: ""
}];

export const defaultHomeData = {
    mapImage: null,
    hospitalDirectory: locationData,
    hospitals: {
        title: "ပြည်သူ့ဆေးရုံများဖွင့်လှစ်နိုင်မှုအခြေအနေ",
        func: [{ name: "ခုတင် (၅၀၀) ဆံ့ဆေးရုံ", val: "1" }, 
               { name: "ခုတင် (၂၀၀) ဆံ့ဆေးရုံ", val: "2" }, 
               { name: "ခုတင် (၁၀၀) ဆံ့ဆေးရုံ", val: "7" }, 
               { name: "ခုတင် (၅၀) ဆံ့ဆေးရုံ", val: "16" }, 
               { name: "ခုတင် (၂۵) ဆံ့ဆေးရုံ", val: "30" }, 
               { name: "ခုတင် (၁၆) ဆံ့ဆေးရုံ", val: "30" }],
        funcTotal: "56",
        closed: [{ name: "ခုတင် (၅၀၀) ဆံ့ဆေးရုံ", val: "-" }, 
                 { name: "ခုတင် (၂၀၀) ဆံ့ဆေးရုံ", val: "-" }, 
                 { name: "ခုတင် (၁၀၀) ဆံ့ဆေးရုံ", val: "-" }, 
                 { name: "ခုတင် (၅၀) ဆံ့ဆေးရုံ", val: "1" }, 
                 { name: "ခုတင် (၂၅) ဆံ့ဆေးရုံ", val: "10" }, 
                 { name: "ခုတင် (၁6) ဆံ့ဆေးရုံ", val: "10" }],
        closedTotal: "11"
    },
    treatments: {
        title: "လအလိုက် ဆေးကုသရေးလုပ်ငန်းများ ‌ဆောင်ရွက်နိုင်မှုအခြေအနေ",
        headers: ["အကြောင်းအရာ", "2024 total", "2025 Jan", "2025 Feb", "2025 Mar", "2025 April", "2025 (Jan to April)Total"],
        rows: [["အတွင်းလူနာစုစုပေါင်း", "71945", "7143", "6440", "6867", "7190", "27640"], 
               ["ပြင်ပလူနာစုစုပေါင်း", "427372", "41462", "38891", "39278", "38716", "158347"]]
    }
};

export const t: Record<string, any> = {
    mm: {
        title: "MedDash",
        subtitle: "ရှမ်းပြည်နယ်(တောင်ပိုင်း)ပြည်နယ်ကုသရေးဦးစီးဌာန",
        total: "စုစုပေါင်း ဝန်ထမ်းဦးရေ",
        searchPlaceholder: "ရှာရန်...",
        addBtn: "ဝန်ထမ်းသစ်ထည့်ရန်",
        exportBtn: "CSV ထုတ်မည်",
        importBtn: "CSV သွင်းမည်",
        tableId: "အမှတ်စဉ်",
        tableName: "အမည်",
        tableDept: "ဌာန / ရာထူး",
        tableLocation: "ခရိုင် / မြို့နယ်",
        tableHospital: "ဆေးရုံ / တိုက်နယ်",
        tableAction: "လုပ်ဆောင်ချက်",
        viewDetail: "အသေးစိတ်ကြည့်ရန်",
        edit: "ပြင်ဆင်ရန်",
        delete: "ပယ်ဖျက်ရန်",
        cancel: "မလုပ်တော့ပါ",
        save: "သိမ်းဆည်းမည်",
        update: "ပြင်ဆင်ချက်သိမ်းမည်",
        phone: "ဖုန်းနံပါတ်",
        email: "အီးမေးလ်",
        district: "ခရိုင် / ဒေသ",
        township: "မြို့နယ်",
        hospital: "ဆေးရုံ / တိုက်နယ်",
        beds: "ခုတင်အရေအတွက်",
        uploadPhoto: "ဓာတ်ပုံတင်ရန်",
        filterAllDistricts: "ခရိုင်အားလုံး",
        filterAllTownships: "မြို့နယ်အားလုံး",
        filterAllHospitals: "ဆေးရုံအားလုံး",
        home: "Home",
        dashboard: "Dashboard",
        language: "Language (EN / MM)",
        dbConnected: "Database ချိတ်ဆက်ထားပါသည်",
        mapTitle: "ဆေးရုံများတည်နေရာပြမြေပုံ",
        orgChartTitle: "ဖွဲ့စည်းပုံ",
        hospitalStatusTitle: "ပြည်သူ့ဆေးရုံများဖွင့်လှစ်နိုင်မှုအခြေအနေ",
        treatmentStatsTitle: "လအလိုက် ဆေးကုသရေးလုပ်ငန်းများ",
        totalDistricts: "စုစုပေါင်း ခရိုင်",
        totalTownships: "စုစုပေါင်း မြို့နယ်",
        totalEmployees: "စုစုပေါင်း ဝန်ထမ်းအင်အား",
        loading: "ဒေတာများ ရယူနေပါသည်...",
        noData: "ရှာဖွေမှုမတွေ့ရှိပါ",
        successAdd: "သိမ်းဆည်းပြီးပါပြီ",
        successUpdate: "ပြင်ဆင်ချက်များ သိမ်းဆည်းပြီးပါပြီ",
        successDelete: "ပယ်ဖျက်ပြီးပါပြီ",
        successExport: "ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ",
        successImport: "ထည့်သွင်းပြီးပါပြီ",
        employeeList: "ဝန်ထမ်းအင်အားစာရင်း",
        hospitalList: "ဆေးရုံများ",
        settings: "ဆက်တင်များ",
        languageSetting: "ဘာသာစကားပြောင်းရန်",
        appVersion: "App ဗားရှင်း",
        tmoTitle: "TMO Contacts",
        bedCapacity: "ခုတင်အဆင့်",
        totalCount: "စုစုပေါင်းအရေအတွက်",
        summaryTitle: "ဆေးရုံများအနှစ်ချုပ်ဇယား",
        bedsSuffix: "ခုတင်ဆံ့ဆေးရုံ",
        deleteSelected: "ရွေးချယ်ထားသည်များကိုဖျက်မည်",
        documentsTitle: "စာရွက်စာတမ်းများ",
        uploadFile: "ဖိုင်တင်မည်",
        download: "ဒေါင်းလုဒ်",
        noDocuments: "စာရွက်စာတမ်းများ မရှိသေးပါ",
        addCategory: "ကဏ္ဍအသစ်ထည့်မည်",
        categoryName: "ကဏ္ဍအမည်",
        rename: "အမည်ပြောင်းမည်",
        uncategorized: "အခြားစာရွက်စာတမ်းများ",
        savedLocally: "စနစ်ထဲတွင်သာ သိမ်းဆည်းထားပါသည် (Database RLS Error)",
        preview: "ဖတ်မည်"
    },
    en: {
        title: "MedDash",
        subtitle: "Shan State (South) Public Health Department",
        total: "Total Employees",
        searchPlaceholder: "Search...",
        addBtn: "Add Employee",
        exportBtn: "Export CSV",
        importBtn: "Import CSV",
        tableId: "ID",
        tableName: "Name",
        tableDept: "Department",
        tableLocation: "Location",
        tableHospital: "Hospital",
        tableAction: "Action",
        viewDetail: "View Details",
        edit: "Edit",
        delete: "Delete",
        cancel: "Cancel",
        save: "Save",
        update: "Update",
        phone: "Phone",
        email: "Email",
        district: "District",
        township: "Township",
        hospital: "Hospital",
        beds: "Beds",
        uploadPhoto: "Upload Photo",
        filterAllDistricts: "All Districts",
        filterAllTownships: "All Townships",
        filterAllHospitals: "All Hospitals",
        home: "Home",
        dashboard: "Dashboard",
        language: "Language (EN / MM)",
        dbConnected: "Auto Database Connected",
        mapTitle: "Hospital Location Map",
        orgChartTitle: "Org Chart",
        hospitalStatusTitle: "Public Hospitals Status",
        treatmentStatsTitle: "Monthly Healthcare Activities",
        totalDistricts: "Total Districts",
        totalTownships: "Total Townships",
        totalEmployees: "Total Employees",
        loading: "Fetching data...",
        noData: "No results found",
        successAdd: "Added successfully",
        successUpdate: "Updated successfully",
        successDelete: "Removed successfully",
        successExport: "Exported successfully",
        successImport: "Imported successfully",
        employeeList: "Employee List",
        hospitalList: "Hospitals",
        settings: "Settings",
        languageSetting: "Change Language",
        appVersion: "App Version",
        tmoTitle: "TMO Contacts",
        bedCapacity: "Bed Capacity",
        totalCount: "Total Count",
        summaryTitle: "Hospital Summary Table",
        bedsSuffix: "-Bed Hospital",
        deleteSelected: "Delete Selected",
        documentsTitle: "Documents",
        uploadFile: "Upload File",
        download: "Download",
        noDocuments: "No documents available",
        addCategory: "Add Category",
        categoryName: "Category Name",
        rename: "Rename",
        uncategorized: "Uncategorized",
        savedLocally: "Saved locally (Database RLS Error)",
        preview: "Preview"
    }
};