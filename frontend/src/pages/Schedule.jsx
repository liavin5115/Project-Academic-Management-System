import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import ScheduleModal from '../components/ScheduleModal'
import { useTranslation } from 'react-i18next'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DAY_COLORS = {
  Monday: 'from-brand-500 to-brand-600',
  Tuesday: 'from-purple-500 to-purple-600',
  Wednesday: 'from-emerald-500 to-emerald-600',
  Thursday: 'from-amber-500 to-amber-600',
  Friday: 'from-cyan-500 to-cyan-600',
  Saturday: 'from-rose-500 to-rose-600',
}

export default function Schedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const { t } = useTranslation()

  const fetchSchedules = () => {
    api.get('/schedules')
      .then(res => setSchedules(res.data))
      .catch(() => toast.error('Failed to load schedules'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await api.delete(`/schedules/${id}`)
        toast.success('Schedule deleted')
        fetchSchedules()
      } catch (err) {
        toast.error('Failed to delete schedule')
      }
    }
  }

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedSchedule(null)
    setIsModalOpen(true)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-5 w-24 mb-3" />
              <div className="skeleton h-14 w-full rounded-xl mb-2" />
              <div className="skeleton h-14 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{t('schedule.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('schedule.subtitle')} <span className="text-brand-400 font-medium">{t('day.' + today.toLowerCase())}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t('schedule.grid')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            {t('schedule.list')}
          </button>
        </div>
        <button onClick={handleAdd} className="btn-primary ml-auto sm:ml-0">
          {t('schedule.add')}
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const daySchedules = schedules.filter(s => s.day_of_week === day)
            const isToday = day === today
            return (
              <div
                key={day}
                className={`glass-card p-5 transition-all duration-300 ${isToday ? 'ring-1 ring-brand-500/40 shadow-lg shadow-brand-500/10' : ''}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${DAY_COLORS[day]}`} />
                  <div>
                    <h3 className={`font-semibold ${isToday ? 'text-brand-400' : 'text-white'}`}>{t('day.' + day.toLowerCase())}</h3>
                    {isToday && <span className="text-[10px] text-brand-400 font-medium uppercase tracking-wider">{t('schedule.today')}</span>}
                  </div>
                </div>

                {daySchedules.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-slate-600">{t('schedule.empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {daySchedules.map(s => (
                      <div key={s.id} className="p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group relative">
                        <p className="font-medium text-sm text-white">{s.course_name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {s.start_time} – {s.end_time}
                          </p>
                          <span className="text-xs text-slate-500">{s.room}</span>
                        </div>
                        
                        {/* Action buttons (shown on hover) */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm rounded-lg p-1">
                          <button onClick={() => handleEdit(s)} className="p-1 text-white/60 hover:text-white transition-colors" title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1 text-white/60 hover:text-red-400 transition-colors" title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('schedule.table.day')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('schedule.table.course')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('schedule.table.time')}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('schedule.table.room')}</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('schedule.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.flatMap(day =>
                  schedules
                    .filter(s => s.day_of_week === day)
                    .map(s => (
                      <tr key={s.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors group ${day === today ? 'bg-brand-500/5' : ''}`}>
                        <td className="px-5 py-3">
                          <span className={`font-medium ${day === today ? 'text-brand-400' : 'text-white'}`}>{t('day.' + day.toLowerCase())}</span>
                        </td>
                        <td className="px-5 py-3 text-white">{s.course_name}</td>
                        <td className="px-5 py-3 text-slate-400">{s.start_time} – {s.end_time}</td>
                        <td className="px-5 py-3 text-slate-400">{s.room}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(s)} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(s.id)} className="p-1.5 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={selectedSchedule}
        onSuccess={fetchSchedules}
      />
    </div>
  )
}