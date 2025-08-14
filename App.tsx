

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { WorkExperience, AppTab, Skill, Reference } from './types';
import { MailIcon, PhoneIcon, LinkedInIcon, ChevronDownIcon, DownloadIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon, XIcon } from './components/icons';
import { FileText, Dumbbell, Briefcase, Users, Cpu } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { en } from './i18n/en';
import { da } from './i18n/da';
import { sv } from './i18n/sv';
import { NavBar, NavItem } from './components/ui/tubelight-navbar';

// --- DATA & TRANSLATIONS ---
// This section contains all the static data for the resume, including skills, work history, and multilingual translations.

/**
 * An object containing all translatable strings for the application, supporting English, Danish, and Swedish.
 * The data for each language is imported from a separate file in the `i18n` directory.
 */
const translations = { en, da, sv };

/**
 * An array of all skills, categorized for filtering.
 */
const ALL_SKILLS: Skill[] = [
    { name: "CrossFit Level 2", category: 'fitness' },
    { name: "Program Design", category: 'fitness' },
    { name: "Athlete Coaching", category: 'fitness' },
    { name: "Boxing Instruction", category: 'fitness' },
    { name: "HIIT", category: 'fitness' },
    { name: "Community Engagement", category: 'fitness' },
    { name: "Project Management", category: 'management' },
    { name: "Operational Management", category: 'management' },
    { name: "Content Strategy", category: 'management' },
    { name: "Client Relations", category: 'management' },
    { name: "Full-Stack Development", category: 'tech' },
    { name: "React & TypeScript", category: 'tech' },
];

/**
 * Base data for work experience. Detailed roles and achievements are fetched from the `translations` object.
 */
const workData: Omit<WorkExperience, 'role' | 'achievements'>[] = [
    { id: "kraftvrk", company: "Kraftvrk", duration: "June 2024 - Present", location: "Copenhagen, Denmark", category: 'Fitness & Coaching' },
    { id: "bookingboard", company: "Booking Board · Freelance", duration: "June 2023 - June 2024", location: "Berlin · Remote", category: 'Software & Tech' },
    { id: "apollo", company: "Apollo Travels", duration: "April 2022 - March 2023", location: "Greece, Fuerteventura & Egypt", category: 'Fitness & Coaching' },
    { id: "artesuave", company: "Arte Suave", duration: "January 2021 - Present", location: "Copenhagen, Denmark", category: 'Fitness & Coaching' },
    { id: "formfit", company: "Form & Fitness", duration: "2019 - Present", location: "Copenhagen, Denmark", category: 'Fitness & Coaching' },
    { id: "sats", company: "SATS", duration: "2019 - 2021", location: "Copenhagen, Denmark", category: 'Fitness & Coaching' },
    { id: "fitnessx", company: "FitnessX", duration: "2019 - 2021", location: "Copenhagen, Denmark", category: 'Fitness & Coaching' },
    { id: "cf2400", company: "Crossfit 2400", duration: "2017 - 2019", location: "Copenhagen, Denmark", category: 'Management & Operations' },
    { id: "mclernons", company: "McLernons", duration: "2015 - 2016", location: "Perth, Australia", category: 'Management & Operations' },
    { id: "csa", company: "CSA", duration: "2009 - 2019", location: "Copenhagen, Denmark", category: 'Fitness & Coaching' },
];

// --- UI COMPONENTS ---

/**
 * A language switcher component that allows users to select the display language.
 * @param {object} props - Component properties.
 * @param {string} props.currentLang - The currently selected language code (e.g., 'en').
 * @param {function} props.onSelectLang - Callback function to execute when a new language is selected.
 * @param {string} [props.className] - Optional additional CSS classes.
 */
const LanguageSwitcher: React.FC<{ currentLang: keyof typeof translations; onSelectLang: (lang: keyof typeof translations) => void; className?: string }> = ({ currentLang, onSelectLang, className }) => (
    <div className={`flex items-center bg-gray-200/80 rounded-full p-0.5 shrink-0 ${className}`}>
      {Object.keys(translations).map((code) => (
        <button key={code} onClick={() => onSelectLang(code as keyof typeof translations)}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 ${currentLang === code ? 'bg-white text-teal-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
          aria-pressed={currentLang === code}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
);

/**
 * A styled, reusable button for control actions in the header.
 * @param {object} props - Component properties.
 * @param {function} props.onClick - The function to call on button click.
 * @param {string} props.title - The tooltip text for the button.
 * @param {React.ReactNode} props.children - The icon or content of the button.
 * @param {boolean} [props.disabled] - Whether the button is disabled.
 * @param {string} [props.className] - Optional additional CSS classes.
 */
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

/**
 * Renders a section with a title and a list of skill tags.
 * @param {object} props - Component properties.
 * @param {Skill[]} props.skills - An array of skill objects to display.
 * @param {string} props.title - The title of the skills section.
 */
const SkillsSection: React.FC<{ skills: Skill[], title: string }> = ({ skills, title }) => (
    <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-700 mb-3">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
                <span key={skill.name} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">{skill.name}</span>
            ))}
        </div>
    </div>
);

/**
 * Displays a formatted, targeted cover letter for specific resume views (e.g., Fitness).
 * @param {object} props - Component properties.
 * @param {string} props.text - The cover letter text to display.
 */
const CoverLetter: React.FC<{ text: string }> = ({ text }) => (
    <div className="bg-gray-100/80 rounded-lg p-4 mt-6">
        <p className="text-gray-700 italic text-base">{text}</p>
    </div>
);

/**
 * A card component that displays a single work experience item.
 * @param {object} props - Component properties.
 * @param {WorkExperience} props.experience - The work experience data object.
 * @param {object} props.t - The translation object for the current language.
 */
const ExperienceCard: React.FC<{ experience: WorkExperience; t: (typeof translations)['en'] }> = ({ experience, t }) => {
    const { fitness = [], professional = [] } = experience.achievements;
    const hasFitness = fitness.length > 0;
    const hasProfessional = professional.length > 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 print:shadow-none print:p-0 print:mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{experience.role}</h3>
                    <p className="text-md font-semibold text-teal-700">{experience.company}</p>
                    <p className="text-sm text-gray-500 mt-1">{experience.duration} &bull; {experience.location}</p>
                </div>
            </div>
            {(hasFitness || hasProfessional) && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                    {hasFitness && (
                        <div className="mb-4 last:mb-0">
                            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t.sections.achievements.fitness}</h4>
                            <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2 marker:text-teal-500">
                                {fitness.map((ach, index) => <li key={`fit-${index}`}>{ach}</li>)}
                            </ul>
                        </div>
                    )}
                    {hasProfessional && (
                         <div className="mb-4 last:mb-0">
                            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t.sections.achievements.professional}</h4>
                             <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2 marker:text-teal-500">
                                {professional.map((ach, index) => <li key={`pro-${index}`}>{ach}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * A reusable collapsible (accordion) section component.
 * @param {object} props - Component properties.
 * @param {string} props.title - The title displayed in the section header.
 * @param {React.ReactNode} props.children - The content to be shown/hidden.
 * @param {string} props.sectionId - A unique identifier for the section.
 * @param {boolean} props.isCollapsed - The current collapsed state of the section.
 * @param {function} props.onToggle - Callback function to toggle the collapsed state.
 */
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
            className="flex justify-between items-center w-full p-4 sm:p-5 text-left"
            aria-expanded={!isCollapsed}
            aria-controls={`section-content-${sectionId}`}
        >
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <ChevronDownIcon className={`h-6 w-6 text-gray-500 transition-transform duration-300 collapsible-icon ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
        <div
            id={`section-content-${sectionId}`}
            className={`collapsible-content transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-[10000px]'}`}
        >
            <div className="px-4 sm:px-5 pb-5">
                {children}
            </div>
        </div>
    </div>
);

// --- CONTACT MODAL COMPONENT ---
/**
 * A modal dialog that displays contact information.
 * @param {object} props - Component properties.
 * @param {object} props.t - The translation object for the current language.
 * @param {function} props.onClose - Callback function to close the modal.
 */
const ContactModal: React.FC<{ t: (typeof translations)['en']; onClose: () => void; }> = ({ t, onClose }) => {
    // Effect to handle 'Escape' key press for closing the modal.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
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
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <XIcon className="h-6 w-6" />
                </button>
                <h2 id="contact-modal-title" className="text-2xl font-bold text-gray-800 mb-6 text-center">{t.contact.title}</h2>
                <div className="space-y-4 text-lg">
                    <a href={`tel:${t.contact.phone}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <PhoneIcon className="h-6 w-6 text-teal-600 flex-shrink-0" /> 
                        <span className="text-gray-700">{t.contact.phone}</span>
                    </a>
                    <a href={`mailto:${t.contact.email}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <MailIcon className="h-6 w-6 text-teal-600 flex-shrink-0" />
                        <span className="text-gray-700">{t.contact.email}</span>
                    </a>
                    <a href={`https://${t.online.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors print-show-url">
                        <LinkedInIcon className="h-6 w-6 text-teal-600 flex-shrink-0" />
                        <span className="text-gray-700">{t.online.linkedinText}</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
/**
 * The root component of the application. It manages the overall state, data flow, and renders the main layout.
 */
const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [language, setLanguage] = useState<keyof typeof translations>('en'); // Currently selected language
  const [activeTab, setActiveTab] = useState<AppTab>('full'); // Active content tab (e.g., 'full', 'fitness')
  const [isContactModalOpen, setIsContactModalOpen] = useState(false); // Visibility of the contact modal
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({}); // State for which sections are collapsed
  const [isDownloading, setIsDownloading] = useState(false); // Tracks the PDF download status
  const resumeContainerRef = useRef<HTMLDivElement>(null); // Ref for the main content area for PDF generation

  // --- MEMOIZED VALUES ---
  // Memoized translation object to avoid re-computation on every render.
  const t = useMemo(() => translations[language], [language]);

  // Determines which category to use for headline/summary text, defaulting to 'full'.
  const activeCategoryForText = useMemo((): 'full' | 'fitness' | 'tech' | 'management' => {
    if (activeTab === 'fitness' || activeTab === 'tech' || activeTab === 'management') {
        return activeTab;
    }
    return 'full';
  }, [activeTab]);

  // Memoized navigation items for the NavBar component.
  const navItems = useMemo((): NavItem[] => [
    { name: 'full', title: t.tabs.full, url: '#', icon: FileText },
    { name: 'fitness', title: t.tabs.fitness, url: '#', icon: Dumbbell },
    { name: 'tech', title: t.tabs.tech, url: '#', icon: Cpu },
    { name: 'management', title: t.tabs.management, url: '#', icon: Briefcase },
    { name: 'references', title: t.tabs.references, url: '#', icon: Users },
  ], [t]);

  // Memoized and translated experience data, combining static data with language-specific content.
  const experiencesInLang = useMemo(() => {
    return workData.map(job => ({
        ...job,
        ...t.experience[job.id as keyof typeof t.experience]
    } as WorkExperience));
  }, [t]);

  // Memoized list of experiences filtered by the active tab.
  const filteredExperiences = useMemo(() => {
    if (activeTab === 'full') return experiencesInLang;
    if (activeTab === 'fitness') return experiencesInLang.filter(exp => exp.category === 'Fitness & Coaching');
    if (activeTab === 'tech') return experiencesInLang.filter(exp => exp.category === 'Software & Tech');
    if (activeTab === 'management') return experiencesInLang.filter(exp => exp.category === 'Management & Operations');
    return [];
  }, [activeTab, experiencesInLang]);

  // Memoized list of skills filtered by the active tab.
  const displayedSkills = useMemo(() => {
    if (activeTab === 'full') return ALL_SKILLS;
    return ALL_SKILLS.filter(skill => skill.category === activeTab || skill.category === 'both');
  }, [activeTab]);

  // --- HANDLERS & LOGIC ---
  // Toggles the collapsed state of a single section.
  const handleToggleCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Determines which section IDs are currently visible based on the active tab.
  const visibleSectionIds = useMemo(() => {
    if (activeTab === 'references') return ['references'];
    return ['summary', 'skills', 'experience'];
  }, [activeTab]);

  // Checks if all currently visible sections are collapsed.
  const areAllCurrentlyCollapsed = useMemo(() => 
    visibleSectionIds.every(id => !!collapsedSections[id]),
    [visibleSectionIds, collapsedSections]
  );
  
  // Toggles all visible sections between collapsed and expanded.
  const handleToggleAll = () => {
      const shouldCollapse = !areAllCurrentlyCollapsed;
      const newStates = { ...collapsedSections };
      visibleSectionIds.forEach(id => {
          newStates[id] = shouldCollapse;
      });
      setCollapsedSections(newStates);
  };
  
  // Sets the new active tab.
  const handleTabChange = (tabName: string) => {
      setActiveTab(tabName as AppTab);
  };

  // Handles the PDF download process.
  const handleDownloadPdf = () => {
    const element = resumeContainerRef.current;
    if (!element || isDownloading) return;

    setIsDownloading(true);

    // Temporarily expand all sections to ensure they are included in the PDF.
    const originalCollapsedState = { ...collapsedSections };
    const allExpandedState: { [key:string]: boolean } = {};
    Object.keys(originalCollapsedState).forEach(key => {
        allExpandedState[key] = false;
    });
    setCollapsedSections(allExpandedState);

    // Use a timeout to allow the DOM to update before generating the PDF.
    setTimeout(() => {
        const filename = `Ronny_Christensen_Resume_${language.toUpperCase()}.pdf`;
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
              scale: 2, 
              useCORS: true, 
              backgroundColor: '#f8fafc' // Match the page background
          },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save().catch((err: any) => {
            console.error("Error generating PDF:", err);
        }).finally(() => {
            // Restore original section collapsed states and reset downloading flag.
            setCollapsedSections(originalCollapsedState);
            setIsDownloading(false);
        });
    }, 200); // 200ms delay for DOM update
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans transition-colors duration-300">
      <NavBar
        items={navItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <div className="h-6 w-px bg-gray-300/60" aria-hidden="true" />
        <div className="flex items-center gap-0.5 pr-1">
            <ControlButton onClick={() => setIsContactModalOpen(true)} title={t.tooltips.viewContact}>
                <MailIcon className="h-5 w-5" />
            </ControlButton>
            <ControlButton onClick={handleToggleAll} title={areAllCurrentlyCollapsed ? t.tooltips.unfoldAll : t.tooltips.collapseAll}>
                {areAllCurrentlyCollapsed ? <ChevronDoubleDownIcon className="h-5 w-5" /> : <ChevronDoubleUpIcon className="h-5 w-5" />}
            </ControlButton>
            <ControlButton onClick={handleDownloadPdf} title={t.tooltips.download} disabled={isDownloading}>
                <DownloadIcon className={`h-5 w-5 ${isDownloading ? 'animate-pulse' : ''}`} />
            </ControlButton>
            <div className="h-6 w-px bg-gray-300/60 mx-2" aria-hidden="true" />
            <LanguageSwitcher currentLang={language} onSelectLang={setLanguage} className="!bg-transparent !p-0" />
        </div>
      </NavBar>
      
      {isContactModalOpen && <ContactModal t={t} onClose={() => setIsContactModalOpen(false)} />}
      
      {/* Main content area for the resume, also used as the source for PDF generation */}
      <main id="resume-container" ref={resumeContainerRef} className="max-w-4xl mx-auto pt-16 pb-28 sm:pt-24 sm:pb-8 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">{t.name}</h1>
            <h2 className="text-lg md:text-xl font-medium text-teal-600 mt-2">{t.headline[activeCategoryForText]}</h2>
        </header>

        {/* The main content body with collapsible sections */}
        <div className="animate-fade-in-up">
            {/* A key is used here to re-trigger animations when the active tab changes */}
            <div key={activeTab} className="animate-fade-in">
                {activeTab !== 'references' ? (
                    <>
                        {/* Summary Section */}
                        <CollapsibleSection title={t.sections.summary} sectionId="summary" isCollapsed={!!collapsedSections['summary']} onToggle={handleToggleCollapse}>
                            <p className="max-w-3xl text-gray-600">{t.summary[activeCategoryForText]}</p>
                        </CollapsibleSection>

                        {/* Skills Section */}
                        <CollapsibleSection title={t.sections.skills} sectionId="skills" isCollapsed={!!collapsedSections['skills']} onToggle={handleToggleCollapse}>
                            {(activeTab === 'fitness' || activeTab === 'tech' || activeTab === 'management') && <CoverLetter text={t.coverLetters[activeTab]} />}
                            <SkillsSection skills={displayedSkills} title={activeTab === 'full' ? t.sections.skills : ''} />
                        </CollapsibleSection>

                        {/* Experience Section */}
                        <CollapsibleSection title={t.sections.experience} sectionId="experience" isCollapsed={!!collapsedSections['experience']} onToggle={handleToggleCollapse}>
                             <div className="space-y-6">
                                {filteredExperiences.map((exp) => (
                                    <ExperienceCard key={exp.id} experience={exp} t={t} />
                                ))}
                            </div>
                        </CollapsibleSection>
                    </>
                ) : (
                     /* References Section (only shown on the 'references' tab) */
                     <CollapsibleSection title={t.sections.references} sectionId="references" isCollapsed={!!collapsedSections['references']} onToggle={handleToggleCollapse}>
                         <h3 className="text-lg font-bold text-gray-700 mb-4">{t.references.title}</h3>
                         <div className="space-y-4">
                            {t.references.list.map((ref: Reference, index: number) => (
                                <div key={index} className="p-4 bg-gray-100/80 rounded-lg">
                                    <p className="font-bold text-gray-800">{ref.name}</p>
                                    <p className="text-gray-600">{ref.role}</p>
                                    <p className="text-sm text-gray-500 mt-2 print-force-visible">
                                        {ref.contact}
                                    </p>
                                </div>
                            ))}
                         </div>
                     </CollapsibleSection>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};

// --- GLOBAL STYLES ---
// Dynamically inject a <style> tag into the document head for CSS keyframe animations.
// This is a simple way to add global animations without a full CSS-in-JS solution.
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
    }
     @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }
`;
document.head.appendChild(style);


export default App;