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
    { id: 'standard', label: 'Executive', color: '#f59e0b', desc: 'Minimalist layout for high-impact leadership roles.', category: 'Professional' },
    { id: 'corporate', label: 'Atlas', color: '#0ea5e9', desc: 'Powerhouse structure for multi-faceted careers.', category: 'Professional' },
    { id: 'student', label: 'Scholar', color: '#14b8a6', desc: 'Sophisticated typography for research & education.', category: 'Professional' },
    { id: 'tech', label: 'Bento Grid', color: '#6366f1', desc: 'The gold standard for software engineering portfolios.', category: 'Professional' },
    { id: 'freelancer', label: 'Studio', color: '#ec4899', desc: 'Creative masonry layout for designers and artists.', category: 'Professional' },

    // Modern & Trending
    { id: 'split', label: 'Horizon', color: '#8b5cf6', desc: 'Cinematic split-screen for immersive storytelling.', category: 'Modern' },
    { id: 'terminal', label: 'Kernel', color: '#22c55e', desc: 'A love letter to developer culture and CLI.', category: 'Modern' },
    { id: 'neobrutalism', label: 'Impact', color: '#ef4444', desc: 'Raw, high-contrast, and impossible to ignore.', category: 'Modern' },
    { id: 'glassmorphism', label: 'Crystal', color: '#3b82f6', desc: 'Modern transparency with vibrant depth.', category: 'Modern' },
    { id: 'notion', label: 'Canvas', color: '#1f2937', desc: 'Pure focus. Utilitarian design that breathes.', category: 'Modern' },

    // Advanced & Immersive
    { id: 'apple', label: 'Meta', color: '#a8a29e', desc: 'Interactive desktop experience for power users.', category: 'Immersive' },
    { id: 'material', label: 'Blueprint', color: '#6200ea', desc: 'Smooth transitions and depth-based interactions.', category: 'Immersive' },
    { id: 'cyberpunk', label: 'Neon', color: '#f000ff', desc: 'The future of digital presence, tonight.', category: 'Immersive' },
    { id: 'bauhaus', label: 'Radical', color: '#dc2626', desc: 'Strict grids meets bold geometric expression.', category: 'Immersive' },
    { id: 'biolink', label: 'Flow', color: '#10b981', desc: 'Sleek, mobile-first social identity gateway.', category: 'Immersive' },
]

const LOGOS = [
    { name: 'Google', icon: Globe },
    { name: 'Meta', icon: Shield },
    { name: 'Amazon', icon: Zap },
    { name: 'Apple', icon: LayoutTemplate },
    { name: 'Netflix', icon: Palette },
]


const FAQS = [
    { q: 'How does the AI builder work?', a: 'Our engine parses your resume using advanced NLP to extract key achievements, skills, and metrics, then automatically maps them to your chosen professional template.' },
    { q: 'Can I use my own domain?', a: 'Yes! Pro users can easily connect any custom domain to their portfolio with one-click SSL setup.' },
    { q: 'Do I need to know how to code?', a: 'Absolutely not. PortfolioBuilder.AI is a 100% no-code platform. If you can drag and drop, you can build a stunning site.' },
    { q: 'Is my data secure?', a: 'We use enterprise-grade encryption for all data and never sell your professional information to third parties.' },
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
    { name: 'Priya Sharma', role: 'Frontend Developer, Bangalore', text: 'I uploaded my resume and had a polished portfolio live in under a minute. The Cyberpunk template is absolutely fire for showcasing my side projects.', avatar: 'https://i.pravatar.cc/150?u=priya' },
    { name: 'Rohan Mehta', role: 'Full Stack Engineer, Mumbai', text: 'Finally, a portfolio builder that doesn\'t require me to fight with CSS for hours. The AI-generated phrasing helped me stand out in a very competitive job market.', avatar: 'https://i.pravatar.cc/150?u=rohan' },
    { name: 'Ananya Iyer', role: 'Product Designer, Gurgaon', text: 'The Bento Grid layout is perfect for my design case studies. It captures my aesthetic perfectly without me needing to write a single line of code.', avatar: 'https://i.pravatar.cc/150?u=ananya' },
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
                <title>PortfolioBuilder.AI — AI Portfolio Builder | Stand Out Online</title>
                <meta name="description" content="Upload your resume and let AI build a stunning portfolio website in 60 seconds. 15 premium templates, custom domains, dark mode, and analytics — all free." />
            </Helmet>

            {/* ─── Navbar ───────────────────────────────── */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl border-b border-gray-100 dark:border-white/5" role="navigation" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group" aria-label="PortfolioBuilder.AI Home">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-brand-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-xl sm:text-2xl font-black tracking-tighter text-gray-900 dark:text-white relative">
                                PortfolioBuilder<span className="bg-gradient-to-r from-brand-500 to-indigo-500 text-transparent bg-clip-text">.AI</span>
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {['Experience', 'Design', 'FAQ'].map(item => (
                            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-xs font-bold text-gray-400 hover:text-brand-500 transition-all uppercase tracking-[0.2em]">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors" aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        {token ? (
                            <Link to="/dashboard" className="btn-brand px-6 py-2.5 !rounded-xl text-xs">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:inline-flex text-xs font-black text-gray-400 hover:text-brand-500 transition-all px-4 uppercase tracking-widest">
                                    Log In
                                </Link>
                                <Link to="/register" className="premium-gradient text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-widest">
                                    Start Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─────────────────────────── */}
            <section className="relative pt-44 pb-32 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-[radial-gradient(circle_at_center,_var(--brand-500)_0%,_transparent_70%)] opacity-[0.03] dark:opacity-[0.07] blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 rounded-full border border-brand-200/50 bg-brand-50/50 dark:bg-brand-950/20 dark:border-brand-500/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-10 backdrop-blur-md"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        Trusted by 10,000+ top-tier professionals
                    </motion.div>

                    <h1 className="mb-8 max-w-5xl">
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-block"
                        >
                            Your career deserves a
                        </motion.span>
                        <br />
                        <motion.span
                            className="bg-gradient-to-r from-brand-500 via-indigo-400 to-purple-500 text-transparent bg-clip-text inline-block"
                            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Digital Home.
                        </motion.span>
                    </h1>

                    <motion.p
                        className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        Transform your static resume into a stunning, professional portfolio in exactly <span className="text-gray-900 dark:text-white font-black underline decoration-brand-500 underline-offset-8">60 seconds</span>. Powered by AI, designed for impact.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row items-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <Link
                            to="/upload"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gray-950 dark:bg-white text-white dark:text-gray-900 font-black text-sm shadow-2xl hover:bg-brand-500 dark:hover:bg-brand-500 hover:text-white dark:hover:text-white transition-all duration-500 flex items-center justify-center gap-3 uppercase tracking-widest group"
                        >
                            Build Your Story
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 font-black text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-500 uppercase tracking-widest text-xs"
                        >
                            Watch Demo
                        </Link>
                    </motion.div>

                    <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {LOGOS.map((logo) => (
                            <div key={logo.name} className="flex items-center gap-2 group cursor-default">
                                <logo.icon className="w-5 h-5 group-hover:text-brand-500 transition-colors" />
                                <span className="font-black text-sm uppercase tracking-tighter">{logo.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Dashboard Preview */}
                <motion.div
                    className="mt-24 max-w-6xl mx-auto px-6 relative"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                >
                    <div className="absolute -inset-4 bg-gradient-to-b from-brand-500/20 to-transparent blur-3xl opacity-20 -z-10" />
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-3 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="aspect-[16/9] rounded-[2rem] bg-gray-50 dark:bg-[#0d0d0d] overflow-hidden relative">
                            <img
                                src="/assets/branding/hero.png"
                                alt="PortfolioBuilder Dashboard"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                            />
                            {/* Floating UI Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-1/4 right-10 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl hidden lg:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase">Status</div>
                                        <div className="text-xs font-bold">Successfully Deployed</div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-1/4 left-10 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl hidden lg:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                                        <BarChart3 className="w-4 h-4 text-brand-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase">Growth</div>
                                        <div className="text-xs font-bold">+128 Profile Views</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ─── Stats Bar ──────────────────────────────── */}
            <section className="py-20 px-6 border-y border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-[#080808] relative">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-12">
                    {STATS.map(({ value, label }) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center md:text-left">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{value}</div>
                            <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── How It Works ───────────────────────────── */}
            <section id="experience" className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="mb-6">The <span className="text-brand-500">Fastest</span> Path to Hire.</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Stop fighting with rigid builders. We streamlined the entire process so you can focus on what matters — your career.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="text-[120px] font-black text-gray-100 dark:text-white/[0.02] absolute -top-12 -left-4 select-none group-hover:text-brand-500/5 transition-colors leading-none -z-10">{step}</div>
                                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500 transition-all duration-500">
                                    <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-3 tracking-tight">{title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── AI Spotlight ────────────────────────────── */}
            <section className="py-32 px-6 bg-gray-50/50 dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/50 dark:bg-brand-950/20 dark:border-brand-500/20 px-4 py-1.5 text-[10px] font-black text-brand-600 dark:text-brand-400 mb-8 uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" /> Career Intelligence
                        </div>
                        <h2 className="mb-8 leading-[1.1]">
                            Your accomplishments,<br />
                            <span className="text-brand-500">Perfectly Phrased.</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-10">
                            Our AI doesn't just copy-paste. It analyzes your experience to find the narrative threads that modern recruiters look for.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                'Intelligent narrative refinement',
                                'Skill synthesis engine',
                                'SEO-optimized profiles',
                                'Global market alignment',
                            ].map(item => (
                                <div key={item} className="flex items-center gap-3 bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                        className="relative bg-white dark:bg-[#0d0d0d] p-8 lg:p-12 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl group"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <Wand2 className="w-6 h-6 text-brand-500 animate-pulse opacity-50" />
                        </div>
                        <div className="mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Input</div>
                        <div className="p-5 bg-red-50/50 dark:bg-red-500/5 text-gray-500 text-xs rounded-xl mb-8 italic border border-red-100 dark:border-red-950/10">
                            "responsible for team management and delivering features."
                        </div>
                        <div className="mb-4 text-[10px] font-black text-brand-500 uppercase tracking-widest">AI Optimized</div>
                        <div className="p-6 bg-brand-500/5 text-gray-900 dark:text-white rounded-2xl border border-brand-500/20 shadow-xl shadow-brand-500/10 font-bold text-base leading-snug">
                            "Orchestrated cross-functional engineering pods to accelerate product velocity by 30%, consistently deploying high-impact features under aggressive timelines."
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Template Showcase ──────────────────────── */}
            <section id="design" className="py-32 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="mb-6">
                            Pick Your <span className="text-brand-500">Aesthetic.</span>
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            15 high-end templates optimized for conversion. From clean minimalist grids to immersive interactive experiences.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        <div className="w-full lg:w-80 flex flex-col gap-8 flex-shrink-0">
                            {TEMPLATE_CATEGORIES.map((cat) => (
                                <div key={cat.name} className="flex flex-col gap-3">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-2 px-2">
                                        {cat.name}
                                    </div>
                                    {cat.items.map((tmpl, localIndex) => {
                                        const i = cat.startIndex + localIndex
                                        return (
                                            <button
                                                key={tmpl.id}
                                                onClick={() => setActiveTemplate(i)}
                                                className={`text-left p-4 rounded-xl transition-all duration-300 border ${activeTemplate === i ? 'bg-white dark:bg-white/5 border-brand-500/50 shadow-glow-sm' : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tmpl.color }} />
                                                    <span className={`text-sm font-bold ${activeTemplate === i ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{tmpl.label}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTemplate}
                                    initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }}
                                    exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.4 }}
                                    className="relative aspect-video lg:aspect-[16/10] bg-gray-50 dark:bg-[#0a0a0a] rounded-[2.5rem] border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl group"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color)_0%,_transparent_50%)] opacity-20" style={{ '--color': TEMPLATES[activeTemplate].color } as any} />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                                        <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500" style={{ backgroundColor: TEMPLATES[activeTemplate].color + '20', border: `1px solid ${TEMPLATES[activeTemplate].color}50` }}>
                                            <LayoutTemplate className="w-8 h-8" style={{ color: TEMPLATES[activeTemplate].color }} />
                                        </div>
                                        <h3 className="text-3xl font-black mb-4 tracking-tighter" style={{ color: TEMPLATES[activeTemplate].color }}>{TEMPLATES[activeTemplate].label}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">{TEMPLATES[activeTemplate].desc}</p>

                                        <Link to="/register" className="btn-brand !px-10 !py-4 text-xs">
                                            Use this Template
                                        </Link>
                                    </div>

                                    {/* Mock Browser Header */}
                                    <div className="absolute top-0 inset-x-0 h-10 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center px-6 gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                                        <div className="w-2 h-2 rounded-full bg-green-400/50" />
                                        <div className="ml-4 h-5 px-4 bg-white/50 dark:bg-white/5 rounded-full text-[10px] font-mono text-gray-400 flex items-center border border-gray-200 dark:border-white/5">
                                            portfolio.ai/remarkable
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Feature Grid ───────────────────────────── */}
            <section className="py-32 px-6 bg-gray-50/50 dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-white/5 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="mb-6">Everything you <span className="text-brand-500">Need.</span></h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Powerful tools baked into every portfolio. Manage your professional brand with precision.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                            <SpotlightCard
                                key={title}
                                className="p-8 group border border-gray-100 dark:border-white/5 !bg-white/80 dark:!bg-white/[0.02] !rounded-[2rem] h-full"
                                spotlightColor={theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'}
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:bg-brand-500 transition-all duration-500">
                                    <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400 group-hover:text-white" />
                                </div>
                                <h3 className="text-base font-bold mb-3 tracking-tight group-hover:text-brand-500 transition-colors">{title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{desc}</p>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>


            {/* ─── Testimonials ────────────────────────────── */}
            <section className="py-32 px-6 bg-gray-50/50 dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="mb-6">Global <span className="text-brand-500">Love.</span></h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Join 10,000+ professionals who transformed their careers.
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
                                className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all relative group"
                            >
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed italic text-sm">"{text}"</p>
                                <div className="flex items-center gap-4 border-t border-gray-100 dark:border-white/5 pt-6">
                                    <img src={avatar} alt={name} className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                                    <div>
                                        <div className="font-black text-xs text-gray-900 dark:text-white uppercase tracking-tighter">{name}</div>
                                        <div className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ Section ─────────────────────────────── */}
            <section id="faq" className="py-32 px-6 relative">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="mb-6">Common <span className="text-brand-500">Questions.</span></h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">Everything you need to know about getting started.</p>
                    </div>
                    <div className="space-y-6">
                        {FAQS.map(({ q, a }, i) => (
                            <motion.details
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{q}</span>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-open:rotate-180 transition-transform">
                                        <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                                    </div>
                                </summary>
                                <div className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-4">
                                    {a}
                                </div>
                            </motion.details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ──────────────────────────────── */}
            <section className="py-44 px-6 relative overflow-hidden bg-gray-950 dark:bg-white text-white dark:text-gray-900">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-brand-500 opacity-20 blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        <h2 className="text-5xl lg:text-7xl mb-10 tracking-tighter leading-[0.9]">
                            Stop building.<br />
                            <span className="text-brand-500">Start standing out.</span>
                        </h2>
                        <p className="mb-12 text-xl opacity-70 leading-relaxed max-w-2xl mx-auto">
                            Join 10,000+ professionals. It takes exactly 60 seconds. No credit card required.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to={token ? "/upload" : "/register"} className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-brand-500 text-white text-sm font-black uppercase tracking-widest shadow-2xl shadow-brand-500/30 hover:-translate-y-1 transition-all">
                                Get Started Free
                            </Link>
                            <Link to="/login" className="w-full sm:w-auto px-12 py-6 rounded-2xl bg-white/10 dark:bg-gray-950/10 border border-white/20 dark:border-gray-950/20 text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                                Watch Demo
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Footer ─────────────────────────────────── */}
            <footer className="py-24 px-6 bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                        <div className="md:col-span-2">
                            <Link to="/" className="inline-block mb-8">
                                <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                                    PortfolioBuilder<span className="bg-gradient-to-r from-brand-500 to-indigo-500 text-transparent bg-clip-text">.AI</span>
                                </span>
                            </Link>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs text-sm leading-relaxed">
                                The ultimate digital identity engine for modern professionals. Powered by AI, designed by experts.
                            </p>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Product</div>
                            <ul className="space-y-4">
                                {['Features', 'Templates', 'API'].map(item => (
                                    <li key={item}><a href="#" className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors uppercase tracking-widest">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Legal</div>
                            <ul className="space-y-4">
                                {['Privacy', 'Terms', 'Cookies', 'Security'].map(item => (
                                    <li key={item}><a href="#" className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors uppercase tracking-widest">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-gray-100 dark:border-white/5">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            © {new Date().getFullYear()} PortfolioBuilder.AI. All rights reserved.
                        </div>
                        <div className="flex gap-8">
                            {['Twitter', 'LinkedIn', 'YouTube'].map(item => (
                                <a key={item} href="#" className="text-[10px] font-black text-gray-400 hover:text-brand-500 uppercase tracking-widest">{item}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
