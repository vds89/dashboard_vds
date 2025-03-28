import bcrypt from 'bcrypt';
import postgres from 'postgres';
import fs from 'fs';

// Load the data from the JSON file
const data = JSON.parse(fs.readFileSync('data_vds.json', 'utf8'));

// Parse the data into a list of dictionaries
const data_list = data.map(item => ({
  date: item.date,
  income: parseFloat(item.Income.replace(',', '.').replace(' ', '')),
  outcome: parseFloat(item.Outcome.replace(',', '.').replace(' ', ''))
}));

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function seedFinancialData() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS financial_data (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      date DATE NOT NULL,
      income FLOAT NOT NULL,
      outcome FLOAT NOT NULL
    );
  `;

  const insertedData = await Promise.all(
    data_list.map(record => sql`
      INSERT INTO financial_data (date, income, outcome)
      VALUES (${record.date}, ${record.income}, ${record.outcome})
      ON CONFLICT (id) DO NOTHING;
    `)
  );

  return insertedData;
}

export async function GET() {
  try {
    const result = await sql.begin(sql => [
      seedFinancialData()
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}