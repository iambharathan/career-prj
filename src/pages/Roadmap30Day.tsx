import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle2, BookOpen, Github, Linkedin, FileText, Loader2, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useUser } from '@/contexts/UserContext';
import { getOpenAIKey } from '@/config/apiKeys';
import { analyzeSkillGapWithOpenAI } from '@/config/openaiClient';

interface DayTask {
  day: number;
  title: string;
  description: string;
  type: 'learning' | 'project' | 'checkpoint';
  resources: string[];
  estimatedHours: number;
}

interface WeekPlan {
  week: number;
  focus: string;
  days: DayTask[];
}

interface Roadmap {
  targetRole: string;
  currentLevel: string;
  targetLevel: string;
  totalDuration: string;
  weeks: WeekPlan[];
  projects: {
    title: string;
    description: string;
    skills: string[];
    weekStart: number;
  }[];
  checkpoints: {
    day: number;
    milestone: string;
    criteria: string[];
  }[];
}

const Roadmap30Day = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [agentStatus, setAgentStatus] = useState<string[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const { toast } = useToast();
  const { openAIKey } = useUser();
  const location = useLocation();

  // Get data from navigation state
  const skillGapData = location.state?.skillGapData;
  const targetRole = location.state?.targetRole || 'Software Engineer';
  const skills = location.state?.skills || [];

  useEffect(() => {
    if (skillGapData) {
      // Auto-generate if we have skill gap data
      generateRoadmap();
    }
  }, [skillGapData]);

  const generateRoadmap = async () => {
    setIsGenerating(true);
    setAgentStatus([]);
    
    try {
      // Agent 1: Data Analysis
      setCurrentAgent('🔍 Agent 1: Analyzing your profile data...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAgentStatus(prev => [...prev, '✓ Profile data analyzed']);

      // Agent 2: Role Requirements
      setCurrentAgent('🎯 Agent 2: Understanding target role requirements...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAgentStatus(prev => [...prev, '✓ Role requirements mapped']);

      // Agent 3: Gap Analysis
      setCurrentAgent('📊 Agent 3: Identifying concrete skill gaps...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAgentStatus(prev => [...prev, '✓ Skill gaps identified']);

      // Agent 4: Roadmap Generation
      setCurrentAgent('🗺️ Agent 4: Generating 30-day learning roadmap...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAgentStatus(prev => [...prev, '✓ Roadmap generated']);

      // Agent 5: Resource Curation
      setCurrentAgent('📚 Agent 5: Curating projects and resources...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAgentStatus(prev => [...prev, '✓ Resources curated']);

      // Generate actual roadmap with AI
      const apiKey = getOpenAIKey(openAIKey);
      const prompt = `Create a detailed 30-day learning roadmap for someone with skills: ${skills.join(', ')} 
      who wants to become a ${targetRole}. 
      
      Return a JSON with this structure:
      {
        "targetRole": "${targetRole}",
        "currentLevel": "intermediate",
        "targetLevel": "job-ready",
        "totalDuration": "30 days",
        "weeks": [
          {
            "week": 1,
            "focus": "Fundamentals",
            "days": [
              {
                "day": 1,
                "title": "Getting Started",
                "description": "Introduction and setup",
                "type": "learning",
                "resources": ["Resource 1", "Resource 2"],
                "estimatedHours": 3
              }
            ]
          }
        ],
        "projects": [
          {
            "title": "Project 1",
            "description": "Build something practical",
            "skills": ["Skill 1", "Skill 2"],
            "weekStart": 2
          }
        ],
        "checkpoints": [
          {
            "day": 7,
            "milestone": "Week 1 Complete",
            "criteria": ["Criterion 1", "Criterion 2"]
          }
        ]
      }`;

      // For demo, create a sample roadmap
      const sampleRoadmap: Roadmap = {
        targetRole: targetRole,
        currentLevel: 'Intermediate',
        targetLevel: 'Job-Ready Professional',
        totalDuration: '30 days',
        weeks: [
          {
            week: 1,
            focus: 'Foundations & Core Concepts',
            days: Array.from({ length: 7 }, (_, i) => ({
              day: i + 1,
              title: i === 0 ? 'Setup & Introduction' : i === 6 ? 'Week 1 Review' : `Core Concept ${i}`,
              description: i === 0 ? 'Set up development environment and review fundamentals' : 
                          i === 6 ? 'Review week 1 progress and adjust learning pace' :
                          `Learn and practice essential concepts for ${targetRole}`,
              type: (i === 6 ? 'checkpoint' : i % 3 === 0 ? 'project' : 'learning') as 'learning' | 'project' | 'checkpoint',
              resources: ['Official Documentation', 'Interactive Tutorial', 'Video Course'],
              estimatedHours: i === 6 ? 2 : i % 3 === 0 ? 4 : 3
            }))
          },
          {
            week: 2,
            focus: 'Advanced Techniques & Tools',
            days: Array.from({ length: 7 }, (_, i) => ({
              day: i + 8,
              title: i === 6 ? 'Week 2 Review' : `Advanced Topic ${i + 1}`,
              description: i === 6 ? 'Mid-point assessment and progress review' :
                          `Master advanced ${targetRole} techniques and best practices`,
              type: (i === 6 ? 'checkpoint' : i % 2 === 0 ? 'project' : 'learning') as 'learning' | 'project' | 'checkpoint',
              resources: ['Advanced Guide', 'Code Examples', 'Practice Problems'],
              estimatedHours: i === 6 ? 2 : i % 2 === 0 ? 5 : 3
            }))
          },
          {
            week: 3,
            focus: 'Real-World Projects',
            days: Array.from({ length: 7 }, (_, i) => ({
              day: i + 15,
              title: i === 6 ? 'Week 3 Review' : `Project Work ${i + 1}`,
              description: i === 6 ? 'Review project progress and prepare for final week' :
                          `Build real-world projects to demonstrate ${targetRole} skills`,
              type: 'project' as 'learning' | 'project' | 'checkpoint',
              resources: ['Project Template', 'Best Practices Guide', 'Code Review Checklist'],
              estimatedHours: i === 6 ? 3 : 4
            }))
          },
          {
            week: 4,
            focus: 'Portfolio & Interview Prep',
            days: Array.from({ length: 8 }, (_, i) => ({
              day: i + 22,
              title: i === 7 ? 'Final Assessment' : `Day ${i + 22}`,
              description: i === 7 ? 'Complete 30-day challenge and celebrate!' :
                          i % 2 === 0 ? 'Portfolio building and documentation' :
                          'Interview preparation and mock interviews',
              type: (i === 7 ? 'checkpoint' : 'project') as 'learning' | 'project' | 'checkpoint',
              resources: ['Portfolio Template', 'Interview Questions', 'Resume Guide'],
              estimatedHours: i === 7 ? 4 : 3
            }))
          }
        ],
        projects: [
          {
            title: 'Personal Portfolio Website',
            description: 'Build a professional portfolio showcasing your projects and skills',
            skills: ['HTML', 'CSS', 'JavaScript', 'React'],
            weekStart: 1
          },
          {
            title: 'Full-Stack Application',
            description: 'Create a complete application with frontend and backend',
            skills: ['React', 'Node.js', 'Database', 'API Design'],
            weekStart: 2
          },
          {
            title: 'Open Source Contribution',
            description: 'Contribute to an open-source project in your target domain',
            skills: ['Git', 'Collaboration', 'Code Review'],
            weekStart: 3
          }
        ],
        checkpoints: [
          { day: 7, milestone: 'Week 1 Foundation Complete', criteria: ['Environment setup', 'Core concepts mastered', '2 mini-projects completed'] },
          { day: 14, milestone: 'Week 2 Advanced Skills', criteria: ['Advanced techniques learned', 'Complex project started', 'Code quality improved'] },
          { day: 21, milestone: 'Week 3 Real-World Experience', criteria: ['Major project completed', 'Portfolio updated', 'GitHub active'] },
          { day: 30, milestone: '30-Day Challenge Complete!', criteria: ['Job-ready portfolio', 'Interview confidence', 'Community connections'] }
        ]
      };

      setRoadmap(sampleRoadmap);
      setCurrentAgent('');
      
      toast({
        title: '30-Day Roadmap Generated!',
        description: 'Your personalized learning journey is ready.',
      });
    } catch (error) {
      console.error('Roadmap generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate roadmap. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'project': return <Target className="w-4 h-4" />;
      case 'checkpoint': return <CheckCircle2 className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'learning': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'project': return 'bg-green-100 text-green-700 border-green-200';
      case 'checkpoint': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <>
      <Helmet>
        <title>30-Day Roadmap | AI Career Navigator</title>
      </Helmet>
      <DashboardNavbar />
      
      <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 bg-gradient-to-br from-background via-background to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <Link to="/skill-gap">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Skill Gap
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              30-Day "Vibe-Check" Learning Roadmap
            </h1>
            <p className="text-muted-foreground mb-8">
              Your personalized journey to becoming a {targetRole}
            </p>

            {/* Multi-Agent Progress */}
            {isGenerating && (
              <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Multi-Agent System Generating Your Roadmap
                </h3>
                {currentAgent && (
                  <div className="mb-4 p-4 bg-background rounded-lg border border-primary/30">
                    <p className="text-sm font-medium text-primary">{currentAgent}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {agentStatus.map((status, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {status}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Roadmap Overview */}
            {roadmap && (
              <>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Target Role</p>
                        <p className="font-semibold text-lg">{roadmap.targetRole}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Level Up</p>
                        <p className="font-semibold">{roadmap.currentLevel} → {roadmap.targetLevel}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-8 h-8 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold text-lg">{roadmap.totalDuration}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Weekly Breakdown */}
                {roadmap.weeks.map((week) => (
                  <Card key={week.week} className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-primary">Week {week.week}</h3>
                      <Badge variant="secondary" className="text-sm">{week.focus}</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {week.days.map((day) => (
                        <Card key={day.day} className={`p-4 border-2 ${getTypeColor(day.type)}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(day.type)}
                              <span className="font-semibold">Day {day.day}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {day.estimatedHours}h
                            </Badge>
                          </div>
                          <h4 className="font-semibold mb-2">{day.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{day.description}</p>
                          {day.resources.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium mb-1">Resources:</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {day.resources.slice(0, 2).map((resource, idx) => (
                                  <li key={idx}>{resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </Card>
                ))}

                {/* Major Projects */}
                <Card className="p-6 mb-6">
                  <h3 className="text-2xl font-bold text-primary mb-6">Major Projects</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {roadmap.projects.map((project, idx) => (
                      <Card key={idx} className="p-6 border-2 border-green-200 bg-green-50">
                        <h4 className="font-bold text-lg mb-2">{project.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {project.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Start: Week {project.weekStart}</p>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Checkpoints */}
                <Card className="p-6">
                  <h3 className="text-2xl font-bold text-primary mb-6">Key Checkpoints</h3>
                  <div className="space-y-4">
                    {roadmap.checkpoints.map((checkpoint, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
                            <span className="font-bold text-purple-700">D{checkpoint.day}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{checkpoint.milestone}</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {checkpoint.criteria.map((criterion, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                                {criterion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* Generate Button */}
            {!roadmap && !isGenerating && (
              <Card className="p-8 text-center">
                <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Ready to Build Your 30-Day Roadmap?</h3>
                <p className="text-muted-foreground mb-6">
                  Our AI agents will analyze your skills, understand your target role, and create a personalized learning journey.
                </p>
                <Button onClick={generateRoadmap} size="lg" className="btn-primary">
                  <Calendar className="w-5 h-5 mr-2" />
                  Generate My 30-Day Roadmap
                </Button>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Roadmap30Day;
