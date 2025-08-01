


import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { startInterviewChat } from '../services/geminiService';
import type { Chat } from '@google/genai';
import Spinner from './Spinner';
import CheckCircleIcon from './icons/CheckCircleIcon';
import NextHireLogo from './icons/NextHireLogo';
import SendIcon from './icons/SendIcon';
import ReactMarkdown from 'react-markdown';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import Orb from './Orb';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CameraIcon from './icons/CameraIcon';
import CameraSlashIcon from './icons/CameraSlashIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';
import VolumeOffIcon from './icons/VolumeOffIcon';


const FormattedMessage = ({ text, role }: { text: string; role: 'user' | 'model' }) => {
    return (
        <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
};


const InterviewPrepView = () => {
    const isOnline = useOnlineStatus();

    // Setup State
    const [resumeText, setResumeText] = useState('');
    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [resumeFileName, setResumeFileName] = useState<string | null>(null);
    const [isFileProcessing, setIsFileProcessing] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Chat State
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Voice & Video State
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isTtsEnabled, setIsTtsEnabled] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const speak = (text: string) => {
        if (!isTtsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Cancel any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);
    
    useEffect(() => {
        // Clear errors when user starts typing
        if (error && userMessage) {
            setError(null);
        }
    }, [userMessage, error]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);
    
    // Manage Camera
    useEffect(() => {
        async function setupCamera() {
            if (isCameraOn && videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoRef.current.srcObject = stream;
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setError("Could not access camera. Please check permissions.");
                    setIsCameraOn(false);
                }
            } else if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
        setupCamera();
    }, [isCameraOn]);


    const clearResume = useCallback(() => {
        setResumeText('');
        setResumeFileName(null);
        setFileError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsFileProcessing(true);
        setFileError(null);
        setResumeText('');
        setResumeFileName(null);

        const processFile = async (file: File) => {
            try {
                let text = '';
                if (file.type === 'application/pdf') {
                    const arrayBuffer = await file.arrayBuffer();
                    const typedArray = new Uint8Array(arrayBuffer);
                    const pdf = await pdfjs.getDocument(typedArray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                        fullText += pageText + ' ';
                    }
                    text = fullText.trim();
                } else if (file.type === 'text/plain') {
                    text = await file.text();
                } else {
                    throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
                }
                setResumeText(text);
                setResumeFileName(file.name);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : 'Could not read the file.';
                console.error("File processing error:", e);
                setFileError(errorMessage);
                clearResume();
            } finally {
                setIsFileProcessing(false);
            }
        };
        processFile(file);
    }, [clearResume]);

    const handleStartSession = async () => {
        if (!resumeText || !jobDescriptionText) {
            setError('Please provide both a resume and a job description.');
            return;
        }
        if (!isOnline) {
            setError('An internet connection is required to start a practice session.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setChatHistory([]);

        try {
            const chat = startInterviewChat();
            const firstPrompt = `Let's begin the interview practice. Here is the context.\n\n**Job Description:**\n---\n${jobDescriptionText}\n---\n\n**My Resume:**\n---\n${resumeText}\n---\n\nPlease start by introducing yourself and asking the first question.`;
            const response = await chat.sendMessage({ message: firstPrompt });
            setChatSession(chat);
            const modelText = response.text;
            setChatHistory([{ role: 'model', text: modelText }]);
            speak(modelText);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            console.error(e);
            setError(`Failed to start session: ${errorMessage}.`);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!userMessage.trim() || !chatSession || isLoading || !isOnline) return;

        const currentMessage = userMessage;
        setChatHistory(prev => [...prev, { role: 'user', text: currentMessage }]);
        setUserMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatSession.sendMessage({ message: currentMessage });
            const modelText = response.text;
            setChatHistory(prev => [...prev, { role: 'model', text: modelText }]);
            speak(modelText);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, I encountered an error: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendMessage();
    };

    const handleEndSession = () => {
        setChatSession(null);
        setChatHistory([]);
        setError(null);
        setIsLoading(false);
        setIsCameraOn(false);
        window.speechSynthesis.cancel();
    };

    const isSetupDisabled = isLoading || isFileProcessing;

    if (!chatSession) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="text-left mb-10">
                    <h1 className="text-4xl font-bold text-white">Interview Preparation</h1>
                    <p className="mt-2 text-lg text-slate-300">Get ready for your interview in a simulated environment with your AI coach.</p>
                </div>

                 <div className="relative bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {/* Step 1: Resume */}
                        <div className="flex flex-col items-center text-center">
                            <DocumentTextIcon className="h-10 w-10 text-indigo-400 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-200">Step 1: Your Resume</h3>
                            <p className="text-sm text-slate-400 mb-4">Provide your resume for context.</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt" disabled={isSetupDisabled} />
                            {isFileProcessing ? (
                                <div className="h-24 flex flex-col items-center justify-center">
                                    <Spinner className="border-indigo-400" />
                                    <p className="mt-2 text-sm text-slate-400">Processing...</p>
                                </div>
                            ) : resumeFileName ? (
                                <div className="h-24 flex flex-col items-center justify-center p-2 rounded-lg bg-green-900/50 text-green-300 w-full">
                                    <CheckCircleIcon className="h-6 w-6 mb-1" />
                                    <p className="font-semibold text-sm truncate w-full" title={resumeFileName}>{resumeFileName}</p>
                                    <button onClick={(e) => { e.stopPropagation(); clearResume(); }} className="mt-1 text-xs text-red-500 hover:underline" disabled={isSetupDisabled}>Remove</button>
                                </div>
                            ) : (
                                <button onClick={() => !isSetupDisabled && fileInputRef.current?.click()} disabled={isSetupDisabled} className="w-full h-24 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors disabled:cursor-not-allowed disabled:bg-slate-800/50">
                                    <span>Upload Resume</span>
                                </button>
                            )}
                            {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}
                        </div>

                        {/* Step 2: Job Description */}
                        <div className="flex flex-col items-center text-center">
                            <ClipboardIcon className="h-10 w-10 text-indigo-400 mb-3" />
                             <h3 className="text-lg font-semibold text-slate-200">Step 2: Job Description</h3>
                            <p className="text-sm text-slate-400 mb-4">Paste the job description.</p>
                            <textarea
                                value={jobDescriptionText}
                                onChange={(e) => setJobDescriptionText(e.target.value)}
                                placeholder="Paste here..."
                                className="w-full h-24 p-2 border-2 border-slate-600 rounded-lg bg-slate-700/50 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:cursor-not-allowed"
                                disabled={isSetupDisabled}
                            />
                        </div>

                        {/* Step 3: Start */}
                        <div className="flex flex-col items-center text-center">
                            <div className="h-10 w-10 mb-3 flex items-center justify-center">
                               <div className="relative h-10 w-10">
                                <Orb forceHoverState={true} hoverIntensity={0.1} />
                               </div>
                            </div>
                             <h3 className="text-lg font-semibold text-slate-200">Step 3: Begin</h3>
                            <p className="text-sm text-slate-400 mb-4">Start your mock interview.</p>
                            <div className="w-full h-24 flex items-center justify-center">
                               <button
                                    onClick={handleStartSession}
                                    disabled={!resumeText || !jobDescriptionText || isSetupDisabled || !isOnline}
                                    className="w-full h-full bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {isLoading ? <Spinner /> : 'Start Session'}
                                </button>
                            </div>
                        </div>
                    </div>
                     {error && (
                        <div className="mt-6 p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-center text-sm">
                          {error}
                        </div>
                      )}
                      {!isOnline && (
                         <div className="mt-6 p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-center text-sm">
                          An internet connection is required to start a practice session.
                        </div>
                      )}
                 </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto relative">
             {isCameraOn && (
                <div className="absolute top-4 right-4 z-20 w-48 h-36 bg-black rounded-lg shadow-lg overflow-hidden border-2 border-indigo-500/50 animate-fade-in">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                </div>
            )}
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <NextHireLogo className="h-8 w-8 text-indigo-400" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Live Interview Practice</h2>
                        <p className="text-sm text-slate-400">Your AI Coach is ready.</p>
                    </div>
                </div>
                <button
                    onClick={handleEndSession}
                    className="px-4 py-1.5 text-sm bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
                >
                    End Session
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <NextHireLogo className="h-8 w-8 flex-shrink-0 text-indigo-400 mt-1" />}
                        <div className={`p-4 rounded-2xl max-w-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            <FormattedMessage text={msg.text} role={msg.role} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex gap-3 justify-start animate-fade-in">
                        <NextHireLogo className="h-8 w-8 flex-shrink-0 text-indigo-400 mt-1" />
                        <div className="p-4 rounded-2xl max-w-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                            <Spinner />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 p-4 bg-slate-900/50 border-t border-slate-700">
                {error && (
                    <div className="p-3 mb-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-center text-sm animate-fade-in" role="alert">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                     <button type="button" onClick={() => setIsTtsEnabled(p => !p)} className={`p-2 rounded-lg transition-colors ${isTtsEnabled ? 'bg-slate-700 text-indigo-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} title={isTtsEnabled ? 'Mute AI Voice' : 'Unmute AI Voice'}>
                        {isTtsEnabled ? <VolumeUpIcon className="h-6 w-6" /> : <VolumeOffIcon className="h-6 w-6" />}
                    </button>
                    <button type="button" onClick={() => setIsCameraOn(p => !p)} className={`p-2 rounded-lg transition-colors ${isCameraOn ? 'bg-slate-700 text-indigo-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}>
                        {isCameraOn ? <CameraIcon className="h-6 w-6" /> : <CameraSlashIcon className="h-6 w-6" />}
                    </button>
                    <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={isLoading || !isOnline}
                        className="flex-grow p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-white bg-slate-700/50 placeholder:text-slate-400 disabled:opacity-50"
                    />
                    <button type="submit" disabled={isLoading || !userMessage.trim() || !isOnline} className="p-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                        <SendIcon className="h-6 w-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InterviewPrepView;