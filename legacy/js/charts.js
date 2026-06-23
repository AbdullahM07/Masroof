let _catChart = null
let _payChart = null

function renderCharts(expenses) {
  _renderCategoryChart(expenses)
  _renderPaymentChart(expenses)
}

function _renderCategoryChart(expenses) {
  const canvas = document.getElementById('chart-category')
  const ctx = canvas.getContext('2d')
  if (_catChart) { _catChart.destroy(); _catChart = null }

  const totals = {}
  expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount })

  _setChartEmpty('chart-category', !Object.keys(totals).length)
  if (!Object.keys(totals).length) return

  const labels = Object.keys(totals).map(k => CATEGORY_LABELS[k] || k)
  const data   = Object.values(totals)
  const colors = Object.keys(totals).map(k => CATEGORY_COLORS_MAP[k] || '#94a3b8')
  const sum    = data.reduce((a, b) => a + b, 0)

  _catChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { font: { size: 12 }, boxWidth: 12, padding: 10 } },
        tooltip: {
          callbacks: { label: c => ` ${formatEGP(c.raw)} (${Math.round(c.raw / sum * 100)}%)` }
        }
      }
    }
  })
}

function _renderPaymentChart(expenses) {
  const canvas = document.getElementById('chart-payment')
  const ctx = canvas.getContext('2d')
  if (_payChart) { _payChart.destroy(); _payChart = null }

  const cashTotal = expenses.filter(e => e.paymentMethod === 'cash').reduce((s, e) => s + e.amount, 0)
  const cardTotals = {}
  expenses.filter(e => e.paymentMethod === 'visa').forEach(e => {
    const lbl = e.cardName || 'Unknown Card'
    cardTotals[lbl] = (cardTotals[lbl] || 0) + e.amount
  })

  const labels = []
  const data   = []
  if (cashTotal > 0) { labels.push('Cash'); data.push(cashTotal) }
  Object.entries(cardTotals).forEach(([k, v]) => { labels.push(k); data.push(v) })

  _setChartEmpty('chart-payment', !data.length)
  if (!data.length) return

  const PALETTE = ['#10b981','#2563eb','#7c3aed','#f97316','#d97706','#0891b2','#be185d','#1e293b']

  _payChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: PALETTE.slice(0, labels.length), borderRadius: 6, borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${formatEGP(c.raw)}` } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#e2e8f0' }, ticks: { callback: v => formatEGP(v, true) } },
        x: { grid: { display: false } }
      }
    }
  })
}

function _setChartEmpty(canvasId, isEmpty) {
  const wrap = document.getElementById(canvasId).closest('.chart-wrap')
  let ov = wrap.querySelector('.chart-empty-overlay')
  if (!ov) {
    ov = document.createElement('div')
    ov.className = 'chart-empty-overlay'
    ov.textContent = 'No expense data this period'
    wrap.appendChild(ov)
  }
  ov.style.display = isEmpty ? 'flex' : 'none'
}
