import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiVideo } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { beforeAfterApi } from '../services/api'

const EMPTY = {
  title: '', description: '', room_type: '', style: '',
  before_video_url: '', after_video_url: '',
  before_poster_url: '', after_poster_url: '', sort_order: 0,
}

export default function AdminBeforeAfter() {
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    beforeAfterApi.getAll().then((r) => setProjects(r.data || [])).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (p) => {
    setForm({
      title: p.title || '', description: p.description || '',
      room_type: p.room_type || '', style: p.style || '',
      before_video_url: p.before_video_url || '', after_video_url: p.after_video_url || '',
      before_poster_url: p.before_poster_url || '', after_poster_url: p.after_poster_url || '',
      sort_order: p.sort_order ?? 0,
    })
    setEditing(p.id)
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setLoading(true)
    try {
      if (editing) {
        await beforeAfterApi.update(editing, form)
        toast.success('Project updated')
      } else {
        await beforeAfterApi.create(form)
        toast.success('Project created')
      }
      setModal(false)
      load()
    } catch (err) {
      toast.error(err.userMessage || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this before-after project?')) return
    try {
      await beforeAfterApi.delete(id)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const field = (label, key, type = 'text', hint = '') => (
    <div key={key}>
      <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          rows={3}
          className="input w-full"
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="input w-full"
        />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal dark:text-gray-100">Before &amp; After Projects</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage video transformation projects shown on the landing page.</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <FiPlus size={15} /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiVideo size={36} className="mx-auto mb-3 opacity-40" />
          <p>No before-after projects yet.</p>
          <button onClick={openNew} className="btn-outline mt-4 inline-flex">Add your first project</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
              {p.after_video_url ? (
                <video
                  src={p.after_video_url}
                  poster={p.after_poster_url || undefined}
                  className="w-full aspect-video object-cover"
                  muted autoPlay loop playsInline
                />
              ) : p.after_poster_url ? (
                <img src={p.after_poster_url} alt={p.title} className="w-full aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FiVideo size={32} className="text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-charcoal dark:text-gray-100 text-sm">{p.title}</p>
                    {(p.room_type || p.style) && (
                      <p className="text-xs text-gray-400 mt-0.5">{[p.room_type, p.style].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-charcoal dark:hover:text-gray-100">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>
                {p.description && (
                  <p className="text-xs text-gray-400 mt-2 leading-5 line-clamp-2">{p.description}</p>
                )}
                <div className="mt-3 flex gap-3 text-[10px] uppercase tracking-widest">
                  <span className={`px-2 py-0.5 rounded-full ${p.before_video_url ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    Before {p.before_video_url ? '✓' : '–'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${p.after_video_url ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    After {p.after_video_url ? '✓' : '–'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h3 className="font-semibold text-charcoal dark:text-gray-100">
                {editing ? 'Edit Project' : 'New Before & After Project'}
              </h3>
              <button onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {field('Title *', 'title')}
              {field('Description', 'description', 'textarea')}
              <div className="grid grid-cols-2 gap-4">
                {field('Room Type', 'room_type', 'text', 'e.g. Living Room')}
                {field('Style', 'style', 'text', 'e.g. Luxury, Modern')}
              </div>
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Video URLs</p>
                {field('Before Video URL', 'before_video_url', 'url', 'Direct .mp4 or CDN video link')}
                {field('After Video URL', 'after_video_url', 'url', 'Direct .mp4 or CDN video link')}
              </div>
              <div className="border-t dark:border-gray-700 pt-4">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Poster / Thumbnail URLs (optional)</p>
                {field('Before Poster URL', 'before_poster_url', 'url')}
                {field('After Poster URL', 'after_poster_url', 'url')}
              </div>
              {field('Sort Order', 'sort_order', 'number', 'Lower numbers appear first')}
              <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
                <button type="button" onClick={() => setModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Saving…' : editing ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
