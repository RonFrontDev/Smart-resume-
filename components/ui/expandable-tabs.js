"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
const buttonVariants = {
    initial: {
        gap: 0,
        paddingLeft: ".5rem",
        paddingRight: ".5rem",
    },
    animate: (isSelected) => ({
        gap: isSelected ? ".5rem" : 0,
        paddingLeft: isSelected ? "1rem" : ".5rem",
        paddingRight: isSelected ? "1rem" : ".5rem",
    }),
};
const spanVariants = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "auto", opacity: 1 },
    exit: { width: 0, opacity: 0 },
};
const transition = { delay: 0.1, type: "spring", bounce: 0, duration: 0.6 };
export function ExpandableTabs({ tabs, selectedIndex, onSelect, className, activeColor = "text-primary", }) {
    const Separator = () => (_jsx("div", { className: "mx-1 h-[24px] w-[1.2px] bg-border", "aria-hidden": "true" }));
    return (_jsx("div", { className: cn("flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-sm", className), children: tabs.map((tab, index) => {
            if (!("title" in tab)) {
                return _jsx(Separator, {}, `separator-${index}`);
            }
            const Icon = tab.icon;
            return (_jsxs(motion.button, { variants: buttonVariants, initial: false, animate: "animate", custom: selectedIndex === index, onClick: () => onSelect(selectedIndex === index ? null : index), transition: transition, className: cn("relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300", selectedIndex === index
                    ? cn("bg-gray-100", activeColor)
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"), children: [_jsx(Icon, { size: 20 }), _jsx(AnimatePresence, { initial: false, children: selectedIndex === index && (_jsx(motion.span, { variants: spanVariants, initial: "initial", animate: "animate", exit: "exit", transition: transition, className: "overflow-hidden", children: tab.title })) })] }, tab.title));
        }) }));
}
