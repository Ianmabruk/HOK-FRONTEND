import { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { usersApi } from '../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [recipientMode, setRecipientMode] = useState('selected')
  const [sending, setSending] = useState(false)

  const customerUsers = useMemo(() => users.filter((user) => user.role !== 'admin'), [users])
  const allSelected = customerUsers.length > 0 && selectedUserIds.length === customerUsers.length

  useEffect(() => {
    usersApi.getAll().then((r) => setUsers(r.data || [])).catch(() => {})
  }, [])

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) => (
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    ))
  }

  const toggleAll = () => {
    setSelectedUserIds((prev) => (
      prev.length === customerUsers.length ? [] : customerUsers.map((user) => user.id)
    ))
  }

  const handleSendEmail = async (event) => {
    event.preventDefault()
    if (!subject.trim()) return toast.error('Enter an email subject')
    if (!message.trim()) return toast.error('Enter an email message')
    if (recipientMode === 'selected' && selectedUserIds.length === 0) {
      return toast.error('Select at least one user')
    }

    setSending(true)
    try {
      const payload = {
        recipient_mode: recipientMode,
        user_ids: recipientMode === 'selected' ? selectedUserIds : [],
        subject: subject.trim(),
        message: message.trim(),
      }
      const { data } = await usersApi.sendEmail(payload)
      toast.success(data.message || 'Emails queued successfully')
      setSubject('')
      setMessage('')
      if (recipientMode === 'selected') setSelectedUserIds([])
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">Users</h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col gap-2 mb-5">
          <h3 className="font-medium text-charcoal text-lg">Send Email to Users</h3>
          <p className="text-sm text-gray-500">
            Send an update through SendGrid to all customers or only the selected users below.
          </p>
        </div>

        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-charcoal">
              <input
                type="radio"
                name="recipient-mode"
                value="selected"
                checked={recipientMode === 'selected'}
                onChange={(e) => setRecipientMode(e.target.value)}
              />
              Selected users ({selectedUserIds.length})
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-charcoal">
              <input
                type="radio"
                name="recipient-mode"
                value="all"
                checked={recipientMode === 'all'}
                onChange={(e) => setRecipientMode(e.target.value)}
              />
              All customers ({customerUsers.length})
            </label>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input w-full"
              maxLength={120}
              placeholder="Store update, delivery notice, promotion..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input w-full min-h-[180px]"
              placeholder="Write the message you want customers to receive."
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {recipientMode === 'all'
                ? `This will queue emails for ${customerUsers.length} customer account(s).`
                : `This will queue emails for ${selectedUserIds.length} selected customer account(s).`}
            </p>
            <button type="submit" disabled={sending} className="btn-primary disabled:opacity-50">
              {sending ? 'Queueing emails...' : 'Send Email'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all customers"
                />
              </th>
              {['ID', 'Name', 'Email', 'Role', 'Joined'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {u.role !== 'admin' ? (
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                      aria-label={`Select ${u.name}`}
                    />
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{u.id}</td>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${u.role === 'admin' ? 'bg-terracotta/20 text-terracotta' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
