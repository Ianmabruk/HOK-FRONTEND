import { useState, useEffect } from 'react'
import { vendorsApi } from '../services/api'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

const EMPTY = { name: '', contact: '', email: '', address: '' }

export default function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => vendorsApi.getAll().then((r) => setVendors(r.data || [])).catch(() => {})
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (v) => { setForm({ ...v }); setEditing(v.id); setModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      editing ? await vendorsApi.update(editing, form) : await vendorsApi.create(form)
      toast.success(editing ? 'Vendor updated' : 'Vendor created')
      setModal(false)
      load()
    } catch { toast.error('Failed to save vendor') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this vendor?')) return
    try { await vendorsApi.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl">Vendors</h2>
        <button onClick={openNew} className="flex items-center gap-2 bg-charcoal text-cream px-4 py-2 text-xs uppercase tracking-widest hover:bg-light-charcoal transition-colors">
          <FiPlus /> Add Vendor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {['Name', 'Contact', 'Email', 'Address', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{v.name}</td>
                <td className="px-4 py-3 text-gray-500">{v.contact}</td>
                <td className="px-4 py-3 text-gray-500">{v.email}</td>
                <td className="px-4 py-3 text-gray-500">{v.address}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-charcoal"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-500"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No vendors yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl">{editing ? 'Edit Vendor' : 'New Vendor'}</h3>
              <button onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Name', field: 'name' },
                { label: 'Contact / Phone', field: 'contact' },
                { label: 'Email', field: 'email', type: 'email' },
                { label: 'Address', field: 'address' },
              ].map(({ label, field, type = 'text' }) => (
                <div key={field}>
                  <label className="text-xs uppercase tracking-widest text-gray-500 block mb-1">{label}</label>
                  <input
                    type={type} value={form[field]} required={field === 'name'}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-charcoal"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
