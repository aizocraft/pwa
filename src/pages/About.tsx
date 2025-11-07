// src/pages/About.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Target,
  Eye,
  Users,
  Plus,
  Minus,
  Star,
  Download,
  X,
  Sparkles,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";

/* --------------------------------------------------------------
   PDF metadata – put your file in /public/profile.pdf
   -------------------------------------------------------------- */
const profilePdf = {
  url: "/profile.pdf",               // <-- must be in public/
  name: "Plasma_Water_Africa_Profile.pdf",
  size: "2.5 MB",
  lastUpdated: "October 2025",
};

/* --------------------------------------------------------------
   Data
   -------------------------------------------------------------- */
const values = [
  { icon: Award, title: "Excellence",   desc: "Highest standards in every installation", gradient: "from-blue-500 to-cyan-500" },
  { icon: Target, title: "Sustainability", desc: "Eco-friendly, long-lasting solutions", gradient: "from-emerald-500 to-green-500" },
  { icon: Eye,    title: "Innovation",   desc: "Cutting-edge technology", gradient: "from-purple-500 to-pink-500" },
  { icon: Users,  title: "Community",   desc: "Empowering African communities", gradient: "from-orange-500 to-red-500" },
];

const faqs = [
  { q: "What services do you offer?", a: "Borehole drilling, solar, water treatment, generators, irrigation." },
  { q: "How can I contact you?", a: "Contact form, phone, or email – we're always ready." },
  { q: "What areas do you serve?", a: "Multiple African countries, rural & urban." },
  { q: "What makes you different?", a: "Sustainability, innovation, community focus." },
  { q: "Do you offer custom solutions?", a: "Yes – tailored for efficiency & value." },
];

/* --------------------------------------------------------------
   Component
   -------------------------------------------------------------- */
const About = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [downProg, setDownProg] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const toggleFAQ = (i: number) => setOpenIdx(openIdx === i ? null : i);

  const startDownload = () => {
    setDownloading(true);
    setDownProg(0);
    const int = setInterval(() => {
      setDownProg((p) => {
        if (p >= 100) {
          clearInterval(int);
          setDownloading(false);
          const a = document.createElement("a");
          a.href = profilePdf.url;
          a.download = profilePdf.name;
          a.click();
          return 100;
        }
        return p + 10;
      });
    }, 100);
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.25 } },
  };

  const PdfDownloadCard = () => (
    <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50 rounded-2xl p-5 sm:p-6 border border-blue-200/50 dark:border-blue-800/50 shadow-xl">
      {/* Header */}
      <div className="text-center mb-5">
        <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500 dark:text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-1">{profilePdf.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300">
          {profilePdf.size} • Updated {profilePdf.lastUpdated}
        </p>
      </div>

      {/* Download progress */}
      {downloading && (
        <div className="mb-5">
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground dark:text-gray-300 mb-1.5">
            <span>Downloading…</span>
            <span>{downProg}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${downProg}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={startDownload}
          disabled={downloading}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Downloading…
            </>
          ) : (
            <>
              <Download size={16} />
              Download PDF
            </>
          )}
        </motion.button>

        <motion.button
          onClick={() => window.open(profilePdf.url, "_blank")}
          className="px-5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-foreground dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink size={16} />
          Open
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-950 dark:to-cyan-900">
      <Navbar />

      {/* HERO */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <motion.div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }} />
          <motion.div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="max-w-6xl mx-auto text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
              About Us
            </h1>
            
            <motion.button
              onClick={() => setModalOpen(true)}
              className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText size={20} />
              View Company Profile
            </motion.button>
          </motion.div>

          {/* Vision / Mission */}
          <motion.div className="grid lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mt-12 md:mt-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {[
              { 
                icon: Eye, 
                title: "Vision", 
                text: "To be a global leader in sustainable water and energy solutions, pioneering innovative technologies and practices to ensure equitable access to clean water for all community groups.", 
                color: "cyan" 
              },
              { 
                icon: Target, 
                title: "Mission", 
                text: "To leverage the power of innovative water and energy systems to address the urgent challenges of water scarcity, particularly in Africa through deployment of cutting edge technology, sustainable practices and community engagement.", 
                color: "emerald" 
              },
            ].map((c, i) => (
              <motion.div key={i} className="group relative" whileHover={{ scale: 1.02 }}>
                <div className={`absolute -inset-1 bg-gradient-to-r from-${c.color}-600 to-${c.color}-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300`} />
                <Card className="relative bg-gradient-to-br from-gray-800 to-blue-900 border-none shadow-xl">
                  <CardContent className="p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${c.color}-500 to-${c.color}-600 flex items-center justify-center`}>
                        <c.icon className="h-6 w-6" />
                      </div>
                      <h2 className={`text-xl font-bold bg-gradient-to-r from-${c.color}-300 to-${c.color}-300 bg-clip-text text-transparent`}>Our {c.title}</h2>
                    </div>
                    <p className="text-white/90 leading-relaxed">{c.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg className="w-full h-16 md:h-24 lg:h-32 text-gray-50 dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" />
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" />
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12 md:mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-4">
              <Sparkles size={16} /> OUR PRINCIPLES
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground dark:text-white mb-4">
              Core <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Values</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={i} className="group relative" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${v.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300`} />
                  <Card className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg group-hover:shadow-xl h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-600 group-hover:bg-clip-text transition-all">
                        {v.title}
                      </h3>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">{v.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ + FEEDBACK */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl">
          {/* FAQ */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center lg:text-left mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-4">
                <Sparkles size={16} /> SUPPORT
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground dark:text-white mb-4">
                Frequently Asked <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((f, i) => (
                <motion.div
                  key={i}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <button
                    onClick={() => toggleFAQ(i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="font-semibold text-foreground dark:text-white text-base pr-6">{f.q}</span>
                    <motion.div
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center"
                      animate={{ rotate: openIdx === i ? 180 : 0 }}
                    >
                      {openIdx === i ? <Minus size={16} className="text-white" /> : <Plus size={16} className="text-white" />}
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openIdx === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 text-muted-foreground dark:text-gray-300 bg-white/30 dark:bg-gray-700/30 border-t border-gray-100/50 dark:border-gray-600/50"
                      >
                        {f.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FEEDBACK */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center lg:text-left mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-semibold mb-4">
                <Star size={16} /> FEEDBACK
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground dark:text-white mb-4">
                Share Your <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Experience</span>
              </h2>
            </div>

            <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={28}
                        className={`cursor-pointer transition-all ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                        onClick={() => setRating(s)}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">Rate your experience</p>
                </div>

                <form className="space-y-4">
                  <textarea rows={4} className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500" placeholder="Your feedback…" />
                  <select className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-cyan-500">
                    <option>Service Quality</option>
                    <option>Support</option>
                    <option>Pricing</option>
                  </select>
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold">
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* PDF MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-white" />
                  <h3 className="text-lg font-bold text-white">Company Profile</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <PdfDownloadCard />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default About;