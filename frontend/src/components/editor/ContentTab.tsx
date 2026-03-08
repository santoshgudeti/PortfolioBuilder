import { ParsedData } from '@/store/portfolioStore'
import { AIButton } from './AIButton'

interface ContentTabProps {
    localData: ParsedData
    updateField: (field: keyof ParsedData, value: any) => void
}

export function ContentTab({ localData, updateField }: ContentTabProps) {
    return (
        <div className="space-y-4">
            {/* Basic Info */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {[
                        { key: 'name', label: 'Full Name' },
                        { key: 'title', label: 'Job Title' },
                        { key: 'email', label: 'Email' },
                        { key: 'phone', label: 'Phone' },
                        { key: 'location', label: 'Location' },
                        { key: 'github', label: 'GitHub URL' },
                        { key: 'linkedin', label: 'LinkedIn URL' },
                        { key: 'website', label: 'Website URL' },
                    ].map(({ key, label }) => (
                        <div key={key}>
                            <label className="label mb-1.5">{label}</label>
                            <input
                                type="text"
                                className="input"
                                value={(localData as any)[key] || ''}
                                onChange={e => updateField(key as keyof ParsedData, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Tagline & Summary with AI */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tagline & Summary</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="label">Tagline</label>
                            <AIButton
                                field="tagline"
                                value={localData.tagline || ''}
                                context={`Name: ${localData.name}, Title: ${localData.title}, Skills: ${localData.skills?.slice(0, 5).join(', ')}`}
                                onResult={v => updateField('tagline', v)}
                            />
                        </div>
                        <input
                            type="text"
                            className="input"
                            value={localData.tagline || ''}
                            onChange={e => updateField('tagline', e.target.value)}
                            placeholder="e.g. Full Stack Developer | Building scalable web apps"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="label">Professional Summary</label>
                            <AIButton
                                field="summary"
                                value={localData.summary || ''}
                                context={`Title: ${localData.title}, Skills: ${localData.skills?.slice(0, 8).join(', ')}`}
                                onResult={v => updateField('summary', v)}
                            />
                        </div>
                        <textarea
                            className="input min-h-[100px] resize-y"
                            value={localData.summary || ''}
                            onChange={e => updateField('summary', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                    {localData.skills?.map((skill, i) => (
                        <span key={i} className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 flex items-center gap-1">
                            {skill}
                            <button
                                onClick={() => updateField('skills', localData.skills.filter((_, idx) => idx !== i))}
                                className="ml-1 hover:text-red-500"
                            >×</button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    className="input"
                    placeholder="Add skill and press Enter"
                    onKeyDown={e => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            updateField('skills', [...(localData.skills || []), e.currentTarget.value.trim()])
                            e.currentTarget.value = ''
                        }
                    }}
                />
            </div>

            {/* Projects with AI */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Projects ({localData.projects?.length || 0})</h2>
                <div className="space-y-4">
                    {localData.projects?.map((proj, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="label mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={proj.title}
                                        onChange={e => {
                                            const updated = [...localData.projects]
                                            updated[i] = { ...proj, title: e.target.value }
                                            updateField('projects', updated)
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="label mb-1">Tech Stack (comma separated)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={proj.tech?.join(', ')}
                                        onChange={e => {
                                            const updated = [...localData.projects]
                                            updated[i] = { ...proj, tech: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }
                                            updateField('projects', updated)
                                        }}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="label">Description</label>
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
                                        className="input resize-none"
                                        rows={2}
                                        value={proj.description}
                                        onChange={e => {
                                            const updated = [...localData.projects]
                                            updated[i] = { ...proj, description: e.target.value }
                                            updateField('projects', updated)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience with AI */}
            <div className="card">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Experience ({localData.experience?.length || 0})</h2>
                <div className="space-y-4">
                    {localData.experience?.map((exp, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="label mb-1">Role</label>
                                    <input type="text" className="input" value={exp.role}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, role: e.target.value }
                                            updateField('experience', updated)
                                        }} />
                                </div>
                                <div>
                                    <label className="label mb-1">Company</label>
                                    <input type="text" className="input" value={exp.company}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, company: e.target.value }
                                            updateField('experience', updated)
                                        }} />
                                </div>
                                <div>
                                    <label className="label mb-1">Duration</label>
                                    <input type="text" className="input" value={exp.duration}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, duration: e.target.value }
                                            updateField('experience', updated)
                                        }} />
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="label">Description</label>
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
                                    <textarea className="input resize-none" rows={2} value={exp.description}
                                        onChange={e => {
                                            const updated = [...localData.experience]
                                            updated[i] = { ...exp, description: e.target.value }
                                            updateField('experience', updated)
                                        }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
