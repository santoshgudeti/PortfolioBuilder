import React from 'react'
import { Cpu, Zap, MapPin, Mail, Phone, ExternalLink, Globe, Target, Terminal as TerminalIcon, ShieldAlert } from 'lucide-react'
import { TemplateProps } from './types'

export default function CyberpunkTemplate({ pd, data, hiddenSections, rgb, mode }: TemplateProps) {
    const isDark = mode === 'dark' || true; // Force dark mode aesthetic for Cyberpunk if we want, but let's respect mode by tweaking opacity/background

    // Core Cyberpunk Colors
    const primaryStr = data?.primary_color || '#f000ff'
    const cyanStr = '#00ffff'
    const yellowStr = '#ffeb3b'

    const bgBase = mode === 'dark' ? '#050510' : '#101018' // Always quite dark for the neon to pop

    return (
        <div
            className="min-h-screen font-mono relative overflow-x-hidden selection:bg-[#f000ff] selection:text-white pb-20"
            style={{
                backgroundColor: bgBase,
                backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
                color: '#e0e0e0'
            }}
        >
            {/* Header / Nav Grid */}
            <header className="sticky top-0 inset-x-0 h-16 border-b-2 border-[#00ffff] bg-[#050510]/90 backdrop-blur-md z-50 flex items-center px-4 md:px-8 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                <div className="flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-[#00ffff] animate-pulse" />
                    <h1 className="font-bold text-lg md:text-2xl tracking-[0.2em] text-[#00ffff] uppercase animate-pulse">
                        sys.{pd.name?.split(' ')[0] || 'USER'}
                    </h1>
                </div>
                <div className="ml-auto hidden md:flex items-center gap-6 text-xs tracking-widest text-[#f000ff] uppercase font-bold">
                    <span className="hover:text-[#00ffff] transition-colors cursor-crosshair">STATUS: INFO</span>
                    {!hiddenSections.has('experience') && <span className="hover:text-[#00ffff] transition-colors cursor-crosshair">SYS_LOG</span>}
                    {!hiddenSections.has('projects') && <span className="hover:text-[#00ffff] transition-colors cursor-crosshair">MODULES</span>}
                    {!hiddenSections.has('education') && <span className="hover:text-[#00ffff] transition-colors cursor-crosshair">TRAINING</span>}
                </div>
            </header>

            <main className="pt-24 md:pt-32 px-4 md:px-12 max-w-[1200px] mx-auto space-y-12 md:space-y-24">

                {/* HERO SECTION */}
                <section className="relative w-full">
                    {/* Decorative cyber elements */}
                    <div className="absolute -left-4 -top-4 w-8 h-8 border-t-2 border-l-2 border-[#ffeb3b] opacity-70" />
                    <div className="absolute -right-4 -top-4 w-8 h-8 border-t-2 border-r-2 border-[#ffeb3b] opacity-70" />
                    <div className="absolute -left-4 -bottom-4 w-8 h-8 border-b-2 border-l-2 border-[#ffeb3b] opacity-70" />
                    <div className="absolute -right-4 -bottom-4 w-8 h-8 border-b-2 border-r-2 border-[#ffeb3b] opacity-70" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/40 p-8 md:p-12 border border-[#f000ff]/30 shadow-[inset_0_0_30px_rgba(240,0,255,0.1)] relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}>

                        {/* Glitch Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#f000ff]/10 to-[#00ffff]/10 mix-blend-overlay pointer-events-none" />

                        <div className="lg:col-span-8 flex flex-col gap-4 relative z-10">
                            <div className="inline-block bg-[#ffeb3b] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest w-max mb-2">
                                INIT SEQUENCE //
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white" style={{ textShadow: `0 0 10px ${primaryStr}, 2px 2px 0px #00ffff, -2px -2px 0px ${primaryStr}` }}>
                                {pd.name}
                            </h2>
                            <h3 className="text-xl md:text-2xl text-[#00ffff] font-medium tracking-widest uppercase mb-4">
                                {pd.tagline || pd.title || "Netrunner // Dev"}
                            </h3>

                            {!hiddenSections.has('summary') && pd.summary && (
                                <p className="text-sm md:text-base text-gray-300 leading-relaxed border-l-2 border-[#f000ff] pl-4">
                                    {pd.summary}
                                </p>
                            )}

                            {/* Contact Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                {pd.email && <div className="flex items-center gap-3 text-sm text-gray-400"><Mail className="w-4 h-4 text-[#00ffff]" /> <span className="hover:text-white transition-colors cursor-crosshair">{pd.email}</span></div>}
                                {pd.phone && <div className="flex items-center gap-3 text-sm text-gray-400"><Phone className="w-4 h-4 text-[#00ffff]" /> <span className="hover:text-white transition-colors cursor-crosshair">{pd.phone}</span></div>}
                                {pd.location && <div className="flex items-center gap-3 text-sm text-gray-400"><MapPin className="w-4 h-4 text-[#00ffff]" /> <span className="hover:text-white transition-colors cursor-crosshair">{pd.location}</span></div>}
                                {pd.linkedin && <div className="flex items-center gap-3 text-sm text-gray-400"><Globe className="w-4 h-4 text-[#00ffff]" /> <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors hover:underline cursor-crosshair">LINK_NET</a></div>}
                            </div>
                        </div>

                        {data?.avatar_url && (
                            <div className="lg:col-span-4 flex justify-center lg:justify-end relative z-10">
                                <div className="relative w-48 h-48 md:w-64 md:h-64">
                                    <div className="absolute inset-0 bg-[#00ffff] rounded-full translate-x-2 translate-y-2 mix-blend-screen opacity-50 blur-sm animate-pulse" />
                                    <div className="absolute inset-0 bg-[#f000ff] rounded-full -translate-x-2 -translate-y-2 mix-blend-screen opacity-50 blur-sm animate-pulse" />
                                    <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover rounded-full border-2 border-white relative z-10 filter contrast-125 saturate-150" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Skill chips directly attached to hero base */}
                    {!hiddenSections.has('skills') && pd.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                            {pd.skills.map((skill: string) => (
                                <span key={skill} className="px-3 py-1 bg-black/60 border border-[#00ffff]/50 text-[#00ffff] text-xs font-bold uppercase tracking-widest hover:bg-[#00ffff] hover:text-black transition-colors cursor-crosshair shadow-[0_0_5px_rgba(0,255,255,0.2)]">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* EXPERIENCE SECTION */}
                {!hiddenSections.has('experience') && pd.experience?.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white" style={{ textShadow: `0 0 10px ${primaryStr}` }}>SYS_LOG</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-[#f000ff] to-transparent" />
                        </div>
                        <div className="space-y-6">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className="group relative bg-[#0a0a0f] border border-gray-800 hover:border-[#f000ff] p-6 transition-colors shadow-lg" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-[#f000ff]/10 group-hover:bg-[#f000ff] transition-colors" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#00ffff] uppercase flex items-center gap-2">
                                                <TerminalIcon className="w-5 h-5" /> {exp.role}
                                            </h3>
                                            <p className="text-white font-bold mt-1 tracking-wider">{exp.company}</p>
                                        </div>
                                        <div className="flex flex-col md:items-end text-sm text-[#ffeb3b] font-bold tracking-widest">
                                            <span>[ {exp.duration} ]</span>
                                            {exp.location && <span className="text-gray-500 mt-1 uppercase">{exp.location}</span>}
                                        </div>
                                    </div>
                                    {exp.description && <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* PROJECTS SECTION */}
                {!hiddenSections.has('projects') && pd.projects?.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-gradient-to-l from-[#00ffff] to-transparent" />
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white" style={{ textShadow: `0 0 10px #00ffff` }}>MODULES</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className="group flex flex-col bg-black border border-[#00ffff]/30 hover:border-[#00ffff] p-6 transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-[#f000ff] uppercase">{proj.title}</h3>
                                        {proj.url ? (
                                            <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-[#00ffff] hover:text-white transition-colors">
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        ) : (
                                            <Target className="w-5 h-5 text-gray-700" />
                                        )}
                                    </div>
                                    {proj.tech && proj.tech.length > 0 && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <Zap className="w-3.5 h-3.5 text-[#ffeb3b]" />
                                            <span className="text-xs text-[#ffeb3b] font-bold tracking-widest">{proj.tech.join(', ')}</span>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-6">{proj.description}</p>

                                    {/* Tech details bar bottom */}
                                    <div className="w-full h-1 bg-gray-900 overflow-hidden relative mt-auto">
                                        <div className="absolute inset-y-0 left-0 bg-[#00ffff] w-1/3 group-hover:w-full transition-all duration-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* EDUCATION SECTION */}
                {!hiddenSections.has('education') && pd.education?.length > 0 && (
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white" style={{ textShadow: `0 0 10px ${yellowStr}` }}>TRAINING</h2>
                            <div className="h-px w-24 bg-[#ffeb3b]" />
                        </div>
                        <div className="space-y-4">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111] border border-gray-800 p-6 hover:border-[#ffeb3b] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#ffeb3b]/10 flex items-center justify-center border border-[#ffeb3b]/30">
                                            <ShieldAlert className="w-6 h-6 text-[#ffeb3b]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white uppercase">{edu.degree}</h3>
                                            <p className="text-sm text-gray-400 font-bold tracking-widest">{edu.institution}</p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-[#ffeb3b] pl-4 md:pl-0 md:pr-4">
                                        <p className="text-sm text-[#00ffff] font-bold tracking-widest">[ {edu.year} ]</p>
                                        {edu.score && <p className="text-xs text-gray-500 mt-1 uppercase">SCORE // {edu.score}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}
