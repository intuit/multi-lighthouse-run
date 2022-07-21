#!/usr/bin/env node
const cProcess = require("child_process");

const mockData = {
  url: "https://intuit.com",
  runLimit: 5,
  platform: "desktop",
};

const {
  isValidHttpUrl,
  cleaningMemory,
  validatingParameters,
} = require("./utilities");

jest.spyOn(cProcess, "execSync");

describe("Validating Url", () => {
  it("should validate the url: https://intuit.com", () => {
    let output = isValidHttpUrl("https://intuit.com");
    expect(output).toBe(true);
  });

  it("should validate the url: //intuit.com", () => {
    let output = isValidHttpUrl("//intuit.com");
    expect(output).toBe(false);
  });
});

describe("cleaningMemory", () => {
  it("should attempt to clean the memory", () => {
    cProcess.execSync.mockImplementation(() => true);
    let result = cleaningMemory();
    expect(result).toBe(true);
  });
});

describe("Validating Parameters", () => {
  it("should validate parameters", () => {
    let result = validatingParameters({ ...mockData });
    expect(result).toBe(true);
  });
});
