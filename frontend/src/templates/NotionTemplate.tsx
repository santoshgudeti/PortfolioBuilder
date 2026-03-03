import { Helmet } from 'react-helmet-async'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Code2, FileText, ChevronRight
} from 'lucide-react'
import { TemplateProps } from './types'

export default function NotionTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {

    // Notion uses a distinct, clean monochrome look with a single central column.
    const isDark = mode === 'dark'
    const bgClass = isDark ? 'bg-[#191919] text-[#rgba(255,255,255,0.81)]' : 'bg-white text-[#37352f]'
    const subtleBg = isDark ? 'hover:bg-[#2f2f2f]' : 'hover:bg-[#f1f1ef]'
    const subtleBorder = isDark ? 'border-[#373737]' : 'border-[#eaeaeb]'
    const mutedText = isDark ? 'text-[#9b9b9b]' : 'text-[#787774]'

    return (
        <div className={`min-h-screen font-sans ${bgClass} selection:bg-blue-200 dark:selection:bg-blue-900`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name}</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />
                </Helmet>
            )}

            {/* Top Cover Image Placeholder */}
            <div className="w-full h-48 sm:h-64 object-cover" style={{ backgroundColor: `rgba(${rgb}, 0.15)` }}>
                <div className="w-full h-full flex items-center justify-center opacity-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                        <polygon points="0,100 100,0 100,100" fill={color} />
                    </svg>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">

                {/* Hero / Page Title */}
                <div className="relative -mt-16 sm:-mt-20 mb-8 z-10">
                    <div className="text-[78px] leading-[1] mb-2 select-none" style={{ color }}>
                        {/* Fake emoji icon just to give that Notion feel, using initials as fallback */}
                        {initials}
                    </div>
                    <h1 className="text-4xl sm:text-[40px] font-bold tracking-tight mb-2 text-gray-900 dark:text-gray-100">
                        {pd.name}
                    </h1>
                    {pd.tagline && (
                        <p className={`text-xl font-medium ${mutedText}`}>
                            {pd.tagline}
                        </p>
                    )}
                </div>

                {/* Properties / Meta data */}
                <div className={`space-y-2 mb-10 pb-8 border-b ${subtleBorder} text-sm`}>
                    {pd.email && <PropertyRow label="Email" value={<a href={`mailto:${pd.email}`} className="underline decoration-gray-300 dark:decoration-gray-600 hover:text-blue-500">{pd.email}</a>} icon={<Mail className="w-4 h-4" />} isDark={isDark} />}
                    {pd.phone && <PropertyRow label="Phone" value={pd.phone} icon={<Phone className="w-4 h-4" />} isDark={isDark} />}
                    {pd.location && <PropertyRow label="Location" value={pd.location} icon={<MapPin className="w-4 h-4" />} isDark={isDark} />}
                    {pd.title && <PropertyRow label="Role" value={<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">{pd.title}</span>} icon={<FileText className="w-4 h-4" />} isDark={isDark} />}

                    <div className="flex gap-2 pt-2">
                        {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${subtleBg} ${mutedText}`}><Github className="w-4 h-4" /> Github</a>}
                        {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${subtleBg} ${mutedText}`}><Linkedin className="w-4 h-4" /> LinkedIn</a>}
                        {pd.website && <a href={pd.website} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${subtleBg} ${mutedText}`}><Globe className="w-4 h-4" /> Website</a>}
                    </div>
                </div>

                {/* Blocks */}
                <div className="space-y-12">

                    {/* About */}
                    {pd.summary && !hiddenSections.has('summary') && (
                        <div>
                            <BlockHeader title="About" color={color} isDark={isDark} />
                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                                {pd.summary}
                            </p>
                        </div>
                    )}

                    {/* Experience */}
                    {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                        <div>
                            <BlockHeader title="Experience" color={color} isDark={isDark} />
                            <div className="space-y-6">
                                {pd.experience.map((exp: any, i: number) => (
                                    <div key={i} className="group flex gap-2">
                                        <div className="pt-1 select-none">
                                            <ChevronRight className={`w-4 h-4 transition-transform group-hover:text-gray-900 dark:group-hover:text-gray-100 ${mutedText}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{exp.role}</h3>
                                                <div className={`text-sm ${mutedText}`}>{exp.duration}</div>
                                            </div>
                                            <div className={`font-medium mb-2`} style={{ color }}>{exp.company}</div>
                                            <p className="leading-relaxed whitespace-pre-wrap">
                                                {exp.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                        <div>
                            <BlockHeader title="Projects" color={color} isDark={isDark} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pd.projects.map((proj: any, i: number) => (
                                    <div key={i} className={`p-4 rounded-lg border transition-all cursor-default ${subtleBg} ${subtleBorder}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: color }}>
                                                    {proj.title?.[0]?.toUpperCase()}
                                                </div>
                                                {proj.title}
                                            </h3>
                                            <div className="flex gap-2 text-gray-400">
                                                {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-gray-100"><Github className="w-4 h-4" /></a>}
                                                {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-gray-100"><ExternalLink className="w-4 h-4" /></a>}
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed mb-4">{proj.description}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {proj.tech?.map((t: string, j: number) => (
                                                <span key={j} className={`text-xs px-1.5 py-0.5 rounded bg-gray-200/50 dark:bg-gray-800/50 ${mutedText}`}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skills */}
                    {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                        <div>
                            <BlockHeader title="Skills" color={color} isDark={isDark} />
                            <div className="flex flex-wrap gap-2">
                                {pd.skills.map((skill: string, i: number) => (
                                    <div key={i} className={`px-2 py-1 rounded text-sm ${isDark ? 'bg-[#373737]' : 'bg-[#eaeaeb]'}`}>
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {pd.education?.length > 0 && !hiddenSections.has('education') && (
                        <div>
                            <BlockHeader title="Education" color={color} isDark={isDark} />
                            <div className="space-y-4">
                                {pd.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="pt-1 select-none">
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} style={{ backgroundColor: color }} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">{edu.degree}</div>
                                            <div className="flex gap-2 items-center text-sm">
                                                <span>{edu.institution}</span>
                                                <span className={mutedText}>•</span>
                                                <span className={mutedText}>{edu.year}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`mt-24 pt-8 text-center text-xs ${mutedText} border-t ${subtleBorder}`}>
                    Based on Notion aesthetic.
                </div>
            </div>
        </div>
    )
}

function BlockHeader({ title, color, isDark }: { title: string, color: string, isDark: boolean }) {
    return (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-1 group flex items-center border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors w-fit">
            <span className={`mr-2 select-none opacity-0 group-hover:opacity-100 transition-opacity text-xl text-gray-400`} style={{ color }}>⠿</span>
            {title}
        </h2>
    )
}

function PropertyRow({ label, value, icon, isDark }: { label: string, value: React.ReactNode, icon: React.ReactNode, isDark: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-1">
            <div className={`w-32 flex items-center gap-2 ${isDark ? 'text-[#9b9b9b]' : 'text-[#787774]'} select-none`}>
                <span className="opacity-70">{icon}</span>
                {label}
            </div>
            <div className="flex-1 text-gray-900 dark:text-gray-100 min-w-0 truncate">
                {value}
            </div>
        </div>
    )
}
