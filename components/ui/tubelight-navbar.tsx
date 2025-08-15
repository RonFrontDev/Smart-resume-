

import React from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

// This component has been adapted for a Single-Page Application (SPA).
// It's a controlled component that uses `name` as a unique key and `title` for display.

export interface NavItem {
  name: string // Unique identifier, e.g., 'full'
  title: string // Display text, e.g., 'Full Résumé'
  url: string // Not used in this SPA implementation, but kept for consistency
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeTab: string
  onTabChange: (tabName: string) => void
  children?: React.ReactNode // Allow passing extra controls
}

export function NavBar({ items, className, activeTab, onTabChange, children }: NavBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 sm:top-4 left-1/2 -translate-x-1/2 z-50 no-print",
        className
      )}
    >
      <div className="flex items-center gap-2 bg-white/60 border border-gray-200/80 backdrop-blur-lg p-1 rounded-full shadow-lg">
        <nav aria-label="Main navigation">
          <div className="flex items-center gap-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.name

              return (
                <button
                  key={item.name}
                  onClick={() => onTabChange(item.name)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500",
                    "text-gray-600",
                    isActive ? "text-teal-700" : "hover:text-teal-600 hover:bg-gray-100/70"
                  )}
                  aria-pressed={isActive}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span className="hidden md:inline">{item.title}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 w-full bg-teal-500/10 rounded-full -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-teal-500 rounded-t-full">
                        <div className="absolute w-12 h-6 bg-teal-500/20 rounded-full blur-md -top-2 -left-2" />
                        <div className="absolute w-8 h-6 bg-teal-500/20 rounded-full blur-md -top-1" />
                        <div className="absolute w-4 h-4 bg-teal-500/20 rounded-full blur-sm top-0 left-2" />
                      </div>
                    </motion.div>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
        {children}
      </div>
    </div>
  )
}