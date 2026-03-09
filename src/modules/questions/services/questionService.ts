import { PrismaClient } from '@prisma/client';
import { CreateQuestionPayload, GetQuestionsFilters, PaginatedQuestions, UpdateQuestionPayload } from '../types';

// Depending on your project's Prisma setup, you might import a shared instance.
// For now, we instantiate or use a global to prevent multiple instances in dev.
import { prisma } from '@/lib/prisma'; // Assuming this exists, if not we'll create/adjust it.

export async function createQuestion(data: CreateQuestionPayload) {
    return prisma.question.create({
        data: {
            name: data.name || null,
            email: data.email || null,
            topic: data.topic,
            question: data.question,
            source: data.source || 'website'
        }
    });
}

export async function getQuestions(filters: GetQuestionsFilters): Promise<PaginatedQuestions> {
    const { search, topic, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {};

    if (status) {
        where.status = status;
    }

    if (topic) {
        where.topic = topic;
    }

    if (search) {
        where.OR = [
            { question: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { topic: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [questions, total] = await Promise.all([
        prisma.question.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.question.count({ where })
    ]);

    return {
        questions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
}

export async function updateQuestion(id: string, data: UpdateQuestionPayload) {
    return prisma.question.update({
        where: { id },
        data
    });
}

export async function deleteQuestion(id: string) {
    return prisma.question.delete({
        where: { id }
    });
}
