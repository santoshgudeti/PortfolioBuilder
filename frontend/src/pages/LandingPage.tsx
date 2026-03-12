import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ArrowRight, Zap, Globe, Palette, Edit3, Briefcase, Moon, Sun, CheckCircle, FileText, Sparkles, LayoutTemplate, Shield, BarChart3, Users, Star, Clock, Wand2, Download } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'

// React Bits Animations
import BlurText from '@/components/reactbits/BlurText'
import SplitText from '@/components/reactbits/SplitText'
import ShinyText from '@/components/reactbits/ShinyText'
import DecryptedText from '@/components/reactbits/DecryptedText'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import Magnet from '@/components/reactbits/Magnet'
import TiltedCard from '@/components/reactbits/TiltedCard'
import TrueFocus from '@/components/reactbits/TrueFocus'
import LetterGlitch from '@/components/reactbits/LetterGlitch'
import TextPressure from '@/components/reactbits/TextPressure'
import UploadProbeCard from '@/components/UploadProbeCard'

// ───────────────────────────────────────
// Brand Data
// ───────────────────────────────────────

const STATS = [
    { value: '15+', label: 'Stunning Templates' },
    { value: '60s', label: 'Average Build Time' },
    { value: '0', label: 'Lines of Code Needed' },
    { value: '∞', label: 'Customization Options' },
]

const FEATURES = [
    { icon: Zap, title: 'Instant Identity', desc: 'Transform your static resume into a living digital brand. Perfect for developers, designers, and modern professionals.' },
    { icon: Palette, title: 'Curated Aesthetics', desc: 'Choose from 15 premium templates designed by industry experts. Every layout is optimized for readability and impact.' },
    { icon: Edit3, title: 'Live Visual Control', desc: 'Fine-tune every detail with our intuitive editor. What you see is exactly what recruiters will experience.' },
    { icon: Globe, title: 'Ready to Launch', desc: 'Your new home on the web is one click away. Deploy instantly to a custom domain and start sharing.' },
    { icon: Shield, title: 'Secure Onboarding', desc: 'Get started in seconds with Google integration. Your professional data is safe, private, and always yours.' },
    { icon: BarChart3, title: 'Career Analytics', desc: 'Gain insights into who is viewing your profile. Track visits, locations, and engagement to optimize your reach.' },
    { icon: Wand2, title: 'Professional Refinement', desc: 'Polish your narrative with our built-in enhancement tools. Speak the language recruiters are looking for.' },
    { icon: Download, title: 'Cloud Data Vault', desc: 'Your professional history is stored securely. Update your experience once, and all your portfolios sync instantly.' },
]

const TEMPLATES = [
    // Professional & Classic
    { id: 'standard', label: 'Standard', color: '#f59e0b', desc: 'The elegant single-page layout that works for everyone.', category: 'Professional' },
    { id: 'corporate', label: 'Corporate', color: '#0ea5e9', desc: 'Structured two-column CV for business professionals.', category: 'Professional' },
    { id: 'student', label: 'Academic', color: '#14b8a6', desc: 'Formal serif layout for researchers and students.', category: 'Professional' },
    { id: 'tech', label: 'Tech Grid', color: '#6366f1', desc: 'Modern Bento layout for software engineers.', category: 'Professional' },
    { id: 'freelancer', label: 'Freelancer', color: '#ec4899', desc: 'Bold typography and masonry grids for creatives.', category: 'Professional' },

    // Modern & Trending
    { id: 'split', label: 'Split Screen', color: '#8b5cf6', desc: 'Dual-pane layout with fixed hero section.', category: 'Modern' },
    { id: 'terminal', label: 'Terminal', color: '#22c55e', desc: 'Retro hacker command-line aesthetic.', category: 'Modern' },
    { id: 'neobrutalism', label: 'Neobrutalism', color: '#ef4444', desc: 'Bold, high-contrast trendy design.', category: 'Modern' },
    { id: 'glassmorphism', label: 'Glass', color: '#3b82f6', desc: 'Frosted glass UI with immersive gradients.', category: 'Modern' },
    { id: 'notion', label: 'Notion', color: '#1f2937', desc: 'Clean, utilitarian document style.', category: 'Modern' },

    // Advanced & Immersive
    { id: 'apple', label: 'macOS Desktop', color: '#a8a29e', desc: 'Interactive macOS-style desktop environment.', category: 'Immersive' },
    { id: 'material', label: 'Material App', color: '#6200ea', desc: 'Google Material Design with floating actions.', category: 'Immersive' },
    { id: 'cyberpunk', label: 'Cyberpunk', color: '#f000ff', desc: 'Retro-futuristic neon grid aesthetics.', category: 'Immersive' },
    { id: 'bauhaus', label: 'Bauhaus', color: '#dc2626', desc: 'Swiss minimalist brutalism and strict grids.', category: 'Immersive' },
    { id: 'biolink', label: 'Bio Link', color: '#10b981', desc: 'Mobile-first social media link tree.', category: 'Immersive' },
]

const TEMPLATE_CATEGORIES = [
    { name: 'Professional & Classic', items: TEMPLATES.slice(0, 5), startIndex: 0 },
    { name: 'Modern & Trending', items: TEMPLATES.slice(5, 10), startIndex: 5 },
    { name: 'Advanced & Immersive', items: TEMPLATES.slice(10, 15), startIndex: 10 },
]

const HOW_IT_WORKS = [
    { step: '01', title: 'Upload Your Resume', desc: 'Simply drag and drop your current resume. We support PDF, DOCX, and more.', icon: FileText },
    { step: '02', title: 'Profile Generation', desc: 'Our engine identifies your strengths and structures them for maximum digital impact.', icon: Sparkles },
    { step: '03', title: 'Select Your Vibe', desc: 'Pick from 15 stunning professional themes. Toggle dark mode or customize colors with ease.', icon: LayoutTemplate },
    { step: '04', title: 'Launch to the World', desc: 'Deploy your portfolio at a custom URL in seconds. Share your link and track your career growth.', icon: Globe },
]

const TESTIMONIALS = [
    { name: 'Priya Sharma', role: 'Frontend Developer', text: 'I uploaded my resume and had a polished portfolio live in under a minute. The Cyberpunk template is absolutely fire.', avatar: '/assets/testimonials/priya.png' },
    { name: 'Alex Chen', role: 'Product Designer', text: 'Finally, a portfolio builder that doesn\'t require me to fight with CSS for hours. The AI rewrites are surprisingly good.', avatar: '/assets/testimonials/alex.png' },
    { name: 'Marcus Johnson', role: 'Data Scientist', text: 'The Academic template is perfect for my research portfolio. Publishing papers and projects has never been this easy.', avatar: '/assets/testimonials/marcus.png' },
]

export default function LandingPage() {
    const { theme, toggleTheme, token } = useAuthStore()
    const [activeTemplate, setActiveTemplate] = useState(0)
    const [activeStep, setActiveStep] = useState(0)

    useEffect(() => {
        const i = setInterval(() => setActiveTemplate(prev => (prev + 1) % TEMPLATES.length), 3000)
        return () => clearInterval(i)
    }, [])

    useEffect(() => {
        const i = setInterval(() => setActiveStep(prev => (prev + 1) % 4), 2000)
        return () => clearInterval(i)
    }, [])

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white overflow-x-hidden selection:bg-brand-500/30">
            <Helmet>
                <title>FolioAI — AI Portfolio Builder | Stand Out Online</title>
                <meta name="description" content="Upload your resume and let AI build a stunning portfolio website in 60 seconds. 15 premium templates, custom domains, dark mode, and analytics — all free. Stand out to recruiters and clients." />
            </Helmet>

            {/* ─── Navbar ───────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5" role="navigation" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity" aria-label="FolioAI Home">
                        <div className="w-12 h-12 sm:w-16 sm:h-16">
                            <img src="/assets/branding/logo.png" alt="FolioAI Logo" className="w-full h-full object-contain" />
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-10 mr-8">
                            <a href="#features" className="text-sm font-black text-gray-400 hover:text-brand-500 transition-all uppercase tracking-widest">Experience</a>
                            <a href="#templates" className="text-sm font-black text-gray-400 hover:text-brand-500 transition-all uppercase tracking-widest">Design</a>
                            <a href="#how-it-works" className="text-sm font-black text-gray-400 hover:text-brand-500 transition-all uppercase tracking-widest">Process</a>
                        </div>
                        <button onClick={toggleTheme} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors" aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        {token ? (
                            <Link to="/dashboard" className="btn-brand px-8">My Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:inline-flex text-sm font-black text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-all px-4 uppercase tracking-widest">
                                    <Magnet padding={20} magnetStrength={3}>
                                        Log In
                                    </Magnet>
                                </Link>
                                <Magnet padding={50} magnetStrength={5}>
                                    <Link to="/register" className="premium-gradient text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-[1.05] active:scale-[0.98] transition-all uppercase tracking-widest inline-block">
                                        Start Free
                                    </Link>
                                </Magnet>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─────────────────────────── */}
            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[92vh] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
                <motion.div
                    className="flex-1 text-center lg:text-left z-10"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/50 dark:bg-brand-900/10 dark:border-brand-500/20 px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-8 backdrop-blur-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        Trusted by 10,000+ Professionals
                    </motion.div>

                    <h1 className="mb-8">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            From Resume to{' '}
                        </motion.span>
                        <br />
                        <motion.span
                            className="bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text"
                            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            Remarkable.
                        </motion.span>
                    </h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        Stop fighting with complex website builders. Upload your resume and get a <span className="text-brand-500 dark:text-brand-400 font-bold italic">stunning professional portfolio</span> in exactly <span className="text-gray-900 dark:text-white font-bold underline decoration-brand-500 underline-offset-4">60 seconds</span>.
                    </motion.p>

                    <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                        <Link
                            to="/upload"
                            className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-gray-950 dark:bg-white text-white dark:text-gray-900 font-black text-lg shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-10px_rgba(255,255,255,0.15)] hover:bg-brand-500 dark:hover:bg-brand-500 hover:text-white dark:hover:text-white hover:-translate-y-1 transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-tighter"
                        >
                            Build Your Story <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-2xl border-2 border-gray-100 dark:border-white/10 font-black text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:border-gray-200 hover:text-gray-900 dark:hover:text-white transition-all duration-500 flex items-center justify-center uppercase tracking-widest text-sm"
                        >
                            Log In
                        </Link>
                    </div>

                    <UploadProbeCard />

                    <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No coding required</span>
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Custom domain support</span>
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Free forever</span>
                    </div>
                </motion.div>

                {/* Hero Right — Interactive Demo */}
                <motion.div
                    className="flex-1 w-full max-w-xl relative hidden md:block"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-brand-500/10 dark:bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

                    <TiltedCard rotateAmplitude={8} scaleOnHover={1.02} className="relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-3 shadow-2xl dark:shadow-[0_0_100px_rgba(0,0,0,0.6)] overflow-hidden scale-110 rotate-[2deg]">
                        <div className="absolute top-8 left-10 z-20 flex items-center gap-2 bg-gray-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
                            <div className={`w-2 h-2 rounded-full ${activeStep >= 3 ? 'bg-green-500' : 'bg-brand-400 animate-pulse'}`} />
                            <span className="text-[10px] font-mono text-white tracking-widest uppercase">
                                {activeStep >= 3 ? 'folioai.com/live-site' : 'folioai.com/processing'}
                            </span>
                        </div>

                        <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                            <img src="/assets/branding/hero.png" alt="FolioAI Platform Demo" className="w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-700" />

                            <div className="absolute inset-0 flex items-center justify-center">
                                <AnimatePresence mode="popLayout">
                                    {activeStep === 0 && (
                                        <motion.div key="step1" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0, y: 50 }} className="flex flex-col items-center gap-4 bg-white/90 dark:bg-black/90 px-8 py-6 rounded-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl">
                                            <FileText className="w-12 h-12 text-blue-500 mb-2" />
                                            <p className="font-bold text-gray-900 dark:text-white tracking-tight">Generating Portfolio...</p>
                                        </motion.div>
                                    )}
                                    {activeStep === 1 && (
                                        <motion.div key="step2" initial={{ scale: 0.8, opacity: 0, y: -50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center gap-4 bg-white/90 dark:bg-black/90 px-8 py-6 rounded-2xl border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse" />
                                                <div className="w-16 h-16 bg-white dark:bg-black border-2 border-brand-500 rounded-full flex items-center justify-center relative z-10">
                                                    <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-brand-600 dark:text-brand-400 tracking-tight">Applying Theme...</p>
                                            </div>
                                        </motion.div>
                                    )}
                                    {activeStep >= 2 && (
                                        <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-[85%] bg-white/95 dark:bg-black/95 rounded-2xl border border-white/20 backdrop-blur-2xl p-6 shadow-2xl flex flex-col">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">AD</div>
                                                <div className="flex-1">
                                                    <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded mb-1" />
                                                    <div className="h-3 w-32 bg-gray-100 dark:bg-white/5 rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded" />
                                                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded" />
                                                <div className="h-2 w-2/3 bg-gray-100 dark:bg-white/5 rounded" />
                                            </div>
                                            <div className="mt-auto flex justify-end">
                                                <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> LIVE
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </TiltedCard>
                </motion.div>
            </section>

            {/* ─── Stats Bar ──────────────────────────────── */}
            <section className="py-8 px-6 border-y border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#0a0a0a]">
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {STATS.map(({ value, label }) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-brand-500 dark:text-brand-400 tracking-tight">{value}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── How It Works ───────────────────────────── */}
            <section id="how-it-works" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-7xl font-black mb-4 tracking-tighter text-balance uppercase">
                            Your <span className="bg-gradient-to-r from-brand-500 to-indigo-500 text-transparent bg-clip-text">60-Second</span> Journey
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            No design skills. No coding. No templates to fight with. Just upload and go.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="relative card p-8 group overflow-hidden"
                            >
                                <div className="text-7xl font-black text-gray-50 dark:text-white/[0.03] absolute -top-2 -right-2 select-none group-hover:text-brand-500/10 transition-colors italic">{step}</div>
                                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 group-hover:bg-brand-500 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-brand-500/10">
                                    <Icon className="w-7 h-7 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── AI Spotlight ────────────────────────────── */}
            <section className="py-24 px-6 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/50 dark:bg-brand-900/10 dark:border-brand-500/20 px-4 py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 mb-6 uppercase tracking-widest backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5" /> Career Intelligence
                        </div>
                        <h2 className="mb-8 uppercase">
                            Your experience is <br />
                            <TrueFocus
                                sentence="limitless."
                                manualMode={false}
                                focusColor="#6366f1"
                                borderColor="#6366f1"
                                className="!p-0 translate-y-2"
                            />
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-xl leading-relaxed mb-10 font-medium">
                            Don't let rigid templates or static text define your potential. FolioAI transforms your achievements into a dynamic career story that resonates with decision-makers at every level.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Intelligent narrative refinement',
                                'Curated tone sets for global markets',
                                'Automatic professional skill synthesis',
                                'Direct alignment with modern hiring standards',
                                'Full SEO optimization for search presence',
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                                    </div>
                                    <TextPressure
                                        text={item}
                                        minWeight={400}
                                        maxWeight={800}
                                        className="cursor-pointer"
                                    />
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                        className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl font-sans"
                    >
                        <div className="mb-6 text-gray-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2"><ArrowRight className="w-3 h-3 text-red-500" /> Standard Professional Text</div>
                        <div className="p-6 bg-red-50/50 dark:bg-red-500/5 text-gray-500 dark:text-gray-500 rounded-2xl mb-10 italic border border-red-100 dark:border-red-950/20">
                            "responsible for team management and delivering the product features on schedule."
                        </div>
                        <div className="flex items-center gap-2 text-brand-500 font-bold uppercase tracking-widest text-xs mb-6"><Wand2 className="w-3 h-3 animate-pulse" /> Optimized for Success</div>
                        <div className="p-8 bg-brand-500/5 text-gray-900 dark:text-white rounded-[2rem] border-2 border-brand-500/20 shadow-xl shadow-brand-500/10 font-bold text-lg leading-snug">
                            "Orchestrated cross-functional engineering pods to accelerate product velocity by 30%, consistently deploying high-impact features under aggressive timelines."
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Template Showcase ──────────────────────── */}
            <section id="templates" className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="mb-4">
                            15 templates.<br /><span className="text-brand-500">One stunning portfolio.</span>
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            From clean corporate layouts to immersive cyberpunk aesthetics — pick the design that matches your personality. Every template supports light & dark modes.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="w-full lg:w-1/3 flex flex-col gap-6 max-h-[600px] overflow-y-auto pr-2">
                            {TEMPLATE_CATEGORIES.map((cat) => (
                                <div key={cat.name} className="flex flex-col gap-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 px-2 border-l-2 border-brand-500">
                                        {cat.name}
                                    </div>
                                    {cat.items.map((tmpl, localIndex) => {
                                        const i = cat.startIndex + localIndex
                                        return (
                                            <button
                                                key={tmpl.id}
                                                onClick={() => setActiveTemplate(i)}
                                                className={`text-left p-4 rounded-2xl transition-all duration-300 border-2 ${activeTemplate === i ? 'bg-white dark:bg-[#111] shadow-xl border-brand-500 scale-[1.02] z-10' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: tmpl.color }} />
                                                    <h3 className={`font-bold text-base ${activeTemplate === i ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{tmpl.label}</h3>
                                                </div>
                                                <p className={`text-xs ${activeTemplate === i ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>{tmpl.desc}</p>
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="w-full lg:w-2/3">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTemplate}
                                    initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                                    animate={{ opacity: 1, filter: 'blur(0)', y: 0 }}
                                    exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl relative flex items-center justify-center group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 to-transparent pointer-events-none" />
                                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center pointer-events-none">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: TEMPLATES[activeTemplate].color + '20', border: `2px solid ${TEMPLATES[activeTemplate].color}` }}>
                                            <LayoutTemplate className="w-8 h-8" style={{ color: TEMPLATES[activeTemplate].color }} />
                                        </div>
                                        <h3 className="text-2xl font-bold" style={{ color: TEMPLATES[activeTemplate].color }}>{TEMPLATES[activeTemplate].label}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{TEMPLATES[activeTemplate].desc}</p>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">{TEMPLATES[activeTemplate].category}</span>
                                    </div>

                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <Link to="/register" className="btn-primary text-lg pointer-events-auto">
                                            Use {TEMPLATES[activeTemplate].label} Template
                                        </Link>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Feature Grid ───────────────────────────── */}
            <section className="py-24 px-6 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="mb-4">
                            Everything you need to <LetterGlitch text="stand out" className="text-brand-500" />
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Not just a pretty page. FolioAI gives you the tools to build, manage, and grow your online presence.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                            <SpotlightCard
                                key={title}
                                className="card p-8 group border border-gray-200 dark:border-white/10 h-full !shadow-none !bg-white/50 dark:!bg-white/[0.02]"
                                spotlightColor={theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.05)'}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500 transition-all duration-300">
                                        <Icon className="w-7 h-7 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-3 tracking-tight group-hover:text-brand-500 transition-colors">{title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{desc}</p>
                                </motion.div>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Testimonials ────────────────────────────── */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="mb-4">
                            Loved by <span className="text-brand-500">professionals</span>
                        </h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Developers, designers, and job seekers use FolioAI to make unforgettable first impressions.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map(({ name, role, text, avatar }, i) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/5 hover:shadow-xl transition-all relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-2xl group-hover:bg-brand-500/10 transition-colors" />
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed italic relative z-10">"{text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-100 dark:border-brand-900 shadow-md">
                                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-base text-gray-900 dark:text-white">{name}</div>
                                        <div className="text-xs font-semibold text-brand-500 dark:text-brand-400 uppercase tracking-wider">{role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ──────────────────────────────── */}
            <section className="py-32 px-6 relative overflow-hidden border-t border-gray-200 dark:border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-brand-500/20 dark:from-brand-500/5 dark:to-brand-500/10" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <LayoutTemplate className="w-16 h-16 mx-auto mb-6 text-brand-500" />
                        <h2 className="mb-6">
                            Your next opportunity is one<br />portfolio away.
                        </h2>
                        <p className="mb-10 text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                            Join hundreds of developers, designers, and professionals who stopped struggling with website builders and started standing out — in 60 seconds flat.
                        </p>
                        <Link to={token ? "/upload" : "/register"} className="btn-brand text-xl px-12 py-5 shadow-2xl shadow-brand-500/30 hover:scale-[1.03] transition-transform inline-flex items-center gap-3">
                            Build Your Portfolio Now <ArrowRight className="w-6 h-6" />
                        </Link>
                        <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">Free forever • No credit card required • Takes 60 seconds</p>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ─────────────────────────────────── */}
            <footer className="py-16 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#050505]" role="contentinfo">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                        <div className="max-w-sm">
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className="w-12 h-12 sm:w-16 sm:h-16">
                                    <img src="/assets/branding/logo.png" alt="FolioAI Logo" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                                The fastest way to turn your resume into a stunning portfolio website. Powered by AI, designed for professionals who want to lead.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-brand-500/20 hover:text-brand-500 transition-colors cursor-pointer"><Globe className="w-4 h-4" /></div>
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-brand-500/20 hover:text-brand-500 transition-colors cursor-pointer"><Users className="w-4 h-4" /></div>
                            </div>
                        </div>
                        <div className="flex gap-16">
                            <div>
                                <h4 className="font-bold text-sm mb-4 text-gray-900 dark:text-white">Product</h4>
                                <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                                    <li><a href="#templates" className="hover:text-brand-500 transition-colors">Templates</a></li>
                                    <li><a href="#how-it-works" className="hover:text-brand-500 transition-colors">How It Works</a></li>
                                    <li><Link to="/register" className="hover:text-brand-500 transition-colors">Get Started</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm mb-4 text-gray-900 dark:text-white">Legal</h4>
                                <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                                    <li><Link to="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
                                    <li><Link to="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
                        <p>© {new Date().getFullYear()} FolioAI. Built for the future of work.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
