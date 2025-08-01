

import React, { useState, useEffect } from 'react';
import { generateLearningRoadmap } from '../services/geminiService';
import { LearningRoadmap, RoadmapModule, RoadmapResource } from '../types';
import Spinner from './Spinner';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { User, getSavedRoadmaps, saveRoadmap, deleteRoadmap } from '../services/firebaseService';
import CheckCircleIcon from './icons/CheckCircleIcon';
import BeakerIcon from './icons/BeakerIcon';
import BadgeCheckIcon from './icons/BadgeCheckIcon';
import TrashIcon from './icons/TrashIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import CodeBracketIcon from './icons/CodeBracketIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import CloudIcon from './icons/CloudIcon';
import LinkIcon from './icons/LinkIcon';


const popularRoles = [
  { 
    name: 'Data Scientist', 
    icon: ChartBarIcon,
    description: "Unlock insights from data with statistics and machine learning.",
    style: "bg-gradient-to-br from-blue-500 to-indigo-700 hover:from-blue-400 hover:to-indigo-600"
  },
  { 
    name: 'AI/ML Engineer', 
    icon: BrainCircuitIcon,
    description: "Build and deploy intelligent systems that learn and adapt.",
    style: "bg-gradient-to-br from-teal-400 to-cyan-600 hover:from-teal-300 hover:to-cyan-500"
  },
  { 
    name: 'Software Engineer', 
    icon: CodeBracketIcon,
    description: "Create robust applications and systems with modern code.",
    style: "bg-gradient-to-br from-slate-600 to-gray-800 hover:from-slate-500 hover:to-gray-700"
  },
  { 
    name: 'DevOps Engineer', 
    icon: CloudIcon,
    description: "Automate and streamline the software development lifecycle.",
    style: "bg-gradient-to-br from-fuchsia-600 to-purple-800 hover:from-fuchsia-500 hover:to-purple-700"
  },
];

const ResourceItem = ({ resource }: { resource: RoadmapResource }) => {
    // Check if URL is present and not just a placeholder
    const isClickable = resource.url && resource.url !== '#';
    const Tag = isClickable ? 'a' : 'div';
    const linkProps = isClickable ? { href: resource.url, target: "_blank", rel: "noopener noreferrer" } : {};

    return (
        <Tag 
            {...linkProps}
            className={`group flex items-center justify-between p-3 bg-slate-800/60 rounded-lg transition-all duration-200 ${isClickable ? 'hover:bg-slate-700/60 hover:ring-2 hover:ring-indigo-500' : 'cursor-default'}`}
        >
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200 truncate">
                    {resource.title}
                    <span className="ml-2 text-xs font-normal bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize align-middle">{resource.type}</span>
                </p>
            </div>
            {isClickable && <LinkIcon className="h-5 w-5 text-slate-400 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-4" />}
        </Tag>
    );
};

const RoadmapModuleDisplay = ({ module, index }: { module: RoadmapModule, index: number }) => (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
        <details className="group" open={index === 0}>
            <summary className="flex items-center justify-between p-4 cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                <h3 className="font-semibold text-lg text-white">{module.title}</h3>
                <span className="transform transition-transform duration-300 group-open:rotate-180 text-slate-400">▼</span>
            </summary>
            <div className="p-4 bg-slate-900/50 space-y-4">
                <p className="text-slate-300">{module.summary}</p>
                {module.topics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="p-4 border-l-4 border-indigo-800 bg-slate-800/70 rounded-r-lg">
                        <h4 className="font-semibold text-slate-200">{topic.name}</h4>
                        <p className="text-sm text-slate-400 mt-1 mb-3">{topic.description}</p>
                        <div className="space-y-3 text-sm">
                            {topic.resources.map((resource, resourceIndex) => (
                                <ResourceItem key={resourceIndex} resource={resource} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </details>
    </div>
);


interface RoadmapViewProps {
    user: User;
}

const RoadmapView = ({ user }: RoadmapViewProps) => {
    const isOnline = useOnlineStatus();
    const [skill, setSkill] = useState('');
    const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [savedRoadmaps, setSavedRoadmaps] = useState<LearningRoadmap[]>([]);
    const [isFetchingSaved, setIsFetchingSaved] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);


    useEffect(() => {
        const fetchRoadmaps = async () => {
            if (!user?.uid) return;
            setIsFetchingSaved(true);
            try {
                const roadmaps = await getSavedRoadmaps(user.uid);
                setSavedRoadmaps(roadmaps);
            } catch (e) {
                setError("Could not load your saved roadmaps.");
            } finally {
                setIsFetchingSaved(false);
            }
        };
        fetchRoadmaps();
    }, [user]);

    const handleGenerate = async (skillToUse?: string) => {
        const finalSkill = skillToUse || skill;
        if (!finalSkill.trim()) {
            setError('Please enter a skill or technology.');
            return;
        }
        if (!isOnline) {
            setError('Roadmap Generator requires an internet connection.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setRoadmap(null);
        setSaveSuccess(false);

        try {
            const result = await generateLearningRoadmap(finalSkill);
            setRoadmap(result);
            setSkill(finalSkill); // Update input box text
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate roadmap: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePopularRoleClick = (roleName: string) => {
        handleGenerate(roleName);
    };
    
    const handleSaveRoadmap = async () => {
        if (!roadmap || !user?.uid) return;
        setIsSaving(true);
        setError(null);
        setSaveSuccess(false);
        try {
            const savedId = await saveRoadmap(user.uid, roadmap);
            const newSavedRoadmap = { ...roadmap, id: savedId };
            setSavedRoadmaps(prev => [newSavedRoadmap, ...prev]);
            setRoadmap(newSavedRoadmap); // Update current roadmap with ID
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) {
            setError("Failed to save the roadmap. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectSavedRoadmap = (selectedRoadmap: LearningRoadmap) => {
        setRoadmap(selectedRoadmap);
        setSkill(selectedRoadmap.skill);
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteRoadmap = async (roadmapId: string) => {
        if (!user?.uid || !roadmapId) return;

        if (window.confirm("Are you sure you want to delete this roadmap? This action cannot be undone.")) {
            try {
                await deleteRoadmap(user.uid, roadmapId);
                setSavedRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
                // If the currently displayed roadmap is the one being deleted, clear it
                if (roadmap?.id === roadmapId) {
                    setRoadmap(null);
                    setSkill('');
                }
            } catch (e) {
                setError("Failed to delete the roadmap. Please try again.");
            }
        }
    };
    
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-left mb-10">
                <h1 className="text-4xl font-bold text-white">Roadmap Generator</h1>
                <p className="mt-2 text-lg text-slate-300">Enter any skill and get a complete learning plan, from zero to hero.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10">
                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-600" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-slate-800 px-2 text-sm text-slate-400">Enter a custom skill</span>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        placeholder="e.g., React, Machine Learning, UI/UX Design..."
                        className="flex-grow p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-white bg-slate-700/50 placeholder:text-slate-400"
                        disabled={isLoading}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={() => handleGenerate()}
                        disabled={isLoading || !isOnline || !skill.trim()}
                        className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Spinner /> : 'Generate Roadmap'}
                    </button>
                </div>
                 {!isOnline && <p className="mt-2 text-center text-sm text-amber-400">You need an internet connection to generate a roadmap.</p>}
                 {error && <p className="mt-4 text-center text-red-400">{error}</p>}
            </div>

            <div className="my-10">
                <h3 className="text-center text-lg font-semibold text-slate-300 mb-4">Or, get started with a popular role for 2025:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {popularRoles.map(role => (
                        <button
                            key={role.name}
                            onClick={() => handlePopularRoleClick(role.name)}
                            disabled={isLoading}
                            className={`p-6 rounded-xl text-left transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${role.style}`}
                        >
                            <role.icon className="h-12 w-12 mb-3 text-white/80" />
                            <h4 className="text-xl font-bold text-white">{role.name}</h4>
                            <p className="text-sm text-white/70 mt-1">{role.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {isFetchingSaved && <div className="mt-8 text-center"><Spinner /></div>}
            
            {!isFetchingSaved && savedRoadmaps.length > 0 && (
                <div className="mt-10 animate-fade-in">
                    <details className="bg-slate-800/50 border border-slate-700 rounded-lg group" open>
                        <summary className="p-4 font-semibold text-lg text-white cursor-pointer flex justify-between items-center">
                            Your Saved Roadmaps ({savedRoadmaps.length})
                             <span className="transform transition-transform duration-300 group-open:rotate-180 text-slate-400">▼</span>
                        </summary>
                        <div className="border-t border-slate-700 p-4 space-y-1">
                            {savedRoadmaps.map(saved => (
                                <div key={saved.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/60 group/item">
                                    <div 
                                        onClick={() => handleSelectSavedRoadmap(saved)}
                                        className="w-full text-left text-slate-300 cursor-pointer"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectSavedRoadmap(saved)}
                                    >
                                        {saved.skill}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRoadmap(saved.id!);
                                        }}
                                        className="ml-4 p-1 rounded-full text-slate-500 hover:bg-red-900/50 hover:text-red-400 transition-colors"
                                        title="Delete roadmap"
                                    >
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            )}

            {isLoading && (
                <div className="mt-8 text-center">
                    <Spinner className="h-10 w-10 border-indigo-400" />
                    <p className="mt-2 text-slate-300 animate-pulse">Building your learning path...</p>
                </div>
            )}
            
            {roadmap && (
                <div className="mt-10 space-y-6 animate-fade-in">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white">Your Roadmap to Master <span className="text-indigo-400">{roadmap.skill}</span></h2>
                        <p className="mt-2 max-w-2xl mx-auto text-slate-300">{roadmap.overview}</p>
                    </div>

                    {!roadmap.id && (
                         <div className="mt-6 text-center">
                            <button 
                                onClick={handleSaveRoadmap} 
                                disabled={isSaving || saveSuccess}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-slate-600 transition-colors transform hover:scale-105"
                            >
                                {isSaving ? <Spinner /> : (saveSuccess ? <CheckCircleIcon className="h-5 w-5" /> : null)}
                                {saveSuccess ? 'Saved!' : (isSaving ? 'Saving...' : 'Save Roadmap')}
                            </button>
                        </div>
                    )}

                    <div className="space-y-4">
                        {roadmap.modules.map((module, index) => (
                           <RoadmapModuleDisplay key={index} module={module} index={index} />
                        ))}
                    </div>

                    {/* Suggested Projects */}
                    {roadmap.suggestedProjects && roadmap.suggestedProjects.length > 0 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h3 className="flex items-center text-xl font-semibold text-white mb-4">
                               <BeakerIcon className="h-6 w-6 mr-3 text-fuchsia-400"/> Suggested Projects
                            </h3>
                            <div className="space-y-3">
                                {roadmap.suggestedProjects.map((project, index) => (
                                    <div key={index} className="p-3 bg-slate-800/60 rounded-lg">
                                        <p className="font-semibold text-slate-200">{project.title}</p>
                                        <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Suggested Certifications */}
                    {roadmap.suggestedCertifications && roadmap.suggestedCertifications.length > 0 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                            <h3 className="flex items-center text-xl font-semibold text-white mb-4">
                               <BadgeCheckIcon className="h-6 w-6 mr-3 text-amber-400"/> Free Certificate Resources
                            </h3>
                             <div className="space-y-3">
                                {roadmap.suggestedCertifications.map((cert, index) => (
                                    <ResourceItem key={index} resource={cert} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoadmapView;