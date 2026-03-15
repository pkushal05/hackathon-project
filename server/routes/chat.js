const router = require("express").Router();
const axios = require("axios");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const Bus = require("../models/Bus");
const Part = require("../models/Part");
const ServiceType = require("../models/ServiceType");
const ServicePart = require("../models/ServicePart");
const MaintenanceRecord = require("../models/MaintenanceRecord");
const MaintenanceForecast = require("../models/MaintenanceForecast");
const PartsForecast = require("../models/PartsForecast");
const MaintenanceService = require("../services/MaintenanceService");
const GTFSService = require("../services/GTFSService");

function normalizeMessage(message) {
  return String(message || "")
    .toLowerCase()
    .trim();
}

function hasAiConfig() {
  return Boolean(process.env.OPENAI_API_KEY);
}

async function buildDataSnapshot() {
  const [
    fleetSummary,
    buses,
    parts,
    serviceTypes,
    serviceParts,
    maintenanceRecords,
    maintenanceTop,
    partsTop,
    liveVehicles,
  ] = await Promise.all([
    getFleetSummary(),
    Bus.find().select("alias busNumber manufacturer status garage year").lean(),
    Part.find().select("partNumber name category manufacturer unit").lean(),
    ServiceType.find()
      .select("name description severityWeight includes")
      .lean(),
    ServicePart.find()
      .select("serviceType busModel partNumber quantity")
      .lean(),
    MaintenanceRecord.find()
      .select(
        "busAlias serviceType pmDescription unitsToGoKm unitsLateKm frequencyKm dayslate reportDate pmStatus",
      )
      .sort({ reportDate: -1 })
      .limit(500)
      .lean(),
    MaintenanceForecast.find({ forecastWindow: "30" })
      .sort({ urgencyScore: -1 })
      .limit(50)
      .select("busAlias serviceType dueInDays urgencyScore")
      .lean(),
    PartsForecast.find({ forecastWindow: "30" })
      .sort({ quantity: -1 })
      .limit(100)
      .select("partNumber quantity")
      .lean(),
    GTFSService.getEnrichedVehiclePositions(),
  ]);

  const liveVehicleSummary = {
    liveVehicleCount: liveVehicles.length,
    vehicles: liveVehicles.slice(0, 120).map((item) => ({
      label: item.label,
      vehicleId: item.vehicleId,
      routeId: item.routeId,
      speed: item.speed,
      latitude: item.latitude,
      longitude: item.longitude,
      urgencyLevel: item.urgencyLevel,
      urgencyScore: item.urgencyScore,
      mappedBusAlias: item.bus?.alias || null,
      mappedBusStatus: item.bus?.status || null,
    })),
  };

  return {
    fleetSummary,
    mongoCounts: {
      buses: buses.length,
      parts: parts.length,
      serviceTypes: serviceTypes.length,
      serviceParts: serviceParts.length,
      maintenanceRecords: maintenanceRecords.length,
      maintenanceForecasts: maintenanceTop.length,
      partsForecasts: partsTop.length,
    },
    mongoData: {
      buses,
      parts,
      serviceTypes,
      serviceParts,
      maintenanceRecords,
      maintenanceForecasts: maintenanceTop,
      partsForecasts: partsTop,
    },
    liveBusData: liveVehicleSummary,
    maintenanceTop,
    partsTop,
  };
}

async function getAiReply(message) {
  const snapshot = await buildDataSnapshot();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  const systemPrompt = [
    "You are FleetPulse DRT Assistant for a transit fleet maintenance platform.",
    "Answer clearly, briefly, and use provided MongoDB and live GTFS data when available.",
    "Use liveBusData for real-time bus questions when data is not in MongoDB.",
    "Return plain text only.",
    "Do not use markdown formatting like **, headings, or code blocks.",
    "When listing items, keep each item on a new line.",
    "If data is missing, say so and suggest generating forecast data.",
    "Do not invent numbers.",
  ].join(" ");

  const contextPrompt = JSON.stringify(snapshot);

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Platform data context: ${contextPrompt}\n\nUser question: ${message}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 220,
  };

  const response = await axios.post(`${baseUrl}/chat/completions`, payload, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });

  return (
    response.data?.choices?.[0]?.message?.content?.trim() || getDefaultReply()
  );
}

async function getFleetSummary() {
  const DUE_SOON_WINDOW_DAYS = 14;

  const [buses, maintenanceForecasts] = await Promise.all([
    Bus.find().select({ alias: 1 }).lean(),
    MaintenanceForecast.find().lean(),
  ]);

  const forecastByBus = new Map();
  for (const fc of maintenanceForecasts) {
    const alias = String(fc.busAlias || "").trim();
    if (!alias) continue;

    const current = forecastByBus.get(alias);
    const dueInDays = Number(fc.dueInDays || 0);
    const urgencyScore = Number(fc.urgencyScore || 0);

    if (
      !current ||
      urgencyScore > current.urgencyScore ||
      dueInDays < current.dueInDays
    ) {
      forecastByBus.set(alias, {
        dueInDays,
        urgencyScore,
      });
    }
  }

  let overdue = 0;
  let dueSoon = 0;
  let healthy = 0;

  for (const bus of buses) {
    const alias = String(bus.alias || "").trim();
    const forecast = forecastByBus.get(alias);

    if (!forecast) {
      healthy += 1;
      continue;
    }

    const urgencyLevel = MaintenanceService.getUrgencyLevel(
      forecast.urgencyScore,
    );
    if (urgencyLevel === "critical") {
      overdue += 1;
    } else if (
      forecast.dueInDays >= 0 &&
      forecast.dueInDays <= DUE_SOON_WINDOW_DAYS
    ) {
      dueSoon += 1;
    } else {
      healthy += 1;
    }
  }

  return {
    totalBuses: buses.length,
    overdue,
    dueSoon,
    healthy,
  };
}

async function getMaintenanceForecastSummary() {
  const records = await MaintenanceForecast.find({ forecastWindow: "30" })
    .sort({ urgencyScore: -1 })
    .limit(3)
    .lean();

  if (!records.length) {
    return "No maintenance forecast is available right now. Please generate forecast data first.";
  }

  const topLines = records
    .map(
      (item) =>
        `${item.busAlias} (${item.serviceType}) in ${item.dueInDays} day(s)`,
    )
    .join("; ");

  return `Maintenance forecast is ready. Top upcoming services: ${topLines}.`;
}

async function getPartsForecastSummary() {
  const records = await PartsForecast.find({ forecastWindow: "30" })
    .sort({ quantity: -1 })
    .limit(5)
    .lean();

  if (!records.length) {
    return "No parts forecast is available right now. Please generate forecast data first.";
  }

  const lines = records
    .map((item) => `${item.partNumber}: ${item.quantity}`)
    .join(", ");

  return `Top parts demand for next 30 days: ${lines}.`;
}

function getDefaultReply() {
  return "I can help with overdue buses, fleet health, maintenance forecast, and parts demand. Try asking: 'How many buses are overdue?'";
}

function sendReply(res, reply, source) {
  return res.json({ reply, source });
}

router.post(
  "/",
  validate([
    body("message")
      .isString()
      .withMessage("message is required")
      .trim()
      .notEmpty()
      .withMessage("message is required"),
  ]),
  async (req, res, next) => {
    try {
      const message = String(req.body.message || "").trim();
      const text = normalizeMessage(message);

      if (hasAiConfig()) {
        try {
          const aiReply = await getAiReply(message);
          return sendReply(res, aiReply, "ai");
        } catch (aiErr) {
          // Fallback to deterministic keyword logic if AI service fails.
          console.warn(`[chat] AI fallback triggered: ${aiErr.message}`);
        }
      }

      if (text.includes("overdue")) {
        const summary = await getFleetSummary();
        return sendReply(
          res,
          `There are ${summary.overdue} overdue buses out of ${summary.totalBuses} total buses.`,
          "fallback",
        );
      }

      if (text.includes("fleet health") || text.includes("health")) {
        const summary = await getFleetSummary();
        return sendReply(
          res,
          `Fleet health: ${summary.healthy} healthy, ${summary.dueSoon} due soon, ${summary.overdue} overdue (total ${summary.totalBuses}).`,
          "fallback",
        );
      }

      if (text.includes("forecast")) {
        const reply = await getMaintenanceForecastSummary();
        return sendReply(res, reply, "fallback");
      }

      if (text.includes("parts")) {
        const reply = await getPartsForecastSummary();
        return sendReply(res, reply, "fallback");
      }

      return sendReply(res, getDefaultReply(), "fallback");
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
