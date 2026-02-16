'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckSquare, Square, Clock, Trash2, Plus, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import type { ProjectTask, TaskStatus, TaskPriority } from '@/lib/types'

interface TaskManagerProps {
    projectId: string
    isOwner: boolean
    myDancerIds: string[]
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
    low: 'text-blue-400/60',
    medium: 'text-yellow-400/60',
    high: 'text-red-400/60',
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
    low: '낮음',
    medium: '보통',
    high: '높음',
}

export default function TaskManager({ projectId, isOwner, myDancerIds }: TaskManagerProps) {
    const [tasks, setTasks] = useState<ProjectTask[]>([])
    const [loading, setLoading] = useState(true)
    const [showCompleted, setShowCompleted] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as TaskPriority, due_date: '' })

    useEffect(() => {
        fetchTasks()
    }, [projectId])

    const fetchTasks = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('project_tasks')
            .select('*, assigned_dancer:dancers!assigned_to(id, stage_name, profile_img)')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setTasks(data as any)
        }
        setLoading(false)
    }

    const addTask = async () => {
        if (!newTask.title.trim()) return
        const { error } = await supabase.from('project_tasks').insert({
            project_id: projectId,
            title: newTask.title.trim(),
            description: newTask.description.trim() || null,
            priority: newTask.priority,
            due_date: newTask.due_date || null,
            created_by: (await supabase.auth.getUser()).data.user!.id,
        })
        if (!error) {
            setNewTask({ title: '', description: '', priority: 'medium', due_date: '' })
            setShowAddForm(false)
            fetchTasks()
        }
    }

    const toggleTaskStatus = async (task: ProjectTask) => {
        const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
        const updates: any = { status: newStatus }
        if (newStatus === 'completed') updates.completed_at = new Date().toISOString()
        else updates.completed_at = null

        const { error } = await supabase.from('project_tasks').update(updates).eq('id', task.id)
        if (!error) fetchTasks()
    }

    const deleteTask = async (taskId: string) => {
        if (!confirm('이 할일을 삭제하시겠습니까?')) return
        const { error } = await supabase.from('project_tasks').delete().eq('id', taskId)
        if (!error) fetchTasks()
    }

    const pendingTasks = tasks.filter(t => t.status !== 'completed')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    // 참여자는 본인에게 할당된 작업만 볼 수 있음
    const visiblePendingTasks = isOwner ? pendingTasks : pendingTasks.filter(t => t.assigned_to && myDancerIds.includes(t.assigned_to))
    const visibleCompletedTasks = isOwner ? completedTasks : completedTasks.filter(t => t.assigned_to && myDancerIds.includes(t.assigned_to))

    if (loading) return <div className="text-xs text-white/30 text-center py-3">로딩 중...</div>

    return (
        <div className="space-y-2">
            {/* 헤더 + 추가 버튼 */}
            {isOwner && (
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white/40 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5" /> 할일 ({visiblePendingTasks.length})
                    </h3>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="text-[11px] text-primary/70 hover:text-primary flex items-center gap-1">
                        {showAddForm ? '취소' : <><Plus className="w-3 h-3" /> 추가</>}
                    </button>
                </div>
            )}

            {/* 추가 폼 */}
            {showAddForm && (
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 space-y-2">
                    <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="할일 제목"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary"
                    />
                    <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="상세 설명 (선택)"
                        rows={2}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-sm text-white placeholder-white/25 focus:outline-none focus:border-primary resize-none"
                    />
                    <div className="flex gap-2">
                        <select
                            value={newTask.priority}
                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                            className="flex-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white focus:outline-none focus:border-primary">
                            <option value="low">낮음</option>
                            <option value="medium">보통</option>
                            <option value="high">높음</option>
                        </select>
                        <input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                            className="flex-1 px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <button
                        onClick={addTask}
                        disabled={!newTask.title.trim()}
                        className="w-full py-2 bg-primary text-black text-xs font-bold rounded hover:bg-primary/90 transition disabled:opacity-30">
                        추가
                    </button>
                </div>
            )}

            {/* 할일 목록 */}
            {visiblePendingTasks.length === 0 && !showAddForm ? (
                <p className="text-xs text-white/20 text-center py-3">할일이 없습니다</p>
            ) : (
                <div className="space-y-1.5">
                    {visiblePendingTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            isOwner={isOwner}
                            onToggle={() => toggleTaskStatus(task)}
                            onDelete={() => deleteTask(task.id)}
                        />
                    ))}
                </div>
            )}

            {/* 완료된 할일 토글 */}
            {visibleCompletedTasks.length > 0 && (
                <div className="pt-2 border-t border-neutral-800/50">
                    <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/50 transition">
                        {showCompleted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        완료됨 ({visibleCompletedTasks.length})
                    </button>
                    {showCompleted && (
                        <div className="space-y-1.5 mt-2 opacity-50">
                            {visibleCompletedTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    isOwner={isOwner}
                                    onToggle={() => toggleTaskStatus(task)}
                                    onDelete={() => deleteTask(task.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function TaskItem({ task, isOwner, onToggle, onDelete }: {
    task: ProjectTask
    isOwner: boolean
    onToggle: () => void
    onDelete: () => void
}) {
    const isCompleted = task.status === 'completed'
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted

    return (
        <div className={`bg-neutral-900/40 border border-neutral-800/40 rounded-lg p-2.5 ${isCompleted ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-2.5">
                <button onClick={onToggle} className="mt-0.5 shrink-0">
                    {isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                    ) : (
                        <Square className="w-4 h-4 text-white/30 hover:text-white/50" />
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCompleted ? 'line-through text-white/40' : 'text-white'}`}>
                        {task.title}
                    </p>
                    {task.description && (
                        <p className="text-xs text-white/30 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        {task.priority && (
                            <span className={PRIORITY_COLORS[task.priority]}>
                                {PRIORITY_LABELS[task.priority]}
                            </span>
                        )}
                        {task.due_date && (
                            <span className={`flex items-center gap-0.5 ${isOverdue ? 'text-red-400/70' : 'text-white/25'}`}>
                                {isOverdue && <AlertCircle className="w-2.5 h-2.5" />}
                                <Clock className="w-2.5 h-2.5" />
                                {task.due_date}
                            </span>
                        )}
                        {task.assigned_dancer && (
                            <span className="text-white/30">→ {task.assigned_dancer.stage_name}</span>
                        )}
                    </div>
                </div>
                {isOwner && (
                    <button onClick={onDelete} className="shrink-0 text-white/20 hover:text-red-400/70 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
