import bcrypt from "bcryptjs";
import { makePrisma } from "../src/lib/prisma";

const prisma = makePrisma();

async function main() {
  const senhaHash = await bcrypt.hash("admin123", 10);

  const gestor = await prisma.user.upsert({
    where: { email: "gestor@reciclesg.com" },
    update: {},
    create: {
      name: "Gestor ReciclESG",
      email: "gestor@reciclesg.com",
      password: senhaHash,
      role: "GESTOR",
    },
  });

  const senhaAssoc = await bcrypt.hash("assoc123", 10);

  const userAssoc = await prisma.user.upsert({
    where: { email: "associacao@reciclesg.com" },
    update: {},
    create: {
      name: "Associação Teste",
      email: "associacao@reciclesg.com",
      password: senhaAssoc,
      role: "ASSOCIACAO",
    },
  });

  await prisma.associacao.upsert({
    where: { userId: userAssoc.id },
    update: {},
    create: {
      nome: "ASCAMARES",
      municipio: "Limoeiro do Norte",
      populacao: 60000,
      userId: userAssoc.id,
    },
  });

  console.log("✅ Seed concluído");
  console.log("Gestor:", gestor.email, "/ Senha: admin123");
  console.log("Associação:", userAssoc.email, "/ Senha: assoc123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
