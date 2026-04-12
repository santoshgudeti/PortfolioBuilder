import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User, ArrowUpRight,
    Share2, Copy, Check, Twitter, Eye, Send, Menu, X
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

/* ── Stripe Design System ─────────────────────────────────────────────
   Purple gradients · Weight-300 elegance · Blue-tinted shadows
   Accent: #533afd · Heading: #061b31 · Body: #64748d
───────────────────────────────────────────────────────────────────── */

function hexToRgb(hex: string) {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length < 7) return '99, 102, 241'
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return '99, 102, 241'
    return `${r}, ${g}, ${b}`
}

export default function StripeTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [showShare, setShowShare] = useState(false)
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)
    const [mobileNav, setMobileNav] = useState(false)
    const [copied, setCopied] = useState(false)

    const isDark = mode === 'dark'
    const heading = isDark ? '#f0f2f5' : '#061b31'
    const body = isDark ? '#94a3b8' : '#64748d'
    const muted = isDark ? '#64748b' : '#94a3b8'
    const bg = isDark ? '#0f0f23' : '#ffffff'
    const darkSection = isDark ? '#0a0a1a' : '#1c1e54'
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5edf5'
    const shadowCard = isDark
        ? 'rgba(0,0,0,0.5) 0px 30px 45px -30px, rgba(0,0,0,0.3) 0px 18px 36px -18px'
        : 'rgba(50,50,93,0.25) 0px 30px 45px -30px, rgba(0,0,0,0.1) 0px 18px 36px -18px'
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
        <div style={{ background: bg, color: heading, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }} className="min-h-screen transition-colors">
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s portfolio`} />
                </Helmet>
            )}

            {/* Share Modal */}
            {showShare && !isPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-sm p-6 rounded-lg" style={{ background: bg, boxShadow: shadowCard, border: `1px solid ${borderColor}` }} onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg mb-4" style={{ color: heading, fontWeight: 300, letterSpacing: '-0.64px' }}>Share Portfolio</h3>
                        <div className="flex gap-2 mb-4">
                            <div className="flex-1 px-3 py-2 rounded text-sm truncate" style={{ border: `1px solid ${borderColor}`, color: body }}>{publicUrl}</div>
                            <button onClick={copyLink} className="px-3 py-2 rounded text-sm text-white" style={{ background: color }}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <button onClick={() => setShowShare(false)} className="mt-2 w-full py-2 text-sm" style={{ color: muted }}>Close</button>
                    </div>
                </div>
            )}

            {/* ── Nav ── */}
            {!isPdf && !isPreview && (
                <nav className="sticky top-0 z-40 backdrop-blur-xl" style={{ borderBottom: `1px solid ${borderColor}`, background: isDark ? 'rgba(15,15,35,0.85)' : 'rgba(255,255,255,0.85)' }}>
                    <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
                        <span className="text-sm" style={{ color: heading, fontWeight: 400 }}>{pd.name}</span>
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} className="px-3 py-1.5 rounded text-sm transition-colors hover:opacity-80" style={{ color: body, fontWeight: 400 }}>{item.label}</a>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            {data.view_count > 0 && (
                                <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded" style={{ color: muted, border: `1px solid ${borderColor}` }}>
                                    <Eye className="w-3 h-3" />{data.view_count}
                                </span>
                            )}
                            <button onClick={() => setShowShare(true)} className="px-3 py-1.5 rounded text-sm" style={{ color: body }}><Share2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden p-1.5" style={{ color: body }}>
                                {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    {mobileNav && (
                        <div className="md:hidden px-6 py-3 space-y-1" style={{ borderTop: `1px solid ${borderColor}` }}>
                            {navItems.map(item => (
                                <a key={item.id} href={`#${item.id}`} onClick={() => setMobileNav(false)} className="block px-3 py-2.5 rounded text-sm" style={{ color: body }}>{item.label}</a>
                            ))}
                        </div>
                    )}
                </nav>
            )}

            {/* ── Hero (weight 300 elegance) ── */}
            <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 px-6">
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] pointer-events-none" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
                <div className="max-w-[1080px] mx-auto text-center">
                    <div className="mb-8">
                        {data.avatar_url ? (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden mx-auto" style={{ boxShadow: shadowCard }}>
                                <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg flex items-center justify-center text-3xl mx-auto text-white" style={{ background: `linear-gradient(135deg, ${color}, #ea2261)`, boxShadow: shadowCard, fontWeight: 300 }}>
                                {initials}
                            </div>
                        )}
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4" style={{ color: heading, fontWeight: 300, letterSpacing: '-1.4px', lineHeight: 1.03 }}>
                        {pd.name}
                    </h1>
                    <p className="text-lg sm:text-xl mb-3" style={{ color: body, fontWeight: 300, lineHeight: 1.4 }}>{pd.title}</p>
                    {pd.tagline && <p className="text-base max-w-lg mx-auto mb-10" style={{ color: muted, fontWeight: 300, lineHeight: 1.5 }}>{pd.tagline}</p>}

                    <div className="flex flex-wrap justify-center gap-3">
                        {pd.email && <a href={`mailto:${pd.email}`} className="flex items-center gap-2 px-4 py-2 rounded text-sm transition-all hover:opacity-80" style={{ border: `1px solid ${borderColor}`, color: body }}><Mail className="w-3.5 h-3.5" />{pd.email}</a>}
                        {pd.location && <span className="flex items-center gap-2 px-4 py-2 rounded text-sm" style={{ border: `1px solid ${borderColor}`, color: body }}><MapPin className="w-3.5 h-3.5" />{pd.location}</span>}
                        {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded text-sm hover:opacity-80" style={{ border: `1px solid ${borderColor}`, color: body }}><Github className="w-3.5 h-3.5" />GitHub</a>}
                        {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded text-sm hover:opacity-80" style={{ border: `1px solid ${borderColor}`, color: body }}><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
                        {pd.email && !isPdf && (
                            <a href="#contact" className="flex items-center gap-2 px-5 py-2 rounded text-sm text-white transition-all" style={{ background: color, boxShadow: `0 4px 12px rgba(${rgb},0.3)` }}>
                                <Send className="w-3.5 h-3.5" />Contact Me
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <div className="max-w-[1080px] mx-auto px-6 pb-24 space-y-20">

                {pd.summary && !hiddenSections.has('summary') && (
                    <section id="about">
                        <SectionHead icon={<User className="w-4 h-4" />} title="About" color={color} heading={heading} border={borderColor} />
                        <div className="mt-6 p-8 rounded-lg" style={{ border: `1px solid ${borderColor}`, boxShadow: `rgba(23,23,23,0.08) 0px 15px 35px 0px`, background: surfaceBg }}>
                            <p style={{ color: body, fontWeight: 300, lineHeight: 1.7 }}>{pd.summary}</p>
                        </div>
                    </section>
                )}

                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section id="skills">
                        <SectionHead icon={<Code2 className="w-4 h-4" />} title="Skills" color={color} heading={heading} border={borderColor} />
                        <div className="mt-6 flex flex-wrap gap-2">
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 rounded text-sm transition-transform hover:scale-105 cursor-default" style={{
                                    border: `1px solid ${i % 3 === 0 ? `rgba(${rgb},0.4)` : borderColor}`,
                                    color: i % 3 === 0 ? color : body,
                                    background: i % 3 === 0 ? `rgba(${rgb},0.06)` : 'transparent',
                                    fontWeight: 300
                                }}>{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section id="projects">
                        <SectionHead icon={<Code2 className="w-4 h-4" />} title="Projects" color={color} heading={heading} border={borderColor} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="group p-6 rounded-lg transition-all hover:translate-y-[-2px]" style={{ border: `1px solid ${borderColor}`, boxShadow: shadowCard, background: surfaceBg }}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 rounded flex items-center justify-center text-sm text-white" style={{ background: `linear-gradient(135deg, ${color}, #ea2261)`, fontWeight: 300 }}>
                                            {proj.title?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex gap-2">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded flex items-center justify-center" style={{ border: `1px solid ${borderColor}`, color: muted }}><Github className="w-3.5 h-3.5" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded flex items-center justify-center" style={{ border: `1px solid ${borderColor}`, color: muted }}><ExternalLink className="w-3.5 h-3.5" /></a>}
                                        </div>
                                    </div>
                                    <h3 className="text-base mb-2" style={{ color: heading, fontWeight: 300, letterSpacing: '-0.22px' }}>{proj.title}</h3>
                                    <p className="text-sm mb-4" style={{ color: body, fontWeight: 300, lineHeight: 1.5 }}>{proj.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {proj.tech?.map((t: string, j: number) => (
                                            <span key={j} className="text-xs px-2 py-0.5 rounded" style={{ border: `1px solid ${borderColor}`, color: body, fontWeight: 400 }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section id="experience">
                        <SectionHead icon={<Briefcase className="w-4 h-4" />} title="Experience" color={color} heading={heading} border={borderColor} />
                        <div className="mt-6 space-y-4">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="p-6 rounded-lg" style={{ border: `1px solid ${borderColor}`, background: surfaceBg }}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 text-sm text-white" style={{ background: `linear-gradient(135deg, ${color}, #ea2261)`, fontWeight: 300 }}>
                                            {exp.company?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
                                                <h3 style={{ color: heading, fontWeight: 300, letterSpacing: '-0.22px' }}>{exp.role}</h3>
                                                <span className="text-xs px-2.5 py-1 rounded whitespace-nowrap w-fit" style={{ border: `1px solid ${borderColor}`, color: muted }}>{exp.duration}</span>
                                            </div>
                                            <p className="text-sm mb-2" style={{ color, fontWeight: 400 }}>{exp.company}</p>
                                            <p className="text-sm" style={{ color: body, fontWeight: 300, lineHeight: 1.5 }}>{exp.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.education?.length > 0 && !hiddenSections.has('education') && (
                    <section id="education">
                        <SectionHead icon={<GraduationCap className="w-4 h-4" />} title="Education" color={color} heading={heading} border={borderColor} />
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="p-6 rounded-lg" style={{ border: `1px solid ${borderColor}`, background: surfaceBg }}>
                                    <GraduationCap className="w-5 h-5 mb-4" style={{ color }} />
                                    <h3 style={{ color: heading, fontWeight: 300 }}>{edu.degree}</h3>
                                    <p className="text-sm mt-1" style={{ color, fontWeight: 400 }}>{edu.institution}</p>
                                    <p className="text-xs mt-1" style={{ color: muted }}>{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {pd.email && !isPdf && (
                    <section id="contact">
                        <SectionHead icon={<Mail className="w-4 h-4" />} title="Get In Touch" color={color} heading={heading} border={borderColor} />
                        <div className="mt-6 p-8 rounded-lg" style={{ border: `1px solid ${borderColor}`, background: surfaceBg }}>
                            {contactSent ? (
                                <div className="text-center py-8">
                                    <Check className="w-10 h-10 mx-auto mb-4" style={{ color }} />
                                    <p style={{ color: heading, fontWeight: 300 }}>Email client opened!</p>
                                    <button onClick={() => setContactSent(false)} className="mt-4 text-sm" style={{ color: muted }}>Send another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContact} className="space-y-3 max-w-md mx-auto">
                                    <input type="text" placeholder="Your name" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required className="w-full px-4 py-2.5 rounded text-sm outline-none" style={{ border: `1px solid ${borderColor}`, background: 'transparent', color: heading, fontWeight: 300 }} />
                                    <input type="email" placeholder="Your email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-2.5 rounded text-sm outline-none" style={{ border: `1px solid ${borderColor}`, background: 'transparent', color: heading, fontWeight: 300 }} />
                                    <textarea placeholder="Your message…" value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} required rows={4} className="w-full px-4 py-2.5 rounded text-sm outline-none resize-none" style={{ border: `1px solid ${borderColor}`, background: 'transparent', color: heading, fontWeight: 300 }} />
                                    <button type="submit" className="w-full py-2.5 rounded text-sm text-white flex items-center justify-center gap-2" style={{ background: color, boxShadow: `0 4px 12px rgba(${rgb},0.3)` }}>
                                        <Send className="w-4 h-4" />Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </div>

            {/* Dark brand footer section */}
            <footer style={{ background: darkSection, borderTop: `1px solid ${borderColor}` }} className="py-10 text-center">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Built with <a href="/" className="hover:underline text-white/70">PortfolioBuilder.AI</a>
                </p>
            </footer>
        </div>
    )
}

function SectionHead({ icon, title, color, heading, border }: { icon: React.ReactNode; title: string; color: string; heading: string; border: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `rgba(${hexToRgb2(color)},0.1)`, color }}>{icon}</div>
            <h2 style={{ color: heading, fontWeight: 300, letterSpacing: '-0.64px' }}>{title}</h2>
            <div className="flex-1 h-px" style={{ background: border }} />
        </div>
    )
}

function hexToRgb2(hex: string) {
    if (!hex || !hex.startsWith('#') || hex.length < 7) return '99,102,241'
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    return `${r},${g},${b}`
}
