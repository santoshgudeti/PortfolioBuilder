import { useState } from 'react'
import {
    Linkedin, Globe, Mail, MapPin, ExternalLink,
    Briefcase, Code2, ArrowUpRight, Github, Send
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { TemplateProps } from './types'

export default function FreelancerTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    return (
        <div className={`min-h-screen font-sans overflow-x-hidden ${mode === 'dark' ? 'dark bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name || 'Portfolio'} — Freelancer</title>
                </Helmet>
            )}

            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl blur-[120px] opacity-20 dark:opacity-10 rounded-full" style={{ backgroundImage: `linear-gradient(to bottom left, ${color}, transparent)` }} />

                <div className="relative z-10 max-w-5xl w-full text-center space-y-8">
                    <p className="font-mono text-sm tracking-widest uppercase mb-4" style={{ color }}>{pd.title}</p>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none dark:text-white">
                        {pd.name}
                    </h1>
                    {(pd.tagline || pd.summary) && !hiddenSections.has('summary') && (
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mt-6">
                            {pd.tagline || pd.summary}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
                        {pd.email && (
                            <a href={`mailto:${pd.email}`} className="px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2" style={{ backgroundColor: color }}>
                                <Send className="w-5 h-5" /> Hire Me
                            </a>
                        )}
                        {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                            <a href="#work" className="px-8 py-4 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg hover:scale-105 transition-transform">
                                View Work
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* Social Links Bar */}
            <div className="border-y border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-8 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</a>}
                    {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</a>}
                    {pd.website && <a href={pd.website} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white flex items-center gap-2"><Globe className="w-4 h-4" /> Website</a>}
                    {pd.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {pd.location}</span>}
                </div>
            </div>

            {/* Selected Work (Projects) */}
            {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                <section id="work" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black mb-16 text-center dark:text-white">Selected Work</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {pd.projects.map((proj: any, i: number) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[4/3] w-full rounded-2xl mb-6 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center overflow-hidden relative">
                                    {/* Abstract project cover based on name and color */}
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ background: `linear-gradient(45deg, ${color}, transparent)` }} />
                                    <div className="w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center text-4xl font-black bg-white dark:bg-black text-gray-900 dark:text-white z-10 group-hover:scale-110 transition-transform duration-500">
                                        {proj.title?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-white dark:bg-black rounded-full shadow-lg hover:scale-110 transition-transform"><Github className="w-4 h-4 text-gray-900 dark:text-white" /></a>}
                                        {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="p-3 shadow-lg rounded-full text-white hover:scale-110 transition-transform" style={{ backgroundColor: color }}><ExternalLink className="w-4 h-4" /></a>}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold dark:text-white mb-2">{proj.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2 group-hover:line-clamp-none transition-all">{proj.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {proj.tech?.map((t: string, j: number) => (
                                        <span key={j} className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills & Experience Split */}
            <section className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/5 py-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                        <div>
                            <h2 className="text-4xl font-black mb-12 dark:text-white">Experience</h2>
                            <div className="space-y-12">
                                {pd.experience.map((exp: any, i: number) => (
                                    <div key={i} className="group">
                                        <div className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">{exp.duration}</div>
                                        <h3 className="text-2xl font-bold dark:text-white mb-1 group-hover:text-brand-500 transition-colors">{exp.role}</h3>
                                        <h4 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-4">{exp.company}</h4>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                        <div>
                            <h2 className="text-4xl font-black mb-12 dark:text-white">Capabilities</h2>
                            <div className="flex flex-wrap gap-3">
                                {pd.skills.map((skill: string, i: number) => (
                                    <span key={i} className="px-6 py-4 rounded-2xl text-lg font-medium bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white border border-transparent hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Minimal Footer */}
            <footer className="py-12 text-center text-gray-400 text-sm border-t border-black/5 dark:border-white/5">
                <p>© {new Date().getFullYear()} {pd.name}. Selected works.</p>
            </footer>
        </div>
    )
}
