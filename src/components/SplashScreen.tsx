'use client'; // Browser တွင်သာ အလုပ်လုပ်ရန်

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500); // 1.5 စက္ကန့်
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-[#f9f9f9] flex flex-col justify-center items-center z-9999 transition-opacity duration-500">
      <div className="flex items-center gap-5">
        {/* w-[60px] -> w-15, md:w-[80px] -> md:w-20 */}
        <div className="w-15 h-15 md:w-20 md:h-20 relative animate-[float_3s_ease-in-out_infinite]">
          {/* w-[45px] -> w-11.25, md:w-[60px] -> md:w-15 */}
          <div className="w-11.25 h-11.25 md:w-15 md:h-15 bg-[#0f2b46] rounded-xl absolute bottom-0 right-0"></div>
          <div className="w-11.25 h-11.25 md:w-15 md:h-15 bg-linear-to-br from-[#7ad3d3] to-[#4ea8a8] rounded-xl absolute top-0 left-0 flex justify-center items-center shadow-[0_4px_15px_rgba(78,168,168,0.4)]">
            <div className="text-[#0f2b46] text-3xl md:text-4xl font-bold leading-none animate-[heartbeat_1.5s_ease-in-out_infinite]">+</div>
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-[#1a2a46] text-4xl md:text-5xl m-0 font-bold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>MedDash</h1>
          <p className="text-[#4ea8a8] text-sm m-0 font-semibold tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>System Initializing</p>
        </div>
      </div>
      {/* max-w-[250px] -> max-w-62.5 */}
      <div className="w-[80%] max-w-62.5 mt-10 flex flex-col items-center gap-2.5">
        <div className="text-[#1a2a46] text-xs font-semibold tracking-[2px]" style={{ fontFamily: "'Poppins', sans-serif" }}>
          LOADING...
        </div>
        <div className="w-full h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
          <div className="h-full bg-linear-to-r from-[#7ad3d3] to-[#0f2b46] w-0 rounded-full animate-[fillProgress_1.5s_ease-in-out_forwards]"></div>
        </div>
      </div>
    </div>
  );
}