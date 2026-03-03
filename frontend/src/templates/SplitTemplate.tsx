import { useState } from 'react'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, ArrowUpRight, Check, Send, User
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { TemplateProps } from './types'

export default function SplitTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
    const [contactSent, setContactSent] = useState(false)

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const subject = encodeURIComponent(`Portfolio inquiry from ${contactForm.name}`)
        const body = encodeURIComponent(`Hi ${pd.name},\n\n${contactForm.message}\n\nBest regards,\n${contactForm.name}\n${contactForm.email}`)
        window.open(`mailto:${pd.email}?subject=${subject}&body=${body}`)
        setContactSent(true)
        toast.success('Opening your email client...')
    }

    return (
        <div className={`min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-300 ${mode === 'dark' ? 'dark bg-[#0f0f0f] text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />
                </Helmet>
            )}

            {/* Left Pane - Sticky Hero */}
            <div className="lg:w-[45%] lg:sticky lg:top-0 lg:h-screen p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white relative overflow-hidden" style={{ backgroundColor: color }}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Top Section */}
                    <div>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black mb-8 shadow-lg border border-white/20">
                            {initials}
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4">
                            {pd.name}
                        </h1>
                        <h2 className="text-xl sm:text-2xl font-medium text-white/90 mb-6">
                            {pd.title}
                        </h2>
                        {pd.tagline && (
                            <p className="text-white/80 text-lg leading-relaxed max-w-md font-light">
                                {pd.tagline}
                            </p>
                        )}
                    </div>

                    {/* Bottom Section - Links & Stats */}
                    <div className="mt-12 lg:mt-auto space-y-8">
                        <div className="flex flex-col gap-3 text-sm font-medium text-white/90">
                            {pd.email && <a href={`mailto:${pd.email}`} className="flex items-center gap-3 hover:text-white transition-colors w-fit"><Mail className="w-4 h-4" /> {pd.email}</a>}
                            {pd.phone && <span className="flex items-center gap-3"><Phone className="w-4 h-4" /> {pd.phone}</span>}
                            {pd.location && <span className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {pd.location}</span>}
                        </div>

                        <div className="flex flex-wrap gap-4 pt-6 border-t border-white/20">
                            {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"><Github className="w-5 h-5" /></a>}
                            {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"><Linkedin className="w-5 h-5" /></a>}
                            {pd.website && <a href={pd.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white font-medium flex items-center gap-2"><Globe className="w-4 h-4" /> Website <ArrowUpRight className="w-3.5 h-3.5" /></a>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane - Scrolling Content */}
            <div className="lg:w-[55%] p-8 sm:p-12 lg:p-20 space-y-20 lg:space-y-32">

                {/* About */}
                {pd.summary && !hiddenSections.has('summary') && (
                    <section>
                        <SectionTitle title="About" icon={<User className="w-5 h-5" />} color={color} />
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                            {pd.summary}
                        </p>
                    </section>
                )}

                {/* Experience */}
                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section>
                        <SectionTitle title="Experience" icon={<Briefcase className="w-5 h-5" />} color={color} />
                        <div className="space-y-12">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="relative pl-6 sm:pl-8 border-l-2 border-gray-200 dark:border-gray-800 pb-2 border-opacity-50">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#0f0f0f]" style={{ backgroundColor: color }} />
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                                        <h3 className="text-xl font-bold dark:text-white text-gray-900">{exp.role}</h3>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full w-fit">{exp.duration}</span>
                                    </div>
                                    <h4 className="text-base font-semibold mb-4" style={{ color }}>{exp.company}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section>
                        <SectionTitle title="Select Work" icon={<Code2 className="w-5 h-5" />} color={color} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `rgba(${rgb},0.1)`, color }}>
                                            {proj.title?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex gap-2">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"><Github className="w-4 h-4" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"><ExternalLink className="w-4 h-4" /></a>}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:underline decoration-2 underline-offset-4" style={{ textDecorationColor: color }}>{proj.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed font-light">{proj.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {proj.tech?.map((t: string, j: number) => (
                                            <span key={j} className="text-[11px] font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section>
                        <SectionTitle title="Skills & Expertise" icon={<Code2 className="w-5 h-5" />} color={color} />
                        <div className="flex flex-wrap gap-2.5">
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {pd.education?.length > 0 && !hiddenSections.has('education') && (
                    <section>
                        <SectionTitle title="Education" icon={<GraduationCap className="w-5 h-5" />} color={color} />
                        <div className="space-y-6">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `rgba(${rgb},0.1)` }}>
                                        <GraduationCap className="w-5 h-5" style={{ color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{edu.degree}</h3>
                                        <p className="font-medium mt-1 mb-1" style={{ color }}>{edu.institution}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{edu.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contact Area */}
                {pd.email && !isPdf && !hiddenSections.has('contact') && (
                    <section className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative">
                        {/* Decorative blob */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: color }} />

                        <SectionTitle title="Get in touch" icon={<Send className="w-5 h-5" />} color={color} className="mb-8" />

                        {contactSent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ backgroundColor: `rgba(${rgb},0.1)` }}>
                                    <Check className="w-8 h-8" style={{ color }} />
                                </div>
                                <p className="text-xl font-bold dark:text-white mb-2">Message ready!</p>
                                <p className="text-gray-500 dark:text-gray-400">Your default email client has been opened.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleContactSubmit} className="space-y-4 relative z-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={contactForm.name}
                                            onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={contactForm.email}
                                            onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all"
                                            style={{ '--tw-ring-color': color } as React.CSSProperties}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Message</label>
                                    <textarea
                                        value={contactForm.message}
                                        onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all resize-none"
                                        style={{ '--tw-ring-color': color } as React.CSSProperties}
                                    />
                                </div>
                                <button type="submit"
                                    className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                                    style={{ backgroundColor: color, boxShadow: `0 10px 25px -5px rgba(${rgb},0.4)` }}>
                                    <Send className="w-4 h-4" /> Send Message
                                </button>
                            </form>
                        )}
                    </section>
                )}

                {/* Footer simple mark */}
                <div className="pt-20 pb-4 text-center">
                    <div className="w-10 h-1 rounded-full mx-auto" style={{ backgroundColor: `rgba(${rgb},0.2)` }} />
                    <p className="mt-6 text-xs text-gray-400 font-medium tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} {pd.name}
                    </p>
                </div>
            </div>
        </div>
    )
}

function SectionTitle({ title, icon, color, className = "" }: { title: string, icon: React.ReactNode, color: string, className?: string }) {
    return (
        <div className={`flex items-center gap-4 mb-10 ${className}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800" style={{ color }}>
                {icon}
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h2>
        </div>
    )
}
