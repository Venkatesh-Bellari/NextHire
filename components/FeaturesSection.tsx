import React, { forwardRef } from 'react';
import ResumeIcon from './icons/ResumeIcon';
import ChatIcon from './icons/ChatIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import RoadmapIcon from './icons/RoadmapIcon';
import { View } from '../App';


const features = [
  {
    name: 'AI Resume Analysis',
    description: 'Get an instant, detailed breakdown of your resume against any job description to identify strengths and weaknesses.',
    icon: ResumeIcon,
  },
  {
    name: 'Interview Preparation',
    description: 'Practice with AI-generated questions tailored to your target role and receive feedback to boost your confidence.',
    icon: ChatIcon,
  },
  {
    name: 'Practice Zone',
    description: 'Hone your skills with interactive challenges in DSA, aptitude, coding, and debugging at various difficulty levels.',
    icon: BrainCircuitIcon,
  },
  {
    name: 'Learning Roadmaps',
    description: 'Generate step-by-step learning plans for any skill, complete with curated resources from across the web.',
    icon: RoadmapIcon,
  },
];

interface FeaturesSectionProps {
    onNavigate: (view: View) => void;
}

const FeaturesSection = forwardRef<HTMLDivElement, FeaturesSectionProps>(({ onNavigate }, ref) => {
  return (
    <div ref={ref} className="bg-slate-900 py-28 sm:py-36 relative overflow-hidden">
      <div className="absolute inset-0 top-0 left-0 w-full h-full bg-gradient-radial from-indigo-900/30 via-transparent to-transparent blur-3xl pointer-events-none"></div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center animate-section animate-fade-in-up">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">Your Complete Toolkit</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to land your dream job
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            From initial application to final interview, NextHire provides the AI-powered tools to give you a competitive edge at every step.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none perspective">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none md:grid-cols-2 lg:grid-cols-4 preserve-3d">
            {features.map((feature, index) => (
              <div 
                key={feature.name} 
                className="flex flex-col group animate-section animate-fade-in-up cursor-pointer" 
                style={{transitionDelay: `${index * 150}ms`}}
                onClick={() => onNavigate('signup')}
                role="button"
                aria-label={`Learn more and sign up for ${feature.name}`}
              >
                <div className="feature-card h-full flex flex-col p-6 rounded-2xl bg-slate-800/40 border border-white/10 group-hover:bg-slate-800/60 group-hover:border-indigo-500/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-300">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                      <feature.icon className="h-10 w-10 flex-none text-indigo-400 bg-white/10 p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(199,210,254,0.5)]" aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-300">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
});

export default FeaturesSection;
