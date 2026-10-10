"use client";

import { useCallback, useEffect, useState } from "react";

type Usage = {
  timezone: string;
  period: { day: string; month: string };
  daily: { used: number; limit: number; remaining: number; reached: boolean };
  monthly: { used: number; limit: number; remaining: number; reached: boolean };
  scope: string;
};

const panelStyle: React.CSSProperties = { border: "1px solid #29251a", borderRadius: 12, padding: 18, marginBottom: 20, background: "#0b0b09" };
const mutedStyle: React.CSSProperties = { color: "#aaa69a", fontSize: 13, lineHeight: 1.6 };
const statStyle: React.CSSProperties = { border: "1px solid #29251a", borderRadius: 9, padding: 12, minWidth: 0 };

export default function ApiUsagePanel() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/research/usage", { method: "GET", credentials: "same-origin", cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
      setUsage(data as Usage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load usage.");
    } finally { setBusy(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return <section className="command-section" id="api-usage" style={panelStyle}>
    <div className="section-heading">
      <div><p className="gold command-kicker">COST CONTROL</p><h2>API Usage &amp; Budget</h2></div>
      <button type="button" className="control-button" onClick={refresh} disabled={busy}>{busy ? "Checking…" : "Refresh usage"}</button>
    </div>
    {error && <p role="alert" style={{ color: "#ff8d8d" }}>{error}</p>}
    {!usage && !error && <p style={mutedStyle}>Loading usage counters…</p>}
    {usage && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 10, marginTop: 16 }}>
        <div style={statStyle}>
          <p style={mutedStyle}>Today · {usage.period.day}</p><h3>{usage.daily.used} / {usage.daily.limit}</h3>
          <p style={mutedStyle}>{usage.daily.remaining} daily searches remaining</p>
          <p style={{ color: usage.daily.reached ? "#ff8d8d" : "#b9d99b", fontSize: 12 }}>{usage.daily.reached ? "Daily limit reached" : "Daily limit available"}</p>
        </div>
        <div style={statStyle}>
          <p style={mutedStyle}>This month · {usage.period.month}</p><h3>{usage.monthly.used} / {usage.monthly.limit}</h3>
          <p style={mutedStyle}>{usage.monthly.remaining} monthly searches remaining</p>
          <p style={{ color: usage.monthly.reached ? "#ff8d8d" : "#b9d99b", fontSize: 12 }}>{usage.monthly.reached ? "Monthly limit reached" : "Monthly limit available"}</p>
        </div>
      </div>
      <p style={{ ...mutedStyle, marginTop: 14 }}>Time zone: {usage.timezone}. {usage.scope}</p>
    </>}
  </section>;
}
