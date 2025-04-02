import 'reflect-metadata'; // Required for TypeORM
import { createConnection } from '../config/database.connection';
import { seedDatabase } from './seeds';

async function runSeeds() {
  try {
    const connection = await createConnection();
    await seedDatabase(connection);

    console.log('Seeding completed successfully');

    // Close the connection after seeding
    await connection.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
