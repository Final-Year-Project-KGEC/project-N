import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import FileUpload from "./components/FileUpload";
import AlertTable from "./components/AlertTable";
import ChartView from "./components/ChartView";
import AdminReport from "./components/AdminReport";
import Popup from "./components/Popup";

import { calculateScore, getPriority } from "./utils/scoring";
import { removeDuplicates, removeFakeAlerts } from "./utils/cleaning";
import { detectAndBlockIPs } from "./utils/ipBlocklist";

export default function App() {
  const [alerts, setAlerts] = useState([]);
  const [report, setReport] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [time, setTime] = useState(new Date());
  const [rawData, setRawData] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [logs, setLogs] = useState([]);
  const [newAlerts, setNewAlerts] = useState([]);
  const prevCriticalCount = useRef(0);

  // Ask for Notification Permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => handleRefresh(), 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, rawData]);

  // Log helper
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time: timestamp, msg: message }, ...prev]);
  };

  // Beep
  const playBeep = () => {
    if (!soundOn) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = 1000;
    oscillator.start();

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  };

  // Clear popups
  const clearPopups = () => {
    setNewAlerts([]);
    addLog("❌ All popups dismissed");
  };

  // Process alerts pipeline
  const processAlerts = (data) => {
    let processed = data
      .filter((row) => row.AlertID) // ✅ Only valid rows
      .map((alert) => {
        const score = calculateScore(alert);
        const priority = getPriority(score);
        return { ...alert, Score: score, Priority: priority };
      });

    processed = removeDuplicates(processed);
    processed = removeFakeAlerts(processed);

    const blockedIPs = detectAndBlockIPs(processed);
    blockedIPs.forEach((ip) => addLog(`🔒 Blocked IP: ${ip}`));

    const priorityOrder = { Critical: 1, High: 2, Medium: 3, Low: 4 };
    processed.sort(
      (a, b) =>
        priorityOrder[a.Priority] - priorityOrder[b.Priority] || b.Score - a.Score
    );

    // Detect new alerts
    if (processed.length > alerts.length) {
      const newOnes = processed.slice(0, processed.length - alerts.length);
      setNewAlerts((prev) => [...prev, ...newOnes]);

      newOnes.forEach((a) => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(`🚨 ${a.Priority} - ${a.IncidentType}`, {
            body: `Source: ${a.SourceIP}\nScore: ${a.Score}\nTime: ${a.Timestamp}`,
          });
        }
        addLog(
          `⚠️ New ${a.Priority} Alert (${a.IncidentType}) from ${a.SourceIP} | Score: ${a.Score}`
        );
      });
    }

    // New critical alert beep + log
    const criticalCount = processed.filter((a) => a.Priority === "Critical").length;
    if (criticalCount > prevCriticalCount.current) {
      playBeep();
      addLog(`🚨 New Critical Alert detected! (Total: ${criticalCount})`);
    }
    prevCriticalCount.current = criticalCount;

    setAlerts(processed);

    const summary = {
      fileName: rawData?.fileName || "Uploaded File",
      totalAlerts: data.length,
      afterCleaning: processed.length,
      duplicatesRemoved: data.length - processed.length,
      blockedIPs,
      criticalCount: processed.filter((a) => a.Priority === "Critical").length,
      highCount: processed.filter((a) => a.Priority === "High").length,
      mediumCount: processed.filter((a) => a.Priority === "Medium").length,
      lowCount: processed.filter((a) => a.Priority === "Low").length,
      uploadedAt: new Date().toLocaleString(),
    };

    setReport(summary);
    addLog("✅ Alerts processed and dashboard updated");
  };

  // File upload
  const handleFileUpload = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setRawData({ fileName: file.name, data: results.data });
        processAlerts(results.data);
        addLog(`📂 File uploaded: ${file.name}`);
      },
    });
  };

  // Refresh
  const handleRefresh = () => {
    if (!rawData) return;

    const newData = rawData.data.map((alert) => {
      const randomFactor = Math.random();
      if (randomFactor < 0.1) {
        return { ...alert, AssetCriticality: Number(alert.AssetCriticality) + 1 };
      } else if (randomFactor < 0.2) {
        return { ...alert, AssetCriticality: 0, TTPSeverity: 0 };
      }
      return alert;
    });

    processAlerts(newData);
    addLog("🔄 Data refreshed");
  };

  return (
    <div
      className={
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }
    >
      {/* Navbar */}
      <header className="bg-yellow-200 dark:bg-gray-800 text-black shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold ">🚨 Threat Intelligence Dashboard</h1>

        <div className="flex items-center space-x-4">
          {/* Clock */}
          <div className="font-mono text-sm bg-gray-200 text-black dark:bg-gray-700 dark:text-white px-3 py-1 rounded-md shadow">
            {time.toLocaleTimeString()}
          </div>

          {/* Controls */}
          <button
            onClick={handleRefresh}
            className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white"
            disabled={!rawData}
          >
            🔄 Refresh Now
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-md ${
              autoRefresh
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
            }`}
            disabled={!rawData}
          >
            {autoRefresh ? "⏱ Auto Refresh ON" : "⏱ Auto Refresh OFF"}
          </button>

          {/* Sound */}
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`px-3 py-1 rounded-md ${
              soundOn
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
            }`}
          >
            {soundOn ? "🔊 Sound ON" : "🔇 Sound OFF"}
          </button>

          {/* Dark/Light */}
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-md bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button> */}
        </div>
      </header>

      {/* Popups */}
      <Popup alerts={newAlerts} clearPopups={clearPopups} />

      {/* Content */}
      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FileUpload onFileUpload={handleFileUpload} />
          {alerts.length > 0 && <AlertTable alerts={alerts} />}
        </div>
        <div className="space-y-6">
          {/* {alerts.length > 0 && <ChartView alerts={alerts} />} */}
          {report && <AdminReport report={report} />}
        </div>
      </main>

      {/* Logs */}
      <footer className="p-4 border-t bg-gray-200 dark:bg-gray-800 dark:text-white mt-6 max-h-48 overflow-y-auto">
        <h2 className="font-bold mb-2">📝 System Log</h2>
        <ul className="text-sm space-y-1">
          {logs.map((log, i) => (
            <li key={i} className="font-mono">
              [{log.time}] {log.msg}
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
