function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
      document.querySelectorAll('.tab-section').forEach(t => t.classList.remove('active'))
      btn.classList.add('active')
      document.getElementById('tab-' + tab).classList.add('active')
      if (tab === 'dashboard') renderDashboard()
    })
  })
}

function renderDashboard() {
  const monthStr = document.getElementById('dash-month').value || currentMonthStr()
  const income   = Storage.getIncome().filter(e => e.date.startsWith(monthStr))
  const expenses = Storage.getExpenses().filter(e => e.date.startsWith(monthStr))

  const totalIncome   = income.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const balance       = totalIncome - totalExpenses

  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Income</div>
      <div class="stat-value positive">${formatEGP(totalIncome)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Expenses</div>
      <div class="stat-value negative">${formatEGP(totalExpenses)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Net Balance</div>
      <div class="stat-value ${balance >= 0 ? 'positive' : 'negative'}">${balance >= 0 ? '+' : ''}${formatEGP(balance)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Transactions</div>
      <div class="stat-value">${income.length + expenses.length}</div>
    </div>`

  renderCharts(expenses)

  const recent = [
    ...income.map(e => ({ ...e, _type: 'income' })),
    ...expenses.map(e => ({ ...e, _type: 'expense' }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)

  const recentEl = document.getElementById('dash-recent')
  if (!recent.length) {
    recentEl.innerHTML = `<div class="empty-state"><p>No transactions this month.</p></div>`
    return
  }

  recentEl.innerHTML = `<div class="recent-list">${recent.map(item => {
    const isInc  = item._type === 'income'
    const icon   = isInc ? '💰' : (CATEGORY_ICONS[item.category] || '💸')
    const bg     = isInc ? '#ecfdf5' : (CATEGORY_COLORS_MAP[item.category] || '#f1f5f9') + '22'
    const label  = isInc ? escHtml(item.source) : escHtml(item.description)
    const meta   = isInc
      ? formatDate(item.date)
      : `${CATEGORY_LABELS[item.category] || item.category} · ${item.paymentMethod === 'cash' ? 'Cash' : escHtml(item.cardName || 'Visa')} · ${formatDate(item.date)}`
    const amtCls = isInc ? 'pos' : 'neg'
    const amtStr = isInc ? `+${formatEGP(item.amount)}` : `−${formatEGP(item.amount)}`

    return `<div class="recent-item">
      <div class="recent-left">
        <div class="recent-icon" style="background:${bg}">${icon}</div>
        <div>
          <div class="recent-desc">${label}</div>
          <div class="recent-meta">${meta}</div>
        </div>
      </div>
      <div class="recent-amt ${amtCls}">${amtStr}</div>
    </div>`
  }).join('')}</div>`
}

document.addEventListener('DOMContentLoaded', () => {
  const now = currentMonthStr()
  document.getElementById('dash-month').value = now
  document.getElementById('income-month-filter').value = now
  document.getElementById('exp-month-filter').value = now

  document.getElementById('dash-month').addEventListener('change', renderDashboard)

  initNav()
  initCards()
  initIncome()
  initExpenses()
  renderDashboard()
})
