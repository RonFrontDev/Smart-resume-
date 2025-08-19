import React from 'react';
import type { Skill } from '../types';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={index}
          className="bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full"
        >
          {skill.name}
        </span>
      ))}
    </div>
  );
};
