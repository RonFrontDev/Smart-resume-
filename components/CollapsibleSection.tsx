import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from './icons';
import { cn } from '../lib/utils';

interface CollapsibleSectionProps {
  sectionId: string;
  title: string;
  isCollapsed: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  sectionId,
  title,
  isCollapsed,
  onToggle,
  children,
}) => {
  return (
    <section className="max-w-7xl mx-auto mb-6 print-section print-expand animate-fade-in-up">
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
        <button
          className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-t-xl"
          onClick={() => onToggle(sectionId)}
          aria-expanded={!isCollapsed}
          aria-controls={`content-${sectionId}`}
        >
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <ChevronDownIcon
            className={cn(
              'h-6 w-6 text-gray-500 transition-transform duration-300 collapsible-icon',
              !isCollapsed && 'rotate-180'
            )}
          />
        </button>
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              id={`content-${sectionId}`}
              key="content"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="collapsible-content overflow-hidden"
            >
              <div className="p-4 pt-0">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
