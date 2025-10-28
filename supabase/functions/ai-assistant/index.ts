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
    const { message, projectContext, action, conversationHistory = [] } = await req.json()
    
    console.log('Received request:', { message, action, hasContext: !!projectContext, historyLength: conversationHistory.length })
    
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

GENERATE THE RIGHT NUMBER OF TASKS for this specific project:

Analyze the project complexity and generate appropriate tasks:
- Simple game (platformer, puzzle): 8-12 tasks across all categories
- Medium game (adventure, shooter): 15-20 tasks across all categories
- Complex game (RPG, strategy): 25-35 tasks across all categories

MUST include tasks from ALL categories (Design, Art, Code, Audio):
- Design: Story, mechanics, level design, GDD
- Art: Characters, environments, UI, animations
- Code: Player systems, mechanics, menus, save system
- Audio: Music, SFX, ambient

Generate ONLY what's needed - don't add filler tasks!

JSON STRUCTURE (NO DEVIATIONS ALLOWED):
{
  "projectName": "string",
  "description": "string",
  "tasks": [
    {
      "title": "Game Design Document",
      "category": "Design",
      "difficulty": 3,
      "importance": 5,
      "deadline": "2025-11-01",
      "notes": "Create comprehensive GDD",
      "subtasks": [
        {"title": "Define core mechanics", "category": "Design", "difficulty": 2, "importance": 5, "deadline": "2025-10-30", "notes": "Document movement and gameplay"},
        {"title": "Write story outline", "category": "Design", "difficulty": 2, "importance": 4, "deadline": "2025-10-31", "notes": "Main plot and characters"}
      ]
    },
    {
      "title": "Character Art Assets",
      "category": "Art",
      "difficulty": 4,
      "importance": 5,
      "deadline": "2025-11-05",
      "notes": "Create all character sprites",
      "subtasks": [
        {"title": "Sketch character designs", "category": "Art", "difficulty": 2, "importance": 5, "deadline": "2025-11-03", "notes": "Concept art for main character"},
        {"title": "Create sprite sheets", "category": "Art", "difficulty": 3, "importance": 5, "deadline": "2025-11-04", "notes": "Idle, walk, jump animations"}
      ]
    },
    {
      "title": "Player Movement System",
      "category": "Code",
      "difficulty": 5,
      "importance": 5,
      "deadline": "2025-11-10",
      "notes": "Implement core movement mechanics",
      "subtasks": [
        {"title": "Basic movement controls", "category": "Code", "difficulty": 3, "importance": 5, "deadline": "2025-11-08", "notes": "WASD or arrow keys"},
        {"title": "Physics and collision", "category": "Code", "difficulty": 4, "importance": 5, "deadline": "2025-11-09", "notes": "Gravity and collision detection"}
      ]
    },
    {
      "title": "Audio Integration",
      "category": "Audio",
      "difficulty": 3,
      "importance": 3,
      "deadline": "2025-11-15",
      "notes": "Add music and sound effects",
      "subtasks": [
        {"title": "Background music", "category": "Audio", "difficulty": 2, "importance": 3, "deadline": "2025-11-13", "notes": "Compose or license BGM"},
        {"title": "Sound effects", "category": "Audio", "difficulty": 2, "importance": 3, "deadline": "2025-11-14", "notes": "Jump, collect, hit sounds"}
      ]
    }
  ]
}

ABSOLUTE RULES:
1. Generate appropriate number based on project complexity (8-35 tasks)
2. MUST include tasks from ALL 4 categories: Design, Art, Code, Audio
3. Each task has 2-4 subtasks with specific details
4. ALL deadlines filled (YYYY-MM-DD, future dates only)
5. Titles: simple, SHORT, no quotes, no special characters
6. Tasks SPECIFIC to user's game description
7. Notes: Concise (one sentence max) to avoid token limits
8. Quality over quantity - only generate what's truly needed`
      
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
      
    } else if (action === 'delete_tasks') {
      prompt = `${systemRole}

${contextInfo}

User wants to delete tasks: "${message}"

Current tasks in the project:
${projectContext?.currentTasks?.map((t, i) => `${i + 1}. "${t.title}" (${t.category})`).join('\n') || 'No tasks available'}

Identify which task(s) the user wants to delete based on their message. Match by title keywords.

Return ONLY valid JSON with NO markdown, NO code blocks:
{
  "tasksToDelete": [
    "exact title of task 1",
    "exact title of task 2"
  ],
  "confirmation": "I'll delete: [task names]"
}

Be smart about partial matches (e.g., "delete character art" should match "Character Art Assets").
If unsure, ask for clarification instead of deleting.`
      
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

    // Build conversation history for Gemini API
    const contents = []
    
    // Add previous conversation messages
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })
    })
    
    // Add current prompt
    contents.push({
      parts: [{ text: prompt }]
    })
    
    // Call Gemini API
    console.log('Calling Gemini API with', contents.length, 'messages in history...')
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
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
        
        // Fix deadlines for ALL actions that generate tasks
        const today = new Date()
        const formatDate = (daysFromNow) => {
          const d = new Date(today)
          d.setDate(d.getDate() + daysFromNow)
          return d.toISOString().split('T')[0]
        }
        
        // Fix past deadlines in tasks (for both generate_project and add_tasks)
        if ((action === 'generate_project' || action === 'add_tasks') && result.tasks) {
          console.log('Fixing deadlines for', result.tasks.length, 'tasks...')
          
          result.tasks = result.tasks.map((task, index) => {
            // Check if deadline is in the past
            const taskDeadline = new Date(task.deadline)
            if (isNaN(taskDeadline.getTime()) || taskDeadline < today) {
              console.log(`Fixing past deadline for task: ${task.title}`)
              task.deadline = formatDate(3 + (index * 3)) // Spread tasks over time
            }
            
            // Fix subtask deadlines
            if (task.subtasks) {
              task.subtasks = task.subtasks.map((subtask, subIndex) => {
                const subtaskDeadline = new Date(subtask.deadline)
                const parentDeadline = new Date(task.deadline)
                
                // If subtask deadline is invalid or after parent, fix it
                if (isNaN(subtaskDeadline.getTime()) || subtaskDeadline >= parentDeadline || subtaskDeadline < today) {
                  const daysBeforeParent = Math.max(1, Math.floor((parentDeadline - today) / (1000 * 60 * 60 * 24)) - (task.subtasks.length - subIndex))
                  subtask.deadline = formatDate(Math.max(1, daysBeforeParent))
                }
                
                return subtask
              })
            }
            
            return task
          })
        }
        
        // FORCE ALL CATEGORIES for generate_project action
        if (action === 'generate_project' && result.tasks) {
          console.log('Validating task categories...')
          
          // Count existing categories
          const categoryCounts = {
            'Design': 0,
            'Art': 0,
            'Code': 0,
            'Audio': 0,
            'Other': 0
          }
          
          result.tasks.forEach(task => {
            if (categoryCounts[task.category] !== undefined) {
              categoryCounts[task.category]++
            }
          })
          
          console.log('Category counts:', categoryCounts)
          console.log('Today is:', today.toISOString().split('T')[0])
          
          // Only add 1-2 default tasks if a category is COMPLETELY MISSING (has 0 tasks)
          const missingTasks = []
          
          if (categoryCounts.Design === 0) {
            console.log('Design category missing - adding 2 default tasks')
            const needed = 2
            const designTasks = [
              {
                title: "Game Design Document",
                category: "Design",
                difficulty: 3,
                importance: 5,
                deadline: formatDate(3),
                notes: "Create comprehensive design document outlining core mechanics and gameplay",
                subtasks: [
                  {title: "Define core mechanics", category: "Design", difficulty: 2, importance: 5, deadline: formatDate(1), notes: "Document movement, combat, and interaction systems"},
                  {title: "Write story outline", category: "Design", difficulty: 2, importance: 4, deadline: formatDate(2), notes: "Main plot, characters, and world lore"}
                ]
              },
              {
                title: "Level Design",
                category: "Design",
                difficulty: 4,
                importance: 4,
                deadline: formatDate(7),
                notes: "Plan level layouts and progression",
                subtasks: [
                  {title: "Sketch level layouts", category: "Design", difficulty: 2, importance: 4, deadline: formatDate(5), notes: "Paper prototypes of main levels"},
                  {title: "Define difficulty curve", category: "Design", difficulty: 3, importance: 4, deadline: formatDate(6), notes: "Balance progression and challenge"}
                ]
              },
              {
                title: "Character and Story Design",
                category: "Design",
                difficulty: 3,
                importance: 5,
                deadline: formatDate(10),
                notes: "Design characters, backstories, and narrative arcs",
                subtasks: [
                  {title: "Main character design", category: "Design", difficulty: 2, importance: 5, deadline: formatDate(8), notes: "Personality, abilities, appearance"},
                  {title: "NPC and enemy design", category: "Design", difficulty: 2, importance: 4, deadline: formatDate(9), notes: "Supporting characters and antagonists"}
                ]
              },
              {
                title: "Game Mechanics Documentation",
                category: "Design",
                difficulty: 4,
                importance: 5,
                deadline: formatDate(14),
                notes: "Document all gameplay systems and interactions",
                subtasks: [
                  {title: "Combat system design", category: "Design", difficulty: 3, importance: 5, deadline: formatDate(12), notes: "Attack, defense, combos"},
                  {title: "Progression system", category: "Design", difficulty: 3, importance: 4, deadline: formatDate(13), notes: "Leveling, upgrades, unlocks"}
                ]
              },
              {
                title: "UI/UX Design",
                category: "Design",
                difficulty: 3,
                importance: 4,
                deadline: formatDate(18),
                notes: "Design user interface and user experience flow",
                subtasks: [
                  {title: "Menu flow design", category: "Design", difficulty: 2, importance: 4, deadline: formatDate(16), notes: "Main menu, pause, settings navigation"},
                  {title: "HUD design", category: "Design", difficulty: 2, importance: 4, deadline: formatDate(17), notes: "Health, score, inventory display"}
                ]
              }
            ]
            for (let i = 0; i < Math.min(needed, designTasks.length); i++) {
              missingTasks.push(designTasks[i])
            }
          }
          
          if (categoryCounts.Art === 0) {
            console.log('Art category missing - adding 2 default tasks')
            const needed = 2
            const artTasks = [
              {
                title: "Character Art",
                category: "Art",
                difficulty: 4,
                importance: 5,
                deadline: formatDate(22),
                notes: "Create all character sprites and animations",
                subtasks: [
                  {title: "Character concept art", category: "Art", difficulty: 2, importance: 5, deadline: formatDate(20), notes: "Design main character appearance"},
                  {title: "Sprite sheets", category: "Art", difficulty: 3, importance: 5, deadline: formatDate(21), notes: "Idle, walk, jump, attack animations"}
                ]
              },
              {
                title: "Environment and UI Art",
                category: "Art",
                difficulty: 4,
                importance: 4,
                deadline: formatDate(26),
                notes: "Create background art and user interface elements",
                subtasks: [
                  {title: "Background assets", category: "Art", difficulty: 3, importance: 4, deadline: formatDate(24), notes: "Tiles, props, and environment art"},
                  {title: "UI elements", category: "Art", difficulty: 2, importance: 4, deadline: formatDate(25), notes: "Buttons, menus, health bars, icons"}
                ]
              },
              {
                title: "Enemy and NPC Art",
                category: "Art",
                difficulty: 4,
                importance: 4,
                deadline: formatDate(30),
                notes: "Create sprites for enemies and NPCs",
                subtasks: [
                  {title: "Enemy designs", category: "Art", difficulty: 3, importance: 4, deadline: formatDate(28), notes: "Concept art for all enemies"},
                  {title: "NPC sprites", category: "Art", difficulty: 2, importance: 3, deadline: formatDate(29), notes: "Non-player character sprites"}
                ]
              },
              {
                title: "Visual Effects",
                category: "Art",
                difficulty: 3,
                importance: 3,
                deadline: formatDate(34),
                notes: "Create particle effects and VFX",
                subtasks: [
                  {title: "Combat effects", category: "Art", difficulty: 2, importance: 3, deadline: formatDate(32), notes: "Hit, explosion, magic effects"},
                  {title: "Environmental effects", category: "Art", difficulty: 2, importance: 3, deadline: formatDate(33), notes: "Weather, lighting, atmosphere"}
                ]
              },
              {
                title: "Animations and Polish",
                category: "Art",
                difficulty: 4,
                importance: 4,
                deadline: formatDate(38),
                notes: "Polish all animations and visual elements",
                subtasks: [
                  {title: "Character animations", category: "Art", difficulty: 3, importance: 4, deadline: formatDate(36), notes: "Smooth transitions and movements"},
                  {title: "UI animations", category: "Art", difficulty: 2, importance: 3, deadline: formatDate(37), notes: "Button hovers, menu transitions"}
                ]
              }
            ]
            for (let i = 0; i < Math.min(needed, artTasks.length); i++) {
              missingTasks.push(artTasks[i])
            }
          }
          
          if (categoryCounts.Code === 0) {
            console.log('Code category missing - adding 2 default tasks')
            const needed = 2
            const codeTasks = [
              {
                title: "Core Gameplay Systems",
                category: "Code",
                difficulty: 5,
                importance: 5,
                deadline: formatDate(42),
                notes: "Implement player movement and core mechanics",
                subtasks: [
                  {title: "Player controller", category: "Code", difficulty: 3, importance: 5, deadline: formatDate(40), notes: "Movement, jumping, physics"},
                  {title: "Game mechanics", category: "Code", difficulty: 4, importance: 5, deadline: formatDate(41), notes: "Core gameplay systems and interactions"}
                ]
              },
              {
                title: "UI and Systems",
                category: "Code",
                difficulty: 4,
                importance: 4,
                deadline: formatDate(46),
                notes: "Implement UI, menus, and save system",
                subtasks: [
                  {title: "Menu system", category: "Code", difficulty: 3, importance: 4, deadline: formatDate(44), notes: "Main menu, pause, settings"},
                  {title: "Save/load system", category: "Code", difficulty: 3, importance: 4, deadline: formatDate(45), notes: "Progress saving and data persistence"}
                ]
              },
              {
                title: "Combat and Interaction Systems",
                category: "Code",
                difficulty: 5,
                importance: 5,
                deadline: formatDate(50),
                notes: "Implement combat mechanics and object interactions",
                subtasks: [
                  {title: "Combat system", category: "Code", difficulty: 4, importance: 5, deadline: formatDate(48), notes: "Attack, defense, combos"},
                  {title: "Interaction system", category: "Code", difficulty: 3, importance: 4, deadline: formatDate(49), notes: "Pickups, doors, triggers"}
                ]
              },
              {
                title: "AI and Enemy Systems",
                category: "Code",
                difficulty: 5,
                importance: 4,
                deadline: formatDate(54),
                notes: "Implement enemy AI and behavior",
                subtasks: [
                  {title: "Enemy AI", category: "Code", difficulty: 4, importance: 4, deadline: formatDate(52), notes: "Pathfinding, decision making"},
                  {title: "Boss battles", category: "Code", difficulty: 4, importance: 4, deadline: formatDate(53), notes: "Special boss mechanics and patterns"}
                ]
              },
              {
                title: "Game Systems and Polish",
                category: "Code",
                difficulty: 4,
                importance: 4,
                deadline: formatDate(58),
                notes: "Implement progression, achievements, and polish",
                subtasks: [
                  {title: "Progression system", category: "Code", difficulty: 3, importance: 4, deadline: formatDate(56), notes: "Leveling, unlocks, upgrades"},
                  {title: "Achievement system", category: "Code", difficulty: 2, importance: 3, deadline: formatDate(57), notes: "Track and reward player milestones"}
                ]
              }
            ]
            for (let i = 0; i < Math.min(needed, codeTasks.length); i++) {
              missingTasks.push(codeTasks[i])
            }
          }
          
          if (categoryCounts.Audio === 0) {
            console.log('Audio category missing - adding 2 default tasks')
            const needed = 2
            const audioTasks = [
              {
                title: "Background Music",
                category: "Audio",
                difficulty: 3,
                importance: 4,
                deadline: formatDate(62),
                notes: "Compose or source background music for all areas",
                subtasks: [
                  {title: "Main theme", category: "Audio", difficulty: 3, importance: 4, deadline: formatDate(60), notes: "Title screen and main menu music"},
                  {title: "Level music", category: "Audio", difficulty: 3, importance: 4, deadline: formatDate(61), notes: "Music for different game areas"}
                ]
              },
              {
                title: "Sound Effects",
                category: "Audio",
                difficulty: 3,
                importance: 4,
                deadline: formatDate(66),
                notes: "Create or source all sound effects",
                subtasks: [
                  {title: "Player SFX", category: "Audio", difficulty: 2, importance: 4, deadline: formatDate(64), notes: "Jump, land, hurt, collect sounds"},
                  {title: "Enemy SFX", category: "Audio", difficulty: 2, importance: 3, deadline: formatDate(65), notes: "Enemy attack, hurt, death sounds"}
                ]
              },
              {
                title: "Combat Audio",
                category: "Audio",
                difficulty: 3,
                importance: 4,
                deadline: formatDate(70),
                notes: "Add combat and action sound effects",
                subtasks: [
                  {title: "Weapon sounds", category: "Audio", difficulty: 2, importance: 4, deadline: formatDate(68), notes: "Swing, hit, special attack sounds"},
                  {title: "Impact sounds", category: "Audio", difficulty: 2, importance: 3, deadline: formatDate(69), notes: "Hit reactions, explosions, destruction"}
                ]
              },
              {
                title: "Ambient Audio",
                category: "Audio",
                difficulty: 2,
                importance: 3,
                deadline: formatDate(74),
                notes: "Add environmental and ambient sounds",
                subtasks: [
                  {title: "Environment ambience", category: "Audio", difficulty: 2, importance: 3, deadline: formatDate(72), notes: "Wind, water, forest sounds"},
                  {title: "UI sounds", category: "Audio", difficulty: 1, importance: 3, deadline: formatDate(73), notes: "Button clicks, menu navigation"}
                ]
              },
              {
                title: "Audio Polish and Mixing",
                category: "Audio",
                difficulty: 4,
                importance: 4,
                deadline: formatDate(78),
                notes: "Mix and polish all audio, add music transitions",
                subtasks: [
                  {title: "Audio mixing", category: "Audio", difficulty: 3, importance: 4, deadline: formatDate(76), notes: "Balance music, SFX, and dialogue levels"},
                  {title: "Dynamic music", category: "Audio", difficulty: 3, importance: 3, deadline: formatDate(77), notes: "Music transitions based on gameplay"}
                ]
              }
            ]
            for (let i = 0; i < Math.min(needed, audioTasks.length); i++) {
              missingTasks.push(audioTasks[i])
            }
          }
          
          // Add missing tasks to the result (avoid duplicates)
          if (missingTasks.length > 0) {
            console.log(`Adding ${missingTasks.length} missing tasks to ensure all categories are covered`)
            console.log('Missing task categories:', missingTasks.map(t => t.category).join(', '))
            
            // Get existing task titles (normalized for comparison)
            const existingTitles = result.tasks.map(t => t.title.toLowerCase().trim())
            
            // Only add tasks that don't have similar titles already
            const uniqueMissingTasks = missingTasks.filter(task => {
              const normalizedTitle = task.title.toLowerCase().trim()
              // Check if any existing title contains the key words or vice versa
              const isDuplicate = existingTitles.some(existingTitle => {
                return existingTitle.includes(normalizedTitle.split(' ')[0]) || 
                       normalizedTitle.includes(existingTitle.split(' ')[0])
              })
              return !isDuplicate
            })
            
            console.log(`Filtered to ${uniqueMissingTasks.length} unique tasks (removed ${missingTasks.length - uniqueMissingTasks.length} duplicates)`)
            result.tasks = [...result.tasks, ...uniqueMissingTasks]
          }
          
          // Final validation - count again
          const finalCounts = { Design: 0, Art: 0, Code: 0, Audio: 0, Other: 0 }
          result.tasks.forEach(task => {
            if (finalCounts[task.category] !== undefined) {
              finalCounts[task.category]++
            }
          })
          console.log('Final category counts after adding missing tasks:', finalCounts)
          console.log('Total tasks:', result.tasks.length)
        }
        
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
