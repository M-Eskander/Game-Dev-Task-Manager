import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Keyboard shortcuts reference
const SHORTCUTS = {
  'Ctrl+K': 'Open search',
  'Ctrl+S': 'Toggle statistics',
  'Ctrl+R': 'Refresh project',
  'N': 'New task (when focused)',
  'X': 'Mark task complete',
  'C': 'Add comment',
  '/': 'Focus search',
  'Esc': 'Close modals'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, projectContext, action } = await req.json()
    
    console.log('Received request:', { message, action, hasContext: !!projectContext })
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment')
      throw new Error('Gemini API key not configured')
    }

    // Build comprehensive context
    let contextInfo = ''
    if (projectContext) {
      contextInfo = `
CURRENT PROJECT INFO:
- Name: ${projectContext.projectName || 'Untitled'}
- Total tasks: ${projectContext.taskCount || 0}
- Completed: ${projectContext.completedTasks || 0}
- In progress: ${(projectContext.taskCount || 0) - (projectContext.completedTasks || 0)}
- Categories: Design, Art, Code, Audio, Other
${projectContext.currentTasks ? `\nRECENT TASKS:\n${projectContext.currentTasks.slice(0, 5).map(t => `- ${t.title} (${t.category}) ${t.completed ? '✓' : '○'}`).join('\n')}` : ''}
`
    }

    // Build prompt based on action and intent
    let prompt = ''
    let systemRole = `You are an expert AI assistant for a game development task manager app. You help users:
1. Create and organize game dev projects
2. Add/edit/complete tasks efficiently
3. Learn keyboard shortcuts and features
4. Troubleshoot issues
5. Get productivity tips

KEYBOARD SHORTCUTS YOU CAN TEACH:
${Object.entries(SHORTCUTS).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')}

FEATURES AVAILABLE:
- Task assignment (assign to team members)
- Categories: Design, Art, Code, Audio, Other
- Difficulty levels (1-5)
- Importance/Priority (1-5)
- Subtasks (nested tasks)
- Task search and filtering
- Statistics and progress tracking
- Group projects with member management
- Dark/Light mode
- Export/Import data

Be concise, friendly, and actionable. If asked to perform an action (like "mark task X complete" or "add a task"), acknowledge and explain that you'll help create it.`

    if (action === 'generate_project') {
      prompt = `${systemRole}

User wants to create a new project: "${message}"

You are an EXPERT game development project manager. Generate a COMPREHENSIVE, REALISTIC game development plan.

CRITICAL INSTRUCTIONS:
1. ALWAYS include tasks for ALL categories: Design, Art, Code, Audio, Testing (even if user didnt mention them)
2. If story or design not mentioned, create basic story/design tasks and suggest ideas in notes
3. Add STANDARD tasks every game needs: UI, menus, save system, input handling, settings
4. Add SPECIFIC tasks based on description (e.g., bot AI if description mentions bot, garden environment if mentions garden)
5. Add OPTIONAL tasks with importance 1-2 for nice-to-have features (attacks, power-ups, achievements)
6. Calculate REALISTIC deadlines for EVERY task and subtask based on difficulty, importance, and workflow order

DEADLINE CALCULATION (VERY IMPORTANT):
- Extract project deadline from message if provided
- Calculate dates working backwards from project deadline, or forward from today if no deadline
- Task order: Design (earliest) → Art → Code → Audio → Testing (latest)
- Difficulty 1 = 1 day, 2 = 2 days, 3 = 3 days, 4 = 5 days, 5 = 7 days
- Important tasks (importance 5) get earlier deadlines, optional (1-2) get later deadlines
- Subtask deadlines MUST be before parent task deadline
- Format: "YYYY-MM-DD" (e.g., "2025-11-15")
- NEVER leave deadline empty - always calculate a date

Return ONLY valid JSON with NO markdown, NO code blocks:
{
  "projectName": "string",
  "description": "string",
  "tasks": [
    {
      "title": "string",
      "category": "Design|Art|Code|Audio|Other",
      "difficulty": 1-5,
      "importance": 1-5,
      "deadline": "YYYY-MM-DD",
      "notes": "suggestions, tools, tips, or story ideas if missing",
      "subtasks": [
        {
          "title": "string",
          "category": "Design|Art|Code|Audio|Other",
          "difficulty": 1-5,
          "importance": 1-5,
          "deadline": "YYYY-MM-DD",
          "notes": "string"
        }
      ]
    }
  ]
}

REQUIRED TASK COVERAGE (for ANY game):
1. Design (importance 5): Story, core mechanics, level design, game design document
2. Art (importance 4-5): Character sprites, environment, UI elements, animations, VFX
3. Code (importance 5): Player movement, core mechanics, UI system, save system, menus, settings
4. Audio (importance 3-4): Background music, sound effects, audio mixing
5. Testing (importance 4): Playtesting, bug fixes, balancing, polish

Rules:
- Create 6-8 main tasks covering ALL categories above
- Each task: 3-4 subtasks with specific details
- Keep titles simple without special characters
- Notes should suggest tools, techniques, or missing story elements
- ALWAYS calculate and include deadlines (never empty string)
- Balance importance: 4-5 for core features, 3 for standard features, 1-2 for optional`
      
    } else if (action === 'add_tasks') {
      prompt = `${systemRole}

${contextInfo}

User wants to add tasks: "${message}"

Generate tasks to add to the existing project. Be smart about:
1. Understanding what category the task should be (Design, Art, Code, Audio, Other)
2. Adding relevant subtasks (2-4 per main task)
3. Setting realistic difficulty and importance
4. Calculating deadlines based on difficulty (1 day per difficulty point)
5. Adding helpful notes with suggestions

DEADLINE CALCULATION:
- Start from today or current project timeline
- Difficulty 1 = 1 day, 2 = 2 days, 3 = 3 days, 4 = 5 days, 5 = 7 days
- Format: "YYYY-MM-DD"
- Subtask deadlines BEFORE parent deadline

Return ONLY valid JSON with NO markdown, NO code blocks:
{
  "tasks": [
    {
      "title": "string",
      "category": "Design|Art|Code|Audio|Other",
      "difficulty": 1-5,
      "importance": 1-5,
      "deadline": "YYYY-MM-DD",
      "notes": "helpful suggestions",
      "subtasks": [
        {
          "title": "string",
          "category": "Design|Art|Code|Audio|Other",
          "difficulty": 1-5,
          "importance": 1-5,
          "deadline": "YYYY-MM-DD",
          "notes": "string"
        }
      ]
    }
  ]
}

Create 1-4 tasks based on request. Keep titles simple, no special characters.`
      
    } else {
      // Smart chat mode - detect intent
      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('shortcut') || lowerMessage.includes('keyboard') || lowerMessage.includes('key')) {
        prompt = `${systemRole}

${contextInfo}

User is asking about keyboard shortcuts: "${message}"

List the relevant keyboard shortcuts from the list above and explain how to use them. Be specific and helpful.`
        
      } else if (lowerMessage.includes('how') || lowerMessage.includes('help') || lowerMessage.includes('issue') || lowerMessage.includes('problem') || lowerMessage.includes('error')) {
        prompt = `${systemRole}

${contextInfo}

User needs help: "${message}"

Provide step-by-step help. Reference keyboard shortcuts if relevant. Be specific about what buttons to click or actions to take.`
        
      } else if (lowerMessage.includes('task') && (lowerMessage.includes('complete') || lowerMessage.includes('done') || lowerMessage.includes('finish'))) {
        prompt = `${systemRole}

${contextInfo}

User wants to complete tasks: "${message}"

Explain how to mark tasks complete:
1. Click the checkbox next to the task
2. Or use 'X' keyboard shortcut when focused
3. Subtasks complete automatically when parent is checked

Be encouraging and mention their progress!`
        
      } else {
        prompt = `${systemRole}

${contextInfo}

User: "${message}"

Respond naturally and helpfully. Suggest actions they can take, shortcuts they can use, or features that might help. Keep it conversational (2-4 sentences).`
      }
    }

    // Call Gemini API
    console.log('Calling Gemini API...')
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          }
        })
      }
    )

    console.log('Gemini API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    // Extract JSON if present
    let result
    if (action === 'generate_project' || action === 'add_tasks') {
      let jsonText = generatedText
      
      // Extract from markdown code blocks
      if (generatedText.includes('```json')) {
        jsonText = generatedText.split('```json')[1].split('```')[0].trim()
      } else if (generatedText.includes('```')) {
        jsonText = generatedText.split('```')[1].split('```')[0].trim()
      }
      
      // Clean up common JSON issues
      // Remove any trailing commas before } or ]
      jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1')
      
      try {
        result = JSON.parse(jsonText)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        console.error('Failed JSON text:', jsonText.substring(0, 500))
        throw new Error('AI generated invalid JSON. Please try again with a simpler request.')
      }
    } else {
      result = { response: generatedText }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
