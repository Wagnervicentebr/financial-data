import { prisma } from "@/lib/prisma";

async function main() {
  const count = await prisma.demoItem.count();
  console.log("count:", count);
  const items = await prisma.demoItem.findMany();
  console.log("items:", items);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
