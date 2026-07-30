import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  // Import dynamically to ensure dotenv has loaded the environment variables first
  const { prisma } = await import("../src/lib/prisma");
  const { computePricingPreview } = await import("../src/lib/payment-service");
  const { userHasInsightsAccess } = await import("../src/lib/insights-subscription-service");

  console.log("--- Starting Pricing Preview Tests ---");

  // 1. Find an event
  const event = await prisma.eventPricing.findFirst();
  if (!event) {
    console.error("No events found in EventPricing table! Please configure one.");
    return;
  }
  console.log(`Using event: ${event.eventId} with price: ${event.price} paise (${event.price / 100} INR)`);

  // 2. Find a user with active subscription access
  const subscribers = await prisma.insightsSubscription.findMany({
    select: {
      userId: true,
      status: true,
      currentEndAt: true,
      user: {
        select: {
          email: true,
        }
      }
    }
  });

  let subscriberUserId: string | null = null;
  let nonSubscriberUserId: string | null = null;

  for (const sub of subscribers) {
    const hasAccess = await userHasInsightsAccess(sub.userId);
    if (hasAccess && !subscriberUserId) {
      subscriberUserId = sub.userId;
      console.log(`Found active subscriber: ${sub.user.email} (Status: ${sub.status}, End: ${sub.currentEndAt})`);
    }
  }

  // Find a user who is not a subscriber
  const allUsers = await prisma.user.findMany({
    take: 50,
    select: {
      id: true,
      email: true,
    }
  });

  for (const u of allUsers) {
    const hasAccess = await userHasInsightsAccess(u.id);
    if (!hasAccess && !nonSubscriberUserId) {
      nonSubscriberUserId = u.id;
      console.log(`Found non-subscriber: ${u.email}`);
    }
  }

  if (!subscriberUserId) {
    console.warn("No active subscriber found in database. We will mock/test with a temporary user.");
  }

  // 3. Test pricing for Subscriber
  if (subscriberUserId) {
    console.log("\n--- Testing pricing for Subscriber ---");
    const pricingSub = await computePricingPreview({
      db: prisma,
      eventId: event.eventId,
      userId: subscriberUserId,
      couponCode: null,
    });
    console.log("Subscriber pricing (no coupon):", JSON.stringify(pricingSub, null, 2));

    // Try applying a coupon code (e.g. "TESTCOUPON" or anything)
    try {
      const pricingSubWithCoupon = await computePricingPreview({
        db: prisma,
        eventId: event.eventId,
        userId: subscriberUserId,
        couponCode: "DISCOUNT50", // It should ignore it and return ₹749
      });
      console.log("Subscriber pricing (with DISCOUNT50 coupon):", JSON.stringify(pricingSubWithCoupon, null, 2));
    } catch (err) {
      console.log("Subscriber pricing (with coupon) threw error (expected/unexpected):", err);
    }
  }

  // 4. Test pricing for Non-Subscriber
  if (nonSubscriberUserId) {
    console.log("\n--- Testing pricing for Non-Subscriber ---");
    const pricingNonSub = await computePricingPreview({
      db: prisma,
      eventId: event.eventId,
      userId: nonSubscriberUserId,
      couponCode: null,
    });
    console.log("Non-subscriber pricing (no coupon):", JSON.stringify(pricingNonSub, null, 2));
  }

  // 5. Test pricing for Guest checkout (isGuest: true)
  if (subscriberUserId) {
    console.log("\n--- Testing pricing for Guest Checkout (using subscriber email id) ---");
    const pricingGuest = await computePricingPreview({
      db: prisma,
      eventId: event.eventId,
      userId: subscriberUserId,
      couponCode: null,
      isGuest: true,
    });
    console.log("Guest pricing (should not show subscriber discount):", JSON.stringify(pricingGuest, null, 2));
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
