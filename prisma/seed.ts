import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const tableNames = ["Session", "User", "Friends"];

// const deleteAll = async () => {
//   try {
//     for (const tableName of tableNames) {
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call
//       await prisma.raw(`DELETE FROM "${tableName}";`);

//       if (!["Store"].includes(tableName)) {
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-call
//         await prisma.raw(
//           `ALTER SEQUENCE "${tableName}_id_seq" RESTART WITH 1;`,
//         );
//       }
//     }
//   } catch (err) {
//     // eslint-disable-next-line no-console
//     console.error(err);
//   }
// };

const genUniqName = () => {
  return faker.person.fullName();
};

const genUniqUsername = () => {
  return faker.person.fullName().replaceAll(" ", "_").toLowerCase();
};

const genUniqEmail = () => {
  return genUniqUsername() + "@gmail.com";
};

const genUniqUser = () => {
  return {
    uniqName: genUniqUsername(),
    email: genUniqEmail(),
    name: genUniqName(),
  };
};

const main = async () => {
  //   await deleteAll();
  await prisma.user.createMany({
    data: Array(10).map(() => genUniqUser()),
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
