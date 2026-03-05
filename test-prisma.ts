import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const registrations = await prisma.registration.findMany()
        console.log('Success!', registrations)
    } catch (error) {
        console.error('Prisma Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
