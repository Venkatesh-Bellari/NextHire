import React, { useState, useMemo } from 'react';
import { PracticeQuestion } from '../types';
import Spinner from './Spinner';

interface DailyQuizRunnerProps {
    questions: PracticeQuestion[];
    onComplete: (score: number, answers: string[]) => void;
}

const DailyQuizRunner = ({ questions, onComplete }: DailyQuizRunnerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>(() => new Array(questions.length).fill(''));
    
    const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

    const handleAnswerSelect = (answer: string) => {
        setUserAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentIndex] = answer;
            return newAnswers;
        });
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Quiz is finished, calculate score and complete
            let finalScore = 0;
            for (let i = 0; i < questions.length; i++) {
                if (questions[i].correctAnswer.toLowerCase() === userAnswers[i].toLowerCase()) {
                    finalScore++;
                }
            }
            onComplete(finalScore, userAnswers);
        }
    };
    
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };
    
    if (!currentQuestion) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    const isLastQuestion = currentIndex === questions.length - 1;
    const isAnswerSelected = userAnswers[currentIndex] !== '';

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Daily Quiz Challenge</h1>
                    <p className="text-slate-300">Question {currentIndex + 1} of {questions.length}</p>
                </div>
                 {/* Progress Tracker */}
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                    {questions.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-8 w-8 rounded-full transition-all duration-200 flex items-center justify-center font-bold text-sm ${
                                currentIndex === index
                                    ? 'bg-white text-slate-900 ring-2 ring-offset-2 ring-offset-slate-900 ring-white'
                                    : userAnswers[index]
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                            }`}
                            aria-label={`Go to question ${index + 1}`}
                         >
                            {index + 1}
                         </button>
                    ))}
                </div>
            </div>

            {/* Question Body */}
            <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 min-h-[400px]">
                <div className="space-y-6">
                    <p className="font-semibold text-lg text-slate-200">{currentQuestion.question}</p>
                    
                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options?.map((option, index) => {
                            const isSelected = userAnswers[currentIndex] === option;
                            let optionClass = 'bg-slate-700/50 border-slate-600 hover:border-indigo-500';
                            if (isSelected) {
                                optionClass = 'bg-indigo-900/50 border-indigo-500';
                            }

                            return (
                                <label key={index} className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${optionClass}`}>
                                    <input type="radio" name={`answer-${currentQuestion.id}`} value={option} checked={isSelected} onChange={e => handleAnswerSelect(e.target.value)} className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-slate-500 bg-slate-700" />
                                    <span className="ml-3 text-slate-200">{option}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Footer Navigation */}
            <div className="flex justify-between items-center mt-6">
                 <button onClick={handlePrevious} disabled={currentIndex === 0} className="px-6 py-2 font-bold rounded-lg shadow-md transition-colors bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                    Previous
                </button>
                 <button onClick={handleNext} disabled={!isAnswerSelected} className={`px-6 py-2 font-bold rounded-lg shadow-md transition-colors ${isLastQuestion ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} disabled:bg-slate-600 disabled:cursor-not-allowed`}>
                    {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    );
};

export default DailyQuizRunner;