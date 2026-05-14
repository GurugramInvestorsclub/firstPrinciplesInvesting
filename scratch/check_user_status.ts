import { prisma } from "../src/lib/prisma";

async function main() {
  const email = 'support@firstprinciplesresearch.in';
  console.log(`Checking membership for email: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      insightsSubscriptions: {
        include: {
          charges: true
        }
      }
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('User ID:', user.id);
  console.log('Subscriptions:', JSON.stringify(user.insightsSubscriptions, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
