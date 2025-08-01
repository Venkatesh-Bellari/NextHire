import React from 'react';
import { AnalysisReport, SkillGapAnalysisItem, SkillGapResource } from '../types';
import ProgressCircle from './ProgressCircle';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import BeakerIcon from './icons/BeakerIcon';
import BadgeCheckIcon from './icons/BadgeCheckIcon';

interface AnalysisResultProps {
  report: AnalysisReport;
}

const ResourceCard = ({ title, items, icon: Icon }: { title: string, items: SkillGapResource[], icon: React.ElementType }) => {
    if (items.length === 0) return null;
    return (
        <div>
            <h5 className="flex items-center text-md font-semibold text-slate-300 mb-2">
                <Icon className="h-5 w-5 mr-2 text-indigo-400" />
                {title}
            </h5>
            <ul className="space-y-2 text-sm text-slate-400">
                {items.map((item, index) => (
                    <li key={index} className="bg-slate-900/50 p-2 rounded-md">
                        <p className="font-semibold text-slate-200">{item.title}</p>
                        <p>{item.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SkillGapCard = ({ item }: { item: SkillGapAnalysisItem }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h4 className="text-lg font-bold text-amber-300">{item.skill}</h4>
        <p className="text-sm text-slate-400 mt-1 mb-4">{item.reason}</p>
        <div className="space-y-4">
            <ResourceCard title="Top Courses" items={item.courses} icon={BookOpenIcon} />
            <ResourceCard title="Micro-Project Ideas" items={item.projects} icon={BeakerIcon} />
            <ResourceCard title="Certifications" items={item.certifications} icon={BadgeCheckIcon} />
        </div>
    </div>
);


const AnalysisResult = ({ report }: AnalysisResultProps) => {
  const { matchScore, summary, strengths, improvements, keywordAnalysis, suggestedBulletPoints, skillGapAnalysis } = report;
  
  const cardClass = "bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className={cardClass}>
        <h2 className="text-3xl font-bold text-center text-white mb-6">Your Analysis Report</h2>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex-shrink-0">
            <ProgressCircle score={matchScore} />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-xl font-semibold text-slate-200">Overall Summary</h3>
            <p className="mt-2 text-slate-300">{summary}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cardClass}>
          <h3 className="flex items-center text-xl font-semibold text-green-400">
            <CheckCircleIcon className="h-6 w-6 mr-2" />
            Key Strengths
          </h3>
          <ul className="mt-4 space-y-3 text-slate-300 list-disc list-inside">
            {strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
        <div className={cardClass}>
          <h3 className="flex items-center text-xl font-semibold text-amber-400">
            <XCircleIcon className="h-6 w-6 mr-2" />
            Areas for Improvement
          </h3>
          <ul className="mt-4 space-y-3 text-slate-300 list-disc list-inside">
            {improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className={cardClass}>
          <h3 className="flex items-center text-xl font-semibold text-blue-400 mb-4">
             Keyword Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">Matched Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.matched.map((kw, i) => <span key={i} className="bg-green-500/10 text-green-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
              </div>
            </div>
             <div>
              <h4 className="font-semibold text-red-400 mb-2">Missing Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.missing.map((kw, i) => <span key={i} className="bg-red-500/10 text-red-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
              </div>
            </div>
             <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Suggested Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keywordAnalysis.suggested.map((kw, i) => <span key={i} className="bg-yellow-500/10 text-yellow-300 text-sm font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
              </div>
            </div>
          </div>
      </div>

      {skillGapAnalysis && skillGapAnalysis.length > 0 && (
          <div className={cardClass}>
              <h3 className="flex items-center text-xl font-semibold text-fuchsia-400 mb-4">
                  Skill Gap Fixer
              </h3>
              <p className="text-sm text-slate-400 mt-1 mb-4">Actionable steps to bridge the skill gaps identified from your resume.</p>
              <div className="space-y-6">
                {skillGapAnalysis.map((item, index) => <SkillGapCard key={index} item={item} />)}
              </div>
          </div>
      )}

      <div className={cardClass}>
        <h3 className="flex items-center text-xl font-semibold text-indigo-400">
          <LightbulbIcon className="h-6 w-6 mr-2" />
          Suggested Resume Bullet Points
        </h3>
        <p className="text-sm text-slate-400 mt-1 mb-4">Consider adding these AI-generated points to your resume to better target this job.</p>
        <ul className="mt-4 space-y-3 text-slate-300 list-disc list-inside">
          {suggestedBulletPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisResult;