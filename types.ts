// --- Analysis & AI Types ---

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  suggested: string[];
}

export interface SkillGapResource {
  title: string;
  description: string;
}

export interface SkillGapAnalysisItem {
  skill: string;
  reason:string;
  courses: SkillGapResource[];
  projects: SkillGapResource[];
  certifications: SkillGapResource[];
}

export interface AdvancementResource {
  title: string;
  description: string;
}

export interface AdvancementPlan {
  courses: AdvancementResource[];
  projects: AdvancementResource[];
  certifications: AdvancementResource[];
}

export interface JobRecommendation {
  roleTitle: string;
  atsScore: number;
  matchSummary: string;
  missingSkills: string[];
  suggestedImprovements: string[];
  advancementPlan?: AdvancementPlan;
}

export interface GeneralResumeAnalysis {
  strengthScore: number;
  summary: string;
  improvements: string[];
}

export interface JobMatchReport {
  generalAnalysis: GeneralResumeAnalysis;
  recommendations: JobRecommendation[];
}

export interface AnalysisReport {
  matchScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordAnalysis: KeywordAnalysis;
  suggestedBulletPoints: string[];
  skillGapAnalysis: SkillGapAnalysisItem[];
}

// --- Roadmap Generator Types ---
export interface RoadmapResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'course' | 'interactive' | 'youtube';
}

export interface RoadmapTopic {
  name: string;
  description: string;
  resources: RoadmapResource[];
}

export interface RoadmapModule {
  title: string;
  summary: string;
  topics: RoadmapTopic[];
}

export interface RoadmapProjectSuggestion {
    title: string;
    description: string;
}

export interface LearningRoadmap {
  id?: string; // Firestore document ID
  userId?: string; // Associated user
  skill: string;
  overview: string;
  modules: RoadmapModule[];
  suggestedProjects: RoadmapProjectSuggestion[];
  suggestedCertifications: RoadmapResource[];
  savedAt?: any; // Firestore Timestamp
}


// --- Practice Zone Types ---
export interface PracticeQuestion {
    id: string; // Add a unique ID for each question
    question: string;
    type: 'multiple-choice' | 'coding' | 'error-finding' | 'tip';
    options?: string[]; // For multiple-choice
    codeSnippet?: string; // For debugging/error-finding
    sampleInputs?: string; // For LeetCode style problems
    sampleOutputs?: string; // For LeetCode style problems
    language?: string;
    companyTags?: string[]; // e.g., ['Google', 'Amazon', 'Meta']
    correctAnswer: string;
    explanation: string;
}

export interface UserAnswer {
    questionId: string;
    answer: string;
}

export interface DailyScoreRecord {
    score: number;
    date: string; // YYYY-MM-DD
    completedAt: any; // Firebase ServerValue.TIMESTAMP
}

export interface StandardPracticeRecord {
    completedAt: any; // Firebase ServerValue.TIMESTAMP
}


// --- Detailed Profile Types ---

export interface Education {
  id: string;
  degree: string;
  universityOrCollege: string;
  startYear: string;
  endYear: string;
  gradeOrCGPA: string;
}

export interface Experience {
  id: string;
  companyName: string;
  roleTitle: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProfileProject {
  id: string;
  projectTitle: string;
  description: string;
  technologiesUsed: string[];
  projectLink?: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  certificateURL?: string;
}

export interface SkillSet {
  languages: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
  certifications: Certification[];
}

export interface UserProfile {
    id?: string; // User's UID

    // Basic Information
    fullName?: string;
    profilePicture?: string;
    email?: string; // From auth, not typically user-editable
    phoneNumber?: string;
    location?: string;
    currentStatus?: string;
    linkedInURL?: string;
    githubURL?: string;
    portfolioLink?: string;
    
    // Structured Data
    education: Education[];
    experience: Experience[];
    skills: SkillSet;
    projects: ProfileProject[];

    // Resume
    resumeUploadURL?: string;
    resumeLastUpdatedDate?: string; // ISO string date
    
    // Gamification
    dailyQuizStreak?: number;
    lastQuizDate?: string; // YYYY-MM-DD
}