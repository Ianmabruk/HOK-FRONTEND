import { useState, useEffect, useRef } from 'react'
import { FiMessageCircle, FiX, FiSend, FiShoppingBag } from 'react-icons/fi'
import { io } from 'socket.io-client'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { productsApi } from '../../services/api'

let socket

export default function LiveChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [product, setProduct] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const { user, token } = useAuthStore()
  const location = useLocation()

  // Detect if we're on a product page and fetch its details
  useEffect(() => {
    const match = location.pathname.match(/^\/products\/(\d+)$/)
    if (match) {
      const pid = match[1]
      productsApi.getOne(pid).then((r) => setProduct(r.data)).catch(() => setProduct(null))
    } else {
      setProduct(null)
    }
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    socket = io({ path: '/socket.io', auth: { token } })
    socket.on('chat_message', (msg) => setMessages((prev) => [...prev, msg]))
    socket.on('chat_history', (history) => setMessages(history))
    setTimeout(() => inputRef.current?.focus(), 100)
    return () => socket?.disconnect()
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    const msg = {
      text: text.trim(),
      sender: user?.name || 'Guest',
      timestamp: new Date().toISOString(),
      // Attach product context to every message so admin always has it
      ...(product && messages.length === 0 ? {
        product_id: product.id,
        product_title: product.title,
        product_price: product.price,
        product_image: product.image_url,
      } : {}),
    }
    socket?.emit('user_message', msg)
    setMessages((prev) => [...prev, { ...msg, own: true }])
    setText('')
  }

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-5 sm:right-6 bg-charcoal dark:bg-gray-800 text-cream rounded-full flex items-center justify-center shadow-xl z-50 hover:bg-terracotta transition-colors"
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{ width: 52, height: 52 }}
      >
        {open ? <FiX size={20} /> : <FiMessageCircle size={20} />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
          style={{ height: 460, maxHeight: 'calc(100dvh - 100px)' }}
        >
          {/* Header */}
          <div className="bg-charcoal dark:bg-gray-800 text-cream px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-serif text-sm">HOK Design Support</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-gray-400 hover:text-cream p-1">
              <FiX size={16} />
            </button>
          </div>

          {/* Product context banner (when on a product page) */}
          {product && (
            <div className="shrink-0 border-b border-gray-100 dark:border-gray-800 bg-cream/60 dark:bg-gray-800/60 px-3 py-2 flex items-center gap-3">
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} className="w-10 h-10 object-cover rounded shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center shrink-0">
                  <FiShoppingBag size={14} className="text-gray-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-terracotta">Asking about</p>
                <p className="text-xs font-medium text-charcoal dark:text-gray-200 truncate">{product.title}</p>
                <p className="text-xs text-gray-400">${Number(product.price).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center mt-6">
                {product ? (
                  <>
                    <p className="text-xs text-gray-400">Ask us anything about</p>
                    <p className="text-xs font-medium text-charcoal dark:text-gray-300 mt-0.5">{product.title}</p>
                    <p className="text-xs text-gray-400 mt-2">We typically reply within minutes.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400">Hi! How can we help you today?</p>
                    <p className="text-xs text-gray-400 mt-1">We typically reply within minutes.</p>
                  </>
                )}
              </div>
            )}
            {messages.map((m, i) => {
              const isOwn = m.own || m.sender === (user?.name || 'Guest')
              return (
                <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isOwn ? 'bg-charcoal dark:bg-gray-700 text-cream rounded-br-sm' : 'bg-gray-100 dark:bg-gray-800 text-charcoal dark:text-gray-200 rounded-bl-sm'}`}>
                    {/* Show product card on the first own message if product attached */}
                    {isOwn && i === 0 && m.product_title && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                        {m.product_image && (
                          <img src={m.product_image} alt="" className="w-8 h-8 object-cover rounded" />
                        )}
                        <div>
                          <p className="text-[10px] text-white/60">Product inquiry</p>
                          <p className="text-xs font-medium text-white/90 leading-tight">{m.product_title}</p>
                        </div>
                      </div>
                    )}
                    {m.text}
                    {m.timestamp && (
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/50' : 'text-gray-400'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-gray-800 flex items-center px-3 py-2 gap-2 bg-white dark:bg-gray-900 shrink-0">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={product ? `Ask about ${product.title}…` : 'Type a message…'}
              className="flex-1 text-sm outline-none bg-transparent text-charcoal dark:text-gray-200 placeholder-gray-400"
              style={{ minHeight: '36px' }}
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className="text-charcoal dark:text-gray-300 hover:text-terracotta transition-colors disabled:opacity-30 p-1"
              aria-label="Send message"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
