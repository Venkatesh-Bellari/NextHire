import React, { useRef, useEffect } from 'react';
import Orb from './Orb';
import Header from './Header';
import FeaturesSection from './FeaturesSection';
import { View } from '../App';
import UserPlusIcon from './icons/UserPlusIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import ChartPieIcon from './icons/ChartPieIcon';
import RocketLaunchIcon from './icons/RocketLaunchIcon';
import MissionVisual from './MissionVisual';

const useAnimateOnScroll = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, { 
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px' 
        });

        const elements = document.querySelectorAll('.animate-section');
        elements.forEach(el => observer.observe(el));

        return () => {
            const elements = document.querySelectorAll('.animate-section');
            elements.forEach(el => observer.unobserve(el));
        };
    }, []);
};

const AboutUsSection = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} className="bg-slate-900 py-32 sm:py-40 overflow-hidden">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2">
        <div className="animate-section animate-slide-in-left">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Our Mission: Your Career, Elevated.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            In a competitive job market, talent alone isn't enough. NextHire was born from a simple idea: to democratize career growth. We leverage the power of AI to provide every job seeker with the personalized tools and insights needed to not just find a job, but to build a fulfilling career. We're here to level the playing field.
          </p>
        </div>
        <div className="h-80 lg:h-full animate-section animate-scale-in">
          <MissionVisual />
        </div>
      </div>
    </div>
  </div>
));

const howItWorksSteps = [
    { name: 'Create Your Profile', description: 'Sign up for a free account and build your professional profile in minutes.', icon: UserPlusIcon },
    { name: 'Upload Your Resume', description: 'Add your resume to unlock powerful AI analysis and personalized job matching.', icon: ArrowUpTrayIcon },
    { name: 'Use the AI Toolkit', description: 'Analyze your resume, practice for interviews, and create custom learning roadmaps.', icon: ChartPieIcon },
    { name: 'Land Your Dream Job', description: 'Apply with confidence, armed with the insights you need to get ahead.', icon: RocketLaunchIcon },
];

const HowItWorksSection = React.forwardRef<HTMLDivElement>((props, ref) => (
    <div ref={ref} className="bg-slate-900 py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center animate-section animate-fade-in-up">
                <h2 className="text-base font-semibold leading-7 text-indigo-400">Get Started in Minutes</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">A Clear Path to Success</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-10 text-base leading-7 text-gray-600 md:grid-cols-2 lg:grid-cols-4 lg:gap-y-16">
                    {howItWorksSteps.map((step, index) => (
                        <div key={step.name} className="relative pl-9 animate-section animate-fade-in-up" style={{transitionDelay: `${index * 150}ms`}}>
                            <dt className="inline font-semibold text-white">
                                <step.icon className="absolute left-0 top-1 h-6 w-6 text-indigo-400" aria-hidden="true" />
                                {step.name}
                            </dt>
                            <dd className="inline text-slate-400"> {step.description}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    </div>
));

const CtaSection = ({ onNavigate }: { onNavigate: (view: View) => void }) => (
    <div className="relative isolate overflow-hidden px-6 py-24 text-center shadow-2xl sm:px-16">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Fast-Track Your Career?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Join NextHire today and take the first step towards your dream job. It's free to get started.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
             <button
                onClick={() => onNavigate('signup')}
                className="rounded-md bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-transform transform hover:scale-105"
            >
                Sign Up for Free
            </button>
        </div>
        <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
        >
            <circle cx={512} cy={512} r={512} fill="url(#8d958450-c69f-4251-94bc-4e091a323369)" fillOpacity="0.7" />
            <defs>
            <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
            </defs>
        </svg>
    </div>
);

interface LandingPageProps {
    onNavigate: (view: View) => void;
}

const LandingPage = ({ onNavigate }: LandingPageProps) => {
    useAnimateOnScroll();
    const featuresRef = useRef<HTMLDivElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);

    const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-slate-900">
            <div className="relative w-full min-h-screen overflow-hidden flex flex-col">
                <Header 
                    onNavigate={onNavigate}
                    onScrollTo={{
                        features: () => handleScroll(featuresRef),
                        about: () => handleScroll(aboutRef),
                        howItWorks: () => handleScroll(howItWorksRef),
                    }}
                />
                
                <div className="absolute inset-0 z-0">
                   <Orb />
                </div>

                <main className="relative z-10 flex flex-col items-center justify-center flex-grow text-center text-white px-4">
                    <div className="animate-section is-visible animate-fade-in-up">
                        <div className="inline-block px-4 py-1 mb-6 text-sm bg-black/20 border border-white/10 rounded-full">
                           <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Next-Gen Career Platform</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                          Your Career, <br/> Supercharged by AI
                        </h1>
                        <p className="max-w-2xl mx-auto mt-6 text-lg text-slate-300">
                          Stop guessing. Start optimizing. Analyze your resume, practice for interviews, and land your dream job with NextHire.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <button
                                onClick={() => onNavigate('signup')}
                                className="rounded-md bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-transform transform hover:scale-105"
                            >
                                Get started for free
                            </button>
                            <button onClick={() => handleScroll(featuresRef)} className="text-base font-semibold leading-6 text-white hover:text-slate-200">
                                See Features <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            
            <FeaturesSection ref={featuresRef} onNavigate={onNavigate} />
            <AboutUsSection ref={aboutRef} />
            <HowItWorksSection ref={howItWorksRef} />
            
            <div className="px-6 lg:px-8 py-24">
                <div className="animate-section animate-scale-in">
                    <CtaSection onNavigate={onNavigate} />
                </div>
            </div>
        </div>
    );
};

export default LandingPage;