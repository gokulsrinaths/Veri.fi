import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sponsor = await prisma.user.upsert({
    where: { walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
    update: {},
    create: {
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      role: "SPONSOR",
    },
  });

  const participant = await prisma.user.upsert({
    where: { walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
    update: {},
    create: {
      walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      role: "PARTICIPANT",
    },
  });

  const evChargerTask = await prisma.task.upsert({
    where: { id: "seed-task-ev-charger" },
    update: {},
    create: {
      id: "seed-task-ev-charger",
      sponsorId: sponsor.id,
      title: "Verify EV Charger at Station A",
      description: "Confirm that the EV charging station at the given location is operational. Capture a photo or short video of the charger unit and ensure GPS is enabled.",
      category: "DePIN",
      targetLatitude: 37.7749,
      targetLongitude: -122.4194,
      radiusMeters: 500,
      requiredProofType: "PHOTO",
      expectedObjectLabel: "EV charger",
      rewardAmount: "0.01",
      rewardToken: "CTC",
      confidenceThreshold: 0.7,
      maxSubmissions: 10,
      status: "OPEN",
      scoringWeightsJson: {
        location: 0.3,
        time: 0.15,
        visual: 0.3,
        liveness: 0.1,
        antiFraud: 0.15,
      },
    },
  });

  await prisma.task.upsert({
    where: { id: "seed-task-store" },
    update: {},
    create: {
      id: "seed-task-store",
      sponsorId: sponsor.id,
      title: "Store Open Check",
      description: "Verify that the retail store at the location is open. Capture the storefront with visible opening hours or entrance.",
      category: "Retail",
      targetLatitude: 37.7849,
      targetLongitude: -122.4094,
      radiusMeters: 200,
      requiredProofType: "PHOTO",
      expectedObjectLabel: "store",
      rewardAmount: "0.005",
      rewardToken: "CTC",
      confidenceThreshold: 0.65,
      maxSubmissions: 5,
      status: "OPEN",
      scoringWeightsJson: {
        location: 0.3,
        time: 0.15,
        visual: 0.3,
        liveness: 0.1,
        antiFraud: 0.15,
      },
    },
  });

  await prisma.task.upsert({
    where: { id: "seed-task-event" },
    update: {},
    create: {
      id: "seed-task-event",
      sponsorId: sponsor.id,
      title: "Event Attendance Verification",
      description: "Prove you attended the event by capturing the venue or event signage with GPS and timestamp.",
      category: "Event",
      targetLatitude: 37.7699,
      targetLongitude: -122.4264,
      radiusMeters: 300,
      requiredProofType: "PHOTO",
      expectedObjectLabel: "event",
      rewardAmount: "0.02",
      rewardToken: "CTC",
      confidenceThreshold: 0.7,
      maxSubmissions: 100,
      status: "OPEN",
      scoringWeightsJson: {
        location: 0.25,
        time: 0.2,
        visual: 0.3,
        liveness: 0.15,
        antiFraud: 0.1,
      },
    },
  });

  console.log("Seed complete:", { sponsor: sponsor.walletAddress, participant: participant.walletAddress, tasks: 3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
