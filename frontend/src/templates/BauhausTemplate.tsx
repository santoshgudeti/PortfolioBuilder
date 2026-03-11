import React from 'react'
import { ArrowDownRight, MapPin, Mail, Phone, ExternalLink, Globe } from 'lucide-react'
import { TemplateProps } from './types'

export default function BauhausTemplate({ pd, data, hiddenSections, rgb, mode }: TemplateProps) {
    const isDark = mode === 'dark'
    const bgColor = isDark ? '#111111' : '#f4f4f0'
    const fgColor = isDark ? '#ffffff' : '#000000'
    const primaryColor = data?.primary_color || '#e02424' // Default red for Bauhaus

    return (
        <div
            className="min-h-screen font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black"
            style={{ backgroundColor: bgColor, color: fgColor, fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
        >
            <div className="max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row relative">

                {/* Visual Anchor Line (Vertical) */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 mix-blend-difference z-0" style={{ backgroundColor: fgColor, opacity: 0.1 }}></div>

                {/* LEFT COLUMN - Header & Profile */}
                <div className="w-full md:w-1/2 md:min-h-screen p-6 md:p-12 lg:p-20 flex flex-col justify-between md:sticky md:top-0 h-auto md:h-screen relative z-10">

                    <div>
                        {/* Huge Typography Intro */}
                        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.85] mb-6 md:mb-12 break-words" style={{ letterSpacing: '-0.05em' }}>
                            {(pd.name || '').split(' ').filter(Boolean).map((n: string, i: number, arr: any[]) => (
                                <span key={i} className="block hover:translate-x-4 transition-transform duration-500" style={{ color: i === arr.length - 1 ? primaryColor : fgColor }}>
                                    {n}
                                </span>
                            ))}
                        </h1>

                        <div className="inline-block border-l-8 md:border-l-[12px] pl-4 md:pl-6 pb-2" style={{ borderColor: primaryColor }}>
                            <h2 className="text-xl md:text-3xl font-bold uppercase tracking-widest">{pd.tagline || pd.title}</h2>
                        </div>
                    </div>

                    <div className="mt-12 md:mt-0 flex flex-col gap-8">
                        {data?.avatar_url && (
                            <div className="w-48 h-48 md:w-64 md:h-64 object-cover grayscale mix-blend-luminosity hover:grayscale-0 hover:mix-blend-normal transition-all duration-700" style={{ boxShadow: `20px 20px 0 0 ${primaryColor}` }}>
                                <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex flex-col gap-2 font-medium text-sm md:text-base uppercase tracking-widest mt-8">
                            {pd.email && <a href={`mailto:${pd.email}`} className="hover:underline opacity-80 hover:opacity-100 transition-opacity flex items-center gap-3"><Mail className="w-5 h-5" /> {pd.email}</a>}
                            {pd.phone && <span className="opacity-80 flex items-center gap-3"><Phone className="w-5 h-5" /> {pd.phone}</span>}
                            {pd.location && <span className="opacity-80 flex items-center gap-3"><MapPin className="w-5 h-5" /> {pd.location}</span>}
                            {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80 hover:opacity-100 transition-opacity flex items-center gap-3"><Globe className="w-5 h-5" /> LINKEDIN</a>}
                            {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="hover:underline opacity-80 hover:opacity-100 transition-opacity flex items-center gap-3"><ExternalLink className="w-5 h-5" /> GITHUB</a>}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - Content */}
                <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-20 md:border-l-[10px] space-y-24 z-10" style={{ borderColor: primaryColor }}>

                    {/* Summary */}
                    {!hiddenSections.has('summary') && pd.summary && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-8 opacity-50 flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4" /> 01 // OVERVIEW
                            </h3>
                            <p className="text-xl md:text-3xl font-medium leading-snug lg:leading-normal" style={{ letterSpacing: '-0.02em' }}>
                                {pd.summary}
                            </p>

                            {!hiddenSections.has('skills') && pd.skills?.length > 0 && (
                                <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4">
                                    {pd.skills.map((skill: string, idx: number) => (
                                        <span key={skill} className="text-lg md:text-xl font-bold uppercase hover:-translate-y-1 transition-transform cursor-default flex items-center gap-2">
                                            <span style={{ color: primaryColor }} className="text-xs">{(idx + 1).toString().padStart(2, '0')}</span>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Experience */}
                    {!hiddenSections.has('experience') && pd.experience?.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-12 opacity-50 flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4" /> 02 // EXPERIENCE
                            </h3>
                            <div className="space-y-16">
                                {pd.experience.map((exp: any, i: number) => (
                                    <div key={i} className="group cursor-default relative pl-6 md:pl-8 border-l-4 transition-colors duration-300" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = primaryColor} onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#333' : '#e5e5e5'}>
                                        <div className="flex flex-col xl:flex-row xl:items-baseline justify-between gap-2 mb-4">
                                            <h4 className="text-2xl md:text-4xl font-black uppercase tracking-tight">{exp.role}</h4>
                                            <span className="text-sm md:text-base font-bold uppercase tracking-widest opacity-60 bg-black/5 dark:bg-white/10 px-3 py-1 w-fit">{exp.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mb-6 uppercase text-sm font-bold tracking-widest" style={{ color: primaryColor }}>
                                            <span>{exp.company}</span>
                                            {exp.location && <span>— {exp.location}</span>}
                                        </div>
                                        {exp.description && <p className="text-lg leading-relaxed opacity-80 whitespace-pre-wrap">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {!hiddenSections.has('projects') && pd.projects?.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-12 opacity-50 flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4" /> 03 // SELECTED WORKS
                            </h3>
                            <div className="space-y-12 md:space-y-16">
                                {pd.projects.map((proj: any, i: number) => (
                                    <div key={i} className="group flex flex-col p-8 border-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden bg-white/5 dark:bg-black/20" style={{ borderColor: fgColor }}>
                                        {/* Abstract Bauhaus geometric shapes background in hover */}
                                        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: primaryColor }} />
                                        <div className="absolute -left-10 -bottom-10 w-32 h-32 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rotate-45" style={{ backgroundColor: primaryColor }} />

                                        <div className="flex justify-between items-start mb-6">
                                            <h4 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none break-words relative z-10">{proj.title}</h4>
                                            {proj.url && (
                                                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-black dark:bg-white text-white dark:text-black hover:scale-110 transition-transform relative z-10 group-hover:bg-primary" style={{ backgroundColor: fgColor, color: bgColor }}>
                                                    <ExternalLink className="w-6 h-6" />
                                                </a>
                                            )}
                                        </div>
                                        {proj.tech && proj.tech.length > 0 && (
                                            <div className="mb-6 border-b-2 border-dashed pb-4 opacity-50 relative z-10 font-mono text-sm uppercase tracking-widest" style={{ borderColor: fgColor }}>
                                                {proj.tech.join(', ')}
                                            </div>
                                        )}
                                        <p className="text-lg leading-relaxed opacity-90 relative z-10">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {!hiddenSections.has('education') && pd.education?.length > 0 && (
                        <section className="pb-20">
                            <h3 className="text-sm font-bold uppercase tracking-[0.3em] mb-12 opacity-50 flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4" /> 04 // EDUCATION
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {pd.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex flex-col justify-between p-8 border-t-8 h-full bg-black/5 dark:bg-white/5" style={{ borderColor: i % 2 === 0 ? primaryColor : fgColor }}>
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-4">{edu.duration}</span>
                                            <h4 className="text-2xl font-black uppercase tracking-tight leading-none mb-4">{edu.degree}</h4>
                                            <p className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>{edu.institution}</p>
                                        </div>
                                        {edu.score && (
                                            <div className="mt-8 pt-4 border-t-2" style={{ borderColor: fgColor }}>
                                                <span className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">SCORE</span>
                                                <span className="text-xl font-black">{edu.score}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
            {/* Massive bottom marque/footer */}
            <div className="w-full border-t-8 py-6 md:py-12 overflow-hidden whitespace-nowrap bg-black dark:bg-white text-white dark:text-black" style={{ borderColor: primaryColor }}>
                <h2 className="text-4xl sm:text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-none px-4 inline-block hover:animate-pulse cursor-default">
                    {pd.name} // PORTFOLIO // {new Date().getFullYear()} //
                </h2>
            </div>
        </div>
    )
}
