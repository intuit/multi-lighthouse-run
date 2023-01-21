#!/usr/bin/env node
const execSync = require("child_process").execSync;

function runLighthouse({ url, runLimit, platform, otherParameters }) {
  let runs = 0;
  console.log(`Running performance tests for ${url}`)
  do {
    console.log(`Running performance test ${runs + 1}`);
    try {
      execSync(
        `lighthouse ${url} --quiet --preset=${platform} --chrome-flags="--headless" --output-path=/tmp/report_${
          runs + 1
        }.json --output json ${otherParameters}`
      );
    } catch (err) {
      console.log(
        `\x1b[31mPerformance test ${runs + 1} failed`,
        "\x1b[0m",
        err
      );
      break;
    }
    console.log(
      `\x1b[32mFinished running performance test ${runs + 1}`,
      "\x1b[0m"
    );
    runs++;
  } while (runs < runLimit);
}

function getAllReports(runLimit) {
  const reports = [];
  for (let i = 0; i < runLimit; i++) {
    let filePath = `/tmp/report_${i + 1}.json`;
    let report = requireUncached(filePath);
    cleaningMemory(filePath)
    reports.push(report);
  }
  return reports;
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function isValidJSONFilePath(file) {
  return /^\.\/([A-z0-9-_+]+\/)*([A-z0-9]+\.(json))$/.test(file);
}

function cleaningMemory(filePath) {
  try {
    execSync(`rm ${filePath}`);
    return true;
  } catch (e) {
    console.log("\x1b[31m", "error deleting file ${filePath}", "\x1b[0m", e);
    return false;
  }
}

function validatingParametersAndFetchURLSourceType({ urlSource, runLimit, platform }) {
  let isValidPlatform =
    platform.toLowerCase() === "desktop" || platform.toLowerCase() === "mobile";

  if (runLimit < 1) {
    throw Error("Enter value greater than 1");
  }

  if (!isValidPlatform) {
    throw Error("Enter either desktop or mobile");
  }
  if (!isValidJSONFilePath(urlSource)) {
    if (!isValidHttpUrl(urlSource)) {
      throw Error("Enter a valid URL or valid JSON file path")
    } else {
      return URLSource.URL;
    }
  } else {
    return URLSource.File;
  }
}

function handleFileCase({urlSource, runLimit, platform, otherParameters, result}) {
  const data = require(urlSource);
    console.log("Running multilighthouse on ", data);

    for(let i = 0; i < data.urls.length; i++) {
      let url = data.urls[i];
      if(!isValidHttpUrl(url)) {
        result[url] = {msg : "Invalid URL"};
      } else {
        runLighthouse({ url, runLimit, platform, otherParameters});
        const reports = getAllReports(runLimit);
        result[url] = generatingTable(reports, runLimit);
      }
    }
}

function handleURLCase({urlSource, runLimit, platform, otherParameters, result}) {
  console.log("Running multilighthouse on ", urlSource);

    runLighthouse({ url: urlSource, runLimit, platform, otherParameters });
    const reports = getAllReports(runLimit);
    result[urlSource] = generatingTable(reports, runLimit);
}

function generatingTable(reports, runLimit) {
  const totalScores = {
    Performance: 0,
    Accessibility: 0,
    "Best Practices": 0,
    Seo: 0,
    PWA: 0,
  };

  const totalMetrics = {
    FCP: 0,
    "Speed Index": 0,
    LCP: 0,
    TTI: 0,
    TBT: 0,
    CLS: 0,
  };

  let performanceScores = [];

  for (let i = 0; i < reports.length; i++) {
    totalScores.Performance += reports[i].categories.performance.score * 100;
    performanceScores.push(reports[i].categories.performance.score * 100);
    totalScores.Accessibility +=
      reports[i].categories.accessibility.score * 100;
    totalScores["Best Practices"] +=
      reports[i].categories["best-practices"].score * 100;
    totalScores.Seo += reports[i].categories.seo.score * 100;
    totalScores.PWA += reports[i].categories.pwa.score * 100;

    totalMetrics.FCP +=
      reports[i].audits["first-contentful-paint"].numericValue;
    totalMetrics["Speed Index"] +=
      reports[i].audits["speed-index"].numericValue;
    totalMetrics.TTI += reports[i].audits["interactive"].numericValue;
    totalMetrics.TBT += reports[i].audits["total-blocking-time"].numericValue;
    totalMetrics.CLS +=
      reports[i].audits["cumulative-layout-shift"].numericValue;
    totalMetrics.LCP +=
      reports[i].audits["largest-contentful-paint"].numericValue;
  }

  performanceScores.sort((a, b) => b - a);
  const percentile = {
    p50th: performanceScores[Math.floor(performanceScores.length * 0.5)],
    p90th: performanceScores[Math.floor(performanceScores.length * 0.9)],
  };
  const score = {};
  score.Performance = Number(
    (totalScores.Performance / runLimit).toFixed(2)
  );
  score.Accessibility = Number(
    (totalScores.Accessibility / runLimit).toFixed(2)
  );
  score["Best Practices"] = Number(
    (totalScores["Best Practices"] / runLimit).toFixed(2)
  );
  score.Seo = Number((totalScores.Seo / runLimit).toFixed(2));
  score.PWA = Number((totalScores.PWA / runLimit).toFixed(2));

  const metrics = {};
  metrics.FCP = Number((totalMetrics.FCP / runLimit).toFixed(2));
  metrics.LCP = Number((totalMetrics.LCP / runLimit).toFixed(2));
  metrics["Speed Index"] = Number(
    (totalMetrics["Speed Index"] / runLimit).toFixed(2)
  );
  metrics.TTI = Number((totalMetrics.TTI / runLimit).toFixed(2));
  metrics.TBT = Number((totalMetrics.TBT / runLimit).toFixed(2));
  metrics.CLS = Number((totalMetrics.CLS / runLimit).toFixed(2));

  console.log(
    "************************** Generated Report *****************************"
  );

  return {score, metrics, percentile};

}

const URLSource = {
	URL: "url",
	File: "file"
}

module.exports = {
  runLighthouse,
  getAllReports,
  isValidHttpUrl,
  cleaningMemory,
  validatingParametersAndFetchURLSourceType,
  generatingTable,
  URLSource,
  handleFileCase,
  handleURLCase
};
