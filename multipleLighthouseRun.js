#!/usr/bin/env node

const {
  validatingParametersAndFetchURLSourceType,
  URLSourceType,
  handleFileCase,
  handleURLCase
} = require("./utilities.js");

const argument = process.argv;
let urlSource = argument[2] || "https://www.google.com" ;
let runLimit = argument[3] || 1;
let platform = argument[4] || "desktop";

let otherParameters = argument.slice(5, argument.length).join(" ");

let urlSourceType = validatingParametersAndFetchURLSourceType({ urlSource, runLimit, platform });

const result = {};

switch(urlSourceType) {
  case URLSourceType.File:
    handleFileCase({filePath: urlSource, runLimit, platform, otherParameters, result})
    break;
  case URLSourceType.URL:
    handleURLCase({url: urlSource, runLimit, platform, otherParameters, result})
    break;
}

const FileSystem = require("fs");
 FileSystem.writeFile('./result.json', JSON.stringify(result), (error) => {
    if (error) throw error;
  });

console.log("\x1b[32m", `All finished`, "\x1b[0m");
