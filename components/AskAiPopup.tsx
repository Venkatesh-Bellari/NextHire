import React, { useState, useEffect, useRef } from 'react';
import { startAiHelperChat, startLandingPageChat } from '../services/geminiService';
import type { Chat } from '@google/genai';
import Spinner from './Spinner';
import SparklesIcon from './icons/SparklesIcon';
import XIcon from './icons/XIcon';
import SendIcon from './icons/SendIcon';
import ReactMarkdown from 'react-markdown';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import NextHireLogo from './icons/NextHireLogo';

const FormattedMessage = ({ text }: { text: string }) => (
    <div className="prose prose-sm prose-invert max-w-none break-words">
        <ReactMarkdown>{text}</ReactMarkdown>
    </div>
);

interface AskAiPopupProps {
    chatType: 'helper' | 'landing';
}

const AskAiPopup = ({ chatType }: AskAiPopupProps) => {
    const isOnline = useOnlineStatus();
    const [isOpen, setIsOpen] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [userMessage, setUserMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const initialMessage = chatType === 'landing' 
        ? "Hello! I'm the NextHire assistant. Ask me anything about our features, and I'll show you how we can help you land your dream job."
        : "Hello! How can I help you today? Ask me anything about programming, interviews, or career advice.";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isLoading]);
    
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) { // If opening
             setChatHistory([]); // Clear history when opening
        } else { // If closing
            setChatSession(null);
            setUserMessage('');
            setIsLoading(false);
            setError(null);
        }
    };

    const sendMessage = async () => {
        if (!userMessage.trim() || isLoading || !isOnline) return;

        const currentMessage = userMessage;
        setChatHistory(prev => [...prev, { role: 'user', text: currentMessage }]);
        setUserMessage('');
        setIsLoading(true);
        setError(null);

        try {
            let session = chatSession;
            if (!session) {
                session = chatType === 'landing' ? startLandingPageChat() : startAiHelperChat();
                setChatSession(session);
            }
            const response = await session.sendMessage({ message: currentMessage });
            const modelText = response.text;
            setChatHistory(prev => [...prev, { role: 'model', text: modelText }]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Sorry, I encountered an error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendMessage();
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={toggleOpen}
                className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform transform focus:outline-none focus:ring-4 focus:ring-indigo-400/50"
                aria-label="Ask AI Assistant"
            >
                <SparklesIcon className="h-8 w-8" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4 animate-fade-in">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <SparklesIcon className="h-6 w-6 text-indigo-400" />
                                AI Assistant
                            </h2>
                            <button onClick={toggleOpen} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Initial message */}
                            <div className="flex gap-3 justify-start">
                                <NextHireLogo className="h-8 w-8 flex-shrink-0 text-indigo-400 mt-1" />
                                <div className="p-3 rounded-xl max-w-lg bg-slate-700 text-slate-200">
                                    <FormattedMessage text={initialMessage} />
                                </div>
                            </div>
                            
                            {chatHistory.map((msg, index) => (
                                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && <NextHireLogo className="h-8 w-8 flex-shrink-0 text-indigo-400 mt-1" />}
                                    <div className={`p-3 rounded-xl max-w-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                        <FormattedMessage text={msg.text} />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                 <div className="flex gap-3 justify-start">
                                    <NextHireLogo className="h-8 w-8 flex-shrink-0 text-indigo-400 mt-1" />
                                    <div className="p-3 rounded-xl bg-slate-700 text-slate-200">
                                        <Spinner />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex-shrink-0 p-4 border-t border-slate-700">
                            {error && (
                                <p className="text-red-400 text-xs text-center mb-2">{error}</p>
                            )}
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    placeholder={!isOnline ? "You are offline" : "Ask a question..."}
                                    disabled={isLoading || !isOnline}
                                    className="flex-grow p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-white bg-slate-700/50 placeholder:text-slate-400 disabled:opacity-50"
                                />
                                <button type="submit" disabled={isLoading || !userMessage.trim() || !isOnline} className="p-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                    <SendIcon className="h-6 w-6" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AskAiPopup;