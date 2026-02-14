import OpenAI from 'openai';
import { getOpenAIKey } from './apiKeys';

// Helper function to clean JSON from markdown formatting
const cleanJSONResponse = (content: string): string => {
  let cleaned = content.trim();
  
  // Remove markdown code blocks (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
    cleaned = cleaned.replace(/\n?```\s*$/, '');
  }
  
  return cleaned.trim();
};

// Initialize OpenAI client (will use API key from config)
export const createOpenAIClient = (apiKey?: string) => {
  const key = apiKey || getOpenAIKey();
  return new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true // Allow client-side usage (for demo/hackathon)
  });
};

// Analyze resume using OpenAI directly
export const analyzeResumeWithOpenAI = async (resumeText: string, apiKey?: string) => {
  const openai = createOpenAIClient(apiKey);

  const prompt = `Analyze this resume and provide a detailed ATS (Applicant Tracking System) compatibility analysis.

Resume Text:
${resumeText}

Please analyze and return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "atsCompatibility": "<High/Medium/Low>",
  "summary": "<brief summary of the resume's ATS compatibility>",
  "extractedSkills": ["skill1", "skill2", ...],
  "sections": [
    {
      "name": "<section name>",
      "score": <number 1-10>,
      "atsFriendly": <boolean>,
      "content": "<brief description>",
      "issues": ["issue1", ...],
      "recommendations": ["recommendation1", ...]
    }
  ],
  "keywords": {
    "found": ["keyword1", ...],
    "missing": ["keyword1", ...],
    "industryRelevant": ["keyword1", ...]
  },
  "formatting": {
    "score": <number 1-10>,
    "issues": ["issue1", ...],
    "suggestions": ["suggestion1", ...]
  }
}

Focus on:
- ATS compatibility (simple formatting, clear sections, keywords)
- Section structure and completeness
- Skills extraction
- Keyword optimization
- Formatting best practices

Return ONLY the JSON object, no other text.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert ATS (Applicant Tracking System) analyzer. Analyze resumes and provide detailed, actionable feedback. Always return valid JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  // Clean up markdown formatting if present
  const cleanedContent = cleanJSONResponse(content);
  
  // Try to parse the cleaned JSON
  try {
    const analysis = JSON.parse(cleanedContent);
    return analysis;
  } catch (parseError) {
    console.error('Resume analysis JSON parse error:', parseError);
    console.error('Content received:', content);
    
    // Return a fallback structure
    return {
      overallScore: 70,
      atsCompatibility: "Medium",
      summary: "Resume analysis completed",
      extractedSkills: [],
      sections: [],
      keywords: { found: [], missing: [], industryRelevant: [] },
      formatting: { score: 7, issues: [], suggestions: [] }
    };
  }
};

// Analyze skill gap using OpenAI directly
export const analyzeSkillGapWithOpenAI = async (
  currentSkills: string[],
  targetRole: string,
  apiKey?: string
) => {
  const openai = createOpenAIClient(apiKey);

  const prompt = `Analyze the skill gap for someone transitioning to a ${targetRole} role.

Current Skills: ${currentSkills.join(', ')}
Target Role: ${targetRole}

Provide a comprehensive skill gap analysis in JSON format:
{
  "targetRoleAnalysis": {
    "title": "${targetRole}",
    "description": "<role description>",
    "averageSalary": "<salary range>",
    "demandLevel": "<High/Medium/Low>"
  },
  "skillComparison": [
    {
      "skill": "<skill name>",
      "category": "<category>",
      "currentLevel": <0-100>,
      "requiredLevel": <0-100>,
      "gap": <difference>,
      "priority": "<Critical/High/Medium/Low>"
    }
  ],
  "missingSkills": [
    {
      "skill": "<skill name>",
      "importance": "<Critical/High/Medium>",
      "timeToLearn": "<time estimate>",
      "learningResources": ["resource1", "resource2"]
    }
  ],
  "strengths": ["strength1", "strength2", ...],
  "learningRoadmap": {
    "phase1": {
      "title": "<phase name>",
      "duration": "<duration>",
      "focus": ["focus1", "focus2"],
      "milestones": ["milestone1", "milestone2"]
    },
    "phase2": { ... },
    "phase3": { ... }
  },
  "overallReadiness": <0-100>,
  "estimatedTimeToReady": "<time estimate>"
}

Return ONLY the JSON object.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a career development expert specializing in skill gap analysis and personalized learning roadmaps. Always return valid JSON."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const content = response.choices[0]?.message?.content || '{}';
  
  // Clean up markdown formatting if present
  const cleanedContent = cleanJSONResponse(content);
  
  // Try to parse the cleaned JSON
  try {
    const analysis = JSON.parse(cleanedContent);
    return analysis;
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Content received:', content);
    
    // Return a fallback structure
    return {
      targetRole: targetRole,
      skillComparison: [],
      missingSkills: [],
      strengths: currentSkills.slice(0, 3),
      learningRoadmap: {},
      overallReadiness: 50,
      estimatedTimeToReady: "30 days"
    };
  }
};
