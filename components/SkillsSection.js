import { jsx as _jsx } from "react/jsx-runtime";
export const SkillsSection = ({ skills }) => {
    return (_jsx("div", { className: "flex flex-wrap gap-2", children: skills.map((skill, index) => (_jsx("span", { className: "bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full", children: skill.name }, index))) }));
};
