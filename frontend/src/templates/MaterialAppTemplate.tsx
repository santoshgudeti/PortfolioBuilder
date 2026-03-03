import React, { useState } from 'react'
import { User, Briefcase, Frame, GraduationCap, MapPin, Mail, Phone, Globe, ExternalLink, Menu, CheckCircle2 } from 'lucide-react'
import { TemplateProps } from './types'

export default function MaterialAppTemplate({ pd, data, hiddenSections, rgb, mode }: TemplateProps) {
    const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'projects' | 'education'>('about')
    const primaryColor = data?.primary_color || '#6200ea'

    const tabs = [
        { id: 'about', label: 'Profile', icon: User, hidden: false },
        { id: 'experience', label: 'Experience', icon: Briefcase, hidden: hiddenSections.has('experience') || !pd.experience?.length },
        { id: 'projects', label: 'Projects', icon: Frame, hidden: hiddenSections.has('projects') || !pd.projects?.length },
        { id: 'education', label: 'Education', icon: GraduationCap, hidden: hiddenSections.has('education') || !pd.education?.length },
    ].filter(t => !t.hidden)

    // Set first available tab if activeTab is hidden
    React.useEffect(() => {
        if (!tabs.find(t => t.id === activeTab) && tabs.length > 0) {
            setActiveTab(tabs[0].id as any)
        }
    }, [tabs, activeTab])

    const isDark = mode === 'dark'

    return (
        <div className={`min-h-screen bg-gray-100 dark:bg-[#121212] font-sans pb-24 md:pb-10 transition-colors duration-300`}>

            {/* Top App Bar - Fixed */}
            <header
                className="fixed top-0 inset-x-0 h-14 md:h-16 flex items-center justify-between px-4 z-40 shadow-md transition-colors duration-300"
                style={{ backgroundColor: primaryColor }}
            >
                <div className="flex items-center gap-4 text-white">
                    <button className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="font-medium text-lg md:text-xl tracking-wide">{pd.name}</h1>
                </div>
                {data?.avatar_url && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 overflow-hidden shadow-sm">
                        <img src={data.avatar_url} alt={pd.name} className="w-full h-full object-cover" />
                    </div>
                )}
            </header>

            {/* Desktop Navigation Tabs (Hidden on mobile) */}
            <div className="hidden md:flex fixed top-16 inset-x-0 h-12 bg-white dark:bg-[#212121] shadow flex-row justify-center z-30 transition-colors duration-300">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-8 h-full flex flex-col justify-between items-center pt-3 relative overflow-hidden group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors`}
                    >
                        <span className={`text-sm font-medium tracking-wide ${activeTab === tab.id ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            {tab.label.toUpperCase()}
                        </span>
                        {/* Tab indicator */}
                        <div
                            className={`h-[3px] w-full rounded-t-sm transition-transform duration-300 ${activeTab === tab.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50 opacity-50'}`}
                            style={{ backgroundColor: primaryColor }}
                        />
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <main className="pt-20 md:pt-36 px-4 md:px-8 max-w-[800px] mx-auto min-h-screen relative">

                {/* ABOUT TAB */}
                {activeTab === 'about' && (
                    <div className="animate-fade-in space-y-4 md:space-y-6">
                        {/* Profile Header Card */}
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-[16px] shadow-sm overflow-hidden transition-colors duration-300">
                            <div className="h-24 md:h-32 opacity-20" style={{ backgroundColor: primaryColor }} />
                            <div className="px-6 pb-6 relative">
                                {!data?.avatar_url && (
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-[#1e1e1e] -mt-10 md:-mt-12 flex items-center justify-center border-4 border-white dark:border-[#1e1e1e] shadow-lg mb-4 text-4xl font-bold" style={{ color: primaryColor }}>
                                        {pd.name?.charAt(0)}
                                    </div>
                                )}
                                <div className={data?.avatar_url ? "-mt-8" : ""}>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{pd.name}</h2>
                                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1">{pd.headline}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-[16px] shadow-sm p-4 md:p-6 transition-colors duration-300">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                {pd.contact?.email && (
                                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <a href={`mailto:${pd.contact.email}`} className="hover:underline">{pd.contact.email}</a>
                                    </div>
                                )}
                                {pd.contact?.phone && (
                                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <span>{pd.contact.phone}</span>
                                    </div>
                                )}
                                {pd.contact?.location && (
                                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <span>{pd.contact.location}</span>
                                    </div>
                                )}
                                {pd.contact?.linkedin && (
                                    <div className="flex items-center gap-4 text-gray-800 dark:text-gray-200">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <a href={pd.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">LinkedIn</a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary Card */}
                        {!hiddenSections.has('summary') && pd.summary && (
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-[16px] shadow-sm p-4 md:p-6 transition-colors duration-300">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">About Me</h3>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{pd.summary}</p>
                            </div>
                        )}

                        {/* Skills Chips */}
                        {!hiddenSections.has('skills') && pd.skills?.length > 0 && (
                            <div className="bg-white dark:bg-[#1e1e1e] rounded-[16px] shadow-sm p-4 md:p-6 transition-colors duration-300">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pd.skills.map((skill: string) => (
                                        <span key={skill} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-full flex items-center gap-1.5 transition-colors duration-300">
                                            <CheckCircle2 className="w-3.5 h-3.5 opacity-50" style={{ color: primaryColor }} />
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* EXPERIENCE TAB */}
                {activeTab === 'experience' && (
                    <div className="animate-fade-in space-y-4">
                        {pd.experience?.map((exp: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-[16px] shadow-sm p-5 md:p-6 transition-colors duration-300 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 opacity-50" style={{ backgroundColor: primaryColor }} />
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{exp.role}</h3>
                                        <p className="text-base text-gray-600 dark:text-gray-400 font-medium">{exp.company}</p>
                                    </div>
                                    <div className="flex flex-col md:items-end text-sm text-gray-500 dark:text-gray-400">
                                        <span>{exp.duration}</span>
                                        {exp.location && <span>{exp.location}</span>}
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* PROJECTS TAB */}
                {activeTab === 'projects' && (
                    <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {pd.projects?.map((proj: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-[16px] shadow-sm overflow-hidden transition-colors duration-300 flex flex-col hover:shadow-md">
                                <div className="h-32 opacity-20 relative flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                                    <Frame className="w-12 h-12 text-black dark:text-white opacity-20" />
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{proj.name}</h3>
                                    {proj.technologies && (
                                        <p className="text-sm font-medium opacity-80 mb-3" style={{ color: primaryColor }}>{proj.technologies}</p>
                                    )}
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">{proj.description}</p>
                                    {proj.link && (
                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
                                                View Project <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* EDUCATION TAB */}
                {activeTab === 'education' && (
                    <div className="animate-fade-in space-y-4">
                        {pd.education?.map((edu: any, i: number) => (
                            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-[16px] shadow-sm p-5 md:p-6 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-6 h-6" style={{ color: primaryColor }} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">{edu.institution}</p>
                                    {edu.score && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Score: {edu.score}</p>}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium sm:text-right whitespace-nowrap">
                                    {edu.duration}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white dark:bg-[#212121] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pt-1 pb-2 px-2 flex justify-around items-center z-40 transition-colors duration-300">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center justify-center w-full h-full rounded-xl transition-colors duration-200 ${activeTab === tab.id ? 'bg-black/5 dark:bg-white/5' : ''}`}
                        style={{ color: activeTab === tab.id ? primaryColor : (isDark ? '#9ca3af' : '#6b7280') }}
                    >
                        <div className={`px-4 py-1 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-current opacity-20 absolute' : 'opacity-0 absolute'}`} />
                        <tab.icon className={`w-5 h-5 mb-1 relative z-10 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
                        <span className="text-[10px] font-medium relative z-10 tracking-wide">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Floating Action Button (FAB) - For Contact */}
            {pd.contact?.email && (
                <a
                    href={`mailto:${pd.contact.email}`}
                    className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform z-50 group hover:shadow-2xl"
                    style={{ backgroundColor: primaryColor }}
                    title="Send Email"
                >
                    <Mail className="w-6 h-6" />
                </a>
            )}
        </div>
    )
}
