import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { FileText, Dumbbell, Briefcase, Users, Cpu, Camera, AlertTriangle, Sparkles } from 'lucide-react';
import { MailIcon, DownloadIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon } from './components/icons';
import { NavBar } from './components/ui/tubelight-navbar';
import { ToggleSwitch } from './components/ui/toggle-switch';
import { cn, callAIAssistant } from './lib/utils';
import { translations } from './i18n';
import { ALL_SKILLS, workData } from './data/content';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ControlButton } from './components/ControlButton';
import { CollapsibleSection } from './components/CollapsibleSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceCard } from './components/ExperienceCard';
import { ContactModal } from './components/ContactModal';
import { DownloadConfirmationModal } from './components/DownloadConfirmationModal';
import { DevModeModal } from './components/DevModeModal';
import { AIHelperModal } from './components/AIHelperModal';
const App = () => {
    const [language, setLanguage] = useState('en');
    const [activeTab, setActiveTab] = useState('full');
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
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisError, setAnalysisError] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [analysisSummary, setAnalysisSummary] = useState('');
    const [summaryError, setSummaryError] = useState('');
    const [collapsedSections, setCollapsedSections] = useState({
        summary: false,
        skills: false,
        experience: false,
        education: false,
        references: false
    });
    const [isDownloading, setIsDownloading] = useState(false);
    const [developmentStatus, setDevelopmentStatus] = useState({
        full: true,
        fitness: false,
        tech: true,
        management: false,
        'content-creation': true,
        references: false,
    });
    const resumeContainerRef = useRef(null);
    const t = useMemo(() => translations[language], [language]);
    const pageTitle = useMemo(() => t.pageTitles[activeTab], [t, activeTab]);
    const activeCategoryForText = useMemo(() => {
        if (activeTab === 'fitness' || activeTab === 'tech' || activeTab === 'management' || activeTab === 'content-creation')
            return activeTab;
        return 'full';
    }, [activeTab]);
    const headlineText = useMemo(() => t.headline[activeCategoryForText], [t, activeCategoryForText]);
    const navItems = useMemo(() => [
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
        const colorMap = {
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
        const colorMap = {
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
            ...t.experience[job.id]
        }));
    }, [t]);
    const filteredExperiences = useMemo(() => {
        if (activeTab === 'full' || activeTab === 'references')
            return experiencesInLang;
        const categoryMap = {
            fitness: ['Fitness Coaching', 'Fitness Management', 'Hospitality & Service'],
            tech: ['Software Development'],
            management: ['Project Management', 'Fitness Management'],
            'content-creation': ['Content Creation']
        };
        const categories = categoryMap[activeTab];
        return categories ? experiencesInLang.filter(exp => exp.category.some(cat => categories.includes(cat))) : [];
    }, [activeTab, experiencesInLang]);
    const displayedSkills = useMemo(() => {
        if (activeTab === 'full')
            return ALL_SKILLS;
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
        return resumeContextForAI.experiences.map(e => `Role: ${e.role} at ${e.company} (${e.duration})\nAchievements:\n- ${e.achievements.join('\n- ')}`).join('\n\n');
    }, [resumeContextForAI.experiences]);
    const handleGenerateApplication = async (jobDescription) => {
        if (!jobDescription.trim())
            return;
        setIsGenerating(true);
        setGenerationResult('');
        setGenerationError('');
        try {
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
            const response = await callAIAssistant({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction }
            });
            setGenerationResult(response.text);
        }
        catch (error) {
            console.error("Error generating application:", error);
            setGenerationError(error instanceof Error ? error.message : t.aiHelperModal.coverLetter.error);
        }
        finally {
            setIsGenerating(false);
        }
    };
    const handleSkillGapAnalysis = async (jobDescription) => {
        if (!jobDescription.trim())
            return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalysisError('');
        try {
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
        4. Calculate an overall 'matchPercentage' from 0 to 100, where 100 is a perfect match. Base this on how well my skills and experience align with the job requirements.
        5. The output must be a valid JSON object. Do not include any text or markdown formatting before or after the JSON object.
        `;
            const responseSchema = {
                type: "OBJECT",
                properties: {
                    skillGaps: {
                        type: "ARRAY",
                        description: "List of skills or experiences from the job description that are weakly represented in the resume.",
                        items: {
                            type: "OBJECT",
                            properties: {
                                skill: { type: "STRING", description: "The specific skill or requirement from the job description." },
                                reason: { type: "STRING", description: "A brief explanation of why this is considered a gap based on the provided resume information." }
                            }
                        }
                    },
                    suggestions: {
                        type: "ARRAY",
                        description: "A list of actionable suggestions for improvement.",
                        items: { type: "STRING" }
                    },
                    matchPercentage: {
                        type: "NUMBER",
                        description: "An estimated percentage (0-100) of how well the resume matches the job description."
                    }
                }
            };
            const response = await callAIAssistant({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                }
            });
            const parsedResult = JSON.parse(response.text);
            setAnalysisResult(parsedResult);
        }
        catch (error) {
            console.error("Error analyzing skills:", error);
            setAnalysisError(error instanceof Error ? error.message : t.aiHelperModal.skillGap.error);
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const handleGenerateSummary = async () => {
        if (!analysisResult)
            return;
        setIsSummarizing(true);
        setAnalysisSummary('');
        setSummaryError('');
        try {
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
            const response = await callAIAssistant({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: { systemInstruction }
            });
            setAnalysisSummary(response.text);
        }
        catch (error) {
            console.error("Error generating summary:", error);
            setSummaryError(error instanceof Error ? error.message : t.aiHelperModal.skillGap.summaryError);
        }
        finally {
            setIsSummarizing(false);
        }
    };
    const handleToggleCollapse = (sectionId) => {
        setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };
    const handleDevModeChange = () => {
        setIsDevModeModalOpen(true);
    };
    const handleDevModeConfirm = (code) => {
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
    const handleTabChange = (tabName) => setActiveTab(tabName);
    const handleDownloadPdf = () => {
        const element = resumeContainerRef.current;
        if (!element || isDownloading)
            return;
        setIsDownloading(true);
        const originalCollapsedState = { ...collapsedSections };
        const allExpandedState = {};
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
    return (_jsxs("div", { className: "relative z-0", children: [_jsx(motion.div, { className: "fixed top-[-25rem] left-[-35rem] sm:left-[-25rem] w-[60rem] h-[60rem] rounded-full opacity-20 blur-3xl -z-10 no-print", animate: backgroundStyle, transition: { duration: 0.8, ease: 'easeInOut' } }), _jsxs(NavBar, { items: navItems, activeTab: activeTab, onTabChange: handleTabChange, children: [_jsx(LanguageSwitcher, { currentLang: language, onSelectLang: setLanguage }), _jsx(ControlButton, { onClick: () => setIsAiHelperOpen(true), title: t.tooltips.aiHelper, children: _jsx(Sparkles, {}) }), _jsx(ControlButton, { onClick: () => setIsContactModalOpen(true), title: t.tooltips.viewContact, children: _jsx(MailIcon, {}) }), _jsx(ControlButton, { onClick: () => setIsDownloadModalOpen(true), title: t.tooltips.download, disabled: isDownloading, children: _jsx(DownloadIcon, {}) }), _jsx(ControlButton, { onClick: handleToggleAll, title: areAllCurrentlyCollapsed ? t.tooltips.unfoldAll : t.tooltips.collapseAll, children: areAllCurrentlyCollapsed ? _jsx(ChevronDoubleDownIcon, {}) : _jsx(ChevronDoubleUpIcon, {}) }), activeTab !== 'references' && (_jsx("div", { className: "flex items-center gap-2 p-1.5", title: t.tooltips.toggleDevelopmentMode, children: _jsx(ToggleSwitch, { id: "dev-mode-toggle", checked: !!developmentStatus[activeTab], onChange: handleDevModeChange, size: "sm" }) }))] }), _jsxs("main", { ref: resumeContainerRef, className: "p-4 pb-24 sm:pt-40 print:p-0 min-h-screen", children: [_jsxs("header", { className: "text-center mb-10 animate-fade-in print-section", children: [_jsx("h1", { className: "text-4xl sm:text-5xl font-extrabold text-gray-800 tracking-tight", children: t.name }), _jsx("h2", { className: cn("text-2xl sm:text-3xl font-bold mt-2 animate-fade-in", headlineColorClass), children: pageTitle }, activeTab), _jsx("p", { className: "mt-4 max-w-3xl mx-auto text-lg text-gray-600", children: headlineText })] }), developmentStatus[activeTab] && (_jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-0 mb-6 no-print animate-fade-in print:hidden", children: _jsx("div", { className: "bg-yellow-100/80 backdrop-blur-sm border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg shadow-sm", role: "alert", children: _jsxs("div", { className: "flex items-center", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-3 flex-shrink-0" }), _jsx("div", { children: _jsx("p", { className: "font-semibold", children: t.developmentNotice }) })] }) }) })), _jsx(CollapsibleSection, { sectionId: "summary", title: t.sections.summary, isCollapsed: collapsedSections.summary, onToggle: handleToggleCollapse, children: _jsx("p", { className: "text-gray-700", children: t.summary[activeCategoryForText] }) }), activeTab !== 'references' && (_jsxs(_Fragment, { children: [_jsx(CollapsibleSection, { sectionId: "skills", title: t.sections.skills, isCollapsed: collapsedSections.skills, onToggle: handleToggleCollapse, children: _jsx(SkillsSection, { skills: displayedSkills }) }), _jsx(CollapsibleSection, { sectionId: "experience", title: t.sections.experience, isCollapsed: collapsedSections.experience, onToggle: handleToggleCollapse, children: _jsx("div", { className: "space-y-6", children: filteredExperiences.map(exp => (_jsx(ExperienceCard, { experience: exp, t: t }, exp.id))) }) }), _jsx(CollapsibleSection, { sectionId: "education", title: t.sections.education, isCollapsed: collapsedSections.education, onToggle: handleToggleCollapse, children: _jsx("div", { className: "space-y-4", children: t.education.list.map((edu, index) => (_jsxs("div", { className: cn("p-4 rounded-lg border-l-4 transition-colors duration-300", educationCardColorClasses.bg, educationCardColorClasses.border), children: [_jsx("p", { className: cn("font-bold text-lg", educationCardColorClasses.degreeText), children: edu.degree }), _jsx("p", { className: "text-gray-700 font-semibold", children: edu.institution }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [edu.duration, " \u2022 ", edu.location] })] }, `${edu.institution}-${index}`))) }) })] })), activeTab === 'references' && (_jsxs(CollapsibleSection, { sectionId: "references", title: t.sections.references, isCollapsed: collapsedSections.references, onToggle: handleToggleCollapse, children: [_jsx("p", { className: "text-gray-700 font-semibold mb-4", children: t.references.title }), _jsx("div", { className: "space-y-4", children: t.references.list.map((ref, index) => (_jsxs("div", { className: "p-4 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "font-bold text-gray-800", children: ref.name }), _jsx("p", { className: "text-orange-700", children: ref.role }), _jsx("p", { className: "text-gray-500", children: ref.contact })] }, `${ref.name}-${index}`))) })] }))] }), isContactModalOpen && _jsx(ContactModal, { t: t, onClose: () => setIsContactModalOpen(false) }), isDownloadModalOpen && _jsx(DownloadConfirmationModal, { t: t, onClose: () => !isDownloading && setIsDownloadModalOpen(false), onConfirm: handleDownloadPdf, language: language, isDownloading: isDownloading }), isDevModeModalOpen && _jsx(DevModeModal, { t: t, onClose: () => setIsDevModeModalOpen(false), onConfirm: handleDevModeConfirm, isActivating: !developmentStatus[activeTab] }), isAiHelperOpen && _jsx(AIHelperModal, { t: t, onClose: () => setIsAiHelperOpen(false), activeCategory: t.tabs[activeCategoryForText] || t.tabs.full, isGenerating: isGenerating, onGenerate: handleGenerateApplication, result: generationResult, error: generationError, onStartOver: handleAiStartOver, isAnalyzing: isAnalyzing, onAnalyze: handleSkillGapAnalysis, analysisResult: analysisResult, analysisError: analysisError, isSummarizing: isSummarizing, onGenerateSummary: handleGenerateSummary, analysisSummary: analysisSummary, summaryError: summaryError })] }));
};
export default App;
