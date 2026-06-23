function initIncome() {
  document.getElementById('income-date').value = todayStr()

  document.getElementById('income-form').addEventListener('submit', e => {
    e.preventDefault()
    const amount = parseFloat(document.getElementById('income-amount').value)
    const source = document.getElementById('income-source').value.trim()
    const date   = document.getElementById('income-date').value
    const note   = document.getElementById('income-note').value.trim()
    if (!amount || !source || !date) return

    Storage.addIncome({ amount, source, date, note })
    e.target.reset()
    document.getElementById('income-date').value = todayStr()
    renderIncomeList()
    renderDashboard()
  })

  document.getElementById('income-month-filter').addEventListener('change', renderIncomeList)
  renderIncomeList()
}

function renderIncomeList() {
  const container = document.getElementById('income-list')
  const mf = document.getElementById('income-month-filter').value
  let rows = Storage.getIncome()
  if (mf) rows = rows.filter(e => e.date.startsWith(mf))

  if (!rows.length) {
    container.innerHTML = `<div class="empty-state"><p>No income entries${mf ? ' this month' : ''}.</p></div>`
    return
  }

  const total = rows.reduce((s, e) => s + e.amount, 0)
  container.innerHTML = `
    <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Date</th><th>Source</th><th>Note</th><th>Amount</th><th></th>
      </tr></thead>
      <tbody>${rows.map(e => `
        <tr>
          <td>${formatDate(e.date)}</td>
          <td>${escHtml(e.source)}</td>
          <td class="text-muted">${escHtml(e.note || '—')}</td>
          <td class="amount-positive">+${formatEGP(e.amount)}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteIncome('${e.id}')">×</button></td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr>
        <td colspan="3" class="tfoot-label">Total</td>
        <td class="amount-positive tfoot-val">${formatEGP(total)}</td>
        <td></td>
      </tr></tfoot>
    </table>
    </div>`
}

function deleteIncome(id) {
  Storage.deleteIncome(id)
  renderIncomeList()
  renderDashboard()
}
