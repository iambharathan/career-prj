import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callAgent(systemPrompt: string, userPrompt: string, openAIKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      currentSkills, 
      targetRole, 
      hoursPerWeek = 10, 
      experienceLevel = 'intermediate',
      openAIKey 
    } = await req.json();

    if (!openAIKey) {
      return new Response(JSON.stringify({ 
        error: 'Please enter your OpenAI API key in the dashboard to use AI features.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting agentic roadmap generation...');
    console.log('Target Role:', targetRole);
    console.log('Current Skills:', currentSkills);

    // Agent 1: Research Agent
    console.log('Agent 1: Research Agent analyzing market demand...');
    const researchPrompt = `You are Agent 1: RESEARCH AGENT analyzing job market trends.

Target Role: ${targetRole}
Current Skills: ${currentSkills.join(', ')}

Your task:
1. Identify skills needed for ${targetRole}
2. Assess market demand for each skill (high/medium/low)
3. Recommend best learning resources
4. Estimate learning time for each skill
5. Suggest hands-on projects

Return as JSON:
{
  "agent_name": "Research Agent",
  "skills_needed": [
    {
      "skill": "skill name",
      "demand": "high",
      "time_to_learn": "4 weeks",
      "resources": ["Coursera Course XYZ", "Official Docs"],
      "projects": ["Build X project"]
    }
  ],
  "market_insights": "Brief market analysis"
}`;

    const researchResult = await callAgent(
      'You are a market research expert analyzing job trends and learning resources. Always return valid JSON.',
      researchPrompt,
      openAIKey
    );

    let research;
    try {
      const jsonMatch = researchResult.match(/```json\n?([\s\S]*?)\n?```/) || 
                        researchResult.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : researchResult;
      research = JSON.parse(jsonStr.trim());
    } catch (e) {
      research = { agent_name: "Research Agent", raw: researchResult };
    }

    // Agent 2: Planning Agent
    console.log('Agent 2: Planning Agent creating 30-day roadmap...');
    const planningPrompt = `You are Agent 2: PLANNING AGENT creating a structured 30-day learning roadmap.

Research Data:
${JSON.stringify(research, null, 2)}

User Constraints:
- Available time: ${hoursPerWeek} hours/week (${Math.floor(hoursPerWeek * 4.3)} hours/month)
- Current level: ${experienceLevel}

Your task:
Create a detailed 30-day plan with:
- Week-by-week breakdown (4 weeks)
- Specific daily tasks (actionable)
- Milestone checkpoints
- Project deliverables

Return as JSON:
{
  "agent_name": "Planning Agent",
  "roadmap": {
    "week_1": {
      "focus": ["skill1", "skill2"],
      "daily_tasks": [
        {"day": 1, "task": "Watch intro videos on X", "duration": "30 min"},
        {"day": 2, "task": "Complete exercises on Y", "duration": "45 min"},
        {"day": 3, "task": "Build mini-project", "duration": "1 hour"}
      ],
      "checkpoint": "Complete fundamentals quiz",
      "deliverable": "Simple project completed"
    },
    "week_2": { ... },
    "week_3": { ... },
    "week_4": { ... }
  }
}`;

    const planningResult = await callAgent(
      'You are a learning path designer creating structured, achievable roadmaps. Always return valid JSON.',
      planningPrompt,
      openAIKey
    );

    let planning;
    try {
      const jsonMatch = planningResult.match(/```json\n?([\s\S]*?)\n?```/) || 
                        planningResult.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : planningResult;
      planning = JSON.parse(jsonStr.trim());
    } catch (e) {
      planning = { agent_name: "Planning Agent", raw: planningResult };
    }

    // Agent 3: Validation Agent
    console.log('Agent 3: Validation Agent checking feasibility...');
    const validationPrompt = `You are Agent 3: VALIDATION AGENT ensuring the learning plan is realistic and achievable.

Planning Data:
${JSON.stringify(planning, null, 2)}

User Profile:
- Current skills: ${currentSkills.join(', ')}
- Target role: ${targetRole}
- Available time: ${hoursPerWeek} hours/week
- Experience level: ${experienceLevel}

Your task:
1. Check if timeline is realistic
2. Verify prerequisites are covered
3. Ensure workload is manageable
4. Identify potential gaps or issues
5. Make adjustments if needed
6. Provide confidence score

Return as JSON:
{
  "agent_name": "Validation Agent",
  "validated_roadmap": { ... adjusted roadmap ... },
  "confidence_score": 85,
  "adjustments_made": ["Reduced week 2 workload by 20%", "Added prerequisites in week 1"],
  "warnings": ["Week 3 may be challenging due to complexity"],
  "success_probability": "75%",
  "recommendations": ["Consider extending to 6 weeks if time permits"]
}`;

    const validationResult = await callAgent(
      'You are a quality assurance expert validating learning plans. Always return valid JSON.',
      validationPrompt,
      openAIKey
    );

    let validation;
    try {
      const jsonMatch = validationResult.match(/```json\n?([\s\S]*?)\n?```/) || 
                        validationResult.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : validationResult;
      validation = JSON.parse(jsonStr.trim());
    } catch (e) {
      validation = { agent_name: "Validation Agent", raw: validationResult };
    }

    console.log('All agents completed successfully!');

    return new Response(JSON.stringify({
      success: true,
      agent_workflow: [
        { 
          agent: 'Research Agent', 
          status: 'completed', 
          timestamp: new Date().toISOString(),
          output: research 
        },
        { 
          agent: 'Planning Agent', 
          status: 'completed', 
          timestamp: new Date().toISOString(),
          output: planning 
        },
        { 
          agent: 'Validation Agent', 
          status: 'completed', 
          timestamp: new Date().toISOString(),
          output: validation 
        }
      ],
      research,
      planning,
      final_roadmap: validation,
      summary: {
        target_role: targetRole,
        skills_to_learn: research.skills_needed?.length || 0,
        total_duration: '30 days',
        confidence: validation.confidence_score || 'N/A',
        success_probability: validation.success_probability || 'N/A'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in agentic-roadmap function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
