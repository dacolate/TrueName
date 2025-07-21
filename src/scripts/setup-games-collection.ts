// scripts/setup-games-collection.ts
import { MongoClient } from "mongodb";
import "../lib/envConfig.js"; // Adjust path if needed

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

interface Game {
  _id?: string;
  id?: string; // Optional custom id field
  date: Date;
  generatedNumber: number;
  result: boolean;
  balanceChange: number;
  newBalance: number;
  userId: string;
}

const sampleGames: Game[] = [
  {
    id: "1752962542177",
    date: new Date("2025-07-18T10:30:00.000Z"),
    generatedNumber: 74,
    result: true,
    balanceChange: 100,
    newBalance: 1100,
    userId: "user_123",
  },
  {
    id: "1752962542178",
    date: new Date("2025-07-18T11:00:00.000Z"),
    generatedNumber: 25,
    result: false,
    balanceChange: -50,
    newBalance: 1050,
    userId: "user_123",
  },
  {
    id: "1752962542179",
    date: new Date("2025-07-18T11:45:00.000Z"),
    generatedNumber: 89,
    result: true,
    balanceChange: 150,
    newBalance: 1200,
    userId: "user_456",
  },
  {
    id: "1752962542180",
    date: new Date("2025-07-18T12:15:00.000Z"),
    generatedNumber: 3,
    result: false,
    balanceChange: -100,
    newBalance: 1100,
    userId: "user_456",
  },
];

async function setupGamesCollection() {
  if (!uri) throw new Error("Please define MONGODB_URI in your .env");
  if (!dbName) throw new Error("Please define MONGODB_DB in your .env");
  const client = new MongoClient(uri);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();

    const db = client.db(dbName);
    console.log(`📊 Connected to database: ${dbName}`);

    // Check if games collection already exists
    const collections = await db.listCollections().toArray();
    const gamesCollectionExists = collections.some(
      (col) => col.name === "games"
    );

    if (gamesCollectionExists) {
      console.log("⚠️  Games collection already exists!");
      const choice = process.argv.includes("--force") ? "y" : "n";

      if (choice.toLowerCase() === "y" || process.argv.includes("--force")) {
        console.log("🗑️  Dropping existing games collection...");
        await db.collection("games").drop();
      } else {
        console.log("❌ Operation cancelled. Use --force flag to override.");
        return;
      }
    }

    // Create games collection
    console.log("📦 Creating games collection...");
    const gamesCollection = db.collection<Game>("games");

    // Create indexes for better performance
    console.log("📝 Creating indexes...");
    await gamesCollection.createIndex({ userId: 1 });
    await gamesCollection.createIndex({ date: -1 });
    await gamesCollection.createIndex({ result: 1 });
    await gamesCollection.createIndex({ generatedNumber: 1 });
    await gamesCollection.createIndex({ userId: 1, date: -1 });
    await gamesCollection.createIndex({ userId: 1, result: 1 });

    // Insert sample games
    console.log("🎮 Inserting sample games...");
    const result = await gamesCollection.insertMany(sampleGames);
    console.log(`✅ Inserted ${result.insertedCount} games successfully!`);

    // Display inserted games
    console.log("\n📋 Games in collection:");
    const games = await gamesCollection.find({}).toArray();
    games.forEach((game, index) => {
      console.log(
        `${index + 1}. Game #${game._id} - ${game.result} (${
          game.generatedNumber
        }) - Balance: ${game.balanceChange > 0 ? "+" : ""}${
          game.balanceChange
        } → ${game.newBalance}`
      );
    });

    console.log("\n🎉 Games collection setup completed successfully!");
    console.log(`📊 Total games: ${games.length}`);
  } catch (error) {
    console.error("❌ Error setting up games collection:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔐 MongoDB connection closed.");
  }
}

// Run the script
if (require.main === module) {
  setupGamesCollection()
    .then(() => {
      console.log("🏁 Script execution completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

export { setupGamesCollection };
