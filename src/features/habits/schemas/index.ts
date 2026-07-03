import * as z from 'zod'

export const habitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(50, 'Title cannot exceed 50 characters'),
  description: z.string().trim().optional(),
  category: z.enum([
    'Health',
    'Fitness',
    'Reading',
    'Coding',
    'Learning',
    'Meditation',
    'Finance',
    'Business',
    'Personal',
    'Custom',
  ]),
  color: z.string().min(1, 'Please select a color'),
  icon: z.string().min(1, 'Please select an icon'),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Weekdays', 'Weekends', 'Custom']),
  goal: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number().positive('Goal must be greater than zero')
  ),
  unit: z.enum(['Times', 'Minutes', 'Hours', 'Pages', 'Kilometers', 'Liters', 'Custom']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isArchived: z.boolean().default(false),
  notes: z.string().trim().optional(),
})
