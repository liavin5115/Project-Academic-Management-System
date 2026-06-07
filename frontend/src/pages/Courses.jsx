import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import CourseModal from '../components/CourseModal'
import { useTranslation } from 'react-i18next'

const COLORS = [
  'from-brand-500/20 to-brand-600/10 border-brand-500/20',
  'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
  'from-amber-500/20 to-amber-600/10 border-amber-500/20',
  'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20',
  'from-rose-500/20 to-rose-600/10 border-rose-500/20',
]

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const { t } = useTranslation()

  const fetchCourses = () => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const calculateGPA = () => {
    const points = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0 };
    let totalCredits = 0;
    let totalPoints = 0;
    courses.forEach(c => {
      if (c.grade && points[c.grade] !== undefined) {
        totalCredits += c.credits;
        totalPoints += c.credits * points[c.grade];
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course? All related tasks and schedules will be removed.')) {
      try {
        await api.delete(`/courses/${id}`)
        toast.success('Course deleted')
        fetchCourses()
      } catch (err) {
        toast.error('Failed to delete course')
      }
    }
  }

  const handleEdit = (course) => {
    setSelectedCourse(course)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedCourse(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <div className="skeleton h-5 w-32 mb-3" />
              <div className="skeleton h-4 w-48 mb-2" />
              <div className="skeleton h-4 w-24" />
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
          <h1 className="page-title">{t('courses.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('courses.subtitle', { count: courses.length })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{t('courses.currentGPA', 'Current GPA')}</p>
              <p className="text-lg font-bold text-white leading-none mt-0.5">{calculateGPA()}</p>
            </div>
          </div>
          <button onClick={handleAdd} className="btn-primary">
            {t('courses.new')}
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">{t('courses.empty')}</p>
          <p className="text-slate-600 text-sm mt-1">{t('courses.emptyDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <div
              key={course.id}
              className={`glass-card-hover p-6 bg-gradient-to-br ${COLORS[i % COLORS.length]} animate-slide-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-purple">{course.code}</span>
                  {course.grade && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-white border border-white/20">
                      {course.grade}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(course)} className="p-1.5 text-white/60 hover:text-white bg-black/10 hover:bg-black/20 rounded-lg transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(course.id)} className="p-1.5 text-white/60 hover:text-red-300 bg-black/10 hover:bg-black/20 rounded-lg transition-colors" title="Delete">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{course.name}</h3>
              {course.description && (
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{course.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-auto pt-2 border-t border-white/5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{(course.lecturer_count || 0) !== 1 ? t('courses.lecturers', { count: course.lecturer_count || 0 }) : t('courses.lecturer', { count: course.lecturer_count || 0 })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={selectedCourse}
        onSuccess={fetchCourses}
      />
    </div>
  )
}