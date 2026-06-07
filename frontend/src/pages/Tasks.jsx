import React, { useEffect, useState } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../lib/api'
import toast from 'react-hot-toast'
import TaskModal from '../components/TaskModal'
import { useTranslation } from 'react-i18next'

const KANBAN_COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'from-slate-400 to-slate-500', dotColor: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'from-amber-400 to-amber-500', dotColor: 'bg-amber-400' },
  { id: 'review', label: 'Review', color: 'from-purple-400 to-purple-500', dotColor: 'bg-purple-400' },
  { id: 'done', label: 'Done', color: 'from-emerald-400 to-emerald-500', dotColor: 'bg-emerald-400' },
]

function TaskCard({ task, onEdit, onDelete, isOverlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || isOverlay ? 50 : undefined,
  }

  const deadlineDate = new Date(task.deadline)
  const now = new Date()
  const hoursLeft = Math.max(0, (deadlineDate - now) / (1000 * 60 * 60))
  const isUrgent = hoursLeft < 24 && task.kanban_status !== 'done'

  const formatDeadline = () => {
    if (hoursLeft < 1) return 'Overdue!'
    if (hoursLeft < 24) return `${Math.round(hoursLeft)}h left`
    if (hoursLeft < 48) return 'Tomorrow'
    return deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 rounded-xl transition-all duration-200 border group cursor-grab active:cursor-grabbing relative
        ${isUrgent ? 'border-red-500/30' : 'border-transparent'} 
        ${isDragging ? 'opacity-30' : 'bg-white/5 hover:bg-white/8'}
        ${isOverlay ? 'bg-white/10 shadow-xl shadow-brand-500/10 ring-1 ring-brand-500/50 scale-105 opacity-100 rotate-2' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-white text-sm leading-snug">{task.title}</h4>
        {task.priority_score && (
          <span className="shrink-0 text-[10px] font-bold text-brand-400">
            P{Math.round(task.priority_score)}
          </span>
        )}
      </div>
      
      {/* Action buttons (shown on hover) */}
      <div className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 ${isOverlay ? 'hidden' : ''}`}>
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onEdit(task)} 
          className="p-1 text-white/60 hover:text-white transition-colors" 
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={() => onDelete(task.id)} 
          className="p-1 text-white/60 hover:text-red-400 transition-colors" 
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="badge-purple text-[10px]">{task.course_name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400">{'★'.repeat(task.difficulty || 0)}</span>
          <span className={`text-[10px] font-medium ${isUrgent ? 'text-red-400' : 'text-slate-500'}`}>
            {formatDeadline()}
          </span>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ col, tasks, onEdit, onDelete, t }) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
    data: { type: 'Column', col }
  })

  return (
    <div 
      ref={setNodeRef} 
      className={`kanban-col flex flex-col transition-colors min-h-[300px] ${isOver ? 'bg-white/5 ring-1 ring-white/10 rounded-2xl' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
          <h3 className="text-sm font-semibold text-white capitalize">
            {t(`tasks.col.${col.id}`)}
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs font-medium text-slate-400">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1 pb-8">
          {tasks.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl h-full flex items-center justify-center">
              <p className="text-xs text-slate-600">Drop here</p>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const { t } = useTranslation()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = () => {
    api.get('/tasks?sort=kanban')
      .then(res => setTasks(res.data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`)
        toast.success('Task deleted')
        fetchTasks()
      } catch (err) {
        toast.error('Failed to delete task')
      }
    }
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const handleDragStart = (event) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    if (isOverTask) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId)
        const overIndex = prev.findIndex(t => t.id === overId)
        
        if (prev[activeIndex].kanban_status !== prev[overIndex].kanban_status) {
           const newTasks = [...prev]
           newTasks[activeIndex] = { ...newTasks[activeIndex], kanban_status: newTasks[overIndex].kanban_status }
           return arrayMove(newTasks, activeIndex, overIndex)
        }
        
        return arrayMove(prev, activeIndex, overIndex)
      })
    }

    if (isOverColumn) {
      setTasks(prev => {
        const activeIndex = prev.findIndex(t => t.id === activeId)
        if (prev[activeIndex].kanban_status !== overId) {
           const newTasks = [...prev]
           newTasks[activeIndex] = { ...newTasks[activeIndex], kanban_status: overId }
           // Move to the end of the list
           return arrayMove(newTasks, activeIndex, newTasks.length - 1)
        }
        return prev
      })
    }
  }

  const handleDragEnd = (event) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const updatedTasks = tasks.map((t, index) => ({
      id: t.id,
      kanban_status: t.kanban_status,
      position: index
    }))

    api.patch('/tasks/reorder', { tasks: updatedTasks })
      .catch(() => {
        toast.error('Failed to save order')
        fetchTasks()
      })
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-5 w-24 mb-4" />
              <div className="skeleton h-24 w-full rounded-xl mb-3" />
              <div className="skeleton h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('tasks.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('tasks.subtitle')}</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          {t('tasks.addTask')}
        </button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.kanban_status === col.id)
            return (
              <KanbanColumn 
                key={col.id} 
                col={col} 
                tasks={colTasks} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                t={t}
              />
            )
          })}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? (
            <TaskCard task={activeTask} isOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSuccess={fetchTasks}
      />
    </div>
  )
}