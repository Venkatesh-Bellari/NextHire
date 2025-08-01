import React from 'react';
import ReactMarkdown from 'react-markdown';
import { PracticeQuestion } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import TrophyIcon from './icons/TrophyIcon';

interface QuizResultViewProps {
    questions: PracticeQuestion[];
    userAnswers: string[];
    score: number;
    onRestart: () => void;
}

const QuizResultView = ({ questions, userAnswers, score, onRestart }: QuizResultViewProps) => {

    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    let summaryMessage = "Good effort! Review your answers to learn and improve.";
    if (accuracy === 100) {
        summaryMessage = "Perfect score! You're a quiz master!";
    } else if (accuracy >= 75) {
        summaryMessage = "Great job! You're on the right track.";
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
            {/* Summary Card */}
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl border border-white/10 text-center">
                <TrophyIcon className="h-12 w-12 mx-auto text-yellow-300 drop-shadow-lg mb-3" />
                <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                <p className="text-lg text-slate-300 mb-4">{summaryMessage}</p>
                <div className="flex justify-center items-center gap-8">
                    <div>
                        <p className="text-3xl font-bold text-indigo-400">{score}/{totalQuestions}</p>
                        <p className="text-sm text-slate-400">Your Score</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-indigo-400">{accuracy}%</p>
                        <p className="text-sm text-slate-400">Accuracy</p>
                    </div>
                </div>
                 <button onClick={onRestart} className="mt-6 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700">
                    Take Another Quiz
                </button>
            </div>
            
            {/* Detailed Review */}
            <div>
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Learn From Your Mistakes</h3>
                <div className="space-y-4">
                    {questions.map((q, index) => {
                        const userAnswer = userAnswers[index];
                        const isCorrect = q.correctAnswer.toLowerCase() === userAnswer?.toLowerCase();
                        
                        return (
                             <div key={q.id} className="bg-slate-800/50 p-5 rounded-lg border border-slate-700">
                                <p className="font-semibold text-slate-200 mb-4">Q{index + 1}: {q.question}</p>
                                <div className="space-y-3">
                                    {q.options?.map((option, optIndex) => {
                                        const isUserChoice = userAnswer === option;
                                        const isCorrectChoice = q.correctAnswer === option;
                                        let optionClass = 'border-slate-600 bg-slate-700/50';
                                        let icon = null;

                                        if (isCorrectChoice) {
                                            optionClass = 'border-green-500 bg-green-900/30 text-white';
                                            icon = <CheckCircleIcon className="h-5 w-5 text-green-400" />;
                                        } else if (isUserChoice && !isCorrect) {
                                            optionClass = 'border-red-500 bg-red-900/30 text-white';
                                            icon = <XCircleIcon className="h-5 w-5 text-red-400" />;
                                        }

                                        return (
                                            <div key={optIndex} className={`flex items-center justify-between p-3 rounded-md border-2 ${optionClass}`}>
                                                <span className={`${isCorrectChoice ? 'font-bold' : ''}`}>{option}</span>
                                                {icon}
                                            </div>
                                        );
                                    })}
                                </div>
                                <details className="mt-4 group">
                                    <summary className="text-sm font-semibold text-indigo-400 cursor-pointer hover:underline">
                                        Show Explanation
                                    </summary>
                                    <div className="mt-2 p-3 bg-slate-900/50 rounded-md border border-slate-700 text-slate-300 prose prose-sm prose-invert max-w-none">
                                         <ReactMarkdown>{q.explanation}</ReactMarkdown>
                                    </div>
                                </details>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuizResultView;