import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { FileText, Dumbbell, Briefcase, Users, Cpu, Camera, AlertTriangle, Sparkles } from 'lucide-react';

import type { AppTab, WorkExperience, Education, Reference, Skill } from './types';
import { MailIcon, DownloadIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon } from './components/icons';
import { NavBar, NavItem } from './components/ui/tubelight-navbar';
import { ToggleSwitch } from './components/ui/toggle-switch';
import { cn } from './lib/utils';
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

const App: React.FC = () => {
  const [language, setLanguage] = useState<keyof typeof translations>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('full');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDevModeModalOpen, setIsDevModeModalOpen] = useState(false);
  const [isAIAssistantModalOpen, setIsAIAssistantModalOpen] = useState(false);
  
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
    if (activeTab === 'full' || activeTab === 'references') return experiencesInLang;

    const categoryMap = {
      fitness: ['Fitness Coaching', 'Fitness Management', 'Hospitality & Service'],
      tech: ['Software Development'],
      management: ['Project Management', 'Fitness Management'],
      'content-creation': ['Content Creation']
    };

    const categories = categoryMap[activeTab as keyof typeof categoryMap];
    return categories ? experiencesInLang.filter(exp => exp.category.some(cat => categories.includes(cat))) : [];
  }, [activeTab, experiencesInLang]);

  const displayedSkills = useMemo(() => {
    if (activeTab === 'full') return ALL_SKILLS;
    return ALL_SKILLS.filter(skill => skill.category === activeTab);
  }, [activeTab]);

  const currentResumeContentForAI = useMemo(() => {
    const summary = t.summary[activeCategoryForText];
    const skills = displayedSkills.map((s: Skill) => s.name).join(', ');
    const experiences = filteredExperiences.map((exp: WorkExperience) => {
        const achievements = [
            ...exp.achievements.fitness,
            ...exp.achievements.professional,
        ].map(a => `- ${a}`).join('\n');
        return `Role: ${exp.role} at ${exp.company}\nAchievements:\n${achievements}`;
    }).join('\n\n');

    return `
        Summary: ${summary}\n
        Skills: ${skills}\n
        Experience:\n${experiences}
    `;
  }, [t, activeCategoryForText, displayedSkills, filteredExperiences]);

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

  return (
    <div className="relative z-0">
      <motion.div
        className="fixed top-[-25rem] left-[-35rem] sm:left-[-25rem] w-[60rem] h-[60rem] rounded-full opacity-20 blur-3xl -z-10 no-print"
        animate={backgroundStyle}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      <NavBar items={navItems} activeTab={activeTab} onTabChange={handleTabChange}>
        <LanguageSwitcher currentLang={language} onSelectLang={setLanguage} />
        <ControlButton onClick={() => setIsContactModalOpen(true)} title={t.tooltips.viewContact}>
          <MailIcon />
        </ControlButton>
        <ControlButton onClick={() => setIsAIAssistantModalOpen(true)} title={t.tooltips.aiAssistant}>
            <Sparkles size={18} />
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
                {(t.references.list as Reference[]).map((ref: Reference, index: number) => (
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
      {isAIAssistantModalOpen && <AIHelperModal
        t={t}
        onClose={() => setIsAIAssistantModalOpen(false)}
        resumeContent={currentResumeContentForAI}
      />}
    </div>
  );
};

export default App;