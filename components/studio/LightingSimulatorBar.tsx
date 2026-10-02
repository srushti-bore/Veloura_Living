'use client';

import React from 'react';
import { Sun, Moon, Sunrise, Sunset, Sparkles } from 'lucide-react';

export type TimeOfDay = 'morning' | 'noon' | 'golden-hour' | 'night';

interface Props {
  selectedTime: TimeOfDay;
  onChange: (time: TimeOfDay) => void;
  className?: string;
}

export const LightingSimulatorBar: React.FC<Props> = ({ selectedTime, onChange, className = '' }) => {
  const TIMES: { id: TimeOfDay; label: string; timeStr: string; icon: any; desc: string }[] = [
    {
      id: 'morning',
      label: 'Soft Dawn',
      timeStr: '08:00 AM',
      icon: Sunrise,
      desc: 'Soft eastward natural daylight streaming into room',
    },
    {
      id: 'noon',
      label: 'Pure Daylight',
      timeStr: '01:30 PM',
      icon: Sun,
      desc: 'High architectural clarity & crisp natural shadows',
    },
    {
      id: 'golden-hour',
      label: 'Golden Hour',
      timeStr: '06:30 PM',
      icon: Sunset,
      desc: 'Rich amber sunset glow across walnut & bouclé',
    },
    {
      id: 'night',
      label: 'Ambient Brass',
      timeStr: '10:30 PM',
      icon: Moon,
      desc: 'Intimate evening mood with warm diffused floor lamp',
    },
  ];

  return (
    <div className={`bg-[#211E1B] text-white rounded-2xl p-4 sm:p-5 border border-white/15 shadow-xl ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#8B5A2B]/40 text-[#F5E6D3] border border-[#8B5A2B]/50">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-[#FCFAF7]">
              Day-to-Night Ambient Lighting Simulator
            </h4>
            <p className="text-[11px] text-[#A89F91]">
              Simulate how natural daylight and ambient brass lighting interact with room furniture.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#EADBC8] bg-black/40 px-3 py-1 rounded-full border border-white/10 self-start sm:self-auto">
          Active: {TIMES.find((t) => t.id === selectedTime)?.timeStr}
        </span>
      </div>

      {/* Time Pills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {TIMES.map((time) => {
          const Icon = time.icon;
          const isActive = selectedTime === time.id;
          return (
            <button
              key={time.id}
              onClick={() => onChange(time.id)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#8B5A2B] text-white border-[#F5E6D3]/40 shadow-lg scale-[1.02]'
                  : 'bg-white/5 text-[#DED7CD] border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#FCFAF7]' : 'text-[#8B5A2B]'}`} />
                <span className="text-[10px] font-mono opacity-80">{time.timeStr}</span>
              </div>
              <span className="font-display font-bold text-xs">{time.label}</span>
              <span className="text-[10px] opacity-70 line-clamp-1 mt-0.5">{time.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default LightingSimulatorBar;
