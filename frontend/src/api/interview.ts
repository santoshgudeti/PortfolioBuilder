import apiClient from './client'

export interface InterviewQuestion {
    id: string
    category: string
    question: string
    context: string
    difficulty: 'easy' | 'medium' | 'hard'
    expected_topics: string[]
}

export interface InterviewFeedback {
    score: number
    strengths: string[]
    improvements: string[]
    model_answer: string
    key_missed_topics: string[]
}

export const interviewApi = {
    getQuestions: (roleFocus: string = '') =>
        apiClient.get<{ questions: InterviewQuestion[]; focus_areas: string[] }>(
            `/interview/questions${roleFocus ? `?role_focus=${encodeURIComponent(roleFocus)}` : ''}`
        ),

    evaluate: (question: string, answer: string, expected_topics: string[]) =>
        apiClient.post<InterviewFeedback>('/interview/evaluate', { question, answer, expected_topics }),
}
