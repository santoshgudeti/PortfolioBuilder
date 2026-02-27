import { useState } from 'react'
import {
    Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, ArrowUpRight, Share2, Copy, Check, Twitter
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

function ShareModal({ url, name, onClose, color, rgb }: { url: string; name: string; onClose: () => void; color: string; rgb: string }) {
    const [copied, setCopied] = useState(false)
    const copyLink = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Share {name}'s CV</h3>
                <div className="flex gap-2 mb-4">
                    <input type="text" readOnly value={url} className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300" />
                    <button onClick={copyLink} className="p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg"><Copy className="w-5 h-5" /></button>
                </div>
                <button onClick={onClose} className="w-full text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white">Close</button>
            </div>
        </div>
    )
}

export default function CorporateTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)

    return (
        <div className={`min-h-screen font-sans ${mode === 'dark' ? 'dark bg-[#111] text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name || 'CV'} — Professional Resume</title>
                </Helmet>
            )}
            {showShare && !isPreview && <ShareModal url={publicUrl} name={pd.name} onClose={() => setShowShare(false)} color={color} rgb={rgb} />}

            <div className="max-w-6xl mx-auto md:p-8 md:flex gap-8">
                {/* Left Sidebar */}
                <aside className={`md:w-[320px] shrink-0 p-8 ${mode === 'dark' ? 'bg-[#1a1a1a] shadow-lg' : 'bg-white shadow-xl'} md:rounded-2xl`}>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6" style={{ background: color }}>
                        {initials}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{pd.name}</h1>
                    <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-8" style={{ color }}>{pd.title}</p>

                    <div className="space-y-4 text-sm">
                        {pd.email && <a href={`mailto:${pd.email}`} className="flex items-center gap-3 hover:text-gray-900 dark:hover:text-white"><Mail className="w-4 h-4 text-gray-400" /> {pd.email}</a>}
                        {pd.phone && <span className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /> {pd.phone}</span>}
                        {pd.location && <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /> {pd.location}</span>}
                        {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gray-900 dark:hover:text-white"><Linkedin className="w-4 h-4 text-gray-400" /> LinkedIn</a>}
                        {pd.website && <a href={pd.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-gray-900 dark:hover:text-white"><Globe className="w-4 h-4 text-gray-400" /> Website</a>}
                    </div>

                    {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                        <div className="mt-12">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Code2 className="w-3 h-3" /> Core Competencies</h2>
                            <div className="flex flex-wrap gap-2">
                                {pd.skills.map((skill: string, i: number) => (
                                    <span key={i} className={`px-2.5 py-1 text-xs font-medium rounded-full ${mode === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8 md:p-0 md:py-8 space-y-12">
                    {/* Summary */}
                    {(pd.summary || pd.tagline) && !hiddenSections.has('summary') && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Objective</h2>
                            {pd.tagline && <p className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-3">{pd.tagline}</p>}
                            <p className="leading-relaxed text-gray-700 dark:text-gray-400">{pd.summary}</p>
                        </section>
                    )}

                    {/* Experience */}
                    {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2"><Briefcase className="w-5 h-5" /> Professional Experience</h2>
                            <div className="space-y-8">
                                {pd.experience.map((exp: any, i: number) => (
                                    <div key={i} className="relative pl-6 border-l-2" style={{ borderColor: color }}>
                                        <div className="absolute top-0 -left-[5px] w-2 h-2 rounded-full bg-white" style={{ backgroundColor: color }} />
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{exp.role}</h3>
                                            <span className="text-sm font-medium text-gray-500">{exp.duration}</span>
                                        </div>
                                        <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">{exp.company}</h4>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {pd.education?.length > 0 && !hiddenSections.has('education') && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Education</h2>
                            <div className="space-y-6">
                                {pd.education.map((edu: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{edu.degree}</h3>
                                            <span className="text-sm text-gray-500">{edu.year}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{edu.institution}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* Nav button for share */}
            {!isPdf && !isPreview && (
                <button onClick={() => setShowShare(true)} className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 transition-transform hover:scale-105">
                    <Share2 className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}
