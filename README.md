
# NextHire: AI-Powered Career Platform

<p align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/17c5b741-9488-466f-b2f5-9610fbfb149b" alt="NextHire Logo" width="120">
  <h1 align="center">NextHire</h1>
</p>

<p align="center">
  <strong>Your career, supercharged by AI.</strong>
  <br />
  An all-in-one platform to analyze resumes, practice for interviews, find matching jobs, and build personalized learning roadmaps.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Gemini API" />
</p>

---

## ✨ Key Features

NextHire provides a suite of powerful, AI-driven tools to give job seekers a competitive edge at every stage of their job hunt.

-   **🤖 AI Resume Analyzer**: Upload your resume and a job description to get an instant analysis, including a match score, keyword optimization, tailored bullet points, and a skill-gap analysis.
-   **🎯 Job Matcher**: Let the AI analyze your resume to recommend suitable job roles, complete with an ATS score, match summary, and a personalized advancement plan for each recommendation.
-   **🎙️ Interview Prep**: Practice for interviews with an AI coach that asks relevant questions based on your resume and target role, providing real-time feedback. Includes optional camera and text-to-speech for a more immersive experience.
-   **🧠 Practice Zone**: Sharpen your technical skills with interactive challenges.
    -   **Daily Quiz**: A 20-question mixed-category quiz that resets daily, with streak tracking.
    -   **Standard Practice**: Focused sessions on Data Structures, Coding, Aptitude, and more.
-   **🗺️ Roadmap Generator**: Generate personalized, step-by-step learning plans for any skill, complete with curated links to high-quality courses, articles, projects, and certifications.
-   **👤 Comprehensive User Profile**: Build a detailed professional profile including your experience, education, skills, and projects, which powers the AI features.
-   **💬 AI Assistant**: A friendly AI chatbot available on every page to answer questions about the platform or provide career-related advice.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Tailwind CSS
-   **AI & Machine Learning**: Google Gemini API (`@google/genai`) for all generative AI tasks.
-   **Backend & Database**: Firebase
    -   **Authentication**: Email/Password and GitHub OAuth.
    -   **Database**: Firebase Realtime Database for user profiles, saved roadmaps, and quiz data.
    -   **Storage**: Firebase Storage for profile picture uploads.
-   **Graphics & Animation**:
    -   **WebGL Orb**: `ogl` for the interactive background orb.
    -   **UI Animations**: CSS keyframes and Intersection Observer API for scroll-based animations.
-   **Utilities**:
    -   **PDF Parsing**: `pdf.js` to extract text from resumes.
    -   **Markdown Rendering**: `react-markdown` for formatting AI responses.
-   **Module Loading**: Leverages `esm.sh` for fast, CDN-based package resolution directly in the browser.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js and npm (or yarn)
-   A Firebase project
-   A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/nexthire.git
    cd nexthire
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up Firebase:**
    -   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    -   In your project, create a new Web App.
    -   Copy the `firebaseConfig` object and replace the placeholder configuration in `src/services/firebaseService.ts`.
    -   Enable **Authentication** (Email/Password and GitHub providers).
    -   Set up **Realtime Database** and **Storage**.
    -   Update your Realtime Database security rules with the content from `database.rules.json`.

4.  **Set up Environment Variables:**
    The application expects the Google Gemini API key to be available as an environment variable. Create a `.env` file in the root of the project and add your key:
    ```
    API_KEY=your_gemini_api_key
    ```
    _Note: In a production environment, this key should be managed securely through your hosting provider's environment variable settings._

5.  **Run the development server:**
    ```sh
    npm start 
    ```
    This will launch the application in your default browser.

## 📂 File Structure

The project follows a standard React application structure.

```
/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── icons/        # SVG icons as React components
│   ├── hooks/            # Custom React hooks (e.g., useOnlineStatus)
│   ├── services/         # API logic (Firebase, Gemini)
│   ├── App.tsx           # Main app component with routing logic
│   ├── index.tsx         # Root React entry point
│   └── types.ts          # All TypeScript type definitions
│
├── .env                  # Environment variables (API Key)
├── database.rules.json   # Firebase security rules
├── index.html            # Main HTML file with import maps
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/nexthire/issues).

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
