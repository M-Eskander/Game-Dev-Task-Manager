# AI Assistant Setup Guide

This guide explains how to set up the AI Assistant feature with Supabase Edge Functions and Google Gemini API.

## Prerequisites

1. A Supabase project
2. Supabase CLI installed ([Installation Guide](https://supabase.com/docs/guides/cli))
3. A free Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Setup Steps

### 1. Install Supabase CLI

If you haven't already:

```bash
# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or use npm
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link Your Project

```bash
supabase link --project-ref your-project-ref
```

Find your project ref in your Supabase project URL: `https://app.supabase.com/project/[YOUR-PROJECT-REF]`

### 4. Set Environment Variable

Set your Gemini API key as an environment secret:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Deploy the Edge Function

```bash
supabase functions deploy ai-assistant
```

### 6. Test the Function

You can test it locally first:

```bash
# Serve functions locally
supabase functions serve

# In another terminal, test it
curl -i --location --request POST 'http://localhost:54321/functions/v1/ai-assistant' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"message": "Create a project for a 2D platformer", "action": "generate_project"}'
```

## How It Works

The AI Assistant can:

1. **Generate New Projects**: Say "Create a project for [game description]"
2. **Add Tasks to Current Project**: Say "Add tasks for [feature]"
3. **Chat**: Ask questions about your project or get suggestions

The Edge Function:
- Accepts user messages from the frontend
- Determines the action type (generate_project, add_tasks, or chat)
- Calls Google Gemini API with appropriate prompts
- Returns structured JSON responses
- No API key required from users!

## Troubleshooting

### Function deployment fails
- Make sure you're logged in: `supabase login`
- Verify project is linked: `supabase link --project-ref your-project-ref`

### API key not working
- Make sure you set it correctly: `supabase secrets list`
- Get a new key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### CORS errors
- The function includes CORS headers for all origins
- If issues persist, check your Supabase project settings

## Cost

- Google Gemini API: **FREE** tier includes 60 requests per minute
- Supabase Edge Functions: **FREE** tier includes 500,000 invocations per month

Perfect for small to medium teams! 🚀

