import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { FiSend, FiMessageCircle, FiShoppingBag } from 'react-icons/fi'

let socket

function ProductCard({ product_id, product_title, product_price, product_image }) {
  if (!product_title) return null
  return (
    <div className="flex items-center gap-3 bg-cream dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mb-3">
      {product_image ? (
        <img src={product_image} alt={product_title} className="w-12 h-12 object-cover rounded shrink-0" />
      ) : (
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
          <FiShoppingBag size={16} className="text-gray-400" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-terracotta font-medium">Product Inquiry</p>
        <p className="text-sm font-serif text-charcoal dark:text-gray-200 truncate">{product_title}</p>
        {product_price && <p className="text-xs text-gray-400">${Number(product_price).toFixed(2)}</p>}
      </div>
    </div>
  )
}

export default function AdminChats() {
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const { token } = useAuthStore()

  useEffect(() => {
    socket = io({ path: '/socket.io', auth: { token } })
    socket.on('admin_conversations', (data) => setConversations(data))
    socket.on('admin_room_messages', (msgs) => setMessages(msgs))
    socket.on('new_user_message', (msg) => {
      // Update conversation list unread indicator
      setConversations((prev) => prev.map((c) =>
        c.user_id === msg.user_id ? { ...c, last_message: msg.text, unread: active?.user_id !== c.user_id } : c
      ))
      if (active && msg.user_id === active.user_id) {
        setMessages((prev) => [...prev, msg])
      }
    })
    socket.emit('admin_get_conversations')
    // Refresh conversation list every 20s
    const interval = setInterval(() => socket?.emit('admin_get_conversations'), 20_000)
    return () => { socket?.disconnect(); clearInterval(interval) }
  }, [active])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConversation = useCallback((conv) => {
    setActive(conv)
    setConversations((prev) => prev.map((c) => c.user_id === conv.user_id ? { ...c, unread: false } : c))
    socket?.emit('admin_get_room', { user_id: conv.user_id })
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const send = useCallback(() => {
    if (!text.trim() || !active || sending) return
    const msgText = text.trim()
    // Optimistic update
    setSending(true)
    setText('')
    setMessages((prev) => [...prev, { text: msgText, sender: 'Admin', own: true, timestamp: new Date().toISOString() }])
    socket?.emit('admin_reply', { user_id: active.user_id, text: msgText })
    setTimeout(() => setSending(false), 300)
  }, [text, active, sending])

  const totalUnread = conversations.filter((c) => c.unread).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-serif text-2xl text-charcoal dark:text-gray-100">Live Chats</h2>
        {totalUnread > 0 && (
          <span className="bg-terracotta text-white text-xs font-medium px-2 py-0.5 rounded-full">{totalUnread} new</span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex overflow-hidden" style={{ height: 560 }}>
        {/* Conversations sidebar */}
        <div className="w-52 sm:w-64 border-r border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs uppercase tracking-widest text-gray-400">{conversations.length} conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <FiMessageCircle size={28} />
                <p className="text-xs text-center px-4">No conversations yet.</p>
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.user_id}
                onClick={() => selectConversation(c)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${active?.user_id === c.user_id ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-medium text-charcoal dark:text-gray-200 truncate">{c.user_name || `User #${c.user_id}`}</p>
                  {c.unread && <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{c.last_message}</p>
                {c.product_title && (
                  <p className="text-[10px] text-terracotta mt-1 truncate flex items-center gap-1">
                    <FiShoppingBag size={10} /> {c.product_title}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex-1 flex flex-col min-w-0">
          {!active ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-3">
              <FiMessageCircle size={36} />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                <p className="font-medium text-sm text-charcoal dark:text-gray-200">{active.user_name || `User #${active.user_id}`}</p>
                {active.product_title && (
                  <p className="text-xs text-terracotta mt-0.5 flex items-center gap-1">
                    <FiShoppingBag size={11} /> Inquiring about: {active.product_title}
                  </p>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Product context card at top of conversation */}
                {active.product_title && (
                  <ProductCard
                    product_id={active.product_id}
                    product_title={active.product_title}
                    product_price={active.product_price}
                    product_image={active.product_image}
                  />
                )}
                {messages.map((m, i) => {
                  const isAdmin = m.own || m.sender === 'Admin'
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isAdmin ? 'bg-charcoal dark:bg-gray-700 text-cream rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-charcoal dark:text-gray-200 rounded-bl-sm'}`}>
                        {m.text}
                        {m.timestamp && (
                          <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/50' : 'text-gray-400'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 flex items-center px-3 py-2 gap-2 bg-white dark:bg-gray-900">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Type a reply..."
                  className="flex-1 text-sm outline-none bg-transparent text-charcoal dark:text-gray-200 placeholder-gray-400"
                  style={{ minHeight: '36px' }}
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || sending}
                  className="text-charcoal dark:text-gray-300 hover:text-terracotta transition-colors disabled:opacity-30 p-1"
                  aria-label="Send"
                >
                  <FiSend size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
