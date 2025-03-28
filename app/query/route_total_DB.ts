// Import Prisma client instance
import prisma from '@/lib/prisma'; // Update the path if necessary

// Function to test database connection and fetch all records
async function testDatabaseConnection() {
  try {
    // Fetch all records from vds_finance table
    const records = await prisma.vds_finance.findMany();
    return { message: 'Database is reachable!', data: records };
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw new Error('Database connection failed');
  }
}

// API GET Handler
export async function GET() {
  try {
    const response = await testDatabaseConnection();
    return Response.json(response);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to connect to the database' }, { status: 500 });
  }
}
