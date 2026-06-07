import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ScheduleModal({ isOpen, onClose, schedule = null, onSuccess }) {
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    course_id: '',
    day_of_week: 'Monday',
    start_time: '',
    end_time: '',
    room: '',
    semester: '1'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      api.get('/courses').then(res => {
        setCourses(res.data)
        if (!schedule && res.data.length > 0) {
          setFormData(prev => ({ ...prev, course_id: res.data[0].id }))
        }
      }).catch(() => toast.error('Failed to load courses'))
    }
  }, [isOpen, schedule])

  useEffect(() => {
    if (schedule) {
      setFormData({
        course_id: schedule.course_id,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time || '',
        end_time: schedule.end_time || '',
        room: schedule.room || '',
        semester: schedule.semester || '1'
      })
    } else {
      setFormData({ 
        course_id: courses.length > 0 ? courses[0].id : '', 
        day_of_week: 'Monday',
        start_time: '',
        end_time: '',
        room: '',
        semester: '1'
      })
    }
  }, [schedule, isOpen, courses])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Ensure times are formatted correctly as HH:MM:SS or HH:MM
    const dataToSend = { ...formData }
    if (dataToSend.start_time.length === 5) dataToSend.start_time += ':00'
    if (dataToSend.end_time.length === 5) dataToSend.end_time += ':00'

    try {
      if (schedule) {
        await api.put(`/schedules/${schedule.id}`, dataToSend)
        toast.success('Schedule updated')
      } else {
        await api.post('/schedules', dataToSend)
        toast.success('Schedule created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save schedule')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={schedule ? t('modal.schedule.edit') : t('modal.schedule.add')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.task.course')}</label>
          <select
            required
            value={formData.course_id}
            onChange={e => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
            className="input-field"
          >
            <option value="" disabled>{t('modal.course.select')}</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.schedule.day')}</label>
          <select
            required
            value={formData.day_of_week}
            onChange={e => setFormData({ ...formData, day_of_week: e.target.value })}
            className="input-field"
          >
            {DAYS.map(d => (
              <option key={d} value={d}>{t('day.' + d.toLowerCase())}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.schedule.start')}</label>
            <input
              required
              type="time"
              value={formData.start_time}
              onChange={e => setFormData({ ...formData, start_time: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.schedule.end')}</label>
            <input
              required
              type="time"
              value={formData.end_time}
              onChange={e => setFormData({ ...formData, end_time: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.schedule.room')}</label>
            <input
              type="text"
              value={formData.room}
              onChange={e => setFormData({ ...formData, room: e.target.value })}
              className="input-field"
              placeholder="e.g. A-101"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.schedule.semester')}</label>
            <input
              required
              type="text"
              value={formData.semester}
              onChange={e => setFormData({ ...formData, semester: e.target.value })}
              className="input-field"
              placeholder="e.g. Fall 2026"
              maxLength={20}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {t('modal.cancel')}
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? t('modal.saving') : t('modal.schedule.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
