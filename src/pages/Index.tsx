import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Upload, Target, TrendingUp, LayoutDashboard } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Career Agent - From Resume to Real Employment</title>
        <meta name="description" content="Your personal AI mentor guiding you from resume creation to job success. Get ATS-optimized resumes, skill gap analysis, and personalized career paths." />
        <meta name="keywords" content="AI resume, career guidance, ATS optimization, job matching, skill gap analysis, career agent" />
        <link rel="canonical" href="https://aicareernavigator.com" />
        <meta property="og:title" content="Career Agent - From Resume to Real Employment" />
        <meta property="og:description" content="Transform your career with AI-powered resume optimization, skill gap analysis, and intelligent job matching." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl">
              <Bot className="w-10 h-10 text-primary-foreground" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-primary mb-6"
          >
            Career <span className="text-primary/80 font-extrabold">Agent</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Your AI-powered career co-pilot. Analyze your resume, identify skill gaps, and get a personalized 30-day learning roadmap.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16 flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/resume-screening"
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-primary-foreground bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Upload className="w-6 h-6" />
              Start Your Career Analysis
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold text-primary bg-white border-2 border-primary rounded-full shadow-lg hover:shadow-xl hover:bg-primary/5 transform hover:scale-105 transition-all duration-300"
            >
              <LayoutDashboard className="w-6 h-6" />
              Go to Dashboard
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="glass-card p-6">
              <Upload className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold text-primary mb-2">Upload Resume</h3>
              <p className="text-sm text-muted-foreground">AI-powered resume analysis</p>
            </div>
            <div className="glass-card p-6">
              <Target className="w-8 h-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold text-primary mb-2">Find Skill Gaps</h3>
              <p className="text-sm text-muted-foreground">Identify missing skills</p>
            </div>
            <div className="glass-card p-6">
              <TrendingUp className="w-8 h-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold text-primary mb-2">30-Day Roadmap</h3>
              <p className="text-sm text-muted-foreground">Personalized learning path</p>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Index;
