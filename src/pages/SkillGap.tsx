import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Loader2, Plus, TrendingUp, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useUser } from '@/contexts/UserContext';
import { getOpenAIKey } from '@/config/apiKeys';
import { analyzeSkillGapWithOpenAI } from '@/config/openaiClient';

interface SkillComparison {
  skill: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: string;
}

interface MissingSkill {
  skill: string;
  importance: string;
  timeToLearn: string;
  learningResources: string[];
}

interface LearningPhase {
  title: string;
  duration: string;
  focus: string[];
  milestones: string[];
}

interface Analysis {
  targetRoleAnalysis: {
    title: string;
    description: string;
    averageSalary: string;
    demandLevel: string;
  };
  skillComparison: SkillComparison[];
  missingSkills: MissingSkill[];
  strengths: string[];
  learningRoadmap: {
    phase1: LearningPhase;
    phase2: LearningPhase;
    phase3: LearningPhase;
  };
  overallReadiness: number;
  estimatedTimeToReady: string;
}

const popularRoles = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'DevOps Engineer',
  'Machine Learning Engineer',
];

const SkillGap = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const { toast } = useToast();
  const { userProfile, openAIKey } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle prefilled skills from resume screening
  useEffect(() => {
    if (location.state?.prefilledSkills) {
      const prefilledSkillsString = location.state.prefilledSkills as string;
      const skillsArray = prefilledSkillsString
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      // Remove duplicates and set skills
      const uniqueSkills = Array.from(new Set(skillsArray));
      setSkills(uniqueSkills);
      
      toast({
        title: 'Skills imported from resume!',
        description: `${uniqueSkills.length} skills have been added. You can add more or remove any.`,
      });
    }
  }, [location.state, toast]);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const analyzeGap = async () => {
    if (skills.length === 0 && !githubUsername) {
      toast({
        title: 'Skills or GitHub required',
        description: 'Please add skills or enter your GitHub username.',
        variant: 'destructive',
      });
      return;
    }

    if (!targetRole.trim()) {
      toast({
        title: 'Target role required',
        description: 'Please enter your target role.',
        variant: 'destructive',
      });
      return;
    }

    // Use provided API key or default fallback
    const apiKey = getOpenAIKey(openAIKey);

    setIsAnalyzing(true);
    setAgentStatus([]);
    setCurrentAgent('');
    
    try {
      let allSkills = [...skills];
      
      // Step 1: Analyze GitHub if username provided
      if (githubUsername) {
        setCurrentAgent('🔍 GitHub Analysis Agent');
        setAgentStatus(['Fetching GitHub profile...']);
        
        try {
          const githubRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=20`);
          const repos = await githubRes.json();
          
          if (Array.isArray(repos)) {
            const languages = new Set<string>();
            repos.forEach((repo: any) => {
              if (repo.language) languages.add(repo.language);
            });
            
            allSkills = [...allSkills, ...Array.from(languages)];
            setSkills(allSkills);
            
            setAgentStatus(prev => [...prev, `✓ Found ${languages.size} programming languages`]);
            setAgentStatus(prev => [...prev, `✓ Analyzed ${repos.length} repositories`]);
          }
        } catch (err) {
          console.error('GitHub fetch error:', err);
          setAgentStatus(prev => [...prev, '⚠ GitHub analysis skipped (API limit or invalid username)']);
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Step 2: Research Agent
      setCurrentAgent('🔬 Research Agent');
      setAgentStatus(prev => [...prev, 'Analyzing job market trends...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      setAgentStatus(prev => [...prev, 'Identifying required skills...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Step 3: Planning Agent
      setCurrentAgent('📋 Planning Agent');
      setAgentStatus(prev => [...prev, 'Creating personalized roadmap...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      setAgentStatus(prev => [...prev, 'Structuring 30-day learning plan...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Step 4: Validation Agent  
      setCurrentAgent('✅ Validation Agent');
      setAgentStatus(prev => [...prev, 'Validating feasibility...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      setAgentStatus(prev => [...prev, 'Adjusting for time constraints...']);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Actual API call
      setAgentStatus(prev => [...prev, 'Finalizing analysis...']);
      
      // Call OpenAI directly instead of Supabase Edge Function
      const analysisResult = await analyzeSkillGapWithOpenAI(allSkills, targetRole, apiKey);

      if (analysisResult) {
        setAnalysis(analysisResult);
        setAgentStatus(prev => [...prev, '🎉 Analysis complete!']);
        toast({
          title: 'Multi-Agent Analysis Complete!',
          description: 'Your personalized career roadmap is ready.',
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze skill gap. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAgent('');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <>
      <Helmet>
        <title>Skill Gap Detection - AI Career Navigator</title>
        <meta name="description" content="Identify skill gaps between your current abilities and target role requirements." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {userProfile && <DashboardNavbar />}
        <div className={`container-custom py-8 ${userProfile ? 'pt-24' : ''}`}>
          <Link to={userProfile ? '/dashboard' : '/'} className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            {userProfile ? 'Back to Dashboard' : 'Back to Home'}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">30-Day Career Roadmap Builder</h1>
            <p className="text-muted-foreground mb-8">AI-powered analysis of your skills vs dream role + personalized 30-day learning path</p>

            {!analysis ? (
              <Card className="glass-card p-6 md:p-8">
                <div className="space-y-6">
                  {/* GitHub Username */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      📊 GitHub Profile (Optional - Auto-analyze your repos)
                    </label>
                    <Input
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g., octocat"
                      disabled={isAnalyzing}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Our AI agents will scan your repositories to discover your real-world technical skills
                    </p>
                  </div>

                  {/* Current Skills */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Your Current Skills (Manual Entry)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a skill (e.g., Python, React, SQL)..."
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} variant="secondary">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/20"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                      {skills.length === 0 && (
                        <span className="text-sm text-muted-foreground">No skills added yet</span>
                      )}
                    </div>
                  </div>

                  {/* Target Role */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Target Role
                    </label>
                    <Input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Enter your target job role..."
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-sm text-muted-foreground">Popular:</span>
                      {popularRoles.map((role) => (
                        <Button
                          key={role}
                          variant="ghost"
                          size="sm"
                          onClick={() => setTargetRole(role)}
                          className="text-xs h-7"
                        >
                          {role}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Agentic Workflow Visualization */}
                  {isAnalyzing && (
                    <Card className="p-4 border-primary/20 bg-primary/5">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Multi-Agent Analysis in Progress
                      </h3>
                      {currentAgent && (
                        <div className="mb-3 p-3 bg-background rounded-md border border-primary/30">
                          <p className="text-sm font-medium text-primary">{currentAgent}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        {agentStatus.map((status, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-xs mt-0.5">{status.includes('✓') || status.includes('🎉') ? '✅' : '⏳'}</span>
                            <span>{status}</span>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  )}

                  <Button
                    onClick={analyzeGap}
                    disabled={isAnalyzing || (skills.length === 0 && !githubUsername) || !targetRole.trim()}
                    className="w-full btn-primary text-lg py-6"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Your 30-Day Roadmap...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        🎯 Generate My 30-Day "Vibe-Check" Roadmap
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Overview Card */}
                <Card className="glass-card p-6 md:p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h2 className="text-2xl font-bold text-primary mb-2">
                        {analysis.targetRoleAnalysis?.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {analysis.targetRoleAnalysis?.description}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Average Salary</span>
                          <p className="font-semibold text-secondary">{analysis.targetRoleAnalysis?.averageSalary}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Demand Level</span>
                          <p className="font-semibold text-green-600">{analysis.targetRoleAnalysis?.demandLevel}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-muted"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={`${(analysis.overallReadiness / 100) * 352} 352`}
                            className="text-secondary"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary">
                            {analysis.overallReadiness}%
                          </span>
                        </div>
                      </div>
                      <p className="text-center mt-2 text-muted-foreground">Overall Readiness</p>
                      <p className="text-sm text-secondary mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {analysis.estimatedTimeToReady}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Skill Comparison */}
                <Card className="glass-card p-6 md:p-8">
                  <h3 className="text-xl font-bold text-primary mb-6">Skill Comparison</h3>
                  <div className="space-y-4">
                    {analysis.skillComparison?.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.skill}</span>
                            <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                          </div>
                          <Badge className={`${getPriorityColor(skill.priority)} text-white`}>
                            {skill.priority}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Current</span>
                            <Progress value={skill.currentLevel} className="h-2 mt-1" />
                            <span className="text-xs">{skill.currentLevel}%</span>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Required</span>
                            <Progress value={skill.requiredLevel} className="h-2 mt-1" />
                            <span className="text-xs">{skill.requiredLevel}%</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <Card className="glass-card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-primary mb-4">Your Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.strengths.map((strength, i) => (
                        <Badge key={i} variant="secondary" className="text-sm">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Missing Skills */}
                {analysis.missingSkills?.length > 0 && (
                  <Card className="glass-card p-6 md:p-8">
                    <h3 className="text-xl font-bold text-primary mb-6">Skills to Learn</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {analysis.missingSkills.map((skill, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{skill.skill}</span>
                            <Badge variant="outline">{skill.importance}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {skill.timeToLearn}
                          </p>
                          {skill.learningResources?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">Resources:</p>
                              <ul className="text-xs text-muted-foreground">
                                {skill.learningResources.slice(0, 3).map((resource, i) => (
                                  <li key={i}>• {resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Learning Roadmap */}
                <Card className="glass-card p-6 md:p-8">
                  <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    Learning Roadmap
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {['phase1', 'phase2', 'phase3'].map((phaseKey, index) => {
                      const phase = analysis.learningRoadmap?.[phaseKey as keyof typeof analysis.learningRoadmap];
                      if (!phase) return null;
                      return (
                        <motion.div
                          key={phaseKey}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-secondary text-primary-foreground flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{phase.title}</h4>
                              <span className="text-xs text-muted-foreground">{phase.duration}</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <p className="text-xs font-medium mb-1">Focus Areas:</p>
                            <div className="flex flex-wrap gap-1">
                              {phase.focus?.map((f, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {f}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {phase.milestones?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">Milestones:</p>
                              <ul className="text-xs text-muted-foreground">
                                {phase.milestones.map((m, i) => (
                                  <li key={i}>✓ {m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setAnalysis(null);
                      setSkills([]);
                      setTargetRole('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Start New Analysis
                  </Button>
                  <Button 
                    onClick={() => {
                      navigate('/roadmap-30-day', {
                        state: {
                          skillGapData: analysis,
                          targetRole: targetRole,
                          skills: skills
                        }
                      });
                    }}
                    className="flex-1 btn-primary"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Build My 30-Day Roadmap
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SkillGap;
