

import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisReport, PracticeQuestion, LearningRoadmap, JobMatchReport } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: "AIzaSyCLqnBUUW6tw4NiNRi9JLGaSBtKBnCJsvM" });

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    matchScore: {
      type: Type.INTEGER,
      description: 'A score from 0 to 100 representing how well the resume matches the job description. Higher scores mean better alignment.'
    },
    summary: {
      type: Type.STRING,
      description: 'A concise, 2-3 sentence summary of the resume\'s fit for the role, written in an encouraging tone.'
    },
    strengths: {
      type: Type.ARRAY,
      description: 'A list of 3-5 key strengths from the resume that strongly align with the job description\'s requirements.',
      items: { type: Type.STRING }
    },
    improvements: {
      type: Type.ARRAY,
      description: 'A list of 3-5 specific, actionable areas for improvement in the resume to better match the role.',
      items: { type: Type.STRING }
    },
    keywordAnalysis: {
      type: Type.OBJECT,
      properties: {
        matched: {
          type: Type.ARRAY,
          description: 'A list of important keywords and skills from the job description that were successfully found in the resume.',
          items: { type: Type.STRING }
        },
        missing: {
          type: Type.ARRAY,
          description: 'A critical list of keywords and skills from the job description that are missing from the resume.',
          items: { type: Type.STRING }
        },
        suggested: {
            type: Type.ARRAY,
            description: 'A list of relevant keywords or skills that could be added to the resume to improve its alignment.',
            items: { type: Type.STRING }
        }
      },
      required: ["matched", "missing", "suggested"]
    },
    suggestedBulletPoints: {
      type: Type.ARRAY,
      description: 'A list of 2-3 rephrased or new resume bullet points, tailored to the job description, using action verbs and quantifying achievements.',
      items: { type: Type.STRING }
    },
    skillGapAnalysis: {
        type: Type.ARRAY,
        description: 'For each critical missing skill, provide an analysis with actionable advice to bridge the gap.',
        items: {
            type: Type.OBJECT,
            properties: {
                skill: { type: Type.STRING, description: 'The name of the missing skill.' },
                reason: { type: Type.STRING, description: 'A brief explanation of why this skill is important for the target job.' },
                courses: {
                    type: Type.ARRAY,
                    description: 'A list of 1-2 recommended online courses.',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'The name of the course.' },
                            description: { type: Type.STRING, description: 'A short description of the course and where to find it (e.g., Coursera, Udemy).' }
                        },
                        required: ['title', 'description']
                    }
                },
                projects: {
                    type: Type.ARRAY,
                    description: 'A list of 1-2 micro-project ideas to build practical experience.',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'The title of the project idea.' },
                            description: { type: Type.STRING, description: 'A brief overview of the project scope.' }
                        },
                        required: ['title', 'description']
                    }
                },
                certifications: {
                    type: Type.ARRAY,
                    description: 'A list of 1-2 relevant certifications.',
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'The name of the certification.' },
                            description: { type: Type.STRING, description: 'A short description of the certification and its provider.' }
                        },
                        required: ['title', 'description']
                    }
                }
            },
            required: ['skill', 'reason', 'courses', 'projects', 'certifications']
        }
    }
  },
  required: ["matchScore", "summary", "strengths", "improvements", "keywordAnalysis", "suggestedBulletPoints", "skillGapAnalysis"]
};

export const analyzeResume = async (resumeText: string, jobDescription: string): Promise<AnalysisReport> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following resume against the provided job description. Provide a detailed, constructive, and encouraging analysis.
        \n\n**Resume Text:**\n${resumeText}\n\n**Job Description:**\n${jobDescription}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisResponseSchema
        }
    });
    const jsonStr = response.text.trim();
    try {
        return JSON.parse(jsonStr) as AnalysisReport;
    } catch (e) {
        console.error("Failed to parse JSON from AI response:", jsonStr);
        throw new Error("The AI returned an invalid response format.");
    }
};

const advancementResourceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The title of the course, project, or certification.' },
        description: { type: Type.STRING, description: 'A brief description of the resource and why it is useful.' }
    },
    required: ['title', 'description']
};

const advancementPlanSchema = {
    type: Type.OBJECT,
    description: "An actionable plan for the user to advance their skills and become a top candidate for this role.",
    properties: {
        courses: {
            type: Type.ARRAY,
            description: "A list of 1-2 highly relevant online courses.",
            items: advancementResourceSchema
        },
        projects: {
            type: Type.ARRAY,
            description: "A list of 1-2 practical project ideas to build experience.",
            items: advancementResourceSchema
        },
        certifications: {
            type: Type.ARRAY,
            description: "A list of 1-2 valuable certifications to pursue.",
            items: advancementResourceSchema
        }
    },
    required: ['courses', 'projects', 'certifications']
};


const jobMatchResponseSchema = {
    type: Type.OBJECT,
    properties: {
        generalAnalysis: {
            type: Type.OBJECT,
            description: "A general analysis of the resume's overall quality and strength.",
            properties: {
                strengthScore: {
                    type: Type.INTEGER,
                    description: "An overall score from 0 to 100 representing the general quality and effectiveness of the resume."
                },
                summary: {
                    type: Type.STRING,
                    description: "A concise, 2-3 sentence summary of the resume's general strengths."
                },
                improvements: {
                    type: Type.ARRAY,
                    description: "A list of 2-3 specific, actionable areas for improvement for the resume in general.",
                    items: { type: Type.STRING }
                }
            },
            required: ["strengthScore", "summary", "improvements"]
        },
        recommendations: {
            type: Type.ARRAY,
            description: 'A list of 3-5 recommended job roles based on the provided resume.',
            items: {
                type: Type.OBJECT,
                properties: {
                    roleTitle: { type: Type.STRING, description: 'The title of the recommended job role.' },
                    atsScore: { type: Type.INTEGER, description: "An Applicant Tracking System (ATS) score from 0-100 indicating how well the resume is optimized for this specific type of role." },
                    matchSummary: { type: Type.STRING, description: 'A brief summary explaining why this role is a good match for the candidate.' },
                    missingSkills: {
                        type: Type.ARRAY,
                        description: 'A list of 2-3 key skills the candidate could learn to become an even better fit for this role.',
                        items: { type: Type.STRING }
                    },
                    suggestedImprovements: {
                        type: Type.ARRAY,
                        description: "A list of 2-3 specific bullet points or resume modifications tailored to this specific job recommendation.",
                        items: { type: Type.STRING }
                    },
                    advancementPlan: advancementPlanSchema
                },
                required: ['roleTitle', 'atsScore', 'matchSummary', 'missingSkills', 'suggestedImprovements', 'advancementPlan']
            }
        }
    },
    required: ["generalAnalysis", "recommendations"]
};


export const findMatchingJobs = async (resumeText: string): Promise<JobMatchReport> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following resume and recommend 3-5 suitable job roles. For each role, provide an ATS score, a match summary, missing skills, suggested resume improvements, and an advancement plan with courses, projects, and certifications. Also provide a general analysis of the resume's strengths.
        \n\n**Resume Text:**\n${resumeText}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: jobMatchResponseSchema
        }
    });
    const jsonStr = response.text.trim();
    try {
        return JSON.parse(jsonStr) as JobMatchReport;
    } catch (e) {
        console.error("Failed to parse JSON from AI response:", jsonStr);
        throw new Error("The AI returned an invalid response format.");
    }
};

const roadmapResourceSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The title of the resource or topic.' },
        url: { type: Type.STRING, description: 'A direct, working, and publicly accessible URL. Must be a stable link from an official or highly reputable source. If no suitable link is available, use "#".' },
        type: { type: Type.STRING, enum: ['youtube', 'article', 'documentation', 'course', 'interactive'], description: 'The type of the resource. Use "youtube" for YouTube channels or platforms.' }
    },
    required: ['title', 'url', 'type']
};

const projectSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "The name of the project idea."
        },
        description: {
            type: Type.STRING,
            description: "A brief description of the project and its relevance for the 2025 job market."
        }
    },
    required: ["title", "description"]
};

const learningRoadmapSchema = {
    type: Type.OBJECT,
    properties: {
        skill: { type: Type.STRING, description: 'The name of the skill or technology the roadmap is for.' },
        overview: { type: Type.STRING, description: 'A brief, encouraging overview of the learning journey for this skill.' },
        modules: {
            type: Type.ARRAY,
            description: 'A list of learning modules, progressing from basic to advanced.',
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'The title of the learning module.' },
                    summary: { type: Type.STRING, description: 'A brief summary of what this module covers.' },
                    topics: {
                        type: Type.ARRAY,
                        description: 'A list of specific topics within the module.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: 'The name of the topic.' },
                                description: { type: Type.STRING, description: 'A short explanation of the topic.' },
                                resources: {
                                    type: Type.ARRAY,
                                    description: 'A list of 1-3 high-quality learning resources for this topic.',
                                    items: roadmapResourceSchema
                                }
                            },
                            required: ['name', 'description', 'resources']
                        }
                    }
                },
                required: ['title', 'summary', 'topics']
            }
        },
        suggestedProjects: {
            type: Type.ARRAY,
            description: 'A list of AT LEAST 4 project ideas to apply the learned skills. The projects should be geared towards making a candidate job-ready in 2025. You must ONLY provide a title and a description for each project. DO NOT include any URLs or links.',
            items: projectSuggestionSchema
        },
        suggestedCertifications: {
            type: Type.ARRAY,
            description: 'A list of relevant and recognized FREE certification resources to validate the skills. Suggest a variety of providers (e.g., Microsoft Learn, Google Skillshop, freeCodeCamp).',
            items: roadmapResourceSchema
        }
    },
    required: ["skill", "overview", "modules", "suggestedProjects", "suggestedCertifications"]
};

export const generateLearningRoadmap = async (skill: string): Promise<LearningRoadmap> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a detailed learning roadmap for mastering "${skill}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: learningRoadmapSchema,
            systemInstruction: `You are a career development assistant who creates learning roadmaps. Your primary goal is to provide **only high-quality, official, and stable URLs from a diverse set of sources**.

            **CRITICAL RULES:**
            1.  **URL QUALITY:** Every single URL you provide **MUST** be active and lead to the correct content. Do not provide links that result in a 404 Not Found error.
            2.  **ACCESSIBILITY:** All resources must be publicly and freely accessible. Do not link to content that requires a subscription or user login to view.
            3.  **DIVERSE & REPUTABLE SOURCES:** Prioritize official documentation (e.g., MDN, React.dev), well-known educational platforms (e.g., Microsoft Learn, freeCodeCamp, edX), top-tier tech blogs (e.g., dev.to, Martin Fowler), and high-quality YouTube channels. **Do not over-rely on a single source like freeCodeCamp.**
            4.  **YOUTUBE CHANNELS:** You **MUST** include suggestions for at least 1-2 high-quality, top-rated YouTube channels for relevant topics. For each, provide the channel name (e.g., 'Traversy Media on YouTube') and a direct URL to the channel's main page. **Do not link to individual videos.** The 'type' for these resources must be 'youtube'.
            5.  **PROJECTS:** Provide AT LEAST FOUR suggested project ideas. These projects MUST be relevant for making a candidate job-ready in 2025. For each project, you MUST provide only a project title and a brief description. **DO NOT PROVIDE URLs, links, or articles of any kind.**
            6.  **CERTIFICATIONS:** Provide links to FREE certification resources from a variety of providers (e.g., Microsoft Learn, Google Skillshop, freeCodeCamp). Do not just list Coursera.
            7.  **NO GUESSING:** If a suitable, high-quality link does not exist for a course or certification, you MUST omit that resource or use a '#' placeholder for the URL. It is better to provide fewer, high-quality links than to provide a broken or low-quality one.
            8.  The roadmap should be comprehensive, logical, and encouraging.
            `
        },
    });

    const jsonStr = response.text.trim();
    try {
        const parsed = JSON.parse(jsonStr);
        return parsed as LearningRoadmap;
    } catch (e) {
        console.error("Failed to parse JSON from AI response:", jsonStr);
        throw new Error("The AI returned an invalid response format.");
    }
};


export const startInterviewChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are an expert technical interviewer and career coach. Your goal is to conduct a realistic, challenging, yet supportive mock interview based on the user's resume and a target job description. Start by introducing yourself professionally. Ask a mix of behavioral, technical, and role-specific questions. Provide constructive, actionable feedback after each of the user's answers. At the end of the interview, provide a detailed summary of the user's performance, highlighting strengths and areas for improvement. Maintain a professional, encouraging, and helpful tone throughout."
        }
    });
};

const practiceQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: 'The practice question text.' },
    type: { type: Type.STRING, enum: ['multiple-choice', 'coding', 'error-finding', 'tip'], description: 'The type of question.' },
    options: {
      type: Type.ARRAY,
      description: 'An array of 4-5 options for multiple-choice questions.',
      items: { type: Type.STRING }
    },
    codeSnippet: { type: Type.STRING, description: 'A snippet of code for error-finding or coding questions.' },
    language: { type: Type.STRING, description: 'The programming language of the code snippet, if applicable.' },
    companyTags: {
      type: Type.ARRAY,
      description: 'A list of 1-3 top tech companies that frequently ask this type of question.',
      items: { type: Type.STRING }
    },
    correctAnswer: { type: Type.STRING, description: 'The correct answer. For multiple-choice, it\'s one of the options. For coding, it\'s the correct code.' },
    explanation: { type: Type.STRING, description: 'A clear, detailed explanation of the correct answer and why other options are incorrect.' }
  },
  required: ['question', 'type', 'correctAnswer', 'explanation']
};

const multipleChoiceQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: 'The practice question text.' },
    type: { type: Type.STRING, enum: ['multiple-choice'], description: 'The type MUST be "multiple-choice".' },
    options: {
      type: Type.ARRAY,
      description: 'An array of EXACTLY 4 string options for the multiple-choice question.',
      items: { type: Type.STRING }
    },
    companyTags: {
      type: Type.ARRAY,
      description: 'A list of 1-3 top tech companies that frequently ask this type of question.',
      items: { type: Type.STRING }
    },
    correctAnswer: { type: Type.STRING, description: 'The correct answer, which MUST be one of the provided options.' },
    explanation: { type: Type.STRING, description: 'A clear, detailed explanation of the correct answer and why other options are incorrect.' }
  },
  required: ['question', 'type', 'options', 'correctAnswer', 'explanation']
};


export const generatePracticeQuestion = async (category: string, difficulty: string, language?: string, questionToTranslate?: PracticeQuestion | null): Promise<PracticeQuestion> => {
    let prompt;

    if (questionToTranslate) {
        prompt = `Translate the following interview question to ${language}. Provide the question text, code snippet (if any), options (if any), the correct answer, and explanation, all adapted for ${language}. Do not change the company tags. Question: ${JSON.stringify(questionToTranslate)}`;
    } else {
         const basePrompt = `Generate one high-quality, ${difficulty}-level practice question for a software engineering interview. The question should be from the "${category}" category.`;
         const languagePrompt = language ? ` The programming language should be ${language}.` : ' For coding questions, provide a good mix of questions, including some conceptual multiple choice and some error-finding or simple coding exercises.';
         prompt = basePrompt + languagePrompt;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: practiceQuestionSchema
        }
    });
    
    const jsonStr = response.text.trim();
    try {
        return JSON.parse(jsonStr) as PracticeQuestion;
    } catch(e) {
        console.error("Failed to parse practice question JSON:", jsonStr);
        throw new Error("The AI returned an invalid practice question format.");
    }
};

export const generateMultiplePracticeQuestions = async (category: string, difficulty: string, count: number): Promise<Omit<PracticeQuestion, 'id'>[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate ${count} high-quality, ${difficulty}-level **multiple-choice** practice questions for a software engineering interview from the "${category}" category. Each question must have exactly 4 options.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    questions: {
                        type: Type.ARRAY,
                        items: multipleChoiceQuestionSchema,
                    },
                },
                required: ['questions'],
            }
        }
    });

    const jsonStr = response.text.trim();
    try {
        const parsed = JSON.parse(jsonStr);
        const questions = parsed.questions || [];
        // Force the type to be multiple-choice to match what the frontend expects.
        return questions.map((q: any) => ({ ...q, type: 'multiple-choice' })) as Omit<PracticeQuestion, 'id'>[];
    } catch(e) {
        console.error("Failed to parse multiple practice questions JSON:", jsonStr);
        throw new Error("The AI returned an invalid format for multiple questions.");
    }
};

export const startAiHelperChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful and friendly AI assistant for "NextHire", a career development platform. Your expertise is strictly limited to topics related to software development, programming, data structures, algorithms, system design, job hunting strategies, resume improvement, and interview preparation.

            **Rule:** If a user asks a question outside of these topics (e.g., politics, celebrities, general knowledge, etc.), you MUST politely decline to answer. A good response would be: "My expertise is in career development and technology. I can help you with questions about programming, interviews, or job hunting strategies."
            
            Keep your answers concise, clear, and encouraging.`
        }
    });
};

export const startLandingPageChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a friendly and enthusiastic brand ambassador for "NextHire". Your goal is to answer questions about the platform to get users excited and encourage them to sign up. Your tone should be encouraging and helpful.

            Key Features to highlight:
            - **AI Resume Analysis**: Users can upload their resume and a job description to get an instant analysis, including a match score, keyword optimization, and tailored bullet points.
            - **Interview Prep**: Users can practice for interviews with an AI coach that asks relevant questions based on their resume and provides real-time feedback.
            - **Practice Zone**: Users can sharpen their skills with quizzes on Data Structures, Algorithms, and Aptitude, plus a daily challenge to build a streak.
            - **Roadmap Generator**: The AI can create personalized, step-by-step learning plans for any skill, complete with links to high-quality resources.
            
            When asked what NextHire is, give a concise summary of it being an all-in-one AI career platform.
            When asked about a feature, explain it clearly and highlight its benefit for a job seeker.
            Always end your responses by gently encouraging the user to sign up to try these features for themselves. For example: "It's a really powerful way to prepare. Why not sign up and give it a try?"`
        }
    });
};