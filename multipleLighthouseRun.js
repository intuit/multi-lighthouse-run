#!/usr/bin/env node

const {
  runLighthouse,
  getAllReports,
  isValidHttpUrl,
  cleaningMemory,
  validatingParameters,
  generatingTable,
} = require("./utilities");

const argument = process.argv;
let url = argument[2] || "https://www.google.co.in";
let runs = 0;
let runLimit = argument[3] || 1;
let platform = argument[4] || "desktop";

let otherParameters = argument.slice(5, argument.length).join(" ");

validatingParameters({ url, runLimit, platform });

console.log(
  "\x1b[36m%s\x1b[0m",
  "Lighthouse will run on " + "\x1b[4m" + "\x1b[1m" + url,
  "\x1b[36m" + `for\x1b[1m ${runLimit} times\x1b[0m \x1b[36mfor ${platform}`,
  "\x1b[0m"
);
runLighthouse({ url, runLimit, platform, otherParameters });

const reports = getAllReports(runLimit);

generatingTable(reports, runLimit);

cleaningMemory();

console.log("\x1b[32m", `All finished`, "\x1b[0m");
