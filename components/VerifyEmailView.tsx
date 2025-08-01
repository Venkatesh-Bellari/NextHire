import React, { useState, useCallback, useEffect } from 'react';
import { auth, User, logOut, resendVerificationEmail } from '../services/firebaseService';
import Spinner from './Spinner';
import NextHireLogo from './icons/NextHireLogo';
import ResumeIcon from './icons/ResumeIcon';
import InterviewIcon from './icons/InterviewIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import RoadmapIcon from './icons/RoadmapIcon';
import AskAiPopup from './AskAiPopup';

interface VerifyEmailViewProps {
    user: User;
}

const RESEND_COOLDOWN_KEY = 'nexthire_email_resend_cooldown';

const features = [
  {
    name: 'AI Resume Analysis',
    description: 'Optimize your resume against any job description to get past filters.',
    icon: ResumeIcon,
  },
  {
    name: 'Practice Interviews',
    description: 'Simulate real interviews with an AI coach tailored to your target role.',
    icon: InterviewIcon,
  },
  {
    name: 'Skill-Based Challenges',
    description: 'Sharpen your coding and aptitude skills in our Practice Zone.',
    icon: BrainCircuitIcon,
  },
  {
    name: 'Learning Roadmaps',
    description: 'Generate custom, step-by-step learning plans for any new skill.',
    icon: RoadmapIcon,
  },
];

const VerifyEmailView = ({ user }: VerifyEmailViewProps) => {
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const [resendError, setResendError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const cooldownEndTime = localStorage.getItem(RESEND_COOLDOWN_KEY);
        if (cooldownEndTime) {
            const remainingTime = Math.ceil((parseInt(cooldownEndTime, 10) - Date.now()) / 1000);
            if (remainingTime > 0) {
                setCountdown(remainingTime);
            } else {
                localStorage.removeItem(RESEND_COOLDOWN_KEY);
            }
        }
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown <= 0) {
            localStorage.removeItem(RESEND_COOLDOWN_KEY);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResendEmail = useCallback(async () => {
        if (countdown > 0 || isResending) return;

        setIsResending(true);
        setResendMessage(null);
        setResendError(null);

        try {
            await resendVerificationEmail();
            setResendMessage("A new verification link has been sent to your email.");
            
            const newCooldownEndTime = Date.now() + 60000;
            localStorage.setItem(RESEND_COOLDOWN_KEY, newCooldownEndTime.toString());
            setCountdown(60);

        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/too-many-requests') {
                 setResendError("You've requested this too many times. Please wait a moment and try again.");
            } else {
                 setResendError("Failed to resend email. Please try again later.");
            }
        } finally {
            setIsResending(false);
        }
    }, [countdown, isResending]);

    const handleContinue = async () => {
        if (isChecking) return;
        setIsChecking(true);
        setResendError(null);
        
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                await logOut();
                return;
            }
            
            await currentUser.reload();
            
            if (auth.currentUser?.emailVerified) {
                window.location.reload();
            } else {
                setResendError("Your email is still not verified. Please check your inbox and click the link.");
                setTimeout(() => setResendError(null), 5000);
            }

        } catch(error: any) {
            console.error("Error checking verification status:", error);
            if (error.code === 'auth/too-many-requests') {
                 setResendError("Status check failed due to too many requests. Please wait a moment.");
            } else {
                setResendError("Could not check verification status. Please try again.");
            }
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <>
            <div className="flex min-h-screen flex-col justify-center items-center px-4 py-12 bg-slate-900">
                <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                    <div className="text-center">
                        <NextHireLogo className="h-12 w-12 mx-auto text-indigo-400" />
                        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                            Welcome to NextHire!
                        </h2>
                        <p className="mt-4 text-lg text-slate-300">
                            One last step to unlock your potential. A verification link has been sent to <strong className="text-indigo-400">{user.email}</strong>.
                        </p>
                    </div>

                    <div className="mt-8 bg-slate-800/50 p-8 rounded-2xl shadow-xl border border-white/10">
                        <div className="border-b border-slate-700 pb-6 mb-6">
                            <h3 className="text-lg font-semibold text-center text-indigo-300 mb-4">Your AI-powered career toolkit includes:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                {features.map((feature) => (
                                    <div key={feature.name} className="flex items-start gap-3">
                                        <feature.icon className="h-7 w-7 text-indigo-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-slate-200">{feature.name}</h4>
                                            <p className="text-sm text-slate-400">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-center text-slate-300">
                                Please check your inbox (and spam folder!), then click below to continue.
                            </p>
                            <button
                                onClick={handleContinue}
                                disabled={isChecking}
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-base font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                {isChecking ? <Spinner /> : "I've Verified My Email"}
                            </button>
                            
                            <div className="text-center text-sm">
                                <span className="text-slate-400">Didn't receive an email? </span>
                                <button
                                    onClick={handleResendEmail}
                                    disabled={isResending || countdown > 0}
                                    className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                >
                                    {isResending ? (
                                        <Spinner className="h-5 w-5 inline-block"/>
                                    ) : countdown > 0 ? (
                                        `Resend in ${countdown}s`
                                    ) : (
                                        'Resend link'
                                    )}
                                </button>
                            </div>
                            
                            {resendMessage && <p className="mt-2 text-sm text-center text-green-400">{resendMessage}</p>}
                            {resendError && <p className="mt-2 text-sm text-center text-red-400">{resendError}</p>}
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={logOut}
                                className="text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AskAiPopup chatType="landing" />
        </>
    );
};

export default VerifyEmailView;
