import { useState, useEffect } from 'react'
import { usersApi } from '../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    usersApi.getAll().then((r) => setUsers(r.data || [])).catch(() => {})
  }, [])

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">Users</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="border-b bg-gray-50">
            <tr>
              {['ID', 'Name', 'Email', 'Role', 'Joined'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
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
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
