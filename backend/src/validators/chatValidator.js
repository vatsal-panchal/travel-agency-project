import { z } from 'zod';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant'], {
    errorMap: () => ({ message: "Only 'user' and 'assistant' roles are permitted in history" }),
  }),
  content: z.string().trim().min(1).max(1000),
});

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(500, 'Message cannot exceed 500 characters'),
  history: z.array(chatMessageSchema).max(6, 'History cannot exceed 6 messages').optional().default([]),
});
