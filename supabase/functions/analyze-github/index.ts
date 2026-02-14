import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { github_username, openAIKey } = await req.json();

    if (!openAIKey) {
      return new Response(JSON.stringify({ 
        error: 'Please enter your OpenAI API key in the dashboard to use AI features.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing GitHub profile:', github_username);

    // Fetch GitHub user profile
    const userRes = await fetch(`https://api.github.com/users/${github_username}`);
    
    if (!userRes.ok) {
      return new Response(JSON.stringify({ 
        error: 'GitHub user not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const user = await userRes.json();

    // Fetch repositories
    const reposRes = await fetch(`https://api.github.com/users/${github_username}/repos?sort=updated&per_page=20`);
    const repos = await reposRes.json();

    // Extract languages
    const languages = new Set();
    const topRepos = [];
    
    for (const repo of repos.slice(0, 10)) {
      if (repo.language) languages.add(repo.language);
      
      topRepos.push({
        name: repo.name,
        description: repo.description || 'No description',
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        topics: repo.topics || []
      });
    }

    // Use AI to analyze projects and extract skills
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a technical recruiter analyzing a GitHub profile. Extract skills, assess project quality, and provide career insights.

Return your analysis as a JSON object with this structure:
{
  "technical_skills": ["skill1", "skill2"],
  "frameworks": ["framework1", "framework2"],
  "tools": ["tool1", "tool2"],
  "domains": ["domain1", "domain2"],
  "experience_level": "beginner|intermediate|advanced|expert",
  "project_quality": "learning|portfolio|production",
  "strengths": ["strength1", "strength2"],
  "recommendations": ["rec1", "rec2"],
  "notable_projects": [
    {
      "name": "project name",
      "complexity": "low|medium|high",
      "technologies": ["tech1", "tech2"],
      "description": "brief description"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Analyze this GitHub profile:

Username: ${user.login}
Name: ${user.name || 'Not provided'}
Bio: ${user.bio || 'Not provided'}
Public Repos: ${user.public_repos}
Followers: ${user.followers}
Languages Detected: ${Array.from(languages).join(', ')}

Top Projects:
${topRepos.map((r, i) => `${i + 1}. ${r.name}
   Description: ${r.description}
   Language: ${r.language || 'N/A'}
   Stars: ${r.stars}
   Topics: ${r.topics.join(', ') || 'None'}
`).join('\n')}

Extract technical skills, assess experience level, and provide career recommendations.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    const aiData = await aiResponse.json();

    if (aiData.error) {
      console.error('OpenAI API error:', aiData.error);
      return new Response(JSON.stringify({ error: aiData.error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const analysisText = aiData.choices[0].message.content;
    
    let analysis;
    try {
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        analysisText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error('Failed to parse analysis JSON:', e);
      analysis = { raw: analysisText };
    }

    return new Response(JSON.stringify({
      github_data: {
        username: user.login,
        name: user.name,
        bio: user.bio,
        public_repos: user.public_repos,
        followers: user.followers,
        languages: Array.from(languages),
        top_repos: topRepos
      },
      ai_analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-github function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
