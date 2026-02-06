const { query } = require('./connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    const userId1 = uuidv4();
    const userId2 = uuidv4();

    const passwordHash1 = await bcrypt.hash('password123', 10);
    const passwordHash2 = await bcrypt.hash('password456', 10);

    await query(
      'INSERT INTO users (id, username, email, password_hash, is_verified) VALUES ($1, $2, $3, $4, $5)',
      [userId1, 'mateus', 'mateus@example.com', passwordHash1, true],
    );

    await query(
      'INSERT INTO users (id, username, email, password_hash, is_verified) VALUES ($1, $2, $3, $4, $5)',
      [userId2, 'alice', 'alice@example.com', passwordHash2, true],
    );

    await query(
      'INSERT INTO user_profiles (id, user_id, display_name, bio, location) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), userId1, 'Mateus Bentes', 'Privacy advocate and open-source enthusiast', 'Brazil'],
    );

    await query(
      'INSERT INTO user_profiles (id, user_id, display_name, bio, location) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), userId2, 'Alice', 'Game modder and developer', 'Germany'],
    );

    const communityId1 = uuidv4();
    const communityId2 = uuidv4();

    await query(
      'INSERT INTO communities (id, name, slug, description, created_by, is_private) VALUES ($1, $2, $3, $4, $5, $6)',
      [communityId1, 'Mount & Blade Modding', 'mb-modding', 'A community for Mount & Blade modders', userId1, false],
    );

    await query(
      'INSERT INTO communities (id, name, slug, description, created_by, is_private) VALUES ($1, $2, $3, $4, $5, $6)',
      [communityId2, 'Free Software', 'free-software', 'Discuss open-source and free software', userId1, false],
    );

    await query(
      'INSERT INTO community_members (id, community_id, user_id, role) VALUES ($1, $2, $3, $4)',
      [uuidv4(), communityId1, userId1, 'admin'],
    );

    await query(
      'INSERT INTO community_members (id, community_id, user_id, role) VALUES ($1, $2, $3, $4)',
      [uuidv4(), communityId1, userId2, 'member'],
    );

    await query(
      'INSERT INTO community_members (id, community_id, user_id, role) VALUES ($1, $2, $3, $4)',
      [uuidv4(), communityId2, userId1, 'admin'],
    );

    console.log('✓ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
