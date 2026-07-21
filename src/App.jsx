import { useState } from "react";

export default function App() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [termUnit, setTermUnit] = useState("years");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const P = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);
    if (!P || !annualRate || !term || P <= 0 || annualRate <= 0 || term <= 0) return;

    const r = annualRate / 100 / 12;
    const n = termUnit === "years" ? term * 12 : term;

    const monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal: P,
      months: n,
    });
  };

  const reset = () => {
    setLoanAmount(""); setInterestRate(""); setLoanTerm(""); setResult(null);
  };

  const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const principalPct = result ? Math.round((result.principal / result.totalPayment) * 100) : 0;
  const interestPct = result ? 100 - principalPct : 0;

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    fontSize: "16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 24px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="https://tabutility.com" style={{ fontSize: "15px", fontWeight: "700", color: "#6366f1", textDecoration: "none" }}>⌘ Tabutility</a>
          <span style={{ fontSize: "13px", color: "#6b7280" }}>Free Online Tools</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 16px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#111827", margin: "0 0 8px 0" }}>Loan Calculator</h1>
        <p style={{ fontSize: "15px", color: "#6b7280", margin: "0 0 28px 0" }}>
          Calculate your monthly payment, total interest, and full repayment cost for any loan.
        </p>

        {/* Input card */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "20px" }}>

          {/* Loan amount */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Loan Amount ($)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#6b7280", fontWeight: "600" }}>$</span>
              <input type="number" placeholder="e.g. 10000" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} min="1" style={{ ...inputStyle, paddingLeft: "28px" }} />
            </div>
          </div>

          {/* Interest rate */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Annual Interest Rate (%)</label>
            <div style={{ position: "relative" }}>
              <input type="number" placeholder="e.g. 5.5" value={interestRate} onChange={e => setInterestRate(e.target.value)} min="0.01" step="0.01" style={{ ...inputStyle, paddingRight: "40px" }} />
              <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "#6b7280", fontWeight: "600" }}>%</span>
            </div>
          </div>

          {/* Loan term */}
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>Loan Term</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="number" placeholder={termUnit === "years" ? "e.g. 5" : "e.g. 60"} value={loanTerm} onChange={e => setLoanTerm(e.target.value)} min="1" style={{ ...inputStyle, flex: 1 }} />
              <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "8px", padding: "4px", flexShrink: 0 }}>
                {["years", "months"].map(u => (
                  <button key={u} onClick={() => setTermUnit(u)} style={{
                    padding: "6px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
                    fontWeight: "600", fontSize: "13px",
                    background: termUnit === u ? "#6366f1" : "transparent",
                    color: termUnit === u ? "#fff" : "#6b7280",
                  }}>{u}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={calculate} style={{
              flex: 1, padding: "13px", background: "#6366f1", color: "#fff",
              border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer",
            }}>
              Calculate
            </button>
            <button onClick={reset} style={{
              padding: "13px 20px", background: "#f3f4f6", color: "#374151",
              border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
            }}>
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Monthly payment hero */}
            <div style={{ background: "#6366f1", borderRadius: "16px", padding: "28px 24px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)", marginBottom: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Monthly Payment</div>
              <div style={{ fontSize: "56px", fontWeight: "900", color: "#fff", lineHeight: 1 }}>${fmt(result.monthlyPayment)}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>for {result.months} months</div>
            </div>

            {/* Breakdown grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              {[
                { label: "Principal", value: `$${fmt(result.principal)}`, color: "#6366f1" },
                { label: "Total Interest", value: `$${fmt(result.totalInterest)}`, color: "#f97316" },
                { label: "Total Cost", value: `$${fmt(result.totalPayment)}`, color: "#111827" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#fff", borderRadius: "12px", padding: "16px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: "15px", fontWeight: "800", color }}>{value}</div>
                  <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", fontWeight: "600" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Visual breakdown bar */}
            <div style={{ background: "#fff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "32px" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", marginBottom: "14px" }}>Payment Breakdown</div>
              <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", height: "20px", marginBottom: "12px" }}>
                <div style={{ width: `${principalPct}%`, background: "#6366f1", transition: "width 0.5s" }} />
                <div style={{ width: `${interestPct}%`, background: "#f97316", transition: "width 0.5s" }} />
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#6366f1", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Principal {principalPct}%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#f97316", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Interest {interestPct}%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Back link */}
        <div style={{ textAlign: "center" }}>
          <a href="https://tabutility.com" style={{ fontSize: "14px", color: "#6366f1", textDecoration: "none", fontWeight: "600" }}>
            ← Back to all free tools
          </a>
        </div>
      </div>
    </div>
  );
}
