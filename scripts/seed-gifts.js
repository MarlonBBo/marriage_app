/*
 * Seed the presentes table with the curated gift list.
 * Usage:
 *   node scripts/seed-gifts.js
 */

const { Pool } = require("pg");
const path = require("path");
const dotenvPath = path.resolve(__dirname, "../.env.local");
require("dotenv").config({ path: dotenvPath });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL não encontrado. Defina em .env.local");
  process.exit(1);
}

const gifts = [
  "Geladeira",
  "Micro-ondas",
  "Airfryer",
  "Liquidificador",
  "Cafeteira",
  "Batedeira",
  "Processador de alimentos",
  "Sanduicheira",
  "Purificador de água",
  "Jogo de panelas",
  "Panela de pressão",
  "Frigideira",
  "Assadeiras",
  "Conjunto de facas",
  "Tábuas de corte",
  "Conchas, espátulas e pegadores",
  "Jogo de talheres",
  "Jogo de pratos",
  "Copos",
  "Taças",
  "Xícaras",
  "Jarras",
  "Jarra de café",
  "Potes organizadores",
  "Porta-temperos",
  "Escorredor de louça",
  "Panos de prato",
  "TV",
  "Cortinas",
  "Cama",
  "Travesseiros",
  "Jogo de lençóis",
  "Fronhas",
  "Mantas",
  "Cobertores",
  "Edredom",
  "Cômoda",
  "Cabides",
  "Ventilador",
  "Kit de banheiro",
  "Toalhas de banho",
  "Toalhas de rosto",
  "Tapete de banheiro",
  "Difusor de aroma",
  "Vassoura",
  "Rodo",
  "Pá de lixo",
  "Baldes",
  "Panos de chão",
  "Varal",
  "Pregadores",
  "Ferro de passar",
  "Cesto para roupas",
  "Tapetes",
];

async function main() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    for (const name of gifts) {
      const existing = await pool.query(
        "SELECT id FROM presentes WHERE nome = $1",
        [name]
      );

      if (existing.rowCount > 0) {
        console.log(`ℹ️  Já existe: ${name}`);
        continue;
      }

      await pool.query(
        "INSERT INTO presentes (nome, data) VALUES ($1, CURRENT_DATE)",
        [name]
      );
      console.log(`✅ Inserido: ${name}`);
    }
  } catch (error) {
    console.error("Erro ao inserir presentes:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
