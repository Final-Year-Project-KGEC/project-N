import React, { useEffect } from "react";

export default function Notification({ alert }) {
  useEffect(() => {
    if (alert && alert.Priority === "Critical") {
      // 🔊 Play sound
      const audio = new Audio("/alert.mp3");
      audio.play().catch(() => console.log("Audio blocked by browser"));

      // 🔔 Browser notification
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("🚨 Critical Alert", {
            body: `Type: ${alert.IncidentType || "Unknown"} | Source: ${alert.SourceIP} | Score: ${alert.Score}`,
            icon: "/alert-icon.png",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }
    }
  }, [alert]);

  return null; // nothing to render, just side effects
}
