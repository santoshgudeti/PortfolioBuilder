import { useState } from 'react'
import {
    Phone, Mail, MapPin, ExternalLink, GraduationCap, Code2, Briefcase
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { TemplateProps } from './types'

export default function AcademicTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    return (
        <div className={`min-h-screen font-serif ${mode === 'dark' ? 'dark bg-gray-900 text-gray-300' : 'bg-[#faf9f6] text-gray-900'}`}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name || 'Curriculum Vitae'} — Academic CV</title>
                </Helmet>
            )}

            <div className="max-w-4xl mx-auto p-8 md:p-16 lg:p-24 bg-white dark:bg-gray-900 shadow-2xl dark:shadow-none min-h-screen my-0 md:my-8">
                {/* Header */}
                <header className="border-b-4 pb-8 mb-12 text-center" style={{ borderColor: color }}>
                    <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">
                        {pd.name}
                    </h1>
                    <p className="text-xl italic text-gray-600 dark:text-gray-400 mb-6">{pd.title}</p>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-400">
                        {pd.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {pd.email}</span>}
                        {pd.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {pd.phone}</span>}
                        {pd.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {pd.location}</span>}
                        {pd.website && <a href={pd.website} className="flex items-center gap-1.5 hover:underline" style={{ color }}><ExternalLink className="w-4 h-4" /> Portfolio</a>}
                    </div>
                </header>

                <div className="space-y-12">
                    {/* Summary / Objective */}
                    {(pd.summary || pd.tagline) && !hiddenSections.has('summary') && (
                        <section>
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
                                Professional Overview
                            </h2>
                            {pd.tagline && <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{pd.tagline}</p>}
                            <p className="leading-relaxed text-gray-800 dark:text-gray-300 text-justify">
                                {pd.summary}
                            </p>
                        </section>
                    )}

                    {/* Education */}
                    {pd.education?.length > 0 && !hiddenSections.has('education') && (
                        <section>
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-2 flex items-center gap-2">
                                <GraduationCap className="w-6 h-6" /> Education
                            </h2>
                            <div className="space-y-6">
                                {pd.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex flex-col md:flex-row md:justify-between items-start md:items-baseline">
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{edu.institution}</h3>
                                            <p className="text-lg italic text-gray-700 dark:text-gray-400">{edu.degree}</p>
                                        </div>
                                        <span className="text-sm font-semibold tracking-widest uppercase text-gray-500 mt-2 md:mt-0" style={{ color }}>{edu.year}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                        <section>
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-2 flex items-center gap-2">
                                <Briefcase className="w-6 h-6" /> Academic & Professional Experience
                            </h2>
                            <div className="space-y-8">
                                {pd.experience.map((exp: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-baseline mb-2">
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{exp.role}</h3>
                                            <span className="text-sm font-semibold tracking-widest uppercase text-gray-500 mt-1 md:mt-0" style={{ color }}>{exp.duration}</span>
                                        </div>
                                        <h4 className="text-lg italic text-gray-700 dark:text-gray-400 mb-3">{exp.company}</h4>
                                        <p className="text-gray-800 dark:text-gray-300 leading-relaxed text-justify">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects / Publications */}
                    {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                        <section>
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-2 flex items-center gap-2">
                                <Code2 className="w-6 h-6" /> Projects & Publications
                            </h2>
                            <div className="space-y-6">
                                {pd.projects.map((proj: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{proj.title}</h3>
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-sm" style={{ color }}>[Link]</a>}
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="hover:underline text-sm" style={{ color }}>[Source]</a>}
                                        </div>
                                        <p className="text-gray-800 dark:text-gray-300 leading-relaxed mb-2 text-justify">
                                            {proj.description}
                                        </p>
                                        <p className="text-sm italic text-gray-500">
                                            Technologies: {proj.tech?.join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                        <section>
                            <h2 className="text-2xl font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
                                Technical Skills
                            </h2>
                            <p className="text-gray-800 dark:text-gray-300 leading-relaxed text-justify">
                                <span className="font-bold mr-2">Core Competencies:</span>
                                {pd.skills.join(', ')}
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
