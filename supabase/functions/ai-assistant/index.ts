import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, projectContext, action } = await req.json()
    
    console.log('Received request:', { message, action, hasContext: !!projectContext })
    
    // Get Gemini API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment')
      throw new Error('Gemini API key not configured')
    }
    
    console.log('API key found, length:', GEMINI_API_KEY.length)

    // Build prompt based on action
    let prompt = ''
    
    if (action === 'generate_project') {
      prompt = `You are a game development project planner. Based on this description, create a detailed task breakdown.

User request: "${message}"

Generate a JSON response with this EXACT structure (valid JSON only, no markdown):
{
  "projectName": "string",
  "description": "string",
  "tasks": [
    {
      "title": "string",
      "category": "Design|Art|Code|Audio|Other",
      "difficulty": 1-5,
      "importance": 1-5,
      "deadline": "",
      "notes": "string",
      "subtasks": [
        {
          "title": "string",
          "category": "Design|Art|Code|Audio|Other",
          "difficulty": 1-5,
          "importance": 1-5,
          "deadline": "",
          "notes": "string"
        }
      ]
    }
  ]
}

Rules:
- Create 5-15 main tasks
- Each main task should have 2-5 subtasks
- Use appropriate categories
- Set realistic difficulty (1=easy, 5=hard) and importance (1=low, 5=critical)
- Add helpful notes
- Leave deadlines empty
- Focus on game dev workflow: Design → Art → Code → Audio → Testing`
    } else if (action === 'add_tasks') {
      prompt = `You are helping a game developer add tasks to their existing project.

Project: ${projectContext?.projectName || 'Current project'}
Current tasks: ${projectContext?.taskCount || 0} tasks

User request: "${message}"

Generate tasks to add. Return JSON with this structure (valid JSON only):
{
  "tasks": [
    {
      "title": "string",
      "category": "Design|Art|Code|Audio|Other",
      "difficulty": 1-5,
      "importance": 1-5,
      "deadline": "",
      "notes": "string",
      "subtasks": [...]
    }
  ]
}

Create 1-5 tasks based on the request.`
    } else if (action === 'chat') {
      prompt = `You are a helpful AI assistant for a game development task manager.

${projectContext ? `Current project: ${projectContext.projectName}` : 'User is on dashboard'}

User: "${message}"

Respond naturally and helpfully. If they ask about adding tasks, editing projects, or generating content, explain what you can do. Keep responses concise (2-3 sentences).`
    }

    // Call Gemini API
    console.log('Calling Gemini API...')
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    console.log('Gemini API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    // Extract JSON if present
    let result
    if (action !== 'chat') {
      let jsonText = generatedText
      if (generatedText.includes('```json')) {
        jsonText = generatedText.split('```json')[1].split('```')[0].trim()
      } else if (generatedText.includes('```')) {
        jsonText = generatedText.split('```')[1].split('```')[0].trim()
      }
      result = JSON.parse(jsonText)
    } else {
      result = { response: generatedText }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Function error:', error)
    console.error('Error details:', error.message, error.stack)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

