import { Habit } from '@/features/habits/types'
import { HabitCompletion } from '@/features/tracking/types'
import { JournalEntry } from '@/features/journal/types'
import { UserLevelProgress, AchievementItem } from '@/features/gamification/types'

interface ContextData {
  displayName: string
  habits: Habit[]
  completions: HabitCompletion[]
  journals: JournalEntry[]
  levelProgress: UserLevelProgress
  achievements: AchievementItem[]
  currentStreak: number
}

const SYSTEM_INSTRUCTIONS = `
You are Loop AI, a supportive, warm, and highly practical habit coach for a productivity app named Loop.
Your goal is to help users recognize patterns, celebrate achievements, and make small, positive modifications.
CRITICAL RULES:
1. Ground every single claim, insight, or suggestion in the actual user data provided below.
2. NEVER fabricate, hallucinate, or make up completion rates, habit names, streaks, or dates.
3. If no data exists for a specific query (e.g. no journals or no completions), state that clearly and encourage them to log their first entry.
4. Never shame the user or trigger guilt about missed habits. Keep feedback constructive, encouraging, and focused on incremental progress.
5. Provide response content formatted in clean, structured Markdown (use headings, bullet points, and highlight key metrics).
`.trim()

export function buildSystemPrompt(): string {
  return SYSTEM_INSTRUCTIONS
}

export function serializeUserContext(data: ContextData): string {
  const { displayName, habits, completions, journals, levelProgress, achievements, currentStreak } = data

  const habitsSummary = habits
    .map(
      (h) =>
        `- ${h.title} (Category: ${h.category}, Freq: ${h.frequency}, Difficulty: ${h.difficulty}${
          h.isArchived ? ', Archived' : ''
        })`
    )
    .join('\n')

  const recentCompletions = completions
    .slice(-50) // last 50 completions
    .map((c) => `- ${c.date}: Habit ID ${c.habitId} (${c.completed ? 'Completed' : 'Skipped'})`)
    .join('\n')

  const recentJournals = journals
    .slice(-15) // last 15 journal entries
    .map((j) => `- Date: ${j.date}, Mood: ${j.mood || 'N/A'}, Energy Level: ${j.energyLevel || 'N/A'}, Stress Level: ${j.stressLevel || 'N/A'}\n  Notes: "${j.notes || ''}"\n  Gratitude: ${j.gratitude?.join(', ') || 'None'}\n  Wins: ${j.wins?.join(', ') || 'None'}\n  Challenges: ${j.challenges?.join(', ') || 'None'}\n  Tomorrow's Focus: ${j.tomorrowFocus || 'None'}\n  Tags: ${j.tags?.join(', ') || 'None'}`)
    .join('\n\n')

  const achievementsList = achievements
    .filter((a) => a.unlocked)
    .map((a) => `- ${a.title}: ${a.description}`)
    .join('\n')

  return `
User: ${displayName}
Current Streak: ${currentStreak} days
Current Level: Level ${levelProgress.level} (Total XP: ${levelProgress.totalXp})

--- ACTIVE HABITS ---
${habitsSummary || 'No habits created yet.'}

--- RECENT COMPLETIONS LOG ---
${recentCompletions || 'No habit completions logged yet.'}

--- RECENT JOURNAL & MOOD LOGS ---
${recentJournals || 'No journal entries logged yet.'}

--- EARNED ACHIEVEMENTS ---
${achievementsList || 'No achievements unlocked yet.'}
`.trim()
}

export function buildDailySummaryPrompt(data: ContextData): string {
  return `
Based on the following user data context, generate a concise, encouraging "Today's Summary" report.
Include:
1. Completed habits count vs remaining habits count for today.
2. Streak status update.
3. Today's journal writing status.
4. XP progress and unlocked achievements (if any).
Keep the response extremely brief, inspiring, and direct.

User Context:
${serializeUserContext(data)}
`.trim()
}

export function buildWeeklyReviewPrompt(data: ContextData): string {
  return `
Based on the following user data context, generate a detailed "Weekly Review" report.
Include:
1. Weekly overall completion rate (%).
2. Most successful habit of the week.
3. Habit skipped most often.
4. Most productive day of the week.
5. Productivity trends by Category.
6. Mood correlation summary.
7. Three highly actionable, non-shaming suggestions for the upcoming week.
Format each section with clear headers.

User Context:
${serializeUserContext(data)}
`.trim()
}

export function buildMonthlyReviewPrompt(data: ContextData): string {
  return `
Based on the following user data context, generate a comprehensive "Monthly Review" report.
Include:
1. Overall habit consistency rate.
2. Core habit trends and progress trajectories.
3. Mood & stress level correlations (highlight energy patterns).
4. Journal reflections summary (frequent themes/tags).
5. Level progression, XP milestones, and achievements.
6. Biggest improvement observed.
7. Primary focus area suggestion for next month.
Format in detailed markdown sections.

User Context:
${serializeUserContext(data)}
`.trim()
}

export function buildRecommendationsPrompt(data: ContextData): string {
  return `
Analyze the user's completion history, journals, stress levels, and active routines.
Suggest:
1. Optimized reminder times based on when they succeed.
2. Micro-habits (breaking large goals into smaller ones).
3. Complementary habits to link (habit stacking).
4. Inactive habits that might need to be archived or simplified.
Provide concrete, friendly, data-supported advice.

User Context:
${serializeUserContext(data)}
`.trim()
}
