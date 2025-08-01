import React, { useState, useCallback, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { JobMatchReport } from '../types';
import { findMatchingJobs } from '../services/geminiService';
import Spinner from './Spinner';
import JobMatchResult from './JobMatchResult';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const JobMatcherView = () => {
  const isOnline = useOnlineStatus();
  const [resumeText, setResumeText] = useState('');
  const [jobMatchReport, setJobMatchReport] = useState<JobMatchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearResume = useCallback(() => {
    setResumeText('');
    setResumeFileName(null);
    setFileError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsFileProcessing(true);
    setFileError(null);
    setResumeText('');
    setResumeFileName(null);
    setJobMatchReport(null);

    const processFile = async (file: File) => {
      try {
        let text = '';
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          const typedArray = new Uint8Array(arrayBuffer);
          const pdf = await pdfjs.getDocument(typedArray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
            fullText += pageText + ' ';
          }
          text = fullText.trim();
        } else if (file.type === 'text/plain') {
          text = await file.text();
        } else {
          throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
        }
        setResumeText(text);
        setResumeFileName(file.name);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Could not read the file.';
        console.error("File processing error:", e);
        setFileError(errorMessage);
        clearResume();
      } finally {
        setIsFileProcessing(false);
      }
    };
    
    processFile(file);
  }, [clearResume]);

  const handleMatchJobs = useCallback(async () => {
    if (!resumeText) {
      setError('Please provide a resume.');
      return;
    }
    if (!isOnline) {
      setError('Job matching requires an internet connection.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setJobMatchReport(null);

    try {
      const report = await findMatchingJobs(resumeText);
      setJobMatchReport(report);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      setError(`Analysis failed: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, isOnline]);

  const isDisabled = isLoading || isFileProcessing;
  const isButtonDisabled = isDisabled || !isOnline || !resumeText;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-left mb-10">
        <h1 className="text-4xl font-bold text-white">Job Matcher</h1>
        <p className="mt-2 text-lg text-slate-300">
          Upload your resume and let our AI find the best job roles for you.
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10">
        <div className="space-y-8">
          <div>
            <label className="mb-2 font-semibold text-slate-200 block">Your Resume</label>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.txt"
                disabled={isDisabled}
              />
              <div
                className={`w-full p-4 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-center transition-colors duration-200 ${isDisabled ? 'bg-slate-800/50 cursor-not-allowed' : 'bg-slate-900/50 hover:border-indigo-500 cursor-pointer'}`}
                onClick={() => !isDisabled && fileInputRef.current?.click()}
              >
                {isFileProcessing ? (
                  <div className="py-8">
                    <Spinner className="border-indigo-400" />
                    <p className="mt-2 text-slate-400">Processing file...</p>
                  </div>
                ) : resumeFileName ? (
                  <div className="py-4 text-slate-300">
                    <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500" />
                    <p className="mt-2 font-semibold">{resumeFileName}</p>
                    <p className="text-sm text-slate-400">File loaded successfully.</p>
                    <button onClick={(e) => { e.stopPropagation(); clearResume(); }} className="mt-2 text-sm text-red-500 hover:underline disabled:text-slate-500" disabled={isDisabled}>Clear File</button>
                  </div>
                ) : (
                  <div className="py-8 text-slate-400">
                    <UploadIcon />
                    <p className="mt-2 font-semibold">Drag & drop or click to upload resume</p>
                    <p className="text-sm">Supported formats: PDF, TXT</p>
                  </div>
                )}
              </div>
              {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleMatchJobs}
            disabled={isButtonDisabled}
            className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? <Spinner /> : 'Find Matching Jobs'}
          </button>
          {!isOnline && (
            <p className="mt-2 text-sm text-amber-400">Job matching requires an internet connection.</p>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-8 p-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-center">
          {error}
        </div>
      )}

      {!isLoading && jobMatchReport && (
        <div className="mt-12">
          <JobMatchResult report={jobMatchReport} />
        </div>
      )}
    </div>
  );
};

export default JobMatcherView;