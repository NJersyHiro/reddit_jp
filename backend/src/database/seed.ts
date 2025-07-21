import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        slug: 'gaming',
        name: 'Gaming',
        nameJa: 'ゲーミング',
        description: 'Discussion about video games',
        descriptionJa: 'ビデオゲームについての議論',
        iconUrl: '/icons/gaming.svg',
      },
    }),
    prisma.category.create({
      data: {
        slug: 'career',
        name: 'Career',
        nameJa: 'キャリア',
        description: 'Career advice and discussions',
        descriptionJa: 'キャリアアドバイスと議論',
        iconUrl: '/icons/career.svg',
      },
    }),
    prisma.category.create({
      data: {
        slug: 'parenting',
        name: 'Parenting',
        nameJa: '子育て',
        description: 'Parenting tips and support',
        descriptionJa: '子育てのヒントとサポート',
        iconUrl: '/icons/parenting.svg',
      },
    }),
    prisma.category.create({
      data: {
        slug: 'life',
        name: 'Life',
        nameJa: '生活',
        description: 'General life discussions',
        descriptionJa: '一般的な生活の議論',
        iconUrl: '/icons/life.svg',
      },
    }),
    prisma.category.create({
      data: {
        slug: 'investing',
        name: 'Investing',
        nameJa: '投資',
        description: 'Investment and finance discussions',
        descriptionJa: '投資と金融の議論',
        iconUrl: '/icons/investing.svg',
        minKarmaToPost: 10,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'demo@itaita.jp',
        username: 'demo_user',
        displayName: 'Demo User',
        passwordHash: await hashPassword('demo123456'),
        karmaScore: 100,
        postKarma: 80,
        commentKarma: 20,
        bio: 'Just a demo user testing the platform',
      },
    }),
    prisma.user.create({
      data: {
        email: 'gamer@example.com',
        username: 'RPGHunter88',
        displayName: 'RPG Hunter',
        passwordHash: await hashPassword('password123'),
        karmaScore: 250,
        postKarma: 200,
        commentKarma: 50,
        bio: 'Love playing RPGs and sharing tips!',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample threads
  const threads = await Promise.all([
    prisma.thread.create({
      data: {
        categoryId: categories[0].id, // Gaming
        userId: users[1].id,
        title: 'Tips for the new RPG boss in Chapter 5',
        content: 'I found a strategy that works really well against the fire boss. First, make sure you have ice magic equipped...',
        tags: ['tips', 'rpg', 'boss-fight'],
        score: 245,
        upvoteCount: 250,
        downvoteCount: 5,
        commentCount: 43,
      },
    }),
    prisma.thread.create({
      data: {
        categoryId: categories[1].id, // Career
        userId: null,
        title: 'Best side hustles in 2024 for software engineers',
        content: 'Here are some side hustles that have worked well for me as a developer...',
        isAnonymous: true,
        anonymousName: 'Anonymous Developer',
        tags: ['side-hustle', 'career', 'software'],
        score: 189,
        upvoteCount: 195,
        downvoteCount: 6,
        commentCount: 67,
      },
    }),
  ]);

  console.log(`✅ Created ${threads.length} threads`);

  // Create sample comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        threadId: threads[0].id,
        userId: users[0].id,
        content: 'Great tips! I also found that using the shield spell right before his big attack helps a lot.',
        score: 45,
        upvoteCount: 47,
        downvoteCount: 2,
        path: '',
        depth: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${comments.length} comments`);

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });