import { User, Briefcase, Mail, Phone, MapPin, Github, Linkedin, Globe, Sparkles, FolderOpen, History, Code, PenTool, Type, AlignLeft, Cpu } from 'lucide-react'
import { AIButton } from './AIButton'
import { ParsedData } from '@/store/portfolioStore'

interface ContentTabProps {
    localData: ParsedData
    updateField: (field: keyof ParsedData, value: any) => void
}

export function ContentTab({ localData, updateField }: ContentTabProps) {
    return (
        <div className="space-y-4">
            {/* Basic Info */}
            <div className="card-premium group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Identity</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Personal details & socials</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {[
                        { key: 'name', label: 'Full Name', icon: User },
                        { key: 'title', label: 'Job Title', icon: Briefcase },
                        { key: 'email', label: 'Email', icon: Mail },
                        { key: 'phone', label: 'Phone', icon: Phone },
                        { key: 'location', label: 'Location', icon: MapPin },
                        { key: 'github', label: 'GitHub URL', icon: Github },
                        { key: 'linkedin', label: 'LinkedIn URL', icon: Linkedin },
                        { key: 'website', label: 'Website URL', icon: Globe },
                    ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <Icon className="w-3 h-3" />
                                {label}
                            </label>
                            <input
                                type="text"
                                className="input-premium"
                                value={(localData as any)[key] || ''}
                                onChange={e => updateField(key as keyof ParsedData, e.target.value)}
                                placeholder={`Enter your ${label.toLowerCase()}...`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Tagline & Summary with AI */}
            <div className="card-premium group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:rotate-12 transition-transform">
                        <PenTool className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Elevated Narrative</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Tagline & Professional Summary</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <Type className="w-3 h-3" />
                                Brand Tagline
                            </label>
                            <AIButton
                                field="tagline"
                                value={localData.tagline || ''}
                                context={`Name: ${localData.name}, Title: ${localData.title}, Skills: ${localData.skills?.slice(0, 5).join(', ')}`}
                                onResult={v => updateField('tagline', v)}
                            />
                        </div>
                        <input
                            type="text"
                            className="input-premium"
                            value={localData.tagline || ''}
                            onChange={e => updateField('tagline', e.target.value)}
                            placeholder="e.g. Full Stack Developer | Building scalable web apps"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                <AlignLeft className="w-3 h-3" />
                                Professional Summary
                            </label>
                            <AIButton
                                field="summary"
                                value={localData.summary || ''}
                                context={`Title: ${localData.title}, Skills: ${localData.skills?.slice(0, 8).join(', ')}`}
                                onResult={v => updateField('summary', v)}
                            />
                        </div>
                        <textarea
                            className="input-premium min-h-[120px] resize-y"
                            value={localData.summary || ''}
                            onChange={e => updateField('summary', e.target.value)}
                            placeholder="Describe your professional journey and key achievements..."
                        />
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="card-premium group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Expertise</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Core skills & tools</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {localData.skills?.map((skill: string, i: number) => (
                        <span key={i} className="badge bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 border border-brand-500/20 flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg font-bold transition-all hover:bg-brand-500 hover:text-white">
                            {skill}
                            <button
                                onClick={() => updateField('skills', localData.skills.filter((_: any, idx: number) => idx !== i))}
                                className="w-5 h-5 rounded-md hover:bg-black/10 flex items-center justify-center transition-colors"
                            >×</button>
                        </span>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        className="input-premium pl-4 pr-12"
                        placeholder="Add a skill and press Enter..."
                        onKeyDown={e => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                updateField('skills', [...(localData.skills || []), e.currentTarget.value.trim()])
                                e.currentTarget.value = ''
                            }
                        }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">⏎</div>
                </div>
            </div>

            {/* Projects with AI */}
            <div className="card-premium group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                        <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Portfolio Pieces</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Showcase your best work ({localData.projects?.length || 0})</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {localData.projects?.map((proj: any, i: number) => (
                        <div key={i} className="relative p-6 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 transition-all hover:border-brand-500/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Project Title</label>
                                    <input
                                        type="text"
                                        className="input-premium"
                                        value={proj.title}
                                        onChange={e => {
                                            const updated = [...localData.projects]
                                            updated[i] = { ...proj, title: e.target.value }
                                            updateField('projects', updated)
                                        }}
                                        placeholder="e.g. AI Portfolio Builder"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Technology Stack</label>
                                    <input
                                        type="text"
                                        className="input-premium"
                                        value={proj.tech?.join(', ')}
                                        onChange={e => {
                                            const updated = [...localData.projects]
                                            updated[i] = { ...proj, tech: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }
                                            updateField('projects', updated)
                                        }}
                                        placeholder="React, Tailwind, FastAPI..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Impact & Achievement</label>
                                        <AIButton
                                            field="project_description"
                                            value={proj.description}
                                            context={`Project: ${proj.title}, Tech: ${proj.tech?.join(', ')}`}
                                            onResult={v => {
                                                const updated = [...localData.projects]
                                                updated[i] = { ...proj, description: v }
                                                updateField('projects', updated)
                                            }}
                                        />
                                    </div>
                                    <textarea
                                        className="input-premium resize-none min-h-[80px]"
                                        value={proj.description}
                                        onChange={e => {
                                            const updated = [...localData.projects]
                                            updated[i] = { ...proj, description: e.target.value }
                                            updateField('projects', updated)
                                        }}
                                        placeholder="What did you build and why does it matter?"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience with AI */}
            <div className="card-premium group">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <History className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none">Professional Timeline</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Your career journey ({localData.experience?.length || 0})</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {localData.experience?.map((exp: any, i: number) => (
                        <div key={i} className="relative p-6 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 transition-all hover:border-brand-500/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Position</label>
                                    <input type="text" className="input-premium" value={exp.role}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, role: e.target.value }
                                            updateField('experience', updated)
                                        }}
                                        placeholder="Senior Developer" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Company</label>
                                    <input type="text" className="input-premium" value={exp.company}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, company: e.target.value }
                                            updateField('experience', updated)
                                        }}
                                        placeholder="Tech Solutions Inc." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</label>
                                    <input type="text" className="input-premium" value={exp.duration}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, duration: e.target.value }
                                            updateField('experience', updated)
                                        }}
                                        placeholder="2021 - Present" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Key Contributions</label>
                                        <AIButton
                                            field="experience_description"
                                            value={exp.description}
                                            context={`Role: ${exp.role} at ${exp.company}, Duration: ${exp.duration}`}
                                            onResult={v => {
                                                const updated = [...localData.experience]
                                                updated[i] = { ...exp, description: v }
                                                updateField('experience', updated)
                                            }}
                                        />
                                    </div>
                                    <textarea className="input-premium resize-none min-h-[80px]" value={exp.description}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, description: e.target.value }
                                            updateField('experience', updated)
                                        }}
                                        placeholder="What were your main responsibilities and wins?" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
