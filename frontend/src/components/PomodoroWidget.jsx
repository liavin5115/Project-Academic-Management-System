import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePomodoroStore } from '../store/pomodoroStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function PomodoroWidget() {
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const store = usePomodoroStore();
  
  useEffect(() => {
    let interval = null;
    interval = setInterval(() => {
      store.tick(
        (data) => {
          api.post('/pomodoros', data)
            .then(() => toast.success('Pomodoro session completed & saved!'))
            .catch(() => toast.error('Failed to save Pomodoro session'));
        },
        (phase) => {
          if (phase === 'rest') toast.success('Time for a break!');
          if (phase === 'study') toast.success('Break is over! Ready to focus?');
        }
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [store]);

  // Hide widget completely on the dedicated Pomodoro page
  if (location.pathname === '/pomodoro') return null;

  const minutes = Math.floor(store.timeLeft / 60);
  const seconds = store.timeLeft % 60;
  const totalParts = store.sections + 1;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-14 h-14 rounded-full' : 'w-64 rounded-2xl'} bg-surface-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden`}>
      {isMinimized ? (
        <button 
          onClick={() => setIsMinimized(false)}
          className={`w-full h-full flex items-center justify-center transition-colors ${store.isActive ? 'text-brand-400 bg-brand-500/10' : 'text-slate-400 bg-white/5 hover:bg-white/10'}`}
        >
          <svg className={`w-6 h-6 ${store.isActive ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      ) : (
        <div className={`p-4 ${store.mode === 'rest' ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5' : 'bg-gradient-to-br from-brand-500/5 to-purple-500/5'}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg className={`w-4 h-4 ${store.mode === 'rest' ? 'text-emerald-400' : 'text-brand-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {store.mode === 'study' ? `Focus (Part ${store.currentPart}/${totalParts})` : 'Resting'}
            </h3>
            <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className={`text-4xl font-bold text-center mb-4 tabular-nums tracking-tight ${store.mode === 'rest' ? 'text-emerald-400' : 'text-white'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={store.toggleTimer}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${store.isActive ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : (store.mode === 'rest' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-brand-500 text-white hover:bg-brand-600')}`}
            >
              {store.isActive ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={store.stopTimer}
              className="px-3 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
