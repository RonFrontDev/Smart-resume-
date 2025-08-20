export type WorkCategory =
  | 'Fitness Coaching'
  | 'Fitness Management'
  | 'Hospitality & Service'
  | 'Project Management'
  | 'Software Development'
  | 'Content Creation';
  
export type AppTab = 'full' | 'fitness' | 'tech' | 'management' | 'content-creation' | 'references';

export interface WorkExperience {
  id: string;
  role: string;
  company: string;
  duration: string;
  location: string;
  category: WorkCategory[];
  achievements: {
      fitness: string[];
      professional: string[];
  };
}

export interface Skill {
    name: string;
    category: 'fitness' | 'tech' | 'management' | 'content-creation' | 'both';
}

export interface Reference {
    name: string;
    role: string;
    contact: string;
}

export interface Education {
    duration: string;
    institution: string;
    location: string;
    degree: string;
}
