function evaluateVastu(data) {
  let score = 0;
  const tips = [];
  const roomWarnings = [];
  if (data.propertyShape === "Square" || data.propertyShape === "Rectangle") {
    score += 10;
  } else {
    score += 4;
    tips.push("Irregular room shapes may disturb energy flow. Indoor plants can help balance it.");
  }
  if (["North", "East", "North-East"].includes(data.facing)) {
    score += 20;
  } else {
    score += 8;
    tips.push("South or West facing properties may require vastu balancing remedies.");
  }

  if (["North", "East"].includes(data.entrance)) {
    score += 20;
  } else if (data.entrance === "South") {
    score -= 10;
    roomWarnings.push("Main entrance facing South may affect prosperity.");
  }
  if (["North", "East", "North-East"].includes(data.livingRoomDirection)) {
    score += 10;
  } else {
    score += 5;
    roomWarnings.push("Living room should ideally be in North, East, or North-East.");
  }

  if (data.kitchenDirection === "South-East") {
    score += 10;
  } else {
    score += 4;
    roomWarnings.push("Kitchen is best placed in the South-East direction.");
  }
  if (["North", "North-West"].includes(data.bathroomDirection)) {
    score += 8;
  } else {
    score += 3;
    roomWarnings.push("Bathrooms should ideally be in North or North-West.");
  }
  if (data.masterBedroomDirection === "South-West") {
    score += 10;
  } else {
    score += 5;
    roomWarnings.push("Master bedroom is best located in the South-West.");
  }
  if (["West", "North-West"].includes(data.kidsBedroomDirection)) {
    score += 6;
  } else {
    score += 3;
    roomWarnings.push("Kids bedroom should ideally be in West or North-West.");
  }
  if (data.poojaRoomDirection === "North-East") {
    score += 10;
  } else if (["North", "East"].includes(data.poojaRoomDirection)) {
    score += 7;
  } else {
    score += 3;
    roomWarnings.push("Pooja room should ideally be in the North-East.");
  }
  score = Math.max(0, Math.min(100, score));
  let scoreBand = "";
  let scoreColor = "";

  if (score >= 80) {
    scoreBand = "Excellent";
    scoreColor = "green";
  } else if (score >= 60) {
    scoreBand = "Good (Minor Corrections Needed)";
    scoreColor = "orange";
  } else {
    scoreBand = "Needs Vastu Remedies";
    scoreColor = "red";
  }

  return {
    vastuScore: score,
    scoreBand,
    scoreColor,
    vastuTips: tips,
    roomWarnings,
  };
}

module.exports = evaluateVastu;
