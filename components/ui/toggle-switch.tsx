import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  className,
  size = 'md',
}) => {
  const switchVariants: Variants = {
    checked: {
      backgroundColor: 'rgb(234 88 12)', // orange-600
      transition: { duration: 0.2 }
    },
    unchecked: {
      backgroundColor: 'rgb(229 231 235)', // gray-200
      transition: { duration: 0.2 }
    }
  };

  const knobVariants: Variants = {
    checked: {
      x: size === 'md' ? 20 : 16,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
    unchecked: {
      x: 0,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    }
  };

  return (
    <motion.div
      initial={false}
      animate={checked ? 'checked' : 'unchecked'}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex flex-shrink-0 rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500',
        size === 'md' ? 'h-6 w-11' : 'h-5 w-9',
        className
      )}
      variants={switchVariants}
      role="switch"
      aria-checked={checked}
      id={id}
    >
      <span className="sr-only">Use setting</span>
      <motion.span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
           size === 'md' ? 'h-5 w-5 m-0.5' : 'h-4 w-4 m-0.5'
        )}
        variants={knobVariants}
        layout
      />
    </motion.div>
  );
};
