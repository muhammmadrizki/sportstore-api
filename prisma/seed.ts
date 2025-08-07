import { PrismaClient } from "../src/generated/prisma";
import { createSlug } from "../src/lib/slug";

import { dataSeedProducts } from "./data/products";

const prisma = new PrismaClient();

async function main() {
  for (const seedProduct of dataSeedProducts) {
    const slug = createSlug(seedProduct.name);

    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        ...seedProduct,
        slug,
      },
    });

    console.log(` Product : ${product.name} (${product.slug})`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
