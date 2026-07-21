import { useState, useEffect, useRef } from "react";

const fmt = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

function calcLoan(principal, annualRate, months) {
  if (!principal || !annualRate || !months) return null;
  const r = annualRate / 100 / 12;
  if (r === 0) return { monthly: principal / months, total: principal, interest: 0 };
  const monthly = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = monthly * months;
  const interest = total - principal;
  return { monthly, total, interest };
}

function buildAmortization(principal, annualRate, months, extraPayment = 0) {
  const r = annualRate / 100 / 12;
  let balance = principal;
  const rows = [];
  let totalInterestPaid = 0;
  let month = 0;
  const baseMonthly = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  while (balance > 0.01 && month < 600) {
    month++;
    const interestPayment = balance * r;
    const principalPayment = Math.min(balance, baseMonthly - interestPayment + extraPayment);
    balance = Math.max(0, balance - principalPayment);
    totalInterestPaid += interestPayment;
    rows.push({
      month,
      payment: principalPayment + interestPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
      totalInterest: totalInterestPaid,
    });
    if (balance <= 0.01) break;
  }
  return rows;
}

export default function App() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate]         = useState("");
  const [years, setYears]       = useState("");
  const [extra, setExtra]       = useState("");
  const [activeSection, setActiveSection] = useState("calculator");
  const [showFullAmort, setShowFullAmort] = useState(false);
  const [calculated, setCalculated]       = useState(false);

  const P = parseFloat(principal) || 0;
  const R = parseFloat(rate) || 0;
  const M = (parseFloat(years) || 0) * 12;
  const E = parseFloat(extra) || 0;

  const base = calcLoan(P, R, M);
  const amort = base ? buildAmortization(P, R, M) : [];
  const amortExtra = base && E > 0 ? buildAmortization(P, R, M, E) : [];

  const interestSaved = amortExtra.length > 0
    ? amort[amort.length - 1]?.totalInterest - amortExtra[amortExtra.length - 1]?.totalInterest
    : 0;
  const monthsSaved = amort.length - amortExtra.length;

  const rateScenarios = base ? [
    { label: "Low", rate: Math.max(0.1, R - 1), color: "#22c55e" },
    { label: "Current", rate: R, color: "#6366f1" },
    { label: "High", rate: R + 1, color: "#ef4444" },
  ].map(s => ({ ...s, result: calcLoan(P, s.rate, M) })) : [];

  const termScenarios = base ? [
    { label: "15 Years", months: 180 },
    { label: "20 Years", months: 240 },
    { label: "25 Years", months: 300 },
    { label: "30 Years", months: 360 },
  ].filter(t => t.months !== M).slice(0, 3).map(t => ({ ...t, result: calcLoan(P, R, t.months) })) : [];

  const sections = [
    { id: "calculator", label: "Calculator" },
    { id: "amortization", label: "Schedule" },
    { id: "simulations", label: "Simulations" },
    { id: "resources", label: "Resources" },
  ];

  const handleCalculate = () => {
    if (P && R && M) setCalculated(true);
  };

  const handlePrint = () => window.print();

  const inputStyle = {
    width: "100%", padding: "11px 14px", fontSize: "16px",
    border: "1.5px solid #e5e7eb", borderRadius: "10px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", background: "#fff",
  };
  const labelStyle = { display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" };

  const principalPct = base ? Math.round((P / base.total) * 100) : 0;
  const interestPct  = 100 - principalPct;

  const displayAmort = showFullAmort ? amort : amort.slice(0, 24);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: white; }
          .print-table { font-size: 11px; }
        }
        @media screen {
          .print-only { display: none; }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="https://tabutility.com" style={{ fontSize: "15px", fontWeight: "700", color: "#6366f1", textDecoration: "none" }}>⌘ Tabutility</a>
          <button onClick={handlePrint} style={{ padding: "8px 18px", background: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* Sticky section nav */}
      {calculated && (
        <div className="no-print" style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "4px" }}>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)}
                style={{
                  padding: "12px 16px", fontSize: "13px", fontWeight: "600",
                  color: activeSection === s.id ? "#6366f1" : "#6b7280",
                  borderBottom: activeSection === s.id ? "2px solid #6366f1" : "2px solid transparent",
                  textDecoration: "none", whiteSpace: "nowrap",
                }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Print header */}
        <div className="print-only" style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #e5e7eb" }}>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>Loan Analysis Report — Tabutility.com</h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>Generated on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* ── SECTION 1: CALCULATOR ── */}
        <section id="calculator" style={{ marginBottom: "48px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "900", color: "#0f172a", margin: "0 0 6px 0" }}>Loan Calculator</h1>
          <p style={{ fontSize: "15px", color: "#6b7280", margin: "0 0 28px 0" }}>
            Calculate your monthly payment, see the full repayment breakdown, compare rates and terms, and export to PDF.
          </p>

          {/* Inputs */}
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Loan Amount</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: "700" }}>$</span>
                  <input type="number" placeholder="e.g. 250000" value={principal} onChange={e => setPrincipal(e.target.value)} min="1" style={{ ...inputStyle, paddingLeft: "26px" }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Annual Interest Rate</label>
                <div style={{ position: "relative" }}>
                  <input type="number" placeholder="e.g. 6.5" value={rate} onChange={e => setRate(e.target.value)} min="0.01" step="0.01" style={{ ...inputStyle, paddingRight: "34px" }} />
                  <span style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: "700" }}>%</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Loan Term (Years)</label>
                <input type="number" placeholder="e.g. 30" value={years} onChange={e => setYears(e.target.value)} min="1" max="50" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Extra Monthly Payment</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: "700" }}>$</span>
                  <input type="number" placeholder="Optional" value={extra} onChange={e => setExtra(e.target.value)} min="0" style={{ ...inputStyle, paddingLeft: "26px" }} />
                </div>
              </div>
            </div>
            <button onClick={handleCalculate} disabled={!P || !R || !M} style={{
              width: "100%", padding: "14px", background: (!P || !R || !M) ? "#e5e7eb" : "#6366f1",
              color: (!P || !R || !M) ? "#9ca3af" : "#fff", border: "none", borderRadius: "10px",
              fontSize: "16px", fontWeight: "700", cursor: (!P || !R || !M) ? "not-allowed" : "pointer",
            }}>
              Calculate Loan
            </button>
          </div>

          {/* Results */}
          {calculated && base && (
            <>
              {/* Monthly payment hero */}
              <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "20px", padding: "32px 28px", marginBottom: "16px", color: "#fff" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Monthly Payment</div>
                    <div style={{ fontSize: "52px", fontWeight: "900", lineHeight: 1 }}>${fmt(base.monthly)}</div>
                    {E > 0 && amortExtra.length > 0 && (
                      <div style={{ marginTop: "8px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                        With extra: <strong style={{ color: "#fff" }}>${fmt(base.monthly + E)}/mo</strong>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {[
                      { label: "Principal", value: `$${fmtShort(P)}` },
                      { label: "Total Interest", value: `$${fmtShort(base.interest)}` },
                      { label: "Total Cost", value: `$${fmtShort(base.total)}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>{value}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", marginTop: "3px", fontWeight: "600" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: "24px" }}>
                  <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", height: "12px", background: "rgba(255,255,255,0.2)" }}>
                    <div style={{ width: `${principalPct}%`, background: "rgba(255,255,255,0.9)" }} />
                    <div style={{ width: `${interestPct}%`, background: "rgba(255,255,255,0.35)" }} />
                  </div>
                  <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(255,255,255,0.9)" }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>Principal {principalPct}%</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(255,255,255,0.35)" }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>Interest {interestPct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra payment savings banner */}
              {E > 0 && interestSaved > 0 && (
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "14px", padding: "18px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>💡</span>
                    <div>
                      <div style={{ fontWeight: "700", color: "#15803d", fontSize: "15px" }}>Extra payment saves you ${fmtShort(interestSaved)} in interest</div>
                      <div style={{ color: "#16a34a", fontSize: "13px", marginTop: "2px" }}>Loan paid off {Math.floor(monthsSaved / 12)}yr {monthsSaved % 12}mo earlier</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── SECTION 2: AMORTIZATION ── */}
        {calculated && base && (
          <section id="amortization" style={{ marginBottom: "48px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>Amortization Schedule</h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>Month-by-month breakdown of every payment over {years} years</p>
              </div>
              <button onClick={handlePrint} className="no-print" style={{ padding: "9px 18px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#374151", cursor: "pointer" }}>
                🖨️ Export PDF
              </button>
            </div>

            <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {/* Annual summary cards */}
              <div style={{ padding: "20px 20px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                {[1, 2, 3, 5].filter(y => y * 12 <= amort.length).map(y => {
                  const row = amort[y * 12 - 1];
                  return (
                    <div key={y} style={{ background: "#f9fafb", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>Year {y}</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>${fmtShort(row?.balance || 0)}</div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>remaining</div>
                    </div>
                  );
                })}
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["Month", "Payment", "Principal", "Interest", "Balance"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: h === "Month" ? "center" : "right", fontWeight: "700", color: "#374151", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayAmort.map((row, i) => (
                      <tr key={row.month} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "9px 16px", textAlign: "center", fontWeight: "600", color: "#6b7280" }}>{row.month}</td>
                        <td style={{ padding: "9px 16px", textAlign: "right" }}>${fmt(row.payment)}</td>
                        <td style={{ padding: "9px 16px", textAlign: "right", color: "#6366f1", fontWeight: "600" }}>${fmt(row.principal)}</td>
                        <td style={{ padding: "9px 16px", textAlign: "right", color: "#f97316" }}>${fmt(row.interest)}</td>
                        <td style={{ padding: "9px 16px", textAlign: "right", fontWeight: "700" }}>${fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {amort.length > 24 && (
                <div className="no-print" style={{ padding: "16px", textAlign: "center", borderTop: "1px solid #f3f4f6" }}>
                  <button onClick={() => setShowFullAmort(v => !v)} style={{ padding: "9px 24px", background: "#f3f4f6", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#374151", cursor: "pointer" }}>
                    {showFullAmort ? `Show less ▴` : `Show all ${amort.length} months ▾`}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── SECTION 3: SIMULATIONS ── */}
        {calculated && base && (
          <section id="simulations" style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>Simulations</h2>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#6b7280" }}>See how different scenarios affect your total cost</p>

            {/* Rate comparison */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>📊 Rate Comparison</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>How ±1% change in rate affects your payments</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {rateScenarios.map(s => (
                  <div key={s.label} style={{ borderRadius: "12px", padding: "18px", border: `2px solid ${s.label === "Current" ? s.color : "#e5e7eb"}`, background: s.label === "Current" ? "#f5f3ff" : "#f9fafb" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: s.label === "Current" ? s.color : "#374151" }}>{s.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: "800", color: s.color }}>{s.rate.toFixed(2)}%</span>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>${fmt(s.result?.monthly || 0)}<span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "400" }}>/mo</span></div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>Total interest: ${fmtShort(s.result?.interest || 0)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Term comparison */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>⏱ Term Comparison</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>How a different loan term changes your monthly payment and total cost</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {/* Current term */}
                <div style={{ borderRadius: "12px", padding: "18px", border: "2px solid #6366f1", background: "#f5f3ff" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#6366f1", marginBottom: "12px" }}>Current — {years}yr</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>${fmt(base.monthly)}<span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "400" }}>/mo</span></div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>Total interest: ${fmtShort(base.interest)}</div>
                </div>
                {termScenarios.map(s => {
                  const cheaper = s.result && s.result.interest < base.interest;
                  return (
                    <div key={s.label} style={{ borderRadius: "12px", padding: "18px", border: "1.5px solid #e5e7eb", background: "#f9fafb" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "12px" }}>{s.label}</div>
                      <div style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a" }}>${fmt(s.result?.monthly || 0)}<span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "400" }}>/mo</span></div>
                      <div style={{ fontSize: "12px", marginTop: "6px", color: cheaper ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
                        {cheaper ? "↓" : "↑"} ${fmtShort(Math.abs((s.result?.interest || 0) - base.interest))} interest
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extra payment simulation */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>💸 Extra Payment Simulator</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>See how much you save by paying more each month</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {[100, 200, 500].map(e => {
                  const rows = buildAmortization(P, R, M, e);
                  const saved = amort[amort.length - 1]?.totalInterest - rows[rows.length - 1]?.totalInterest;
                  const mSaved = amort.length - rows.length;
                  return (
                    <div key={e} style={{ borderRadius: "12px", padding: "18px", border: "1.5px solid #e5e7eb", background: "#f9fafb" }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "12px" }}>+${e}/month extra</div>
                      <div style={{ fontSize: "18px", fontWeight: "900", color: "#22c55e" }}>Save ${fmtShort(saved)}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                        Pay off {Math.floor(mSaved / 12)}yr {mSaved % 12}mo sooner
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── SECTION 4: RESOURCES ── */}
        <section id="resources" style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>Resources & Live Rates</h2>
          <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#6b7280" }}>Find current rates and learn more before you commit</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            {[
              { title: "Today's Mortgage Rates", desc: "Compare live 30yr and 15yr mortgage rates from multiple lenders.", url: "https://www.bankrate.com/mortgages/mortgage-rates/", source: "Bankrate", emoji: "🏠" },
              { title: "Personal Loan Rates", desc: "Find the best personal loan rates currently available online.", url: "https://www.nerdwallet.com/personal-loans", source: "NerdWallet", emoji: "💳" },
              { title: "Auto Loan Rates", desc: "Compare car loan rates before you visit the dealership.", url: "https://www.bankrate.com/loans/auto-loans/auto-loan-rates/", source: "Bankrate", emoji: "🚗" },
              { title: "Fed Interest Rate", desc: "Track the current Federal Reserve interest rate and history.", url: "https://www.federalreserve.gov/releases/h15/", source: "Federal Reserve", emoji: "🏛️" },
              { title: "Student Loan Rates", desc: "Current federal and private student loan interest rates.", url: "https://studentaid.gov/understand-aid/types/loans/interest-rates", source: "StudentAid.gov", emoji: "🎓" },
              { title: "Refinancing Guide", desc: "Learn when refinancing your loan actually makes sense.", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-refinancing-en-543/", source: "CFPB", emoji: "🔄" },
            ].map(r => (
              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display: "block", background: "#fff", borderRadius: "14px", padding: "20px", border: "1px solid #e5e7eb", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{r.emoji}</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>{r.title}</div>
                <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.5", marginBottom: "10px" }}>{r.desc}</div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.04em" }}>via {r.source} →</div>
              </a>
            ))}
          </div>

          {/* Tips box */}
          <div style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>💡 Tips for Getting a Better Rate</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              {[
                { tip: "Check your credit score before applying", detail: "A score above 740 typically gets the best rates." },
                { tip: "Compare at least 3 lenders", detail: "Rates can vary by 1%+ for the same borrower." },
                { tip: "Consider a shorter term", detail: "15-year loans usually have lower rates than 30-year." },
                { tip: "Make a larger down payment", detail: "20%+ down avoids PMI and can lower your rate." },
              ].map(t => (
                <div key={t.tip} style={{ display: "flex", gap: "10px" }}>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{t.tip}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{t.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Back link */}
        <div className="no-print" style={{ textAlign: "center", marginTop: "16px" }}>
          <a href="https://tabutility.com" style={{ fontSize: "14px", color: "#6366f1", textDecoration: "none", fontWeight: "600" }}>
            ← Back to all free tools
          </a>
        </div>
      </div>
    </div>
  );
}
