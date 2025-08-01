import React, { useState, useEffect } from 'react';
import { signUp, signInWithGithub } from '../services/firebaseService';
import { View } from '../App';
import NextHireLogo from './icons/NextHireLogo';
import Spinner from './Spinner';
import EyeIcon from './icons/EyeIcon';
import EyeSlashIcon from './icons/EyeSlashIcon';
import GithubIcon from './icons/GithubIcon';
import AskAiPopup from './AskAiPopup';


interface SignUpViewProps {
    onNavigate: (view: View) => void;
}

const SignUpView = ({ onNavigate }: SignUpViewProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.body.className = 'bg-slate-900 text-slate-100';
    }, []);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }
        try {
            await signUp(email, password);
            // onAuthStateChanged in App.tsx will handle the redirect
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError("This email address is already in use. Please try logging in.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password is too weak. It must be at least 6 characters long.");
            } else {
                setError("Failed to create an account. Please try again later.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGithubSignIn = async () => {
        setError(null);
        try {
            await signInWithGithub();
            // onAuthStateChanged will handle success
        } catch (err) {
            setError("Failed to sign in with GitHub. Please try again.");
            console.error(err);
        }
    };

    return (
        <>
            <div className="flex min-h-screen flex-col justify-center items-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
                    <div onClick={() => onNavigate('landing')} className="flex items-center justify-center gap-2 cursor-pointer">
                        <NextHireLogo className="h-10 w-10 text-indigo-400" />
                        <h2 className="text-3xl font-bold text-white">NextHire</h2>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-white">
                        Create your account
                    </h3>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                     <div className="bg-slate-800/50 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/10">
                        <form className="space-y-6" onSubmit={handleSignUp}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-200">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-white bg-slate-700/50 shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-200">
                                        Password
                                    </label>
                                </div>
                                <div className="mt-2 relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 pr-10 text-white bg-slate-700/50 shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-400"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-600"
                                >
                                    {isLoading ? <Spinner /> : "Create account"}
                                </button>
                            </div>
                        </form>
                         <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-slate-800 px-2 text-slate-400">Or</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                 <button
                                    onClick={handleGithubSignIn}
                                    className="flex w-full items-center justify-center gap-3 rounded-md bg-slate-700/50 px-3 py-1.5 text-white ring-1 ring-inset ring-slate-600 hover:bg-slate-700 focus-visible:outline-offset-0"
                                >
                                    <GithubIcon className="h-5 w-5" />
                                    <span className="text-sm font-semibold leading-6">Sign up with GitHub</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="mt-10 text-center text-sm text-slate-400">
                        Already a member?{' '}
                        <button onClick={() => onNavigate('login')} className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
            <AskAiPopup chatType="landing" />
        </>
    );
};

export default SignUpView;