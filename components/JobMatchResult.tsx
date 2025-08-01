import React from 'react';
import { JobMatchReport, AdvancementPlan, AdvancementResource } from '../types';
import ProgressCircle from './ProgressCircle';
import XCircleIcon from './icons/XCircleIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import BeakerIcon from './icons/BeakerIcon';
import BadgeCheckIcon from './icons/BadgeCheckIcon';

interface JobMatchResultProps {
  report: JobMatchReport;
}

const AdvancementResourceCard = ({ title, items, icon: Icon, iconColor }: { title: string, items: AdvancementResource[], icon: React.ElementType, iconColor: string }) => {
    if (!items || items.length === 0) return null;
    return (
        <div>
            <h5 className={`flex items-center text-md font-semibold text-slate-200 mb-2`}>
                <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />
                {title}
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
                {items.map((item, index) => (
                    <li key={index} className="bg-slate-900/50 p-3 rounded-md border border-slate-700/50">
                        <p className="font-semibold text-slate-200">{item.title}</p>
                        <p className="text-slate-400">{item.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AdvancementPlanSection = ({ plan }: { plan: AdvancementPlan }) => {
    if (!plan) return null;
    const hasContent = (plan.courses?.length || 0) > 0 || (plan.projects?.length || 0) > 0 || (plan.certifications?.length || 0) > 0;
    if (!hasContent) return null;

    return (
        <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="text-xl font-bold text-fuchsia-400 mb-2">
                Your Advancement Plan
            </h3>
             <p className="text-sm text-slate-400 mb-6">Actionable steps to become a top candidate for this role.</p>
            <div className="space-y-6">
                <AdvancementResourceCard title="Recommended Courses" items={plan.courses} icon={BookOpenIcon} iconColor="text-sky-400" />
                <AdvancementResourceCard title="Project Ideas" items={plan.projects} icon={BeakerIcon} iconColor="text-teal-400" />
                <AdvancementResourceCard title="Valuable Certifications" items={plan.certifications} icon={BadgeCheckIcon} iconColor="text-amber-400" />
            </div>
        </div>
    )
}

const JobMatchResult = ({ report }: JobMatchResultProps) => {
  const { generalAnalysis, recommendations } = report;
  const cardClass = "bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10";

  return (
    <div className="space-y-8 animate-fade-in">
        <div className={cardClass}>
            <h2 className="text-3xl font-bold text-center text-white mb-6">Your Resume Snapshot</h2>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-shrink-0">
                    <ProgressCircle score={generalAnalysis.strengthScore} label="Overall Strength" />
                </div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-semibold text-slate-200">Summary</h3>
                    <p className="mt-2 text-slate-300">{generalAnalysis.summary}</p>
                </div>
            </div>
             <div className="mt-8 border-t border-slate-700 pt-6">
                <h3 className="flex items-center text-xl font-semibold text-amber-400">
                    <XCircleIcon className="h-6 w-6 mr-2" />
                    Key Improvement Areas
                </h3>
                <ul className="mt-4 space-y-3 text-slate-300 list-disc list-inside">
                    {generalAnalysis.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                    ))}
                </ul>
            </div>
        </div>
      
      <div className="text-center pt-8">
        <h2 className="text-3xl font-bold text-white">Top Job Recommendations</h2>
        <p className="mt-2 text-slate-300 max-w-2xl mx-auto">Based on your snapshot, here are some job roles that could be a great fit.</p>
      </div>

      {recommendations.map((job, index) => (
        <div key={index} className={cardClass}>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <ProgressCircle score={job.atsScore} label="ATS Score" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-2xl font-bold text-indigo-400">{job.roleTitle}</h3>
              <p className="mt-2 text-slate-300">{job.matchSummary}</p>
              
              {job.missingSkills.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-200 mb-2">Skills to Develop:</h4>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {job.missingSkills.map((skill, i) => (
                      <span key={i} className="bg-yellow-500/10 text-yellow-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {job.suggestedImprovements.length > 0 && (
             <div className="mt-6 border-t border-slate-700 pt-6">
                <h3 className="flex items-center text-xl font-semibold text-green-400">
                    <LightbulbIcon className="h-6 w-6 mr-2" />
                    Resume Suggestions for this Role
                </h3>
                <ul className="mt-4 space-y-3 text-slate-300 list-disc list-inside">
                    {job.suggestedImprovements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                    ))}
                </ul>
            </div>
          )}
          {job.advancementPlan && <AdvancementPlanSection plan={job.advancementPlan} />}
        </div>
      ))}
    </div>
  );
};

export default JobMatchResult;