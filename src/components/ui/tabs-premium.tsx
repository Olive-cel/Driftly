"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: Record<string, ReactNode>;
}

export function Tabs({ tabs, defaultTab = tabs[0].id, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="w-full">
      {/* Tab List */}
      <div className="flex gap-8 border-b border-neutral-200/50 overflow-x-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 flex items-center gap-2 ${
              activeTab === tab.id
                ? "text-amber-600"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="mt-8"
      >
        {children[activeTab]}
      </motion.div>
    </div>
  );
}
