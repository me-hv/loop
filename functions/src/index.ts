import { onSchedule } from 'firebase-functions/v2/scheduler'
import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

// Helper: check if a hour is within quiet hours
function isWithinQuietHours(
  currentHour: number,
  start: string,
  end: string
): boolean {
  const startH = Number(start.split(':')[0])
  const endH = Number(end.split(':')[0])
  
  if (startH === endH) return false

  if (startH < endH) {
    return currentHour >= startH && currentHour < endH
  } else {
    // Over midnight quiet hours
    return currentHour >= startH || currentHour < endH
  }
}

// 1. Scheduled Reminders: runs every 15 minutes to inspect global and per-habit reminder times
export const checkHabitReminders = onSchedule('*/15 * * * *', async () => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0-6 (Sun-Sat)
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  
  // Format current HH:MM
  const currentHhMm = `${String(currentHour).padStart(2, '0')}:${String(Math.floor(currentMinute / 15) * 15).padStart(2, '0')}`

  // Fetch all active reminders matching this scheduled slot
  const remindersSnap = await db.collection('reminders')
    .where('enabled', '==', true)
    .where('times', 'array-contains', currentHhMm)
    .get()

  const batch = db.batch()

  for (const docSnap of remindersSnap.docs) {
    const reminder = docSnap.data()
    const { userId, habitId, days, customMessage } = reminder

    // Verify repeat day matches
    if (days && !days.includes(dayOfWeek)) continue

    // Get user preferences and quiet hours gating rules
    const settingsDoc = await db.collection('notificationSettings').doc(userId).get()
    if (!settingsDoc.exists) continue
    const settings = settingsDoc.data()!

    if (!settings.enabled || !settings.preferences.habitReminders) continue

    // Quiet hours suppress check
    if (settings.quietHoursEnabled) {
      if (isWithinQuietHours(currentHour, settings.quietHoursStart, settings.quietHoursEnd)) {
        console.log(`Notification suppressed for user ${userId} due to Quiet Hours: ${settings.quietHoursStart} - ${settings.quietHoursEnd}`)
        continue
      }
    }

    // Weekend reminders suppress check
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    if (isWeekend && !settings.weekendReminders) continue

    // Determine message text
    let habitTitle = 'your habit'
    if (habitId !== 'global') {
      const habitDoc = await db.collection('habits').doc(habitId).get()
      if (habitDoc.exists) {
        habitTitle = habitDoc.data()!.title
      }
    }

    const titleText = 'Loop Reminder'
    const bodyText = customMessage || `Time for your daily routine: ${habitTitle}!`

    // A. Add In-App Notification log
    const notificationRef = db.collection('notifications').doc()
    batch.set(notificationRef, {
      userId,
      title: titleText,
      message: bodyText,
      type: 'reminder',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: habitId === 'global' ? '/dashboard/today' : `/dashboard/habits/${habitId}`,
      relatedId: habitId
    })

    // B. Query FCM Device tokens and send push notifications
    const tokensSnap = await db.collection('fcmTokens').where('userId', '==', userId).get()
    const tokens = tokensSnap.docs.map(t => t.data().token)

    if (tokens.length > 0) {
      try {
        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: {
            title: titleText,
            body: bodyText,
          },
          data: {
            actionUrl: habitId === 'global' ? '/dashboard/today' : `/dashboard/habits/${habitId}`,
          }
        })
      } catch (err) {
        console.error(`FCM multicast failed for user ${userId}:`, err)
      }
    }
  }

  await batch.commit()
})

// 2. Scheduled Daily Summary: runs every day at 9:00 PM
export const checkDailySummary = onSchedule('0 21 * * *', async () => {
  // Query all users that have daily summaries enabled
  const settingsSnap = await db.collection('notificationSettings')
    .where('enabled', '==', true)
    .where('preferences.dailySummaries', '==', true)
    .get()

  for (const docSnap of settingsSnap.docs) {
    const settings = docSnap.data()
    const userId = settings.userId

    // Calculate daily completions count and remaining habits count
    const todayStr = new Date().toISOString().split('T')[0]
    
    const habitsSnap = await db.collection('habits')
      .where('userId', '==', userId)
      .where('isDeleted', '==', false)
      .get()
    const habits = habitsSnap.docs.map(h => ({ id: h.id, ...h.data() }))

    const completionsSnap = await db.collection('habitCompletions')
      .where('userId', '==', userId)
      .where('date', '==', todayStr)
      .get()
    const completedCount = completionsSnap.size

    const totalCount = habits.length
    const remainingCount = Math.max(0, totalCount - completedCount)

    const titleText = 'Daily Summary Review'
    const bodyText = `You completed ${completedCount} habits today! ${remainingCount} habits remaining. Keep up the consistency!`

    // Add In-App Alert
    await db.collection('notifications').add({
      userId,
      title: titleText,
      message: bodyText,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/dashboard/analytics'
    })

    // Send FCM push alerts
    const tokensSnap = await db.collection('fcmTokens').where('userId', '==', userId).get()
    const tokens = tokensSnap.docs.map(t => t.data().token)

    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: titleText,
          body: bodyText,
        }
      })
    }
  }
})

// 3. Scheduled Weekly Summary: runs every Sunday at 8:00 PM
export const checkWeeklySummary = onSchedule('0 20 * * 0', async () => {
  const settingsSnap = await db.collection('notificationSettings')
    .where('enabled', '==', true)
    .where('preferences.weeklySummaries', '==', true)
    .get()

  for (const docSnap of settingsSnap.docs) {
    const settings = docSnap.data()
    const userId = settings.userId

    const titleText = 'Weekly Consistency Review'
    const bodyText = "Your weekly habits report is ready. Visit the analytics page to view your completion rate trends!"

    await db.collection('notifications').add({
      userId,
      title: titleText,
      message: bodyText,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/dashboard/analytics'
    })

    const tokensSnap = await db.collection('fcmTokens').where('userId', '==', userId).get()
    const tokens = tokensSnap.docs.map(t => t.data().token)

    if (tokens.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: titleText,
          body: bodyText,
        }
      })
    }
  }
})
