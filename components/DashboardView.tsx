import React, { useState, useEffect } from 'react';
import { User, logOut, getUserProfile } from '../services/firebaseService';
import { UserProfile } from '../types';
import AnalyzerView from './AnalyzerView';
import NextHireLogo from './icons/NextHireLogo';
import ResumeIcon from './icons/ResumeIcon';
import BrainCircuitIcon from './icons/BrainCircuitIcon';
import InterviewIcon from './icons/InterviewIcon';
import LogoutIcon from './icons/LogoutIcon';
import InterviewPrepView from './InterviewPrepView';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import PracticeView from './PracticeView';
import RoadmapIcon from './icons/RoadmapIcon';
import RoadmapView from './RoadmapView';
import Orb from './Orb';
import JobMatcherView from './JobMatcherView';
import TargetIcon from './icons/TargetIcon';
import ProfileIcon from './icons/ProfileIcon';
import ProfileView from './ProfileView';
import AskAiPopup from './AskAiPopup';

interface DashboardViewProps {
    user: User;
}

type ActiveView = 'profile' | 'analyzer' | 'jobMatcher' | 'prep' | 'practice' | 'roadmap';

const DashboardView = ({ user }: DashboardViewProps) => {
    const [activeView, setActiveView] = useState<ActiveView>('profile');
    const isOnline = useOnlineStatus();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.uid) {
                try {
                    const userProfile = await getUserProfile(user.uid);
                    setProfile(userProfile);
                } catch (error) {
                    console.error("Failed to fetch profile for header:", error);
                }
            }
        };
        fetchProfile();
    }, [user, activeView]);


    const handleLogout = async () => {
        try {
            await logOut();
            // onAuthStateChanged in App.tsx will handle view change
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };
    
    const navItems = [
        { id: 'analyzer', label: 'Resume Analyzer', icon: ResumeIcon },
        { id: 'jobMatcher', label: 'Job Matcher', icon: TargetIcon },
        { id: 'prep', label: 'Interview Prep', icon: InterviewIcon },
        { id: 'practice', label: 'Practice Zone', icon: BrainCircuitIcon },
        { id: 'roadmap', label: 'Roadmap Generator', icon: RoadmapIcon },
    ];

    const renderActiveView = () => {
        switch (activeView) {
            case 'profile':
                return <ProfileView user={user} />;
            case 'analyzer':
                return <AnalyzerView />;
            case 'jobMatcher':
                return <JobMatcherView />;
            case 'prep':
                return <InterviewPrepView />;
            case 'practice':
                return <PracticeView user={user} />;
            case 'roadmap':
                return <RoadmapView user={user} />;
            default:
                return <ProfileView user={user} />;
        }
    };

    return (
        <div className="relative w-full h-screen">
            <div className="absolute inset-0 z-0">
                <Orb />
            </div>
            <div className="relative z-10 flex h-full">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900/70 backdrop-blur-lg border-r border-slate-700 flex flex-col">
                    <div className="flex items-center justify-center gap-2 h-20 border-b border-slate-700">
                        <NextHireLogo className="h-8 w-8 text-indigo-400" />
                        <span className="text-2xl font-bold text-white">NextHire</span>
                    </div>
                    <nav className="flex-grow px-4 py-4">
                        <ul>
                            {navItems.map(item => (
                                 <li key={item.id}>
                                    <a
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setActiveView(item.id as ActiveView); }}
                                        className={`flex items-center px-4 py-3 my-1 rounded-lg transition-all duration-300 ${activeView === item.id ? 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow-lg' : 'text-slate-300 hover:bg-slate-700/60'}`}
                                    >
                                        <item.icon className="h-6 w-6 mr-3" />
                                        <span>{item.label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="px-4 py-4 border-t border-slate-700">
                        <a
                            href="#"
                            onClick={handleLogout}
                            className="flex items-center px-4 py-3 my-1 rounded-lg text-slate-300 hover:bg-slate-700/60 transition-colors"
                        >
                            <LogoutIcon className="h-6 w-6 mr-3" />
                            <span>Logout</span>
                        </a>
                    </div>
                </aside>
                
                {/* Main section with header + content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Right Header */}
                    <header className="flex-shrink-0 h-20 flex justify-end items-center pr-6 sm:pr-8 lg:pr-10">
                        <button 
                            onClick={() => setActiveView('profile')}
                            className={`group flex items-center gap-3 p-2 rounded-full transition-colors duration-300 ${activeView === 'profile' ? 'bg-slate-700/80' : 'hover:bg-slate-700/50'}`}
                        >
                            <span className="font-semibold text-white hidden sm:inline">{profile?.fullName || user.displayName || 'My Profile'}</span>
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600 group-hover:border-indigo-500 transition-colors">
                                {profile?.profilePicture ? (
                                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover"/>
                                ) : (
                                    <ProfileIcon className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                        </button>
                    </header>
                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 pt-0">
                      {!isOnline && (
                          <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 mb-6 rounded-md shadow" role="alert">
                              <p className="font-bold">You are currently offline</p>
                              <p className="text-sm">AI features are disabled. Full functionality will resume when you reconnect.</p>
                          </div>
                      )}
                      {renderActiveView()}
                    </main>
                </div>
            </div>
            <AskAiPopup chatType="helper" />
        </div>
    );
};

export default DashboardView;