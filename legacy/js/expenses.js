function initExpenses() {
  document.getElementById('exp-date').value = todayStr()

  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('card-select-group').style.display =
        r.value === 'visa' ? '' : 'none'
    })
  })

  document.getElementById('expense-form').addEventListener('submit', e => {
    e.preventDefault()
    const amount      = parseFloat(document.getElementById('exp-amount').value)
    const description = document.getElementById('exp-desc').value.trim()
    const category    = document.getElementById('exp-category').value
    const method      = document.querySelector('input[name="payment"]:checked').value
    const cardId      = method === 'visa' ? (document.getElementById('exp-card').value || null) : null
    const date        = document.getElementById('exp-date').value
    if (!amount || !description || !category || !date) return

    const cardName = cardId ? getCardLabel(cardId) : null
    Storage.addExpense({ amount, description, category, paymentMethod: method, cardId, cardName, date })
    e.target.reset()
    document.getElementById('exp-date').value = todayStr()
    document.getElementById('card-select-group').style.display = 'none'
    renderExpensesList()
    renderDashboard()
  })

  document.getElementById('exp-month-filter').addEventListener('change', renderExpensesList)
  document.getElementById('exp-cat-filter').addEventListener('change', renderExpensesList)
  document.getElementById('exp-pay-filter').addEventListener('change', renderExpensesList)

  updateExpenseCardSelect()
  renderExpensesList()
}

function updateExpenseCardSelect() {
  const sel = document.getElementById('exp-card')
  const cards = Storage.getCards()
  if (!cards.length) {
    sel.innerHTML = '<option value="">— Add a card first —</option>'
    return
  }
  sel.innerHTML = cards.map(c =>
    `<option value="${c.id}">${escHtml(c.name)}${c.last4 ? ` ····${c.last4}` : ''}</option>`
  ).join('')
}

function renderExpensesList() {
  const container = document.getElementById('expense-list')
  const mf  = document.getElementById('exp-month-filter').value
  const cf  = document.getElementById('exp-cat-filter').value
  const pf  = document.getElementById('exp-pay-filter').value

  let rows = Storage.getExpenses()
  if (mf) rows = rows.filter(e => e.date.startsWith(mf))
  if (cf) rows = rows.filter(e => e.category === cf)
  if (pf) rows = rows.filter(e => e.paymentMethod === pf)

  if (!rows.length) {
    container.innerHTML = `<div class="empty-state"><p>No expenses found.</p></div>`
    return
  }

  const total = rows.reduce((s, e) => s + e.amount, 0)
  container.innerHTML = `
    <div class="table-wrap">
    <table class="data-table">
      <thead><tr>
        <th>Date</th><th>Description</th><th>Category</th><th>Payment</th><th>Amount</th><th></th>
      </tr></thead>
      <tbody>${rows.map(e => {
        const label = e.paymentMethod === 'cash'
          ? '<span class="badge badge-cash">Cash</span>'
          : `<span class="badge badge-visa">${escHtml(truncate(e.cardName || 'Visa', 18))}</span>`
        return `<tr>
          <td>${formatDate(e.date)}</td>
          <td>${escHtml(e.description)}</td>
          <td><span class="badge badge-${e.category}">${CATEGORY_LABELS[e.category] || e.category}</span></td>
          <td>${label}</td>
          <td class="amount-negative">−${formatEGP(e.amount)}</td>
          <td><button class="btn btn-sm btn-danger" onclick="deleteExpense('${e.id}')">×</button></td>
        </tr>`}).join('')}
      </tbody>
      <tfoot><tr>
        <td colspan="4" class="tfoot-label">Total</td>
        <td class="amount-negative tfoot-val">−${formatEGP(total)}</td>
        <td></td>
      </tr></tfoot>
    </table>
    </div>`
}

function deleteExpense(id) {
  Storage.deleteExpense(id)
  renderExpensesList()
  renderDashboard()
}
