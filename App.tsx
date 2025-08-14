
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { WorkExperience, AppTab, Skill, Reference } from './types';
import { MailIcon, PhoneIcon, LinkedInIcon, ChevronDownIcon, DownloadIcon, ChevronDoubleUpIcon, ChevronDoubleDownIcon, MenuIcon, XIcon } from './components/icons';
import { ExpandableTabs } from './components/ui/expandable-tabs';
import { Home, Briefcase, Code, Users } from 'lucide-react';
import html2pdf from 'html2pdf.js';

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
    name: "Ronny Christensen",
    headline: "Versatile Professional with expertise in Fitness, Management & Tech",
    summary: "A highly motivated and results-oriented professional with over 15 years of multifaceted experience spanning the fitness industry, project management, and software development. Proven ability to lead and inspire, combined with a strong background in managing operations and building digital products.",
    contact: { title: "Contact Information", phone: "+45 24 45 70 80", email: "ronnychristensen1983@gmail.com" },
    online: { linkedin: "www.linkedin.com/in/ronny-christensen-08a92957/", linkedinText: "LinkedIn" },
    tabs: { full: "Full Résumé", fitness: "Fitness", professional: "Other Professional Work", references: "References" },
    tooltips: { 
        viewContact: "View Contact Information",
        collapseAll: "Collapse All Sections",
        unfoldAll: "Unfold All Sections",
        download: "Download as PDF"
    },
    coverLetters: {
        fitness: "As a passionate and certified fitness professional with over a decade of experience, I specialize in creating dynamic, results-driven training environments. My expertise in CrossFit, strength conditioning, and community building has consistently led to increased member retention and engagement. I am eager to bring my dedication and coaching skills to a team that values performance, safety, and a thriving fitness culture.",
        professional: "A versatile and strategic professional with a unique blend of experience in project management, software development, and client relations. I have a proven track record of leading projects from concept to completion, building robust digital solutions, and managing operational logistics. I am adept at problem-solving in fast-paced environments and am seeking to apply my diverse technical and managerial skills to drive impactful results."
    },
    sections: { summary: "Summary", skills: "Skills", experience: "Experience", references: "References", achievements: { fitness: "Fitness Achievements", professional: "Professional Achievements" } },
    references: {
        title: "References available upon request",
        list: [
            { name: "John Doe", role: "Former Manager", contact: "Available upon request" },
            { name: "Jane Smith", role: "Senior Colleague", contact: "Available upon request" },
        ]
    },
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
    name: "Ronny Christensen",
    headline: "Alsidig professionel med ekspertise i fitness, ledelse & tech",
    summary: "En yderst motiveret og resultatorienteret professionel med over 15 års mangesidet erfaring, der spænder over fitnessbranchen, projektledelse og softwareudvikling. Dokumenteret evne til at lede og inspirere, kombineret med en stærk baggrund i driftsledelse og opbygning af digitale produkter.",
    contact: { title: "Kontaktinformation", phone: "+45 24 45 70 80", email: "ronnychristensen1983@gmail.com" },
    online: { linkedin: "www.linkedin.com/in/ronny-christensen-08a92957/", linkedinText: "LinkedIn" },
    tabs: { full: "Fuldt CV", fitness: "Fitness", professional: "Andet Professionelt Arbejde", references: "Referencer" },
    tooltips: { 
        viewContact: "Vis Kontaktinformation",
        collapseAll: "Fold alle sektioner sammen",
        unfoldAll: "Fold alle sektioner ud",
        download: "Download som PDF"
    },
    coverLetters: {
        fitness: "Som en passioneret og certificeret fitness-professionel med over et årtis erfaring specialiserer jeg mig i at skabe dynamiske, resultatorienterede træningsmiljøer. Min ekspertise inden for CrossFit, styrketræning og opbygning af fællesskaber har konsekvent ført til øget medlemsfastholdelse og engagement. Jeg er ivrig efter at bringe min dedikation og coachingfærdigheder til et team, der værdsætter præstation, sikkerhed og en blomstrende fitnesskultur.",
        professional: "En alsidig og strategisk professionel med en unik blanding af erfaring inden for projektledelse, softwareudvikling og kunderelationer. Jeg har en dokumenteret track record med at lede projekter fra koncept til færdiggørelse, bygge robuste digitale løsninger og styre operationel logistik. Jeg er dygtig til problemløsning i tempofyldte miljøer og søger at anvende mine forskelligartede tekniske og ledelsesmæssige færdigheder til at skabe betydningsfulde resultater."
    },
    sections: { summary: "Resumé", skills: "Kompetencer", experience: "Erfaring", references: "Referencer", achievements: { fitness: "Fitness Præstationer", professional: "Professionelle Præstationer" } },
    references: {
        title: "Referencer gives på anmodning",
        list: [
            { name: "Hans Hansen", role: "Tidligere Leder", contact: "Gives på anmodning" },
            { name: "Grete Jensen", role: "Senior Kollega", contact: "Gives på anmodning" },
        ]
    },
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
    name: "Ronny Christensen",
    headline: "Mångsidig professionell med expertis inom fitness, ledarskap & teknik",
    summary: "En högmotiverad och resultatinriktad professionell med över 15 års mångfacetterad erfarenhet som sträcker sig över fitnessindustrin, projektledning och mjukvaruutveckling. Bevisad förmåga att leda och inspirera, kombinerat med en stark bakgrund inom driftledning och att bygga digitala produkter.",
    contact: { title: "Kontaktinformation", phone: "+45 24 45 70 80", email: "ronnychristensen1983@gmail.com" },
    online: { linkedin: "www.linkedin.com/in/ronny-christensen-08a92957/", linkedinText: "LinkedIn" },
    tabs: { full: "Fullständigt CV", fitness: "Fitness", professional: "Övrigt Professionellt Arbete", references: "Referenser" },
    tooltips: { 
        viewContact: "Visa Kontaktinformation",
        collapseAll: "Fäll ihop alla sektioner",
        unfoldAll: "Fäll ut alla sektioner",
        download: "Ladda ner som PDF"
    },
    coverLetters: {
        fitness: "Som en passionerad och certifierad fitnessprofessionell med över ett decenniums erfarenhet, specialiserar jag mig på att skapa dynamiska, resultatdrivna träningsmiljöer. Min expertis inom CrossFit, styrketräning och community-byggande har konsekvent lett till ökad medlemsretention och engagemang. Jag är ivrig att bidra med mitt engagemang och mina coachingfärdigheter till ett team som värdesätter prestation, säkerhet och en blomstrande fitnesskultur.",
        professional: "En mångsidig och strategisk professionell med en unik blandning av erfarenhet inom projektledning, mjukvaruutveckling och kundrelationer. Jag har en bevisad meritlista av att leda projekt från koncept till slutförande, bygga robusta digitala lösningar och hantera operativ logistik. Jag är skicklig på problemlösning i snabba miljöer och strävar efter att tillämpa mina mångsidiga tekniska och ledande färdigheter för att driva fram betydelsefulla resultat."
    },
    sections: { summary: "Sammanfattning", skills: "Kompetenser", experience: "Erfarenhet", references: "Referenser", achievements: { fitness: "Fitnessprestationer", professional: "Professionella Prestationer" } },
    references: {
        title: "Referenser lämnas på begäran",
        list: [
            { name: "Sven Svensson", role: "Tidigare Chef", contact: "Lämnas på begäran" },
            { name: "Anna Andersson", role: "Senior Kollega", contact: "Lämnas på begäran" },
        ]
    },
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

const ControlButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean, className?: string }> = ({ onClick, title, children, disabled, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-600 transition-colors duration-300 no-print disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label={title}
        title={title}
    >
        {children}
    </button>
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
const ContactModal: React.FC<{ t: (typeof translations)['en']; onClose: () => void; }> = ({ t, onClose }) => {
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

// --- HEADER / NAVBAR COMPONENT ---
const Header: React.FC<{
  t: (typeof translations)['en'];
  language: keyof typeof translations;
  setLanguage: (lang: keyof typeof translations) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  scrolled: boolean;
  onContactClick: () => void;
  onToggleAll: () => void;
  areAllCollapsed: boolean;
  onDownload: () => void;
  isDownloading: boolean;
}> = ({ t, language, setLanguage, activeTab, setActiveTab, scrolled, onContactClick, onToggleAll, areAllCollapsed, onDownload, isDownloading }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    const handleNavClick = (tab: AppTab) => {
        setActiveTab(tab);
        setIsMenuOpen(false);
    };

    const TABS_CONFIG = useMemo(() => [
        { title: t.tabs.full, icon: Home, key: 'full' },
        { title: t.tabs.fitness, icon: Briefcase, key: 'fitness' },
        { title: t.tabs.professional, icon: Code, key: 'professional' },
        { title: t.tabs.references, icon: Users, key: 'references' },
    ], [t]);

    const handleTabSelect = (index: number) => {
        const newTabKey = TABS_CONFIG[index].key;
        setActiveTab(newTabKey as AppTab);
    };

    const selectedIndex = useMemo(() => TABS_CONFIG.findIndex(tab => tab.key === activeTab), [TABS_CONFIG, activeTab]);


    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm transition-all duration-300 no-print ${scrolled ? 'border-b border-gray-200/80 shadow-sm' : 'border-b border-transparent'}`}>
                <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <span className="text-xl font-bold text-gray-800">{t.name}</span>
                        </div>

                        <div className="hidden md:flex md:items-center">
                            <ExpandableTabs
                                tabs={TABS_CONFIG.map(({ title, icon }) => ({ title, icon }))}
                                selectedIndex={selectedIndex}
                                onSelect={handleTabSelect}
                                activeColor="text-teal-600"
                            />
                        </div>

                        <div className="hidden md:flex items-center space-x-3">
                             <div className="flex items-center space-x-1">
                                <ControlButton onClick={onContactClick} title={t.tooltips.viewContact}>
                                    <MailIcon className="h-5 w-5" />
                                </ControlButton>
                                <ControlButton onClick={onToggleAll} title={areAllCollapsed ? t.tooltips.unfoldAll : t.tooltips.collapseAll}>
                                    {areAllCollapsed ? <ChevronDoubleDownIcon className="h-5 w-5" /> : <ChevronDoubleUpIcon className="h-5 w-5" />}
                                </ControlButton>
                                <ControlButton onClick={onDownload} title={t.tooltips.download} disabled={isDownloading}>
                                    <DownloadIcon className={`h-5 w-5 ${isDownloading ? 'animate-pulse' : ''}`} />
                                </ControlButton>
                            </div>
                            <div className="w-px h-6 bg-gray-200/80" />
                            <LanguageSwitcher currentLang={language} onSelectLang={setLanguage} />
                        </div>
                        
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:bg-gray-100"
                                aria-expanded={isMenuOpen}
                                aria-label="Open main menu"
                            >
                                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            <div className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-lg transition-transform duration-300 ease-in-out md:hidden no-print ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="pt-20 px-4 flex flex-col items-center space-y-6">
                     {(Object.keys(t.tabs) as AppTab[]).map(tabKey => (
                        <button
                            key={tabKey}
                            onClick={() => handleNavClick(tabKey)}
                            className={`block w-full text-center py-3 rounded-md text-lg font-medium transition-colors duration-200 ${activeTab === tabKey ? 'text-teal-600 bg-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                            aria-current={activeTab === tabKey ? 'page' : undefined}
                        >
                            {t.tabs[tabKey]}
                        </button>
                    ))}
                    <div className="border-t border-gray-200 w-full my-4"></div>
                    <LanguageSwitcher currentLang={language} onSelectLang={setLanguage} className="w-full justify-center p-1" />
                    <div className="flex items-center justify-center space-x-4">
                        <ControlButton onClick={onContactClick} title={t.tooltips.viewContact}>
                            <MailIcon className="h-6 w-6" />
                        </ControlButton>
                        <ControlButton onClick={onToggleAll} title={areAllCollapsed ? t.tooltips.unfoldAll : t.tooltips.collapseAll}>
                            {areAllCollapsed ? <ChevronDoubleDownIcon className="h-6 w-6" /> : <ChevronDoubleUpIcon className="h-6 w-6" />}
                        </ControlButton>
                        <ControlButton onClick={onDownload} title={t.tooltips.download} disabled={isDownloading}>
                            <DownloadIcon className={`h-6 w-6 ${isDownloading ? 'animate-pulse' : ''}`} />
                        </ControlButton>
                    </div>
                </div>
            </div>
        </>
    );
};


// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [language, setLanguage] = useState<keyof typeof translations>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('full');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const resumeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleToggleCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const visibleSectionIds = useMemo(() => {
    if (activeTab === 'references') return ['references'];
    return ['summary', 'skills', 'experience'];
  }, [activeTab]);

  const areAllCurrentlyCollapsed = useMemo(() => 
    visibleSectionIds.every(id => !!collapsedSections[id]),
    [visibleSectionIds, collapsedSections]
  );
  
  const handleToggleAll = () => {
      const shouldCollapse = !areAllCurrentlyCollapsed;
      const newStates = { ...collapsedSections };
      visibleSectionIds.forEach(id => {
          newStates[id] = shouldCollapse;
      });
      setCollapsedSections(newStates);
  };

  const handleDownloadPdf = () => {
    const element = resumeContainerRef.current;
    if (!element || isDownloading) return;

    setIsDownloading(true);

    const originalCollapsedState = { ...collapsedSections };
    const allExpandedState: { [key: string]: boolean } = {};
    Object.keys(originalCollapsedState).forEach(key => {
        allExpandedState[key] = false;
    });
    setCollapsedSections(allExpandedState);

    setTimeout(() => {
        const filename = `Ronny_Christensen_Resume_${language.toUpperCase()}.pdf`;
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
              scale: 2, 
              useCORS: true, 
              backgroundColor: '#f8fafc'
          },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save().catch((err: any) => {
            console.error("Error generating PDF:", err);
        }).finally(() => {
            setCollapsedSections(originalCollapsedState);
            setIsDownloading(false);
        });
    }, 200);
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans transition-colors duration-300">
      <Header
        t={t}
        language={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrolled={scrolled}
        onContactClick={() => setIsContactModalOpen(true)}
        onToggleAll={handleToggleAll}
        areAllCollapsed={areAllCurrentlyCollapsed}
        onDownload={handleDownloadPdf}
        isDownloading={isDownloading}
      />

      {isContactModalOpen && <ContactModal t={t} onClose={() => setIsContactModalOpen(false)} />}
      
      <main id="resume-container" ref={resumeContainerRef} className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">{t.name}</h1>
            <h2 className="text-lg md:text-xl font-medium text-teal-600 mt-2">{t.headline}</h2>
        </header>

        <div className="animate-fade-in-up">
            <CollapsibleSection title={t.sections.summary} sectionId="summary" isCollapsed={!!collapsedSections['summary']} onToggle={handleToggleCollapse}>
                <p className="max-w-3xl text-gray-600">{t.summary}</p>
            </CollapsibleSection>

            <div key={activeTab} className="animate-fade-in">
                {activeTab !== 'references' ? (
                    <>
                        <CollapsibleSection title={t.sections.skills} sectionId="skills" isCollapsed={!!collapsedSections['skills']} onToggle={handleToggleCollapse}>
                            {activeTab !== 'full' && <CoverLetter text={t.coverLetters[activeTab]} />}
                            <SkillsSection skills={displayedSkills} title={activeTab === 'full' ? t.sections.skills : ''} />
                        </CollapsibleSection>

                        <CollapsibleSection title={t.sections.experience} sectionId="experience" isCollapsed={!!collapsedSections['experience']} onToggle={handleToggleCollapse}>
                             <div className="space-y-6">
                                {filteredExperiences.map((exp) => (
                                    <ExperienceCard key={exp.id} experience={exp} t={t} />
                                ))}
                            </div>
                        </CollapsibleSection>
                    </>
                ) : (
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

// Add fade-in animation to Tailwind styles
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
