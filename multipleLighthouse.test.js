#!/usr/bin/env node
const cProcess = require("child_process");

const mockData = {
  urlSource: "https://intuit.com",
  runLimit: 5,
  platform: "desktop",
};

const {
  isValidHttpUrl,
  validatingParametersAndFetchURLSourceType,
  URLSource,
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

describe("Validating Parameters", () => {
  it("should validate parameters", () => {
    let result = validatingParametersAndFetchURLSourceType({ ...mockData });
    expect(result).toBe(URLSource.URL);
  });
});
