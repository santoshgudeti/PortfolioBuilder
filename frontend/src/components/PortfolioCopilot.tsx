import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'
import { portfolioApi } from '@/api/portfolio'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function PortfolioCopilot({ slug }: { slug: string }) {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Ask me anything about this person — their experience, skills, projects, or how to get in touch.' },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleSubmit = async () => {
        if (!input.trim() || loading) return
        const question = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: question }])
        setLoading(true)

        try {
            const res = await portfolioApi.askCopilot(slug, question)
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that right now.' }])
        } finally {
            setLoading(false)
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-500 text-white shadow-xl hover:bg-brand-600 transition-all hover:scale-105 flex items-center justify-center"
                aria-label="Ask about this person"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-500 text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-bold">Ask about this person</span>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                            msg.role === 'user'
                                ? 'bg-brand-500 text-white rounded-br-md'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-md'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-gray-100 dark:bg-white/10">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-white/10 p-3 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || loading}
                    className="p-2 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-all disabled:opacity-40"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
