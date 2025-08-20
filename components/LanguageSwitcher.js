import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDownIcon } from './icons';
export const LanguageSwitcher = ({ currentLang, onSelectLang }) => {
    return (_jsxs("div", { className: "relative", children: [_jsxs("select", { value: currentLang, onChange: (e) => onSelectLang(e.target.value), className: "appearance-none bg-transparent cursor-pointer font-semibold text-gray-600 hover:text-gray-800 focus:outline-none pr-6 py-2", "aria-label": "Select language", children: [_jsx("option", { value: "en", children: "EN" }), _jsx("option", { value: "da", children: "DA" }), _jsx("option", { value: "sv", children: "SV" })] }), _jsx(ChevronDownIcon, { className: "absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" })] }));
};
