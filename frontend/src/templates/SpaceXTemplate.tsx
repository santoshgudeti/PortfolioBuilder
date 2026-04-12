import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User, ArrowUpRight,
    Share2, Copy, Check, Twitter, Eye, Send, Menu, X
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

/* ── SpaceX Design System ─────────────────────────────────────────────
   Cinematic full-viewport · Uppercase stencil · Photography-first
   Canvas: #000000 · Text: #f0f0fa (spectral white) · D-DIN industrial
───────────────────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) return '99, 102, 241'
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241'
    return `${r}, ${g}, ${b}`
}

export default function SpaceXTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)
    const [mobileNav, setMobileNav] = useState(false)
    const [copied, setCopied] = useState(false)

    const spectral = '#f0f0fa'
    const ghostBg = 'rgba(240, 240, 250, 0.1)'
    const ghostBorder = 'rgba(240, 240, 250, 0.35)'

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

    // Inline styles for stencil text
    const stencil = (size: string, weight = 700) => ({
        fontFamily: "'Inter', 'D-DIN', Arial, Verdana, sans-serif",
        fontSize: size,
        fontWeight: weight,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.96px',
        color: spectral,
        lineHeight: 1.0,
    })

    const ghostBtn: React.CSSProperties = {
        background: ghostBg,
        color: spectral,
        border: `1px solid ${ghostBorder}`,
        borderRadius: '32px',
        padding: '14px 28px',
        fontSize: '13px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.17px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    }

    return (
        <div style={{ background: '#000000', color: spectral, fontFamily: "'Inter', 'D-DIN', Arial, Verdana, sans-serif" }} className="min-h-screen">
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s portfolio`} />
                </Helmet>
            )}

            {/* Share */}
            {showShare && !isPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
                    <div className="absolute inset-0 bg-black/80" />
                    <div className="relative w-full max-w-sm p-6 rounded-lg" style={{ background: 'rgba(20,20,20,0.95)', border: `1px solid ${ghostBorder}` }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ ...stencil('14px'), marginBottom: '16px' }}>SHARE PORTFOLIO</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 px-3 py-2 rounded text-sm truncate" style={{ background: ghostBg, color: 'rgba(240,240,250,0.6)' }}>{publicUrl}</div>
                            <button onClick={copyLink} className="px-4 py-2 rounded text-sm font-bold uppercase" style={{ background: ghostBg, color: spectral, border: `1px solid ${ghostBorder}` }}>
                                {copied ? '✓' : 'COPY'}
                            </button>
                        </div>
                        <button onClick={() => setShowShare(false)} className="mt-2 w-full py-2 text-xs uppercase tracking-wide" style={{ color: 'rgba(240,240,250,0.4)' }}>CLOSE</button>
                    </div>
                </div>
            )}

            {/* ── Nav ── */}
            {!isPdf && !isPreview && (
                <nav className="fixed top-0 left-0 right-0 z-40" style={{ background: 'transparent' }}>
                    <div className="max-w-full mx-auto px-6 sm:px-12 h-16 flex items-center justify-between">
                        <span style={{ ...stencil('13px'), letterSpacing: '1.17px' }}>{pd.name}</span>
                        <div className="hidden md:flex items-center gap-6">
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} className="transition-opacity hover:opacity-100" style={{ ...stencil('12px', 400), opacity: 0.7, letterSpacing: '1.17px' }}>{item.label}</a>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            {data.view_count > 0 && (
                                <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: 'rgba(240,240,250,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    <Eye className="w-3 h-3" />{data.view_count}
                                </span>
                            )}
                            <button onClick={() => setShowShare(true)} className="p-2 rounded-full transition-opacity hover:opacity-100" style={{ color: spectral, opacity: 0.6 }}><Share2 className="w-4 h-4" /></button>
                            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-2" style={{ color: spectral }}>
                                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {mobileNav && (
                        <div className="md:hidden px-6 py-4 space-y-2" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}>
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileNav(false)} className="block px-3 py-3 text-sm font-bold uppercase tracking-wide" style={{ color: spectral }}>{item.label}</a>
                            ))}
                        </div>
                    )}
                </nav>
            )}

            {/* ── Hero (full viewport, cinematic) ── */}
            <section className="relative flex items-center justify-center px-6" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)' }}>
                {/* Starfield effect */}
                <div className="absolute inset-0 overflow-hidden opacity-40">
                    <div className="absolute inset-0" style={{
                        background: 'radial-gradient(1px 1px at 20px 30px, rgba(240,240,250,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 80% 20%, rgba(240,240,250,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 40% 60%, rgba(240,240,250,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 70% 80%, rgba(240,240,250,0.3) 0%, transparent 100%), radial-gradient(2px 2px at 10% 10%, rgba(240,240,250,0.4) 0%, transparent 100%), radial-gradient(1px 1px at 90% 50%, rgba(240,240,250,0.5) 0%, transparent 100%)',
                    }} />
                </div>

                <div className="relative max-w-3xl text-center">
                    {/* Avatar */}
                    <div className="mb-10">
                        {data.avatar_url ? (
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mx-auto ring-2 ring-white/10">
                                <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mx-auto ring-2 ring-white/10" style={{ background: ghostBg }}>
                                <span style={stencil('40px')}>{initials}</span>
                            </div>
                        )}
                    </div>

                    <h1 style={{ ...stencil('clamp(32px, 6vw, 48px)'), marginBottom: '16px', letterSpacing: '0.96px' }}>{pd.name}</h1>
                    <p className="text-base sm:text-lg mb-4 uppercase tracking-wide" style={{ color: 'rgba(240,240,250,0.6)', lineHeight: 1.5, letterSpacing: '0.5px' }}>{pd.title}</p>
                    {pd.tagline && <p className="text-sm max-w-lg mx-auto mb-10" style={{ color: 'rgba(240,240,250,0.4)', lineHeight: 1.7 }}>{pd.tagline}</p>}

                    <div className="flex flex-wrap justify-center gap-3">
                        {pd.email && !isPdf && <a href="#contact" style={ghostBtn}><span className="flex items-center gap-2"><Send className="w-3.5 h-3.5" />CONTACT</span></a>}
                        {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" style={ghostBtn}><span className="flex items-center gap-2"><Github className="w-3.5 h-3.5" />GITHUB</span></a>}
                        {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" style={ghostBtn}><span className="flex items-center gap-2"><Linkedin className="w-3.5 h-3.5" />LINKEDIN</span></a>}
                    </div>
                </div>
            </section>

            {/* ── Content Sections ── */}
            <div className="max-w-[1000px] mx-auto px-6 sm:px-12 pb-24 space-y-24">

                {pd.summary && !hiddenSections.has('summary') && (
                    <section id="about" className="pt-20">
                        <SpaceXSectionHead title="MISSION STATEMENT" />
                        <p className="text-base mt-8" style={{ color: 'rgba(240,240,250,0.7)', lineHeight: 1.7 }}>{pd.summary}</p>
                    </section>
                )}

                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section id="skills">
                        <SpaceXSectionHead title="CAPABILITIES" />
                        <div className="mt-8 flex flex-wrap gap-3">
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 text-xs uppercase tracking-wide transition-all hover:border-white/60 cursor-default" style={{ border: `1px solid ${ghostBorder}`, color: spectral, borderRadius: '32px', letterSpacing: '1px', fontWeight: 700 }}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section id="projects">
                        <SpaceXSectionHead title="MISSIONS" />
                        <div className="mt-8 space-y-6">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="group py-8" style={{ borderBottom: `1px solid rgba(240,240,250,0.1)` }}>
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <span className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'rgba(240,240,250,0.3)', letterSpacing: '1px' }}>MISSION {String(i + 1).padStart(2, '0')}</span>
                                            <h3 className="text-lg font-bold uppercase tracking-wide text-white mb-2" style={{ letterSpacing: '0.5px' }}>{proj.title}</h3>
                                            <p className="text-sm mb-4" style={{ color: 'rgba(240,240,250,0.5)', lineHeight: 1.6 }}>{proj.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {proj.tech?.map((t: string, j: number) => (
                                                    <span key={j} className="text-[10px] px-2 py-1 uppercase tracking-wider rounded" style={{ background: ghostBg, border: `1px solid ${ghostBorder}`, color: 'rgba(240,240,250,0.6)' }}>{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, padding: '10px 16px', fontSize: '10px' }}><Github className="w-3 h-3" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, padding: '10px 16px', fontSize: '10px' }}><span className="flex items-center gap-1">LAUNCH <ExternalLink className="w-3 h-3" /></span></a>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section id="experience">
                        <SpaceXSectionHead title="FLIGHT HISTORY" />
                        <div className="mt-8 space-y-6">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="py-6" style={{ borderBottom: `1px solid rgba(240,240,250,0.1)` }}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
                                        <div>
                                            <h3 className="font-bold uppercase tracking-wide text-white" style={{ letterSpacing: '0.5px' }}>{exp.role}</h3>
                                            <p className="text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(240,240,250,0.5)', letterSpacing: '0.5px' }}>{exp.company}</p>
                                        </div>
                                        <span className="text-xs uppercase tracking-wider self-start" style={{ color: 'rgba(240,240,250,0.3)', letterSpacing: '1px' }}>{exp.duration}</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'rgba(240,240,250,0.5)', lineHeight: 1.6 }}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.education?.length > 0 && !hiddenSections.has('education') && (
                    <section id="education">
                        <SpaceXSectionHead title="TRAINING" />
                        <div className="mt-8 space-y-6">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="py-6" style={{ borderBottom: `1px solid rgba(240,240,250,0.1)` }}>
                                    <h3 className="font-bold uppercase tracking-wide text-white" style={{ letterSpacing: '0.5px' }}>{edu.degree}</h3>
                                    <p className="text-sm uppercase tracking-wide mt-1" style={{ color: 'rgba(240,240,250,0.5)' }}>{edu.institution}</p>
                                    <p className="text-xs uppercase tracking-wider mt-1" style={{ color: 'rgba(240,240,250,0.3)', letterSpacing: '1px' }}>{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.email && !isPdf && (
                    <section id="contact">
                        <SpaceXSectionHead title="ESTABLISH CONTACT" />
                        <div className="mt-8">
                            {contactSent ? (
                                <div className="text-center py-12">
                                    <Check className="w-10 h-10 mx-auto mb-4" style={{ color: spectral }} />
                                    <p className="font-bold uppercase tracking-wide text-white" style={{ letterSpacing: '0.5px' }}>TRANSMISSION SENT</p>
                                    <button onClick={() => setContactSent(false)} className="mt-4 text-xs uppercase tracking-wider" style={{ color: 'rgba(240,240,250,0.4)' }}>NEW TRANSMISSION</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContact} className="space-y-4 max-w-md mx-auto">
                                    <input type="text" placeholder="NAME" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-3 text-sm outline-none uppercase tracking-wider" style={{ background: ghostBg, border: `1px solid ${ghostBorder}`, color: spectral, borderRadius: '4px', letterSpacing: '1px' }} />
                                    <input type="email" placeholder="EMAIL" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-3 text-sm outline-none" style={{ background: ghostBg, border: `1px solid ${ghostBorder}`, color: spectral, borderRadius: '4px' }} />
                                    <textarea placeholder="MESSAGE" value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required rows={4} className="w-full px-4 py-3 text-sm outline-none resize-none uppercase tracking-wider" style={{ background: ghostBg, border: `1px solid ${ghostBorder}`, color: spectral, borderRadius: '4px', letterSpacing: '0.5px' }} />
                                    <button type="submit" style={ghostBtn} className="w-full flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4" />TRANSMIT
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </div>

            <footer className="py-8 text-center">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(240,240,250,0.25)', letterSpacing: '1px' }}>
                    BUILT WITH <a href="/" className="hover:underline transition-colors" style={{ color: 'rgba(240,240,250,0.4)' }}>PORTFOLIOBUILDER.AI</a>
                </p>
            </footer>
        </div>
    )
}

function SpaceXSectionHead({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#f0f0fa', letterSpacing: '1.17px' }}>{title}</h2>
            <div className="flex-1 h-px" style={{ background: 'rgba(240,240,250,0.15)' }} />
        </div>
    )
}
