import axios from "axios";
import FormData from "form-data";
import { execSync } from "child_process";

let currentBranch = "";
try {
  currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch (e) {}

const isDev = currentBranch === "dev" || process.env.NODE_ENV === "development";
const defaultUrl = isDev
  ? process.env.AI_SERVICE_URL_DEV
  : process.env.AI_SERVICE_URL_PROD;

let AI_SERVICE_URL = process.env.AI_SERVICE_URL || defaultUrl;

if (
  currentBranch === "main" &&
  AI_SERVICE_URL &&
  AI_SERVICE_URL.includes("localhost") &&
  process.env.AI_SERVICE_URL_PROD
) {
  AI_SERVICE_URL = process.env.AI_SERVICE_URL_PROD;
}

/**
 * Scan struk via AI Modal service
 * @param {Buffer} fileBuffer - File buffer dari multer
 * @param {string} filename - Nama file original
 * @param {Object} context - Context user (budget, day, saldo)
 * @returns {Promise<Object>} - Hasil scan + prediksi + rekomendasi
 */
export const scanStruk = async (fileBuffer, filename, context = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", fileBuffer, filename);
    formData.append("budget_bulanan", context.budget_bulanan || 2000000);
    formData.append(
      "day_of_month",
      context.day_of_month || new Date().getDate(),
    );
    formData.append("saldo_sisa", context.saldo_sisa || 0);

    const response = await axios.post(
      `${AI_SERVICE_URL}/scan-struk`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000, // 60 detik timeout untuk cold start + processing
      },
    );

    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error(
        "AI scan struk error:",
        error.response?.data || error.message,
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "AI service timeout. Service mungkin sedang cold start, coba lagi dalam beberapa detik.",
      );
    }

    throw new Error(
      error.response?.data?.detail || "Gagal memproses struk via AI service",
    );
  }
};

/**
 * Get prediksi 7 hari + rekomendasi dari AI
 * @param {Object} actualHariIni - Actual spending per kategori
 * @param {Object} context - Context user (budget, day)
 * @returns {Promise<Object>} - Prediksi + rekomendasi + status
 */
export const getPrediksi = async (actualHariIni, context = {}) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/prediksi`,
      {
        actual_hari_ini: actualHariIni,
        budget_bulanan: context.budget_bulanan || 2000000,
        day_of_month: context.day_of_month || new Date().getDate(),
        saldo_sisa: context.saldo_sisa || 0,
      },
      {
        timeout: 120000, // 30 detik timeout untuk cold start
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error(
        "AI prediksi error:",
        error.response?.data || error.message,
      );
    }

    // Return fallback data instead of throwing error
    return {
      prediksi_7hari: {},
      rekomendasi: {
        label: "aman",
        label_upper: "AMAN",
        confidence: 0,
        pesan:
          "AI service sedang tidak tersedia. Data prediksi akan muncul setelah service aktif.",
        saldo_rp: 0,
        days_remaining: 0,
        proj_overall_pct: 0,
        est_saldo_7hari_rp: 0,
        all_probs: {},
      },
      status_per_kategori: {},
    };
  }
};

/**
 * Health check AI service
 * @returns {Promise<boolean>} - True jika service aktif
 */
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    return response.data.status === "ok";
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.error("AI health check error:", error.message);
    }
    return false;
  }
};

export default { scanStruk, getPrediksi, healthCheck };
