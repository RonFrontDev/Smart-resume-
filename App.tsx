

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { WorkExperience, AppTab, Skill, Reference, WorkCategory, Education, SkillGapAnalysisResult } from './types';
import { MailIcon, PhoneIcon, LinkedInIcon, ChevronDownIcon, DownloadIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon, XIcon, InstagramIcon } from './components/icons';
import { FileText, Dumbbell, Briefcase, Users, Cpu, Camera, AlertTriangle, KeyRound, Sparkles, Copy, Check, FileDown, ListChecks, Lightbulb } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { en } from './i18n/en';
import { da } from './i18n/da';
import { sv } from './i18n/sv';
import { NavBar, NavItem } from './components/ui/tubelight-navbar';
import { cn } from './lib/utils';
import { ToggleSwitch } from './components/ui/toggle-switch';
import { GoogleGenAI, Type } from "@google/genai";
import { useCopyToClipboard } from 'usehooks-ts';


// --- DATA & TRANSLATIONS ---
const translations = { en, da, sv };

const ALL_SKILLS: Skill[] = [
  { name: "CrossFit Coaching", category: 'fitness' },
  { name: "Class Programming & Workout Design", category: 'fitness' },
  { name: "Technique & Movement Instruction (Olympic lifting, gymnastics, conditioning)", category: 'fitness' },
  { name: "Injury Prevention & Scaling for All Levels", category: 'fitness' },
  { name: "Mobility & Recovery Guidance", category: 'fitness' },
  { name: "Group Coaching & One-on-One Training", category: 'fitness' },
  { name: "Class Management & Time Efficiency", category: 'fitness' },
  { name: "Motivational Coaching & Athlete Development", category: 'fitness' },
  { name: "Building Community & Member Engagement", category: 'fitness' },
  { name: "Workshop & Event Organization", category: 'fitness' },
  { name: "Project Management", category: 'management' },
  { name: "Operational Management", category: 'management' },
  { name: "Client Relations", category: 'management' },
  { name: "Content Strategy", category: 'content-creation' },
  { name: "Social Media Management", category: 'content-creation' },
  { name: "Video Production", category: 'content-creation' },
  { name: "Full-Stack Development", category: 'tech' },
  { name: "React & TypeScript", category: 'tech' },
];

const workData: Omit<WorkExperience, 'role' | 'achievements'>[] = [
  { id: "kraftvrk", company: "Kraftvrk", duration: "June 2024 - Present", location: "Copenhagen, Denmark", category: ['Fitness Coaching', 'Content Creation'] },
  { id: "bookingboard", company: "Booking Board · Freelance", duration: "June 2023 - June 2024", location: "Berlin · Remote", category: ['Software Development'] },
  { id: "apollo", company: "Apollo Travels", duration: "April 2022 - March 2023", location: "Greece, Fuerteventura & Egypt", category: ['Fitness Coaching', 'Hospitality & Service'] },
  { id: "artesuave", company: "Arte Suave", duration: "January 2021 - Present", location: "Copenhagen, Denmark", category: ['Fitness Coaching', 'Content Creation'] },
  { id: "formfit", company: "Form & Fitness", duration: "2019 - Present", location: "Copenhagen, Denmark", category: ['Fitness Coaching'] },
  { id: "sats", company: "SATS", duration: "2019 - 2021", location: "Copenhagen, Denmark", category: ['Fitness Coaching'] },
  { id: "fitnessx", company: "FitnessX", duration: "2019 - 2021", location: "Copenhagen, Denmark", category: ['Fitness Coaching'] },
  { id: "cf2400", company: "Crossfit 2400", duration: "2017 - 2019", location: "Copenhagen, Denmark", category: ['Fitness Management', 'Fitness Coaching', 'Content Creation'] },
  { id: "mclernons", company: "McLernons", duration: "2015 - 2016", location: "Perth, Australia", category: ['Project Management'] },
  { id: "csa", company: "CSA", duration: "2009 - 2019", location: "Copenhagen, Denmark", category: ['Fitness Coaching'] },
];

// --- COMPONENTS ---
const LanguageSwitcher: React.FC<{ currentLang: keyof typeof translations; onSelectLang: (lang: keyof typeof translations) => void; className?: string }> = ({ currentLang, onSelectLang, className }) => (
  <div className={`flex items-center bg-gray-200/80 rounded-full p-0.5 shrink-0 ${className}`}>
    {Object.keys(translations).map((code) => (
      <button
        key={code}
        onClick={() => onSelectLang(code as keyof typeof translations)}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 ${currentLang === code ? 'bg-white text-orange-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
        aria-pressed={currentLang === code}
      >
        {code.toUpperCase()}
      </button>
    ))}
  </div>
);

const ControlButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean, className?: string }> = ({ onClick, title, children, disabled, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-full text-gray-500 hover:bg-gray-200/30 hover:text-gray-700 transition-colors duration-300 no-print disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    aria-label={title}
    title={title}
  >
    {children}
  </button>
);

const SkillsSection: React.FC<{ skills: Skill[] }> = ({ skills }) => {
  const getSkillColorClasses = (category: Skill['category']) => {
    switch (category) {
      case 'fitness': return 'bg-orange-100 text-orange-800';
      case 'tech': return 'bg-blue-100 text-blue-800';
      case 'management': return 'bg-purple-100 text-purple-800';
      case 'content-creation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <span key={skill.name} className={cn("text-sm font-medium px-3 py-1 rounded-full", getSkillColorClasses(skill.category))}>
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const ExperienceCard: React.FC<{ experience: WorkExperience; t: (typeof translations)['en'] }> = ({ experience, t }) => {
  const { fitness = [], professional = [] } = experience.achievements;

  const getCategoryColors = (category: WorkCategory) => {
    switch (category) {
      case 'Fitness Coaching': return { border: 'border-l-orange-500', text: 'text-orange-700', marker: 'marker:text-orange-500', bg: 'bg-orange-100' };
      case 'Software Development': return { border: 'border-l-blue-500', text: 'text-blue-700', marker: 'marker:text-blue-500', bg: 'bg-blue-100' };
      case 'Fitness Management': return { border: 'border-l-teal-500', text: 'text-teal-700', marker: 'marker:text-teal-500', bg: 'bg-teal-100' };
      case 'Project Management': return { border: 'border-l-purple-500', text: 'text-purple-700', marker: 'marker:text-purple-500', bg: 'bg-purple-100' };
      case 'Hospitality & Service': return { border: 'border-l-pink-500', text: 'text-pink-700', marker: 'marker:text-pink-500', bg: 'bg-pink-100' };
      case 'Content Creation': return { border: 'border-l-yellow-500', text: 'text-yellow-700', marker: 'marker:text-yellow-500', bg: 'bg-yellow-100' };
      default: return { border: 'border-l-gray-300', text: 'text-gray-700', marker: 'marker:text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const primaryCategory = experience.category[0];
  const cardColors = useMemo(() => getCategoryColors(primaryCategory), [primaryCategory]);

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 print:shadow-none print:p-0 print:mb-4",
      "py-6 pr-6 pl-5 border-l-4",
      cardColors.border
    )}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{experience.role}</h3>
          <p className={cn("text-md font-semibold", cardColors.text)}>{experience.company}</p>
          <p className="text-sm text-gray-500 mt-1">{experience.duration} &bull; {experience.location}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 mb-3">
          {experience.category.map(cat => {
              const colors = getCategoryColors(cat);
              return (
                  <span key={cat} className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", colors.bg, colors.text)}>
                      {cat}
                  </span>
              );
          })}
      </div>
      {(fitness.length > 0 || professional.length > 0) && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {fitness.length > 0 && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t.sections.achievements.fitness}</h4>
              <ul className={cn("list-disc list-inside text-gray-700 space-y-1.5 pl-2", cardColors.marker)}>
                {fitness.map((ach, idx) => <li key={`fit-${idx}`}>{ach}</li>)}
              </ul>
            </div>
          )}
          {professional.length > 0 && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t.sections.achievements.professional}</h4>
              <ul className={cn("list-disc list-inside text-gray-700 space-y-1.5 pl-2", cardColors.marker)}>
                {professional.map((ach, idx) => <li key={`pro-${idx}`}>{ach}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  sectionId: string;
  isCollapsed: boolean;
  onToggle: (id: string) => void;
}> = ({ title, children, sectionId, isCollapsed, onToggle }) => (
  <div className="bg-white/60 backdrop-blur-sm shadow-md rounded-xl mb-6 print-expand">
    <button
      onClick={() => onToggle(sectionId)}
      className={cn(
        "flex justify-between items-center w-full p-4 sm:p-5 text-left transition-colors duration-200 hover:bg-gray-100/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        isCollapsed ? 'rounded-xl' : 'rounded-t-xl'
      )}
      aria-expanded={!isCollapsed}
      aria-controls={`section-content-${sectionId}`}
    >
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <ChevronDownIcon className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`} />
    </button>
    <div
      id={`section-content-${sectionId}`}
      className={`transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-[10000px]'}`}
    >
      <div className="px-4 sm:px-5 pb-5">
        {children}
      </div>
    </div>
  </div>
);

const ContactModal: React.FC<{ t: (typeof translations)['en']; onClose: () => void; }> = ({ t, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
      aria-labelledby="contact-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <XIcon className="h-6 w-6" />
        </button>
        <h2 id="contact-modal-title" className="text-2xl font-bold text-gray-800 mb-6 text-center">{t.contact.title}</h2>
        <div className="space-y-4 text-lg">
          <a href={`tel:${t.contact.phone}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <PhoneIcon className="h-6 w-6 text-orange-600 flex-shrink-0" /> 
            <span className="text-gray-700">{t.contact.phone}</span>
          </a>
          <a href={`mailto:${t.contact.email}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <MailIcon className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <span className="text-gray-700">{t.contact.email}</span>
          </a>
          <a href={`https://${t.online.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors print-show-url">
            <LinkedInIcon className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <span className="text-gray-700">{t.online.linkedinText}</span>
          </a>
          <a href={`https://${t.online.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors print-show-url">
            <InstagramIcon className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <span className="text-gray-700">{t.online.instagramText}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const DownloadConfirmationModal: React.FC<{
  t: (typeof translations)['en'];
  onClose: () => void;
  onConfirm: () => void;
  language: string;
  isDownloading: boolean;
}> = ({ t, onClose, onConfirm, language, isDownloading }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDownloading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isDownloading]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
      aria-labelledby="download-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={() => !isDownloading && onClose()}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                <DownloadIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h2 id="download-modal-title" className="text-xl font-bold text-gray-800 mt-4">{t.downloadModal.title}</h2>
            <p className="mt-2 text-gray-600">
                {t.downloadModal.message.replace('{language}', language.toUpperCase())}
            </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row-reverse sm:justify-center gap-3">
          <button
            onClick={onConfirm}
            disabled={isDownloading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t.downloadModal.downloading}</span>
              </>
            ) : <span>{t.downloadModal.confirm}</span> }
          </button>
           <button
            onClick={onClose}
            disabled={isDownloading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t.downloadModal.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

const DevModeModal: React.FC<{
  t: (typeof translations)['en'];
  onClose: () => void;
  onConfirm: (code: string) => boolean;
  isActivating: boolean;
}> = ({ t, onClose, onConfirm, isActivating }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onConfirm(code)) {
      setError(t.devModeModal.error);
      setCode('');
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
      aria-labelledby="dev-mode-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-sm w-full animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label={t.devModeModal.cancel}>
          <XIcon className="h-6 w-6" />
        </button>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <KeyRound className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 id="dev-mode-modal-title" className="text-xl font-bold text-gray-800 mt-4">
            {isActivating ? t.devModeModal.titleActivate : t.devModeModal.titleDeactivate}
          </h2>
          <p className="mt-2 text-gray-600">
            {t.devModeModal.message}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="dev-mode-code" className="sr-only">{t.devModeModal.codeLabel}</label>
            <input
              ref={inputRef}
              id="dev-mode-code"
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••"
              autoComplete="off"
            />
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          </div>
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto flex-1 px-6 py-2.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors"
            >
              {t.devModeModal.confirm}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto flex-1 px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              {t.devModeModal.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AIHelperModal: React.FC<{
  t: (typeof translations)['en'];
  onClose: () => void;
  activeCategory: string;
  isGenerating: boolean;
  onGenerate: (jobDescription: string) => void;
  result: string;
  error: string;
  onStartOver: () => void;
  isAnalyzing: boolean;
  onAnalyze: (jobDescription: string) => void;
  analysisResult: SkillGapAnalysisResult | null;
  analysisError: string;
  isSummarizing: boolean;
  onGenerateSummary: () => void;
  analysisSummary: string;
  summaryError: string;
}> = ({ 
  t, onClose, activeCategory, 
  onGenerate, isGenerating, result, error, onStartOver, 
  isAnalyzing, onAnalyze, analysisResult, analysisError,
  isSummarizing, onGenerateSummary, analysisSummary, summaryError 
}) => {
  const [jobDesc, setJobDesc] = useState('');
  const [copiedValue, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState<'coverLetter' | 'skillGap'>('coverLetter');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatAnalysisForTxt = (result: SkillGapAnalysisResult) => {
    let content = `${t.aiHelperModal.title}\n\n`;
    content += `--- ${t.aiHelperModal.skillGap.gapsTitle} ---\n`;
    if (result.skillGaps.length > 0) {
      result.skillGaps.forEach(gap => {
        content += `- ${gap.skill}: ${gap.reason}\n`;
      });
    } else {
      content += `${t.aiHelperModal.skillGap.noGapsFound}\n`;
    }
    content += `\n--- ${t.aiHelperModal.skillGap.suggestionsTitle} ---\n`;
    result.suggestions.forEach(suggestion => {
      content += `- ${suggestion}\n`;
    });
    return content;
  };

  const handleCopy = () => {
    const contentToCopy = activeAiTab === 'coverLetter' 
      ? result 
      : (analysisResult ? formatAnalysisForTxt(analysisResult) : '');
    copy(contentToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const downloadAsFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element);
  };

  const downloadResultAsPdf = (content: string) => {
    const element = document.createElement('div');
    element.style.padding = '2rem';
    element.style.fontFamily = 'Inter, sans-serif';
    element.style.whiteSpace = 'pre-wrap';
    element.style.wordBreak = 'break-word';
    element.style.lineHeight = '1.6';
    element.style.color = '#333';
    element.innerText = content;

    html2pdf().from(element).set({
      margin: [1, 1, 1, 1],
      filename: `Cover_Letter_Ronny_Christensen.pdf`,
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).save();
  };
  
  const hasResult = activeAiTab === 'coverLetter' ? !!result : !!analysisResult;
  const hasError = activeAiTab === 'coverLetter' ? !!error : !!analysisError;
  const isLoading = isGenerating || isAnalyzing;

  const AITab: React.FC<{
    title: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
  }> = ({ title, icon: Icon, isActive, onClick }) => (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 focus:outline-none transition-colors",
          isActive
            ? "text-orange-600 border-orange-600"
            : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
        )}
        role="tab"
        aria-selected={isActive}
      >
        <Icon size={16} />
        <span>{title}</span>
      </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in no-print"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 m-4 max-w-3xl w-full animate-fade-in-up flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
          <XIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-full">
                <Sparkles className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
                {t.aiHelperModal.title}
            </h2>
        </div>

        <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px" role="tablist">
                <AITab title={t.aiHelperModal.tabs.coverLetter} icon={FileText} isActive={activeAiTab === 'coverLetter'} onClick={() => setActiveAiTab('coverLetter')} />
                <AITab title={t.aiHelperModal.tabs.skillGap} icon={ListChecks} isActive={activeAiTab === 'skillGap'} onClick={() => setActiveAiTab('skillGap')} />
            </nav>
        </div>

        {hasResult ? (
          <>
            {activeAiTab === 'coverLetter' && (
              <div className="bg-gray-50 border rounded-lg p-4 my-4 overflow-y-auto flex-grow">
                <pre className="text-gray-700 whitespace-pre-wrap font-sans text-base">{result}</pre>
              </div>
            )}
            {activeAiTab === 'skillGap' && analysisResult && (
                 <div className="bg-gray-50 border rounded-lg p-4 my-4 overflow-y-auto flex-grow">
                    {analysisSummary && (
                        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                           <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                               <Lightbulb className="text-orange-500 flex-shrink-0" size={18} /> {t.aiHelperModal.skillGap.summaryTitle}
                           </h4>
                           <p className="text-gray-700">{analysisSummary}</p>
                        </div>
                    )}
                    {summaryError && <p className="text-red-500 mb-4">{summaryError}</p>}

                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <AlertTriangle className="text-red-500 flex-shrink-0" size={20} /> {t.aiHelperModal.skillGap.gapsTitle}
                    </h3>
                    <ul className="list-disc list-inside space-y-3 mb-6 pl-2">
                        {analysisResult.skillGaps.map((gap, index) => (
                            <li key={`gap-${index}`}>
                                <strong className="text-gray-700">{gap.skill}:</strong>
                                <span className="text-gray-600 ml-1">{gap.reason}</span>
                            </li>
                        ))}
                         {analysisResult.skillGaps.length === 0 && <p className="text-gray-500 italic">{t.aiHelperModal.skillGap.noGapsFound}</p>}
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Lightbulb className="text-green-500 flex-shrink-0" size={20} /> {t.aiHelperModal.skillGap.suggestionsTitle}
                    </h3>
                    <ul className="list-disc list-inside space-y-3 pl-2">
                        {analysisResult.suggestions.map((suggestion, index) => (
                            <li key={`sug-${index}`} className="text-gray-700">{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
              <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-colors">
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                {isCopied ? t.aiHelperModal.copiedButton : t.aiHelperModal.copyButton}
              </button>
              
              {activeAiTab === 'coverLetter' && (
                  <>
                    <button onClick={() => downloadAsFile('cover_letter.txt', result, 'text/plain')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.downloadTxtButton}
                    </button>
                    <button onClick={() => downloadResultAsPdf(result)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.downloadPdfButton}
                    </button>
                  </>
              )}

              {activeAiTab === 'skillGap' && analysisResult && (
                 <>
                    <button onClick={() => downloadAsFile('skill_gap_analysis.txt', formatAnalysisForTxt(analysisResult), 'text/plain')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.downloadTxtButton}
                    </button>
                    <button onClick={() => downloadAsFile('skill_gap_analysis.json', JSON.stringify(analysisResult, null, 2), 'application/json')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors">
                      <FileDown size={16} /> {t.aiHelperModal.skillGap.downloadJsonButton}
                    </button>
                 </>
              )}

               {activeAiTab === 'skillGap' && analysisResult && !analysisSummary && (
                <button onClick={onGenerateSummary} disabled={isSummarizing} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSummarizing ? (
                        <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>{t.aiHelperModal.skillGap.generatingSummaryButton}</span>
                        </>
                    ) : (
                        <>
                            <Lightbulb size={16}/> <span>{t.aiHelperModal.skillGap.generateSummaryButton}</span>
                        </>
                    )}
                </button>
              )}

              <button onClick={onStartOver} className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors">{t.aiHelperModal.startOverButton}</button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">
              {activeAiTab === 'coverLetter' 
                ? t.aiHelperModal.coverLetter.description.replace('{category}', activeCategory.toLowerCase()) 
                : t.aiHelperModal.skillGap.description.replace('{category}', activeCategory.toLowerCase())}
            </p>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={isLoading}
              className="w-full flex-grow p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
              placeholder={t.aiHelperModal.jobDescriptionPlaceholder}
            />
            {hasError && <p className="text-red-500 mt-2">{activeAiTab === 'coverLetter' ? error : analysisError}</p>}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => activeAiTab === 'coverLetter' ? onGenerate(jobDesc) : onAnalyze(jobDesc)}
                disabled={isLoading || !jobDesc.trim()}
                className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{activeAiTab === 'coverLetter' ? t.aiHelperModal.coverLetter.generatingButton : t.aiHelperModal.skillGap.analyzingButton}</span>
                  </>
                ) : <span>{activeAiTab === 'coverLetter' ? t.aiHelperModal.coverLetter.generateButton : t.aiHelperModal.skillGap.analyzeButton}</span>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [language, setLanguage] = useState<keyof typeof translations>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('full');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDevModeModalOpen, setIsDevModeModalOpen] = useState(false);
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  
  // State for Cover Letter Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState('');
  const [generationError, setGenerationError] = useState('');

  // State for Skill Gap Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkillGapAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    summary: false,
    skills: false,
    experience: false,
    education: false,
    references: false
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [developmentStatus, setDevelopmentStatus] = useState<{ [key: string]: boolean }>({
    full: true,
    fitness: false,
    tech: true,
    management: false,
    'content-creation': true,
    references: false,
  });
  const resumeContainerRef = useRef<HTMLDivElement>(null);
  const t = useMemo(() => translations[language], [language]);

  const pageTitle = useMemo(() => t.pageTitles[activeTab], [t, activeTab]);

  const activeCategoryForText = useMemo((): 'full' | 'fitness' | 'tech' | 'management' | 'content-creation' => {
    if (activeTab === 'fitness' || activeTab === 'tech' || activeTab === 'management' || activeTab === 'content-creation') return activeTab;
    return 'full';
  }, [activeTab]);
    
  const headlineText = useMemo(() => t.headline[activeCategoryForText], [t, activeCategoryForText]);
    
  const navItems = useMemo((): NavItem[] => [
    { name: 'full', title: t.tabs.full, url: '#', icon: FileText, colorClasses: { text: 'text-gray-700', bg: 'bg-gray-500/10', lamp: 'bg-gray-500', glow: 'bg-gray-500/20', ring: 'focus-visible:ring-gray-500' } },
    { name: 'fitness', title: t.tabs.fitness, url: '#', icon: Dumbbell, colorClasses: { text: 'text-orange-700', bg: 'bg-orange-500/10', lamp: 'bg-orange-500', glow: 'bg-orange-500/20', ring: 'focus-visible:ring-orange-500' } },
    { name: 'tech', title: t.tabs.tech, url: '#', icon: Cpu, colorClasses: { text: 'text-blue-700', bg: 'bg-blue-500/10', lamp: 'bg-blue-500', glow: 'bg-blue-500/20', ring: 'focus-visible:ring-blue-500' } },
    { name: 'management', title: t.tabs.management, url: '#', icon: Briefcase, colorClasses: { text: 'text-purple-700', bg: 'bg-purple-500/10', lamp: 'bg-purple-500', glow: 'bg-purple-500/20', ring: 'focus-visible:ring-purple-500' } },
    { name: 'content-creation', title: t.tabs.contentCreation, url: '#', icon: Camera, colorClasses: { text: 'text-yellow-700', bg: 'bg-yellow-500/10', lamp: 'bg-yellow-500', glow: 'bg-yellow-500/20', ring: 'focus-visible:ring-yellow-500' } },
    { name: 'references', title: t.tabs.references, url: '#', icon: Users, colorClasses: { text: 'text-indigo-700', bg: 'bg-indigo-500/10', lamp: 'bg-indigo-500', glow: 'bg-indigo-500/20', ring: 'focus-visible:ring-indigo-500' } },
  ], [t]);

  const headlineColorClass = useMemo(() => {
    const activeItem = navItems.find(item => item.name === activeTab);
    const baseColorClass = activeItem ? activeItem.colorClasses.text : 'text-gray-700';
    // Use a slightly brighter shade for the headline
    return baseColorClass.replace('700', '600');
  }, [activeTab, navItems]);

  const backgroundStyle = useMemo(() => {
    const activeItem = navItems.find(item => item.name === activeTab);
    
    const colorMap: { [key: string]: string } = {
        'bg-gray-500/20': 'rgb(107, 114, 128)',
        'bg-orange-500/20': 'rgb(249, 115, 22)',
        'bg-blue-500/20': 'rgb(59, 130, 246)',
        'bg-purple-500/20': 'rgb(139, 92, 246)',
        'bg-yellow-500/20': 'rgb(234, 179, 8)',
        'bg-indigo-500/20': 'rgb(99, 102, 241)',
    };
    
    const glowClass = activeItem ? activeItem.colorClasses.glow : 'bg-gray-500/20';

    return { backgroundColor: colorMap[glowClass] || 'rgb(107, 114, 128)' };
  }, [activeTab, navItems]);

  const educationCardColorClasses = useMemo(() => {
    const activeItem = navItems.find(item => item.name === activeTab);
    if (!activeItem) {
        return { border: 'border-gray-300', bg: 'bg-gray-50/50', degreeText: 'text-gray-800' };
    }
    
    const colorMap: { [key:string]: { border: string; bg: string; degreeText: string } } = {
        'bg-gray-500': { border: 'border-gray-400', bg: 'bg-gray-100/80', degreeText: 'text-gray-800' },
        'bg-orange-500': { border: 'border-orange-500', bg: 'bg-orange-50/80', degreeText: 'text-orange-800' },
        'bg-blue-500': { border: 'border-blue-500', bg: 'bg-blue-50/80', degreeText: 'text-blue-800' },
        'bg-purple-500': { border: 'border-purple-500', bg: 'bg-purple-50/80', degreeText: 'text-purple-800' },
        'bg-yellow-500': { border: 'border-yellow-500', bg: 'bg-yellow-50/80', degreeText: 'text-yellow-800' },
        'bg-indigo-500': { border: 'border-indigo-500', bg: 'bg-indigo-50/80', degreeText: 'text-indigo-800' },
    };
    
    return colorMap[activeItem.colorClasses.lamp] || { border: 'border-gray-300', bg: 'bg-gray-50/50', degreeText: 'text-gray-800' };
  }, [activeTab, navItems]);

  const experiencesInLang = useMemo(() => {
    return workData.map(job => ({
      ...job,
      ...t.experience[job.id as keyof typeof t.experience]
    } as WorkExperience));
  }, [t]);

  const filteredExperiences = useMemo(() => {
    if (activeTab === 'full') return experiencesInLang;

    const fitnessCategories: WorkCategory[] = ['Fitness Coaching', 'Fitness Management', 'Hospitality & Service'];
    const techCategories: WorkCategory[] = ['Software Development'];
    const managementCategories: WorkCategory[] = ['Project Management', 'Fitness Management'];
    const contentCreationCategories: WorkCategory[] = ['Content Creation'];

    if (activeTab === 'fitness') {
      return experiencesInLang.filter(exp => exp.category.some(cat => fitnessCategories.includes(cat)));
    }
    if (activeTab === 'tech') {
      return experiencesInLang.filter(exp => exp.category.some(cat => techCategories.includes(cat)));
    }
    if (activeTab === 'management') {
      return experiencesInLang.filter(exp => exp.category.some(cat => managementCategories.includes(cat)));
    }
    if (activeTab === 'content-creation') {
      return experiencesInLang.filter(exp => exp.category.some(cat => contentCreationCategories.includes(cat)));
    }
    return [];
  }, [activeTab, experiencesInLang]);

  const displayedSkills = useMemo(() => {
    if (activeTab === 'full') return ALL_SKILLS;
    return ALL_SKILLS.filter(skill => skill.category === activeTab);
  }, [activeTab]);

  const resumeContextForAI = useMemo(() => {
    const summary = t.summary[activeCategoryForText];
    const skills = displayedSkills.map(s => s.name);
    const experiences = filteredExperiences.map(exp => ({
        role: exp.role,
        company: exp.company,
        duration: exp.duration,
        achievements: [...exp.achievements.fitness, ...exp.achievements.professional],
    }));
    return { summary, skills, experiences };
  }, [t, activeCategoryForText, displayedSkills, filteredExperiences]);
  
  const stringifiedExperienceForAI = useMemo(() => {
    return resumeContextForAI.experiences.map(e => 
        `Role: ${e.role} at ${e.company} (${e.duration})\nAchievements:\n- ${e.achievements.join('\n- ')}`
    ).join('\n\n');
  }, [resumeContextForAI.experiences]);

  const handleGenerateApplication = async (jobDescription: string) => {
    if (!jobDescription.trim() || !process.env.API_KEY) return;
    setIsGenerating(true);
    setGenerationResult('');
    setGenerationError('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `You are a professional career coach and expert cover letter writer. Your task is to write a compelling, professional, and tailored cover letter for a job application. The response language must be ${language === 'en' ? 'English' : language === 'da' ? 'Danish' : 'Swedish'}.`;
        const userPrompt = `
        My Resume Information:
        - Name: ${t.name}
        - Summary for this role type: ${resumeContextForAI.summary}
        - Relevant Skills: ${resumeContextForAI.skills.join(', ')}
        - Relevant Work Experience:
        ${stringifiedExperienceForAI}

        Job Description to Apply For:
        ---
        ${jobDescription}
        ---

        Instructions for the Cover Letter:
        1. Write it from my perspective (${t.name}).
        2. Address the key requirements from the job description.
        3. Directly reference my skills and experiences from the resume info to show I am a strong match.
        4. Use a professional and confident tone.
        5. Structure it with an introduction, body paragraphs highlighting my fit, and a conclusion with a call to action.
        6. Do not invent any skills or experiences not provided in my resume information.
        7. The output must be ONLY the text of the cover letter, ready to be copied. Do not include extra commentary, titles like "Subject: Cover Letter", or markdown formatting.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction }
        });

        setGenerationResult(response.text);

    } catch (error) {
        console.error("Error generating application:", error);
        setGenerationError(t.aiHelperModal.coverLetter.error);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSkillGapAnalysis = async (jobDescription: string) => {
    if (!jobDescription.trim() || !process.env.API_KEY) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `You are an expert career advisor and resume analyst. Your task is to analyze a job description against a candidate's resume information. Identify skill gaps and areas where the candidate could improve to be a better fit for the role. Your response must be in ${language === 'en' ? 'English' : language === 'da' ? 'Danish' : 'Swedish'} and formatted as JSON.`;
        const userPrompt = `
        My Resume Information:
        - Name: ${t.name}
        - Summary for this role type: ${resumeContextForAI.summary}
        - Relevant Skills: ${resumeContextForAI.skills.join(', ')}
        - Relevant Work Experience:
        ${stringifiedExperienceForAI}

        Job Description to Analyze:
        ---
        ${jobDescription}
        ---

        Instructions:
        1. Carefully compare the "Job Description" with "My Resume Information".
        2. Identify key skills, technologies, or experiences required by the job that are missing or not strongly highlighted in my resume.
        3. Generate a list of actionable suggestions for me to become a stronger candidate. These could include learning new skills, getting certifications, or reframing my existing experience.
        4. The output must be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skillGaps: {
                            type: Type.ARRAY,
                            description: "List of skills or experiences from the job description that are weakly represented in the resume.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    skill: { type: Type.STRING, description: "The specific skill or requirement from the job description." },
                                    reason: { type: Type.STRING, description: "A brief explanation of why this is considered a gap based on the provided resume information." }
                                }
                            }
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            description: "A list of actionable suggestions for improvement.",
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const parsedResult = JSON.parse(response.text);
        setAnalysisResult(parsedResult);

    } catch (error) {
        console.error("Error analyzing skills:", error);
        setAnalysisError(t.aiHelperModal.skillGap.error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!analysisResult || !process.env.API_KEY) return;
    setIsSummarizing(true);
    setAnalysisSummary('');
    setSummaryError('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `You are a helpful career coach. Your task is to provide a brief, encouraging summary of a skill gap analysis for a job candidate. The response language must be ${language === 'en' ? 'English' : language === 'da' ? 'Danish' : 'Swedish'}.`;
        const userPrompt = `
        Based on the following skill gap analysis JSON, write a short, encouraging summary (2-3 sentences) for the job candidate. Briefly mention the key areas to focus on without being negative.

        Analysis JSON:
        ---
        ${JSON.stringify(analysisResult, null, 2)}
        ---

        Instructions:
        1. Keep the tone positive and motivational.
        2. Summarize the main takeaways from the analysis.
        3. The output must be ONLY the summary text. Do not include any extra commentary, titles, or markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction }
        });

        setAnalysisSummary(response.text);

    } catch (error) {
        console.error("Error generating summary:", error);
        setSummaryError(t.aiHelperModal.skillGap.summaryError);
    } finally {
        setIsSummarizing(false);
    }
  };


  const handleToggleCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };
  
  const handleDevModeChange = () => {
    setIsDevModeModalOpen(true);
  };
  
  const handleDevModeConfirm = (code: string): boolean => {
      if (code === '2010') {
          setDevelopmentStatus(prev => ({
              ...prev,
              [activeTab]: !prev[activeTab],
          }));
          setIsDevModeModalOpen(false);
          return true;
      }
      return false;
  };

  const visibleSectionIds = useMemo(() => activeTab === 'references' ? ['references'] : ['summary', 'skills', 'experience', 'education'], [activeTab]);
  const areAllCurrentlyCollapsed = useMemo(() => visibleSectionIds.every(id => !!collapsedSections[id]), [visibleSectionIds, collapsedSections]);
  const handleToggleAll = () => {
    const shouldCollapse = !areAllCurrentlyCollapsed;
    const newStates = { ...collapsedSections };
    visibleSectionIds.forEach(id => newStates[id] = shouldCollapse);
    setCollapsedSections(newStates);
  };
  const handleTabChange = (tabName: string) => setActiveTab(tabName as AppTab);

  const handleDownloadPdf = () => {
    const element = resumeContainerRef.current;
    if (!element || isDownloading) return;
    setIsDownloading(true);
    const originalCollapsedState = { ...collapsedSections };
    const allExpandedState: { [key:string]: boolean } = {};
    Object.keys(originalCollapsedState).forEach(key => allExpandedState[key] = false);
    setCollapsedSections(allExpandedState);

    setTimeout(() => {
      const filename = `Ronny_Christensen_Resume_${language.toUpperCase()}.pdf`;
      html2pdf().from(element).set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#f8fafc' },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).save().finally(() => {
        setCollapsedSections(originalCollapsedState);
        setIsDownloading(false);
        setIsDownloadModalOpen(false);
      });
    }, 50);
  };
  
  const handleAiStartOver = () => {
    setGenerationResult('');
    setGenerationError('');
    setAnalysisResult(null);
    setAnalysisError('');
    setAnalysisSummary('');
    setSummaryError('');
  };

  return (
    <div className="relative z-0">
      <motion.div
        className="fixed top-[-25rem] left-[-35rem] sm:left-[-25rem] w-[60rem] h-[60rem] rounded-full opacity-20 blur-3xl -z-10 no-print"
        animate={backgroundStyle}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      <NavBar items={navItems} activeTab={activeTab} onTabChange={handleTabChange}>
        <LanguageSwitcher currentLang={language} onSelectLang={setLanguage} />
        <ControlButton onClick={() => setIsAiHelperOpen(true)} title={t.tooltips.aiHelper}>
            <Sparkles />
        </ControlButton>
        <ControlButton onClick={() => setIsContactModalOpen(true)} title={t.tooltips.viewContact}>
          <MailIcon />
        </ControlButton>
        <ControlButton onClick={() => setIsDownloadModalOpen(true)} title={t.tooltips.download} disabled={isDownloading}>
          <DownloadIcon />
        </ControlButton>
        <ControlButton onClick={handleToggleAll} title={areAllCurrentlyCollapsed ? t.tooltips.unfoldAll : t.tooltips.collapseAll}>
          {areAllCurrentlyCollapsed ? <ChevronDoubleDownIcon /> : <ChevronDoubleUpIcon />}
        </ControlButton>
        {activeTab !== 'references' && (
            <div className="flex items-center gap-2 p-1.5" title={t.tooltips.toggleDevelopmentMode}>
                <ToggleSwitch 
                    id="dev-mode-toggle"
                    checked={!!developmentStatus[activeTab]} 
                    onChange={handleDevModeChange}
                    size="sm"
                />
            </div>
        )}
      </NavBar>

      <main ref={resumeContainerRef} className="p-4 pb-24 sm:pt-40 print:p-0 min-h-screen">
        <header className="text-center mb-10 animate-fade-in print-section">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight">
                {t.name}
            </h1>
            <h2 key={activeTab} className={cn("text-2xl sm:text-3xl font-bold mt-2 animate-fade-in", headlineColorClass)}>
                {pageTitle}
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                {headlineText}
            </p>
        </header>
        
        {developmentStatus[activeTab] && (
          <div className="max-w-7xl mx-auto px-4 sm:px-0 mb-6 no-print animate-fade-in print:hidden">
              <div className="bg-yellow-100/80 backdrop-blur-sm border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow-sm" role="alert">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{t.developmentNotice}</p>
                  </div>
                </div>
              </div>
          </div>
        )}

        <CollapsibleSection sectionId="summary" title={t.sections.summary} isCollapsed={collapsedSections.summary} onToggle={handleToggleCollapse}>
          <p className="text-gray-700">{t.summary[activeCategoryForText]}</p>
        </CollapsibleSection>
        
        {activeTab !== 'references' && (
         <>
          <CollapsibleSection sectionId="skills" title={t.sections.skills} isCollapsed={collapsedSections.skills} onToggle={handleToggleCollapse}>
            <SkillsSection skills={displayedSkills} />
          </CollapsibleSection>

          <CollapsibleSection sectionId="experience" title={t.sections.experience} isCollapsed={collapsedSections.experience} onToggle={handleToggleCollapse}>
            <div className="space-y-6">
              {filteredExperiences.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} t={t} />
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection sectionId="education" title={t.sections.education} isCollapsed={collapsedSections.education} onToggle={handleToggleCollapse}>
            <div className="space-y-4">
              {(t.education.list as Education[]).map((edu, index) => (
                <div key={`${edu.institution}-${index}`} className={cn(
                  "p-4 rounded-lg border-l-4 transition-colors duration-300",
                  educationCardColorClasses.bg,
                  educationCardColorClasses.border
                )}>
                  <p className={cn("font-bold text-lg", educationCardColorClasses.degreeText)}>{edu.degree}</p>
                  <p className="text-gray-700 font-semibold">{edu.institution}</p>
                  <p className="text-sm text-gray-500 mt-1">{edu.duration} &bull; {edu.location}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
         </>
        )}

        {activeTab === 'references' && (
          <CollapsibleSection sectionId="references" title={t.sections.references} isCollapsed={collapsedSections.references} onToggle={handleToggleCollapse}>
             <p className="text-gray-700 font-semibold mb-4">{t.references.title}</p>
              <div className="space-y-4">
                {t.references.list.map((ref: Reference, index: number) => (
                  <div key={`${ref.name}-${index}`} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-bold text-gray-800">{ref.name}</p>
                    <p className="text-orange-700">{ref.role}</p>
                    <p className="text-gray-500">{ref.contact}</p>
                  </div>
                ))}
              </div>
          </CollapsibleSection>
        )}

      </main>

      {isContactModalOpen && <ContactModal t={t} onClose={() => setIsContactModalOpen(false)} />}
      {isDownloadModalOpen && <DownloadConfirmationModal 
        t={t} 
        onClose={() => !isDownloading && setIsDownloadModalOpen(false)} 
        onConfirm={handleDownloadPdf}
        language={language}
        isDownloading={isDownloading}
      />}
      {isDevModeModalOpen && <DevModeModal
        t={t}
        onClose={() => setIsDevModeModalOpen(false)}
        onConfirm={handleDevModeConfirm}
        isActivating={!developmentStatus[activeTab]}
      />}
      {isAiHelperOpen && <AIHelperModal
        t={t}
        onClose={() => setIsAiHelperOpen(false)}
        activeCategory={t.tabs[activeCategoryForText as keyof typeof t.tabs] || t.tabs.full}
        isGenerating={isGenerating}
        onGenerate={handleGenerateApplication}
        result={generationResult}
        error={generationError}
        onStartOver={handleAiStartOver}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleSkillGapAnalysis}
        analysisResult={analysisResult}
        analysisError={analysisError}
        isSummarizing={isSummarizing}
        onGenerateSummary={handleGenerateSummary}
        analysisSummary={analysisSummary}
        summaryError={summaryError}
      />}
    </div>
  );
};

export default App;