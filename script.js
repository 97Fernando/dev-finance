const Modal = {
    open() {
        document.querySelector(".modal-overlay")
        .classList
        .add("active")
    },

    close() {
        document.querySelector(".modal-overlay")
        .classList
        .remove("active")
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem(
            "dev.finance:transactions"
        )) || []
    },

    set(transactions) {
        localStorage.setItem(
            "dev.finance:transactions", 
            JSON.stringify(transactions)
        )
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        Storage.set(Transaction.all)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income;
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const classCSS = transaction.amount > 0 ? "income" : "expense"
        const btnIMG = transaction.amount > 0 ? "plus.svg" : "minus.svg"
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${classCSS}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/${btnIMG}" alt="Botão de acção">
            </td>
        `
        return html
    },

    updateTransaction() {
        document
            .getElementById("incomeDisplay")
            .innerText = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById("expenseDisplay")
            .innerText = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById("totalDisplay")
            .innerText = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        // Converter para um número e pegar seu sinal
        const signal = Number(value) < 0 ? "-" : ""
        // Converter para um string
        value = String(value).replace(/\D/g, "")
        
        value = Number(value) / 100
        
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return `${signal} ${value}`
    },

    formatValue(value) {
        value = Number(value) * 100
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),
    
    getFields() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    formatAmount() {
        let { description, amount, date } = Form.getFields()
        amount = Utils.formatValue(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
        
    },

    validateFields() {
        const { description, amount, date } = Form.getFields()
        if (description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos.")
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            // Form.validateFields()
            const transaction = Form.formatAmount()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
        
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateTransaction()
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()