import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  FileX, 
  Target, 
  Compass, 
  Eye, 
  Search 
} from 'lucide-react';

const problems = [
  {
    icon: FileX,
    title: 'ATS Rejection',
    description: 'Over 75% of resumes are rejected by ATS before a human ever sees them.',
    color: 'from-red-500/20 to-orange-500/20',
  },
  {
    icon: Target,
    title: 'Skill Gaps',
    description: 'Graduates often lack industry-aligned skills that employers actually need.',
    color: 'from-secondary/20 to-cyan/20',
  },
  {
    icon: Compass,
    title: 'Generic Guidance',
    description: 'Traditional career advice fails to account for individual strengths and market trends.',
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: Search,
    title: 'Overwhelming Platforms',
    description: 'Job seekers waste hours on irrelevant listings across multiple fragmented platforms.',
    color: 'from-amber-500/20 to-yellow-500/20',
  },
  {
    icon: Eye,
    title: 'No Visibility',
    description: 'Little insight into career growth trajectories or realistic salary expectations.',
    color: 'from-emerald-500/20 to-teal-500/20',
  },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            The Challenge
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Why Career Navigation is{' '}
            <span className="gradient-text">Broken</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The modern job market presents unique challenges that traditional approaches can't solve. 
            AI changes everything.
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card p-6 group cursor-default"
            >
              {/* Icon with gradient background */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${problem.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <problem.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-semibold text-primary mb-2">{problem.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Transition text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-xl text-primary font-medium">
            Ready to solve these challenges?{' '}
            <span className="gradient-text font-bold">AI Career Navigator has the answers.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
