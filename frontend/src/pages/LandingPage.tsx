import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    ArrowRight,
    BarChart3,
    CheckCircle,
    Clock,
    Download,
    Edit3,
    FileText,
    Globe,
    LayoutTemplate,
    Palette,
    Shield,
    Sparkles,
    Wand2,
    type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type Metric = {
    value: string
    label: string
}

type Capability = {
    icon: LucideIcon
    title: string
    body: string
}

type WorkflowStep = {
    step: string
    title: string
    body: string
    icon: LucideIcon
}

type TemplatePreset = {
    name: string
    fit: string
    note: string
    accent: string
}

type Testimonial = {
    name: string
    role: string
    quote: string
}

type Faq = {
    question: string
    answer: string
}

const METRICS: Metric[] = [
    { value: '15', label: 'portfolio templates' },
    { value: 'PDF + DOCX', label: 'resume uploads supported' },
    { value: 'Custom domains', label: 'for published portfolios' },
    { value: 'Analytics', label: 'built into public pages' },
]

const CAPABILITIES: Capability[] = [
    {
        icon: FileText,
        title: 'Resume in, structure out',
        body: 'Upload the resume you already have. The parser turns work history, projects, skills, and links into a draft you can actually edit.',
    },
    {
        icon: Edit3,
        title: 'A visual editor you control',
        body: 'Change copy, hide sections, switch templates, adjust colors, and tune your slug before anything goes live.',
    },
    {
        icon: Globe,
        title: 'Publish with the practical extras',
        body: 'Your portfolio ships with a public URL, custom-domain support, page-view analytics, and PDF export.',
    },
]

const PRODUCT_NOTES: Capability[] = [
    {
        icon: Wand2,
        title: 'AI first draft',
        body: 'The first pass is automatic, so you start from something structured instead of a blank page.',
    },
    {
        icon: Palette,
        title: 'Template range',
        body: 'From sharp editorial layouts to denser technical templates, the design system is already there.',
    },
    {
        icon: BarChart3,
        title: 'After publish',
        body: 'Track visits, keep iterating, and update the same portfolio instead of rebuilding every time your resume changes.',
    },
]

const WORKFLOW: WorkflowStep[] = [
    {
        step: '01',
        title: 'Upload your resume',
        body: 'Start with a PDF or DOCX file instead of retyping your experience into a template.',
        icon: FileText,
    },
    {
        step: '02',
        title: 'Generate the draft',
        body: 'AI organizes the raw resume into a portfolio structure with sections, projects, and contact details in place.',
        icon: Sparkles,
    },
    {
        step: '03',
        title: 'Refine the presentation',
        body: 'Pick a template, edit the language, tune your colors, and keep only the sections you want public.',
        icon: LayoutTemplate,
    },
    {
        step: '04',
        title: 'Publish and share',
        body: 'Launch on a public URL, connect a domain when needed, and watch portfolio traffic over time.',
        icon: Globe,
    },
]

const TEMPLATE_PRESETS: TemplatePreset[] = [
    {
        name: 'Executive',
        fit: 'Consulting, leadership, operations',
        note: 'Structured, restrained, and easy to scan.',
        accent: 'bg-amber-500',
    },
    {
        name: 'Bento Grid',
        fit: 'Engineering, product, startup roles',
        note: 'Project-heavy layouts with room for depth.',
        accent: 'bg-brand-500',
    },
    {
        name: 'Studio',
        fit: 'Designers, freelancers, creators',
        note: 'More visual weight without losing clarity.',
        accent: 'bg-rose-500',
    },
    {
        name: 'Kernel',
        fit: 'Developers, infra, technical audiences',
        note: 'A sharper technical look that still reads clean.',
        accent: 'bg-emerald-500',
    },
    {
        name: 'Canvas',
        fit: 'Writers, researchers, minimalists',
        note: 'Calm spacing and typography-first storytelling.',
        accent: 'bg-stone-700 dark:bg-stone-300',
    },
    {
        name: 'Radical',
        fit: 'Creative technologists, bold portfolios',
        note: 'A louder system when a quieter one will disappear.',
        accent: 'bg-red-600',
    },
]

const TESTIMONIALS: Testimonial[] = [
    {
        name: 'Priya Sharma',
        role: 'Frontend Developer',
        quote: 'This gave me something I could send the same day. The important part was not just the design, it was how quickly the draft became editable.',
    },
    {
        name: 'Rohan Mehta',
        role: 'Full Stack Engineer',
        quote: 'I stopped maintaining a separate resume site. Now I update one source and publish a cleaner portfolio when I need it.',
    },
    {
        name: 'Ananya Iyer',
        role: 'Product Designer',
        quote: 'The templates feel opinionated enough to help, but not so rigid that every portfolio ends up looking the same.',
    },
]

const FAQS: Faq[] = [
    {
        question: 'Do I need to know how to code?',
        answer: 'No. The product is built around resume upload, visual editing, and template selection. You can publish without touching code.',
    },
    {
        question: 'Can I still edit the content after AI generates it?',
        answer: 'Yes. The AI draft is only the starting point. You can rewrite sections, hide content, change templates, and republish whenever you want.',
    },
    {
        question: 'Can I publish on my own domain?',
        answer: 'Yes. The backend already supports custom-domain publishing, so you can move beyond the default portfolio URL when you are ready.',
    },
    {
        question: 'What happens after the portfolio is live?',
        answer: 'You keep a public URL, can export a PDF version, and can view page analytics to understand how the portfolio is performing.',
    },
]

function FeatureCard({ icon: Icon, title, body }: Capability) {
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#12161d]">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-900 dark:bg-white/10 dark:text-white">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-space text-xl font-bold text-stone-950 dark:text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">{body}</p>
        </div>
    )
}

function WorkflowCard({ step, title, body, icon: Icon }: WorkflowStep) {
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#12161d]">
            <div className="flex items-center justify-between">
                <span className="font-space text-lg font-bold text-stone-400 dark:text-stone-500">{step}</span>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-900 dark:bg-white/10 dark:text-white">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <h3 className="mt-8 font-space text-xl font-bold text-stone-950 dark:text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">{body}</p>
        </div>
    )
}

function TemplateCard({ name, fit, note, accent }: TemplatePreset) {
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#12161d]">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${accent}`} />
                    <h3 className="font-space text-lg font-bold text-stone-950 dark:text-white">{name}</h3>
                </div>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Template</span>
            </div>
            <p className="mt-3 text-sm font-medium text-stone-900 dark:text-stone-100">{fit}</p>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{note}</p>
        </div>
    )
}

function TestimonialCard({ name, role, quote }: Testimonial) {
    const initials = name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#12161d]">
            <p className="text-sm leading-7 text-stone-700 dark:text-stone-200">"{quote}"</p>
            <div className="mt-6 flex items-center gap-4 border-t border-stone-200 pt-5 dark:border-white/10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 font-space text-sm font-bold text-stone-950 dark:bg-white/10 dark:text-white">
                    {initials}
                </div>
                <div>
                    <div className="font-space text-base font-bold text-stone-950 dark:text-white">{name}</div>
                    <div className="text-sm text-stone-500 dark:text-stone-400">{role}</div>
                </div>
            </div>
        </div>
    )
}

export default function LandingPage() {
    const { user } = useAuthStore()
    const primaryCta = user ? '/upload' : '/register'

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-[#0b0e12] dark:text-white">
            <Helmet>
                <title>PortfolioBuilder.AI | Resume To Portfolio</title>
                <meta
                    name="description"
                    content="Turn a resume into a polished portfolio with AI drafting, live editing, template switching, custom domains, and built-in analytics."
                />
            </Helmet>
            <Navbar />
            <main>
                <section className="relative overflow-hidden border-b border-stone-200 pt-28 dark:border-white/10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_52%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_52%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08] dark:opacity-[0.05]" />

                    <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                        <div>
                            <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                                PortfolioBuilder takes the resume you already have and turns it into a portfolio you can actually send.
                            </p>

                            <h1 className="mt-6 max-w-3xl font-space text-5xl font-bold tracking-[-0.04em] text-stone-950 dark:text-white sm:text-6xl lg:text-7xl">
                                Launch a portfolio that feels built, not auto-generated.
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600 dark:text-stone-300">
                                Upload a PDF or DOCX, let AI draft the structure, then refine the copy, layout, and URL before you publish. No code required, and no empty page to start from.
                            </p>

                            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                                <Link to={primaryCta} className="btn-primary px-7 py-3 text-sm">
                                    Build from your resume
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a href="#templates" className="btn-secondary px-7 py-3 text-sm">
                                    Browse templates
                                </a>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 text-sm text-stone-600 dark:text-stone-300 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    AI resume parsing
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    Live editor before publish
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    Custom domain and analytics
                                </span>
                            </div>

                            <dl className="mt-12 grid gap-6 border-t border-stone-200 pt-8 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/10">
                                {METRICS.map((metric) => (
                                    <div key={metric.label}>
                                        <dt className="text-sm text-stone-500 dark:text-stone-400">{metric.label}</dt>
                                        <dd className="mt-2 font-space text-2xl font-bold text-stone-950 dark:text-white">
                                            {metric.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_20px_70px_-40px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#12161d] dark:shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]">
                                <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-white/10">
                                    <div>
                                        <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Published preview</p>
                                        <p className="mt-1 font-space text-base font-bold text-stone-950 dark:text-white">
                                            portfoliobuilder.ai/u/your-name
                                        </p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 rounded-md bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700 dark:bg-white/10 dark:text-stone-200">
                                        <Clock className="h-3.5 w-3.5" />
                                        Ready to share
                                    </div>
                                </div>
                                <img
                                    src="/images/landing/portfolio-mockup.png"
                                    alt="Portfolio preview inside PortfolioBuilder"
                                    className="w-full"
                                    width={1200}
                                    height={800}
                                    fetchPriority="high"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#12161d]">
                                    <div className="flex items-center gap-3 text-stone-950 dark:text-white">
                                        <Sparkles className="h-4 w-4" />
                                        <p className="font-space text-base font-bold">First draft in minutes</p>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
                                        Start from extracted resume data instead of moving bullets into a builder by hand.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-white/10 dark:bg-[#12161d]">
                                    <div className="flex items-center gap-3 text-stone-950 dark:text-white">
                                        <BarChart3 className="h-4 w-4" />
                                        <p className="font-space text-base font-bold">Portfolio utility built in</p>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
                                        Publish, export a PDF, track views, and keep the same URL updated as your resume changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="product" className="border-b border-stone-200 py-20 dark:border-white/10">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                            <div>
                                <h2 className="font-space text-4xl font-bold tracking-[-0.03em] text-stone-950 dark:text-white sm:text-5xl">
                                    The draft is automated. The final portfolio is still yours.
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-8 text-stone-600 dark:text-stone-300">
                                    The useful part of AI is getting you to a solid first version quickly. After that, the editor stays in your hands so the finished page reads like your work, not generated filler.
                                </p>

                                <div className="mt-10 space-y-4">
                                    {CAPABILITIES.map((item) => (
                                        <FeatureCard key={item.title} {...item} />
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                                <figure className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-[#12161d] lg:row-span-2">
                                    <img
                                        src="/images/landing/ai-editor.png"
                                        alt="PortfolioBuilder editor interface"
                                        className="w-full"
                                        width={800}
                                        height={600}
                                        loading="lazy"
                                    />
                                </figure>

                                <figure className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-[#12161d]">
                                    <img
                                        src="/images/landing/resume-analysis.png"
                                        alt="Resume analysis flow in PortfolioBuilder"
                                        className="w-full"
                                        width={800}
                                        height={600}
                                        loading="lazy"
                                    />
                                </figure>

                                <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#12161d]">
                                    <h3 className="font-space text-2xl font-bold text-stone-950 dark:text-white">
                                        Built for the actual portfolio workflow
                                    </h3>
                                    <div className="mt-6 space-y-5">
                                        {PRODUCT_NOTES.map(({ icon: Icon, title, body }) => (
                                            <div key={title} className="flex items-start gap-4">
                                                <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-900 dark:bg-white/10 dark:text-white">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-space text-lg font-bold text-stone-950 dark:text-white">
                                                        {title}
                                                    </div>
                                                    <p className="mt-1 text-sm leading-7 text-stone-600 dark:text-stone-300">
                                                        {body}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="templates" className="border-b border-stone-200 bg-stone-100/70 py-20 dark:border-white/10 dark:bg-[#10141a]">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
                            <div>
                                <h2 className="font-space text-4xl font-bold tracking-[-0.03em] text-stone-950 dark:text-white sm:text-5xl">
                                    A template system that gives you range without losing structure.
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-8 text-stone-600 dark:text-stone-300">
                                    The templates are not there to bury the content. They give your portfolio the right frame for the kind of work you do, then let your actual experience carry the page.
                                </p>

                                <div className="mt-10 overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-white/10 dark:bg-[#12161d]">
                                    <img
                                        src="/images/landing/success-impact.png"
                                        alt="Template gallery preview"
                                        className="w-full"
                                        width={800}
                                        height={600}
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {TEMPLATE_PRESETS.map((template) => (
                                    <TemplateCard key={template.name} {...template} />
                                ))}

                                <div className="sm:col-span-2 rounded-xl border border-stone-200 bg-white p-6 dark:border-white/10 dark:bg-[#12161d]">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="font-space text-2xl font-bold text-stone-950 dark:text-white">
                                                Start with the right layout, not a blank canvas
                                            </h3>
                                            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">
                                                Switch templates whenever you want while keeping the same portfolio data underneath.
                                            </p>
                                        </div>
                                        <Link to={primaryCta} className="btn-primary px-6 py-3 text-sm">
                                            Start building
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="workflow" className="border-b border-stone-200 py-20 dark:border-white/10">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="max-w-3xl">
                            <h2 className="font-space text-4xl font-bold tracking-[-0.03em] text-stone-950 dark:text-white sm:text-5xl">
                                A faster path from resume file to something worth sharing.
                            </h2>
                            <p className="mt-5 text-base leading-8 text-stone-600 dark:text-stone-300">
                                The flow is deliberately simple: upload, generate, refine, publish. The value is in how much good structure you keep at each step.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {WORKFLOW.map((step) => (
                                <WorkflowCard key={step.step} {...step} />
                            ))}
                        </div>

                        <div className="mt-8 rounded-xl border border-stone-200 bg-stone-100 px-6 py-5 text-sm text-stone-700 dark:border-white/10 dark:bg-[#12161d] dark:text-stone-200">
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                                <span className="inline-flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Google sign-in supported
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    PDF export included
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Public page analytics available
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" className="py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr]">
                            <div>
                                <h2 className="font-space text-4xl font-bold tracking-[-0.03em] text-stone-950 dark:text-white sm:text-5xl">
                                    What people need answered before they publish.
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-8 text-stone-600 dark:text-stone-300">
                                    The product is simple enough to use quickly, but strong enough that people usually want to know how much control they still keep. That is the right question.
                                </p>

                                <div className="mt-10 space-y-4">
                                    {TESTIMONIALS.map((item) => (
                                        <TestimonialCard key={item.name} {...item} />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {FAQS.map(({ question, answer }) => (
                                    <details
                                        key={question}
                                        className="group rounded-xl border border-stone-200 bg-white px-6 dark:border-white/10 dark:bg-[#12161d]"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5">
                                            <span className="font-space text-lg font-bold text-stone-950 dark:text-white">
                                                {question}
                                            </span>
                                            <span className="text-stone-400 transition-transform duration-200 group-open:rotate-90">
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </summary>
                                        <div className="pb-5 text-sm leading-7 text-stone-600 dark:text-stone-300">
                                            {answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pb-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="rounded-xl bg-[linear-gradient(135deg,#17181c,#23263a)] px-6 py-10 text-white sm:px-10 sm:py-12">
                            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                                <div>
                                    <p className="text-sm font-medium text-white/70">Resume first. Portfolio ready.</p>
                                    <h2 className="mt-3 font-space text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
                                        Build the site you wish your resume could already be.
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
                                        Start with the document you already maintain, then publish something sharper, easier to share, and easier to update.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                                    <Link to={primaryCta} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-stone-950 transition-colors hover:bg-stone-200">
                                        Start free
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a
                                        href="#product"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                                    >
                                        See how it works
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
