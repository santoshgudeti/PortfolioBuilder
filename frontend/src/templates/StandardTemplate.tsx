import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User, ArrowUpRight,
    Share2, Copy, Check, Twitter, Eye, Send, Menu, X
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) {
        return '99, 102, 241' // fallback: brand-500 indigo
    }
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241'
    return `${r}, ${g}, ${b}`
}

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
                className="relative w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 bg-gray-900 p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Share Portfolio</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">Share {name}'s portfolio with the world</p>

                {/* Copy link */}
                <div className="flex gap-2 mb-5">
                    <div className="flex-1 px-3 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {url}
                    </div>
                    <button
                        onClick={copyLink}
                        className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-900 dark:text-white transition-all flex items-center gap-2"
                        style={{ backgroundColor: `rgba(${rgb},0.8)` }}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                {/* Social share */}
                <div className="space-y-2">
                    {shareLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:bg-white/10 hover:text-gray-900 dark:text-white transition-all text-sm font-medium"
                        >
                            {link.icon}
                            Share on {link.label}
                            <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
                        </a>
                    ))}
                </div>

                <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 transition-colors">
                    Close
                </button>
            </div>
        </div>
    )
}

export default function StandardTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)
    const [mobileNav, setMobileNav] = useState(false)

    const navItems = [
        { label: 'About', id: 'about', show: !!pd.summary && !hiddenSections.has('summary') },
        { label: 'Skills', id: 'skills', show: pd.skills?.length > 0 && !hiddenSections.has('skills') },
        { label: 'Projects', id: 'projects', show: pd.projects?.length > 0 && !hiddenSections.has('projects') },
        { label: 'Experience', id: 'experience', show: pd.experience?.length > 0 && !hiddenSections.has('experience') },
        { label: 'Education', id: 'education', show: pd.education?.length > 0 && !hiddenSections.has('education') },
        { label: 'Contact', id: 'contact', show: !!pd.email },
    ].filter(n => n.show)

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Opens mailto with the form data
        const subject = encodeURIComponent(`Portfolio inquiry from ${contactForm.name}`)
        const body = encodeURIComponent(`Hi ${pd.name},\n\n${contactForm.message}\n\nBest regards,\n${contactForm.name}\n${contactForm.email}`)
        window.open(`mailto:${pd.email}?subject=${subject}&body=${body}`)
        setContactSent(true)
        toast.success('Opening your email client...')
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${mode === 'dark' ? 'dark bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />

                    {/* OpenGraph */}
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content={publicUrl} />
                    <meta property="og:title" content={`${pd.name} — Portfolio`} />
                    <meta property="og:description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />
                    <meta property="og:image" content={`https://og.tailgraph.com/og?fontFamily=Inter&title=${encodeURIComponent(pd.name)}&titleTailwind=text-gray-900+font-bold+text-6xl&text=${encodeURIComponent(pd.title || 'Professional Portfolio')}&textTailwind=text-gray-700+text-2xl+mt-4&logoTailwind=h-8&bgUrl=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1557683316-973673baf926%3Fq%3D80%26w%3D1200%26auto%3Dformat%26fit%3Dcrop&pattern=diagonalLines&patternOpacity=0.1`} />

                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:url" content={publicUrl} />
                    <meta name="twitter:title" content={`${pd.name} — Portfolio`} />
                    <meta name="twitter:description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />
                    <meta name="twitter:image" content={`https://og.tailgraph.com/og?fontFamily=Inter&title=${encodeURIComponent(pd.name)}&titleTailwind=text-gray-900+font-bold+text-6xl&text=${encodeURIComponent(pd.title || 'Professional Portfolio')}&textTailwind=text-gray-700+text-2xl+mt-4&logoTailwind=h-8&bgUrl=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1557683316-973673baf926%3Fq%3D80%26w%3D1200%26auto%3Dformat%26fit%3Dcrop&pattern=diagonalLines&patternOpacity=0.1`} />
                </Helmet>
            )}

            {/* Share Modal */}
            {showShare && !isPreview && <ShareModal url={publicUrl} name={pd.name} onClose={() => setShowShare(false)} color={color} rgb={rgb} />}

            {/* Sticky Nav */}
            {!isPdf && !isPreview && (
                <nav className="sticky top-0 z-40 backdrop-blur-xl border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-gray-950/80">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                        <span className="font-bold text-sm" style={{ color }}>{pd.name}</span>
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`}
                                    className="px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all">
                                    {item.label}
                                </a>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {data.view_count > 0 && (
                                <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5">
                                    <Eye className="w-3 h-3" />{data.view_count} views
                                </span>
                            )}
                            <button onClick={() => setShowShare(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all">
                                <Share2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Share</span>
                            </button>
                            {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="hidden sm:block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                            {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="hidden sm:block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>}
                            {/* Mobile hamburger */}
                            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all">
                                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {/* Mobile nav dropdown */}
                    {mobileNav && (
                        <div className="md:hidden border-t border-black/5 dark:border-white/5 px-4 py-3 space-y-1 bg-gray-50 dark:bg-gray-950/95 backdrop-blur-xl">
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`}
                                    onClick={() => setMobileNav(false)}
                                    className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all">
                                    {item.label}
                                </a>
                            ))}
                            <div className="flex items-center gap-3 px-3 pt-2 border-t border-black/5 dark:border-white/5 mt-2">
                                {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"><Github className="w-4 h-4" /></a>}
                                {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"><Linkedin className="w-4 h-4" /></a>}
                            </div>
                        </div>
                    )}
                </nav>
            )}

            {/* Hero */}
            <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
                        style={{ background: `radial-gradient(circle, rgba(${rgb},0.8) 0%, transparent 70%)` }} />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
                        style={{ background: `radial-gradient(circle, rgba(${rgb},0.6) 0%, transparent 70%)` }} />
                </div>
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="relative inline-block mb-6 sm:mb-8">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl flex items-center justify-center text-gray-900 dark:text-white text-2xl sm:text-4xl font-black mx-auto shadow-2xl"
                            style={{ background: `linear-gradient(135deg, rgba(${rgb},1), rgba(${rgb},0.6))`, boxShadow: `0 0 60px rgba(${rgb},0.4)` }}>
                            {initials}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-gray-950 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-3">
                        <span className="text-gray-900 dark:text-white">{pd.name?.split(' ')[0]} </span>
                        <span style={{ color }}>{pd.name?.split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium mb-4">{pd.title}</p>
                    {pd.tagline && <p className="text-base text-gray-500 dark:text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">{pd.tagline}</p>}

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {pd.email && (
                            <a href={`mailto:${pd.email}`} className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:bg-white/10 hover:text-gray-900 dark:text-white transition-all">
                                <Mail className="w-3.5 h-3.5" />{pd.email}
                            </a>
                        )}
                        {pd.phone && <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300"><Phone className="w-3.5 h-3.5" />{pd.phone}</span>}
                        {pd.location && <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300"><MapPin className="w-3.5 h-3.5" />{pd.location}</span>}
                        {pd.github && (
                            <a href={pd.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:bg-white/10 hover:text-gray-900 dark:text-white transition-all">
                                <Github className="w-3.5 h-3.5" />GitHub <ArrowUpRight className="w-3 h-3" />
                            </a>
                        )}
                        {pd.linkedin && (
                            <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:bg-white/10 hover:text-gray-900 dark:text-white transition-all">
                                <Linkedin className="w-3.5 h-3.5" />LinkedIn <ArrowUpRight className="w-3 h-3" />
                            </a>
                        )}
                        {pd.website && (
                            <a href={pd.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-gray-900 dark:text-white transition-all"
                                style={{ backgroundColor: `rgba(${rgb},0.2)`, border: `1px solid rgba(${rgb},0.4)` }}>
                                <Globe className="w-3.5 h-3.5" />Website <ArrowUpRight className="w-3 h-3" />
                            </a>
                        )}
                        {/* Hire me CTA */}
                        {pd.email && !isPdf && (
                            <a href="#contact" className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-gray-900 dark:text-white transition-all shadow-lg"
                                style={{ backgroundColor: color, boxShadow: `0 0 20px rgba(${rgb},0.4)` }}>
                                <Send className="w-3.5 h-3.5" />Hire Me
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-14 sm:space-y-20">

                {/* About */}
                {pd.summary && !hiddenSections.has('summary') && (
                    <section id="about">
                        <SectionHeader icon={<User className="w-4 h-4" />} title="About" color={color} rgb={rgb} />
                        <div className="mt-6 p-8 rounded-2xl border border-black/5 dark:border-white/5 bg-white/[0.02]">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{pd.summary}</p>
                        </div>
                    </section>
                )}

                {/* Skills */}
                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section id="skills">
                        <SectionHeader icon={<Code2 className="w-4 h-4" />} title="Skills" color={color} rgb={rgb} />
                        <div className="mt-6 flex flex-wrap gap-2.5">
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:scale-105 cursor-default"
                                    style={{
                                        backgroundColor: i % 3 === 0 ? `rgba(${rgb},0.15)` : i % 3 === 1 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                                        borderColor: i % 3 === 0 ? `rgba(${rgb},0.4)` : 'rgba(255,255,255,0.08)',
                                        color: i % 3 === 0 ? color : '#d1d5db',
                                    }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section id="projects">
                        <SectionHeader icon={<Code2 className="w-4 h-4" />} title="Projects" color={color} rgb={rgb} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="group relative p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-black/10 dark:border-white/10 transition-all duration-300 overflow-hidden">
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                                        style={{ background: `radial-gradient(circle at 50% 0%, rgba(${rgb},0.08) 0%, transparent 60%)` }} />
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                                                style={{ backgroundColor: `rgba(${rgb},0.15)`, color }}>
                                                {proj.title?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex gap-2">
                                                {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all"><Github className="w-3.5 h-3.5" /></a>}
                                                {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all"><ExternalLink className="w-3.5 h-3.5" /></a>}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{proj.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{proj.description}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {proj.tech?.map((t: string, j: number) => (
                                                <span key={j} className="text-xs px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-black/5 dark:border-white/5">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section id="experience">
                        <SectionHeader icon={<Briefcase className="w-4 h-4" />} title="Experience" color={color} rgb={rgb} />
                        <div className="mt-6 space-y-4">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="relative p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-bold"
                                            style={{ backgroundColor: `rgba(${rgb},0.12)`, color }}>
                                            {exp.company?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{exp.role}</h3>
                                                <span className="text-xs text-gray-500 dark:text-gray-500 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 w-fit">{exp.duration}</span>
                                            </div>
                                            <p className="text-sm font-semibold mb-3" style={{ color }}>{exp.company}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{exp.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {pd.education?.length > 0 && !hiddenSections.has('education') && (
                    <section id="education">
                        <SectionHeader icon={<GraduationCap className="w-4 h-4" />} title="Education" color={color} rgb={rgb} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `rgba(${rgb},0.12)` }}>
                                        <GraduationCap className="w-5 h-5" style={{ color }} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{edu.degree}</h3>
                                    <p className="text-sm font-medium mb-1" style={{ color }}>{edu.institution}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact */}
                {pd.email && !isPdf && (
                    <section id="contact">
                        <SectionHeader icon={<Mail className="w-4 h-4" />} title="Get In Touch" color={color} rgb={rgb} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Contact info */}
                            <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/[0.02] space-y-4">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    I'm always open to new opportunities and collaborations. Feel free to reach out!
                                </p>
                                <div className="space-y-3">
                                    {pd.email && (
                                        <a href={`mailto:${pd.email}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `rgba(${rgb},0.15)` }}>
                                                <Mail className="w-4 h-4" style={{ color }} />
                                            </div>
                                            {pd.email}
                                        </a>
                                    )}
                                    {pd.linkedin && (
                                        <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `rgba(${rgb},0.15)` }}>
                                                <Linkedin className="w-4 h-4" style={{ color }} />
                                            </div>
                                            LinkedIn Profile
                                        </a>
                                    )}
                                    {pd.github && (
                                        <a href={pd.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `rgba(${rgb},0.15)` }}>
                                                <Github className="w-4 h-4" style={{ color }} />
                                            </div>
                                            GitHub Profile
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Contact form */}
                            <div className="p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/[0.02]">
                                {contactSent ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-4">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `rgba(${rgb},0.15)` }}>
                                            <Check className="w-7 h-7" style={{ color }} />
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-semibold mb-1">Email client opened!</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your message is ready to send.</p>
                                        <button onClick={() => setContactSent(false)} className="mt-4 text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:text-gray-300 transition-colors">Send another</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleContactSubmit} className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Your name"
                                            value={contactForm.name}
                                            onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Your email"
                                            value={contactForm.email}
                                            onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/20 transition-colors"
                                        />
                                        <textarea
                                            placeholder="Your message..."
                                            value={contactForm.message}
                                            onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                                            required
                                            rows={4}
                                            className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:outline-none focus:border-white/20 transition-colors resize-none"
                                        />
                                        <button type="submit"
                                            className="w-full py-2.5 rounded-xl text-sm font-bold text-gray-900 dark:text-white transition-all flex items-center justify-center gap-2"
                                            style={{ backgroundColor: color, boxShadow: `0 0 20px rgba(${rgb},0.3)` }}>
                                            <Send className="w-4 h-4" />Send Message
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-black/5 dark:border-white/5 py-8 text-center">
                <p className="text-xs text-gray-600">
                    Built with{' '}
                    <a href="/" className="hover:underline transition-colors" style={{ color }}>Resume2Portfolio AI</a>
                </p>
            </footer>
        </div>
    )
}

function SectionHeader({ icon, title, color, rgb }: { icon: React.ReactNode; title: string; color: string; rgb: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `rgba(${rgb},0.15)`, color }}>
                {icon}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h2>
            <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
        </div>
    )
}
