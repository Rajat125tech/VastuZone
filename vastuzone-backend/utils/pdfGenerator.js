const PDFDocument = require("pdfkit");

/**
 * Generates a professional Vastu Report PDF
 * @param {Object} property - The property data from DB
 * @param {Object} report - The calculated Vastu report results
 * @returns {Promise<Buffer>} - PDF Buffer
 */
function generatePropertyPDF(property, report) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // --- PDF DESIGN ---

    // 1. Header & Branding
    doc.fillColor("#b08d57").fontSize(24).text("VASTUZONE", { align: "center", characterSpacing: 2 });
    doc.fillColor("#444444").fontSize(10).text("PREMIUM SPATIAL AUDIT REPORT", { align: "center", characterSpacing: 1.5 });
    doc.moveDown(2);

    // 2. Property Overview Box
    doc.rect(50, 110, 500, 80).fill("#f9f9f9").stroke("#eeeeee");
    doc.fillColor("#111111").fontSize(16).text(property.propertyName || "Unnamed Property", 65, 125);
    doc.fillColor("#777777").fontSize(10).text(`${property.propertyType} • ${property.city}`, 65, 145);
    doc.fillColor("#b08d57").fontSize(10).text(`REPORT ID: ${(property._id || "AUDIT_PREVIEW").toString().toUpperCase()}`, 65, 165);

    // 3. Vastu Score Circle/Box
    doc.rect(400, 120, 130, 60).fill("#ffffff").stroke("#b08d57");
    doc.fillColor("#b08d57").fontSize(20).text(`${report.vastuScore}/100`, 415, 135, { width: 100, align: "center" });
    doc.fontSize(8).text("VASTU COMPLIANCE", 415, 160, { width: 100, align: "center" });

    doc.moveDown(6);

    // 4. Detailed Analysis Section
    doc.fillColor("#111111").fontSize(14).text("SPATIAL ORIENTATION FINDINGS", 50, 220);
    doc.moveTo(50, 235).lineTo(550, 235).stroke("#dddddd");
    doc.moveDown(1);

    const directions = [
      { label: "Main Entrance", value: property.entrance },
      { label: "Kitchen", value: property.kitchenDirection },
      { label: "Master Bedroom", value: property.masterBedroomDirection },
      { label: "Living Room", value: property.livingRoomDirection },
      { label: "Pooja Room", value: property.poojaRoomDirection }
    ];

    let yPos = 250;
    directions.forEach(item => {
      doc.fillColor("#777777").fontSize(10).text(item.label, 50, yPos);
      doc.fillColor("#111111").fontSize(10).text(item.value || "Not Specified", 200, yPos);
      yPos += 20;
    });

    // 5. Expert Verdict & Remedies (RAG Grounded + Deterministic Fallback)
    doc.moveDown(2);
    doc.fillColor("#111111").fontSize(14).text("ANALYSIS & GROUNDED REMEDIES");
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke("#dddddd");
    doc.moveDown(1);

    doc.fillColor("#b08d57").fontSize(11).text(`Compliance Status: ${report.scoreBand}`);
    doc.moveDown(0.5);

    if (report.roomWarnings && report.roomWarnings.length > 0) {
      doc.fillColor("#cc0000").fontSize(10).text("CRITICAL OBSERVATIONS:");
      report.roomWarnings.forEach(warning => {
        doc.fillColor("#444444").fontSize(9).text(`• ${warning}`, { indent: 15 });
      });
      doc.moveDown(1);
    }

    const groundedRecs = property.groundedRecommendations || report.groundedRecommendations || [];

    if (groundedRecs.length > 0) {
      doc.fillColor("#111111").fontSize(10).text("GROUNDED VASTU REMEDIES & CITATIONS:");
      groundedRecs.forEach((rec, idx) => {
        doc.fillColor("#111111").fontSize(9).text(`${idx + 1}. [${rec.issue || "Observation"}]`, { indent: 10 });
        doc.fillColor("#444444").fontSize(9).text(`Remedy: ${rec.recommendation}`, { indent: 20 });
        if (rec.sources && rec.sources.length > 0) {
          doc.fillColor("#b08d57").fontSize(8).text(`Source: ${rec.sources[0].title} (${rec.sources[0].reference})`, { indent: 20 });
        }
        doc.moveDown(0.5);
      });
    } else {
      doc.fillColor("#111111").fontSize(10).text("RECOMMENDED REMEDIES:");
      const genericTips = [
        "Keep the North-East corner light and clean for energy flow.",
        "Place a sea salt bowl in bathrooms to neutralize negative energy.",
        "Ensure the center of the house (Brahmasthan) is free of heavy furniture."
      ];
      
      const allTips = [...(report.vastuTips || []), ...genericTips].slice(0, 5);
      allTips.forEach(tip => {
        doc.fillColor("#444444").fontSize(9).text(`• ${tip}`, { indent: 15 });
      });
    }

    // 6. Footer
    doc.moveDown(3);
    doc.fontSize(8).fillColor("#aaaaaa").text("This report is generated using VastuZone's Grounded RAG & Spatial Inference Engine. For legal purposes, this is a preliminary audit. Consult with a human expert for structural changes.", { align: "center" });

    doc.end();
  });
}

module.exports = { generatePropertyPDF };
