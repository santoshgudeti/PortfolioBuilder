import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User, ArrowUpRight,
    Share2, Copy, Check, Twitter, Send
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

    const shareLinks = [
        {
            label: 'LinkedIn',
            icon: <Linkedin className="w-4 h-4" />,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        },
        {
            label: 'Twitter / X',
            icon: <Twitter className="w-4 h-4" />,
            href: `https://twitter.com/intent/tweet?text=Check out my portfolio!&url=${encodeURIComponent(url)}`,
        },
        {
            label: 'Email',
            icon: <Mail className="w-4 h-4" />,
            href: `mailto:?subject=Check out my portfolio&body=Hi! I wanted to share my portfolio with you: ${url}`,
        },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-sm rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Share Portfolio</h3>
                <p className="text-sm text-gray-500 mb-5">Share {name}'s portfolio with the world</p>

                <div className="flex gap-2 mb-5">
                    <div className="flex-1 px-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm text-gray-600 dark:text-gray-300 truncate">
                        {url}
                    </div>
                    <button
                        onClick={copyLink}
                        className="px-4 py-2.5 rounded-2xl font-semibold text-sm text-white transition-all flex items-center gap-2"
                        style={{ backgroundColor: `rgba(${rgb},0.8)` }}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                <div className="space-y-2">
                    {shareLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-medium"
                        >
                            {link.icon}
                            Share on {link.label}
                            <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
                        </a>
                    ))}
                </div>

                <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-2xl text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Close
                </button>
            </div>
        </div>
    )
}

export default function TechGridTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const subject = encodeURIComponent(`Portfolio inquiry from ${contactForm.name}`)
        const body = encodeURIComponent(`Hi ${pd.name},\n\n${contactForm.message}\n\nBest regards,\n${contactForm.name}\n${contactForm.email}`)
        window.open(`mailto:${pd.email}?subject=${subject}&body=${body}`)
        toast.success('Opening your email client...')
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${mode === 'dark' ? 'dark bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-900'}`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Tech Portfolio</title>
                </Helmet>
            )}

            {showShare && !isPreview && <ShareModal url={publicUrl} name={pd.name} onClose={() => setShowShare(false)} color={color} rgb={rgb} />}

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Header/Nav inside the grid implicitly */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
                            style={{ background: `linear-gradient(135deg, rgba(${rgb},1), rgba(${rgb},0.6))` }}>
                            {initials}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold dark:text-white">{pd.name}</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{pd.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowShare(true)} className="p-2 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* BENTO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 auto-rows-[minmax(180px,auto)]">

                    {/* Hero Bento Card - span 2 cols, 2 rows */}
                    <div className="md:col-span-2 md:row-span-2 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ backgroundImage: `linear-gradient(to bottom right, ${color}, transparent)` }} />
                        <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight tracking-tight dark:text-white">
                            Building things <br />
                            <span style={{ color }}>that matter.</span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                            {pd.tagline || pd.summary}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-auto">
                            {pd.email && (
                                <a href={`mailto:${pd.email}`} style={{ backgroundColor: color }} className="px-6 py-3 rounded-2xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:brightness-110 transition-all">
                                    <Send className="w-4 h-4" /> Hire Me
                                </a>
                            )}
                            {pd.github && (
                                <a href={pd.github} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                                    <Github className="w-4 h-4" /> GitHub
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Contact/Info Bento Card - span 1 col, 1 row */}
                    {(pd.location || pd.phone || pd.linkedin || pd.website) && (
                        <div className="md:col-span-1 rounded-3xl p-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm flex flex-col gap-4 justify-center">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Connect</h3>
                            {pd.location && <div className="flex gap-3 text-sm dark:text-gray-300 font-mono items-center"><MapPin className="w-4 h-4 text-gray-400" /> {pd.location}</div>}
                            {pd.phone && <div className="flex gap-3 text-sm dark:text-gray-300 font-mono items-center"><Phone className="w-4 h-4 text-gray-400" /> {pd.phone}</div>}
                            {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="flex gap-3 text-sm dark:text-gray-300 font-mono items-center hover:text-brand-500 transition-colors"><Linkedin className="w-4 h-4 text-gray-400" /> LinkedIn <ArrowUpRight className="w-3 h-3 ml-auto" /></a>}
                            {pd.website && <a href={pd.website} target="_blank" rel="noopener noreferrer" className="flex gap-3 text-sm dark:text-gray-300 font-mono items-center hover:text-brand-500 transition-colors"><Globe className="w-4 h-4 text-gray-400" /> Website <ArrowUpRight className="w-3 h-3 ml-auto" /></a>}
                        </div>
                    )}

                    {/* Experience Highlight Card (assuming one exists) */}
                    {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                        <div className="md:col-span-1 rounded-3xl p-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-between group cursor-default hover:border-gray-200 dark:hover:border-white/10 transition-all">
                            <Briefcase className="w-6 h-6 mb-4" style={{ color }} />
                            <div>
                                <h3 className="font-bold text-lg dark:text-white leading-tight mb-1">{pd.experience[0].role}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono font-medium">{pd.experience[0].company}</p>
                            </div>
                        </div>
                    )}

                    {/* Skills Bento Card - span 2 cols */}
                    {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                        <div className="md:col-span-2 rounded-3xl p-8 bg-black dark:bg-[#111] text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-700 via-transparent to-transparent pointer-events-none" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="flex items-center gap-2 mb-6 text-gray-400">
                                    <Code2 className="w-5 h-5" />
                                    <h3 className="text-sm font-bold uppercase tracking-wider">Tech Stack</h3>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {pd.skills.map((skill: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg text-sm font-mono bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education Card */}
                    {pd.education?.length > 0 && !hiddenSections.has('education') && (
                        <div className="md:col-span-2 rounded-3xl p-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                                <GraduationCap className="w-5 h-5" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Education</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {pd.education.map((edu: any, i: number) => (
                                    <div key={i}>
                                        <h4 className="font-bold dark:text-white text-sm">{edu.degree}</h4>
                                        <p className="text-xs text-gray-500 font-mono mt-1">{edu.institution} • {edu.year}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Bento Cards - map each project into a card */}
                    {pd.projects?.length > 0 && !hiddenSections.has('projects') && pd.projects.map((proj: any, i: number) => (
                        <div key={`proj-${i}`} className={`md:col-span-${i % 3 === 0 ? '2' : '1'} rounded-3xl p-6 border border-black/5 dark:border-white/5 shadow-sm flex flex-col relative group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${i % 2 === 0 ? 'bg-white dark:bg-white/5' : 'bg-gray-50 dark:bg-black'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold" style={{ backgroundColor: `rgba(${rgb},0.1)`, color }}>
                                    {proj.title?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex gap-2">
                                    {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><Github className="w-4 h-4 text-gray-700 dark:text-gray-300" /></a>}
                                    {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"><ExternalLink className="w-4 h-4 text-gray-700 dark:text-gray-300" /></a>}
                                </div>
                            </div>
                            <h3 className="font-bold text-lg dark:text-white mb-2">{proj.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1 line-clamp-3">{proj.description}</p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {proj.tech?.map((t: string, j: number) => (
                                    <span key={j} className="text-xs px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 text-gray-600 dark:text-gray-300 font-mono border border-black/5 dark:border-white/5">{t}</span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* All Experience List (If more than 1) */}
                    {pd.experience?.length > 1 && !hiddenSections.has('experience') && (
                        <div className="md:col-span-2 rounded-3xl p-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-sm overflow-y-auto max-h-[400px]">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Career Path</h3>
                            <div className="space-y-6">
                                {pd.experience.slice(1).map((exp: any, i: number) => (
                                    <div key={i} className="relative pl-6 border-l-2" style={{ borderColor: `rgba(${rgb},0.3)` }}>
                                        <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full border-4 border-gray-100 dark:border-gray-900 bg-white" style={{ borderColor: color }} />
                                        <h4 className="font-bold dark:text-white">{exp.role}</h4>
                                        <p className="text-sm text-gray-500 font-mono mb-2">{exp.company} • {exp.duration}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-12 text-center pb-8">
                    <p className="text-sm text-gray-500">Built with ❤️ and React</p>
                </div>
            </div>
        </div>
    )
}
