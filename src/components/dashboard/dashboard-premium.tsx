"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Plane,
  MapPin,
  Calendar,
  Compass,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { card, typography } from "@/lib/design-system";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPremium() {
  const stats = [
    { label: "Voyages créés", value: "12", icon: Plane, color: "from-blue-500 to-blue-600" },
    { label: "Destinations", value: "18", icon: MapPin, color: "from-purple-500 to-purple-600" },
    { label: "Jours planifiés", value: "184", icon: Calendar, color: "from-pink-500 to-pink-600" },
    { label: "Économies", value: "€4,200", icon: TrendingUp, color: "from-green-500 to-green-600" },
  ];

  const inspirations = [
    { title: "Tokyo moderne", image: "https://images.unsplash.com/photo-1540959375944-7049f642e9a4?w=600&h=400&fit=crop", region: "Japon" },
    { title: "Paris romantique", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop", region: "France" },
    { title: "Bali tropical", image: "https://images.unsplash.com/photo-1501585046305-8d34f67e9e9d?w=600&h=400&fit=crop", region: "Indonésie" },
    { title: "NYC urbaine", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop", region: "États-Unis" },
  ];

  return (
    <motion.div
      className="ml-64 min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <motion.section
        className="relative px-8 py-16 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={itemVariants} className="space-y-4 mb-8">
            <h1 className={`${typography.h1} text-blue-900`}>
              Explorez le monde avec Driftly
            </h1>
            <p className={`${typography.body} max-w-2xl text-neutral-600`}>
              Planifiez vos voyages de rêve avec l&apos;aide de l&apos;IA. Créez des itinéraires uniques,
              découvrez des destinations cachées et vivez des expériences inoubliables.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4">
            <Link href="/dashboard/trips/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg text-white px-8 py-3 rounded-lg font-semibold flex gap-2 items-center">
                <Compass className="w-5 h-5" />
                Créer un voyage
              </Button>
            </Link>
            <Link href="/dashboard/trips">
              <Button variant="outline" className="px-8 py-3 rounded-lg font-semibold flex gap-2 items-center">
                Mes voyages
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 variants={itemVariants} className={`${typography.h3} mb-8`}>
            Votre activité
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)" }}
                className={`${card.premium} p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</p>
                <p className="text-sm text-neutral-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Inspiration Section */}
      <motion.section
        className="px-8 py-12 bg-gradient-to-r from-blue-50 to-purple-50"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="space-y-2 mb-8" variants={itemVariants}>
            <h2 className={`${typography.h3}`}>Inspiration</h2>
            <p className={`${typography.body} text-neutral-600`}>
              Découvrez les destinations les plus populaires et laissez-vous inspirer
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {inspirations.map((inspiration) => (
              <motion.div
                key={inspiration.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <div className={`${card.premium} overflow-hidden h-64 relative`}>
                  <img
                    src={inspiration.image}
                    alt={inspiration.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg">{inspiration.title}</h3>
                    <p className="text-sm text-white/80">{inspiration.region}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="px-8 py-16"
        variants={itemVariants}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-2xl mx-auto text-center space-y-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold">
            Prêt à explorer le monde ?
          </h2>
          <p className="text-lg text-white/90">
            Créez votre premier voyage dès maintenant et laissez l'IA vous créer un itinéraire parfait
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/dashboard/trips/new">
              <Button className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-3 rounded-lg font-semibold">
                Commencer →
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}
