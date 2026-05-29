// src/components/OrgChartView.tsx
'use client';

export default function OrgChartView() {
    return (
        <div className="animate-in pb-10 space-y-10">
            
            {/* ========================================================
                ၁။ ပြည်နယ်ကုသရေးဦးစီးဌာန ဖွဲ့စည်းပုံ
            ======================================================== */}
            <div className="bg-blue-900 rounded-3xl md:rounded-4xl shadow-sm border border-slate-200 min-h-[80vh] p-4 md:p-8 text-white overflow-hidden relative">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-yellow-400 mb-8 md:mb-10 shadow-black drop-shadow-md relative z-10">
                    ပြည်နယ်ကုသရေးဦးစီးဌာန ဖွဲ့စည်းပုံ
                </h1>
                
                <div className="w-full overflow-x-auto relative z-10 pb-6 custom-scrollbar-hide-mobile">
                    <div className="min-w-250 p-2 md:p-4">
                        <div className="flex justify-center mb-12">
                            <div className="bg-linear-to-b from-orange-400 to-orange-600 text-white px-8 py-4 rounded shadow-lg border-2 border-yellow-300 font-bold text-xl drop-shadow-xl">
                                ပြည်နယ်ကုသရေးဦးစီးဌာနမှူး
                            </div>
                        </div>
                        <div className="flex flex-col xl:flex-row justify-center gap-10 xl:gap-6">
                            
                            {/* ဒုတိယပြည်နယ်မှူး (ကုသရေး) အပိုင်း */}
                            <div className="flex-1 flex flex-col items-center">
                                <div className="bg-green-700 w-full xl:w-[90%] text-center py-3 rounded shadow-lg mb-4 font-bold text-lg border border-green-500">
                                    ဒုတိယပြည်နယ်ကုသရေးဦးစီးဌာနမှူး(ကုသရေး)
                                </div>
                                <div className="bg-blue-950 w-3/4 xl:w-[80%] text-center py-2 border border-blue-400 rounded shadow-md mb-8 font-medium">
                                    ဒုတိယညွှန်ကြားရေးမှူး<br/>ကုသရေးဦးစီးဌာနမှူး(ကုသရေး)
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mb-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-linear-to-b from-blue-400 to-blue-600 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-300 font-medium">လ/ထ ညွှန်မှူး<br/>(ဝယ်ယူ/ဖြန့်ဖြူး)</div>
                                        <div className="bg-linear-to-b from-blue-500 to-blue-700 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-400 font-medium">လ/ထ ဆရာဝန်<br/>(ဝယ်ယူ/ဖြန့်ဖြူး)</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-linear-to-b from-blue-400 to-blue-600 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-300 font-medium">လ/ထ ညွှန်မှူး<br/>(ကုသရေး)</div>
                                        <div className="bg-linear-to-b from-blue-500 to-blue-700 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-400 font-medium">လ/ထ ဆရာဝန်<br/>(ကုသရေး)</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-linear-to-b from-blue-400 to-blue-600 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-300 font-medium">လ/ထ ညွှန်မှူး<br/>(သူနာပြု)</div>
                                        <div className="bg-linear-to-b from-blue-500 to-blue-700 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-400 font-medium">ဦးစီးအရာရှိ<br/>(သူနာပြု)</div>
                                    </div>
                                </div>
                                <div className="bg-blue-800/80 border border-blue-400 p-4 rounded-lg text-sm w-full xl:w-[90%] text-center leading-relaxed shadow-inner font-medium">
                                    ဌာနခွဲစာရေးကြီး(၁)ဦး ၊ အကြီးတန်းစာရေး(၂)ဦး ၊ အငယ်တန်းစာရေး(၃)ဦး ၊ ရုံးအကူ(၃)ဦး
                                </div>
                            </div>

                            {/* ဒုတိယပြည်နယ်မှူး (စီမံ/ဘဏ္ဍာ) အပိုင်း */}
                            <div className="flex-1 flex flex-col items-center mt-10 xl:mt-0">
                                <div className="bg-green-700 w-full xl:w-[90%] text-center py-3 rounded shadow-lg mb-4 font-bold text-lg border border-green-500">
                                    ဒုတိယပြည်နယ်ကုသရေးဦးစီးဌာနမှူး(စီမံ/ဘဏ္ဍာ)
                                </div>
                                <div className="bg-blue-950 w-3/4 xl:w-[80%] text-center py-2 border border-blue-400 rounded shadow-md mb-8 font-medium">
                                    ဒုတိယညွှန်ကြားရေးမှူး<br/>ကုသရေးဦးစီးဌာနမှူး(စီမံ/ဘဏ္ဍာ)
                                </div>
                                <div className="flex flex-wrap justify-center gap-4 mb-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-linear-to-b from-blue-400 to-blue-600 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-300 font-medium">လ/ထ ညွှန်မှူး<br/>(အုပ်ချုပ်/စီမံ)</div>
                                        <div className="bg-linear-to-b from-blue-500 to-blue-700 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-400 font-medium">ဦးစီးအရာရှိ<br/>(အုပ်ချုပ်/စီမံ)</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-linear-to-b from-blue-400 to-blue-600 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-300 font-medium">လ/ထ ညွှန်မှူး<br/>(ဘဏ္ဍာရေး)</div>
                                        <div className="bg-linear-to-b from-blue-500 to-blue-700 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-400 font-medium">ဦးစီးအရာရှိ<br/>(ဘဏ္ဍာရေး)</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-linear-to-b from-blue-400 to-blue-600 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-300 font-medium">လ/ထ ညွှန်မှူး<br/>(မှတ်တမ်း/လုပ်ငန်းစစ်)</div>
                                        <div className="bg-linear-to-b from-blue-500 to-blue-700 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-400 font-medium">ဦးစီးအရာရှိ<br/>(မှတ်တမ်း/လုပ်ငန်းစစ်)</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-linear-to-b from-blue-400 to-blue-600 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-300 font-medium">လ/ထ ညွှန်မှူး<br/>(အင်ဂျင်နီယာ)</div>
                                        <div className="bg-linear-to-b from-blue-500 to-blue-700 text-sm px-2 py-2 rounded shadow-md text-center w-36 h-16 flex items-center justify-center border border-blue-400 font-medium">လ/ထ အင်ဂျင်နီယာ<br/>(အင်ဂျင်နီယာ)</div>
                                    </div>
                                </div>
                                <div className="bg-blue-800/80 border border-blue-400 p-4 rounded-lg text-sm w-full xl:w-[90%] text-center leading-relaxed shadow-inner font-medium">
                                    အငယ်တန်းအင်ဂျင်နီယာ(၃)ဦး ၊ ဌာနခွဲစာရေးကြီး(၁)ဦး ၊ စာရင်းကိုင်-၂(၁)ဦး ၊ အကြီးတန်းစာရေး(၂)ဦး ၊ စာရင်းကိုင်-၃(၁)ဦး ၊ အငယ်တန်းစာရေး(၃)ဦး ၊ စာရင်းကိုင်-၄(၁)ဦး ၊ ရုံးအကူ(၃)ဦး ၊ ယာဉ်မောင်း(၆)ဦး
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================
                ၂။ ခရိုင်ကုသရေးဦးစီးဌာန ဖွဲ့စည်းပုံ
            ======================================================== */}
            <div className="bg-[#243b87] rounded-3xl md:rounded-4xl shadow-xl border border-slate-200 p-6 md:p-10 text-white relative">
                
                {/* ညာဘက်အပေါ်ထောင့်က Info Table (Mobile တွင် အပေါ်၌ပေါ်မည်) */}
                <div className="relative md:absolute top-0 right-0 md:top-8 md:right-8 mb-6 md:mb-0 w-full md:w-64 bg-white text-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-200 text-xs md:text-sm">
                    <div className="bg-[#4371d1] text-white p-2 md:p-3 text-center font-medium">ဆေးရုံ၏ဖွဲ့စည်းပုံတွင်ပြင်ဆင်တိုးချဲ့မည့်ဖွဲ့စည်းပုံအင်အား</div>
                    <div className="flex justify-between p-2 border-b border-slate-100 bg-slate-50"><span className="pl-2">အရာထမ်း</span><span className="pr-2 font-bold">၁၂</span></div>
                    <div className="flex justify-between p-2 border-b border-slate-100"><span className="pl-2">အမှုထမ်း</span><span className="pr-2 font-bold">၂၈</span></div>
                    <div className="flex justify-between p-2 bg-slate-50"><span className="pl-2">စုစုပေါင်း</span><span className="pr-2 font-bold">၄၀</span></div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-center text-[#fbbc04] mb-8 md:mb-12 mt-2 md:mt-4">
                    ခရိုင်ကုသရေးဦးစီးဌာန ဖွဲ့စည်းပုံ
                </h2>

                <div className="w-full overflow-x-auto custom-scrollbar-hide-mobile">
                    <div className="min-w-200 flex flex-col items-center pb-4">
                        
                        {/* Top Node */}
                        <div className="bg-[#d9771e] border border-[#e67e22] text-white px-8 py-4 rounded-lg font-medium text-base md:text-lg mb-10 text-center shadow-md">
                            ဆေးရုံအုပ်ကြီး / ခရိုင်ကုသရေးဦးစီးဌာနမှူး<br/>(၃၄၁၀၀၀-၄၀၀၀-၃၆၁၀၀၀)
                        </div>

                        {/* 3 Columns */}
                        <div className="flex w-full gap-6 justify-between items-stretch">
                            
                            {/* Column 1 */}
                            <div className="flex-1 flex flex-col gap-5 items-center w-1/3">
                                <div className="bg-[#268a35] border border-[#27ae60] w-full py-3 rounded-lg text-center font-medium shadow-sm">ဒုတိယခရိုင်ကုသရေးဦးစီးဌာနမှူး(ကုသရေး)</div>
                                <div className="border border-[#7c93d9] w-[80%] py-3 rounded-lg text-center text-sm font-medium">လ/ထ ညွှန်ကြားရေးမှူး<br/>(ကုသရေး)</div>
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-3 text-center text-sm flex items-center justify-center shadow-sm">လ/ထဆရာဝန်<br/>(ဝယ်ယူ/ဖြန့်ဖြူး)</div>
                                    <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-3 text-center text-sm flex items-center justify-center shadow-sm">လ/ထဆရာဝန်<br/>(ကုသရေး)</div>
                                    <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-3 text-center text-sm flex items-center justify-center shadow-sm col-span-2">ဦးစီးအရာရှိ<br/>(သူနာပြု)</div>
                                </div>
                                <div className="border border-[#7c93d9] w-full p-4 rounded-xl text-center text-[13px] leading-relaxed mt-auto">
                                    ဌာနခွဲစာရေး(၁)ဦး <br/>အကြီးတန်းစာရေး(၂)ဦး <br/>အငယ်တန်းစာရေး(၃)ဦး <br/>ရုံးအကူ(၃)ဦး
                                </div>
                            </div>

                            {/* Column 2 */}
                            <div className="flex-1 flex flex-col gap-5 items-center w-1/3">
                                <div className="bg-[#268a35] border border-[#27ae60] w-full py-3 rounded-lg text-center font-medium shadow-sm">ဒုတိယခရိုင်ကုသရေးဦးစီးဌာနမှူး(စီမံ/ဘဏ္ဍာ)</div>
                                <div className="border border-[#7c93d9] w-[80%] py-3 rounded-lg text-center text-sm font-medium">လ/ထ ညွှန်ကြားရေးမှူး<br/>(စီမံ/ဘဏ္ဍာ)</div>
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-3 text-center text-sm flex items-center justify-center shadow-sm">ဦးစီးအရာရှိ<br/>(အုပ်ချုပ်/စီမံ)</div>
                                    <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-3 text-center text-sm flex items-center justify-center shadow-sm">ဦးစီးအရာရှိ<br/>(ဘဏ္ဍာရေး)</div>
                                    <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-3 text-center text-sm flex items-center justify-center shadow-sm">ဦးစီးအရာရှိ<br/>(မှတ်တမ်း/လုပ်ငန်းစစ်)</div>
                                    <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-3 text-center text-sm flex items-center justify-center shadow-sm">လ/ထအင်ဂျင်နီယာ</div>
                                </div>
                                <div className="border border-[#7c93d9] w-full p-4 rounded-xl text-center text-[13px] leading-relaxed mt-auto">
                                    အငယ်တန်းအင်ဂျင်နီယာ(၃)ဦး(မြို့ပြ၊ လျှပ်စစ်၊ စက်မှု) <br/>ဌာနခွဲစာရေး(၁)ဦး <br/>စာရင်းကိုင်-၂ (၁)ဦး <br/>အကြီးတန်းစာရေး (၂)ဦး <br/>စာရင်းကိုင်-၃ (၁)ဦး <br/>အငယ်တန်းစာရေး (၃)ဦး <br/>စာရင်းကိုင်-၄ (၁)ဦး <br/>ယာဉ်မောင်း (၄)ဦး၊ ရုံးအကူ (၃)ဦး
                                </div>
                            </div>

                            {/* Column 3 */}
                            <div className="flex-1 flex flex-col gap-5 items-center w-1/3">
                                <div className="bg-[#268a35] border border-[#27ae60] w-full py-3 rounded-lg text-center font-medium shadow-sm">ခရိုင်ပြည်သူ့ဆေးရုံကြီး<br/>(ဆေးရုံ၏ဖွဲ့စည်းပုံအတိုင်း)</div>
                                <div className="grow"></div>
                                <div className="border border-[#7c93d9] w-full p-4 rounded-xl text-center text-[13px] leading-relaxed mt-auto">
                                    ခရိုင်ကုသရုံး - ၆ ရုံး <br/>ကိုယ်ပိုင်အုပ်ချုပ်ခွင့်ရဒေသ - ၂ ရုံး <br/>(ပအိုဝ်း၊ ဓနု)
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================
                ၃။ မြို့နယ်ကုသရေးဦးစီးဌာန ဖွဲ့စည်းပုံ
            ======================================================== */}
            <div className="bg-[#243b87] rounded-3xl md:rounded-4xl shadow-xl border border-slate-200 p-6 md:p-10 text-white relative">
                
                {/* ညာဘက်အပေါ်ထောင့်က Info Table */}
                <div className="relative md:absolute top-0 right-0 md:top-8 md:right-8 mb-6 md:mb-0 w-full md:w-56 bg-white text-slate-800 rounded-lg overflow-hidden shadow-lg border border-slate-200 text-xs md:text-sm">
                    <div className="bg-[#4371d1] text-white p-2 md:p-3 text-center font-medium">ဆေးရုံ၏ဖွဲ့စည်းပုံတွင်ပြင်ဆင်တိုးချဲ့မည့်ဖွဲ့စည်းပုံအင်အား</div>
                    <div className="flex justify-between p-2 border-b border-slate-100 bg-slate-50"><span className="pl-2">အရာထမ်း</span><span className="pr-2 font-bold">၄</span></div>
                    <div className="flex justify-between p-2 border-b border-slate-100"><span className="pl-2">အမှုထမ်း</span><span className="pr-2 font-bold">၁၃</span></div>
                    <div className="flex justify-between p-2 bg-slate-50"><span className="pl-2">စုစုပေါင်း</span><span className="pr-2 font-bold">၁၇</span></div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-center text-[#fbbc04] mb-8 md:mb-12 mt-2 md:mt-4">
                    မြို့နယ်ကုသရေးဦးစီးဌာန ဖွဲ့စည်းပုံ
                </h2>

                <div className="w-full overflow-x-auto custom-scrollbar-hide-mobile">
                    <div className="min-w-200 flex flex-col items-center pb-4">
                        
                        {/* Top Node */}
                        <div className="bg-[#d9771e] border border-[#e67e22] text-white px-8 py-4 rounded-lg font-medium text-base md:text-lg mb-10 text-center shadow-md max-w-2xl">
                            ဆေးရုံအုပ် / မြို့နယ်ကုသရေးဦးစီးဌာနမှူး<br/>(၃၀၈၀၀၀-၄၀၀၀-၃၂၈၀၀၀)
                        </div>

                        {/* 4 Branches Grid */}
                        <div className="grid grid-cols-4 gap-4 w-full mb-8">
                            <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-4 text-center text-sm flex items-center justify-center shadow-sm font-medium">ဦးစီးအရာရှိ<br/>(အုပ်ချုပ်/စီမံ)</div>
                            <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-4 text-center text-sm flex items-center justify-center shadow-sm font-medium">ဦးစီးအရာရှိ<br/>(သူနာပြု)</div>
                            <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-4 text-center text-sm flex items-center justify-center shadow-sm font-medium">ဦးစီးအရာရှိ<br/>(ဘဏ္ဍာရေး)</div>
                            <div className="bg-[#4371d1] border border-[#5a87e8] rounded-lg p-4 text-center text-sm flex items-center justify-center shadow-sm font-medium">မြို့နယ်ပြည်သူ့ဆေးရုံ<br/>(ဆေးရုံ၏ဖွဲ့စည်းပုံအတိုင်း)</div>
                        </div>

                        {/* Footers */}
                        <div className="flex w-full gap-6 justify-center items-start">
                            <div className="border border-[#7c93d9] w-[45%] p-5 rounded-xl text-center text-[13px] leading-relaxed">
                                အငယ်တန်းအင်ဂျင်နီယာ (၁)ဦး<br/>ဌာနခွဲစာရေး (၂)ဦး<br/>အကြီးတန်းစာရေး (၂)ဦး<br/>စာရင်းကိုင်-၃ (၁)ဦး<br/>အငယ်တန်းစာရေး (၂)ဦး<br/>စာရင်းကိုင်-၄ (၁)ဦး<br/>ရုံးအကူ (၃)ဦး<br/>ယာဉ်မောင်း (၂)ဦး
                            </div>
                            <div className="border border-[#7c93d9] w-[45%] p-5 rounded-xl text-center text-[13px] flex items-center justify-center min-h-25 font-medium text-lg">
                                မြို့နယ်ကုသရေးဦးစီးဌာန - ၂၀ ရုံး
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    );
}