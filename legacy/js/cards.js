let _selectedColor = '#2563eb'

function initCards() {
  const form = document.getElementById('card-form')
  const picker = document.getElementById('color-picker')

  picker.addEventListener('click', e => {
    const sw = e.target.closest('.color-swatch')
    if (!sw) return
    picker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'))
    sw.classList.add('active')
    _selectedColor = sw.dataset.color
    document.getElementById('card-color').value = _selectedColor
  })

  form.addEventListener('submit', e => {
    e.preventDefault()
    const name  = document.getElementById('card-name').value.trim()
    const last4 = document.getElementById('card-last4').value.trim()
    const color = document.getElementById('card-color').value
    if (!name) return

    Storage.addCard({ name, last4, color })
    form.reset()
    _resetColorPicker(picker)
    renderCards()
    updateExpenseCardSelect()
  })

  renderCards()
}

function _resetColorPicker(picker) {
  picker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'))
  picker.querySelector('[data-color="#2563eb"]').classList.add('active')
  _selectedColor = '#2563eb'
  document.getElementById('card-color').value = '#2563eb'
}

function renderCards() {
  const container = document.getElementById('cards-list')
  const cards = Storage.getCards()

  if (!cards.length) {
    container.innerHTML = `<div class="empty-state"><p>No cards added yet.</p></div>`
    return
  }

  container.innerHTML = `<div class="visa-cards-grid">
    ${cards.map(card => `
      <div class="visa-card" style="background:linear-gradient(135deg,${card.color}bb,${card.color})">
        <div class="visa-card-info">
          <div class="vc-name">${escHtml(card.name)}</div>
          <div class="vc-num">${card.last4 ? `•••• •••• •••• ${escHtml(card.last4)}` : 'No number saved'}</div>
        </div>
        <button class="btn btn-sm btn-ghost-white" onclick="deleteCard('${card.id}')">Remove</button>
      </div>`).join('')}
  </div>`
}

function deleteCard(id) {
  if (!confirm('Remove this card? Expenses linked to it will become unlinked.')) return
  Storage.deleteCard(id)
  renderCards()
  updateExpenseCardSelect()
  renderDashboard()
}

function getCardLabel(cardId) {
  if (!cardId) return 'Visa'
  const c = Storage.getCardById(cardId)
  return c ? c.name + (c.last4 ? ` ····${c.last4}` : '') : 'Visa'
}
