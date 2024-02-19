import { Command } from "commander";
const program = new Command();

program.name("toad").description("CLI crypto portfolio tracker");

program
  .command("fund")
  .description("Fund wallet with USD")
  .argument("value", "USD value to fund wallet with")
  .action((val) => {
    console.log(`funded with ${val} USD`);
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

program.parse();
