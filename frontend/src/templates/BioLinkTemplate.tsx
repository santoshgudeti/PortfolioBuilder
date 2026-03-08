import React, { useState } from 'react'
import { Mail, Phone, MapPin, Globe, ExternalLink, Briefcase, GraduationCap, ChevronDown, CheckCircle2 } from 'lucide-react'
import { TemplateProps } from './types'

export default function BioLinkTemplate({ pd, data, hiddenSections, rgb, mode }: TemplateProps) {
    const isDark = mode === 'dark'
    const primaryColor = data?.primary_color || '#3b82f6'

    // Accordion state
    const [openExp, setOpenExp] = useState<boolean>(!hiddenSections.has('experience'))
    const [openEdu, setOpenEdu] = useState<boolean>(false)
    const [openSummary, setOpenSummary] = useState<boolean>(!hiddenSections.has('summary'))

    return (
        <div
            className="min-h-screen font-sans selection:bg-brand-500 selection:text-white"
            style={{
                background: isDark
                    ? `radial-gradient(circle at 50% 0%, rgba(${rgb}, 0.15) 0%, #0a0a0a 50%, #000000 100%)`
                    : `radial-gradient(circle at 50% 0%, rgba(${rgb}, 0.1) 0%, #f3f4f6 50%, #ffffff 100%)`,
                color: isDark ? '#ffffff' : '#111827'
            }}
        >
            {/* Mobile constraints strictly applied even on desktop */}
            <div className="max-w-[480px] mx-auto min-h-screen px-4 py-12 md:py-20 flex flex-col items-center">

                {/* Profile Header */}
                <header className="flex flex-col items-center text-center mb-8 relative w-full">
                    {/* Share icon top right */}
                    <button
                        className="absolute right-0 top-0 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title: pd.name, text: pd.tagline, url: window.location.href })
                            } else {
                                navigator.clipboard.writeText(window.location.href)
                                alert('Link copied to clipboard!')
                            }
                        }}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </button>

                    {data?.avatar_url ? (
                        <div className="w-28 h-28 rounded-full shadow-xl overflow-hidden mb-5 border-4 border-white dark:border-gray-800" style={{ boxShadow: `0 10px 25px -5px rgba(${rgb}, 0.3)` }}>
                            <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-28 h-28 rounded-full shadow-xl mb-5 border-4 border-white dark:border-gray-800 flex items-center justify-center text-4xl font-bold bg-gray-100 dark:bg-gray-800" style={{ color: primaryColor, boxShadow: `0 10px 25px -5px rgba(${rgb}, 0.3)` }}>
                            {pd.name?.charAt(0)}
                        </div>
                    )}

                    <h1 className="text-2xl font-bold mb-1 tracking-tight">{pd.name}</h1>
                    <p className="text-sm font-medium opacity-80 mb-4 px-4">{pd.tagline || pd.title}</p>

                    {/* Social/Contact Row */}
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {pd.email && (
                            <a href={`mailto:${pd.email}`} className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform" style={{ color: primaryColor }}>
                                <Mail className="w-5 h-5" />
                            </a>
                        )}
                        {pd.phone && (
                            <a href={`tel:${pd.phone}`} className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform" style={{ color: primaryColor }}>
                                <Phone className="w-5 h-5" />
                            </a>
                        )}
                        {pd.linkedin && (
                            <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform" style={{ color: primaryColor }}>
                                <Globe className="w-5 h-5" />
                            </a>
                        )}
                        {pd.location && (
                            <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 tooltip">
                                <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                            </div>
                        )}
                    </div>
                </header>

                <main className="w-full space-y-4 flex flex-col items-center">

                    {/* Summary (Accordion) */}
                    {!hiddenSections.has('summary') && pd.summary && (
                        <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setOpenSummary(!openSummary)}
                                className="w-full flex items-center justify-between p-5 text-left font-semibold"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900" style={{ color: primaryColor }}>ℹ️</span>
                                    About Me
                                </span>
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openSummary ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`transition-all duration-500 ease-in-out ${openSummary ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-5 pb-5 pt-1 text-sm leading-relaxed opacity-80 whitespace-pre-wrap">
                                    {pd.summary}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Skills Chips */}
                    {!hiddenSections.has('skills') && pd.skills?.length > 0 && (
                        <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                            <div className="flex flex-wrap justify-center gap-2">
                                {pd.skills.map((skill: string) => (
                                    <span key={skill} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: primaryColor }} /> {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects (Big Link Buttons) */}
                    {!hiddenSections.has('projects') && pd.projects?.length > 0 && (
                        <div className="w-full space-y-3 mt-4 mb-4">
                            <h2 className="text-center text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Featured Work</h2>
                            {pd.projects.map((proj: any, i: number) => (
                                <a
                                    key={i}
                                    href={proj.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full group relative overflow-hidden bg-white dark:bg-[#1a1a1a] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                                >
                                    {/* Hover gradient background trick */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: primaryColor }} />

                                    <div className="p-5 flex items-center justify-between">
                                        <div className="pr-4">
                                            <h3 className="font-bold text-base mb-1">{proj.title}</h3>
                                            <p className="text-xs opacity-60 line-clamp-2">{proj.description}</p>
                                        </div>
                                        <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 shadow-inner group-hover:rotate-45 transition-all duration-300" style={{ color: primaryColor }}>
                                            <ExternalLink className="w-4 h-4" />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Experience (Accordion) */}
                    {!hiddenSections.has('experience') && pd.experience?.length > 0 && (
                        <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setOpenExp(!openExp)}
                                className="w-full flex items-center justify-between p-5 text-left font-semibold"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900" style={{ color: primaryColor }}>
                                        <Briefcase className="w-4 h-4" />
                                    </span>
                                    Experience
                                </span>
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openExp ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`transition-all duration-500 ease-in-out ${openExp ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-5 pb-5 pt-1 space-y-6">
                                    {pd.experience.map((exp: any, i: number) => (
                                        <div key={i} className="relative pl-6 border-l-2" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
                                            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                                            <h4 className="font-bold text-sm">{exp.role}</h4>
                                            <p className="text-xs font-semibold opacity-80 mt-0.5" style={{ color: primaryColor }}>{exp.company}</p>
                                            <p className="text-xs opacity-50 mt-1">{exp.duration} {exp.location && `• ${exp.location}`}</p>
                                            {exp.description && <p className="text-xs opacity-70 mt-2 leading-relaxed">{exp.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Education (Accordion) */}
                    {!hiddenSections.has('education') && pd.education?.length > 0 && (
                        <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 mt-4">
                            <button
                                onClick={() => setOpenEdu(!openEdu)}
                                className="w-full flex items-center justify-between p-5 text-left font-semibold"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-900" style={{ color: primaryColor }}>
                                        <GraduationCap className="w-4 h-4" />
                                    </span>
                                    Education
                                </span>
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openEdu ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`transition-all duration-500 ease-in-out ${openEdu ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-5 pb-5 pt-1 space-y-4">
                                    {pd.education.map((edu: any, i: number) => (
                                        <div key={i} className="flex flex-col border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                                            <h4 className="font-bold text-sm">{edu.degree}</h4>
                                            <p className="text-xs font-semibold opacity-80 mt-0.5" style={{ color: primaryColor }}>{edu.institution}</p>
                                            <div className="flex justify-between items-end mt-2">
                                                <p className="text-xs opacity-50">{edu.year}</p>
                                                {edu.score && <p className="text-xs font-bold px-2 py-1 bg-gray-50 dark:bg-gray-800 rounded-md">Score: {edu.score}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </main>

                <footer className="mt-12 text-center opacity-40 text-xs flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold">PB</span>
                    </div>
                    {pd.name} • {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    )
}
