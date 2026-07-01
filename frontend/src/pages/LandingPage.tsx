import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    ChevronRight,
    Clock,
    Code2,
    Download,
    Edit3,
    FileText,
    Globe,
    LayoutTemplate,
    MessageSquare,
    Monitor,
    Palette,
    Shield,
    Smartphone,
    Sparkles,
    Upload,
    Wand2,
    type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useState } from 'react'

/* ─────────────────── DATA ─────────────────── */

const STATS = [
    { value: '2-3 mins', label: 'Average build time' },
    { value: '20', label: 'Premium templates' },
    { value: '100%', label: 'No coding needed' },
    { value: 'Free', label: 'To start, forever' },
]

const CREATOR_FEATURES = [
    'AI builds from your resume',
    'Live at your unique URL',
    'Edit anytime, history kept',
]

type WorkflowStep = {
    step: string
    title: string
    body: string
    icon: LucideIcon
}

const WORKFLOW: WorkflowStep[] = [
    {
        step: '01',
        title: 'Describe yourself',
        body: 'Upload your resume or tell the AI who you are, what you do, and what you\'ve built. Plain English, no forms.',
        icon: FileText,
    },
    {
        step: '02',
        title: 'Review and refine',
        body: 'Your portfolio appears in the editor. Change anything — copy, layout, template, or colors — until it feels right.',
        icon: Edit3,
    },
    {
        step: '03',
        title: 'Publish and share',
        body: 'One click. Live at your unique URL. Share your link and start getting discovered.',
        icon: Globe,
    },
]

type Feature = {
    icon: LucideIcon
    title: string
    body: string
}

const AI_FEATURES: Feature[] = [
    {
        icon: Wand2,
        title: 'Describe → Get a portfolio',
        body: 'Type a few sentences about yourself. The AI writes your copy, picks a design, and builds the entire page.',
    },
    {
        icon: Upload,
        title: 'Upload your resume, skip the typing',
        body: 'PDF or DOCX — just upload it. AI reads your name, role, skills, projects, and builds from it automatically.',
    },
    {
        icon: MessageSquare,
        title: 'Refine with chat',
        body: '"Make it darker." "Add a projects section." "Use a bolder font." Every change is one message away.',
    },
    {
        icon: Clock,
        title: 'Version history',
        body: 'Every build is saved. Made a change you don\'t like? Jump back to any previous version in one click.',
    },
    {
        icon: Smartphone,
        title: 'Looks great on every screen',
        body: 'Every portfolio the AI generates is fully responsive — from a 320px phone to a 4K monitor.',
    },
    {
        icon: BarChart3,
        title: 'Built-in analytics',
        body: 'Track visits, see where your traffic comes from, and understand how your portfolio is performing.',
    },
]

const TEMPLATE_PRESETS = [
    { name: 'Standard', fit: 'Classic & Versatile', accent: 'bg-brand-500' },
    { name: 'Linear', fit: 'Dark-mode Native', accent: 'bg-indigo-400' },
    { name: 'Corporate', fit: 'Professional & Enterprise', accent: 'bg-blue-600' },
    { name: 'TechGrid', fit: 'Developers & Engineers', accent: 'bg-emerald-500' },
    { name: 'Glassmorphism', fit: 'Modern & Translucent', accent: 'bg-sky-400' },
    { name: 'Cyberpunk', fit: 'Neon & Futuristic', accent: 'bg-fuchsia-500' },
    { name: 'Neobrutalism', fit: 'Bold & Raw', accent: 'bg-yellow-400' },
    { name: 'Terminal', fit: 'CLI & Hacker Aesthetic', accent: 'bg-green-500' },
]

const ROLES = [
    'Software Engineers', 'Product Designers', 'Data Scientists',
    'Writers & Editors', 'Freelancers', 'Students',
    'Marketers', 'Founders', 'Consultants',
]

type Faq = { question: string; answer: string }

const FAQS: Faq[] = [
    {
        question: 'Is it really free?',
        answer: 'Yes. The free plan gives you 1 portfolio, AI-powered building, and your own unique URL — forever. No credit card required.',
    },
    {
        question: 'Do I need to know how to code?',
        answer: 'Not at all. You just type — like you\'re texting a friend. Tell the AI who you are and what you want. It handles everything.',
    },
    {
        question: 'How long does it take?',
        answer: 'Most people have a live portfolio in under 5 minutes. The AI generates your first version in seconds. Then you can refine until it feels exactly right.',
    },
    {
        question: 'Can I use my own resume?',
        answer: 'Yes! Upload a PDF or DOCX of your resume. The AI reads it, extracts your info, and builds a personalized portfolio from it automatically.',
    },
    {
        question: 'Can I edit after publishing?',
        answer: 'Absolutely. Open the editor and change anything. Your published portfolio updates the moment you click Update.',
    },
    {
        question: 'Can I publish on my own domain?',
        answer: 'Yes. Custom domain publishing is supported, so you can move beyond the default portfolio URL whenever you\'re ready.',
    },
]

/* ─────────────────── COMPONENT ─────────────────── */

export default function LandingPage() {
    const { user } = useAuthStore()
    const primaryCta = user ? '/upload' : '/register'
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#030303] dark:text-white">
            <Helmet>
                <title>PortfolioBuilder.AI — AI Portfolio Builder | Turn Your Resume Into a Stunning Website for Free</title>
                <meta
                    name="description"
                    content="Turn your resume into a stunning AI-powered portfolio in 60 seconds. No coding. 20+ premium templates, chat-based editor, custom domains. Free forever — start now."
                />
            </Helmet>
            <Navbar />
            <main>
                {/* ════════ HERO ════════ */}
                <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
                    {/* Background glow orbs */}
                    <div className="glow-orb glow-orb-indigo absolute -top-40 right-1/4 h-[500px] w-[500px] max-sm:hidden" />
                    <div className="glow-orb glow-orb-blue absolute top-20 -left-40 h-[400px] w-[400px] opacity-10 max-md:hidden" />
                    <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.04]" />

                    <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
                        {/* Tagline badge */}
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                            AI-powered portfolio builder
                            <ChevronRight className="h-3 w-3" />
                        </div>

                        <h1 className="mx-auto max-w-3xl font-space text-4xl font-bold tracking-[-0.04em] text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                            AI Portfolio Builder —
                            <br />
                            <span className="bg-gradient-to-r from-brand-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                from resume to website in minutes
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
                            Describe yourself or upload your resume, customize it, and publish on your own unique URL within minutes. Free forever.
                        </p>

                        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <Link
                                to={primaryCta}
                                className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-7 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            >
                                Build yours — it's free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-7 py-3 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/5"
                            >
                                See how it works
                            </a>
                        </div>

                        <p className="mt-5 text-xs text-zinc-400 dark:text-zinc-600">
                            No credit card · Free forever
                        </p>
                    </div>

                    {/* ── URL Claim Pill ── */}
                    <div className="relative mx-auto mt-14 max-w-xl px-4 sm:px-6">
                        <div className="rounded-2xl border border-zinc-200 bg-white/80 px-5 py-4 backdrop-blur-lg dark:border-white/[0.08] dark:bg-white/[0.03]">
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Globe className="h-4 w-4 text-brand-500 flex-shrink-0" />
                                    <span className="text-zinc-500 dark:text-zinc-400">portfoliobuilder.ai/</span>
                                    <span className="font-bold text-zinc-950 dark:text-white">yourname</span>
                                </div>
                                <Link
                                    to={primaryCta}
                                    className="whitespace-nowrap rounded-lg bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                                >
                                    Claim yours →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════ STATS BAND ════════ */}
                <section className="border-y border-zinc-200 bg-zinc-100/50 dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-3 md:grid-cols-4">
                        {STATS.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex flex-col items-center gap-1 px-4 py-8 text-center"
                            >
                                <span className="font-space text-2xl font-bold text-zinc-950 tabular-nums dark:text-white sm:text-3xl">
                                    {stat.value}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ════════ FOR CREATORS / FOR COMPANIES ════════ */}
                <section id="features" className="py-20 sm:py-28">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-10">
                            <span className="section-label">◆ For creators</span>
                            <h2 className="mt-4 font-space text-2xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-3xl">
                                Stop hiding your best work in a GitHub README.
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                PortfolioBuilder turns what you've built into a portfolio that speaks for you. AI-generated, instantly live, yours forever.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {CREATOR_FEATURES.map((feat) => (
                                    <li key={feat} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={primaryCta}
                                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-950 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                            >
                                Build for free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ════════ HOW IT WORKS ════════ */}
                <section id="workflow" className="border-y border-zinc-200 py-20 dark:border-white/[0.06] sm:py-28">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <span className="section-label">// how it works</span>
                        <h2 className="mt-4 max-w-xl font-space text-3xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-4xl">
                            Three steps. That's it.
                        </h2>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                            {WORKFLOW.map(({ step, title, body, icon: Icon }) => (
                                <div
                                    key={step}
                                    className="group relative rounded-2xl border border-zinc-200 bg-white p-7 transition-all hover:border-zinc-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/[0.15]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-sm font-bold text-zinc-300 dark:text-zinc-700">
                                            {step}
                                        </span>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <h3 className="mt-10 font-space text-xl font-bold text-zinc-950 dark:text-white">
                                        {title}
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                        {body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════ AI BUILDER FEATURES ════════ */}
                <section className="py-20 sm:py-28">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <span className="section-label">// ai builder</span>
                        <h2 className="mt-4 max-w-2xl font-space text-3xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-4xl">
                            Your AI does the heavy lifting.
                        </h2>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                            Type a few sentences. Upload a resume. Chat to refine. The AI handles design, copy, and code.
                        </p>

                        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {AI_FEATURES.map(({ icon: Icon, title, body }) => (
                                <div
                                    key={title}
                                    className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/[0.15]"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mt-5 font-space text-lg font-bold text-zinc-950 dark:text-white">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                        {body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════ WORKS FOR EVERYONE ════════ */}
                <section className="border-y border-zinc-200 py-20 dark:border-white/[0.06] sm:py-28">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <span className="section-label">// works for everyone</span>
                        <h2 className="mt-4 max-w-xl font-space text-3xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-4xl">
                            Whatever you do, we build for it.
                        </h2>

                        <div className="mt-10 flex flex-wrap gap-3">
                            {ROLES.map((role) => (
                                <span
                                    key={role}
                                    className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:border-white/[0.15] dark:hover:bg-white/[0.05]"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════ TEMPLATES ════════ */}
                <section id="templates" className="py-20 sm:py-28">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <span className="section-label">// templates</span>
                        <h2 className="mt-4 max-w-xl font-space text-3xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-4xl">
                            Start with something beautiful.
                        </h2>
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                            Don't start from a blank page. Pick a template, then let the AI make it yours. Handcrafted designs — editorial, cinematic, minimal, bold.
                        </p>

                        <div className="mt-12 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {TEMPLATE_PRESETS.map((t) => (
                                <div
                                    key={t.name}
                                    className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4 transition-all hover:border-zinc-300 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/[0.15] sm:gap-4 sm:px-5 sm:py-5"
                                >
                                    <span className={`h-3 w-3 flex-shrink-0 rounded-full ${t.accent}`} />
                                    <div className="min-w-0">
                                        <h3 className="font-space text-sm font-bold text-zinc-950 dark:text-white sm:text-base">
                                            {t.name}
                                        </h3>
                                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">
                                            {t.fit}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <Link
                                to={primaryCta}
                                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-950 transition-colors hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                            >
                                Browse all templates
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ════════ TESTIMONIALS ════════ */}
                <section className="border-t border-zinc-200 py-20 dark:border-white/[0.06] sm:py-28">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <span className="section-label">// trusted by builders</span>
                        <h2 className="mt-4 max-w-xl font-space text-3xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-4xl">
                            Loved by professionals.
                        </h2>

                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    quote: "Built my portfolio in under 5 minutes. The AI actually understood my resume — it's like magic.",
                                    name: 'Rahul S.',
                                    role: 'Software Engineer, Bengaluru',
                                },
                                {
                                    quote: 'I tried Webflow, Framer, and Read.cv. Nothing is this fast. Upload → edit → publish in one sitting.',
                                    name: 'Ananya P.',
                                    role: 'Product Designer, Mumbai',
                                },
                                {
                                    quote: 'The terminal template alone is worth it. Perfect for my GitHub portfolio. Recruiters loved it.',
                                    name: 'Vikram M.',
                                    role: 'Full-Stack Developer, Pune',
                                },
                            ].map(({ quote, name, role }) => (
                                <div
                                    key={name}
                                    className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/[0.08] dark:bg-white/[0.03]"
                                >
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-4">
                                        &ldquo;{quote}&rdquo;
                                    </p>
                                    <p className="text-sm font-bold text-zinc-950 dark:text-white">{name}</p>
                                    <p className="text-xs text-zinc-500">{role}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-brand-500" />
                                Built by <a href="https://github.com/santoshgudeti" target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-950 dark:text-white hover:text-brand-600">Santosh Gudeti</a>
                            </span>
                            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">|</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Code2 className="w-4 h-4 text-brand-500" />
                                Open source on <a href="https://github.com/santoshgudeti/PortfolioBuilder" target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-950 dark:text-white hover:text-brand-600">GitHub</a>
                            </span>
                        </div>
                    </div>
                </section>

                {/* ════════ FAQ ════════ */}
                <section id="faq" className="border-t border-zinc-200 py-20 dark:border-white/[0.06] sm:py-28">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6">
                        <span className="section-label">// faq</span>
                        <h2 className="mt-4 font-space text-3xl font-bold tracking-[-0.03em] text-zinc-950 dark:text-white sm:text-4xl">
                            Frequently asked questions.
                        </h2>

                        <div className="mt-12 space-y-3">
                            {FAQS.map(({ question, answer }, i) => (
                                <div
                                    key={question}
                                    className="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-5"
                                    >
                                        <span className="font-space text-sm font-bold text-zinc-950 dark:text-white sm:text-base">
                                            {question}
                                        </span>
                                        <ChevronRight
                                            className={`h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-200 ${
                                                openFaq === i ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-4 pb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:px-6 sm:pb-5">
                                            {answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════ FINAL CTA ════════ */}
                <section className="py-20 sm:py-28">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 px-6 py-14 text-center dark:border-white/[0.08] sm:px-16 sm:py-20">
                            {/* Glow behind */}
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/20 blur-[80px] sm:h-60 sm:w-96 sm:blur-[100px]" />
                            </div>

                            <div className="relative">
                                <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                                    // your turn
                                </span>
                                <h2 className="mx-auto mt-4 max-w-lg font-space text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                                    Build the portfolio you should've had.
                                </h2>
                                <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
                                    Free forever. No credit card. Your identity, live in minutes.
                                </p>

                                <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                    <Link
                                        to={primaryCta}
                                        className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-zinc-950 shadow-lg transition-all hover:bg-zinc-200"
                                    >
                                        Get started — free
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a
                                        href="#features"
                                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-7 py-3 text-sm font-medium text-white transition-all hover:bg-white/5"
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
