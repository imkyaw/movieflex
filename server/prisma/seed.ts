import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const movies = [
  ['The Shawshank Redemption', 'Two imprisoned men forge a lasting friendship.', 'Drama', 'Frank Darabont', '1994-09-23', 'R16', 142, 1499, 12],
  ['The Godfather', 'A reluctant son enters his family crime empire.', 'Crime', 'Francis Ford Coppola', '1972-03-24', 'R16', 175, 1599, 8],
  ['The Dark Knight', 'Batman confronts a criminal mastermind spreading chaos.', 'Action', 'Christopher Nolan', '2008-07-18', 'M', 152, 1399, 15],
  ['Spirited Away', 'A girl enters a mysterious world ruled by spirits.', 'Animation', 'Hayao Miyazaki', '2001-07-20', 'PG', 125, 1299, 10],
  ['Parasite', 'A struggling family infiltrates a wealthy household.', 'Thriller', 'Bong Joon Ho', '2019-05-30', 'R13', 132, 1499, 9],
  ['Interstellar', 'Explorers travel through a wormhole to save humanity.', 'Science Fiction', 'Christopher Nolan', '2014-11-07', 'M', 169, 1599, 14],
  ['The Grand Budapest Hotel', 'A concierge and lobby boy become unlikely allies.', 'Comedy', 'Wes Anderson', '2014-03-28', 'M', 99, 1199, 7],
  ['Mad Max: Fury Road', 'Survivors flee a tyrant across a desert wasteland.', 'Action', 'George Miller', '2015-05-15', 'R16', 120, 1399, 11],
  ['Arrival', 'A linguist attempts to communicate with alien visitors.', 'Science Fiction', 'Denis Villeneuve', '2016-11-11', 'M', 116, 1299, 13],
  ['Moonlight', 'A young man searches for identity and belonging.', 'Drama', 'Barry Jenkins', '2016-10-21', 'M', 111, 1199, 6],
  ['Knives Out', 'A detective investigates a novelist’s suspicious death.', 'Mystery', 'Rian Johnson', '2019-11-27', 'M', 130, 1399, 16],
  ['The Social Network', 'The turbulent creation of a social media company.', 'Drama', 'David Fincher', '2010-10-01', 'M', 120, 1099, 9],
  ['Coco', 'A young musician journeys through the Land of the Dead.', 'Animation', 'Lee Unkrich', '2017-11-22', 'PG', 105, 1099, 18],
  ['Get Out', 'A weekend visit reveals a terrifying conspiracy.', 'Horror', 'Jordan Peele', '2017-02-24', 'R16', 104, 1299, 8],
  ['Dune: Part Two', 'Paul Atreides unites with the Fremen against his enemies.', 'Science Fiction', 'Denis Villeneuve', '2024-03-01', 'M', 166, 1699, 20],
] as const;

async function main() {
  await prisma.orderDetail.deleteMany();
  await prisma.order.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        cognitoSub: 'local-admin',
        email: 'admin@movieflex.local',
        name: 'MovieFlex Admin',
        role: 'ADMIN',
      },
      {
        cognitoSub: 'local-user',
        email: 'user@movieflex.local',
        name: 'MovieFlex User',
        role: 'USER',
      },
    ],
  });

  await prisma.movie.createMany({
    data: movies.map(
      ([title, description, genre, director, releaseDate, classification, runtimeMinutes, priceCents, stock]) => ({
        title,
        description,
        genre,
        director,
        releaseDate: new Date(`${releaseDate}T00:00:00.000Z`),
        classification,
        runtimeMinutes,
        priceCents,
        stock,
      }),
    ),
  });

  console.log(`Seeded 2 users and ${movies.length} movies.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
