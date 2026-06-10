import React from 'react';
import { useTranslation } from 'react-i18next';

interface Phase {
  key: string;
  titleKey: string;
  itemsKey: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

export const RoadmapTimeline: React.FC = () => {
  const { t } = useTranslation();
  
  const phases: Phase[] = [
    {
      key: 'done',
      titleKey: 'rm_phase_done_t',
      itemsKey: 'rm_phase_done_items',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
    },
    {
      key: 'now',
      titleKey: 'rm_phase_now_t',
      itemsKey: 'rm_phase_now_items',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      key: 'wc2026',
      titleKey: 'rm_phase_wc2026_t',
      itemsKey: 'rm_phase_wc2026_items',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    },
    {
      key: 'postwc',
      titleKey: 'rm_phase_postwc_t',
      itemsKey: 'rm_phase_postwc_items',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  const getColorValue = (colorClass: string) => colorClass.replace('text-', '');
  const getBgValue = (bgClass: string) => bgClass.replace('bg-', '');

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700" />
      
      <div className="space-y-10 pl-14">
        {phases.map((phase, index) => (
          <div key={phase.key} className="relative group">
            {/* Timeline dot */}
            <div 
              className="absolute left-[-14px] top-2 w-4 h-4 rounded-full border-2 transition-all duration-300 group-hover:scale-125"
              style={{ 
                borderColor: getColorValue(phase.color),
                backgroundColor: index === 0 ? getColorValue(phase.color) : 'transparent'
              }}
            >
              {index === 0 && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                  {phase.icon}
                </span>
              )}
            </div>
            
            {/* Phase card */}
            <div 
              className="bg-slate-900/60 border rounded-2xl p-5 hover:border-opacity-50 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
              style={{ borderColor: getColorValue(phase.color) + '50' }}
            >
              {/* Background glow */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: getBgValue(phase.bgColor) }}
              />
              
              <div className="relative z-10 flex gap-4">
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    color: getColorValue(phase.color),
                    backgroundColor: getBgValue(phase.bgColor)
                  }}
                >
                  {phase.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-bold text-lg mb-2"
                    style={{ color: getColorValue(phase.color) }}
                  >
                    {t(phase.titleKey)}
                  </h4>
                  
                  <div className="space-y-1">
                    {t(phase.itemsKey).split(' · ').map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                        <span 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getColorValue(phase.color) }}
                        />
                        <span>{item.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Progress indicator for current phase */}
              {index === 1 && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-slate-700/50">
        <div className="flex flex-wrap gap-4 justify-center">
          {phases.map((phase) => (
            <span key={phase.key} className="flex items-center gap-2 text-sm">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: getColorValue(phase.color),
                  opacity: 0.5
                }} 
              />
              <span className="text-slate-400">{t(phase.titleKey)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;