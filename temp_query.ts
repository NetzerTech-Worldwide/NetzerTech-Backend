import { DataSource } from 'typeorm';
import { User, Student } from './src/entities';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  entities: [User, Student],
});

AppDataSource.initialize().then(async () => {
  const user = await AppDataSource.getRepository(User).findOne({
    where: { userType: 'secondary_student' as any },
    relations: ['student'],
  });
  if (!user) {
    console.log('No student found!');
    process.exit(0);
  }
  
  const payload = { sub: user.id, username: user.email, role: user.userType };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '100d' });
  
  console.log('--- TEST USER CREDENTIALS ---');
  console.log('Email:', user.email);
  console.log('User ID:', user.id);
  console.log('Student ID:', user.student?.id);
  console.log('Role:', user.userType);
  console.log('\n--- LONG LIVED JWT TOKEN ---');
  console.log(token);
  process.exit(0);
}).catch(console.error);
