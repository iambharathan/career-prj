import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  FileUp, 
  Brain, 
  GitBranch, 
  BookOpen,
  Briefcase,
  Sparkles,
  ArrowDown
} from 'lucide-react';

const journeySteps = [
  {
    icon: FileUp,
    title: 'Resume Upload',
    description: 'Start by uploading your existing resume or enter your skills and experience manually.',
    color: 'bg-primary',
  },
  {
    icon: Brain,
    title: 'NLP Processing',
    description: 'Our AI parses and understands your background using advanced natural language processing.',
    color: 'bg-navy-light',
  },
  {
    icon: GitBranch,
    title: 'Skill Matching',
    description: 'Semantic similarity algorithms compare your skills against target roles and industry requirements.',
    color: 'bg-secondary',
  },
  {
    icon: BookOpen,
    title: 'Learning Path',
    description: 'AI generates personalized recommendations to bridge skill gaps with optimal learning resources.',
    color: 'bg-cyan',
  },
  {
    icon: Briefcase,
    title: 'Job Matching',
    description: 'Smart job matching finds opportunities aligned with your profile and career goals.',
    color: 'bg-secondary',
  },
  {
    icon: Sparkles,
    title: 'Content Generation',
    description: 'Generate ATS-optimized resumes and personalized cover letters for each opportunity.',
    color: 'bg-primary',
  },
];

const CareerJourneySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="journey" className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan/5 rounded-full blur-3xl" />
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
            AI Architecture
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Your Career{' '}
            <span className="gradient-text">Journey Flow</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how our AI transforms your career path through intelligent processing and personalized recommendations.
          </p>
        </motion.div>

        {/* Journey Flow */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-cyan md:transform md:-translate-x-1/2" />

            {journeySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex items-center gap-6 mb-8 last:mb-0 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-background border-4 border-secondary transform -translate-x-1/2 z-10" />

                {/* Card */}
                <div className={`flex-1 ml-16 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 inline-block"
                  >
                    <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-medium text-secondary uppercase tracking-wider">Step {index + 1}</span>
                        <h3 className="text-lg font-bold text-primary">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </motion.div>
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Techniques Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Powered by advanced AI techniques</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Natural Language Processing', 'Semantic Similarity', 'Recommendation Systems', 'Generative AI'].map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CareerJourneySection;
