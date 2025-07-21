import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create categories
  const categories = [
    { name: 'Gaming', nameJa: 'ゲーム', slug: 'gaming', description: 'Gaming discussions', descriptionJa: 'ゲームに関する話題' },
    { name: 'Career', nameJa: 'キャリア', slug: 'career', description: 'Career and work discussions', descriptionJa: 'キャリアや仕事に関する話題' },
    { name: 'Parenting', nameJa: '子育て', slug: 'parenting', description: 'Parenting discussions', descriptionJa: '子育てに関する話題' },
    { name: 'Technology', nameJa: 'テクノロジー', slug: 'technology', description: 'Technology discussions', descriptionJa: 'テクノロジーに関する話題' },
    { name: 'Daily Life', nameJa: '日常', slug: 'daily', description: 'Daily life discussions', descriptionJa: '日常生活に関する話題' },
    { name: 'News', nameJa: 'ニュース', slug: 'news', description: 'News and current events', descriptionJa: 'ニュースや時事問題' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`Created category: ${category.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });