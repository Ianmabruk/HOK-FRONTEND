import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { siteSettingsApi } from '../services/api'

const CATEGORY_ROWS = [
  { slug: 'living-room', label: 'Living Room' },
  { slug: 'bedroom', label: 'Bedroom' },
  { slug: 'kitchen', label: 'Kitchen' },
  { slug: 'office', label: 'Office' },
  { slug: 'dining', label: 'Dining' },
  { slug: 'outdoor', label: 'Outdoor' },
]

const EMPTY = {
  hero: '',
  categories: {
    'living-room': '',
    bedroom: '',
    kitchen: '',
    office: '',
    dining: '',
    outdoor: '',
  },
}

export default function LandingImages() {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    siteSettingsApi.getLandingImages()
      .then(({ data }) => {
        setForm({
          hero: data?.hero || '',
          categories: {
            ...EMPTY.categories,
            ...(data?.categories || {}),
          },
        })
      })
      .catch((error) => {
        toast.error(error?.userMessage || 'Failed to load landing images')
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        hero: form.hero.trim(),
        categories: Object.fromEntries(
          Object.entries(form.categories).map(([slug, url]) => [slug, String(url || '').trim()])
        ),
      }
      const { data } = await siteSettingsApi.updateLandingImages(payload)
      setForm({
        hero: data?.hero || '',
        categories: {
          ...EMPTY.categories,
          ...(data?.categories || {}),
        },
      })
      toast.success('Landing images updated')
    } catch (error) {
      toast.error(error?.userMessage || 'Failed to save landing images')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading landing images...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal dark:text-gray-100">Landing Images</h2>
        <p className="text-sm text-gray-400 mt-1">Edit hero and tab images shown on the home page.</p>
      </div>

      <form onSubmit={save} className="space-y-5 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-5">
          <label className="text-xs uppercase tracking-widest text-gray-500 block mb-2">Hero Image URL</label>
          <input
            type="url"
            value={form.hero}
            onChange={(e) => setForm((prev) => ({ ...prev, hero: e.target.value }))}
            className="w-full border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm outline-none focus:border-charcoal dark:bg-gray-800"
            placeholder="https://..."
            required
          />
          {form.hero && (
            <img src={form.hero} alt="Hero preview" className="mt-3 w-full max-h-56 object-cover rounded" />
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-5">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Category Tab Images</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORY_ROWS.map((row) => (
              <div key={row.slug}>
                <label className="text-xs uppercase tracking-widest text-gray-500 block mb-2">{row.label}</label>
                <input
                  type="url"
                  value={form.categories[row.slug] || ''}
                  onChange={(e) => setForm((prev) => ({
                    ...prev,
                    categories: {
                      ...prev.categories,
                      [row.slug]: e.target.value,
                    },
                  }))}
                  className="w-full border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm outline-none focus:border-charcoal dark:bg-gray-800"
                  placeholder="https://..."
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Landing Images'}
        </button>
      </form>
    </div>
  )
}
