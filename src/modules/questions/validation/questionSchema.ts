import { z } from 'zod';
import { QuestionStatus } from '@prisma/client';

export const questionTopics = [
    'Stock Specific',
    'Portfolio Strategy',
    'Sector Analysis',
    'Macro / Market Outlook',
    'Risk Management',
    'General Investing'
] as const;

export const createQuestionSchema = z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    topic: z.enum([...questionTopics, 'Other'] as [string, ...string[]]),
    question: z.string().min(10, 'Question must be at least 10 characters').max(500, 'Question must be under 500 characters'),
    source: z.string().optional()
});

export const updateQuestionSchema = z.object({
    answer: z.string().optional(),
    status: z.nativeEnum(QuestionStatus).optional()
});
