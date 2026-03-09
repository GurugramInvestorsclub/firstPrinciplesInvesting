import { QuestionStatus } from '@prisma/client';

export interface Question {
    id: string;
    name: string | null;
    email: string | null;
    topic: string;
    question: string;
    answer: string | null;
    source: string | null;
    status: QuestionStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateQuestionPayload {
    name?: string;
    email?: string;
    topic: string;
    question: string;
    source?: string;
}

export interface UpdateQuestionPayload {
    answer?: string;
    status?: QuestionStatus;
}

export interface GetQuestionsFilters {
    search?: string;
    topic?: string;
    status?: QuestionStatus;
    page?: number;
    limit?: number;
}

export interface PaginatedQuestions {
    questions: Question[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
