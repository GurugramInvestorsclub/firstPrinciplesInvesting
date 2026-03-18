const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Attempting to connect to the database...');
    await prisma.$connect();
    console.log('Successfully connected to the database.');
    
    console.log('Attempting to query users...');
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
