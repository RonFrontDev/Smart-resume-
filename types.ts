export type WorkCategory = 'Fitness & Coaching' | 'Management & Operations' | 'Software & Tech';
export type AppTab = 'full' | 'fitness' | 'professional';

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
    category: 'fitness' | 'professional' | 'both';
}
