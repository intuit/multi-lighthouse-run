#!/usr/bin/env node
const execSync = require("child_process").execSync;

function runLighthouse({ url, runLimit, platform, otherParameters }) {
  let runs = 0;
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
    let report = require(`/tmp/report_${i + 1}.json`);
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

function cleaningMemory() {
  try {
    execSync(`rm /tmp/report_*.json`);
    return true;
  } catch (e) {
    console.log("\x1b[31m", "error deleting files", "\x1b[0m", e);
    return false;
  }
}

function validatingParameters({ url, runLimit, platform }) {
  let isValidPlatform =
    platform.toLowerCase() === "desktop" || platform.toLowerCase() === "mobile";
  if (!isValidHttpUrl(url)) {
    throw Error("Enter a valid URL");
  }

  if (runLimit < 1) {
    throw Error("Enter value greater than 1");
  }

  if (!isValidPlatform) {
    throw Error("Enter either desktop or mobile");
  }
  return true;
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
  const avgScore = {};
  avgScore.Performance = Number(
    (totalScores.Performance / runLimit).toFixed(2)
  );
  avgScore.Accessibility = Number(
    (totalScores.Accessibility / runLimit).toFixed(2)
  );
  avgScore["Best Practices"] = Number(
    (totalScores["Best Practices"] / runLimit).toFixed(2)
  );
  avgScore.Seo = Number((totalScores.Seo / runLimit).toFixed(2));
  avgScore.PWA = Number((totalScores.PWA / runLimit).toFixed(2));

  const avgMetrics = {};
  avgMetrics.FCP = Number((totalMetrics.FCP / runLimit).toFixed(2));
  avgMetrics.LCP = Number((totalMetrics.LCP / runLimit).toFixed(2));
  avgMetrics["Speed Index"] = Number(
    (totalMetrics["Speed Index"] / runLimit).toFixed(2)
  );
  avgMetrics.TTI = Number((totalMetrics.TTI / runLimit).toFixed(2));
  avgMetrics.TBT = Number((totalMetrics.TBT / runLimit).toFixed(2));
  avgMetrics.CLS = Number((totalMetrics.CLS / runLimit).toFixed(2));

  console.log(
    "************************** Generated Report *****************************"
  );

  console.table({ Scores: avgScore });
  console.table({ Metrics: avgMetrics });
  console.table({ Percentiles: percentile });
}

module.exports = {
  runLighthouse,
  getAllReports,
  isValidHttpUrl,
  cleaningMemory,
  validatingParameters,
  generatingTable,
};
