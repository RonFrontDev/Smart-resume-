import React from 'react';
import type { WorkExperience } from '../types';
import { translations } from '../i18n';
import { Dumbbell, Briefcase } from 'lucide-react';

interface ExperienceCardProps {
  experience: WorkExperience;
  t: (typeof translations)['en'];
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, t }) => {
  const hasFitnessAchievements = experience.achievements.fitness.length > 0;
  const hasProfessionalAchievements = experience.achievements.professional.length > 0;

  return (
    <div className="bg-gray-50/80 p-4 rounded-lg border-l-4 border-orange-400 transition-shadow hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-bold text-gray-800">{experience.role}</h4>
          <p className="text-md font-semibold text-orange-700">{experience.company}</p>
        </div>
        <div className="text-right text-sm text-gray-500 flex-shrink-0 pl-4">
          <p>{experience.duration}</p>
          <p>{experience.location}</p>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {hasFitnessAchievements && (
          <div>
            <h5 className="flex items-center gap-2 font-semibold text-gray-600 mb-2">
              <Dumbbell size={16} className="text-orange-500" />
              <span>{t.sections.achievements.fitness}</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-700">
              {experience.achievements.fitness.map((ach, index) => (
                <li key={`fit-${index}`}>{ach}</li>
              ))}
            </ul>
          </div>
        )}
        {hasProfessionalAchievements && (
          <div>
            <h5 className="flex items-center gap-2 font-semibold text-gray-600 mb-2">
              <Briefcase size={16} className="text-blue-500" />
              <span>{t.sections.achievements.professional}</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-700">
              {experience.achievements.professional.map((ach, index) => (
                <li key={`prof-${index}`}>{ach}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
