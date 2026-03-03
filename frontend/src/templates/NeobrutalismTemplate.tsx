import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink, Briefcase, GraduationCap, Code2, ArrowUpRight } from 'lucide-react'
import { TemplateProps } from './types'

// Neobrutalism relies on thick borders, sharp shadows, and bold typography.
const NEO_BORDER = "border-4 border-black dark:border-white"
const NEO_SHADOW = "shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]"
const NEO_HOVER = "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_#000] dark:hover:shadow-[10px_10px_0_0_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:active:shadow-none transition-all"

export default function NeobrutalismTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {

    // We'll use a slightly off-white or light tone for backgrounds depending on the mode.
    // In neobrutalism, colors are usually very saturated, so the primary 'color' prop will be used heavily.
    const bgClass = mode === 'dark' ? 'bg-[#111] text-white' : 'bg-[#fffdf7] text-black'

    return (
        <div className={`min-h-screen font-sans ${bgClass}`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />
                </Helmet>
            )}

            {/* Decorative Top Bar */}
            <div className="h-4 w-full bg-black dark:bg-white border-b-4 border-black dark:border-white" />

            <div className="max-w-5xl mx-auto px-6 py-12 sm:py-20 space-y-16">

                {/* Hero section */}
                <header className={`relative p-8 sm:p-12 bg-white dark:bg-black ${NEO_BORDER} ${NEO_SHADOW}`} style={{ backgroundColor: mode === 'dark' ? '#000' : '#fff' }}>
                    {/* Decorative pinned elements */}
                    <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full border-4 border-black dark:border-white bg-[#ff5e5e] z-10" />
                    <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full border-4 border-black dark:border-white bg-[#5e96ff] z-10" />

                    <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                        <div className={`w-28 h-28 sm:w-40 sm:h-40 flex-shrink-0 flex items-center justify-center text-5xl sm:text-7xl font-black ${NEO_BORDER} ${NEO_SHADOW}`}
                            style={{ backgroundColor: color }}>
                            <span className="text-black">{initials}</span>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter leading-none mb-4">
                                {pd.name}
                            </h1>
                            <div className={`inline-block px-4 py-2 font-bold text-xl sm:text-2xl uppercase ${NEO_BORDER}`}
                                style={{ backgroundColor: color, color: '#000' }}>
                                {pd.title}
                            </div>
                            {pd.tagline && (
                                <p className="mt-6 text-xl sm:text-2xl font-bold uppercase leading-tight bg-yellow-300 text-black dark:bg-yellow-400 inline-box px-2">
                                    {pd.tagline}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-4 pt-8 border-t-4 border-black dark:border-white border-dashed">
                        {pd.email && <NeoButton href={`mailto:${pd.email}`} icon={<Mail />} text={pd.email} color="#ffb6ff" />}
                        {pd.phone && <NeoBadge icon={<Phone />} text={pd.phone} />}
                        {pd.location && <NeoBadge icon={<MapPin />} text={pd.location} />}
                        {pd.github && <NeoButton href={pd.github} icon={<Github />} text="GitHub" color="#b5ffb6" />}
                        {pd.linkedin && <NeoButton href={pd.linkedin} icon={<Linkedin />} text="LinkedIn" color="#b6f0ff" />}
                        {pd.website && <NeoButton href={pd.website} icon={<Globe />} text="Website" color={color} />}
                    </div>
                </header>

                {/* About */}
                {pd.summary && !hiddenSections.has('summary') && (
                    <section className="relative">
                        <SectionTitle title="ABOUT ME" color="#ff90e8" />
                        <div className={`p-8 bg-white dark:bg-black ${NEO_BORDER} ${NEO_SHADOW}`}>
                            <p className="text-xl sm:text-2xl font-bold leading-relaxed">
                                {pd.summary}
                            </p>
                        </div>
                    </section>
                )}

                {/* Experience */}
                {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                    <section>
                        <SectionTitle title="EXPERIENCE" color="#fff" bg={color} />
                        <div className="space-y-8">
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className={`p-6 sm:p-8 bg-white dark:bg-black ${NEO_BORDER} ${NEO_SHADOW} hover:-translate-y-1 transition-transform`}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-4 mb-4 pb-4 border-b-4 border-black dark:border-white">
                                        <div>
                                            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{exp.role}</h3>
                                            <div className="text-xl font-bold uppercase px-2 py-1 mt-2 inline-block" style={{ backgroundColor: color, color: '#000' }}>{exp.company}</div>
                                        </div>
                                        <div className={`px-4 py-2 font-bold uppercase border-4 border-black dark:border-white bg-[#e0e0e0] text-black w-fit whitespace-nowrap`}>
                                            {exp.duration}
                                        </div>
                                    </div>
                                    <p className="text-lg font-medium leading-relaxed">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <section>
                        <SectionTitle title="PROJECTS" color="#bdf4ff" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className={`flex flex-col h-full bg-white dark:bg-black ${NEO_BORDER} ${NEO_SHADOW}`}>
                                    <div className={`p-4 border-b-4 border-black dark:border-white flex justify-between items-center`} style={{ backgroundColor: i % 2 === 0 ? color : '#ffb6ff' }}>
                                        <h3 className="text-2xl font-black uppercase text-black overflow-hidden text-ellipsis whitespace-nowrap">{proj.title}</h3>
                                        <div className="flex gap-2 text-black">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-black hover:text-white rounded transition-colors"><Github className="w-6 h-6" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-black hover:text-white rounded transition-colors"><ExternalLink className="w-6 h-6" /></a>}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <p className="text-lg font-bold mb-6 flex-1">{proj.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {proj.tech?.map((t: string, j: number) => (
                                                <span key={j} className="px-3 py-1 text-sm font-black uppercase border-2 border-black dark:border-white bg-gray-100 text-black">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                    <section>
                        <SectionTitle title="SKILLS" color="#fff176" />
                        <div className={`p-8 bg-white dark:bg-black ${NEO_BORDER} ${NEO_SHADOW} flex flex-wrap gap-4`}>
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className={`px-4 py-2 text-lg font-black uppercase ${NEO_BORDER} bg-[#e0e0e0] text-black hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] transition-all cursor-default`}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {pd.education?.length > 0 && !hiddenSections.has('education') && (
                    <section>
                        <SectionTitle title="EDUCATION" color="#a5d6a7" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className={`p-6 bg-white dark:bg-black ${NEO_BORDER} ${NEO_SHADOW}`}>
                                    <div className="w-12 h-12 mb-4 border-4 border-black dark:border-white flex items-center justify-center bg-yellow-300">
                                        <GraduationCap className="text-black w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase mb-2">{edu.degree}</h3>
                                    <p className="text-lg font-bold" style={{ color }}>{edu.institution}</p>
                                    <div className="inline-block px-2 py-1 mt-3 border-2 border-black dark:border-white text-sm font-bold uppercase bg-[#e0e0e0] text-black">
                                        {edu.year}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="pt-12 pb-8 border-t-8 border-black dark:border-white border-dashed text-center">
                    <p className="text-2xl font-black uppercase">&copy; {new Date().getFullYear()} {pd.name}</p>
                </div>
            </div>
        </div>
    )
}

function SectionTitle({ title, color, bg = "white" }: { title: string, color: string, bg?: string }) {
    return (
        <div className={`inline-block px-6 py-3 mb-8 ${NEO_BORDER} ${NEO_SHADOW}`} style={{ backgroundColor: bg }}>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter" style={{ color: bg !== 'white' ? color : 'black' }}>
                {title}
            </h2>
        </div>
    )
}

function NeoButton({ href, icon, text, color }: { href: string, icon: React.ReactNode, text: string, color: string }) {
    return (
        <a href={href}
            target={href.startsWith('http') ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 font-black uppercase text-black ${NEO_BORDER} ${NEO_HOVER}`}
            style={{ backgroundColor: color }}>
            {icon}
            {text}
        </a>
    )
}

function NeoBadge({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <span className={`flex items-center gap-2 px-4 py-2 font-black uppercase text-black ${NEO_BORDER} bg-[#e0e0e0]`}>
            {icon}
            {text}
        </span>
    )
}
