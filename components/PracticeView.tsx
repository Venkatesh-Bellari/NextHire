import React, { useState, useEffect } from 'react';
import { generatePracticeQuestion, generateMultiplePracticeQuestions } from '../services/geminiService';
import { PracticeQuestion, DailyScoreRecord, UserProfile } from '../types';
import { User, getTodaysScoreRecord, getUserProfile, saveDailyScore, updateUserStreak, getTodaysStandardPracticeRecord, saveStandardPracticeCompletion } from '../services/firebaseService';
import Spinner from './Spinner';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import TrophyIcon from './icons/TrophyIcon';
import CalendarIcon from './icons/CalendarIcon';
import SparklesIcon from './icons/SparklesIcon';
import DailyQuizRunner from './DailyQuizRunner';
import QuizResultView from './QuizResultView';


const standardCategories = [
    { id: 'dsa', name: 'Data Structures & Algorithms', requiresLang: true },
    { id: 'coding', name: 'Coding', requiresLang: false },
    { id: 'aptitude', name: 'Aptitude', requiresLang: false },
    { id: 'tips-and-tricks', name: 'Tips and Tricks', requiresLang: false },
];

const difficulties = ['Easy', 'Moderate', 'Hard'];
const languages = ['JavaScript', 'Python', 'Java', 'C++'];

const TOTAL_QUESTIONS_CODING = 20;
const TOTAL_QUESTIONS_DEFAULT = 10;
const TOTAL_DAILY_QUIZ_QUESTIONS = 20;

const encouragingMessages = [
    { emoji: '🎉', text: 'Awesome!' },
    { emoji: '👍', text: 'Great job!' },
    { emoji: '🚀', text: 'You\'re on fire!' },
    { emoji: '✅', text: 'That\'s it!' },
    { emoji: '🎯', text: 'Bullseye!' },
];

const normalizeCode = (code: string): string => {
    if (!code) return '';
    return code
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // remove comments
        .replace(/\s+/g, '') // remove whitespace and newlines
        .toLowerCase();
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const CompletionPopup = ({ score, totalQuestions, onRestart }: { score: number, totalQuestions: number, onRestart: () => void}) => (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-gradient-to-br from-indigo-700 to-violet-800 text-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-indigo-500 relative transform transition-all">
            <TrophyIcon className="h-16 w-16 mx-auto text-yellow-300 drop-shadow-lg mb-4" />
            <h2 className="text-4xl font-bold mb-4">Perfection!</h2>
            <p className="text-xl text-indigo-200 mb-6">You aced the challenge with a perfect score.</p>
            <div className="text-6xl font-bold mb-8 drop-shadow-md">{score}/{totalQuestions}</div>
            <button
                onClick={onRestart}
                className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-slate-200 transition-transform transform hover:scale-105"
            >
                Start New Session
            </button>
        </div>
    </div>
);

const SessionSummary = ({ score, totalQuestions, onRestart, category }: { score: number, totalQuestions: number, onRestart: () => void, category: string}) => (
    <div className="text-center p-8 animate-fade-in">
        {category === 'tips-and-tricks' ? (
            <>
                 <h2 className="text-3xl font-bold text-white mb-4">Tips Session Complete!</h2>
                 <p className="text-lg text-slate-300 mb-6">Hope you learned something new to help your prep!</p>
            </>
        ) : (
            <>
                <h2 className="text-3xl font-bold text-white mb-4">Session Complete!</h2>
                <p className="text-lg text-slate-300 mb-6">Here's how you did:</p>
                <div className="text-5xl font-bold text-indigo-400 mb-8">{score}/{totalQuestions}</div>
            </>
        )}
        <button
            onClick={onRestart}
            className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
            Start a New Session
        </button>
    </div>
);


const PracticeView = ({ user }: { user: User }) => {
    const isOnline = useOnlineStatus();

    // Standard Session State
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionConfig, setSessionConfig] = useState({ category: '', difficulty: '', language: '' });
    const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
    const [currentLanguage, setCurrentLanguage] = useState('');
    
    // Scoring and progress state for standard session
    const [score, setScore] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [totalQuestions, setTotalQuestions] = useState(TOTAL_QUESTIONS_DEFAULT);
    const [completedStandardSessions, setCompletedStandardSessions] = useState<Record<string, boolean>>({});
    const [isLoadingCompletions, setIsLoadingCompletions] = useState(true);

    // Daily Quiz State
    const [dailyQuizState, setDailyQuizState] = useState<'idle' | 'loading' | 'generating' | 'active' | 'results'>('loading');
    const [todaysScore, setTodaysScore] = useState<DailyScoreRecord | null>(null);
    const [dailyQuizQuestions, setDailyQuizQuestions] = useState<PracticeQuestion[]>([]);
    const [dailyQuizUserAnswers, setDailyQuizUserAnswers] = useState<string[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [generationProgress, setGenerationProgress] = useState(0);

    // General Control State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [encouragement, setEncouragement] = useState<{emoji: string, text: string} | null>(null);

    useEffect(() => {
        const fetchUserStatus = async () => {
            if (!user?.uid) return;
            setDailyQuizState('loading');
            setIsLoadingCompletions(true);
            try {
                const [profile, scoreRecord, standardCompletions] = await Promise.all([
                    getUserProfile(user.uid),
                    getTodaysScoreRecord(user.uid),
                    getTodaysStandardPracticeRecord(user.uid)
                ]);
                setUserProfile(profile);
                setCompletedStandardSessions(standardCompletions);
                if (scoreRecord) {
                    setTodaysScore(scoreRecord);
                    setDailyQuizState('results');
                } else {
                    setDailyQuizState('idle');
                }
            } catch (err) {
                 const errorMessage = err instanceof Error ? err.message : 'Could not load your daily quiz status.';
                 console.error(err);
                 setError(errorMessage);
                 setDailyQuizState('idle');
            } finally {
                setIsLoadingCompletions(false);
            }
        };
        fetchUserStatus();
    }, [user]);

    const handleStartDailyQuiz = async () => {
        if (!isOnline) {
            setError('You must be online to start the daily quiz.');
            return;
        }
        setDailyQuizState('generating');
        setGenerationProgress(0);
        setError(null);
        let allGeneratedQuestions: PracticeQuestion[] = [];

        try {
            const categoriesToGenerate = [
                { name: 'Aptitude', count: 5, difficulty: 'Moderate' },
                { name: 'Data Structures & Algorithms', count: 5, difficulty: 'Moderate' },
                { name: 'General Coding Concepts', count: 5, difficulty: 'Easy' },
                { name: 'Top MNC Interview Questions', count: 5, difficulty: 'Hard' },
            ];
            
            for (const cat of categoriesToGenerate) {
                const questions = await generateMultiplePracticeQuestions(cat.name, cat.difficulty, cat.count);
                const questionsWithIds = questions.map(q => ({ ...q, id: crypto.randomUUID(), type: 'multiple-choice' as const }));
                allGeneratedQuestions.push(...questionsWithIds);
                setGenerationProgress(p => p + cat.count);
                // Add a delay between batched requests to avoid rate limiting
                await delay(2000);
            }

            // Shuffle the collected questions to mix categories
            const shuffledQuestions = allGeneratedQuestions.sort(() => Math.random() - 0.5);

            setDailyQuizQuestions(shuffledQuestions);
            setDailyQuizState('active');

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            console.error(e);
            if (typeof errorMessage === 'string' && (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED'))) {
                setError('The AI service is currently busy. Please wait a few moments and try starting the quiz again.');
            } else {
                setError(`Failed to generate quiz: ${errorMessage}. Please try again later.`);
            }
            setDailyQuizState('idle');
        }
    };
    
    const onQuizComplete = async (finalScore: number, finalAnswers: string[]) => {
        if (!user?.uid) return;
        setDailyQuizUserAnswers(finalAnswers);
        
        try {
            await saveDailyScore(user.uid, finalScore);
            await updateUserStreak(user.uid);
            
            const [newScoreRecord, updatedProfile] = await Promise.all([
                 getTodaysScoreRecord(user.uid),
                 getUserProfile(user.uid)
            ]);

            if (newScoreRecord) {
                setTodaysScore(newScoreRecord);
                setUserProfile(updatedProfile);
                setDailyQuizState('results');
            }
        } catch(e) {
            setError("Could not save your quiz score. Your results are shown but may not be saved.");
            setDailyQuizState('results');
        }
    };


    // --- Standard Practice Functions ---
    const handleStartSession = async () => {
        const { category, difficulty, language } = sessionConfig;
        
        const total = category === 'coding' ? TOTAL_QUESTIONS_CODING : TOTAL_QUESTIONS_DEFAULT;
        setTotalQuestions(total);

        setSessionActive(true);
        setScore(0);
        setQuestionNumber(1);
        setSessionComplete(false);
        setShowCompletionPopup(false);
        setCurrentLanguage(language || 'JavaScript'); // Default for DSA
        await fetchNextQuestion(category === 'dsa' ? 'JavaScript' : language, false);
    };
    
    const fetchNextQuestion = async (lang?: string, isTranslation = false) => {
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        setUserAnswer('');
        const questionToTranslate = isTranslation ? currentQuestion : null;
        if (!isTranslation) setCurrentQuestion(null);

        try {
            const categoryName = standardCategories.find(c => c.id === sessionConfig.category)?.name || '';
            const question = await generatePracticeQuestion(categoryName, sessionConfig.difficulty, lang, questionToTranslate);
            setCurrentQuestion({...question, id: crypto.randomUUID() });
        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
             setError(`Failed to fetch question: ${errorMessage}. Please try again.`);
        } finally { setIsLoading(false); }
    };

    const handleSubmitAnswer = () => {
        if (!currentQuestion || userAnswer === '') return;
        let isCorrect = false;
        if (currentQuestion.type === 'multiple-choice') {
            isCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        } else {
            isCorrect = normalizeCode(userAnswer) === normalizeCode(currentQuestion.correctAnswer);
        }
        if(isCorrect) {
            setScore(s => s + 1);
            const randomMsg = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
            setEncouragement(randomMsg);
            setTimeout(() => setEncouragement(null), 2000);
        }
        setFeedback({ isCorrect, explanation: currentQuestion.explanation });
    };

    const handleNext = () => {
        // For DSA, it's an endless stream
        if (sessionConfig.category === 'dsa') {
            setQuestionNumber(prev => prev + 1);
            fetchNextQuestion(currentLanguage, false);
            return;
        }

        if (questionNumber < totalQuestions) {
            setQuestionNumber(prev => prev + 1);
            fetchNextQuestion(currentLanguage, false);
        } else {
            handleSeeResults();
        }
    };

    const handleDsaLanguageChange = (newLang: string) => {
        if (newLang && newLang !== currentLanguage) {
            setCurrentLanguage(newLang);
            fetchNextQuestion(newLang, true);
        }
    };
    
    const handleSeeResults = () => {
        if (user?.uid && sessionConfig.category) {
            saveStandardPracticeCompletion(user.uid, sessionConfig.category).catch(err => {
                console.error("Failed to save practice completion", err);
            });
            setCompletedStandardSessions(prev => ({ ...prev, [sessionConfig.category]: true }));
        }
        if (score === totalQuestions && sessionConfig.category !== 'tips-and-tricks') {
            setShowCompletionPopup(true);
        }
        setSessionComplete(true);
    };

    const handleRestartSession = () => {
        setSessionActive(false);
        setCurrentQuestion(null);
        setFeedback(null);
        setError(null);
        setSessionComplete(false);
        setShowCompletionPopup(false);
        setCurrentLanguage('');
        setSessionConfig({ category: '', difficulty: '', language: '' });
    };
    
    const handleResetDailyQuiz = () => {
        setDailyQuizState('idle');
        setDailyQuizQuestions([]);
        setDailyQuizUserAnswers([]);
        setTodaysScore(null);
    }

    if (dailyQuizState === 'active') {
        return <DailyQuizRunner questions={dailyQuizQuestions} onComplete={onQuizComplete} />;
    }
    
    const categoryDetails = standardCategories.find(c => c.id === sessionConfig.category);
    const isStartDisabled = isLoadingCompletions || !isOnline || !sessionConfig.category || (sessionConfig.category !== 'tips-and-tricks' && !sessionConfig.difficulty);
    
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-left mb-10">
                <h1 className="text-4xl font-bold text-white">Practice Zone</h1>
                <p className="mt-2 text-lg text-slate-300">Sharpen your skills with AI-powered practice sessions. Complete challenges and the daily quiz.</p>
            </div>
            
            {/* Daily Quiz Section */}
            <div className="mb-12">
                 <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 p-6 rounded-2xl shadow-xl border border-indigo-500/30">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-center gap-4">
                            <CalendarIcon className="h-10 w-10 text-indigo-400 flex-shrink-0" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">Daily Quiz Challenge</h2>
                                <p className="text-slate-300">A {TOTAL_DAILY_QUIZ_QUESTIONS}-question quiz. A new one every day!</p>
                            </div>
                        </div>
                        {(userProfile?.dailyQuizStreak || 0) > 0 && (
                            <div className="flex-shrink-0 flex items-center gap-2 text-yellow-400 font-semibold bg-yellow-400/10 px-3 py-1.5 rounded-full">
                                <SparklesIcon className="h-5 w-5" />
                                <span>{userProfile.dailyQuizStreak} Day Streak</span>
                            </div>
                        )}
                    </div>
                    {error && <p className="mt-4 text-center text-red-400">{error}</p>}
                    <div className="mt-6 text-center">
                        {dailyQuizState === 'loading' && <Spinner className="border-white"/>}
                        {dailyQuizState === 'generating' && (
                             <div>
                                <Spinner className="border-white mx-auto"/>
                                <p className="text-slate-300 mt-2">Generating your quiz... ({generationProgress}/{TOTAL_DAILY_QUIZ_QUESTIONS})</p>
                             </div>
                        )}
                        {dailyQuizState === 'idle' && (
                             <button onClick={handleStartDailyQuiz} disabled={!isOnline} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 disabled:bg-slate-600">
                                Start Today's Challenge
                            </button>
                        )}
                        {dailyQuizState === 'results' && todaysScore && (
                            dailyQuizQuestions.length > 0 ? (
                                <QuizResultView 
                                    questions={dailyQuizQuestions} 
                                    userAnswers={dailyQuizUserAnswers}
                                    score={todaysScore.score}
                                    onRestart={handleResetDailyQuiz}
                                />
                            ) : (
                                <div className="animate-fade-in">
                                    <p className="text-lg text-green-400 font-semibold">You've completed today's challenge!</p>
                                    <p className="text-3xl font-bold text-white my-2">Your Score: {todaysScore.score} / {TOTAL_DAILY_QUIZ_QUESTIONS}</p>
                                    <p className="text-sm text-slate-400">Come back tomorrow for a new quiz!</p>
                                </div>
                            )
                        )}
                    </div>
                 </div>
            </div>

            {/* Standard Practice */}
            <h2 className="text-2xl font-bold text-white mb-4">Standard Practice Sessions</h2>
            {showCompletionPopup ? (
                <CompletionPopup score={score} totalQuestions={totalQuestions} onRestart={handleRestartSession} />
            ) : sessionComplete ? (
                <div className="bg-slate-800/50 p-8 rounded-2xl"><SessionSummary score={score} totalQuestions={totalQuestions} onRestart={handleRestartSession} category={sessionConfig.category}/></div>
            ) : !sessionActive ? (
                <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        <div>
                            <h3 className="font-semibold text-slate-200 mb-3">1. Choose a Category</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {isLoadingCompletions ? <div className="col-span-full text-center p-4"><Spinner /></div> : standardCategories.map(cat => {
                                    const isCompleted = completedStandardSessions[cat.id];
                                    return (
                                        <button 
                                            key={cat.id} 
                                            onClick={() => setSessionConfig({...sessionConfig, category: cat.id, difficulty: cat.id === 'tips-and-tricks' ? 'Easy' : '' })} 
                                            disabled={isCompleted}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${sessionConfig.category === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : isCompleted ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-slate-700/50 text-slate-200 border-slate-600 hover:border-indigo-500'}`}
                                        >
                                            <span className="font-semibold">{cat.name}</span>
                                            {isCompleted && <span className="block text-xs font-normal text-green-400 mt-1">Completed for today! Come back tomorrow.</span>}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                         {sessionConfig.category && !completedStandardSessions[sessionConfig.category] && sessionConfig.category !== 'tips-and-tricks' && (
                            <div>
                                <h3 className="font-semibold text-slate-200 mb-3">2. Select Difficulty</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {difficulties.map(level => (
                                         <button key={level} onClick={() => setSessionConfig({...sessionConfig, difficulty: level})} className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${sessionConfig.difficulty === level ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-700/50 text-slate-200 border-slate-600 hover:border-indigo-500'}`}>
                                            <span className="font-semibold">{level}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="text-center pt-4">
                         <button onClick={handleStartSession} disabled={isStartDisabled} className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed">
                            Start Challenge
                        </button>
                         {!isOnline && <p className="mt-2 text-sm text-amber-400">Practice requires an internet connection.</p>}
                    </div>
                </div>
            ) : ( // Session is Active
                 <div className="max-w-5xl mx-auto">
                    {encouragement && (
                        <div className="fixed top-24 right-8 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg flex items-center z-50 animate-fade-in">
                            <span className="text-2xl mr-2">{encouragement.emoji}</span>
                            <span className="font-semibold">{encouragement.text}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Practice Session</h1>
                            {sessionConfig.category === 'dsa' ? (
                                 <div className="text-slate-300 font-semibold mt-1">
                                    <span>Question: {questionNumber}</span>
                                </div>
                            ) : sessionConfig.category === 'tips-and-tricks' ? (
                                <div className="text-slate-300 font-semibold mt-1">
                                    <span>Tip: {questionNumber}/{totalQuestions}</span>
                                </div>
                            ) : (
                                <div className="text-slate-300 font-semibold mt-1">
                                    <span>Score: {score}</span>
                                    <span className="mx-2">|</span>
                                    <span>Question: {questionNumber}/{totalQuestions}</span>
                                </div>
                            )}
                        </div>
                        <button onClick={handleRestartSession} className="px-4 py-1.5 text-sm bg-slate-700 text-slate-200 font-semibold rounded-full hover:bg-slate-600 transition-colors">End Session</button>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/10 min-h-[400px] flex flex-col justify-center">
                        {isLoading ? <div className="text-center p-10"><Spinner className="h-10 w-10 border-indigo-400" /></div> : error ? <p className="text-center text-red-400">{error}</p> : currentQuestion && (
                            <div className="space-y-6 animate-fade-in">
                                { currentQuestion.type === 'tip' ? (
                                    <div className="prose prose-invert max-w-none">
                                        <h3 className="text-2xl font-bold text-indigo-400">{currentQuestion.question}</h3>
                                        <p className="text-slate-300">{currentQuestion.explanation}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-semibold text-lg text-slate-200 flex-1">{currentQuestion.question}</p>
                                                {sessionConfig.category === 'dsa' && (
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <label htmlFor="lang-select" className="text-sm text-slate-300">Language:</label>
                                                        <select id="lang-select" value={currentLanguage} onChange={e => handleDsaLanguageChange(e.target.value)} disabled={isLoading || !!feedback} className="p-1 rounded-md border-2 bg-slate-700/50 border-slate-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-white text-sm disabled:opacity-50">
                                                            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            {currentQuestion.companyTags?.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2 mt-3"><p className="text-sm font-semibold text-slate-400">Frequently asked at:</p>{currentQuestion.companyTags.map(tag => (<span key={tag} className="bg-slate-700 text-slate-200 text-xs font-bold px-2 py-1 rounded-full">{tag}</span>))}</div>
                                            )}
                                            {currentQuestion.codeSnippet && <pre className="code-block mt-4"><code>{currentQuestion.codeSnippet}</code></pre>}
                                            {currentQuestion.sampleInputs && <div className="mt-4"><h4 className="font-semibold text-slate-300 mb-1">Sample Input:</h4><pre className="code-block"><code>{currentQuestion.sampleInputs}</code></pre></div>}
                                            {currentQuestion.sampleOutputs && <div className="mt-2"><h4 className="font-semibold text-slate-300 mb-1">Sample Output:</h4><pre className="code-block"><code>{currentQuestion.sampleOutputs}</code></pre></div>}
                                        </div>
                                        {!feedback ? (
                                            <div>
                                                {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'error-finding') && currentQuestion.options && (
                                                    <div className="space-y-3">{currentQuestion.options.map((option, index) => (<label key={index} className={`flex items-center p-3 rounded-lg border-2 transition-colors cursor-pointer ${userAnswer === option ? 'bg-indigo-900/50 border-indigo-500' : 'bg-slate-700/50 border-slate-600 hover:border-indigo-500'}`}><input type="radio" name="answer" value={option} checked={userAnswer === option} onChange={e => setUserAnswer(e.target.value)} className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-slate-500 bg-slate-700" /><span className="ml-3 text-slate-200">{option}</span></label>))}</div>
                                                )}
                                                {(currentQuestion.type === 'coding' || (currentQuestion.type === 'error-finding' && !currentQuestion.options)) && (<textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Write your code or explanation here..." className="w-full h-80 p-4 border border-slate-600 rounded-lg bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 resize-y text-white placeholder:text-slate-400 font-mono"></textarea>)}
                                            </div>
                                        ) : (
                                            <div className={`p-4 rounded-lg border-l-4 ${feedback.isCorrect ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'}`}>
                                                <div className="flex items-center mb-3">{feedback.isCorrect ? <CheckCircleIcon className="h-6 w-6 text-green-400 mr-2"/> : <XCircleIcon className="h-6 w-6 text-red-400 mr-2"/>}<h3 className="text-lg font-bold">{feedback.isCorrect ? "Correct!" : "Not Quite"}</h3></div>
                                                {(!feedback.isCorrect || currentQuestion.type !== 'multiple-choice') && currentQuestion.correctAnswer && <div className="mb-4"><h4 className="font-semibold text-slate-200 mb-2">{feedback.isCorrect ? 'Solution:' : 'Correct Solution:'}</h4><pre className="code-block"><code>{currentQuestion.correctAnswer}</code></pre></div>}
                                                <h4 className="font-semibold text-slate-200">Explanation:</h4><div className="text-slate-300 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentQuestion.explanation.replace(/\n/g, '<br />') }}></div>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                <div className="text-center pt-4">
                                    {currentQuestion.type === 'tip' ? (
                                        <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700">
                                            {questionNumber < totalQuestions ? 'Next Tip' : 'Finish Session'}
                                        </button>
                                    ) : feedback ? (
                                        <button onClick={handleNext} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700">
                                            {sessionConfig.category === 'dsa' ? 'Next Question' : (questionNumber < totalQuestions ? 'Next Question' : 'See Results')}
                                        </button>
                                    ) : (
                                        <button onClick={handleSubmitAnswer} disabled={!userAnswer} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-600">Submit Answer</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default PracticeView;