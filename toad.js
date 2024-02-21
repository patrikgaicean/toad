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
    if (isNaN(Number(amount))) {
      console.error("Invalid input for amount:", amount);
      return;
    }
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

program
  .command("buy")
  .description("Buy ticker with USD")
  .argument("ticker", "Coin ticker")
  .argument("price", "Coin price")
  .argument("amount", "Amount of coins purchased")
  .action((ticker, price, amount) => {
    ticker = ticker.toUpperCase();

    if (isNaN(Number(price))) {
      console.error("Invalid input for price:", price);
      return;
    }
    price = Number(price);

    if (isNaN(Number(amount))) {
      console.error("Invalid input for amount:", amount);
      return;
    }
    amount = Number(amount);

    const total = price * amount;

    console.log("ticker", ticker);
    console.log("price", price);
    console.log("amount", amount);

    const select = db.prepare(
      `SELECT id, amount FROM holdings WHERE ticker = ?`,
    );
    const row = select.get("USD");

    if (row.amount < total) {
      console.error(
        `Not enough USD balance: need ${total}, have ${row.amount}`,
      );
    }

    const updateHoldings = db.prepare(`
        UPDATE holdings
        SET amount = ?
        WHERE ticker = ?
      `);
    updateHoldings.run(row.amount - total, "USD");

    const insertHolding = db.prepare(`
      INSERT INTO holdings (ticker, amount)
      VALUES (?, ?)
    `);
    insertHolding.run(ticker, amount);

    const insertTransaction = db.prepare(`
      INSERT INTO transactions (pair, price, amount, total)
      VALUES (?, ?, ?, ?)
    `);
    insertTransaction.run(`${ticker}/USD`, price, amount, total);
  });

program.command("sell").description("Sell ticker for USD");

program
  .command("holdings")
  .description("Display holdings")
  .action(() => {
    const select = db.prepare(`SELECT * FROM holdings`);
    const rows = select.all();
    console.log(rows);
  });

program
  .command("transactions")
  .description("Display transactions")
  .action(() => {
    const select = db.prepare(`SELECT * FROM transactions`);
    const rows = select.all();
    console.log(rows);
  });

main((error) => {
  if (error) {
    console.error(error);
    return;
  }

  program.parse();
});
