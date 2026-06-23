const Storage = {
  _K: { income: 'sm_income', expenses: 'sm_expenses', cards: 'sm_cards' },

  _get(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]') }
    catch { return [] }
  },
  _set(key, data) { localStorage.setItem(key, JSON.stringify(data)) },

  getIncome()  { return this._get(this._K.income) },
  addIncome(entry) {
    const data = this.getIncome()
    const id = crypto.randomUUID()
    data.unshift({ ...entry, id })
    this._set(this._K.income, data)
    return id
  },
  deleteIncome(id) {
    this._set(this._K.income, this.getIncome().filter(e => e.id !== id))
  },

  getExpenses() { return this._get(this._K.expenses) },
  addExpense(entry) {
    const data = this.getExpenses()
    const id = crypto.randomUUID()
    data.unshift({ ...entry, id })
    this._set(this._K.expenses, data)
    return id
  },
  deleteExpense(id) {
    this._set(this._K.expenses, this.getExpenses().filter(e => e.id !== id))
  },

  getCards() { return this._get(this._K.cards) },
  addCard(card) {
    const data = this.getCards()
    const id = crypto.randomUUID()
    data.push({ ...card, id })
    this._set(this._K.cards, data)
    return id
  },
  deleteCard(id) {
    const expenses = this.getExpenses().map(e =>
      e.cardId === id ? { ...e, cardId: null } : e
    )
    this._set(this._K.expenses, expenses)
    this._set(this._K.cards, this.getCards().filter(c => c.id !== id))
  },
  getCardById(id) {
    return this.getCards().find(c => c.id === id) || null
  }
}
