import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Popup({ alerts, clearPopups }) {
  const [visibleAlerts, setVisibleAlerts] = useState([]);

  useEffect(() => {
    if (alerts.length > 0) {
      const newAlert = alerts[alerts.length - 1]; // newest
      setVisibleAlerts((prev) => [...prev, newAlert]);

      // Auto-hide after 6s
      const timer = setTimeout(() => {
        setVisibleAlerts((prev) => prev.slice(1));
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [alerts]);

  const priorityColors = {
    Critical: "bg-red-600 text-white",
    High: "bg-orange-500 text-white",
    Medium: "bg-yellow-400 text-black",
    Low: "bg-green-500 text-white",
  };

  return (
    <div className="fixed top-20 right-6 flex flex-col gap-3 z-50">


      <AnimatePresence>
        {visibleAlerts.map((alert, index) => (
          <motion.div
            key={alert.AlertID || index}
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 200, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`shadow-lg rounded-xl p-3 max-w-sm ${
              priorityColors[alert.Priority] || "bg-gray-800 text-white"
            }`}
          >
            <h3 className="text-lg font-bold">🚨 {alert.Priority} Alert</h3>
            <p className="text-sm">
              <strong>Type:</strong> {alert.IncidentType || "Unknown"}
            </p>
            <p className="text-sm">
              <strong>Source IP:</strong> {alert.SourceIP}
            </p>
            <p className="text-sm">
              <strong>Score:</strong> {alert.Score}
            </p>
            <p className="text-xs opacity-80">{alert.Timestamp}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      
    </div>
  );
}
