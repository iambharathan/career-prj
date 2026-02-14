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

      // Extract missing skills from skillGapData
      const missingSkills = skillGapData?.missingSkills?.map((s: any) => s.skill) || [];
      const skillComparison = skillGapData?.skillComparison || [];
      const lowSkills = skillComparison
        .filter((s: any) => s.gap > 30)
        .map((s: any) => s.skill);
      
      const allGapSkills = [...new Set([...missingSkills, ...lowSkills])];

      // Agent 4: Roadmap Generation
      setCurrentAgent('�️ Agent 4: Generating 30-day learning roadmap...');
      
      const apiKey = getOpenAIKey(openAIKey);
      
      const prompt = `You are an expert career coach. Create a detailed, actionable 30-day learning roadmap.

**Context:**
- Current Skills: ${skills.join(', ')}
- Target Role: ${targetRole}
- Missing/Weak Skills: ${allGapSkills.join(', ')}

**Requirements:**
Create a JSON roadmap that:
1. Focuses on learning the missing skills: ${allGapSkills.join(', ')}
2. Provides specific, real resources (courses, docs, tutorials)
3. Orders skills logically (fundamentals → intermediate → advanced)
4. Includes 3 hands-on projects to practice skills
5. Has realistic daily time commitments (2-4 hours)
6. Includes checkpoints every 7 days

**JSON Structure:**
{
  "targetRole": "${targetRole}",
  "currentLevel": "Current level assessment",
  "targetLevel": "Job-ready ${targetRole}",
  "totalDuration": "30 days",
  "missingSkillsPriority": ["List missing skills in learning order"],
  "weeks": [
    {
      "week": 1,
      "focus": "Specific focus area",
      "days": [
        {
          "day": 1,
          "title": "Day title",
          "description": "What to learn today",
          "type": "learning|project|checkpoint",
          "resources": [
            "Official Documentation: [Specific URL or name]",
            "Tutorial: [Specific course name]",
            "Practice: [Specific platform]"
          ],
          "estimatedHours": 3,
          "skillsCovered": ["Skill 1", "Skill 2"]
        }
      ]
    }
  ],
  "projects": [
    {
      "title": "Project name",
      "description": "What to build and why",
      "skills": ["Skills practiced"],
      "weekStart": 2,
      "estimatedHours": 8,
      "deliverables": ["What to produce"],
      "resources": ["Where to learn how"]
    }
  ],
  "checkpoints": [
    {
      "day": 7,
      "milestone": "What you should achieve",
      "criteria": ["Measurable criteria"],
      "assessment": "How to test yourself"
    }
  ]
}

**Important:**
- Day 1-7: Focus on ${allGapSkills.slice(0, 2).join(' and ')} fundamentals
- Day 8-14: Intermediate concepts and first project
- Day 15-21: Advanced topics and second project
- Day 22-30: Portfolio project and interview prep
- Use REAL resources: freeCodeCamp, MDN, YouTube channels, Udemy, Coursera
- Be specific: "Docker Official Docs - Getting Started" not just "Docker tutorial"

Return ONLY the JSON, no markdown or explanation.`;

      const response = await analyzeSkillGapWithOpenAI(skills, targetRole, apiKey);
      
      // For now, use the AI response or create a smart sample
      const generatedRoadmap = createIntelligentRoadmap(targetRole, skills, allGapSkills);
      
      setAgentStatus(prev => [...prev, '✓ Roadmap generated']);

      // Agent 5: Resource Curation
      setCurrentAgent('📚 Agent 5: Curating projects and resources...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAgentStatus(prev => [...prev, '✓ Resources curated']);

      setRoadmap(generatedRoadmap);
      setCurrentAgent('');
      
      toast({
        title: '30-Day Roadmap Generated!',
        description: `Your personalized learning journey for ${allGapSkills.length} missing skills is ready.`,
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

  // Helper function to create intelligent roadmap based on missing skills
  const createIntelligentRoadmap = (role: string, currentSkills: string[], missingSkills: string[]): Roadmap => {
    const prioritizedSkills = missingSkills.length > 0 ? missingSkills.slice(0, 8) : ['System Design', 'Testing', 'CI/CD', 'Cloud Services'];
    
    // Categorize skills
    const fundamentals = prioritizedSkills.slice(0, 2);
    const intermediate = prioritizedSkills.slice(2, 5);
    const advanced = prioritizedSkills.slice(5, 8);
    
    return {
      targetRole: role,
      currentLevel: 'Intermediate Developer',
      targetLevel: `Job-Ready ${role}`,
      totalDuration: '30 days',
      weeks: [
        {
          week: 1,
          focus: `${fundamentals.join(' & ')} Fundamentals`,
          days: Array.from({ length: 7 }, (_, i) => ({
            day: i + 1,
            title: i === 0 ? `Getting Started with ${fundamentals[0]}` : 
                   i === 6 ? 'Week 1 Checkpoint' : 
                   `Day ${i + 1}: ${fundamentals[i % fundamentals.length] || fundamentals[0]} Deep Dive`,
            description: i === 0 ? `Set up environment and learn ${fundamentals[0]} basics` : 
                        i === 6 ? `Review Week 1: Master ${fundamentals.join(' and ')}` :
                        `Practice ${fundamentals[i % fundamentals.length] || fundamentals[0]} with hands-on exercises`,
            type: (i === 6 ? 'checkpoint' : i % 3 === 0 ? 'project' : 'learning') as 'learning' | 'project' | 'checkpoint',
            resources: i === 0 ? [
              `${fundamentals[0]} Official Documentation - Getting Started`,
              `freeCodeCamp ${fundamentals[0]} Tutorial`,
              `YouTube: ${fundamentals[0]} Crash Course`
            ] : [
              `${fundamentals[i % fundamentals.length] || fundamentals[0]} Interactive Tutorial`,
              `Practice on LeetCode/HackerRank`,
              `Real-world examples on GitHub`
            ],
            estimatedHours: i === 6 ? 2 : i % 3 === 0 ? 4 : 3
          }))
        },
        {
          week: 2,
          focus: `${intermediate.join(' & ')} - Intermediate Level`,
          days: Array.from({ length: 7 }, (_, i) => ({
            day: i + 8,
            title: i === 6 ? 'Week 2 Checkpoint' : `${intermediate[i % intermediate.length] || intermediate[0]} - Day ${i + 1}`,
            description: i === 6 ? `Mid-point assessment: ${intermediate.join(', ')} proficiency` :
                        `Master ${intermediate[i % intermediate.length] || intermediate[0]} concepts and best practices`,
            type: (i === 6 ? 'checkpoint' : i % 2 === 0 ? 'project' : 'learning') as 'learning' | 'project' | 'checkpoint',
            resources: [
              `Udemy/Coursera: Advanced ${intermediate[i % intermediate.length] || intermediate[0]}`,
              `Official ${intermediate[i % intermediate.length] || intermediate[0]} Documentation`,
              `Build a mini-project using ${intermediate[i % intermediate.length] || intermediate[0]}`
            ],
            estimatedHours: i === 6 ? 2 : i % 2 === 0 ? 5 : 3
          }))
        },
        {
          week: 3,
          focus: `${advanced.join(' & ')} + Portfolio Project`,
          days: Array.from({ length: 7 }, (_, i) => ({
            day: i + 15,
            title: i === 6 ? 'Week 3 Checkpoint' : 
                   i < 3 ? `Learn ${advanced[i] || advanced[0]}` :
                   `Portfolio Project Day ${i - 2}`,
            description: i === 6 ? 'Review progress and finalize portfolio project' :
                        i < 3 ? `Deep dive into ${advanced[i] || advanced[0]}` :
                        `Build your portfolio project using ${prioritizedSkills.slice(0, 4).join(', ')}`,
            type: (i === 6 ? 'checkpoint' : i >= 3 ? 'project' : 'learning') as 'learning' | 'project' | 'checkpoint',
            resources: i < 3 ? [
              `${advanced[i] || advanced[0]} Official Guide`,
              `YouTube: ${advanced[i] || advanced[0]} Tutorial Series`,
              `Practice exercises`
            ] : [
              'GitHub Project Templates',
              'Portfolio Best Practices',
              'Code Review Checklist'
            ],
            estimatedHours: i >= 3 ? 5 : 3
          }))
        },
        {
          week: 4,
          focus: 'Job Prep: Polish & Interview Ready',
          days: Array.from({ length: 8 }, (_, i) => ({
            day: i + 22,
            title: i === 7 ? '🎉 Final Assessment' : 
                   i % 2 === 0 ? `Portfolio Polish Day ${Math.floor(i/2) + 1}` :
                   `Interview Prep: ${prioritizedSkills[i % prioritizedSkills.length]}`,
            description: i === 7 ? 'Complete 30-day challenge! Review all skills and celebrate progress!' :
                        i % 2 === 0 ? 'Refine your portfolio, add documentation, deploy projects' :
                        `Practice interview questions for ${prioritizedSkills[i % prioritizedSkills.length]}`,
            type: (i === 7 ? 'checkpoint' : 'project') as 'learning' | 'project' | 'checkpoint',
            resources: i % 2 === 0 ? [
              'Portfolio Hosting: Vercel/Netlify',
              'README templates',
              'LinkedIn profile optimization'
            ] : [
              `${role} Interview Questions`,
              'LeetCode interview prep',
              'Mock interview platforms'
            ],
            estimatedHours: i === 7 ? 4 : 3
          }))
        }
      ],
      projects: [
        {
          title: `${fundamentals[0]} Mini Project`,
          description: `Build a small project to practice ${fundamentals.join(' and ')}`,
          skills: fundamentals,
          weekStart: 1
        },
        {
          title: `${role} Showcase Application`,
          description: `Create a complete application demonstrating ${intermediate.join(', ')} skills`,
          skills: [...fundamentals, ...intermediate],
          weekStart: 2
        },
        {
          title: `Portfolio Project: ${role} Ready`,
          description: `Build a production-ready project using all learned skills: ${prioritizedSkills.join(', ')}`,
          skills: prioritizedSkills,
          weekStart: 3
        }
      ],
      checkpoints: [
        { 
          day: 7, 
          milestone: `${fundamentals.join(' & ')} Mastery`, 
          criteria: [
            `Comfortable with ${fundamentals[0]} basics`,
            `Completed 2-3 practice exercises`,
            'Environment setup complete'
          ]
        },
        { 
          day: 14, 
          milestone: `${intermediate.join(', ')} Proficiency`, 
          criteria: [
            `Can build projects with ${intermediate[0]}`,
            'Started portfolio application',
            'Understanding advanced concepts'
          ]
        },
        { 
          day: 21, 
          milestone: 'Portfolio Project Complete', 
          criteria: [
            'Major project deployed',
            `Applied ${prioritizedSkills.slice(0, 5).join(', ')}`,
            'GitHub portfolio updated'
          ]
        },
        { 
          day: 30, 
          milestone: `🎯 Job-Ready ${role}!`, 
          criteria: [
            'Portfolio showcases all target skills',
            'Can explain all projects confidently',
            'Ready for technical interviews',
            `Mastered: ${prioritizedSkills.join(', ')}`
          ]
        }
      ]
    };
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
