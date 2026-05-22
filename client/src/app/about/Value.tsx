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
    gradient: "from-violet-500 to-purple-600",
    lightBg: "from-violet-50 to-purple-50",
    iconBg: "bg-violet-100 dark:bg-violet-950",
    border: "border-violet-200 dark:border-violet-800",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    desc: "Eco-friendly practices to minimise environmental impact and promote resource management.",
    gradient: "from-emerald-500 to-green-600",
    lightBg: "from-emerald-50 to-green-50",
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    icon: Wrench,
    title: "Expertise",
    desc: "Experienced professionals delivering exceptional results in water and energy sectors.",
    gradient: "from-sky-500 to-blue-600",
    lightBg: "from-sky-50 to-blue-50",
    iconBg: "bg-sky-100 dark:bg-sky-950",
    border: "border-sky-200 dark:border-sky-800",
  },
  {
    icon: HeartHandshake,
    title: "Community",
    desc: "Partnering with local communities to address specific needs with lasting solutions.",
    gradient: "from-orange-500 to-amber-600",
    lightBg: "from-orange-50 to-amber-50",
    iconBg: "bg-orange-100 dark:bg-orange-950",
    border: "border-orange-200 dark:border-orange-800",
  },
];

export default function Value() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-950 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4 border border-cyan-200 dark:border-cyan-800"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Lightbulb size={12} /> Core Principles
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            Our Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">Values</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            The principles that guide everything we do at Plasma Water Africa
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <motion.div
                  className={`relative h-full rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer bg-gradient-to-br ${value.lightBg} dark:bg-gray-900/50 border ${value.border} hover:shadow-2xl`}
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Animated gradient overlay on hover */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Icon Container */}
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:shadow-2xl transition-all duration-300`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="h-8 w-8 text-white" strokeWidth={1.5} />
                  </motion.div>

                  {/* Title */}
                  <h3 className={`text-xl font-black mb-3 bg-gradient-to-r ${value.gradient} bg-clip-text text-transparent`}>
                    {value.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {value.desc}
                  </p>

                  {/* Decorative Line */}
                  <motion.div
                    className={`h-0.5 w-12 bg-gradient-to-r ${value.gradient} mx-auto mt-4 rounded-full group-hover:w-20 transition-all duration-300`}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Row */}
        <motion.div
          className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Years of Excellence", value: "15+" },
              { label: "Happy Clients", value: "1000+" },
              { label: "Projects Delivered", value: "500+" },
              { label: "Team Members", value: "50+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.p
                  className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}