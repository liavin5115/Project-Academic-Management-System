import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function CourseModal({ isOpen, onClose, course = null, onSuccess }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: 3,
    description: '',
    grade: '',
    lecturer_name: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code,
        name: course.name,
        credits: course.credits,
        description: course.description || '',
        grade: course.grade || '',
        lecturer_name: course.lecturer_name || ''
      })
    } else {
      setFormData({ code: '', name: '', credits: 3, description: '', grade: '', lecturer_name: '' })
    }
  }, [course, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Process payload
    const payload = { ...formData };
    if (!payload.lecturer_name) payload.lecturer_name = null;
    
    try {
      if (course) {
        await api.put(`/courses/${course.id}`, payload)
        toast.success('Course updated')
      } else {
        await api.post('/courses', payload)
        toast.success('Course created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={course ? t('modal.course.edit') : t('modal.course.add')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.course.code')}</label>
            <input
              required
              type="text"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="input-field"
              placeholder="CS101"
              maxLength={20}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.course.name')}</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Intro to Computer Science"
              maxLength={100}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.course.credits')}</label>
            <input
              required
              type="number"
              min="1"
              max="6"
              value={formData.credits}
              onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 1 })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.course.grade', 'Grade (Optional)')}</label>
            <select
              value={formData.grade}
              onChange={e => setFormData({ ...formData, grade: e.target.value })}
              className="input-field"
            >
              <option value="">None</option>
              {['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.course.lecturer', 'Lecturer (Optional)')}</label>
          <input
            type="text"
            value={formData.lecturer_name}
            onChange={e => setFormData({ ...formData, lecturer_name: e.target.value })}
            className="input-field"
            placeholder="e.g., Dr. Smith"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.course.desc')}</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="input-field min-h-[100px] resize-y"
            placeholder="Optional course description..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {t('modal.cancel')}
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? t('modal.saving') : t('modal.course.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
