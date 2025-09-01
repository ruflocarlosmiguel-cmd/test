// Reset localStorage for testing (remove in production)
// localStorage.removeItem("surveyLogs");

function checkAll() {
  let results = {};

  // collect all 20 answers
  for (let i = 1; i <= 20; i++) {
    let selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (selected) {
      results[`q${i}`] = parseInt(selected.value);
    } else {
      results[`q${i}`] = null;
    }
  }

  let logs = [];

  // === Composite Mean ===
  let sum = 0, count = 0;
  for (let key in results) {
    if (results[key] !== null) {
      sum += results[key];
      count++;
    }
  }

  let mean = null, conclusion = "";
  if (count > 0) {
    mean = sum / count;
    logs.push("Composite Mean Score: " + mean.toFixed(2));

    if (mean >= 4.0) {
      conclusion = "Highly identifies as 'the reliable one'.";
    } else if (mean >= 3.0) {
      conclusion = "Moderately identifies.";
    } else {
      conclusion = "Low or no identification.";
    }
    logs.push("Conclusion: " + conclusion);
  }

  // === Subscales ===
  function getMean(range) {
    let s = 0, c = 0;
    for (let i of range) {
      if (results[`q${i}`] !== null) {
        s += results[`q${i}`];
        c++;
      }
    }
    return c > 0 ? s / c : null;
  }

  let subscales = {
    SP: getMean([1,2,3,4,5]),
    PP: getMean([6,7,8,9,10]),
    BI: getMean([11,12,13,14,15]),
    CV: getMean([16,17,18,19,20])
  };

  logs.push("Self-Perception Mean: " + subscales.SP.toFixed(2));
  logs.push("Peer Perception Mean: " + subscales.PP.toFixed(2));
  logs.push("Behavioral Indicator Mean: " + subscales.BI.toFixed(2));
  logs.push("Cultural Value Mean: " + subscales.CV.toFixed(2));

  // === Profile Classification ===
  let profiles = [];

  // specific rules
  if (subscales.CV >= 4.0) profiles.push("Culturally Motivated");
  if (subscales.SP >= 4.0 && subscales.BI >= 4.0) profiles.push("Emotionally Burdened");
  if (subscales.PP >= 4.0 && subscales.BI >= 4.0 && subscales.SP < 4.0) profiles.push("Silent Supporter");
  if (mean >= 4.0 && results.q14 !== null && results.q14 <= 3) profiles.push("Boundary-Setting");
  if (subscales.PP >= 4.0 && subscales.CV >= 4.0 && subscales.SP <= 3.9) profiles.push("Externally Expected");
  if (subscales.BI >= 4.0 && results.q12 !== null && results.q12 >= 4) profiles.push("Self-Sacrificing");

  // generalized rules
  let SP = subscales.SP, PP = subscales.PP, BI = subscales.BI, CV = subscales.CV;

  function rank(v) {
    if (v >= 4.0) return "H";
    if (v >= 3.0) return "M";
    return "L";
  }

  let pattern = {
    SP: rank(SP),
    PP: rank(PP),
    BI: rank(BI),
    CV: rank(CV)
  };

  if (pattern.SP === "H" && pattern.PP === "H" && pattern.BI === "H" && pattern.CV === "H") profiles.push("The Pillar");
  if (pattern.SP === "H" && pattern.BI === "H" && (pattern.PP === "L" || pattern.CV === "L")) profiles.push("The Silent Burden");
  if (pattern.PP === "H" && pattern.CV === "H" && (pattern.SP === "M" || pattern.SP === "L")) profiles.push("The Expected Helper");
  if (pattern.CV === "H" && (pattern.SP === "M" || pattern.SP === "L") && (pattern.PP === "M" || pattern.PP === "L")) profiles.push("The Cultural Contributor");
  if (pattern.BI === "H" && pattern.SP === "L" && pattern.CV === "L") profiles.push("The Functional Supporter");
  if (pattern.SP === "L" && pattern.PP === "L" && pattern.BI === "L" && pattern.CV === "L") profiles.push("The Boundary Setter");

  logs.push("Profiles: " + (profiles.length > 0 ? profiles.join(", ") : "No specific profile"));

  // === Save to localStorage ===
  let prevLogs = JSON.parse(localStorage.getItem("surveyLogs")) || [];
  prevLogs.push({
    timestamp: new Date().toLocaleString(),
    results,
    mean,
    conclusion,
    subscales,
    profiles,
    logs
  });
  localStorage.setItem("surveyLogs", JSON.stringify(prevLogs));

  alert("Submission saved!");
}
