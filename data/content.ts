import type { Skill, WorkExperience } from '../types';

export const ALL_SKILLS: Skill[] = [
    // Fitness
    { name: 'CrossFit Coaching', category: 'fitness' },
    { name: 'Strength & Conditioning', category: 'fitness' },
    { name: 'Boxing Instruction', category: 'fitness' },
    { name: 'HIIT Programming', category: 'fitness' },
    { name: 'Athlete Development', category: 'fitness' },
    { name: 'Community Building', category: 'fitness' },
    // Tech
    { name: 'JavaScript / TypeScript', category: 'tech' },
    { name: 'React', category: 'tech' },
    { name: 'Node.js', category: 'tech' },
    { name: 'HTML & CSS', category: 'tech' },
    { name: 'Full-Stack Development', category: 'tech' },
    { name: 'UI/UX Design', category: 'tech' },
    // Management
    { name: 'Project Management', category: 'management' },
    { name: 'Operations Management', category: 'management' },
    { name: 'Team Leadership', category: 'management' },
    { name: 'Financial Oversight', category: 'management' },
    { name: 'Strategic Planning', category: 'management' },
    { name: 'Client Relations', category: 'management' },
    // Content Creation
    { name: 'Social Media Strategy', category: 'content-creation' },
    { name: 'Content Production', category: 'content-creation' },
    { name: 'Video Editing', category: 'content-creation' },
    { name: 'Copywriting', category: 'content-creation' },
    { name: 'Brand Awareness', category: 'content-creation' },
    { name: 'Community Engagement', category: 'content-creation' },
];

const baseWorkData: Omit<WorkExperience, 'role' | 'achievements'>[] = [
    { id: 'kraftvrk', company: 'Kraftværk Gym', duration: '2023 - Present', location: 'Copenhagen, Denmark', category: ['Fitness Coaching', 'Content Creation'] },
    { id: 'bookingboard', company: 'Bookingboard (Freelance)', duration: '2020 - 2021', location: 'Remote', category: ['Software Development'] },
    { id: 'apollo', company: 'Apollo Rejser / Playitas Resort', duration: '2015 - 2017', location: 'Fuerteventura, Spain', category: ['Fitness Coaching', 'Hospitality & Service'] },
    { id: 'artesuave', company: 'Arte Suave', duration: '2014 - Present', location: 'Copenhagen, Denmark', category: ['Fitness Coaching', 'Content Creation'] },
    { id: 'formfit', company: 'Form & Fit', duration: '2014 - 2015', location: 'Copenhagen, Denmark', category: ['Fitness Coaching'] },
    { id: 'sats', company: 'SATS', duration: '2013 - 2014', location: 'Copenhagen, Denmark', category: ['Fitness Coaching'] },
    { id: 'fitnessx', company: 'Fitness X', duration: '2013 - 2014', location: 'Copenhagen, Denmark', category: ['Fitness Coaching'] },
    { id: 'cf2400', company: 'CrossFit Copenhagen', duration: '2012 - 2018', location: 'Copenhagen, Denmark', category: ['Fitness Management', 'Fitness Coaching', 'Content Creation'] },
    { id: 'mclernons', company: 'McLernons Auctioneers', duration: '2010 - 2012', location: 'Belfast, Northern Ireland', category: ['Project Management'] },
    { id: 'csa', company: 'CSA.dk', duration: '2004 - 2014', location: 'Copenhagen, Denmark', category: ['Fitness Coaching'] },
];

export const workData: WorkExperience[] = baseWorkData.map(job => ({
    ...job,
    role: '', // These will be populated from i18n files
    achievements: { fitness: [], professional: [] },
}));