import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, FileSearch, Sparkles, Code2, CheckCircle2 } from 'lucide-react'

const steps = [
    { icon: FileSearch, text: 'Reading your resume...', color: 'text-blue-400' },
    { icon: Brain, text: 'Analyzing your experience...', color: 'text-purple-400' },
    { icon: Sparkles, text: 'Crafting your portfolio copy...', color: 'text-amber-400' },
    { icon: Code2, text: 'Generating sections...', color: 'text-emerald-400' },
    { icon: CheckCircle2, text: 'Almost there...', color: 'text-brand-400' },
]

export default function AIProcessingOverlay() {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev))
        }, 2800)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/90 backdrop-blur-md"
        >
            <div className="text-center max-w-md mx-auto px-6">
                {/* Animated orb */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-glow-lg flex items-center justify-center"
                >
                    <Brain className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    AI is building your portfolio
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                    This usually takes 10–20 seconds
                </p>

                {/* Step list */}
                <div className="space-y-3 text-left">
                    {steps.map((step, i) => {
                        const Icon = step.icon
                        const isActive = i === currentStep
                        const isDone = i < currentStep

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: isDone || isActive ? 1 : 0.3, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className={`flex items-center gap-3 text-sm transition-all duration-300 ${isDone ? 'text-gray-400 dark:text-gray-500' : isActive ? step.color : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className={isActive ? 'font-medium' : ''}>{step.text}</span>
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />}
                            </motion.div>
                        )
                    })}
                </div>

                {/* Progress bar */}
                <div className="mt-8 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </div>
        </motion.div>
    )
}
