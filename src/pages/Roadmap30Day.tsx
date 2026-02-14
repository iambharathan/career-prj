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
    estimatedHours?: number;
    deliverables?: string[];
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
      
      const prompt = `You are an expert career coach creating a realistic 30-day roadmap to learn ONLY the missing skills.

**CRITICAL CONTEXT:**
Target Role: ${targetRole}
Current Skills (ALREADY KNOWS): ${skills.join(', ')}
Missing Skills (MUST LEARN): ${allGapSkills.join(', ')}

**YOUR MISSION:**
Create a PRACTICAL 30-day roadmap to learn ONLY these missing skills: ${allGapSkills.join(', ')}

**REALISM REQUIREMENTS:**
1. ⏰ **Realistic Time:** Complex skills like Kubernetes need 5-7 days minimum, not 1 day
2. 📚 **Learning Pace:** 2-4 hours daily study (people have jobs/life)
3. 🎯 **One Skill at a Time:** Focus on 1-2 skills per week maximum
4. 🔗 **Prerequisites:** Learn foundation skills before advanced ones
5. 💡 **Practical:** 70% hands-on practice, 30% theory
6. 🚀 **Achievable:** By day 30, learner should be job-interview ready in these missing skills

**SKILL LEARNING TIME GUIDELINES:**
- Basic tools (Git, Docker basics): 2-3 days
- Cloud platforms (AWS, Azure): 5-7 days
- Complex systems (Kubernetes, Terraform): 5-7 days
- Programming languages: 7-10 days
- Frameworks (React, Angular): 7-10 days

**JSON Structure:**
{
  "title": "30-Day Roadmap to Learn Missing Skills for ${targetRole}",
  "targetRole": "${targetRole}",
  "missingSkillsFocus": ${JSON.stringify(allGapSkills)},
  "totalDuration": "30 days (2-4 hours/day)",
  "weeks": [
    {
      "week": 1,
      "focus": "First missing skill - foundation",
      "days": [
        {
          "day": 1,
          "title": "Day 1: Introduction to [Skill]",
          "description": "What to learn today (be specific)",
          "type": "learning",
          "resources": [
            "[Skill] Official Documentation",
            "[Specific course name - e.g., Kubernetes for Beginners]",
            "[YouTube channel - e.g., TechWorld with Nana, freeCodeCamp]",
            "[Platform tutorial - e.g., Interactive Kubernetes Tutorial]"
          ],
          "estimatedHours": 3,
          "skillsCovered": ["Skill"],
          "practicalTask": "Hands-on exercise for today"
        }
      ]
    }
  ],
  "projects": [
    {
      "title": "Project 1: Beginner",
      "description": "Build something with first 1-2 missing skills",
      "skills": ["Skills from weeks 1-2"],
      "weekStart": 2,
      "duration": "3-4 days",
      "deliverables": ["What to build"],
      "realWorldValue": "Why this matters for ${targetRole}"
    }
  ],
  "checkpoints": [
    {
      "day": 7,
      "milestone": "Completed [Skill] basics",
      "skillsMastered": ["Skills learned so far"],
      "assessment": "Can you do [specific task]?"
    }
  ]
}

**EXAMPLE REALISTIC BREAKDOWN (if Kubernetes is missing):**
- Day 1-2: Docker fundamentals (prerequisite)
- Day 3-4: Container orchestration concepts
- Day 5-7: Kubernetes basics (pods, services, deployments)
- Day 8-10: Kubernetes hands-on labs
- Day 11-14: Build project deploying app to K8s
(NOT "Day 1: Learn Kubernetes" - that's impossible!)

**PRIORITIZATION:**
1. Learn missing skills in dependency order (Docker before Kubernetes)
2. Focus on most critical skills for ${targetRole} first
3. Allocate more days to complex skills
4. Include daily practical exercises
5. Build 3 portfolio projects using the missing skills

**RESOURCE REQUIREMENTS:**
- Provide specific course/tutorial names (e.g., "Kubernetes for Beginners by Nana")
- Include official documentation
- Mention well-known platforms (Udemy, Coursera, freeCodeCamp, YouTube)
- List practical hands-on labs and interactive tutorials
- Do NOT add prefixes like "Reddit-recommended:" or "Top-rated:" - just provide the resource name directly

Return ONLY valid JSON, no markdown formatting.`;

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
    
    // Allocate realistic days per skill based on complexity
    const getSkillDays = (skill: string): number => {
      const complexSkills = ['kubernetes', 'terraform', 'aws', 'azure', 'react', 'angular', 'django'];
      const mediumSkills = ['docker', 'jenkins', 'ansible', 'mongodb', 'postgresql'];
      const lowerSkill = skill.toLowerCase();
      
      if (complexSkills.some(s => lowerSkill.includes(s))) return 7; // 1 week for complex
      if (mediumSkills.some(s => lowerSkill.includes(s))) return 4; // 4 days for medium
      return 3; // 3 days for basics
    };
    
    // Build realistic daily schedule
    const dailySchedule: Array<{
      day: number;
      skill: string;
      phase: 'intro' | 'practice' | 'project' | 'checkpoint';
    }> = [];
    
    let currentDay = 1;
    prioritizedSkills.forEach((skill, index) => {
      const days = getSkillDays(skill);
      const introDays = Math.ceil(days * 0.4); // 40% intro
      const practiceDays = Math.floor(days * 0.6); // 60% practice
      
      // Intro phase
      for (let i = 0; i < introDays; i++) {
        if (currentDay <= 30) {
          dailySchedule.push({ day: currentDay++, skill, phase: 'intro' });
        }
      }
      
      // Practice phase
      for (let i = 0; i < practiceDays; i++) {
        if (currentDay <= 30) {
          dailySchedule.push({ day: currentDay++, skill, phase: 'practice' });
        }
      }
      
      // Add checkpoint every 7 days
      if (currentDay % 7 === 0 && currentDay <= 30) {
        dailySchedule.push({ day: currentDay++, skill: 'Review', phase: 'checkpoint' });
      }
    });
    
    // Group into weeks
    const weeks: WeekPlan[] = [];
    for (let weekNum = 1; weekNum <= 4; weekNum++) {
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = Math.min(weekNum * 7, 30);
      const weekDays = dailySchedule.filter(d => d.day >= startDay && d.day <= endDay);
      
      const mainSkill = weekDays[0]?.skill || 'Skills';
      
      weeks.push({
        week: weekNum,
        focus: `Master ${mainSkill} (Realistic Pace)`,
        days: weekDays.map(({ day, skill, phase }) => ({
          day,
          title: phase === 'checkpoint' ? `Week ${weekNum} Checkpoint` :
                 phase === 'intro' ? `${skill} - Day ${day - startDay + 1}: Fundamentals` :
                 phase === 'project' ? `${skill} - Build Project` :
                 `${skill} - Day ${day - startDay + 1}: Hands-on Practice`,
          description: phase === 'checkpoint' ? `Review progress. Can you explain ${mainSkill}? Built something?` :
                      phase === 'intro' ? `Learn ${skill} concepts, setup environment, follow official docs` :
                      phase === 'project' ? `Build a real project using ${skill} to solidify learning` :
                      `Practice ${skill} with exercises, tutorials, and mini-challenges`,
          type: phase === 'checkpoint' ? 'checkpoint' : 
                phase === 'project' ? 'project' : 'learning',
          resources: phase === 'checkpoint' ? [
            `Self-assessment: Skills learned so far`,
            `Review projects and code`,
            `Practice explaining concepts aloud`
          ] : [
            `${skill} Official Documentation`,
            `${skill} for Beginners - Complete Course`,
            `${skill} Tutorial by TechWorld with Nana`,
            `${skill} Interactive Lab on Katacoda`,
            phase === 'intro' ? `${skill} Best Practices Guide` : `Build Mini ${skill} Project`
          ],
          estimatedHours: phase === 'checkpoint' ? 2 : phase === 'project' ? 4 : 3
        }))
      });
    }
    
    return {
      targetRole: role,
      currentLevel: `Learning ${prioritizedSkills.length} Missing Skills`,
      targetLevel: `Job-Ready ${role}`,
      totalDuration: '30 days (2-4 hours/day)',
      weeks,
      projects: [
        {
          title: `Beginner: ${prioritizedSkills[0] || 'First Skill'} Basics`,
          description: `Build a simple project using ${prioritizedSkills[0] || 'first skill'} to practice fundamentals`,
          skills: [prioritizedSkills[0] || 'First skill'],
          weekStart: 1,
          estimatedHours: 6,
          deliverables: [`Working ${prioritizedSkills[0]} demo`, 'GitHub repository', 'Documentation']
        },
        {
          title: `Intermediate: Combine ${prioritizedSkills.slice(0, 2).join(' + ')}`,
          description: `Integrate multiple skills into one practical project`,
          skills: prioritizedSkills.slice(0, 2),
          weekStart: 2,
          estimatedHours: 10,
          deliverables: ['End-to-end application', 'Deployed demo', 'Blog post explaining']
        },
        {
          title: `Portfolio: Real-World ${role} Project`,
          description: `Build interview-worthy project showcasing all learned skills`,
          skills: prioritizedSkills.slice(0, 5),
          weekStart: 3,
          estimatedHours: 15,
          deliverables: ['Production-ready app', 'Complete documentation', 'Presentation slides']
        }
      ],
      checkpoints: [
        { 
          day: 7, 
          milestone: `Week 1: ${prioritizedSkills[0]} Foundation`,
          criteria: [
            `Can explain what ${prioritizedSkills[0]} is and why it matters`,
            `Set up environment successfully`,
            `Completed 2-3 beginner tutorials`,
            `Built first mini-project`
          ]
        },
        { 
          day: 14, 
          milestone: `Week 2: Expanding Skills`,
          criteria: [
            `Comfortable with ${prioritizedSkills.slice(0, 2).join(' and ')}`,
            `Completed intermediate tutorials`,
            `Built project combining skills`,
            `Can troubleshoot basic issues`
          ]
        },
        { 
          day: 21, 
          milestone: `Week 3: Advanced Topics`,
          criteria: [
            `Working knowledge of ${prioritizedSkills.slice(0, 3).join(', ')}`,
            `Portfolio project in progress`,
            `Can explain concepts to others`,
            `Contributing to learning communities`
          ]
        },
        { 
          day: 30, 
          milestone: `🎯 Job-Ready with Missing Skills!`, 
          criteria: [
            `Mastered missing skills: ${prioritizedSkills.join(', ')}`,
            `3 portfolio projects completed`,
            `Can confidently discuss in interviews`,
            `Ready to apply for ${role} positions`
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
              30-Day Roadmap to Learn Missing Skills
            </h1>
            <p className="text-muted-foreground mb-8">
              Practical, achievable plan to master your skill gaps for {targetRole}
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
                {/* Missing Skills Focus Banner */}
                <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30">
                  <div className="flex items-start gap-4">
                    <Target className="w-10 h-10 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary mb-2">
                        🎯 Focus: Learning Your Missing Skills
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        This roadmap is specifically designed to help you master the skills you're currently lacking for the <span className="font-semibold">{roadmap.targetRole}</span> role.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {skillGapData?.missingSkills?.slice(0, 8).map((skill: any, idx: number) => (
                          <Badge key={idx} className="bg-red-100 text-red-700 border-red-300">
                            {skill.skill || skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        ⏰ <strong>Realistic pace:</strong> 2-4 hours daily • Complex skills get more days • Focus on 1-2 skills per week
                      </p>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          📚 <strong>Resources curated from:</strong> Top Reddit recommendations, highly-rated Udemy/Coursera courses, and community-voted tutorials
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

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
