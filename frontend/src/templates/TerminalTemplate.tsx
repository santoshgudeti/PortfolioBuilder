import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { TemplateProps } from './types'

export default function TerminalTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {
    const [cursorVisible, setCursorVisible] = useState(true)

    // Blinking cursor effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible(v => !v)
        }, 500)
        return () => clearInterval(interval)
    }, [])

    const username = pd.name ? pd.name.toLowerCase().replace(/\s+/g, '_') : 'guest'
    const hostname = 'portfolio-sys'

    return (
        <div className="min-h-screen bg-[#050505] p-4 sm:p-8 font-mono text-sm sm:text-base leading-relaxed selection:bg-white/20"
            style={{ color }}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Terminal</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />
                </Helmet>
            )}

            <div className="max-w-4xl mx-auto w-full relative">
                {/* CRT Scanline overlay effect */}
                <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

                {/* Header Sequence */}
                <div className="mb-8 opacity-80 whitespace-pre-wrap select-none" style={{ textShadow: `0 0 10px rgba(${rgb}, 0.5)` }}>
                    {`  _____                _____           _    __      _ _       
 |  __ \\              / ____|         | |  / _|    | (_)      
 | |__) |___  ___    | |     ___  _ __| |_| |_ ___ | |_  ___  
 |  _  // _ \\/ __|   | |    / _ \\| '__| __|  _/ _ \\| | |/ _ \\ 
 | | \\ \\  __/\\__ \\   | |___| (_) | |  | |_| || (_) | | | (_) |
 |_|  \\_\\___||___/    \\_____\\___/|_|   \\__|_| \\___/|_|_|\\___/ 
                                                              `}
                </div>

                <div className="space-y-6">
                    <Prompt user={username} host={hostname} command="./sys_info" color={color} />
                    <div className="pl-4 border-l-2 border-opacity-30 border-current ml-2 space-y-1">
                        <div className="opacity-90"><span className="font-bold opacity-100 uppercase mr-4">USER:</span> {pd.name}</div>
                        <div className="opacity-90"><span className="font-bold opacity-100 uppercase mr-4">ROLE:</span> {pd.title}</div>
                        {pd.tagline && <div className="opacity-90"><span className="font-bold opacity-100 uppercase mr-4">STAT:</span> {pd.tagline}</div>}
                        {pd.location && <div className="opacity-90"><span className="font-bold opacity-100 uppercase mr-4">LOC:</span> {pd.location}</div>}
                        {pd.email && <div className="opacity-90"><span className="font-bold opacity-100 uppercase mr-4">MAIL:</span> <a href={`mailto:${pd.email}`} className="hover:underline">{pd.email}</a></div>}
                        {pd.website && <div className="opacity-90"><span className="font-bold opacity-100 uppercase mr-4">WEB:</span> <a href={pd.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{pd.website}</a></div>}
                        <div className="flex gap-4 mt-2">
                            {pd.github && <a href={pd.github} target="_blank" rel="noopener noreferrer" className="hover:underline hover:bg-white/10 px-2 py-1">[GITHUB]</a>}
                            {pd.linkedin && <a href={pd.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline hover:bg-white/10 px-2 py-1">[LINKEDIN]</a>}
                        </div>
                    </div>

                    {pd.summary && !hiddenSections.has('summary') && (
                        <>
                            <Prompt user={username} host={hostname} command="cat about.txt" color={color} />
                            <div className="pl-4 ml-2 opacity-90 pr-4 text-justify">
                                {pd.summary}
                            </div>
                        </>
                    )}

                    {pd.skills?.length > 0 && !hiddenSections.has('skills') && (
                        <>
                            <Prompt user={username} host={hostname} command="ls ./skills" color={color} />
                            <div className="pl-4 ml-2 opacity-90 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {pd.skills.map((skill: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="opacity-50">├──</span> {skill}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                        <>
                            <Prompt user={username} host={hostname} command="tail -f ./experience.log" color={color} />
                            <div className="pl-4 ml-2 opacity-90 space-y-6">
                                {pd.experience.map((exp: any, i: number) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex flex-wrap items-baseline gap-2">
                                            <span className="font-bold text-white">[{exp.duration}]</span>
                                            <span className="font-bold border-b border-current border-opacity-50 inline-block">{exp.role}</span>
                                            <span className="opacity-75">@ {exp.company}</span>
                                        </div>
                                        <div className="pl-4 border-l-2 border-current border-opacity-20 max-w-3xl text-opacity-80 mt-2">
                                            {exp.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                        <>
                            <Prompt user={username} host={hostname} command="ls -la ./projects" color={color} />
                            <div className="pl-4 ml-2 opacity-90 space-y-6">
                                {pd.projects.map((proj: any, i: number) => (
                                    <div key={i} className="border border-current border-opacity-20 p-4 relative">
                                        <div className="absolute -top-3 left-4 bg-[#050505] px-2 font-bold select-none">[ {proj.title} ]</div>
                                        <div className="flex gap-4 justify-end mb-2 text-xs opacity-75">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="hover:underline">src</a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="hover:underline">live</a>}
                                        </div>
                                        <div className="mb-4">
                                            {proj.description}
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="opacity-50">deps:</span>
                                            {proj.tech?.map((t: string, j: number) => (
                                                <span key={j} className="bg-current bg-opacity-20 px-1 py-0.5">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {pd.education?.length > 0 && !hiddenSections.has('education') && (
                        <>
                            <Prompt user={username} host={hostname} command="cat education.dat" color={color} />
                            <div className="pl-4 ml-2 opacity-90 space-y-4">
                                {pd.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex flex-col sm:flex-row gap-0 sm:gap-4 sm:items-baseline">
                                        <span className="w-16 opacity-50">{edu.year}</span>
                                        <span className="font-bold">{edu.degree}</span>
                                        <span className="opacity-75">{edu.institution}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Final Prompt */}
                    <div className="pt-8 flex items-center font-bold" style={{ textShadow: `0 0 10px rgba(${rgb}, 0.5)` }}>
                        <span className="text-white opacity-90">{username}@{hostname}</span>
                        <span className="mx-1">:</span>
                        <span className="opacity-90">~$</span>
                        <span className={`ml-2 w-3 h-5 inline-block ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: color }} />
                    </div>
                </div>
            </div>
            {/* Glow overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ boxShadow: `inset 0 0 100px rgba(${rgb}, 1)` }} />
        </div>
    )
}

function Prompt({ user, host, command, color }: { user: string, host: string, command: string, color: string }) {
    return (
        <div className="flex items-center font-bold mb-2">
            <span className="text-white opacity-90">{user}@{host}</span>
            <span className="mx-1">:</span>
            <span className="opacity-80">~$</span>
            <span className="ml-2 font-normal" style={{ textShadow: `0 0 8px ${color}` }}>{command}</span>
        </div>
    )
}
