import { Helmet } from 'react-helmet-async'
import {
    Github, Linkedin, Globe, Mail, Phone, MapPin, ExternalLink,
    Briefcase, GraduationCap, Code2, User
} from 'lucide-react'
import { TemplateProps } from './types'

export default function GlassmorphismTemplate({ pd, data, color, rgb, mode, hiddenSections, initials, isPdf, publicUrl, isPreview }: TemplateProps) {

    // We create rich animated blobs in the background.
    const isDark = mode === 'dark'
    const GLASS_CARD = `relative overflow-hidden rounded-3xl border border-white/20 backdrop-blur-xl transition-all shadow-2xl ${isDark ? 'bg-black/40 text-gray-200 shadow-black/50' : 'bg-white/40 text-gray-800 shadow-brand-500/10'
        }`

    return (
        <div className={`min-h-screen relative overflow-hidden isolate font-sans ${isDark ? 'bg-[#0a0a14]' : 'bg-[#f0f4f8]'}`}
            style={{ isolation: 'isolate', overflow: 'hidden' }}>
            {!isPreview && (
                <Helmet>
                    <title>{pd.name} — Portfolio</title>
                    <meta name="description" content={pd.tagline || pd.summary || `${pd.name}'s professional portfolio.`} />
                </Helmet>
            )}

            {/* Ambient Animated Blobs - scoped within template container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"
                    style={{ backgroundColor: color, animationDuration: '10s' }} />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"
                    style={{ backgroundColor: isDark ? '#4c1d95' : '#c084fc', animationDuration: '12s', animationDelay: '2s' }} />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"
                    style={{ backgroundColor: isDark ? '#1e3a8a' : '#93c5fd', animationDuration: '14s', animationDelay: '4s' }} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 space-y-12">

                {/* Hero Section */}
                <div className={`${GLASS_CARD} p-8 sm:p-16 text-center flex flex-col items-center justify-center`}>
                    <div className="w-24 h-24 sm:w-32 sm:h-32 mb-8 rounded-full border border-white/30 flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-xl bg-white/10 backdrop-blur-md"
                        style={{ boxShadow: `0 0 40px rgba(${rgb}, 0.5), inset 0 0 20px rgba(255,255,255,0.2)` }}>
                        {initials}
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4" style={{ textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(255,255,255,0.5)' }}>
                        {pd.name}
                    </h1>
                    <p className="text-xl sm:text-2xl font-medium opacity-90 mb-6 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm inline-block">
                        {pd.title}
                    </p>
                    {pd.tagline && (
                        <p className="max-w-2xl text-lg sm:text-xl font-light opacity-80 leading-relaxed mb-8">
                            {pd.tagline}
                        </p>
                    )}

                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {pd.email && <GlassTag icon={<Mail />} text={pd.email} href={`mailto:${pd.email}`} />}
                        {pd.phone && <GlassTag icon={<Phone />} text={pd.phone} />}
                        {pd.location && <GlassTag icon={<MapPin />} text={pd.location} />}
                        {pd.github && <GlassTag icon={<Github />} text="GitHub" href={pd.github} />}
                        {pd.linkedin && <GlassTag icon={<Linkedin />} text="LinkedIn" href={pd.linkedin} />}
                        {pd.website && <GlassTag icon={<Globe />} text="Website" href={pd.website} style={{ borderColor: `rgba(${rgb},0.5)`, color: isDark ? '#fff' : `rgba(${rgb},1)` }} />}
                    </div>
                </div>

                {/* About */}
                {pd.summary && !hiddenSections.has('summary') && (
                    <div className={`${GLASS_CARD} p-8 sm:p-12`}>
                        <SectionTitle icon={<User />} title="About Me" rgb={rgb} isDark={isDark} />
                        <p className="text-lg leading-relaxed font-light opacity-90">
                            {pd.summary}
                        </p>
                    </div>
                )}

                {/* Experience & Education Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Experience */}
                    {pd.experience?.length > 0 && !hiddenSections.has('experience') && (
                        <div className="space-y-6">
                            <SectionTitle icon={<Briefcase />} title="Experience" rgb={rgb} isDark={isDark} />
                            {pd.experience.map((exp: any, i: number) => (
                                <div key={i} className={`${GLASS_CARD} p-6 sm:p-8 hover:bg-white/50 dark:hover:bg-black/50 transition-colors`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold">{exp.role}</h3>
                                        <span className="text-xs font-medium px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                                            {exp.duration}
                                        </span>
                                    </div>
                                    <h4 className="text-base font-semibold mb-3 opacity-90" style={{ color }}>{exp.company}</h4>
                                    <p className="font-light opacity-80 leading-relaxed text-sm">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Education */}
                    {pd.education?.length > 0 && !hiddenSections.has('education') && (
                        <div className="space-y-6">
                            <SectionTitle icon={<GraduationCap />} title="Education" rgb={rgb} isDark={isDark} />
                            {pd.education.map((edu: any, i: number) => (
                                <div key={i} className={`${GLASS_CARD} p-6 sm:p-8 hover:bg-white/50 dark:hover:bg-black/50 transition-colors flex items-start gap-4`}>
                                    <div className="w-12 h-12 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner" style={{ color }}>
                                        <GraduationCap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{edu.degree}</h3>
                                        <p className="font-semibold mb-1 opacity-90">{edu.institution}</p>
                                        <span className="text-xs font-medium opacity-70">
                                            {edu.year}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Projects */}
                {pd.projects?.length > 0 && !hiddenSections.has('projects') && (
                    <div>
                        <SectionTitle icon={<Code2 />} title="Selected Works" rgb={rgb} isDark={isDark} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {pd.projects.map((proj: any, i: number) => (
                                <div key={i} className={`${GLASS_CARD} p-6 sm:p-8 hover:-translate-y-2 transition-transform duration-300 group`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border border-white/30 bg-white/10 backdrop-blur-md shadow-inner transition-colors group-hover:bg-white/20" style={{ color }}>
                                            {proj.title?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex gap-2">
                                            {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/20 transition-all"><Github className="w-4 h-4" /></a>}
                                            {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/20 transition-all"><ExternalLink className="w-4 h-4" /></a>}
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{proj.title}</h3>
                                    <p className="font-light opacity-80 leading-relaxed text-sm mb-6">
                                        {proj.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {proj.tech?.map((t: string, j: number) => (
                                            <span key={j} className="text-xs font-medium px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
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
                        <SectionTitle icon={<Code2 />} title="Skills" rgb={rgb} isDark={isDark} />
                        <div className={`${GLASS_CARD} p-8 flex flex-wrap gap-3 mt-8 justify-center`}>
                            {pd.skills.map((skill: string, i: number) => (
                                <span key={i} className="px-5 py-2.5 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-colors cursor-default text-sm shadow-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-8 text-center opacity-50 font-light text-sm">
                    &copy; {new Date().getFullYear()} {pd.name}
                </div>
            </div>
        </div>
    )
}

function SectionTitle({ icon, title, rgb, isDark }: { icon: React.ReactNode, title: string, rgb: string, isDark: boolean }) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/30 bg-white/10 backdrop-blur-md shadow-inner" style={{ color: `rgb(${rgb})` }}>
                {icon}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
    )
}

function GlassTag({ icon, text, href, style }: { icon: React.ReactNode, text: string, href?: string, style?: React.CSSProperties }) {
    const className = "flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-sm font-medium hover:bg-white/20 transition-all shadow-sm"

    if (href) {
        return (
            <a href={href} target={href.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" className={className} style={style}>
                <span className="w-4 h-4 opacity-70">{icon}</span> {text}
            </a>
        )
    }

    return (
        <span className={className} style={style}>
            <span className="w-4 h-4 opacity-70">{icon}</span> {text}
        </span>
    )
}
