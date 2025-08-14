export type WorkCategory = 'Fitness & Coaching' | 'Management & Operations' | 'Software & Tech';
export type AppTab = 'full' | 'fitness' | 'tech' | 'management' | 'references';

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  duration: string;
  location: string;
  category: WorkCategory;
  achievements: {
      fitness: string[];
      professional: string[];
  };
}

export interface Skill {
    name: string;
    category: 'fitness' | 'tech' | 'management' | 'both';
}

export interface Reference {
    name: string;
    role: string;
    contact: string;
}