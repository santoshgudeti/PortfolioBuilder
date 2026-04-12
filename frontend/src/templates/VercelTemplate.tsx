import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User, ArrowUpRight,
    Share2, Copy, Check, Twitter, Eye, Send, Menu, X
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

/* ── Vercel Design System ─────────────────────────────────────────────
   Monochrome precision · Shadow-as-border · Geist-like compressed type
   Canvas: #ffffff · Text: #171717 · Border: shadow 0 0 0 1px rgba(0,0,0,0.08)
───────────────────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) return '99, 102, 241'
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241'
    return `${r}, ${g}, ${b}`
}

const SHADOW_BORDER = '0 0 0 1px rgba(0,0,0,0.08)'
const SHADOW_CARD = '0 0 0 1px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.04), 0 8px 8px -8px rgba(0,0,0,0.04)'
const SHADOW_CARD_DARK = '0 0 0 1px rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.3)'

export default function VercelTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)
    const [mobileNav, setMobileNav] = useState(false)
    const [copied, setCopied] = useState(false)

    const isDark = mode === 'dark'
    const bg = isDark ? '#0a0a0a' : '#ffffff'
    const text = isDark ? '#ededed' : '#171717'
    const sub = isDark ? '#888888' : '#666666'
    const muted = isDark ? '#555555' : '#999999'
    const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
    const cardShadow = isDark ? SHADOW_CARD_DARK : SHADOW_CARD
    const surfaceBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'

    const navItems = [
        { label: 'About', id: 'about', show: !!pd.summary && !hiddenSections.has('summary') },
        { label: 'Skills', id: 'skills', show: pd.skills?.length > 0 && !hiddenSections.has('skills') },
        { label: 'Projects', id: 'projects', show: pd.projects?.length > 0 && !hiddenSections.has('projects') },
        { label: 'Experience', id: 'experience', show: pd.experience?.length > 0 && !hiddenSections.has('experience') },
        { label: 'Education', id: 'education', show: pd.education?.length > 0 && !hiddenSections.has('education') },
        { label: 'Contact', id: 'contact', show: !!pd.email },
    ].filter(n => n.show)

    const copyLink = () => {
        navigator.clipboard.writeText(publicUrl)
        setCopied(true)
        toast.success('Copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleContact = (e: React.FormEvent) => {
        e.preventDefault()
        const subject = encodeURIComponent(`Portfolio inquiry from ${contactForm.name}`)
        const body = encodeURIComponent(`Hi ${pd.name},\n\n${contactForm.message}\n\nBest,\n${contactForm.name}\n${contactForm.email}`)
        window.open(`mailto:${pd.email}?subject=${subject}&body=${body}`)
        setContactSent(true)
        toast.success('Opening email client…')
    }

    return (
        <div style={{ background: bg, color: text, fontFamily: "'Inter', 'Geist', system-ui, -apple-system, sans-serif" }} className="min-h-screen transition-colors">
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s portfolio`} />
                </Helmet>
            )}

            {/* Share Overlay */}
            {showShare && !isPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-sm p-6 rounded-lg" style={{ background: bg, boxShadow: cardShadow }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: text, letterSpacing: '-0.96px' }} className="text-lg font-semibold mb-4">Share Portfolio</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 px-3 py-2 rounded-md text-sm truncate" style={{ boxShadow: `0 0 0 1px ${border}`, color: sub }}>{publicUrl}</div>
                            <button onClick={copyLink} className="px-3 py-2 rounded-md text-sm font-medium" style={{ background: text, color: bg }}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="space-y-2">
                            {[
                                { label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}` },
                                { label: 'Twitter / X', icon: <Twitter className="w-4 h-4" />, href: `https://twitter.com/intent/tweet?text=Check out my portfolio!&url=${encodeURIComponent(publicUrl)}` },
                            ].map(l => (
                                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors" style={{ boxShadow: `0 0 0 1px ${border}`, color: sub }}>
                                    {l.icon} Share on {l.label} <ArrowUpRight className="w-3 h-3 ml-auto" />
                                </a>
                            ))}
                        </div>
                        <button onClick={() => setShowShare(false)} className="mt-3 w-full py-2 text-sm" style={{ color: muted }}>Close</button>
                    </div>
                </div>
            )}

            {/* ── Nav ── */}
            {!isPdf && !isPreview && (
                <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ borderBottom: `1px solid ${border}`, background: isDark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.8)' }}>
                    <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
                        <span className="font-semibold text-sm" style={{ color: text, letterSpacing: '-0.32px' }}>{pd.name}</span>
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} className="px-3 py-1.5 rounded-md text-sm transition-colors hover:opacity-80" style={{ color: sub, fontWeight: 500 }}>{item.label}</a>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {data.view_count > 0 && (
                                <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ color: muted, boxShadow: `0 0 0 1px ${border}` }}>
                                    <Eye className="w-3 h-3" /><span className="tabular-nums">{data.view_count}</span>
                                </span>
                            )}
                            <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors" style={{ color: sub }}><Share2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-1.5 rounded-md" style={{ color: sub }}>
                                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {mobileNav && (
                        <div className="md:hidden px-6 py-3 space-y-1" style={{ borderTop: `1px solid ${border}` }}>
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileNav(false)} className="block px-3 py-2.5 rounded-md text-sm" style={{ color: sub }}>{item.label}</a>
                            ))}
                        </div>
                    )}
                </nav>
            )}

            {/* ── Hero ── */}
            <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 px-6">
                <div className="max-w-[1200px] mx-auto text-center">
                    {/* Avatar */}
                    <div className="mb-8">
                        {data.avatar_url ? (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mx-auto" style={{ boxShadow: SHADOW_BORDER }}>
                                <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold mx-auto" style={{ background: isDark ? '#1a1a1a' : '#fafafa', color: text, boxShadow: SHADOW_BORDER }}>
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Headline — Vercel compressed style */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-4" style={{ color: text, letterSpacing: '-2.4px', lineHeight: 1.0 }}>
                        {pd.name}
                    </h1>
                    <p className="text-lg sm:text-xl mb-3" style={{ color: sub, fontWeight: 400, lineHeight: 1.6 }}>{pd.title}</p>
                    {pd.tagline && <p className="text-base max-w-xl mx-auto mb-10" style={{ color: muted, lineHeight: 1.8 }}>{pd.tagline}</p>}

                    {/* Contact pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {pd.email && <a href={`mailto:${pd.email}`} className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all hover:opacity-80" style={{ boxShadow: `0 0 0 1px ${border}`, color: sub }}><Mail className="w-3.5 h-3.5" />{pd.email}</a>}
                        {pd.location && <span className="flex items-center gap-2 px-4 py-2 rounded-md text-sm" style={{ boxShadow: `0 0 0 1px ${border}`, color: sub }}><MapPin className="w-3.5 h-3.5" />{pd.location}</span>}
                        {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:opacity-80 transition-all" style={{ boxShadow: `0 0 0 1px ${border}`, color: sub }}><Github className="w-3.5 h-3.5" />GitHub</a>}
                        {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm hover:opacity-80 transition-all" style={{ boxShadow: `0 0 0 1px ${border}`, color: sub }}><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
                        {pd.email && !isPdf && (
                            <a href="#contact" className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all" style={{ background: text, color: bg }}>
                                <Send className="w-3.5 h-3.5" />Hire Me
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <div className="max-w-[1200px] mx-auto px-6 pb-24 space-y-20">

                {/* About */}
                {pd.summary && !hiddenSections.has('summary') && (
                    <section id="about">
                        <SectionHead icon={<User className="w-4 h-4" />} title="About" color={text} border={border} />
                        <div className="mt-6 p-8 rounded-lg" style={{ boxShadow: cardShadow, background: surfaceBg }}>
                            <p className="text-base leading-relaxed" style={{ color: sub, lineHeight: 1.8 }}>{pd.summary}</p>
                        </div>
                    </section>
                )}

                {/* Skills */}
                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section id="skills">
                        <SectionHead icon={<Code2 className="w-4 h-4" />} title="Skills" color={text} border={border} />
                        <div className="mt-6 flex flex-wrap gap-2">
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 rounded-full text-sm font-medium transition-transform hover:scale-105 cursor-default" style={{ boxShadow: `0 0 0 1px ${border}`, color: i % 4 === 0 ? color : sub, background: i % 4 === 0 ? `rgba(${rgb},0.08)` : 'transparent' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section id="projects">
                        <SectionHead icon={<Code2 className="w-4 h-4" />} title="Projects" color={text} border={border} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="group p-6 rounded-lg transition-all hover:translate-y-[-2px]" style={{ boxShadow: cardShadow, background: surfaceBg }}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold" style={{ background: `rgba(${rgb},0.1)`, color }}>
                                            {proj.title?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex gap-2">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md flex items-center justify-center transition-colors" style={{ boxShadow: `0 0 0 1px ${border}`, color: muted }}><Github className="w-3.5 h-3.5" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md flex items-center justify-center transition-colors" style={{ boxShadow: `0 0 0 1px ${border}`, color: muted }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-base mb-2" style={{ color: text, letterSpacing: '-0.32px' }}>{proj.title}</h3>
                                    <p className="text-sm mb-4" style={{ color: sub, lineHeight: 1.6 }}>{proj.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {proj.tech?.map((t: string, j: number) => (
                                            <span key={j} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#ebf5ff', color: isDark ? '#888' : '#0068d6' }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section id="experience">
                        <SectionHead icon={<Briefcase className="w-4 h-4" />} title="Experience" color={text} border={border} />
                        <div className="mt-6 space-y-4">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="p-6 rounded-lg transition-all" style={{ boxShadow: cardShadow, background: surfaceBg }}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 text-sm font-semibold" style={{ background: `rgba(${rgb},0.1)`, color }}>
                                            {exp.company?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                                                <h3 className="font-semibold" style={{ color: text, letterSpacing: '-0.32px' }}>{exp.role}</h3>
                                                <span className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap w-fit" style={{ boxShadow: `0 0 0 1px ${border}`, color: muted }}>{exp.duration}</span>
                                            </div>
                                            <p className="text-sm font-medium mb-2" style={{ color }}>{exp.company}</p>
                                            <p className="text-sm" style={{ color: sub, lineHeight: 1.6 }}>{exp.description}</p>
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
                        <SectionHead icon={<GraduationCap className="w-4 h-4" />} title="Education" color={text} border={border} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="p-6 rounded-lg" style={{ boxShadow: cardShadow, background: surfaceBg }}>
                                    <div className="w-9 h-9 rounded-md flex items-center justify-center mb-4" style={{ background: `rgba(${rgb},0.1)` }}>
                                        <GraduationCap className="w-4 h-4" style={{ color }} />
                                    </div>
                                    <h3 className="font-semibold mb-1" style={{ color: text, letterSpacing: '-0.32px' }}>{edu.degree}</h3>
                                    <p className="text-sm font-medium mb-1" style={{ color }}>{edu.institution}</p>
                                    <p className="text-xs" style={{ color: muted }}>{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact */}
                {pd.email && !isPdf && (
                    <section id="contact">
                        <SectionHead icon={<Mail className="w-4 h-4" />} title="Get In Touch" color={text} border={border} />
                        <div className="mt-6 p-8 rounded-lg" style={{ boxShadow: cardShadow, background: surfaceBg }}>
                            {contactSent ? (
                                <div className="text-center py-8">
                                    <Check className="w-10 h-10 mx-auto mb-4" style={{ color }} />
                                    <p className="font-semibold mb-1" style={{ color: text }}>Email client opened!</p>
                                    <p className="text-sm" style={{ color: sub }}>Your message is ready to send.</p>
                                    <button onClick={() => setContactSent(false)} className="mt-4 text-sm" style={{ color: muted }}>Send another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContact} className="space-y-3 max-w-md mx-auto">
                                    <input type="text" placeholder="Your name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-2.5 rounded-md text-sm outline-none transition-colors" style={{ boxShadow: `0 0 0 1px ${border}`, background: 'transparent', color: text }} />
                                    <input type="email" placeholder="Your email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-2.5 rounded-md text-sm outline-none transition-colors" style={{ boxShadow: `0 0 0 1px ${border}`, background: 'transparent', color: text }} />
                                    <textarea placeholder="Your message…" value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required rows={4} className="w-full px-4 py-2.5 rounded-md text-sm outline-none transition-colors resize-none" style={{ boxShadow: `0 0 0 1px ${border}`, background: 'transparent', color: text }} />
                                    <button type="submit" className="w-full py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all" style={{ background: text, color: bg }}>
                                        <Send className="w-4 h-4" />Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Footer */}
            <footer style={{ borderTop: `1px solid ${border}` }} className="py-8 text-center">
                <p className="text-xs" style={{ color: muted }}>
                    Built with <a href="/" className="hover:underline transition-colors" style={{ color }}>PortfolioBuilder.AI</a>
                </p>
            </footer>
        </div>
    )
}

function SectionHead({ icon, title, color, border }: { icon: React.ReactNode; title: string; color: string; border: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ boxShadow: `0 0 0 1px ${border}`, color }}>
                {icon}
            </div>
            <h2 className="font-semibold" style={{ color, letterSpacing: '-0.96px' }}>{title}</h2>
            <div className="flex-1 h-px" style={{ background: border }} />
        </div>
    )
}
