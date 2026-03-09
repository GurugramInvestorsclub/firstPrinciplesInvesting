import { NextResponse } from 'next/server';
import { createQuestion, getQuestions } from '@/modules/questions/services/questionService';
import { createQuestionSchema } from '@/modules/questions/validation/questionSchema';
import { GetQuestionsFilters } from '@/modules/questions/types';
import { z } from 'zod';

// Simple in-memory rate limiter 
// Maps IP to { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const limitWindowMs = 60 * 60 * 1000; // 1 hour
    const maxRequests = 5;

    const userRecord = rateLimitMap.get(ip);
    if (!userRecord) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + limitWindowMs });
        return true;
    }

    if (now > userRecord.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + limitWindowMs });
        return true;
    }

    if (userRecord.count >= maxRequests) {
        return false;
    }

    userRecord.count++;
    return true;
}

export async function POST(req: Request) {
    try {
        // Basic IP extraction (works for many setups, but behind proxies might need 'x-forwarded-for')
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: 'Too Many Requests. Maximum 5 questions per hour limit reached.' }, { status: 429 });
        }

        const body = await req.json();
        const validatedData = createQuestionSchema.parse(body);

        const question = await createQuestion(validatedData);

        return NextResponse.json(question, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }
        console.error('Error creating question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // Build filters from search params
        const filters: GetQuestionsFilters = {
            search: searchParams.get('search') || undefined,
            topic: searchParams.get('topic') || undefined,
            status: searchParams.get('status') as any || undefined, // Type cast assuming valid enum value
            page: searchParams.has('page') ? parseInt(searchParams.get('page')!) : 1,
            limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : 20,
        };

        const result = await getQuestions(filters);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
