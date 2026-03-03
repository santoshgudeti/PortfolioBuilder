import React, { useState } from 'react'
import { Folder, Terminal as TerminalIcon, FileText, Briefcase, Code, MapPin, Mail, Phone, ExternalLink, Globe, Wifi, Battery, Search } from 'lucide-react'
import { TemplateProps } from './types'


interface WindowProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    isActive: boolean;
    onClick: () => void;
}

const MacWindow = ({ title, children, className = '', isActive, onClick }: WindowProps) => (
    <div
        onClick={onClick}
        className={`flex flex-col rounded-xl overflow-hidden shadow-2xl backdrop-blur-[20px] bg-white/70 dark:bg-[#1e1e1e]/80 transition-all duration-300 border border-white/40 dark:border-white/10 ${isActive ? 'z-20 scale-100 shadow-[0_30px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.8)]' : 'z-10 scale-[0.98] opacity-80 hover:opacity-100'} ${className}`}
    >
        <div className="h-8 md:h-10 bg-gradient-to-b from-white/60 to-white/40 dark:from-white/10 dark:to-white/5 border-b border-black/5 dark:border-black/50 flex items-center px-4 cursor-pointer select-none">
            <div className="flex gap-2 w-16">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:bg-[#ff5f56]/80 flex items-center justify-center group"><span className="text-black/50 text-[8px] opacity-0 group-hover:opacity-100">✕</span></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer hover:bg-[#ffbd2e]/80 flex items-center justify-center group"><span className="text-black/50 text-[8px] opacity-0 group-hover:opacity-100">−</span></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer hover:bg-[#27c93f]/80 flex items-center justify-center group"><span className="text-black/50 text-[8px] opacity-0 group-hover:opacity-100">⤢</span></div>
            </div>
            <div className="flex-1 text-center text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 truncate px-2">
                {title}
            </div>
            <div className="w-16"></div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar text-gray-800 dark:text-gray-100 relative">
            {children}
        </div>
    </div>
)

export default function AppleDesktopTemplate({ pd, data, hiddenSections, isPdf, rgb, mode }: TemplateProps) {
    const [activeWindow, setActiveWindow] = useState<string>('about')
    const [currentTime, setCurrentTime] = useState(new Date())

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    const bgImage = mode === 'dark'
        ? "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')"
        : "url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop')"

    return (
        <div className="min-h-screen font-sans overflow-x-hidden relative" style={{ backgroundImage: bgImage, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

            {/* Top Menu Bar */}
            <div className="fixed top-0 inset-x-0 h-6 md:h-7 bg-white/30 dark:bg-black/30 backdrop-blur-md flex items-center justify-between px-2 md:px-4 z-50 text-[11px] md:text-xs font-medium text-gray-900 dark:text-gray-100 border-b border-white/20 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-sm"></span>
                    <span className="font-bold cursor-default hidden md:block">Finder</span>
                    <span className="cursor-default hidden md:block">File</span>
                    <span className="cursor-default hidden md:block">Edit</span>
                    <span className="cursor-default hidden md:block">View</span>
                    <span className="cursor-default hidden md:block">Go</span>
                    <span className="cursor-default hidden md:block">Window</span>
                    <span className="cursor-default hidden md:block">Help</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <Battery className="w-3.5 h-3.5 hidden sm:block" />
                    <Wifi className="w-3.5 h-3.5 hidden sm:block" />
                    <Search className="w-3.5 h-3.5" />
                    <span className="cursor-default">{dateFormatter.format(currentTime)}  {timeFormatter.format(currentTime)}</span>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className={`pt-12 pb-24 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen ${isPdf ? 'grid grid-cols-1 gap-8' : 'flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative'}`}>

                {/* About & Skills Window - Always on left or top */}
                <MacWindow
                    title={`${pd.name} — Profile`}
                    isActive={activeWindow === 'about'}
                    onClick={() => setActiveWindow('about')}
                    className={`w-full lg:w-[400px] xl:w-[450px] shrink-0 ${isPdf ? '' : 'lg:sticky lg:top-12'}`}
                >
                    <div className="p-6 md:p-8 flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full border-4 border-white/50 dark:border-white/10 shadow-lg mb-6 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center">
                            {data?.avatar_url ? (
                                <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold text-gray-400 dark:text-gray-500">{pd.name?.charAt(0)}</span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight mb-2 text-gray-900 dark:text-white">{pd.name}</h1>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-6 bg-black/5 dark:bg-white/10 px-4 py-1.5 rounded-full inline-block">
                            {pd.headline || "Professional Portfolio"}
                        </p>

                        {/* Contact info grid */}
                        <div className="w-full grid grid-cols-1 gap-3 text-sm text-left bg-white/50 dark:bg-black/40 p-5 rounded-xl border border-white/40 dark:border-white/5 shadow-inner mb-6">
                            {pd.contact?.email && (
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <Mail className="w-4 h-4 text-blue-500" />
                                    <a href={`mailto:${pd.contact.email}`} className="hover:underline truncate">{pd.contact.email}</a>
                                </div>
                            )}
                            {pd.contact?.phone && (
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <Phone className="w-4 h-4 text-green-500" />
                                    <span>{pd.contact.phone}</span>
                                </div>
                            )}
                            {pd.contact?.location && (
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    <span>{pd.contact.location}</span>
                                </div>
                            )}
                            {pd.contact?.linkedin && (
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                                    <Globe className="w-4 h-4 text-indigo-500" />
                                    <a href={pd.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400 truncate">LinkedIn Profile</a>
                                </div>
                            )}
                        </div>

                        {!hiddenSections.has('summary') && pd.summary && (
                            <div className="text-left w-full mb-6">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">About Info.txt</h3>
                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-black/20 p-4 rounded-xl shadow-sm border border-white/50 dark:border-white/5">{pd.summary}</p>
                            </div>
                        )}

                        {!hiddenSections.has('skills') && pd.skills?.length > 0 && (
                            <div className="text-left w-full mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Skills Configuration</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pd.skills.map((skill: string) => (
                                        <span key={skill} className="px-3 py-1.5 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 text-xs font-medium rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                                            <Code className="w-3 h-3 text-[rgba(var(--template-color))] opacity-70" />
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </MacWindow>

                {/* Main Content Windows */}
                <div className={`flex-1 flex flex-col gap-6 lg:gap-8 ${isPdf ? '' : 'pb-20'}`}>

                    {!hiddenSections.has('experience') && pd.experience?.length > 0 && (
                        <MacWindow
                            title="Terminal — Experience log"
                            isActive={activeWindow === 'experience'}
                            onClick={() => setActiveWindow('experience')}
                            className="w-full text-gray-900 bg-[#fbfbfb]/90 dark:bg-[#1a1b26]/90" // Slightly different bg to mimic different apps
                        >
                            <div className="p-6 md:p-8 space-y-8">
                                {pd.experience.map((exp: any, i: number) => (
                                    <div key={i} className="relative pl-6 md:pl-8 border-l-2 border-gray-200 dark:border-gray-800 group">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white dark:bg-gray-900 rounded-full border-4 border-gray-300 dark:border-gray-700 group-hover:border-[rgba(var(--template-color))] transition-colors" />
                                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-2 gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-[rgba(var(--template-color))]" />
                                                    {exp.role}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{exp.company}</span>
                                                    {exp.location && <span>• {exp.location}</span>}
                                                </p>
                                            </div>
                                            <div className="inline-flex bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md text-xs font-mono text-gray-500 whitespace-nowrap shadow-inner border border-gray-200/50 dark:border-gray-700/50 h-fit">
                                                {exp.duration}
                                            </div>
                                        </div>
                                        {exp.description && <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line mt-3">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </MacWindow>
                    )}

                    {!hiddenSections.has('projects') && pd.projects?.length > 0 && (
                        <MacWindow
                            title="Safari — Projects"
                            isActive={activeWindow === 'projects'}
                            onClick={() => setActiveWindow('projects')}
                            className="w-full bg-[#f4f5f5]/90 dark:bg-[#202124]/90"
                        >
                            <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {pd.projects.map((proj: any, i: number) => (
                                    <a key={i} href={proj.link || '#'} target="_blank" rel="noopener noreferrer" className="group block h-full">
                                        <div className="h-full bg-white dark:bg-[#2d2e30] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                                    <Folder className="w-5 h-5 fill-current opacity-20" />
                                                </div>
                                                {proj.link && <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{proj.name}</h3>
                                            {proj.technologies && (
                                                <p className="text-xs font-mono text-[rgba(var(--template-color))] dark:text-[rgba(var(--template-color))] opacity-80 mb-3">{proj.technologies}</p>
                                            )}
                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">{proj.description}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </MacWindow>
                    )}

                    {!hiddenSections.has('education') && pd.education?.length > 0 && (
                        <MacWindow
                            title="Notes — Education"
                            isActive={activeWindow === 'education'}
                            onClick={() => setActiveWindow('education')}
                            className="w-full bg-[#fffcb5]/90 dark:bg-[#322f20]/90" // Yellowish notes app vibe
                        >
                            <div className="p-6 md:p-8 space-y-6">
                                {pd.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex flex-col md:flex-row justify-between border-b border-black/5 dark:border-white/5 pb-6 last:border-0 last:pb-0">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{edu.degree}</h3>
                                            <p className="font-medium text-gray-700 dark:text-gray-300">{edu.institution}</p>
                                        </div>
                                        <div className="mt-2 md:mt-0 text-left md:text-right">
                                            <span className="inline-block bg-white/50 dark:bg-black/30 px-3 py-1 rounded-full text-xs font-mono font-medium text-gray-600 dark:text-gray-400 shadow-sm border border-black/5 dark:border-white/5">
                                                {edu.duration}
                                            </span>
                                            {edu.score && <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2">Score: {edu.score}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </MacWindow>
                    )}

                </div>
            </div>

            {/* macOS Dock */}
            {!isPdf && (
                <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 pointer-events-none">
                    <div className="flex items-end gap-2 px-4 py-2 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl pointer-events-auto">
                        <button onClick={() => setActiveWindow('about')} className="relative group p-2 hover:-translate-y-2 transition-transform">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center border border-white/20">
                                <Folder className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            {activeWindow === 'about' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full" />}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Profile</span>
                        </button>

                        {!hiddenSections.has('experience') && (
                            <button onClick={() => setActiveWindow('experience')} className="relative group p-2 hover:-translate-y-2 transition-transform">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-lg flex items-center justify-center border border-white/20">
                                    <TerminalIcon className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                                </div>
                                {activeWindow === 'experience' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full" />}
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Experience</span>
                            </button>
                        )}

                        {!hiddenSections.has('projects') && (
                            <button onClick={() => setActiveWindow('projects')} className="relative group p-2 hover:-translate-y-2 transition-transform">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-white/20 overflow-hidden relative">
                                    <div className="absolute inset-0 border-4 border-blue-500 rounded-xl" />
                                    <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                                </div>
                                {activeWindow === 'projects' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full" />}
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Projects</span>
                            </button>
                        )}

                        {!hiddenSections.has('education') && (
                            <button onClick={() => setActiveWindow('education')} className="relative group p-2 hover:-translate-y-2 transition-transform">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl shadow-lg flex items-center justify-center border border-white/20">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-yellow-900" />
                                </div>
                                {activeWindow === 'education' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full" />}
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Education</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
