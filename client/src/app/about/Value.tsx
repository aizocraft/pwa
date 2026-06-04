'use client';

import { motion } from 'framer-motion';
import {
  Lightbulb,
  Leaf,
  Wrench,
  HeartHandshake,
} from 'lucide-react';

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "Cutting-edge technology for efficient and sustainable water pumping solutions.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    desc: "Eco-friendly practices to minimise environmental impact and promote resource management.",
  },
  {
    icon: Wrench,
    title: "Expertise",
    desc: "Experienced professionals delivering exceptional results in water and energy sectors.",
  },
  {
    icon: HeartHandshake,
    title: "Community",
    desc: "Partnering with local communities to address specific needs with lasting solutions.",
  },
];

export default function Value() {
  return (
<section className="py-10 md:py-16 bg-[hsl(var(--background))] dark:bg-[hsl(var(--background))]">
      <div className="w-full px-4 sm:px-6 lg:px-32">
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 text-xs font-medium tracking-wider uppercase mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
          >
            Core Values
          </motion.span>
          <div className="w-12 h-0.5 bg-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base">
            The principles that guide everything we do at Plasma Water Africa
          </p>
        </motion.div>

        {/* Values Grid - Horizontal layout with side icons */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 cursor-pointer"
                  whileHover={{ x: 4 }}
                >
                  {/* Icon on the side */}
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 transition-all duration-300">
                    <Icon className="h-5 w-5 text-cyan-500 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                      {value.desc}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}