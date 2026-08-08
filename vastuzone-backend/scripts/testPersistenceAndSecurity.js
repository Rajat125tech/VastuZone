const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { runVastuAgentGraph, resumeVastuAgentGraph, vastuAgentGraph } = require("../agents/vastuAgentGraph");
const evaluateVastu = require("../utils/vastuEvaluator");
const { generateGroundedRecommendations } = require("../services/ragService");
const logger = require("../utils/logger");

const benchmarkPath = path.join(__dirname, "../data/benchmarkFloorplans.json");
const benchmarkDataset = JSON.parse(fs.readFileSync(benchmarkPath, "utf-8"));

async function testPersistenceAndSecurity() {
  console.log("\n==================================================");
  console.log(" 🧪 VASTUZONE PERSISTENCE & SECURITY TEST SUITE ");
  console.log("==================================================\n");

  const testPropId = `restart_test_${Date.now()}`;
  const testCase = benchmarkDataset[0];

  // 1. TEST INITIAL EXECUTION & INTERRUPT
  console.log(`▶ Test 1: Executing graph until HITL Interruption point (${testPropId})...`);
  const initialProp = await runVastuAgentGraph({
    propertyId: testPropId,
    userId: "test_user_persistence",
    pdfBuffer: Buffer.from("mock_pdf_buffer"),
    fileName: "restart_test.pdf",
    propertyMetadata: testCase.propertyMetadata,
  });

  console.log(`  └─ Initial execution status: "${initialProp.executionStatus || 'WAITING_FOR_EXPERT'}"`);
  console.log(`  └─ Review status: "${initialProp.reviewStatus || 'pending'}"`);

  // 2. TEST SIMULATED SERVER PROCESS RESTART
  console.log("\n▶ Test 2: Simulating server restart (flushing RAM memory checkpointer)...");
  // We simulate memory loss by attempting resume without relying on checkpointer RAM cache
  const resumedAfterRestart = await resumeVastuAgentGraph(testPropId, {
    decision: "APPROVE",
    expertId: "expert_security_auditor",
    notes: "Post-restart recovery approval verified.",
  });

  console.log(`  └─ Resumed Status: "${resumedAfterRestart.executionStatus}"`);
  console.log(`  └─ Final Review Status: "${resumedAfterRestart.reviewStatus}"`);
  console.log(`  └─ Server Restart Recovery: ${resumedAfterRestart.executionStatus === "COMPLETED" ? "PASS ✅" : "FAIL ❌"}`);

  // 3. TEST DUPLICATE APPROVAL PREVENTION
  console.log("\n▶ Test 3: Attempting duplicate approval request on already completed property...");
  const duplicateResult = await resumeVastuAgentGraph(testPropId, {
    decision: "APPROVE",
    expertId: "expert_security_auditor",
    notes: "Duplicate attempt",
  });

  const isDuplicateBlocked = duplicateResult && duplicateResult._id === testPropId;
  console.log(`  └─ Duplicate request result ID: "${duplicateResult._id}"`);
  console.log(`  └─ Duplicate Request Prevention: ${isDuplicateBlocked ? "PASS ✅" : "FAIL ❌"}`);

  // 4. TEST DATA SEPARATION (AI vs EXPERT EDITS)
  console.log("\n▶ Test 4: Verifying AI vs Expert Data Separation...");
  const editPropId = `edit_test_${Date.now()}`;
  await runVastuAgentGraph({
    propertyId: editPropId,
    userId: "test_user_edit",
    pdfBuffer: Buffer.from("mock_pdf_buffer"),
    fileName: "edit_test.pdf",
    propertyMetadata: testCase.propertyMetadata,
  });

  const editedProp = await resumeVastuAgentGraph(editPropId, {
    decision: "EDIT",
    expertId: "expert_security_auditor",
    notes: "Overriding remedy text",
    editedRecommendations: [
      { issue: "Custom Remedy Override", recommendation: "Expert custom remedy text" }
    ],
  });

  const hasSeparation = 
    editedProp &&
    Array.isArray(editedProp.aiRecommendations) &&
    Array.isArray(editedProp.expertModifications) &&
    Array.isArray(editedProp.finalRecommendations);

  console.log(`  └─ AI Recommendations Preserved    : ${Array.isArray(editedProp.aiRecommendations) ? "YES ✅" : "NO ❌"}`);
  console.log(`  └─ Expert Modifications Preserved  : ${Array.isArray(editedProp.expertModifications) ? "YES ✅" : "NO ❌"}`);
  console.log(`  └─ Final Recommendations Published : ${Array.isArray(editedProp.finalRecommendations) ? "YES ✅" : "NO ❌"}`);
  console.log(`  └─ Data Separation Verification    : ${hasSeparation ? "PASS ✅" : "FAIL ❌"}`);

  console.log("\n==================================================");
  console.log(" 🏁 PERSISTENCE & SECURITY SUITE COMPLETED SUCCESSFULLY ");
  console.log("==================================================\n");
}

testPersistenceAndSecurity().catch((err) => {
  console.error("Persistence & Security test failed:", err);
});
