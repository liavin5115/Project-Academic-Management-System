import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const GRADE_POINTS = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'D': 1.0,
  'F': 0.0
};

export default function GPACalculator() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hypothetical grades state mapping course id -> grade
  const [hypoGrades, setHypoGrades] = useState({});
  const [semesterName, setSemesterName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, reportsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/gpa')
      ]);
      setCourses(coursesRes.data);
      setReports(reportsRes.data);
      
      // Initialize hypo grades
      const initialGrades = {};
      coursesRes.data.forEach(c => {
        initialGrades[c.id] = c.grade || 'A';
      });
      setHypoGrades(initialGrades);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (id, grade) => {
    setHypoGrades(prev => ({ ...prev, [id]: grade }));
  };

  // Calculations
  const calculateGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    courses.forEach(c => {
      const grade = hypoGrades[c.id];
      if (grade && GRADE_POINTS[grade] !== undefined) {
        totalCredits += c.credits;
        totalPoints += c.credits * GRADE_POINTS[grade];
      }
    });
    return {
      gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00',
      credits: totalCredits
    };
  };

  const currentStatus = calculateGPA();

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!semesterName.trim()) {
      toast.error('Please enter a semester name');
      return;
    }
    
    setSaving(true);
    try {
      await api.post('/gpa', {
        semester_name: semesterName,
        total_credits: currentStatus.credits,
        gpa: parseFloat(currentStatus.gpa)
      });
      toast.success('Report saved successfully!');
      setSemesterName('');
      fetchData(); // reload reports
    } catch (err) {
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this historical report?')) return;
    try {
      await api.delete(`/gpa/${id}`);
      toast.success('Report deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  // SVG Chart Calculation
  const maxGPA = 4.0;
  const chartHeight = 150;
  const chartWidth = 100; // percent

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{t('gpa.title', 'GPA Calculator')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('gpa.subtitle', 'Project your grades and track history')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Calculator */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {t('gpa.calculator', 'Calculator')}
          </h2>

          {loading ? (
            <div className="skeleton h-32 w-full rounded-xl" />
          ) : courses.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              {t('gpa.noCourses', 'No courses added yet. Go to Courses page to add some!')}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
              {courses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-white font-medium text-sm">{course.code}</p>
                    <p className="text-slate-400 text-xs">{course.name} ({course.credits} {t('gpa.credits', 'cr')})</p>
                  </div>
                  <select 
                    value={hypoGrades[course.id] || 'A'}
                    onChange={(e) => handleGradeChange(course.id, e.target.value)}
                    className="input-field py-1.5 w-20 text-center font-bold"
                  >
                    {Object.keys(GRADE_POINTS).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-white/10 mt-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-slate-400">{t('gpa.projected', 'Projected GPA')}</p>
                <p className="text-4xl font-black text-brand-400 tracking-tight">{currentStatus.gpa}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-400">{t('gpa.totalCredits', 'Total Credits')}</p>
                <p className="text-2xl font-bold text-white">{currentStatus.credits}</p>
              </div>
            </div>

            <form onSubmit={handleSaveReport} className="flex gap-3">
              <input 
                type="text" 
                placeholder={t('gpa.semesterName', 'e.g., Fall 2024')} 
                value={semesterName}
                onChange={e => setSemesterName(e.target.value)}
                className="input-field flex-1"
                required
              />
              <button 
                type="submit" 
                disabled={saving || courses.length === 0}
                className="btn-primary whitespace-nowrap"
              >
                {saving ? t('gpa.saving', 'Saving...') : t('gpa.saveReport', 'Save Report')}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Chart & History */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 h-64 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">{t('gpa.trend', 'GPA Trend')}</h2>
            <div className="flex-1 relative mt-2">
              {reports.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                  {t('gpa.noReports', 'Save a report to see your trend.')}
                </div>
              ) : (
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map(line => {
                    const y = chartHeight - (line / maxGPA) * chartHeight;
                    return (
                      <g key={line}>
                        <line x1="0" y1={y} x2="100%" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <text x="-5" y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">{line}.0</text>
                      </g>
                    );
                  })}
                  
                  {/* Line Path */}
                  <path 
                    d={`M ${reports.map((r, i) => {
                      const x = reports.length === 1 ? 50 : (i / (reports.length - 1)) * 100;
                      const y = chartHeight - (r.gpa / maxGPA) * chartHeight;
                      return `${x}% ${y}`;
                    }).join(' L ')}`} 
                    fill="none" 
                    stroke="url(#brandGradient)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Points */}
                  {reports.map((r, i) => {
                    const x = reports.length === 1 ? 50 : (i / (reports.length - 1)) * 100;
                    const y = chartHeight - (r.gpa / maxGPA) * chartHeight;
                    return (
                      <circle 
                        key={r.id} 
                        cx={`${x}%`} 
                        cy={y} 
                        r="5" 
                        fill="#1e1e2e" 
                        stroke="#60a5fa" 
                        strokeWidth="2" 
                        className="transition-all hover:r-6 hover:stroke-white cursor-pointer"
                      >
                        <title>{r.semester_name}: {r.gpa}</title>
                      </circle>
                    );
                  })}

                  <defs>
                    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
          </div>

          <div className="glass-card p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">{t('gpa.history', 'History')}</h2>
            <div className="flex-1 overflow-y-auto space-y-2">
              {reports.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-4">
                  {t('gpa.noHistory', 'Your saved reports will appear here.')}
                </div>
              ) : (
                reports.slice().reverse().map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <div>
                      <p className="text-white font-semibold text-sm">{report.semester_name}</p>
                      <p className="text-slate-400 text-xs">
                        {format(new Date(report.created_at), 'MMM d, yyyy')} • {report.total_credits} {t('gpa.credits', 'cr')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-brand-400">{report.gpa.toFixed(2)}</span>
                      <button 
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Report"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
