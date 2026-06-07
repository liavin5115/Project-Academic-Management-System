import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function TaskModal({ isOpen, onClose, task = null, onSuccess }) {
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    deadline: '',
    difficulty: 3
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      api.get('/courses').then(res => {
        setCourses(res.data)
        if (!task && res.data.length > 0) {
          setFormData(prev => ({ ...prev, course_id: res.data[0].id }))
        }
      }).catch(() => toast.error('Failed to load courses'))
    }
  }, [isOpen, task])

  useEffect(() => {
    if (task) {
      setFormData({
        course_id: task.course_id,
        title: task.title,
        description: task.description || '',
        deadline: new Date(task.deadline).toISOString().slice(0, 16),
        difficulty: task.difficulty || 3
      })
    } else {
      setFormData({ 
        course_id: courses.length > 0 ? courses[0].id : '', 
        title: '', 
        description: '', 
        deadline: '', 
        difficulty: 3 
      })
    }
  }, [task, isOpen, courses])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Convert local datetime to UTC format expected by backend if needed, or let FastAPI parse it
    const dataToSend = {
      ...formData,
      deadline: new Date(formData.deadline).toISOString()
    }

    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, dataToSend)
        toast.success('Task updated')
      } else {
        await api.post('/tasks', dataToSend)
        toast.success('Task created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? t('modal.task.edit') : t('modal.task.add')}>
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
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.task.title')}</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="e.g. Complete chapter 5 reading"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.task.deadline')}</label>
          <input
            required
            type="datetime-local"
            value={formData.deadline}
            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.task.difficulty')}</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={e => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
              className="flex-1 accent-brand-500"
            />
            <span className="text-sm font-medium text-amber-400 w-8 text-center bg-white/5 py-1 rounded-lg">
              {formData.difficulty}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.task.desc')}</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="input-field min-h-[80px] resize-y"
            placeholder="Optional details..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {t('modal.cancel')}
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? t('modal.saving') : t('modal.task.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
