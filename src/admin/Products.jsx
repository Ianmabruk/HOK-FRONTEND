import { useState, useEffect } from 'react'
import { productsApi, vendorsApi } from '../services/api'
import { emitAdminDataChanged } from './adminEvents'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiVideo } from 'react-icons/fi'
import toast from 'react-hot-toast'

const EMPTY = { title: '', description: '', price: '', stock: '', category: '', image_url: '', video_url: '', vendor_id: '' }
const CATEGORIES = ['living-room', 'bedroom', 'kitchen', 'office', 'outdoor', 'dining']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    productsApi.getAll({}).then((r) => setProducts(r.data.products || [])).catch(() => {})
    vendorsApi.getAll().then((r) => setVendors(r.data || [])).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (p) => { setForm({ ...p }); setEditing(p.id); setModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        const { data } = await productsApi.update(editing, form)
        setProducts((prev) => prev.map((product) => product.id === editing ? data : product))
        toast.success('Product updated')
      } else {
        const { data } = await productsApi.create(form)
        setProducts((prev) => [data, ...prev])
        toast.success('Product created')
      }
      setModal(false)
      emitAdminDataChanged({ type: 'product-changed' })
    } catch {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productsApi.delete(id)
      setProducts((prev) => prev.filter((product) => product.id !== id))
      emitAdminDataChanged({ type: 'product-changed' })
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl">Products</h2>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-cream bg-charcoal px-4 py-2 text-xs uppercase tracking-widest">
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {['Image', 'Title', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img src={p.image_url || `https://placehold.co/80x80/f5f0e8/2c2c2c?text=P`} alt="" className="w-10 h-10 object-cover" />
                </td>
                <td className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1.5">
                    {p.title}
                    {p.video_url && <FiVideo size={13} className="text-terracotta flex-shrink-0" title="Has video" />}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 capitalize">{p.category?.replace('-', ' ')}</td>
                <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-charcoal"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-500"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-xl">{editing ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Title', field: 'title', type: 'text' },
                { label: 'Price', field: 'price', type: 'number' },
                { label: 'Stock', field: 'stock', type: 'number' },
                { label: 'Image URL', field: 'image_url', type: 'url' },
                { label: 'Video URL', field: 'video_url', type: 'url' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="text-xs uppercase tracking-widest text-gray-500 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-charcoal"
                    required={['title', 'price', 'stock'].includes(field)}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Vendor</label>
                <select value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none">
                  <option value="">No vendor</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-charcoal resize-none"
                />
              </div>
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
