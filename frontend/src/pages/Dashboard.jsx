import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import CourseModal from '../components/CourseModal'
import TaskModal from '../components/TaskModal'
import { useTranslation } from 'react-i18next'
import { format, parseISO, isPast, isToday } from 'date-fns'

function StatCard({ icon, label, value, color }) {
  const colors = {
    brand: 'from-brand-500 to-brand-700',
    purple: 'from-purple-500 to-purple-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    red: 'from-red-500 to-red-700',
  }

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color] || colors.brand} flex items-center justify-center shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="skeleton h-5 w-40 mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-16 w-full mb-3 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const { t } = useTranslation();

  const fetchDashboard = () => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('dash.title')}</h1>
        <div className="text-sm font-medium text-slate-400">
          {/* We will leave this layout date as is since we'll update Layout.jsx with global time */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{t('dash.stats.courses')}</p>
              <h3 className="text-2xl font-bold text-white">{data?.courses_count || 0}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{t('dash.stats.inProgress')}</p>
              <h3 className="text-2xl font-bold text-white">{data?.in_progress_count || 0}</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{t('dash.stats.completed')}</p>
              <h3 className="text-2xl font-bold text-white">{data?.done_count || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="glass-card p-6 flex flex-col h-full">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('dash.schedule')}
          </h2>

          {(!data?.today_schedule || data.today_schedule.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-slate-500 text-sm font-medium">No classes today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.today_schedule.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="w-1 h-12 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.course_name || 'Class'}</p>
                    <p className="text-sm text-slate-400">{item.room || '—'}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{item.start_time || ''}</p>
                    <p>{item.end_time || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t('dash.urgentTasks', 'Urgent Tasks')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">{data?.urgent_tasks_count || 0} {t('dash.dueCount', 'due')}</span>
          </div>

          {(!data?.urgent_tasks || data.urgent_tasks.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-slate-500 text-sm font-medium">{t('dash.allClear', 'All clear!')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.urgent_tasks.map(task => {
                const deadline = task.deadline ? parseISO(task.deadline) : new Date();
                return (
                <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="w-1 h-12 rounded-full bg-gradient-to-b from-red-400 to-red-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{task.title}</p>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 whitespace-nowrap">
                        {task.course_code}
                      </span>
                      <span className={`text-xs font-medium whitespace-nowrap ${
                        isPast(deadline) && !isToday(deadline) ? 'text-rose-400' :
                        isToday(deadline) ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {t('dash.due')} {format(deadline, 'MMM d, HH:mm')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{t(`diff.${task.difficulty}`, 'Medium')}</p>
                    <p className="text-sm text-amber-400">{'★'.repeat(task.difficulty || 0)}</p>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
      
      <CourseModal 
        isOpen={isCourseModalOpen} 
        onClose={() => setIsCourseModalOpen(false)} 
        onSuccess={fetchDashboard} 
      />
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSuccess={fetchDashboard} 
      />
    </div>
  )
}