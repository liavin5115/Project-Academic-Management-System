import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format, subDays, subMonths, isAfter, isSameDay } from 'date-fns';
import { usePomodoroStore } from '../store/pomodoroStore';

export default function Pomodoro() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const store = usePomodoroStore();
  
  // Settings sync
  const [studyTime, setStudyTime] = useState(store.studyTime);
  const [restTime, setRestTime] = useState(store.restTime);
  const [sections, setSections] = useState(store.sections);
  const [selectedCourse, setSelectedCourse] = useState(store.selectedCourse);

  // Stats state
  const [timeFilter, setTimeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

  const fetchCourses = () => {
    api.get('/courses').then(res => setCourses(res.data)).catch(console.error);
  };

  const fetchSessions = () => {
    api.get('/pomodoros').then(res => setSessions(res.data)).catch(console.error);
  };

  useEffect(() => {
    if (!store.isActive) {
      store.setSettings(studyTime, restTime, sections, selectedCourse);
    }
  }, [studyTime, restTime, sections, selectedCourse]);

  const minutes = Math.floor(store.timeLeft / 60);
  const seconds = store.timeLeft % 60;
  const totalParts = store.sections + 1;

  // Stats calculation
  const getFilteredSessions = () => {
    let filtered = sessions;
    
    if (courseFilter !== 'all') {
      filtered = filtered.filter(s => s.course_id === parseInt(courseFilter));
    }
    
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(s => {
        const date = new Date(s.completed_at);
        if (timeFilter === 'today') return isSameDay(date, now);
        if (timeFilter === 'week') return isAfter(date, subDays(now, 7));
        if (timeFilter === 'month') return isAfter(date, subMonths(now, 1));
        if (timeFilter === '6months') return isAfter(date, subMonths(now, 6));
        if (timeFilter === 'year') return isAfter(date, subMonths(now, 12));
        return true;
      });
    }
    
    return filtered;
  };

  const filteredSessions = getFilteredSessions();
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{t('pomodoro.title', 'Focus')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('pomodoro.subtitle', 'Track your study sessions')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Section */}
        <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-full max-w-sm space-y-6">
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('pomodoro.studyTime', 'Study (min)')}</label>
                <input 
                  type="number" 
                  value={studyTime} 
                  onChange={e => setStudyTime(parseInt(e.target.value) || 1)}
                  disabled={store.isActive}
                  className="input-field" 
                  min="1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('pomodoro.restTime', 'Rest (min)')}</label>
                <input 
                  type="number" 
                  value={restTime} 
                  onChange={e => setRestTime(parseInt(e.target.value) || 1)}
                  disabled={store.isActive}
                  className="input-field" 
                  min="1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('pomodoro.sections', 'Breaks (Sections)')}</label>
                <input 
                  type="number" 
                  value={sections} 
                  onChange={e => setSections(parseInt(e.target.value) || 0)}
                  disabled={store.isActive}
                  className="input-field" 
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('pomodoro.course', 'Course')}</label>
              <select 
                value={selectedCourse} 
                onChange={e => setSelectedCourse(e.target.value)}
                disabled={store.isActive}
                className="input-field"
              >
                <option value="">{t('pomodoro.noCourse', 'General Study')}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div className={`text-center py-8 rounded-full border-4 transition-colors duration-500 ${store.mode === 'study' ? (store.isActive ? 'border-brand-500 text-brand-400' : 'border-white/10 text-white') : 'border-emerald-500 text-emerald-400'}`}>
              <div className="text-sm font-bold tracking-widest uppercase mb-1">
                {store.mode === 'study' ? t('pomodoro.focusing', 'Focus') : t('pomodoro.resting', 'Rest')}
              </div>
              {store.mode === 'study' && totalParts > 1 && (
                <div className="text-xs text-brand-400/70 mb-2">
                  {t('pomodoro.part', 'Part {{current}} of {{total}}', { current: store.currentPart, total: totalParts })}
                </div>
              )}
              <div className="text-6xl font-bold tabular-nums tracking-tighter">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={store.toggleTimer}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${store.isActive ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-brand-500 text-white hover:bg-brand-600'}`}
              >
                {store.isActive ? t('pomodoro.pause', 'Pause') : t('pomodoro.start', 'Start')}
              </button>
              <button 
                onClick={store.stopTimer}
                className="px-6 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {t('pomodoro.stop', 'Stop')}
              </button>
            </div>

          </div>
        </div>

        {/* Stats Section */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-4">{t('pomodoro.stats', 'Study Statistics')}</h2>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('pomodoro.filterTime', 'Time Range')}</label>
              <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="input-field py-2">
                <option value="today">{t('pomodoro.timeToday', 'Today')}</option>
                <option value="week">{t('pomodoro.timeWeek', 'This Week')}</option>
                <option value="month">{t('pomodoro.timeMonth', 'This Month')}</option>
                <option value="6months">{t('pomodoro.time6Months', 'Last 6 Months')}</option>
                <option value="year">{t('pomodoro.timeYear', 'This Year')}</option>
                <option value="all">{t('pomodoro.timeAll', 'All Time')}</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('pomodoro.filterCourse', 'Course')}</label>
              <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field py-2">
                <option value="all">{t('pomodoro.courseAll', 'All Courses')}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <div className="text-sm font-medium text-slate-400 mb-1">{t('pomodoro.totalHours', 'Total Hours')}</div>
              <div className="text-3xl font-bold text-white">{totalHours}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <div className="text-sm font-medium text-slate-400 mb-1">{t('pomodoro.sessionsCount', 'Sessions')}</div>
              <div className="text-3xl font-bold text-brand-400">{filteredSessions.length}</div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium text-slate-400 mb-3">{t('pomodoro.history', 'Recent Sessions')}</h3>
            <div className="space-y-2">
              {filteredSessions.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">{t('pomodoro.noHistory', 'No sessions found.')}</p>
              ) : (
                filteredSessions.slice(0, 10).map(s => {
                  const course = courses.find(c => c.id === s.course_id);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="text-white text-sm font-medium">{course ? course.code : t('pomodoro.noCourse', 'General Study')}</p>
                        <p className="text-slate-500 text-xs">{format(new Date(s.completed_at), 'PPp')}</p>
                      </div>
                      <span className="badge-purple">{s.duration_minutes} min</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
