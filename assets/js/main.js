(function () {
  "use strict";

  const palette = {
    ink: "#102a43",
    muted: "#526b82",
    line: "#d8e2ec",
    teal: "#178f86",
    tealSoft: "#b9ede7",
    amber: "#b7791f",
    coral: "#d45d50",
    green: "#2f855a"
  };
  const chartFont = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  function escapeText(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pct(value, decimals) {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load ${path}`);
    }
    return response.json();
  }

  function showChartError(id) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '<p class="chart-error">Chart data could not be loaded. The table below contains the same values.</p>';
    }
  }

  function renderPahfSuccess(data) {
    const el = document.getElementById("pahf-success-chart");
    if (!el) return;

    const rule = data.heldout.find((row) => row.policy === "Rule-Only");
    const full = data.heldout.find((row) => row.policy === "PAB-F (full)");
    const series = [
      { label: "Embodied", rule: rule.embodied_success, full: full.embodied_success, change: "+42%" },
      { label: "Shopping", rule: rule.shopping_success, full: full.shopping_success, change: "+74%" }
    ];
    const width = 640;
    const height = 280;
    const chartTop = 34;
    const chartBottom = 224;
    const max = 0.15;
    const barW = 48;
    const groups = [180, 430];

    const bars = series.map((item, i) => {
      const x = groups[i];
      const ruleH = (item.rule / max) * (chartBottom - chartTop);
      const fullH = (item.full / max) * (chartBottom - chartTop);
      const ruleY = chartBottom - ruleH;
      const fullY = chartBottom - fullH;
      return `
        <g>
          <rect x="${x - 58}" y="${ruleY}" width="${barW}" height="${ruleH}" rx="6" fill="${palette.tealSoft}"></rect>
          <rect x="${x + 10}" y="${fullY}" width="${barW}" height="${fullH}" rx="6" fill="${palette.teal}"></rect>
          <text x="${x - 34}" y="${ruleY - 8}" text-anchor="middle" class="chart-value">${item.rule.toFixed(3)}</text>
          <text x="${x + 34}" y="${fullY - 8}" text-anchor="middle" class="chart-value">${item.full.toFixed(3)}</text>
          <text x="${x}" y="252" text-anchor="middle" class="chart-label">${escapeText(item.label)}</text>
          <text x="${x}" y="${Math.min(ruleY, fullY) - 30}" text-anchor="middle" class="chart-note">${item.change}</text>
        </g>
      `;
    }).join("");

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
        <style>
          .chart-label{font:700 14px ${chartFont};fill:${palette.ink}}
          .chart-value{font:700 13px ${chartFont};fill:${palette.muted}}
          .chart-note{font:800 13px ${chartFont};fill:${palette.coral}}
          .axis{stroke:${palette.line};stroke-width:1}
          .legend{font:700 13px ${chartFont};fill:${palette.muted}}
        </style>
        <line x1="70" x2="590" y1="${chartBottom}" y2="${chartBottom}" class="axis"></line>
        <line x1="70" x2="590" y1="${chartTop}" y2="${chartTop}" class="axis" opacity=".55"></line>
        <text x="70" y="28" class="legend">success rate</text>
        ${bars}
        <rect x="404" y="18" width="14" height="14" rx="3" fill="${palette.tealSoft}"></rect>
        <text x="426" y="30" class="legend">Rule-only</text>
        <rect x="504" y="18" width="14" height="14" rx="3" fill="${palette.teal}"></rect>
        <text x="526" y="30" class="legend">PAB-F full</text>
      </svg>
    `;
  }

  function renderClarification(data) {
    const el = document.getElementById("clarification-chart");
    if (!el) return;

    const rows = data.clarification_correction;
    const rule = rows.find((row) => row.policy === "Rule-Only");
    const full = rows.find((row) => row.policy === "PAB-F (full)");
    const values = [
      { label: "Rule-only", value: (rule.embodied_clarify + rule.shopping_clarify) / 2, color: palette.amber },
      { label: "PAB-F full", value: (full.embodied_clarify + full.shopping_clarify) / 2, color: palette.teal }
    ];
    const width = 640;
    const height = 280;
    const max = 0.4;
    const chartTop = 34;
    const chartBottom = 224;
    const bars = values.map((item, i) => {
      const x = i === 0 ? 210 : 420;
      const h = (item.value / max) * (chartBottom - chartTop);
      const y = chartBottom - h;
      return `
        <g>
          <rect x="${x - 44}" y="${y}" width="88" height="${h}" rx="8" fill="${item.color}"></rect>
          <text x="${x}" y="${y - 10}" text-anchor="middle" class="chart-value">${pct(item.value, 1)}</text>
          <text x="${x}" y="252" text-anchor="middle" class="chart-label">${escapeText(item.label)}</text>
        </g>
      `;
    }).join("");

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
        <style>
          .chart-label{font:700 14px ${chartFont};fill:${palette.ink}}
          .chart-value{font:800 15px ${chartFont};fill:${palette.ink}}
          .axis{stroke:${palette.line};stroke-width:1}
          .legend{font:700 13px ${chartFont};fill:${palette.muted}}
        </style>
        <line x1="88" x2="560" y1="${chartBottom}" y2="${chartBottom}" class="axis"></line>
        <line x1="88" x2="560" y1="${chartTop}" y2="${chartTop}" class="axis" opacity=".55"></line>
        <text x="88" y="28" class="legend">average clarification rate</text>
        ${bars}
      </svg>
    `;
  }

  function renderMathAlignment(data) {
    const el = document.getElementById("math-alignment-chart");
    if (!el) return;

    const rows = data.results;
    const max = Math.max(...rows.map((row) => row.alignment));
    const width = 640;
    const height = 310;
    const left = 136;
    const maxBar = 410;
    const rowH = 38;
    const top = 32;
    const bars = rows.map((row, i) => {
      const y = top + i * rowH;
      const w = row.alignment / 0.78 * maxBar;
      const color = row.alignment === max ? palette.coral : palette.teal;
      return `
        <g>
          <text x="${left - 12}" y="${y + 18}" text-anchor="end" class="chart-label">${escapeText(row.method)}</text>
          <rect x="${left}" y="${y}" width="${w}" height="22" rx="6" fill="${color}"></rect>
          <text x="${left + w + 10}" y="${y + 17}" class="chart-value">${row.alignment.toFixed(4)}</text>
        </g>
      `;
    }).join("");

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
        <style>
          .chart-label{font:700 13px ${chartFont};fill:${palette.ink}}
          .chart-value{font:700 13px ${chartFont};fill:${palette.muted}}
          .axis{stroke:${palette.line};stroke-width:1}
          .legend{font:700 13px ${chartFont};fill:${palette.muted}}
        </style>
        <text x="${left}" y="20" class="legend">preference alignment</text>
        <line x1="${left}" x2="${left + maxBar}" y1="276" y2="276" class="axis"></line>
        ${bars}
      </svg>
    `;
  }

  function renderMathTime(data) {
    const el = document.getElementById("math-time-chart");
    if (!el) return;

    const rows = data.results;
    const width = 640;
    const height = 310;
    const left = 72;
    const right = 590;
    const top = 34;
    const bottom = 244;
    const minTime = 45;
    const maxTime = 310;
    const minReward = 0.58;
    const maxReward = 0.73;
    const x = (time) => left + ((time - minTime) / (maxTime - minTime)) * (right - left);
    const y = (reward) => bottom - ((reward - minReward) / (maxReward - minReward)) * (bottom - top);

    const points = rows.map((row) => {
      const isPabf = row.method.startsWith("PABF");
      const cx = x(row.time_s);
      const cy = y(row.reward);
      return `
        <g>
          <circle cx="${cx}" cy="${cy}" r="${isPabf ? 7 : 6}" fill="${isPabf ? palette.teal : palette.amber}" opacity="0.92"></circle>
          <text x="${cx + 10}" y="${cy - 8}" class="chart-label">${escapeText(row.method)}</text>
        </g>
      `;
    }).join("");

    el.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" aria-hidden="true">
        <style>
          .chart-label{font:700 12px ${chartFont};fill:${palette.ink}}
          .axis{stroke:${palette.line};stroke-width:1.2}
          .tick{font:700 12px ${chartFont};fill:${palette.muted}}
        </style>
        <line x1="${left}" x2="${right}" y1="${bottom}" y2="${bottom}" class="axis"></line>
        <line x1="${left}" x2="${left}" y1="${top}" y2="${bottom}" class="axis"></line>
        <text x="${left}" y="20" class="tick">reward</text>
        <text x="${right}" y="282" text-anchor="end" class="tick">time (seconds)</text>
        <text x="${left - 12}" y="${y(0.70) + 4}" text-anchor="end" class="tick">0.70</text>
        <line x1="${left}" x2="${right}" y1="${y(0.70)}" y2="${y(0.70)}" class="axis" opacity=".4"></line>
        <text x="${left - 12}" y="${bottom + 4}" text-anchor="end" class="tick">0.58</text>
        ${points}
      </svg>
    `;
  }

  function setupCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = document.getElementById(button.getAttribute("data-copy-target"));
        const status = button.parentElement.querySelector(".copy-status");
        if (!target) return;
        try {
          await navigator.clipboard.writeText(target.innerText.trim());
          if (status) status.textContent = "Copied";
          window.setTimeout(() => {
            if (status) status.textContent = "";
          }, 1800);
        } catch (error) {
          if (status) status.textContent = "Select text to copy";
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupCopyButtons();

    loadJson("assets/data/pahf-results.json")
      .then((data) => {
        renderPahfSuccess(data);
        renderClarification(data);
      })
      .catch(() => {
        showChartError("pahf-success-chart");
        showChartError("clarification-chart");
      });

    loadJson("assets/data/math500-results.json")
      .then((data) => {
        renderMathAlignment(data);
        renderMathTime(data);
      })
      .catch(() => {
        showChartError("math-alignment-chart");
        showChartError("math-time-chart");
      });
  });
})();
