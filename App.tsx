import React, { useState, useMemo } from 'react';
import type { WorkExperience, WorkCategory, AppTab, Skill } from './types';
import { MailIcon, PhoneIcon, LinkedInIcon } from './components/icons';

// --- DATA & TRANSLATIONS ---

const ALL_SKILLS: Skill[] = [
    { name: "CrossFit Level 2", category: 'fitness' },
    { name: "Program Design", category: 'fitness' },
    { name: "Athlete Coaching", category: 'fitness' },
    { name: "Boxing Instruction", category: 'fitness' },
    { name: "HIIT", category: 'fitness' },
    { name: "Community Engagement", category: 'fitness' },
    { name: "Project Management", category: 'professional' },
    { name: "Full-Stack Development", category: 'professional' },
    { name: "React & TypeScript", category: 'professional' },
    { name: "Operational Management", category: 'professional' },
    { name: "Content Strategy", category: 'professional' },
    { name: "Client Relations", category: 'professional' },
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

const translations = {
  en: {
    headline: "Versatile Professional with expertise in Fitness, Management & Tech",
    summary: "A highly motivated and results-oriented professional with over 15 years of multifaceted experience spanning the fitness industry, project management, and software development. Proven ability to lead and inspire, combined with a strong background in managing operations and building digital products.",
    contact: { phone: "+45 24 45 70 80", email: "ronnychristensen1983@gmail.com" },
    online: { linkedin: "linkedin.com/in/ronny-c" },
    tabs: { full: "Full Résumé", fitness: "Fitness", professional: "Other Professional Work" },
    coverLetters: {
        fitness: "As a passionate and certified fitness professional with over a decade of experience, I specialize in creating dynamic, results-driven training environments. My expertise in CrossFit, strength conditioning, and community building has consistently led to increased member retention and engagement. I am eager to bring my dedication and coaching skills to a team that values performance, safety, and a thriving fitness culture.",
        professional: "A versatile and strategic professional with a unique blend of experience in project management, software development, and client relations. I have a proven track record of leading projects from concept to completion, building robust digital solutions, and managing operational logistics. I am adept at problem-solving in fast-paced environments and am seeking to apply my diverse technical and managerial skills to drive impactful results."
    },
    sections: { skills: "Skills", experience: "Experience", achievements: { fitness: "Fitness Achievements", professional: "Professional Achievements" } },
    experience: {
        kraftvrk: { role: "Crossfit instructor and social content creator", achievements: { fitness: ["Develop and lead high-energy CrossFit classes, focusing on technique, safety, and performance.", "Create engaging social media content (videos, posts) to build community and promote the gym's brand, increasing online engagement."], professional: ["Execute a content strategy across multiple social media platforms to drive brand awareness and member acquisition.", "Manage content production from concept to publication, including filming, editing, and copywriting."] } },
        bookingboard: { role: "Software Developer", achievements: { fitness: [], professional: ["Independently managed the full development lifecycle of a freelance project, from initial client consultation to final deployment.", "Designed and implemented a user-friendly interface using modern web technologies to enhance user experience.", "Developed and integrated backend functionalities for a booking system, demonstrating proficiency in full-stack concepts."] } },
        apollo: { role: "Instructor", achievements: { fitness: ["Led CrossFit and various sports classes for a diverse international clientele, from beginners to elite athletes, at premier resorts.", "Received consistently high guest satisfaction scores for delivering engaging, safe, and effective training sessions.", "Managed the CrossFit program at two major international resorts, overseeing scheduling, equipment, and class quality."], professional: ["Successfully adapted communication and teaching styles to cater to a diverse, multicultural audience in a high-demand hospitality environment.", "Acted as a brand ambassador for Playitas & Apollo, promoting a high-quality fitness and wellness experience to international guests."] } },
        artesuave: { role: "Instructor", achievements: { fitness: ["Coach dynamic CrossFit and Boxing classes for members of all skill levels, from beginners to advanced athletes.", "Contribute to a motivating and supportive gym culture that promotes member consistency and progress."], professional: [] } },
        formfit: { role: "Instructor", achievements: { fitness: ["Lead high-intensity interval training (HIIT) classes, consistently driving high attendance and positive member feedback."], professional: [] } },
        sats: { role: "Instructor", achievements: { fitness: ["Instructed specialized Strength and Boxing classes, helping members achieve specific fitness goals such as strength gain and improved cardiovascular health."], professional: [] } },
        fitnessx: { role: "Instructor", achievements: { fitness: ["Delivered a variety of classes including CrossFit, Strength, and Boxing, showcasing versatility and broad fitness knowledge."], professional: [] } },
        cf2400: { role: "Crossfit Box Manager", achievements: { fitness: ["Managed daily operations for a 200+ member CrossFit facility, fostering a premier training environment.", "Designed and implemented diverse training programs that increased member skill levels and satisfaction.", "Grew the community by organizing engaging workshops and social events, boosting member retention by 25%."], professional: ["Directed all business aspects, including staff management, financial oversight, and strategic planning, leading to sustained profitability.", "Recruited, trained, and mentored a team of 5 coaches, elevating the quality of instruction and service.", "Executed a targeted social media marketing strategy that expanded online reach by 50% and generated a consistent lead pipeline."] } },
        mclernons: { role: "Project Manager", achievements: { fitness: [], professional: ["Managed end-to-end project execution for commercial inventory auctions, overseeing logistics, personnel, and client relations.", "Led and directed teams responsible for inventory assessment, warehouse organization, and auction execution.", "Successfully coordinated multiple high-value auctions for assets from bankrupt companies, ensuring maximum returns for stakeholders."] } },
        csa: { role: "Full-time Instructor", achievements: { fitness: ["Coached a comprehensive range of disciplines including CrossFit, Strength, Boxing, and Muay Thai over a decade.", "Prepared competitive athletes for competitions and fights, developing tailored training and nutrition plans.", "Mentored numerous members from novice to advanced levels, playing a key role in their long-term fitness journey."], professional: ["Maintained high levels of client retention over a 10-year period through expert coaching and strong relationship building.", "Managed class schedules and programming for multiple disciplines, ensuring a balanced and comprehensive gym offering."] } },
    }
  },
  da: {
    headline: "Alsidig professionel med ekspertise i fitness, ledelse & tech",
    summary: "En yderst motiveret og resultatorienteret professionel med over 15 års mangesidet erfaring, der spænder over fitnessbranchen, projektledelse og softwareudvikling. Dokumenteret evne til at lede og inspirere, kombineret med en stærk baggrund i driftsledelse og opbygning af digitale produkter.",
    contact: { phone: "+45 24 45 70 80", email: "ronnychristensen1983@gmail.com" },
    online: { linkedin: "linkedin.com/in/ronny-c" },
    tabs: { full: "Fuldt CV", fitness: "Fitness", professional: "Andet Professionelt Arbejde" },
    coverLetters: {
        fitness: "Som en passioneret og certificeret fitness-professionel med over et årtis erfaring specialiserer jeg mig i at skabe dynamiske, resultatorienterede træningsmiljøer. Min ekspertise inden for CrossFit, styrketræning og opbygning af fællesskaber har konsekvent ført til øget medlemsfastholdelse og engagement. Jeg er ivrig efter at bringe min dedikation og coachingfærdigheder til et team, der værdsætter præstation, sikkerhed og en blomstrende fitnesskultur.",
        professional: "En alsidig og strategisk professionel med en unik blanding af erfaring inden for projektledelse, softwareudvikling og kunderelationer. Jeg har en dokumenteret track record med at lede projekter fra koncept til færdiggørelse, bygge robuste digitale løsninger og styre operationel logistik. Jeg er dygtig til problemløsning i tempofyldte miljøer og søger at anvende mine forskelligartede tekniske og ledelsesmæssige færdigheder til at skabe betydningsfulde resultater."
    },
    sections: { skills: "Kompetencer", experience: "Erfaring", achievements: { fitness: "Fitness Præstationer", professional: "Professionelle Præstationer" } },
    experience: {
        kraftvrk: { role: "CrossFit-instruktør og skaber af socialt indhold", achievements: { fitness: ["Udvikler og leder høj-energi CrossFit-timer med fokus på teknik, sikkerhed og præstation.", "Skaber engagerende socialt medieindhold (videoer, opslag) for at opbygge fællesskab og promovere centrets brand, hvilket øger online engagement."], professional: ["Udfører en indholdsstrategi på tværs af flere sociale medieplatforme for at drive brandbevidsthed og medlemsrekruttering.", "Håndterer indholdsproduktion fra koncept til udgivelse, herunder filmning, redigering og copywriting."] } },
        bookingboard: { role: "Softwareudvikler", achievements: { fitness: [], professional: ["Styrede selvstændigt den fulde udviklingscyklus af et freelanceprojekt, fra indledende kundekonsultation til endelig implementering.", "Designede og implementerede en brugervenlig grænseflade ved hjælp af moderne webteknologier for at forbedre brugeroplevelsen.", "Udviklede og integrerede backend-funktionaliteter til et bookingsystem, hvilket demonstrerer færdigheder inden for full-stack koncepter."] } },
        apollo: { role: "Instruktør", achievements: { fitness: ["Ledede CrossFit og forskellige sportsklasser for en mangfoldig international kundekreds, fra begyndere til eliteatleter, på førende resorts.", "Modtog konsekvent høje gæstetilfredshedsscores for at levere engagerende, sikre og effektive træningssessioner.", "Styrede CrossFit-programmet på to store internationale resorts, hvor jeg overså planlægning, udstyr og kvaliteten af timerne."], professional: ["Tilpassede succesfuldt kommunikations- og undervisningsstile for at imødekomme et mangfoldigt, multikulturelt publikum i et krævende hotelmiljø.", "Fungerede som brand-ambassadør for Playitas & Apollo, og promoverede en fitness- og wellnessoplevelse af høj kvalitet til internationale gæster."] } },
        artesuave: { role: "Instruktør", achievements: { fitness: ["Coach dynamic CrossFit and Boxing classes for members of all skill levels, from beginners to advanced athletes.", "Contribute to a motivating and supportive gym culture that promotes member consistency and progress."], professional: [] } },
        formfit: { role: "Instruktør", achievements: { fitness: ["Leder høj-intensiv intervaltræning (HIIT) klasser, der konsekvent skaber høj deltagelse og positiv medlemsfeedback."], professional: [] } },
        sats: { role: "Instruktør", achievements: { fitness: ["Instruerede i specialiserede styrke- og bokseklasser, hvilket hjalp medlemmer med at nå specifikke fitnessmål såsom styrkeforøgelse og forbedret kardiovaskulær sundhed."], professional: [] } },
        fitnessx: { role: "Instruktør", achievements: { fitness: ["Leverede en række klasser, herunder CrossFit, styrke og boksning, hvilket viser alsidighed og bred fitnessviden."], professional: [] } },
        cf2400: { role: "Crossfit Box Manager", achievements: { fitness: ["Styrede den daglige drift for et CrossFit-center med over 200 medlemmer og fremmede et førsteklasses træningsmiljø.", "Designede og implementerede forskellige træningsprogrammer, der øgede medlemmernes færdighedsniveau og tilfredshed.", "Udviklede fællesskabet ved at organisere engagerende workshops og sociale arrangementer, hvilket øgede medlemsfastholdelsen med 25 %."], professional: ["Stod for alle forretningsaspekter, herunder personaleledelse, økonomisk tilsyn og strategisk planlægning, hvilket førte til vedvarende rentabilitet.", "Rekrutterede, trænede og vejledte et team på 5 trænere, hvilket hævede kvaliteten af undervisning og service.", "Udførte en målrettet markedsføringsstrategi på sociale medier, der udvidede online rækkevidden med 50 % og genererede en konstant strøm af kundeemner."] } },
        mclernons: { role: "Projektleder", achievements: { fitness: [], professional: ["Styrede end-to-end projektudførelse for kommercielle lagerauktioner, med tilsyn af logistik, personale og kunderelationer.", "Ledede og dirigerede teams ansvarlige for lagervurdering, lagerorganisering og auktionsafvikling.", "Koordinerede med succes flere auktioner af høj værdi for aktiver fra konkursramte virksomheder, hvilket sikrede maksimalt afkast for interessenterne."] } },
        csa: { role: "Fuldtidsinstruktør", achievements: { fitness: ["Coachede et omfattende udvalg af discipliner, herunder CrossFit, styrke, boksning og Muay Thai over et årti.", "Forberedte konkurrenceatleter til konkurrencer og kampe, udviklede skræddersyede trænings- og ernæringsplaner.", "Vejledte talrige medlemmer fra begynder- til avanceret niveau og spillede en nøglerolle i deres langsigtede fitnessrejse."], professional: ["Opretholdt høje niveauer af kundefastholdelse over en 10-årig periode gennem ekspertcoaching og stærke relationsopbygning.", "Styrede timeplaner og programmering for flere discipliner, hvilket sikrede et afbalanceret og omfattende træningstilbud i centeret."] } },
    }
  },
  sv: {
    headline: "Mångsidig professionell med expertis inom fitness, ledarskap & teknik",
    summary: "En högmotiverad och resultatinriktad professionell med över 15 års mångfacetterad erfarenhet som sträcker sig över fitnessindustrin, projektledning och mjukvaruutveckling. Bevisad förmåga att leda och inspirera, kombinerat med en stark bakgrund inom driftledning och att bygga digitala produkter.",
    contact: { phone: "+45 24 45 70 80", email: "ronnychristensen1983@gmail.com" },
    online: { linkedin: "linkedin.com/in/ronny-c" },
    tabs: { full: "Fullständigt CV", fitness: "Fitness", professional: "Övrigt Professionellt Arbete" },
    coverLetters: {
        fitness: "Som en passionerad och certifierad fitnessprofessionell med över ett decenniums erfarenhet, specialiserar jag mig på att skapa dynamiska, resultatdrivna träningsmiljöer. Min expertis inom CrossFit, styrketräning och community-byggande har konsekvent lett till ökad medlemsretention och engagemang. Jag är ivrig att bidra med mitt engagemang och mina coachingfärdigheter till ett team som värdesätter prestation, säkerhet och en blomstrande fitnesskultur.",
        professional: "En mångsidig och strategisk professionell med en unik blandning av erfarenhet inom projektledning, mjukvaruutveckling och kundrelationer. Jag har en bevisad meritlista av att leda projekt från koncept till slutförande, bygga robusta digitala lösningar och hantera operativ logistik. Jag är skicklig på problemlösning i snabba miljöer och strävar efter att tillämpa mina mångsidiga tekniska och ledande färdigheter för att driva fram betydelsefulla resultat."
    },
    sections: { skills: "Kompetenser", experience: "Erfarenhet", achievements: { fitness: "Fitnessprestationer", professional: "Professionella Prestationer" } },
    experience: {
        kraftvrk: { role: "CrossFit-instruktör och skapare av socialt innehåll", achievements: { fitness: ["Utvecklar och leder högintensiva CrossFit-pass med fokus på teknik, säkerhet och prestation.", "Skapar engagerande socialt medieinnehåll (videor, inlägg) för att bygga gemenskap och marknadsföra gymmets varumärke, vilket ökar online-engagemanget."], professional: ["Genomför en innehållsstrategi över flera sociala medieplattformar för att driva varumärkeskännedom och medlemsförvärv.", "Hanterar innehållsproduktion från koncept till publicering, inklusive filmning, redigering och copywriting."] } },
        bookingboard: { role: "Mjukvaruutvecklare", achievements: { fitness: [], professional: ["Hanterade självständigt hela utvecklingslivscykeln för ett frilansprojekt, från första kundkonsultation till slutlig driftsättning.", "Designade och implementerade ett användarvänligt gränssnitt med modern webbteknik för att förbättra användarupplevelsen.", "Utvecklade och integrerade backend-funktioner för ett bokningssystem, vilket visar på kunskaper inom full-stack-koncept."] } },
        apollo: { role: "Instruktör", achievements: { fitness: ["Ledde CrossFit och olika sportklasser för en mångsidig internationell kundkrets, från nybörjare till elitidrottare, på förstklassiga resorter.", "Fick genomgående höga gästbetyg för att leverera engagerande, säkra och effektiva träningspass.", "Ansvarade för CrossFit-programmet på två stora internationella resorter, där jag övervakade schemaläggning, utrustning och klasskvalitet."], professional: ["Anpassade framgångsrikt kommunikations- och undervisningsstilar för att tillgodose en mångsidig, mångkulturell publik i en krävande hotellmiljö.", "Agerade som varumärkesambassadör för Playitas & Apollo, och främjade en högkvalitativ fitness- och wellnessupplevelse för internationella gäster."] } },
        artesuave: { role: "Instruktör", achievements: { fitness: ["Coachar dynamiska CrossFit- och boxningsklasser för medlemmar på alla färdighetsnivåer, från nybörjare till avancerade idrottare.", "Bidrar till en motiverande och stödjande gymkultur som främjar medlemmarnas kontinuitet och framsteg."], professional: [] } },
        formfit: { role: "Instruktör", achievements: { fitness: ["Leder högintensiva intervallträningspass (HIIT) som konsekvent genererar högt deltagande och positiv feedback från medlemmarna."], professional: [] } },
        sats: { role: "Instruktör", achievements: { fitness: ["Instruerade i specialiserade styrke- och boxningsklasser, vilket hjälpte medlemmar att uppnå specifika fitnessmål som styrkeökning och förbättrad kardiovaskulär hälsa."], professional: [] } },
        fitnessx: { role: "Instruktör", achievements: { fitness: ["Levererade en mängd olika klasser inklusive CrossFit, styrka och boxning, vilket visar på mångsidighet och bred fitnesskunskap."], professional: [] } },
        cf2400: { role: "Crossfit Box Manager", achievements: { fitness: ["Hanterade den dagliga driften för en CrossFit-anläggning med över 200 medlemmar och främjade en förstklassig träningsmiljö.", "Utformade och implementerade varierade träningsprogram som ökade medlemmarnas färdighetsnivåer och tillfredsställelse.", "Utökade gemenskapen genom att organisera engagerande workshops och sociala evenemang, vilket ökade medlemsbehållningen med 25 %."], professional: ["Styrde alla affärsaspekter, inklusive personalhantering, ekonomisk tillsyn och strategisk planering, vilket ledde till hållbar lönsamhet.", "Rekryterade, utbildade och handledde ett team på 5 coacher, vilket höjde kvaliteten på undervisning och service.", "Genomförde en riktad marknadsföringsstrategi på sociala medier som utökade den digitala räckvidden med 50 % och genererade ett konstant flöde av leads."] } },
        mclernons: { role: "Projektledare", achievements: { fitness: [], professional: ["Hanterade projektgenomförande från början till slut för kommersiella lagerauktioner, och övervakade logistik, personal och kundrelationer.", "Ledde och styrde team ansvariga för inventeringsbedömning, lagerorganisation och auktionsgenomförande.", "Koordinerade framgångsrikt flera högvärdesauktioner för tillgångar från konkursade företag, vilket säkerställde maximal avkastning för intressenterna."] } },
        csa: { role: "Heltidsinstruktör", achievements: { fitness: ["Coachade ett brett utbud av discipliner inklusive CrossFit, styrka, boxning och Muay Thai under ett decennium.", "Förberedde tävlingsidrottare för tävlingar och matcher, och utvecklade skräddarsydda tränings- och kostplaner.", "Handledde många medlemmar från nybörjare till avancerade nivåer och spelade en nyckelroll i deras långsiktiga fitnessresa."], professional: ["Behöll höga nivåer av kundlojalitet under en 10-årsperiod genom expertcoaching och stark relationsbyggnad.", "Hanterade scheman och programmering för flera discipliner, vilket säkerställde ett balanserat och omfattande gymutbud."] } },
    }
  }
};


// --- UI COMPONENTS ---

const LanguageSwitcher: React.FC<{ currentLang: keyof typeof translations; onSelectLang: (lang: keyof typeof translations) => void; }> = ({ currentLang, onSelectLang }) => (
    <div className="flex items-center bg-gray-200/80 rounded-full p-0.5 shrink-0">
      {Object.keys(translations).map((code) => (
        <button key={code} onClick={() => onSelectLang(code as keyof typeof translations)}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 ${currentLang === code ? 'bg-white text-teal-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-800'}`}
          aria-pressed={currentLang === code}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
);

const TabNavigation: React.FC<{
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  t: (typeof translations)['en']['tabs'];
}> = ({ activeTab, setActiveTab, t }) => (
    <div className="flex border-b border-gray-200">
        {(Object.keys(t) as AppTab[]).map(tabKey => (
            <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-4 py-3 text-sm sm:text-base font-semibold transition-all duration-300 border-b-2 -mb-px ${activeTab === tabKey ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
                role="tab"
                aria-selected={activeTab === tabKey}
            >
                {t[tabKey]}
            </button>
        ))}
    </div>
);

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

const CoverLetter: React.FC<{ text: string }> = ({ text }) => (
    <div className="bg-gray-100/80 rounded-lg p-4 mt-6">
        <p className="text-gray-700 italic text-base">{text}</p>
    </div>
);


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

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [language, setLanguage] = useState<keyof typeof translations>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('full');
  
  const t = useMemo(() => translations[language], [language]);

  const experiencesInLang = useMemo(() => {
    return workData.map(job => ({
        ...job,
        ...t.experience[job.id as keyof typeof t.experience]
    } as WorkExperience));
  }, [t]);

  const filteredExperiences = useMemo(() => {
    if (activeTab === 'full') return experiencesInLang;
    if (activeTab === 'fitness') {
        return experiencesInLang.filter(exp => exp.category === 'Fitness & Coaching' || exp.category === 'Management & Operations');
    }
    if (activeTab === 'professional') {
        return experiencesInLang.filter(exp => exp.category === 'Software & Tech' || exp.category === 'Management & Operations');
    }
    return [];
  }, [activeTab, experiencesInLang]);

  const displayedSkills = useMemo(() => {
    if (activeTab === 'full') return ALL_SKILLS;
    return ALL_SKILLS.filter(skill => skill.category === activeTab || skill.category === 'both');
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* --- Main Header --- */}
        <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">Ronny Christensen</h1>
            <h2 className="text-lg md:text-xl font-medium text-teal-600 mt-2">{t.headline}</h2>
            <p className="max-w-2xl mx-auto mt-4 text-gray-600">{t.summary}</p>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-gray-500 mt-6 text-sm">
                <a href={`tel:${t.contact.phone}`} className="flex items-center gap-2 hover:text-teal-600"><PhoneIcon className="h-4 w-4" /> {t.contact.phone}</a>
                <a href={`mailto:${t.contact.email}`} className="flex items-center gap-2 hover:text-teal-600"><MailIcon className="h-4 w-4" /> {t.contact.email}</a>
                <a href={`https://${t.online.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-teal-600 print-show-url"><LinkedInIcon className="h-4 w-4" /> {t.online.linkedin}</a>
            </div>
        </header>

        {/* --- Controls & Content --- */}
        <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-4 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} t={t.tabs} />
                <div className="no-print">
                    <LanguageSwitcher currentLang={language} onSelectLang={setLanguage} />
                </div>
            </div>

            {/* --- Dynamic Content Area --- */}
            <div key={activeTab} className="animate-fade-in">
                {activeTab !== 'full' && <CoverLetter text={t.coverLetters[activeTab]} />}
                <SkillsSection skills={displayedSkills} title={t.sections.skills} />
            </div>
        </div>

        {/* --- Experience Section --- */}
        <main>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.sections.experience}</h2>
            <div className="space-y-6">
                {filteredExperiences.map((exp) => (
                    <ExperienceCard
                        key={exp.id}
                        experience={exp}
                        t={t}
                    />
                ))}
            </div>
        </main>
      </div>
    </div>
  );
};

// Add fade-in animation to Tailwind styles
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
    }
`;
document.head.appendChild(style);


export default App;
