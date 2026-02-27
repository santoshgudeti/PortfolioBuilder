import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Globe, Palette, Edit3, Briefcase, Moon, Sun, CheckCircle, FileText, Sparkles, LayoutTemplate } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'

const features = [
    { icon: Zap, title: 'AI-Powered Parsing', desc: 'Upload your resume and our Groq LLM instantly extracts and structures your data.' },
    { icon: Palette, title: '5 Beautiful Themes', desc: 'Choose from Minimal, Corporate, Tech Grid, Freelancer, or Academic layouts.' },
    { icon: Edit3, title: 'Live Editor', desc: 'Edit every section inline. Change colors, toggle sections, and preview instantly.' },
    { icon: Globe, title: 'Publish Instantly', desc: 'Get a unique public URL like yourapp.com/u/your-name in one click.' },
]

const TEMPLATES = [
    { id: 'tech', label: 'Tech Grid', color: '#6366f1', desc: 'Modern Bento Box layout for software engineers.' },
    { id: 'corporate', label: 'Corporate HR', color: '#0ea5e9', desc: 'Structured two-column CV for business professionals.' },
    { id: 'freelancer', label: 'Creative Freelancer', color: '#ec4899', desc: 'Bold typography and masonry grids for designers.' },
    { id: 'student', label: 'Academic / Student', color: '#14b8a6', desc: 'Formal serif document tailored for research and publications.' },
    { id: 'standard', label: 'Standard Layout', color: '#f59e0b', desc: 'The classic, elegant single-page portfolio layout.' },
]

export default function LandingPage() {
    const { theme, toggleTheme, token } = useAuthStore()
    const [activeTemplate, setActiveTemplate] = useState(0)
    const [activeStep, setActiveStep] = useState(0)

    // Auto-scroll templates every 3s
    useEffect(() => {
        const i = setInterval(() => {
            setActiveTemplate(prev => (prev + 1) % TEMPLATES.length)
        }, 3000)
        return () => clearInterval(i)
    }, [])

    // Auto-progress AI steps
    useEffect(() => {
        const i = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 4)
        }, 2000)
        return () => clearInterval(i)
    }, [])

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white overflow-x-hidden selection:bg-brand-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Resume2Portfolio</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="btn-ghost p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        {token ? (
                            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost hidden sm:block">Sign In</Link>
                                <Link to="/register" className="btn-primary shadow-lg shadow-brand-500/25">Get Started <ArrowRight className="w-4 h-4" /></Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Split Hero Section */}
            <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[90vh] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
                {/* Hero Left (Copy & CTA) */}
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
                        className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-800/50 px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 mb-8 shadow-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Portfolio Generation
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black tracking-tighter mb-6 leading-[1.1]">
                        Turn your resume into a <br className="hidden md:block" />
                        <span className="gradient-text bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">stunning website.</span>
                    </h1>

                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
                        Stop struggling with drag-and-drop builders. Upload your PDF and let our AI extract, enhance, and deploy your professional portfolio in under <span className="text-brand-500 dark:text-brand-400 font-bold">60 seconds</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link to="/upload" className="btn-primary text-lg px-8 py-4 shadow-xl shadow-brand-500/25 hover:scale-105 transition-transform">
                            Create Free Portfolio <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a href="#templates" className="btn-secondary text-lg px-8 py-4 hover:bg-gray-100 dark:hover:bg-white/5">
                            View Templates
                        </a>
                    </div>

                    <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No coding required</span>
                        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Custom domain support</span>
                    </div>
                </motion.div>

                {/* Hero Right (Animation Gimmick) */}
                <motion.div
                    className="flex-1 w-full max-w-xl relative hidden md:block"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    {/* Glowing background blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-500/20 dark:bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                        {/* Fake Browser Chrome */}
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <div className="ml-4 flex-1 bg-gray-100 dark:bg-white/5 rounded-md h-6 flex items-center px-3 font-mono text-[10px] text-gray-400">
                                {activeStep >= 3 ? 'yourapp.com/u/alex-dev' : 'resume2portfolio.ai/upload'}
                            </div>
                        </div>

                        {/* Animated Step Pipeline */}
                        <div className="relative h-[300px] flex items-center justify-center">
                            <AnimatePresence mode="popLayout">
                                {activeStep === 0 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="w-24 h-32 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg flex flex-col items-center justify-center shadow-lg">
                                            <FileText className="w-10 h-10 text-blue-500 mb-2" />
                                            <div className="w-12 h-1 bg-blue-200 dark:bg-blue-800 rounded mb-1" />
                                            <div className="w-16 h-1 bg-blue-200 dark:bg-blue-800 rounded mb-1" />
                                            <div className="w-10 h-1 bg-blue-200 dark:bg-blue-800 rounded" />
                                        </div>
                                        <p className="font-bold text-gray-500 dark:text-gray-400">1. Reading Resume PDF...</p>
                                    </motion.div>
                                )}
                                {activeStep === 1 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ scale: 0.8, opacity: 0, y: -50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse" />
                                            <div className="w-24 h-24 bg-white dark:bg-black border-2 border-brand-500 rounded-full flex items-center justify-center relative z-10">
                                                <Zap className="w-10 h-10 text-brand-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-brand-600 dark:text-brand-400">2. LLM Extracting Data...</p>
                                            <p className="text-xs text-brand-400 mt-1 font-mono">Found 3 projects, 4 roles</p>
                                        </div>
                                    </motion.div>
                                )}
                                {activeStep >= 2 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.5 }}
                                        className="w-full h-full border border-gray-100 dark:border-white/5 rounded-xl bg-white dark:bg-[#0a0a0a] overflow-hidden p-6 shadow-inner flex flex-col"
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">JD</div>
                                            <div>
                                                <h3 className="text-xl font-bold dark:text-white text-gray-900 leading-tight">John Doe</h3>
                                                <p className="text-brand-500 font-medium text-sm">Senior Full Stack Developer</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {['React', 'TypeScript', 'Node.js', 'Python'].map(s => (
                                                <span key={s} className="px-2 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md text-xs font-medium dark:text-gray-300 text-gray-700">{s}</span>
                                            ))}
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#111]">
                                                <p className="font-bold text-sm mb-1 dark:text-gray-200">E-Commerce Platform</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">Built a high-performance shopping cart using Next.js and Redis, increasing conversion rates by 25%.</p>
                                            </div>
                                            <div className="flex-1 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#111]">
                                                <p className="font-bold text-sm mb-1 dark:text-gray-200">Analytics Dashboard</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">Designed real-time data visualization charts with D3.js processing 10k events/sec.</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-green-500 text-center text-sm mt-auto absolute bottom-4 right-4 bg-white dark:bg-black px-3 py-1.5 shadow border border-gray-100 dark:border-white/10 rounded-full flex items-center gap-1.5 z-10"><CheckCircle className="w-3.5 h-3.5" /> Published Live</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* AI Magic Spotlight */}
            <section className="py-24 px-6 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center mb-6">
                            <Sparkles className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6 tracking-tight">AI that actually understands context.</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                            We don't just copy-paste your PDF. Our fine-tuned Groq LLM agent reads your entire resume, understands your core competencies, and automatically rewrites clunky bullet points into impactful, ATS-friendly website copy.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Smart Role Extraction",
                                "Tone Optimization (Professional vs Creative)",
                                "Automatic Skill Categorization",
                                "Project Context Enhancement"
                            ].map(item => (
                                <li key={item} className="flex items-center gap-3 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                                        <CheckCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl font-mono text-sm leading-relaxed"
                    >
                        <div className="mb-4 text-gray-400 flex items-center gap-2"><FileText className="w-4 h-4" /> Original Resume Text:</div>
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-300 rounded-xl mb-6 line-through decoration-red-300 dark:decoration-red-800">
                            "worked on making the database faster for the app and fixing bugs."
                        </div>
                        <div className="flex items-center gap-2 text-brand-500 mb-4 animate-pulse"><Zap className="w-4 h-4" /> AI Enhancement:</div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-900 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/30">
                            "Spearheaded database optimization strategies, improving query performance by 40% and resolving critical backend bottlenecks to ensure high application availability."
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Template Showcase (GIF/Mock Carousel) */}
            <section id="templates" className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">One Curriculum. <br /> <span className="text-brand-500">Infinite Aesthetics.</span></h2>
                        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Switch instantly between 5 radically different structural templates designed for different industries. Every template supports full Light and Dark modes.
                        </p>
                    </div>

                    {/* Interactive Template Selector */}
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="w-full lg:w-1/3 flex flex-col gap-2">
                            {TEMPLATES.map((tmpl, i) => (
                                <button
                                    key={tmpl.id}
                                    onClick={() => setActiveTemplate(i)}
                                    className={`text-left p-6 rounded-2xl transition-all duration-300 border-2 ${activeTemplate === i ? 'bg-white dark:bg-[#111] shadow-xl border-brand-500 scale-105 z-10' : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tmpl.color }} />
                                        <h3 className={`font-bold text-lg ${activeTemplate === i ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{tmpl.label}</h3>
                                    </div>
                                    <p className={`text-sm ${activeTemplate === i ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>{tmpl.desc}</p>
                                </button>
                            ))}
                        </div>

                        {/* Template Auto-Carousel Visual */}
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

                                    {/* Mock View based on Template selection. Using placeholders but styling to look realistic */}
                                    <div className="w-full h-full p-8 flex flex-col pointer-events-none">
                                        <div className="flex items-center justify-between border-b pb-4 mb-4 border-black/10 dark:border-white/10">
                                            <div className="font-bold text-2xl" style={{ color: TEMPLATES[activeTemplate].color }}>{TEMPLATES[activeTemplate].label} View</div>
                                            <div className="flex gap-2">
                                                <div className="w-8 h-2 rounded bg-gray-300 dark:bg-gray-700" />
                                                <div className="w-12 h-2 rounded bg-gray-300 dark:bg-gray-700" />
                                            </div>
                                        </div>

                                        {/* Dynamic realistic mockup representing the layout */}
                                        <div className="flex-1 overflow-hidden">
                                            {TEMPLATES[activeTemplate].id === 'standard' && (
                                                <div className="h-full flex flex-col items-center justify-center text-center gap-4 bg-white dark:bg-[#111] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">AS</div>
                                                    <div>
                                                        <h4 className="text-2xl font-bold dark:text-white">Alex Smith</h4>
                                                        <p className="text-amber-500 font-medium">Software Engineer • UI Designer</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">Building digital products, brands, and experience. Specializing in frontend architecture and accessible design systems.</p>
                                                </div>
                                            )}
                                            {TEMPLATES[activeTemplate].id === 'corporate' && (
                                                <div className="h-full flex gap-4">
                                                    <div className="w-1/3 bg-gray-50 dark:bg-[#111] rounded-xl p-4 border border-gray-100 dark:border-white/5 flex flex-col gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">JD</div>
                                                            <div>
                                                                <h4 className="font-bold text-sm dark:text-white">John Doe</h4>
                                                                <p className="text-[10px] text-sky-500 font-medium">Product Manager</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 mt-2">
                                                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200 border-b pb-1 border-gray-200 dark:border-white/10">Skills</div>
                                                            <div className="flex flex-wrap gap-1"><span className="text-[9px] bg-white dark:bg-[#222] px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10">Agile</span><span className="text-[9px] bg-white dark:bg-[#222] px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10">Scrum</span><span className="text-[9px] bg-white dark:bg-[#222] px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10">Strategy</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="w-2/3 bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border border-gray-100 dark:border-white/5 flex flex-col gap-3">
                                                        <div className="text-xs font-bold text-sky-500 uppercase tracking-wider">Experience</div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-baseline"><span className="text-sm font-bold dark:text-white">Director of Product</span><span className="text-[10px] text-gray-400">2020 - Present</span></div>
                                                            <p className="text-[9px] text-gray-500 dark:text-gray-400">Led a cross-functional team of 15 engineers and designers to launch the flagship enterprise SaaS platform.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {TEMPLATES[activeTemplate].id === 'tech' && (
                                                <div className="h-full grid grid-cols-3 grid-rows-2 gap-3">
                                                    <div className="col-span-2 row-span-1 bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 to-white dark:to-[#111] rounded-xl p-4 border border-indigo-100 dark:border-indigo-500/20 flex flex-col justify-center">
                                                        <h4 className="text-xl font-bold dark:text-white">Building scalable systems</h4>
                                                        <p className="text-xs text-indigo-500 mt-1">Backend Developer & Cloud Architect</p>
                                                    </div>
                                                    <div className="col-span-1 row-span-2 bg-[#111] dark:bg-black text-green-400 rounded-xl p-4 font-mono text-[10px] flex flex-col gap-2 border border-black dark:border-white/5 shadow-inner">
                                                        <div>$ whoami</div>
                                                        <div className="text-gray-300">alex_dev</div>
                                                        <div className="mt-2">$ cat skills.txt</div>
                                                        <div className="text-gray-300 flex flex-col gap-1">
                                                            <span>&gt; Go</span>
                                                            <span>&gt; Rust</span>
                                                            <span>&gt; Kubernetes</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1 row-span-1 bg-white dark:bg-[#111] rounded-xl p-3 border border-gray-100 dark:border-white/5">
                                                        <div className="font-bold text-xs dark:text-white">Microservices Repo</div>
                                                        <div className="text-[9px] text-gray-500 mt-1">Automated deployment pipeline processing 5k events/sec.</div>
                                                    </div>
                                                    <div className="col-span-1 row-span-1 bg-white dark:bg-[#111] rounded-xl p-3 border border-gray-100 dark:border-white/5">
                                                        <div className="font-bold text-xs dark:text-white">Auth Service</div>
                                                        <div className="text-[9px] text-gray-500 mt-1">Oauth2 implementation in Go with Redis caching.</div>
                                                    </div>
                                                </div>
                                            )}
                                            {TEMPLATES[activeTemplate].id === 'freelancer' && (
                                                <div className="h-full grid grid-cols-2 gap-3" style={{ gridAutoRows: '1fr' }}>
                                                    <div className="bg-pink-50 dark:bg-pink-900/10 rounded-xl p-5 border border-pink-100 dark:border-pink-900/30 flex flex-col justify-center row-span-2 col-span-1">
                                                        <h4 className="text-3xl font-black text-pink-500 tracking-tighter leading-none mb-2">Creative.<br />Bold.<br />Unique.</h4>
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-300 mt-2 font-medium">Freelance Art Director specialized in Brand Identity.</p>
                                                    </div>
                                                    <div className="bg-white dark:bg-[#111] rounded-xl p-3 border border-gray-100 dark:border-white/5 overflow-hidden relative group">
                                                        <div className="font-bold text-sm mb-1 dark:text-white">Neon Campaign</div>
                                                        <div className="text-[9px] text-gray-500">Global rebrand for a streetwear label.</div>
                                                        <div className="absolute right-[-10px] bottom-[-10px] w-16 h-16 bg-pink-500/20 rounded-full blur-xl group-hover:bg-pink-500/40 transition-colors" />
                                                    </div>
                                                    <div className="bg-gray-900 text-white rounded-xl p-3 border border-gray-800 shadow-xl overflow-hidden relative group">
                                                        <div className="font-bold text-sm mb-1">Vogue Editorial</div>
                                                        <div className="text-[9px] text-gray-400">Photography layout & typography spread.</div>
                                                    </div>
                                                </div>
                                            )}
                                            {TEMPLATES[activeTemplate].id === 'student' && (
                                                <div className="h-full flex flex-col bg-[#fafafa] dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5 font-serif text-center relative overflow-hidden">
                                                    <div className="absolute top-0 inset-x-0 h-1 bg-teal-600" />
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Samantha Wells</h3>
                                                    <p className="text-xs text-teal-700 dark:text-teal-400 mt-1 font-sans font-medium uppercase tracking-widest">Ph.D. Candidate in Neuroscience</p>

                                                    <div className="w-16 h-[1px] bg-gray-300 dark:bg-gray-700 mx-auto my-3" />

                                                    <div className="text-left">
                                                        <div className="text-[10px] font-bold text-gray-900 dark:text-gray-200 uppercase mb-1">Recent Publication</div>
                                                        <p className="text-[11px] text-gray-700 dark:text-gray-400 italic">"Neural Correlates of Memory Consolidation during REM Sleep."</p>
                                                        <p className="text-[9px] text-gray-500 dark:text-gray-500 mt-0.5 font-sans">Journal of Neuroscience, 2025.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <Link to="/register" className="btn-primary text-lg pointer-events-auto">Use {TEMPLATES[activeTemplate].label}</Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Feature Grid */}
            <section className="py-20 px-6 bg-gray-50 dark:bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map(({ icon: Icon, title, desc }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-white/5 hover:-translate-y-1 hover:shadow-xl transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4">
                                    <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                                </div>
                                <h3 className="font-bold mb-2">{title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 relative overflow-hidden border-t border-gray-200 dark:border-white/5">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-brand-500/20 dark:from-brand-500/5 dark:to-brand-500/10" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <LayoutTemplate className="w-16 h-16 mx-auto mb-6 text-brand-500" />
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Stop wasting time tweaking CSS.</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                        Join developers, designers, and professionals who deploy beautiful, custom portfolios in minutes instead of days.
                    </p>
                    <Link to="/register" className="btn-primary text-xl px-12 py-5 shadow-2xl shadow-brand-500/30 hover:scale-105 transition-transform inline-flex items-center gap-3">
                        Upload Your Resume <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
            </section>

            {/* Subtle Ticker */}
            <div className="fixed bottom-0 inset-x-0 h-1bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-shimmer z-50 pointer-events-none" />

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#050505] text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} Resume2Portfolio AI. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-brand-500 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-brand-500 transition-colors">Terms</a>
                        <a href="#" className="hover:text-brand-500 transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
