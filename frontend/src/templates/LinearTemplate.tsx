import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User, ArrowUpRight,
    Share2, Copy, Check, Twitter, Eye, Send, Menu, X
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

/* ── Linear Design System ─────────────────────────────────────────────
   Dark-mode native · Indigo accent · Luminance stacking
   Canvas: #08090a · Text: #f7f8f8 · Accent: #5e6ad2 / #7170ff
───────────────────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) return '99, 102, 241'
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241'
    return `${r}, ${g}, ${b}`
}

export default function LinearTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)
    const [mobileNav, setMobileNav] = useState(false)
    const [copied, setCopied] = useState(false)

    // Linear is ALWAYS dark-first — light mode is just a lighter variant
    const isDark = mode !== 'light'
    const bg = isDark ? '#08090a' : '#f7f8f8'
    const panelBg = isDark ? '#0f1011' : '#ffffff'
    const surfaceBg = isDark ? 'rgba(255,255,255,0.02)' : '#ffffff'
    const elevatedBg = isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f5'
    const primary = isDark ? '#f7f8f8' : '#1a1a1a'
    const secondary = isDark ? '#d0d6e0' : '#4a5568'
    const tertiary = isDark ? '#8a8f98' : '#718096'
    const quaternary = isDark ? '#62666d' : '#a0aec0'
    const borderCol = isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
    const borderSubtle = isDark ? 'rgba(255,255,255,0.05)' : '#edf2f7'
    const accent = color || '#5e6ad2'
    const accentHover = isDark ? '#828fff' : color

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
        const bodyText = encodeURIComponent(`Hi ${pd.name},\n\n${contactForm.message}\n\nBest,\n${contactForm.name}\n${contactForm.email}`)
        window.open(`mailto:${pd.email}?subject=${subject}&body=${bodyText}`)
        setContactSent(true)
        toast.success('Opening email client…')
    }

    return (
        <div style={{ background: bg, color: primary, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }} className="min-h-screen transition-colors">
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s portfolio`} />
                </Helmet>
            )}

            {/* Share Overlay */}
            {showShare && !isPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)' }} />
                    <div className="relative w-full max-w-sm p-6 rounded-xl" style={{ background: isDark ? '#191a1b' : '#fff', border: `1px solid ${borderCol}` }} onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg mb-4" style={{ color: primary, fontWeight: 510, letterSpacing: '-0.704px' }}>Share Portfolio</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 px-3 py-2 rounded-md text-sm truncate" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: tertiary }}>{publicUrl}</div>
                            <button onClick={copyLink} className="px-3 py-2 rounded-md text-sm text-white" style={{ background: accent }}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <button onClick={() => setShowShare(false)} className="mt-2 w-full py-2 text-sm" style={{ color: quaternary }}>Close</button>
                    </div>
                </div>
            )}

            {/* ── Nav ── */}
            {!isPdf && !isPreview && (
                <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ borderBottom: `1px solid ${borderSubtle}`, background: isDark ? 'rgba(15,16,17,0.85)' : 'rgba(255,255,255,0.85)' }}>
                    <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
                        <span className="text-sm" style={{ color: primary, fontWeight: 510 }}>{pd.name}</span>
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} className="px-3 py-1.5 rounded-md text-[13px] transition-colors hover:text-white" style={{ color: secondary, fontWeight: 510 }}>{item.label}</a>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {data.view_count > 0 && (
                                <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ color: quaternary, border: `1px solid ${borderCol}` }}>
                                    <Eye className="w-3 h-3" />{data.view_count}
                                </span>
                            )}
                            <button onClick={() => setShowShare(true)} className="px-3 py-1.5 rounded-md text-sm transition-colors" style={{ color: secondary }}><Share2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-1.5 rounded-full" style={{ color: secondary, background: isDark ? 'rgba(255,255,255,0.05)' : 'transparent', border: `1px solid ${borderCol}` }}>
                                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {mobileNav && (
                        <div className="md:hidden px-6 py-3 space-y-1" style={{ borderTop: `1px solid ${borderSubtle}` }}>
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileNav(false)} className="block px-3 py-2.5 rounded-md text-sm" style={{ color: secondary, fontWeight: 510 }}>{item.label}</a>
                            ))}
                        </div>
                    )}
                </nav>
            )}

            {/* ── Hero ── */}
            <section className="relative overflow-hidden pt-20 pb-24 sm:pt-32 sm:pb-36 px-6">
                <div className="max-w-[1200px] mx-auto text-center">
                    <div className="mb-8">
                        {data.avatar_url ? (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden mx-auto" style={{ border: `1px solid ${borderCol}` }}>
                                <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-3xl mx-auto" style={{ background: accent, color: '#fff', fontWeight: 510 }}>
                                {initials}
                            </div>
                        )}
                    </div>

                    {/* Display XL — weight 510, tight tracking */}
                    <h1 className="text-4xl sm:text-5xl md:text-[64px] mb-4" style={{ color: primary, fontWeight: 510, letterSpacing: '-1.408px', lineHeight: 1.0 }}>
                        {pd.name}
                    </h1>
                    <p className="text-lg sm:text-xl mb-3" style={{ color: secondary, fontWeight: 400, lineHeight: 1.6, letterSpacing: '-0.165px' }}>{pd.title}</p>
                    {pd.tagline && <p className="text-[15px] max-w-xl mx-auto mb-10" style={{ color: tertiary, fontWeight: 400, lineHeight: 1.6, letterSpacing: '-0.165px' }}>{pd.tagline}</p>}

                    <div className="flex flex-wrap justify-center gap-2">
                        {pd.email && <a href={`mailto:${pd.email}`} className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] transition-all" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: secondary, fontWeight: 510 }}><Mail className="w-3.5 h-3.5" />{pd.email}</a>}
                        {pd.location && <span className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px]" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: secondary, fontWeight: 510 }}><MapPin className="w-3.5 h-3.5" />{pd.location}</span>}
                        {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] transition-all" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: secondary, fontWeight: 510 }}><Github className="w-3.5 h-3.5" />GitHub</a>}
                        {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] transition-all" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: secondary, fontWeight: 510 }}><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
                        {pd.email && !isPdf && (
                            <a href="#contact" className="flex items-center gap-2 px-5 py-2 rounded-md text-[13px] text-white transition-all" style={{ background: accent, fontWeight: 510 }}>
                                <Send className="w-3.5 h-3.5" />Hire Me
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <div className="max-w-[1200px] mx-auto px-6 pb-24 space-y-20">

                {pd.summary && !hiddenSections.has('summary') && (
                    <section id="about">
                        <LinearSectionHead title="About" accent={accent} primary={primary} quaternary={quaternary} />
                        <div className="mt-6 p-8 rounded-xl" style={{ background: surfaceBg, border: `1px solid ${borderCol}` }}>
                            <p className="text-[15px]" style={{ color: secondary, fontWeight: 400, lineHeight: 1.6, letterSpacing: '-0.165px' }}>{pd.summary}</p>
                        </div>
                    </section>
                )}

                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section id="skills">
                        <LinearSectionHead title="Skills" accent={accent} primary={primary} quaternary={quaternary} />
                        <div className="mt-6 flex flex-wrap gap-2">
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105 cursor-default" style={{
                                    border: `1px solid ${i % 3 === 0 ? accent : borderCol}`,
                                    color: i % 3 === 0 ? (isDark ? '#828fff' : accent) : secondary,
                                    background: i % 3 === 0 ? `rgba(${rgb},0.08)` : surfaceBg,
                                    fontWeight: 510
                                }}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section id="projects">
                        <LinearSectionHead title="Projects" accent={accent} primary={primary} quaternary={quaternary} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="group p-6 rounded-xl transition-all" style={{ background: surfaceBg, border: `1px solid ${borderCol}` }}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm text-white" style={{ background: accent, fontWeight: 510 }}>
                                            {proj.title?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex gap-2">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: elevatedBg, border: `1px solid ${borderSubtle}`, color: tertiary }}><Github className="w-3.5 h-3.5" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: elevatedBg, border: `1px solid ${borderSubtle}`, color: tertiary }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                                        </div>
                                    </div>
                                    <h3 className="text-base mb-2" style={{ color: primary, fontWeight: 590, letterSpacing: '-0.24px' }}>{proj.title}</h3>
                                    <p className="text-[15px] mb-4" style={{ color: tertiary, fontWeight: 400, lineHeight: 1.6, letterSpacing: '-0.165px' }}>{proj.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {proj.tech?.map((t: string, j: number) => (
                                            <span key={j} className="text-[11px] px-2 py-0.5 rounded" style={{ background: elevatedBg, border: `1px solid ${borderSubtle}`, color: tertiary, fontWeight: 510 }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section id="experience">
                        <LinearSectionHead title="Experience" accent={accent} primary={primary} quaternary={quaternary} />
                        <div className="mt-6 space-y-4">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="p-6 rounded-xl" style={{ background: surfaceBg, border: `1px solid ${borderCol}` }}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm text-white" style={{ background: accent, fontWeight: 510 }}>
                                            {exp.company?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                                                <h3 style={{ color: primary, fontWeight: 590, letterSpacing: '-0.24px' }}>{exp.role}</h3>
                                                <span className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap w-fit" style={{ border: `1px solid ${borderCol}`, color: quaternary, fontWeight: 510 }}>{exp.duration}</span>
                                            </div>
                                            <p className="text-sm mb-2" style={{ color: accent, fontWeight: 510 }}>{exp.company}</p>
                                            <p className="text-[15px]" style={{ color: tertiary, fontWeight: 400, lineHeight: 1.6, letterSpacing: '-0.165px' }}>{exp.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.education?.length > 0 && !hiddenSections.has('education') && (
                    <section id="education">
                        <LinearSectionHead title="Education" accent={accent} primary={primary} quaternary={quaternary} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="p-6 rounded-xl" style={{ background: surfaceBg, border: `1px solid ${borderCol}` }}>
                                    <GraduationCap className="w-5 h-5 mb-4" style={{ color: accent }} />
                                    <h3 style={{ color: primary, fontWeight: 590 }}>{edu.degree}</h3>
                                    <p className="text-sm mt-1" style={{ color: accent, fontWeight: 510 }}>{edu.institution}</p>
                                    <p className="text-xs mt-1" style={{ color: quaternary }}>{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.email && !isPdf && (
                    <section id="contact">
                        <LinearSectionHead title="Get In Touch" accent={accent} primary={primary} quaternary={quaternary} />
                        <div className="mt-6 p-8 rounded-xl" style={{ background: surfaceBg, border: `1px solid ${borderCol}` }}>
                            {contactSent ? (
                                <div className="text-center py-8">
                                    <Check className="w-10 h-10 mx-auto mb-4" style={{ color: accent }} />
                                    <p style={{ color: primary, fontWeight: 510 }}>Email client opened!</p>
                                    <button onClick={() => setContactSent(false)} className="mt-4 text-sm" style={{ color: quaternary }}>Send another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContact} className="space-y-3 max-w-md mx-auto">
                                    <input type="text" placeholder="Your name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-2.5 rounded-md text-sm outline-none" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: primary, fontWeight: 400 }} />
                                    <input type="email" placeholder="Your email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-2.5 rounded-md text-sm outline-none" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: primary, fontWeight: 400 }} />
                                    <textarea placeholder="Your message…" value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required rows={4} className="w-full px-4 py-2.5 rounded-md text-sm outline-none resize-none" style={{ background: surfaceBg, border: `1px solid ${borderCol}`, color: primary, fontWeight: 400 }} />
                                    <button type="submit" className="w-full py-2.5 rounded-md text-sm text-white flex items-center justify-center gap-2" style={{ background: accent, fontWeight: 510 }}>
                                        <Send className="w-4 h-4" />Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </div>

            <footer style={{ borderTop: `1px solid ${borderSubtle}` }} className="py-8 text-center">
                <p className="text-xs" style={{ color: quaternary }}>
                    Built with <a href="/" className="hover:underline transition-colors" style={{ color: accent }}>PortfolioBuilder.AI</a>
                </p>
            </footer>
        </div>
    )
}

function LinearSectionHead({ title, accent, primary, quaternary }: { title: string; accent: string; primary: string; quaternary: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 rounded-full" style={{ background: accent }} />
            <h2 className="text-xl" style={{ color: primary, fontWeight: 510, letterSpacing: '-0.704px' }}>{title}</h2>
        </div>
    )
}
