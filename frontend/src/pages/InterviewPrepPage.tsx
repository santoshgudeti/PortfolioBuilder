import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { interviewApi, InterviewQuestion, InterviewFeedback } from '@/api/interview'
import { Loader2, Brain, Send, CheckCircle, AlertTriangle, TrendingUp, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import PageTransition from '@/components/PageTransition'

const CATEGORY_COLORS: Record<string, string> = {
    technical: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    behavioral: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    system_design: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    experience: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    situational: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    career: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
}

const DIFFICULTY_COLORS: Record<string, string> = {
    easy: 'text-green-500',
    medium: 'text-amber-500',
    hard: 'text-red-500',
}

export default function InterviewPrepPage() {
    const [roleFocus, setRoleFocus] = useState('')
    const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null)
    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
    const [showQuestions, setShowQuestions] = useState(false)

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['interview-questions', roleFocus],
        queryFn: () => interviewApi.getQuestions(roleFocus).then(r => r.data),
        enabled: showQuestions,
        retry: false,
    })

    const evaluateMutation = useMutation({
        mutationFn: (params: { question: string; answer: string; expected_topics: string[] }) =>
            interviewApi.evaluate(params.question, params.answer, params.expected_topics).then(r => r.data),
        onSuccess: (data) => {
            setFeedback(data)
        },
        onError: () => toast.error('Evaluation failed'),
    })

    const questions = data?.questions || []
    const focusAreas = data?.focus_areas || []

    const handleSubmitAnswer = () => {
        if (!selectedQuestion || !answer.trim()) return
        evaluateMutation.mutate({
            question: selectedQuestion.question,
            answer: answer.trim(),
            expected_topics: selectedQuestion.expected_topics,
        })
    }

    const handleBack = () => {
        setSelectedQuestion(null)
        setAnswer('')
        setFeedback(null)
    }

    return (
        <PageTransition className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Brain className="w-6 h-6 text-brand-500" />
                    Interview Preparation
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    AI generates realistic questions from your portfolio and evaluates your answers.
                </p>
            </div>

            {/* Role focus input + generate */}
            {!showQuestions && !selectedQuestion && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-8">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                        Target Role (optional)
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={roleFocus}
                            onChange={e => setRoleFocus(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button onClick={() => { setShowQuestions(true); refetch() }} className="btn-primary px-6">
                            <Brain className="w-4 h-4" /> Generate
                        </button>
                    </div>
                </div>
            )}

            {/* Selected question + answer */}
            {selectedQuestion && (
                <div>
                    <button onClick={handleBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6">
                        <ArrowLeft className="w-4 h-4" /> Back to questions
                    </button>

                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[selectedQuestion.category] || 'bg-gray-100 text-gray-600'}`}>
                                {selectedQuestion.category.replace('_', ' ')}
                            </span>
                            <span className={`text-xs font-bold ${DIFFICULTY_COLORS[selectedQuestion.difficulty]}`}>
                                {selectedQuestion.difficulty.toUpperCase()}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{selectedQuestion.question}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{selectedQuestion.context}</p>
                    </div>

                    <textarea
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={6}
                        className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-y mb-4"
                    />

                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim() || evaluateMutation.isPending}
                        className="btn-primary w-full py-3"
                    >
                        {evaluateMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                        ) : (
                            <><Send className="w-4 h-4" /> Submit Answer</>
                        )}
                    </button>

                    {/* Feedback */}
                    {feedback && (
                        <div className="mt-8 space-y-4">
                            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Score</p>
                                <div className={`text-5xl font-black tabular-nums ${feedback.score >= 80 ? 'text-green-500' : feedback.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                    {feedback.score}<span className="text-xl text-gray-400">/100</span>
                                </div>
                            </div>

                            {feedback.strengths.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-600">Strengths</p>
                                    {feedback.strengths.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-green-700 dark:text-green-300">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {feedback.improvements.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Improvements</p>
                                    {feedback.improvements.map((s, i) => (
                                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-amber-700 dark:text-amber-300">{s}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {feedback.key_missed_topics.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-red-600">Missed Topics</p>
                                    <div className="flex flex-wrap gap-2">
                                        {feedback.key_missed_topics.map((t, i) => (
                                            <span key={i} className="px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {feedback.model_answer && (
                                <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 mb-1">Model Answer</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">{feedback.model_answer}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Questions list */}
            {showQuestions && !selectedQuestion && (
                <>
                    {isLoading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                        </div>
                    )}

                    {focusAreas.length > 0 && (
                        <div className="rounded-2xl border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/10 p-4 mb-6 flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">Focus Areas</p>
                                <div className="flex flex-wrap gap-2">
                                    {focusAreas.map((area, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded-lg bg-brand-100 dark:bg-brand-900/20 text-xs text-brand-700 dark:text-brand-300 font-medium">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {questions.map((q) => (
                            <button
                                key={q.id}
                                onClick={() => setSelectedQuestion(q)}
                                className="w-full text-left rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 hover:border-brand-500/50 transition-all"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[q.category] || 'bg-gray-100 text-gray-600'}`}>
                                        {q.category.replace('_', ' ')}
                                    </span>
                                    <span className={`text-[10px] font-bold ${DIFFICULTY_COLORS[q.difficulty]}`}>
                                        {q.difficulty.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{q.question}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{q.context}</p>
                            </button>
                        ))}
                    </div>

                    <div className="text-center mt-6">
                        <button onClick={() => { setShowQuestions(false); setRoleFocus('') }} className="btn-secondary text-sm">
                            <RefreshCw className="w-4 h-4" /> New Session
                        </button>
                    </div>
                </>
            )}
        </PageTransition>
    )
}
