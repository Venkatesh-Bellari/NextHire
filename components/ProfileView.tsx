


import React, { useState, useEffect, ChangeEvent, FormEvent, useRef, KeyboardEvent } from 'react';
import { User, getUserProfile, saveUserProfile, uploadFile } from '../services/firebaseService';
import { UserProfile, Experience, Education, ProfileProject, SkillSet, Certification } from '../types';
import Spinner from './Spinner';
import PencilIcon from './icons/PencilIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import CodeBracketIcon from './icons/CodeBracketIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import TrashIcon from './icons/TrashIcon';
import ProfileIcon from './icons/ProfileIcon';
import UploadIcon from './icons/UploadIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import GithubIcon from './icons/GithubIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import PhoneIcon from './icons/PhoneIcon';
import LocationMarkerIcon from './icons/LocationMarkerIcon';
import SparklesIcon from './icons/SparklesIcon';

interface ProfileViewProps {
    user: User;
}

const defaultProfile: UserProfile = {
    fullName: '',
    profilePicture: '',
    email: '',
    phoneNumber: '',
    location: '',
    currentStatus: '',
    linkedInURL: '',
    githubURL: '',
    portfolioLink: '',
    education: [],
    experience: [],
    skills: {
        languages: [],
        frameworks: [],
        tools: [],
        softSkills: [],
        certifications: [],
    },
    projects: [],
    resumeUploadURL: '',
    resumeLastUpdatedDate: '',
    dailyQuizStreak: 0,
    lastQuizDate: '',
};

// Reusable Tag Input Component
const TagInput = ({
    tags,
    onAdd,
    onRemove,
    placeholder
}: {
    tags: string[];
    onAdd: (tag: string) => void;
    onRemove: (tag: string) => void;
    placeholder: string;
}) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = e.currentTarget.value.trim().replace(/,/g, '');
            if (newTag) {
                onAdd(newTag);
                e.currentTarget.value = '';
            }
        }
    };

    return (
        <div>
            <input
                type="text"
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="block w-full rounded-md border-0 py-1.5 text-white bg-slate-700/50 shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            />
            <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                    <div key={tag} className="flex items-center bg-indigo-500/20 text-indigo-300 text-sm font-medium px-2.5 py-1 rounded-full">
                        {tag}
                        <button type="button" onClick={() => onRemove(tag)} className="ml-2 text-indigo-200 hover:text-white">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ProfileView = ({ user }: ProfileViewProps) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [formData, setFormData] = useState<UserProfile>(defaultProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const profilePicInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.uid) return;
            setIsLoading(true);
            try {
                const userProfile = await getUserProfile(user.uid);
                const initialProfile = userProfile ? 
                    {...defaultProfile, ...userProfile, email: user.email} 
                    : { ...defaultProfile, id: user.uid, fullName: user.displayName || '', email: user.email || '' };
                setProfile(initialProfile);
                setFormData(initialProfile);
            } catch (err) {
                setError('Failed to load profile.');
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [user]);

    const handleEditToggle = () => {
        if (isEditing) {
            if (profile) setFormData(profile);
            setError(null);
            setProfilePictureFile(null);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };
    
    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!user?.uid) return;
        setIsSaving(true);
        setError(null);
        
        let updatedFormData = { ...formData };

        try {
            if (profilePictureFile) {
                const path = `profilePictures/${user.uid}/${profilePictureFile.name}`;
                const url = await uploadFile(profilePictureFile, path);
                updatedFormData.profilePicture = url;
            }

            await saveUserProfile(user.uid, updatedFormData);
            setProfile(updatedFormData);
            setFormData(updatedFormData);
            setIsEditing(false);
            setProfilePictureFile(null);

        } catch (err) {
            setError('Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
    };

    const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfilePictureFile(file);
    };

    const handleNestedChange = <T extends 'experience' | 'education' | 'projects'>(
        section: T,
        index: number,
        field: keyof UserProfile[T][number],
        value: string
    ) => {
        setFormData(prev => {
            const newSectionData = [...(prev[section] as any[])];
            newSectionData[index] = { ...newSectionData[index], [field]: value };
            return { ...prev, [section]: newSectionData };
        });
    };
    
    const handleTagChange = (
        section: 'projects',
        index: number,
        field: 'technologiesUsed',
        action: 'add' | 'remove',
        value: string
    ) => {
        setFormData(prev => {
            const sectionData = prev[section] as ProfileProject[];
            const item = sectionData[index];
            let newTags: string[];
            if(action === 'add' && !item.technologiesUsed.includes(value)){
                newTags = [...item.technologiesUsed, value];
            } else {
                 newTags = item.technologiesUsed.filter(t => t !== value);
            }
            const newItem = {...item, [field]: newTags};
            const newSectionData = [...sectionData];
            newSectionData[index] = newItem;
            return {...prev, [section]: newSectionData};
        });
    };
    
    const handleSkillTagChange = (
        category: keyof Omit<SkillSet, 'certifications'>,
        action: 'add' | 'remove',
        value: string
    ) => {
        setFormData(prev => {
            const skills = prev.skills!;
            const currentTags = skills[category] as string[];
            let newTags: string[];

            if(action === 'add' && !currentTags.includes(value)) {
                newTags = [...currentTags, value];
            } else {
                newTags = currentTags.filter(t => t !== value);
            }

            return {
                ...prev,
                skills: { ...skills, [category]: newTags }
            };
        });
    };

    const handleCertificationChange = (index: number, field: keyof Certification, value: string) => {
        setFormData(prev => {
            const certs = [...(prev.skills?.certifications || [])];
            certs[index] = { ...certs[index], [field]: value };
            return { ...prev, skills: { ...(prev.skills!), certifications: certs }};
        });
    };

    const handleAddItem = <T extends 'experience' | 'education' | 'projects' | 'certifications'>(
        section: T,
        newItem: any
    ) => {
        const newItemWithId = { ...newItem, id: crypto.randomUUID() };
        if (section === 'certifications') {
            setFormData(prev => ({
                ...prev,
                skills: { ...prev.skills!, certifications: [...(prev.skills?.certifications || []), newItemWithId] }
            }));
        } else if (section === 'experience') {
            setFormData(prev => ({
                ...prev,
                experience: [...(prev.experience || []), newItemWithId]
            }));
        } else if (section === 'education') {
            setFormData(prev => ({
                ...prev,
                education: [...(prev.education || []), newItemWithId]
            }));
        } else if (section === 'projects') {
            setFormData(prev => ({
                ...prev,
                projects: [...(prev.projects || []), newItemWithId]
            }));
        }
    };
    
    const handleRemoveItem = <T extends 'experience' | 'education' | 'projects' | 'certifications'>(section: T, index: number) => {
         if (section === 'certifications') {
             setFormData(prev => ({
                ...prev,
                skills: { ...prev.skills!, certifications: (prev.skills?.certifications || []).filter((_, i) => i !== index) }
            }));
        } else if (section === 'experience') {
            setFormData(prev => ({
                ...prev,
                experience: (prev.experience || []).filter((_, i) => i !== index)
            }));
        } else if (section === 'education') {
            setFormData(prev => ({
                ...prev,
                education: (prev.education || []).filter((_, i) => i !== index)
            }));
        } else if (section === 'projects') {
            setFormData(prev => ({
                ...prev,
                projects: (prev.projects || []).filter((_, i) => i !== index)
            }));
        }
    };

    const cardClass = "bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10";
    const inputClass = "block w-full rounded-md border-0 py-1.5 text-white bg-slate-700/50 shadow-sm ring-1 ring-inset ring-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6";
    const labelClass = "block text-sm font-medium leading-6 text-slate-300 mb-1";
    
    const currentData = isEditing ? formData : profile;
    if (isLoading || !currentData) return <div className="flex justify-center items-center h-full"><Spinner className="h-10 w-10"/></div>;
    if (error) return <div className="text-center p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
             <form onSubmit={handleSave}>
                {/* Header Section */}
                <div className={`${cardClass} flex flex-col md:flex-row items-center gap-6`}>
                    <div className="relative group">
                         <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                           { currentData.profilePicture || profilePictureFile ? (
                               <img src={profilePictureFile ? URL.createObjectURL(profilePictureFile) : currentData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                               <ProfileIcon className="w-20 h-20 text-slate-500" />
                           )}
                        </div>
                        {isEditing && (
                            <div onClick={() => profilePicInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <UploadIcon className="h-8 w-8 text-white"/>
                                <input type="file" ref={profilePicInputRef} onChange={handleProfilePictureChange} className="hidden" accept="image/*"/>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        {isEditing ? (
                             <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your Full Name" className={`${inputClass} text-3xl font-bold mb-2`} />
                        ) : (
                            <h1 className="text-3xl font-bold text-white">{currentData.fullName || "Your Name"}</h1>
                        )}
                        {isEditing ? (
                            <input type="text" name="currentStatus" value={formData.currentStatus} onChange={handleChange} placeholder="e.g., Final Year Student" className={`${inputClass} text-lg`} />
                        ) : (
                            <p className="text-lg text-indigo-400 font-semibold">{currentData.currentStatus || "Current Status"}</p>
                        )}
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-2">
                             {isEditing ? (
                                 <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" className={`${inputClass} text-sm`} />
                            ) : (
                                currentData.location && <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1"><LocationMarkerIcon className="h-4 w-4"/> {currentData.location}</p>
                            )}
                            {(currentData.dailyQuizStreak || 0) > 0 && !isEditing && (
                                <div className="flex items-center gap-1.5 text-yellow-400 font-semibold text-sm">
                                    <SparklesIcon className="h-4 w-4" />
                                    <span>{currentData.dailyQuizStreak} Day Streak</span>
                                </div>
                            )}
                        </div>
                         <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                            {isEditing ? (
                                <>
                                    <input type="url" name="linkedInURL" value={formData.linkedInURL} onChange={handleChange} placeholder="LinkedIn URL" className={inputClass} />
                                    <input type="url" name="githubURL" value={formData.githubURL} onChange={handleChange} placeholder="GitHub URL" className={inputClass} />
                                    <input type="url" name="portfolioLink" value={formData.portfolioLink} onChange={handleChange} placeholder="Portfolio URL" className={inputClass} />
                                </>
                            ) : (
                                <>
                                    {currentData.linkedInURL && <a href={currentData.linkedInURL} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400"><LinkedInIcon className="h-6 w-6"/></a>}
                                    {currentData.githubURL && <a href={currentData.githubURL} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400"><GithubIcon className="h-6 w-6"/></a>}
                                    {currentData.portfolioLink && <a href={currentData.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400"><GlobeAltIcon className="h-6 w-6"/></a>}
                                </>
                            )}
                         </div>
                    </div>
                     {!isEditing && (
                        <button type="button" onClick={handleEditToggle} className="flex self-start items-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                            <PencilIcon className="h-5 w-5" /> Edit
                        </button>
                    )}
                </div>
                
                 {/* Basic Info Section */}
                <div className={cardClass}>
                     <h2 className="text-2xl font-bold text-indigo-400 mb-4">Contact Information</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isEditing ? (
                             <div><label className={labelClass}>Email</label><input type="email" value={formData.email} disabled className={`${inputClass} disabled:opacity-50`} /></div>
                        ) : (
                            <div><p className={labelClass}>Email</p><p className="text-slate-300">{currentData.email}</p></div>
                        )}
                        {isEditing ? (
                             <div><label className={labelClass}>Phone Number</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={inputClass} /></div>
                        ) : (
                            currentData.phoneNumber && <div><p className={labelClass}>Phone Number</p><p className="text-slate-300">{currentData.phoneNumber}</p></div>
                        )}
                     </div>
                </div>

                {/* Skills Section */}
                <div className={cardClass}>
                    <h2 className="text-2xl font-bold text-indigo-400 mb-4">Skills</h2>
                    <div className="space-y-6">
                        {['languages', 'frameworks', 'tools', 'softSkills'].map(category => (
                            <div key={category}>
                                <h3 className="capitalize font-semibold text-slate-200 mb-2">{category.replace('softSkills', 'Soft Skills')}</h3>
                                {isEditing ? (
                                    <TagInput tags={formData.skills?.[category as keyof Omit<SkillSet, 'certifications'>] || []} onAdd={(tag) => handleSkillTagChange(category as keyof Omit<SkillSet, 'certifications'>, 'add', tag)} onRemove={(tag) => handleSkillTagChange(category as keyof Omit<SkillSet, 'certifications'>, 'remove', tag)} placeholder={`Add ${category}...`}/>
                                ) : (
                                     <div className="flex flex-wrap gap-2">
                                        {(currentData.skills?.[category as keyof Omit<SkillSet, 'certifications'>] || []).length > 0 ? (currentData.skills?.[category as keyof Omit<SkillSet, 'certifications'>] || []).map(skill => (
                                             <span key={skill} className="bg-slate-700 text-slate-200 text-sm font-medium px-2.5 py-1 rounded-full">{skill}</span>
                                        )) : <p className="text-slate-500 text-sm">Not specified.</p>}
                                    </div>
                                )}
                            </div>
                        ))}
                         <div>
                            <h3 className="font-semibold text-slate-200 mb-2">Certifications</h3>
                            <div className="space-y-4">
                                {currentData.skills?.certifications.map((cert, index) => (
                                    <div key={cert.id} className="p-3 bg-slate-900/50 rounded-lg">
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <input value={cert.name} onChange={e => handleCertificationChange(index, 'name', e.target.value)} placeholder="Certification Name" className={inputClass} />
                                                <input value={cert.provider} onChange={e => handleCertificationChange(index, 'provider', e.target.value)} placeholder="Provider (e.g., Coursera)" className={inputClass} />
                                                <input value={cert.certificateURL} onChange={e => handleCertificationChange(index, 'certificateURL', e.target.value)} placeholder="Certificate URL" className={inputClass} />
                                                <button type="button" onClick={() => handleRemoveItem('certifications', index)} className="flex items-center text-sm text-red-500 hover:text-red-400"><TrashIcon className="h-4 w-4 mr-1"/>Remove</button>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-semibold text-slate-200">{cert.name}</p>
                                                <p className="text-sm text-slate-400">{cert.provider}</p>
                                                {cert.certificateURL && <a href={cert.certificateURL} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline">View Credential</a>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isEditing && <button type="button" onClick={() => handleAddItem('certifications', { name: '', provider: '', certificateURL: '' })} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold"><PlusCircleIcon className="h-6 w-6"/>Add Certification</button>}
                            </div>
                         </div>
                    </div>
                </div>

                {/* Experience Section */}
                <div className={cardClass}>
                    <div className="flex items-center gap-3 mb-4"><BriefcaseIcon className="h-7 w-7 text-indigo-400"/><h2 className="text-2xl font-bold text-indigo-400">Experience</h2></div>
                    <div className="space-y-6">
                        {currentData.experience?.map((exp, index) => (
                             <div key={exp.id} className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-slate-700">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Role</label><input value={exp.roleTitle} onChange={e => handleNestedChange('experience', index, 'roleTitle', e.target.value)} className={inputClass} /></div>
                                            <div><label className={labelClass}>Company</label><input value={exp.companyName} onChange={e => handleNestedChange('experience', index, 'companyName', e.target.value)} className={inputClass} /></div>
                                            <div><label className={labelClass}>Start Date</label><input type="month" value={exp.startDate} onChange={e => handleNestedChange('experience', index, 'startDate', e.target.value)} className={inputClass} /></div>
                                            <div><label className={labelClass}>End Date</label><input type="month" value={exp.endDate} onChange={e => handleNestedChange('experience', index, 'endDate', e.target.value)} className={inputClass} /></div>
                                        </div>
                                        <div><label className={labelClass}>Description</label><textarea value={exp.description} onChange={e => handleNestedChange('experience', index, 'description', e.target.value)} rows={3} className={inputClass} /></div>
                                        <button type="button" onClick={() => handleRemoveItem('experience', index)} className="flex items-center text-sm text-red-500 hover:text-red-400"><TrashIcon className="h-4 w-4 mr-1"/>Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-lg text-slate-100">{exp.roleTitle}</h3>
                                        <p className="font-semibold text-slate-300">{exp.companyName}</p>
                                        <p className="text-sm text-slate-400 my-1">{exp.startDate} - {exp.endDate}</p>
                                        <p className="text-slate-300 whitespace-pre-wrap">{exp.description}</p>
                                    </>
                                )}
                            </div>
                        ))}
                        {isEditing && <button type="button" onClick={() => handleAddItem('experience', {roleTitle: '', companyName: '', startDate: '', endDate: '', description: ''})} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold"><PlusCircleIcon className="h-6 w-6"/>Add Experience</button>}
                        {!isEditing && !currentData.experience?.length && <p className="text-slate-400">No experience added yet.</p>}
                     </div>
                </div>

                {/* Education Section */}
                 <div className={cardClass}>
                    <div className="flex items-center gap-3 mb-4"><AcademicCapIcon className="h-7 w-7 text-indigo-400"/><h2 className="text-2xl font-bold text-indigo-400">Education</h2></div>
                     <div className="space-y-6">
                        {currentData.education?.map((edu, index) => (
                             <div key={edu.id} className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-slate-700">
                                {isEditing ? (
                                    <div className="space-y-4">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Degree</label><input value={edu.degree} onChange={e => handleNestedChange('education', index, 'degree', e.target.value)} className={inputClass} /></div>
                                            <div><label className={labelClass}>University/College</label><input value={edu.universityOrCollege} onChange={e => handleNestedChange('education', index, 'universityOrCollege', e.target.value)} className={inputClass} /></div>
                                            <div><label className={labelClass}>Start Year</label><input type="text" placeholder="YYYY" value={edu.startYear} onChange={e => handleNestedChange('education', index, 'startYear', e.target.value)} className={inputClass} /></div>
                                            <div><label className={labelClass}>End Year</label><input type="text" placeholder="YYYY" value={edu.endYear} onChange={e => handleNestedChange('education', index, 'endYear', e.target.value)} className={inputClass} /></div>
                                            <div className="md:col-span-2"><label className={labelClass}>Grade/CGPA</label><input value={edu.gradeOrCGPA} onChange={e => handleNestedChange('education', index, 'gradeOrCGPA', e.target.value)} className={inputClass} /></div>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveItem('education', index)} className="flex items-center text-sm text-red-500 hover:text-red-400"><TrashIcon className="h-4 w-4 mr-1"/>Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-lg text-slate-100">{edu.degree}</h3>
                                        <p className="font-semibold text-slate-300">{edu.universityOrCollege}</p>
                                        <p className="text-sm text-slate-400 my-1">{edu.startYear} - {edu.endYear}</p>
                                        <p className="text-sm text-slate-400">Grade: {edu.gradeOrCGPA}</p>
                                    </>
                                )}
                            </div>
                        ))}
                        {isEditing && <button type="button" onClick={() => handleAddItem('education', {degree: '', universityOrCollege: '', startYear: '', endYear: '', gradeOrCGPA: ''})} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold"><PlusCircleIcon className="h-6 w-6"/>Add Education</button>}
                         {!isEditing && !currentData.education?.length && <p className="text-slate-400">No education added yet.</p>}
                     </div>
                </div>

                {/* Projects Section */}
                <div className={cardClass}>
                    <div className="flex items-center gap-3 mb-4"><CodeBracketIcon className="h-7 w-7 text-indigo-400"/><h2 className="text-2xl font-bold text-indigo-400">Projects</h2></div>
                     <div className="space-y-6">
                        {currentData.projects?.map((proj, index) => (
                             <div key={proj.id} className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-slate-700">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <input value={proj.projectTitle} onChange={e => handleNestedChange('projects', index, 'projectTitle', e.target.value)} placeholder="Project Title" className={inputClass} />
                                        <input value={proj.projectLink} onChange={e => handleNestedChange('projects', index, 'projectLink', e.target.value)} placeholder="GitHub or Live URL" className={inputClass} />
                                        <textarea value={proj.description} onChange={e => handleNestedChange('projects', index, 'description', e.target.value)} placeholder="Project Description" rows={3} className={inputClass} />
                                        <TagInput tags={proj.technologiesUsed} onAdd={(tag) => handleTagChange('projects', index, 'technologiesUsed', 'add', tag)} onRemove={(tag) => handleTagChange('projects', index, 'technologiesUsed', 'remove', tag)} placeholder="Add technologies used..." />
                                        <button type="button" onClick={() => handleRemoveItem('projects', index)} className="flex items-center text-sm text-red-500 hover:text-red-400"><TrashIcon className="h-4 w-4 mr-1"/>Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-lg text-slate-100">{proj.projectTitle}</h3>
                                        {proj.projectLink && <a href={proj.projectLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline break-all">{proj.projectLink}</a>}
                                        <p className="mt-2 text-slate-300 whitespace-pre-wrap">{proj.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {proj.technologiesUsed.map(tech => <span key={tech} className="bg-slate-700 text-slate-200 text-xs font-medium px-2 py-0.5 rounded-full">{tech}</span>)}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {isEditing && <button type="button" onClick={() => handleAddItem('projects', {projectTitle: '', description: '', technologiesUsed: [], projectLink: ''})} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold"><PlusCircleIcon className="h-6 w-6"/>Add Project</button>}
                         {!isEditing && !currentData.projects?.length && <p className="text-slate-400">No projects added yet.</p>}
                     </div>
                </div>

                 {isEditing && (
                    <div className="flex justify-end items-center gap-4 mt-8 pb-8">
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <button type="button" onClick={handleEditToggle} className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-slate-500 transition-colors flex items-center">
                            {isSaving && <Spinner className="mr-2"/>}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                 )}
            </form>
        </div>
    );
};

export default ProfileView;