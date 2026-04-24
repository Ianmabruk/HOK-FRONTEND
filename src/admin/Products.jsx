import { useState, useEffect } from 'react'
import { productsApi, vendorsApi } from '../services/api'
import { emitAdminDataChanged } from './adminEvents'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiVideo } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { fallbackImageFor, getPrimaryProductImage, parseImageList, serializeImageList } from '../utils/productMedia'

const EMPTY = { title: '', description: '', price: '', stock: '', category: '', image_url: '', video_url: '', vendor_id: '' }
const CATEGORIES = ['living-room', 'bedroom', 'kitchen', 'office', 'outdoor', 'dining']
const MAX_IMAGES = 6

function normalizeProductForm(form) {
  return {
    ...form,
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    image_url: typeof form.image_url === 'string' ? form.image_url.trim() : '',
    video_url: typeof form.video_url === 'string' ? form.video_url.trim() : '',
    price: Number(form.price),
    stock: Number(form.stock),
    vendor_id: form.vendor_id ? Number(form.vendor_id) : '',
  }
}

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
  const openEdit = (p) => { setForm({ ...EMPTY, ...p, vendor_id: p.vendor_id || '' }); setEditing(p.id); setModal(true) }

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    event.target.value = ''
    if (files.length === 0) return

    if (files.some((file) => !file.type.startsWith('image/'))) {
      toast.error('Only image files are allowed')
      return
    }

    try {
      const uploadedImages = []
      for (const file of files) {
        const formData = new FormData()
        formData.append('type', 'image')
        formData.append('file', file)
        const { data } = await productsApi.uploadMedia(formData)
        uploadedImages.push(data.url)
      }

      setForm((prev) => {
        const nextImages = [...parseImageList(prev.image_url), ...uploadedImages].slice(0, MAX_IMAGES)
        if (nextImages.length < parseImageList(prev.image_url).length + uploadedImages.length) {
          toast('Only the first 6 images were kept', { icon: '📷' })
        }
        return { ...prev, image_url: serializeImageList(nextImages) }
      })
      toast.success('Images uploaded')
    } catch (error) {
      toast.error(error?.userMessage || error?.response?.data?.message || 'Failed to upload images')
    }
  }

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('Only video files are allowed')
      return
    }

    try {
      const formData = new FormData()
      formData.append('type', 'video')
      formData.append('file', file)
      const { data } = await productsApi.uploadMedia(formData)
      setForm((prev) => ({ ...prev, video_url: data.url }))
      toast.success('Video uploaded')
    } catch (error) {
      toast.error(error?.userMessage || error?.response?.data?.message || 'Failed to upload video')
    }
  }

  const removeImageAt = (index) => {
    setForm((prev) => ({
      ...prev,
      image_url: serializeImageList(parseImageList(prev.image_url).filter((_, imageIndex) => imageIndex !== index)),
    }))
  }

  const clearVideo = () => {
    setForm((prev) => ({ ...prev, video_url: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = normalizeProductForm(form)
    try {
      if (editing) {
        const { data } = await productsApi.update(editing, payload)
        setProducts((prev) => prev.map((product) => product.id === editing ? data : product))
        toast.success('Product updated')
      } else {
        const { data } = await productsApi.create(payload)
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
                  <img
                    src={getPrimaryProductImage(p)}
                    alt=""
                    className="w-10 h-10 object-cover"
                    onError={(e) => { e.currentTarget.src = fallbackImageFor(p.title) }}
                  />
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
                <label className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Product Images</label>
                <label className="flex items-center justify-center w-full border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 cursor-pointer hover:border-charcoal hover:text-charcoal transition-colors rounded">
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} />
                  Upload up to 6 images
                </label>
                <p className="text-[11px] text-gray-400 mt-2">Images are uploaded to backend storage and linked to the product automatically.</p>
                {parseImageList(form.image_url).length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {parseImageList(form.image_url).map((image, index) => (
                      <div key={`${index}-${image.slice(0, 24)}`} className="relative rounded overflow-hidden bg-gray-100 aspect-square">
                        <img src={image} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageAt(index)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                          aria-label="Remove image"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Product Video</label>
                <label className="flex items-center justify-center w-full border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 cursor-pointer hover:border-charcoal hover:text-charcoal transition-colors rounded">
                  <input type="file" accept="video/*" className="sr-only" onChange={handleVideoUpload} />
                  Upload a product video
                </label>
                <p className="text-[11px] text-gray-400 mt-2">Videos are uploaded to backend storage and linked automatically. MP4 works best.</p>
                {form.video_url && (
                  <div className="mt-3 space-y-2">
                    <video src={form.video_url} controls className="w-full rounded bg-black max-h-56" />
                    <button type="button" onClick={clearVideo} className="text-xs uppercase tracking-widest text-red-500 hover:text-red-600">
                      Remove video
                    </button>
                  </div>
                )}
              </div>
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
