import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import MaterialModal from '../components/MaterialModal'
import { useTranslation } from 'react-i18next'

const TYPE_BADGES = {
  lecture: 'badge-blue',
  assignment: 'badge-amber',
  syllabus: 'badge-purple',
  note: 'badge-green',
  other: 'badge-red',
}

const TYPE_ICONS = {
  lecture: (
    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  assignment: (
    <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  syllabus: (
    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
}

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = () => {
    api.get(`/materials?q=${search}`)
      .then(res => setMaterials(res.data))
      .catch(() => toast.error('Failed to load materials'))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await api.delete(`/materials/${id}`)
        toast.success('Material deleted')
        fetchMaterials()
      } catch (err) {
        toast.error('Failed to delete material')
      }
    }
  }

  const handleEdit = (material) => {
    setSelectedMaterial(material)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedMaterial(null)
    setIsModalOpen(true)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    fetchMaterials()
  }

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.course_name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton h-12 w-full max-w-sm rounded-xl" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">{t('materials.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('materials.subtitle', { count: materials.length })}</p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          {t('materials.add')}
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={t('materials.search')}
          value={search}
          onChange={handleSearch}
          className="input-field pl-11"
        />
      </form>

      {filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">{t('materials.empty')}</p>
          <p className="text-slate-600 text-sm mt-1">{search ? t('materials.emptySearch') : t('materials.emptyDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m, i) => (
            <div
              key={m.id}
              className="glass-card-hover p-4 flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                {TYPE_ICONS[m.type] || TYPE_ICONS.lecture}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{m.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{m.course_name}</span>
                  {m.session_number && <span className="text-xs text-slate-600">• {t('materials.session', { number: m.session_number })}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={TYPE_BADGES[m.type] || TYPE_BADGES.other}>{m.type}</span>
                <div className="flex items-center gap-1">
                  <a
                    href={m.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 transition-colors"
                    title="Open link"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button onClick={() => handleEdit(m)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        material={selectedMaterial}
        onSuccess={fetchMaterials}
      />
    </div>
  )
}