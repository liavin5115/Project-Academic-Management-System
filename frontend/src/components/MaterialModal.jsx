import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const TYPES = ['lecture', 'assignment', 'syllabus', 'note', 'other']

export default function MaterialModal({ isOpen, onClose, material = null, onSuccess }) {
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    session_number: '',
    drive_link: '',
    type: 'lecture'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      api.get('/courses').then(res => {
        setCourses(res.data)
        if (!material && res.data.length > 0) {
          setFormData(prev => ({ ...prev, course_id: res.data[0].id }))
        }
      }).catch(() => toast.error('Failed to load courses'))
    }
  }, [isOpen, material])

  useEffect(() => {
    if (material) {
      setFormData({
        course_id: material.course_id,
        title: material.title,
        session_number: material.session_number || '',
        drive_link: material.drive_link || '',
        type: material.type || 'lecture'
      })
    } else {
      setFormData({ 
        course_id: courses.length > 0 ? courses[0].id : '', 
        title: '',
        session_number: '',
        drive_link: '',
        type: 'lecture'
      })
    }
  }, [material, isOpen, courses])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const dataToSend = { ...formData, session_number: formData.session_number ? parseInt(formData.session_number) : null }

    try {
      if (material) {
        await api.put(`/materials/${material.id}`, dataToSend)
        toast.success('Material updated')
      } else {
        await api.post('/materials', dataToSend)
        toast.success('Material created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save material')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={material ? t('modal.material.edit') : t('modal.material.add')}>
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
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.material.title')}</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="e.g. Week 1 Slides"
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.material.type')}</label>
            <select
              required
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
            >
              {TYPES.map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.material.session')}</label>
            <input
              type="number"
              min="1"
              value={formData.session_number}
              onChange={e => setFormData({ ...formData, session_number: e.target.value })}
              className="input-field"
              placeholder="e.g. 1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">{t('modal.material.link')}</label>
          <input
            type="url"
            value={formData.drive_link}
            onChange={e => setFormData({ ...formData, drive_link: e.target.value })}
            className="input-field"
            placeholder="https://..."
            maxLength={500}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors">
            {t('modal.cancel')}
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? t('modal.saving') : t('modal.material.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
