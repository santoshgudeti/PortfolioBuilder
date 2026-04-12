import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User, ArrowUpRight,
    Share2, Copy, Check, Twitter, Eye, Send, Menu, X
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

/* ── Spotify Design System ─────────────────────────────────────────────
   Near-black immersive · Green accent · Pill/circle geometry
   Canvas: #121212 · Text: #ffffff · Accent: #1ed760
───────────────────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) return '99, 102, 241'
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241'
    return `${r}, ${g}, ${b}`
}

export default function SpotifyTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)
    const [mobileNav, setMobileNav] = useState(false)
    const [copied, setCopied] = useState(false)

    // Spotify is always dark
    const green = color || '#1ed760'
    const bg0 = '#121212'
    const bg1 = '#181818'
    const bg2 = '#1f1f1f'
    const bg3 = '#252525'
    const textPrimary = '#ffffff'
    const textSecondary = '#b3b3b3'
    const borderCol = '#4d4d4d'

    const navItems = [
        { label: 'ABOUT', id: 'about', show: !!pd.summary && !hiddenSections.has('summary') },
        { label: 'SKILLS', id: 'skills', show: pd.skills?.length > 0 && !hiddenSections.has('skills') },
        { label: 'PROJECTS', id: 'projects', show: pd.projects?.length > 0 && !hiddenSections.has('projects') },
        { label: 'EXPERIENCE', id: 'experience', show: pd.experience?.length > 0 && !hiddenSections.has('experience') },
        { label: 'EDUCATION', id: 'education', show: pd.education?.length > 0 && !hiddenSections.has('education') },
        { label: 'CONTACT', id: 'contact', show: !!pd.email },
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

    const pillBtn = (active?: boolean) => ({
        background: active ? green : bg2,
        color: active ? '#000000' : textPrimary,
        borderRadius: '9999px',
        padding: '8px 20px',
        fontSize: '14px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '1.4px',
    })

    return (
        <div style={{ background: bg0, color: textPrimary, fontFamily: "'Inter', 'Circular', system-ui, -apple-system, sans-serif" }} className="min-h-screen">
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s portfolio`} />
                </Helmet>
            )}

            {/* Share */}
            {showShare && !isPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
                    <div className="absolute inset-0 bg-black/70" />
                    <div className="relative w-full max-w-sm p-6 rounded-lg" style={{ background: bg3, boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }} onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 text-white">Share Portfolio</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 px-3 py-2 rounded-full text-sm truncate" style={{ background: bg2, color: textSecondary }}>{publicUrl}</div>
                            <button onClick={copyLink} className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: green, color: '#000' }}>
                                {copied ? '✓' : 'COPY'}
                            </button>
                        </div>
                        <button onClick={() => setShowShare(false)} className="mt-2 w-full py-2 text-sm" style={{ color: textSecondary }}>Close</button>
                    </div>
                </div>
            )}

            {/* ── Nav ── */}
            {!isPdf && !isPreview && (
                <nav className="sticky top-0 z-40" style={{ background: bg0, borderBottom: 'none' }}>
                    <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: green }}>{pd.name}</span>
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} className="px-3 py-1.5 text-[13px] font-bold transition-colors hover:text-white" style={{ color: textSecondary, letterSpacing: '0.5px' }}>{item.label}</a>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {data.view_count > 0 && (
                                <span className="hidden sm:flex items-center gap-1 text-xs px-3 py-1 rounded-full" style={{ background: bg2, color: textSecondary }}><Eye className="w-3 h-3" />{data.view_count}</span>
                            )}
                            <button onClick={() => setShowShare(true)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg2, color: textSecondary }}><Share2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg2, color: textSecondary }}>
                                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {mobileNav && (
                        <div className="md:hidden px-6 py-3 space-y-1" style={{ background: bg1 }}>
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileNav(false)} className="block px-3 py-2.5 text-sm font-bold" style={{ color: textSecondary }}>{item.label}</a>
                            ))}
                        </div>
                    )}
                </nav>
            )}

            {/* ── Hero ── */}
            <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 px-6" style={{ background: `linear-gradient(180deg, rgba(${rgb},0.3) 0%, ${bg0} 60%)` }}>
                <div className="max-w-[1200px] mx-auto text-center">
                    <div className="mb-8">
                        {data.avatar_url ? (
                            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden mx-auto" style={{ boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }}>
                                <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center text-4xl font-bold mx-auto" style={{ background: bg2, color: green, boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px' }}>
                                {initials}
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{pd.name}</h1>
                    <p className="text-lg mb-3" style={{ color: textSecondary }}>{pd.title}</p>
                    {pd.tagline && <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: textSecondary }}>{pd.tagline}</p>}

                    <div className="flex flex-wrap justify-center gap-3">
                        {pd.email && !isPdf && (
                            <a href="#contact" style={pillBtn(true)}>
                                <span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" />HIRE ME</span>
                            </a>
                        )}
                        {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" style={pillBtn()}><span className="flex items-center gap-2"><Github className="w-3.5 h-3.5" />GITHUB</span></a>}
                        {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" style={pillBtn()}><span className="flex items-center gap-2"><Linkedin className="w-3.5 h-3.5" />LINKEDIN</span></a>}
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <div className="max-w-[1200px] mx-auto px-6 pb-24 space-y-16">

                {pd.summary && !hiddenSections.has('summary') && (
                    <section id="about">
                        <SpotifySectionHead title="About" green={green} />
                        <div className="mt-4 p-6 rounded-lg" style={{ background: bg1 }}>
                            <p className="text-base" style={{ color: textSecondary, lineHeight: 1.6 }}>{pd.summary}</p>
                        </div>
                    </section>
                )}

                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section id="skills">
                        <SpotifySectionHead title="Skills" green={green} />
                        <div className="mt-4 flex flex-wrap gap-2">
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 cursor-default" style={{
                                    background: i % 4 === 0 ? green : bg2,
                                    color: i % 4 === 0 ? '#000' : textPrimary,
                                }}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section id="projects">
                        <SpotifySectionHead title="Projects" green={green} />
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="group p-6 rounded-lg transition-all hover:brightness-110" style={{ background: bg1, boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: green, color: '#000' }}>
                                            {proj.title?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex gap-2">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg2, color: textSecondary }}><Github className="w-3.5 h-3.5" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg2, color: textSecondary }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{proj.title}</h3>
                                    <p className="text-sm mb-4" style={{ color: textSecondary }}>{proj.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {proj.tech?.map((t: string, j: number) => (
                                            <span key={j} className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: bg2, color: textSecondary }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section id="experience">
                        <SpotifySectionHead title="Experience" green={green} />
                        <div className="mt-4 space-y-3">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="p-6 rounded-lg" style={{ background: bg1 }}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ background: green, color: '#000' }}>
                                            {exp.company?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white">{exp.role}</h3>
                                            <p className="text-sm font-bold mb-1" style={{ color: green }}>{exp.company}</p>
                                            <p className="text-xs mb-2" style={{ color: textSecondary }}>{exp.duration}</p>
                                            <p className="text-sm" style={{ color: textSecondary }}>{exp.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.education?.length > 0 && !hiddenSections.has('education') && (
                    <section id="education">
                        <SpotifySectionHead title="Education" green={green} />
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="p-6 rounded-lg" style={{ background: bg1 }}>
                                    <GraduationCap className="w-5 h-5 mb-3" style={{ color: green }} />
                                    <h3 className="font-bold text-white">{edu.degree}</h3>
                                    <p className="text-sm font-bold mt-1" style={{ color: green }}>{edu.institution}</p>
                                    <p className="text-xs mt-1" style={{ color: textSecondary }}>{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.email && !isPdf && (
                    <section id="contact">
                        <SpotifySectionHead title="Get In Touch" green={green} />
                        <div className="mt-4 p-8 rounded-lg" style={{ background: bg1 }}>
                            {contactSent ? (
                                <div className="text-center py-8">
                                    <Check className="w-10 h-10 mx-auto mb-4" style={{ color: green }} />
                                    <p className="font-bold text-white">Email client opened!</p>
                                    <button onClick={() => setContactSent(false)} className="mt-4 text-sm" style={{ color: textSecondary }}>Send another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContact} className="space-y-3 max-w-md mx-auto">
                                    <input type="text" placeholder="Your name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-3 rounded-full text-sm outline-none" style={{ background: bg2, color: textPrimary, boxShadow: `rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset` }} />
                                    <input type="email" placeholder="Your email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-3 rounded-full text-sm outline-none" style={{ background: bg2, color: textPrimary, boxShadow: `rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset` }} />
                                    <textarea placeholder="Your message…" value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required rows={4} className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none" style={{ background: bg2, color: textPrimary, boxShadow: `rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset` }} />
                                    <button type="submit" className="w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 uppercase" style={{ background: green, color: '#000', letterSpacing: '1.4px' }}>
                                        <Send className="w-4 h-4" />SEND MESSAGE
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </div>

            <footer className="py-8 text-center" style={{ borderTop: `1px solid ${bg2}` }}>
                <p className="text-xs" style={{ color: textSecondary }}>
                    Built with <a href="/" className="hover:underline" style={{ color: green }}>PortfolioBuilder.AI</a>
                </p>
            </footer>
        </div>
    )
}

function SpotifySectionHead({ title, green }: { title: string; green: string }) {
    return (
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-1 h-6 rounded-full" style={{ background: green }} />
            {title}
        </h2>
    )
}
