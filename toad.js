import Database from "better-sqlite3";
const db = new Database("toad.db");
db.pragma("journal_mode = WAL");

import { Command } from "commander";
const program = new Command();

import { exec } from "child_process";
import dotenv from "dotenv";
dotenv.config();

function main(callback) {
  const driver = process.env.GOOSE_DRIVER;
  const dbstring = process.env.GOOSE_DBSTRING;
  const migrationDir = process.env.GOOSE_MIGRATION_DIR;
  const migrateDb = `
    GOOSE_DRIVER=${driver}
    GOOSE_DBSTRING=${dbstring}
    GOOSE_MIGRATION_DIR=${migrationDir}
    goose up
  `;

  exec(migrateDb, (error) => {
    if (error) {
      console.error("Database migration failed:", error);
      callback(error);
    } else {
      callback();
    }
  });
}

program.name("toad").description("CLI crypto portfolio tracker");

program
  .command("fund")
  .description("Fund wallet with USD")
  .argument("value", "USD value to fund wallet with")
  .action((amount) => {
    amount = Number(amount);

    const select = db.prepare(
      `SELECT id, amount FROM holdings WHERE ticker = ?`,
    );
    const row = select.get("USD");

    if (!row) {
      const insert = db.prepare(`
        INSERT INTO holdings (ticker, amount)
        VALUES (?, ?)
      `);

      insert.run("USD", amount);
    } else {
      const update = db.prepare(`
        UPDATE holdings
        SET amount = ?
        WHERE ticker = ?
      `);

      update.run(amount + row.amount, "USD");
    }
  });

program.command("buy").description("Buy ticker with USD");

program.command("sell").description("Sell ticker for USD");

program
  .command("holdings")
  .description("Display holdings")
  .action(() => {
    console.log("all them holdings in this table:\nsomecoin - 500");
  });

program.command("transactions").description("Display transactions");

main((error) => {
  if (error) {
    console.error(error);
    return;
  }

  program.parse();
});
