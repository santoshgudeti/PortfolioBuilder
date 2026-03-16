import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { 
    ArrowRight, 
    Zap, 
    Globe, 
    Palette, 
    Edit3, 
    Briefcase, 
    Moon, 
    Sun, 
    CheckCircle, 
    FileText, 
    Sparkles, 
    LayoutTemplate, 
    Shield, 
    BarChart3, 
    Users, 
    Star, 
    Clock, 
    Wand2, 
    Download 
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
    { icon: Zap, title: 'Instant Identity', desc: 'Transform your static resume into a living digital brand. Perfect for developers, designers, and modern professionals.', color: 'from-blue-500 to-indigo-600' },
    { icon: Palette, title: 'Curated Aesthetics', desc: 'Choose from 15 premium templates designed by industry experts. Every layout is optimized for readability and impact.', color: 'from-purple-500 to-pink-600' },
    { icon: Edit3, title: 'Live Visual Control', desc: 'Fine-tune every detail with our intuitive editor. What you see is exactly what recruiters will experience.', color: 'from-brand-500 to-cyan-600' },
    { icon: Globe, title: 'Ready to Launch', desc: 'Your new home on the web is one click away. Deploy instantly to a custom domain and start sharing.', color: 'from-green-500 to-emerald-600' },
    { icon: Shield, title: 'Secure Onboarding', desc: 'Get started in seconds with Google integration. Your professional data is safe, private, and always yours.', color: 'from-orange-500 to-red-600' },
    { icon: BarChart3, title: 'Career Analytics', desc: 'Gain insights into who is viewing your profile. Track visits, locations, and engagement to optimize your reach.', color: 'from-indigo-500 to-blue-600' },
    { icon: Wand2, title: 'Professional Refinement', desc: 'Polish your narrative with our built-in enhancement tools. Speak the language recruiters are looking for.', color: 'from-pink-500 to-rose-600' },
    { icon: Download, title: 'Cloud Data Vault', desc: 'Your professional history is stored securely. Update your experience once, and all your portfolios sync instantly.', color: 'from-cyan-500 to-blue-600' },
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
    { step: '01', title: 'Upload Your Resume', desc: 'Simply drag and drop your current resume. We support PDF, DOCX, and more.', icon: FileText, color: 'from-blue-500 to-indigo-600' },
    { step: '02', title: 'Profile Generation', desc: 'Our engine identifies your strengths and structures them for maximum digital impact.', icon: Sparkles, color: 'from-brand-500 to-cyan-530' },
    { step: '03', title: 'Select Your Vibe', desc: 'Pick from 15 stunning professional themes. Toggle dark mode or customize colors with ease.', icon: LayoutTemplate, color: 'from-purple-500 to-pink-500' },
    { step: '04', title: 'Launch to the World', desc: 'Deploy your portfolio at a custom URL in seconds. Share your link and track your career growth.', icon: Globe, color: 'from-green-500 to-emerald-500' },
]

const TESTIMONIALS = [
    { name: 'Priya Sharma', role: 'Frontend Developer, Bangalore', text: 'I uploaded my resume and had a polished portfolio live in under a minute. The Cyberpunk template is absolutely fire for showcasing my side projects.', avatar: 'https://i.pravatar.cc/150?u=priya' },
    { name: 'Rohan Mehta', role: 'Full Stack Engineer, Mumbai', text: 'Finally, a portfolio builder that doesn\'t require me to fight with CSS for hours. The AI-generated phrasing helped me stand out in a very competitive job market.', avatar: 'https://i.pravatar.cc/150?u=rohan' },
    { name: 'Ananya Iyer', role: 'Product Designer, Gurgaon', text: 'The Bento Grid layout is perfect for my design case studies. It captures my aesthetic perfectly without me needing to write a single line of code.', avatar: 'https://i.pravatar.cc/150?u=ananya' },
]

const TemplateCard = ({ tmpl }: { tmpl: typeof TEMPLATES[0] }) => (
    <div className="card group">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: tmpl.color }} />
                <span className="font-bold text-lg text-gray-950 dark:text-white tracking-tight">{tmpl.label}</span>
            </div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">{tmpl.category}</div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed text-pretty">{tmpl.desc}</p>
        <Link to="/register" className="btn-secondary w-full">
            Use Template
        </Link>
    </div>
)

const FeatureCard = ({ icon: Icon, title, desc, color }: typeof FEATURES[0]) => (
    <div className="card group relative overflow-hidden">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-6 shadow-sm`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-pretty">{desc}</p>
    </div>
)

const HowItWorksStep = ({ step, title, desc, icon: Icon, color }: typeof HOW_IT_WORKS[0]) => (
    <div className="group relative">
        <div className="flex items-start gap-4 sm:gap-6">
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-950 dark:bg-white flex items-center justify-center text-white dark:text-gray-950 font-bold text-sm sm:text-lg shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                {step}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                    <h3 className="font-bold text-lg text-gray-950 dark:text-white tracking-tight">{title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-medium text-pretty">{desc}</p>
            </div>
        </div>
    </div>
)

export default function LandingPage() {
    const { theme, toggleTheme, user } = useAuthStore()

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white overflow-x-hidden selection:bg-brand-500/30">
            <Helmet>
                <title>PortfolioBuilder.AI — AI Portfolio Builder | Stand Out Online</title>
                <meta name="description" content="Upload your resume and let AI build a stunning portfolio website in 60 seconds. 15 premium templates, custom domains, dark mode, and analytics — all free." />
            </Helmet>

            <Navbar />

            {/* ─── Hero Section ─────────────────────────── */}
            <section className="relative pt-32 sm:pt-48 pb-20 sm:pb-32 px-4 sm:px-6 overflow-hidden">
                <div className="bg-grid absolute inset-0 -z-20 opacity-[0.15]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12),transparent_70%)] -z-10" />
                
                {/* Subtle top glow */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent -z-10" />

                <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="mb-6 sm:mb-8 inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-sm animate-fade-in">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                        </span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-tight">
                            Trusted by <span className="text-gray-950 dark:text-white">10k+</span> professionals
                        </span>
                    </div>

                    <h1 className="mb-8 max-w-5xl text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-950 dark:text-white leading-[0.9] animate-slide-up text-balance">
                        Your professional story,<br />
                        <span className="text-brand-500 bg-gradient-to-br from-brand-400 to-indigo-600 text-transparent bg-clip-text">Built by Intelligence.</span>
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10 sm:mb-14 leading-relaxed animate-fade-in [animation-delay:200ms] text-pretty">
                        Ditch the rigid builders. Upload your resume and let AI generate a premium digital portfolio in <span className="text-gray-950 dark:text-white font-bold underline decoration-brand-500/30">60 seconds.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in [animation-delay:400ms] mb-20 sm:mb-28">
                        <Link
                            to="/upload"
                            className="w-full sm:w-auto btn-primary px-10 py-3.5 flex items-center justify-center gap-2 group"
                        >
                            Build Your Story
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="w-full sm:w-auto btn-secondary px-10 py-3.5 bg-white dark:bg-white/5"
                        >
                            Watch Demo
                        </Link>
                    </div>

                    {/* Product Showcase Visual */}
                    <div className="relative w-full max-w-5xl mx-auto animate-fade-in [animation-delay:600ms]">
                        <div className="absolute -inset-10 bg-brand-500/10 rounded-[3rem] blur-3xl -z-10 group-hover:bg-brand-500/20 transition-colors" />
                        <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden bg-white dark:bg-black">
                            {/* Browser Header Mockup */}
                            <div className="h-10 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
                                </div>
                                <div className="flex-1 max-w-[400px] h-6 bg-white dark:bg-black/50 rounded border border-gray-200 dark:border-white/10 mx-auto" />
                            </div>
                            <img 
                                src="/images/landing/portfolio-mockup.png" 
                                alt="PortfolioBuilder.AI Interface" 
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Stats Bar ──────────────────────────────── */}
            <section className="py-20 px-6 border-y border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-12">
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="text-center md:text-left">
                            <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── How It Works (Visual) ───────────────────── */}
            <section id="features" className="py-20 sm:py-32 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <div>
                            <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">The <span className="text-brand-500">Fastest</span> Path to Hire.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-10 leading-relaxed text-pretty">
                                Stop fighting with rigid builders. We’ve automated the heavy lifting so you can focus on tellling your story.
                            </p>
                            <div className="space-y-8">
                                {HOW_IT_WORKS.map((step) => (
                                    <HowItWorksStep key={step.step} {...step} />
                                ))}
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-brand-500/5 rounded-[2rem] blur-2xl group-hover:bg-brand-500/10 transition-colors" />
                            <img 
                                src="/images/landing/ai-editor.png" 
                                alt="AI Editor Preview" 
                                className="relative rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── AI Spotlight ────────────────────────────── */}
            <section id="solutions" className="py-20 sm:py-32 px-4 sm:px-6 bg-white dark:bg-black border-y border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <img 
                            src="/images/landing/resume-analysis.png" 
                            alt="AI Resume Analysis Visual" 
                            className="rounded-3xl shadow-2xl"
                        />
                    </div>
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 text-xs font-bold text-gray-950 dark:text-white mb-6 rounded-md uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" /> Career Intelligence
                        </div>
                        <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight">
                            Your accomplishments,<br className="hidden sm:block" />
                            <span className="text-brand-500">Perfectly Phrased.</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed mb-8 text-pretty">
                            Our AI doesn’t just copy-paste. It analyzes your experience to find the narrative threads that modern recruiters look for.
                        </p>
                        
                        <div className="space-y-4">
                            <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                                <div className="mb-2 text-[10px] font-bold text-brand-500 uppercase tracking-widest">AI Optimized Result</div>
                                <p className="text-lg font-bold text-gray-950 dark:text-white leading-tight italic">
                                    “Orchestrated cross-functional engineering pods to accelerate product velocity by 30%, consistently deploying high-impact features.”
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Template Showcase ──────────────────────── */}
            <section id="templates" className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50 dark:bg-black/50 overflow-hidden relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 sm:mb-20">
                        <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                            Pick Your <span className="text-brand-500">Aesthetic.</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium mb-12">
                            15 high-end templates optimized for conversion. From clean minimalist grids to immersive interactive experiences.
                        </p>
                    </div>

                    <div className="mb-20">
                        <img 
                            src="/images/landing/portfolio-mockup.png" 
                            alt="Portfolio Showcase Mockup" 
                            className="rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {TEMPLATES.slice(0, 6).map((tmpl) => (
                            <TemplateCard key={tmpl.id} tmpl={tmpl} />
                        ))}
                    </div>
                    
                    <div className="mt-16 text-center">
                        <Link to="/register" className="btn-primary px-12">See All Templates</Link>
                    </div>
                </div>
            </section>

            {/* ─── Success & Impact ────────────────────────── */}
            <section className="py-20 sm:py-32 px-4 sm:px-6 bg-white dark:bg-black border-y border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                            Build for the <span className="text-brand-500">Career</span> You Deserve.
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg font-medium leading-relaxed mb-8 text-pretty">
                            Join 10,000+ professionals who have used PortfolioBuilder.AI to land roles at top-tier tech companies. Our platform doesn't just build websites; it builds identities.
                        </p>
                        <div className="flex flex-col gap-4">
                            {[
                                { title: '3.5x More Interviews', desc: 'Users report a significant increase in recruiter callbacks.' },
                                { title: '60s To Deployment', desc: 'From PDF to live URL in less than a minute.' },
                            ].map((stat) => (
                                <div key={stat.title} className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                                    <div className="text-xl font-bold text-gray-950 dark:text-white mb-1">{stat.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <img 
                            src="/images/landing/success-impact.png" 
                            alt="Professional Success Impact" 
                            className="rounded-3xl shadow-2xl"
                        />
                    </div>
                </div>
            </section>

            {/* ─── Everything You Need ─────────────────────── */}
            <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50 dark:bg-black/50 overflow-hidden relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 sm:mb-20">
                        <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Everything you <span className="text-brand-500">Need.</span></h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Powerful tools baked into every portfolio. Manage your professional brand with surgical precision.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((feature) => (
                            <FeatureCard key={feature.title} {...feature} />
                        ))}
                    </div>
                </div>
            </section>


            {/* ─── Testimonials ────────────────────────────── */}
            <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gray-50 dark:bg-gray-950 border-y border-gray-100 dark:border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16 sm:mb-24">
                        <h2 className="mb-6 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Global <span className="text-brand-500">Love.</span></h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Join 10,000+ professionals who transformed their careers.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {TESTIMONIALS.map(({ name, role, text, avatar }) => (
                            <div key={name} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-kore transition-all duration-300 hover:shadow-kore-hover">
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 text-brand-500 fill-brand-500" />)}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic text-sm font-medium">"{text}"</p>
                                <div className="flex items-center gap-4 border-t border-gray-100 dark:border-white/5 pt-6">
                                    <img src={avatar} alt={name} className="w-10 h-10 rounded-full grayscale hover:grayscale-0 transition-all duration-500" />
                                    <div>
                                        <div className="font-black text-sm text-gray-950 dark:text-white uppercase tracking-tighter">{name}</div>
                                        <div className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">{role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ Section ─────────────────────────────── */}
            <section id="faq" className="py-20 sm:py-32 px-4 sm:px-6 bg-white dark:bg-black">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight">Common Questions</h2>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Everything you need to know about getting started.</p>
                    </div>
                    <div className="space-y-4">
                        {FAQS.map(({ q, a }) => (
                            <details key={q} className="group border-b border-gray-200 dark:border-white/10 pb-4 transition-all">
                                <summary className="flex items-center justify-between py-4 cursor-pointer list-none">
                                    <span className="font-bold text-gray-950 dark:text-white tracking-tight">{q}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                                </summary>
                                <div className="pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-pretty">
                                    {a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Final CTA ──────────────────────────────── */}
            <section className="py-24 px-6 relative overflow-hidden">
                 <div className="absolute inset-0 bg-black -z-20" />
                 <div className="bg-grid absolute inset-0 -z-10 opacity-10" />
                <div className="max-w-5xl mx-auto text-center py-20 px-8 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/10">
                    <h2 className="text-4xl sm:text-5xl md:text-6xl mb-8 font-bold tracking-tight text-white leading-tight">
                        Stop building.<br />
                        <span className="text-brand-500">Start standing out.</span>
                    </h2>
                    <p className="mb-12 text-lg sm:text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto text-pretty">
                        Join 10,000+ professionals. It takes exactly 60 seconds. No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to={user ? "/upload" : "/register"} className="w-full sm:w-auto btn-brand px-12">
                            Get Started Free
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto btn-secondary px-12 bg-white/5 border-white/10 text-white hover:bg-white/10">
                            Watch Demo
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
