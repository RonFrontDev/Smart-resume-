

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { WorkExperience, AppTab, Skill, Reference, WorkCategory } from './types';
import { MailIcon, PhoneIcon, LinkedInIcon, ChevronDownIcon, DownloadIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon, XIcon } from './components/icons';
import { FileText, Dumbbell, Briefcase, Users, Cpu } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { en } from './i18n/en';
import { da } from './i18n/da';
import { sv } from './i18n/sv';
import { NavBar, NavItem } from './components/ui/tubelight-navbar';
import { cn } from './lib/utils';

// --- DATA & TRANSLATIONS ---
const translations = { en, da, sv };

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

// --- COMPONENTS ---
const LanguageSwitcher: React.FC<{ currentLang: keyof typeof translations; onSelectLang: (lang: keyof typeof translations) => void; className?: string }> = ({ currentLang, onSelectLang, className }) => (
  <div className={`flex items-center bg-gray-200/80 rounded-full p-0.5 shrink-0 ${className}`}>
    {Object.keys(translations).map((code) => (
      <button
        key={code}
        onClick={() => onSelectLang(code as keyof typeof translations)}
        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 ${currentLang === code ? 'bg-white text-teal-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
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

const SkillsSection: React.FC<{ skills: Skill[], title: string }> = ({ skills, title }) => {
  const getSkillColorClasses = (category: Skill['category']) => {
    switch (category) {
      case 'fitness': return 'bg-teal-100 text-teal-800';
      case 'tech': return 'bg-blue-100 text-blue-800';
      case 'management': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-700 mb-3">{title}</h3>
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

const CoverLetter: React.FC<{ text: string }> = ({ text }) => (
  <div className="bg-gray-100/80 rounded-lg p-4 mt-6">
    <p className="text-gray-700 italic text-base">{text}</p>
  </div>
);

const ExperienceCard: React.FC<{ experience: WorkExperience; t: (typeof translations)['en'] }> = ({ experience, t }) => {
  const { fitness = [], professional = [] } = experience.achievements;
  
  const getBorderColorClass = (category: WorkCategory) => {
    switch (category) {
      case 'Fitness & Coaching': return 'border-l-teal-500';
      case 'Software & Tech': return 'border-l-blue-500';
      case 'Management & Operations': return 'border-l-purple-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 print:shadow-none print:p-0 print:mb-4",
      "py-6 pr-6 pl-5 border-l-4",
      getBorderColorClass(experience.category)
    )}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{experience.role}</h3>
          <p className="text-md font-semibold text-teal-700">{experience.company}</p>
          <p className="text-sm text-gray-500 mt-1">{experience.duration} &bull; {experience.location}</p>
        </div>
      </div>
      {(fitness.length > 0 || professional.length > 0) && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {fitness.length > 0 && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t.sections.achievements.fitness}</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2 marker:text-teal-500">
                {fitness.map((ach, idx) => <li key={`fit-${idx}`}>{ach}</li>)}
              </ul>
            </div>
          )}
          {professional.length > 0 && (
            <div className="mb-4 last:mb-0">
              <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">{t.sections.achievements.professional}</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1.5 pl-2 marker:text-teal-500">
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
      className="flex justify-between items-center w-full p-4 sm:p-5 text-left"
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

// --- MAIN APP ---
const App: React.FC = () => {
  const [language, setLanguage] = useState<keyof typeof translations>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('full');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    summary: false,
    skills: false,
    experience: false,
    references: false
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const resumeContainerRef = useRef<HTMLDivElement>(null);
  const t = useMemo(() => translations[language], [language]);

  const activeCategoryForText = useMemo((): 'full' | 'fitness' | 'tech' | 'management' => {
    if (activeTab === 'fitness' || activeTab === 'tech' || activeTab === 'management') return activeTab;
    return 'full';
  }, [activeTab]);
    
  const coverLetterForTab = useMemo(() => {
    if (activeTab === 'fitness' || activeTab === 'tech' || activeTab === 'management') {
      return t.coverLetters[activeTab];
    }
    return null;
  }, [activeTab, t]);

  const navItems = useMemo((): NavItem[] => [
    { name: 'full', title: t.tabs.full, url: '#', icon: FileText, colorClasses: { text: 'text-gray-700', bg: 'bg-gray-500/10', lamp: 'bg-gray-500', glow: 'bg-gray-500/20' } },
    { name: 'fitness', title: t.tabs.fitness, url: '#', icon: Dumbbell, colorClasses: { text: 'text-teal-700', bg: 'bg-teal-500/10', lamp: 'bg-teal-500', glow: 'bg-teal-500/20' } },
    { name: 'tech', title: t.tabs.tech, url: '#', icon: Cpu, colorClasses: { text: 'text-blue-700', bg: 'bg-blue-500/10', lamp: 'bg-blue-500', glow: 'bg-blue-500/20' } },
    { name: 'management', title: t.tabs.management, url: '#', icon: Briefcase, colorClasses: { text: 'text-purple-700', bg: 'bg-purple-500/10', lamp: 'bg-purple-500', glow: 'bg-purple-500/20' } },
    { name: 'references', title: t.tabs.references, url: '#', icon: Users, colorClasses: { text: 'text-indigo-700', bg: 'bg-indigo-500/10', lamp: 'bg-indigo-500', glow: 'bg-indigo-500/20' } },
  ], [t]);

  const experiencesInLang = useMemo(() => {
    return workData.map(job => ({
      ...job,
      ...t.experience[job.id as keyof typeof t.experience]
    } as WorkExperience));
  }, [t]);

  const filteredExperiences = useMemo(() => {
    if (activeTab === 'full') return experiencesInLang;
    if (activeTab === 'fitness') return experiencesInLang.filter(exp => exp.category === 'Fitness & Coaching');
    if (activeTab === 'tech') return experiencesInLang.filter(exp => exp.category === 'Software & Tech');
    if (activeTab === 'management') return experiencesInLang.filter(exp => exp.category === 'Management & Operations');
    return [];
  }, [activeTab, experiencesInLang]);

  const displayedSkills = useMemo(() => {
    if (activeTab === 'full') return ALL_SKILLS;
    return ALL_SKILLS.filter(skill => skill.category === activeTab);
  }, [activeTab]);

  const handleToggleCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const visibleSectionIds = useMemo(() => activeTab === 'references' ? ['references'] : ['summary', 'skills', 'experience'], [activeTab]);
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
      });
    }, 50);
  };

  return (
    <>
      <NavBar items={navItems} activeTab={activeTab} onTabChange={handleTabChange}>
        <LanguageSwitcher currentLang={language} onSelectLang={setLanguage} />
        <ControlButton onClick={() => setIsContactModalOpen(true)} title="Contact">
          <MailIcon />
        </ControlButton>
        <ControlButton onClick={handleDownloadPdf} title="Download PDF" disabled={isDownloading}>
          <DownloadIcon />
        </ControlButton>
        <ControlButton onClick={handleToggleAll} title="Toggle All">
          {areAllCurrentlyCollapsed ? <ChevronDoubleDownIcon /> : <ChevronDoubleUpIcon />}
        </ControlButton>
      </NavBar>

      <main ref={resumeContainerRef} className="p-4 sm:p-6 lg:p-10 sm:pt-24 print:p-0 bg-gray-50 min-h-screen">
        <CollapsibleSection sectionId="summary" title={t.sections.summary} isCollapsed={collapsedSections.summary} onToggle={handleToggleCollapse}>
          <p className="text-gray-700">{t.summary[activeCategoryForText]}</p>
        </CollapsibleSection>
        
        {activeTab !== 'references' && (
         <>
          <CollapsibleSection sectionId="skills" title={t.sections.skills} isCollapsed={collapsedSections.skills} onToggle={handleToggleCollapse}>
            <SkillsSection title={t.sections.skills} skills={displayedSkills} />
          </CollapsibleSection>

          <CollapsibleSection sectionId="experience" title={t.sections.experience} isCollapsed={collapsedSections.experience} onToggle={handleToggleCollapse}>
            <div className="space-y-6">
              {filteredExperiences.map(exp => (
                <ExperienceCard key={exp.id} experience={exp} t={t} />
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
                    <p className="text-teal-700">{ref.role}</p>
                    <p className="text-gray-500">{ref.contact}</p>
                  </div>
                ))}
              </div>
          </CollapsibleSection>
        )}

        {coverLetterForTab && <CoverLetter text={coverLetterForTab} />}
      </main>

      {isContactModalOpen && <ContactModal t={t} onClose={() => setIsContactModalOpen(false)} />}
    </>
  );
};

export default App;