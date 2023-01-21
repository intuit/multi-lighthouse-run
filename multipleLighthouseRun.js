#!/usr/bin/env node

const {
  validatingParametersAndFetchURLSourceType,
  URLSource,
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
  case URLSource.File:
    handleFileCase({urlSource, runLimit, platform, otherParameters, result})
    break;
  case URLSource.URL:
    handleURLCase({urlSource, runLimit, platform, otherParameters, result})
    break;
}
if(urlSourceType == URLSource.File) {
  

} else if(urlSourceType == URLSource.URL) {
  
} else {
  result[urlSource] = {msg : "Invalid URL source"};
}

const FileSystem = require("fs");
 FileSystem.writeFile('./result.json', JSON.stringify(result), (error) => {
    if (error) throw error;
  });

console.log("\x1b[32m", `All finished`, "\x1b[0m");
