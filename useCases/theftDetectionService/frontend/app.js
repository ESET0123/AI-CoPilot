const API_BASE = "http://localhost:8010"

let state = {}
let busy = false

function addMessage(text, type = "bot", container = "chatWindow") {
    const chat = document.getElementById(container)
    const div = document.createElement("div")
    div.className = `message ${type}`
    div.textContent = text
    chat.appendChild(div)
    chat.scrollTop = chat.scrollHeight
}

function addSQLMessage(sqlData, container = "chatWindow") {
    const chat = document.getElementById(container)
    const wrapper = document.createElement("div")
    wrapper.className = "message bot sql-message"

    // SQL Section
    const sqlSection = document.createElement("div")
    sqlSection.className = "sql-section"

    const sqlLabel = document.createElement("div")
    sqlLabel.className = "sql-label"
    sqlLabel.textContent = sqlData.success ? "✓ Generated SQL" : "⚠ Generated SQL (Failed)"

    const sqlCode = document.createElement("pre")
    sqlCode.className = "sql-code"
    sqlCode.textContent = sqlData.sql || "No SQL generated"

    sqlSection.appendChild(sqlLabel)
    sqlSection.appendChild(sqlCode)
    wrapper.appendChild(sqlSection)

    // Show raw SQL if different (for debugging)
    if (sqlData.raw_sql && sqlData.raw_sql !== sqlData.sql) {
        const rawSection = document.createElement("details")
        rawSection.className = "raw-sql-details"
        const summary = document.createElement("summary")
        summary.textContent = "Show raw model output"
        const rawCode = document.createElement("pre")
        rawCode.className = "sql-code"
        rawCode.textContent = sqlData.raw_sql
        rawSection.appendChild(summary)
        rawSection.appendChild(rawCode)
        wrapper.appendChild(rawSection)
    }

    // Error Section
    if (sqlData.error) {
        const errorDiv = document.createElement("div")
        errorDiv.className = "error-section"
        errorDiv.textContent = `Error: ${sqlData.error}`
        wrapper.appendChild(errorDiv)
    }

    // Result Section
    if (sqlData.result && sqlData.result.length > 0) {
        const resultLabel = document.createElement("div")
        resultLabel.className = "result-label"
        resultLabel.textContent = `📊 Results (${sqlData.result.length} rows)`

        const resultCode = document.createElement("pre")
        resultCode.className = "result-code"
        resultCode.textContent = JSON.stringify(sqlData.result, null, 2)

        wrapper.appendChild(resultLabel)
        wrapper.appendChild(resultCode)
    } else if (sqlData.success && (!sqlData.result || sqlData.result.length === 0)) {
        const noData = document.createElement("div")
        noData.className = "no-data"
        noData.textContent = "✓ Query executed successfully (no results)"
        wrapper.appendChild(noData)
    }

    chat.appendChild(wrapper)
    chat.scrollTop = chat.scrollHeight
}

function showTyping(container = "chatWindow") {
    const chat = document.getElementById(container)
    const div = document.createElement("div")
    div.className = "message bot typing"
    div.textContent = "Thinking..."
    div.id = "typing-indicator"
    chat.appendChild(div)
    chat.scrollTop = chat.scrollHeight
}

function removeTyping(container = "chatWindow") {
    const typing = document.getElementById("typing-indicator")
    if (typing) typing.remove()
}

async function sendQuery() {
    if (busy) return

    const input = document.getElementById("prompt")
    const model = document.getElementById("model").value

    const text = input.value.trim()
    if (!text) return

    busy = true
    addMessage(text, "user")
    input.value = ""
    showTyping()

    try {
        const res = await fetch(`${API_BASE}/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: text,
                model: model
            })
        })

        const data = await res.json()
        removeTyping()

        // Display SQL and results with proper formatting
        addSQLMessage(data)

    } catch (error) {
        removeTyping()
        addMessage("⚠ Backend not reachable. Make sure the server is running on port 8010.", "bot")
        console.error(error)
    }

    busy = false
}

// CASE BOT
function openBot() {
    document.getElementById("botModal").style.display = "block"
    send()
}

function closeBot() {
    document.getElementById("botModal").style.display = "none"
    state = {}
    document.getElementById("chat").innerHTML = ""
    document.getElementById("options").innerHTML = ""
    document.getElementById("input").value = ""
}

async function send(answer = null) {
    const input = document.getElementById("input")

    if (answer || input.value) {
        addMessage(answer || input.value, "user", "chat")
    }

    const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            state: state,
            answer: answer || input.value
        })
    })

    const data = await res.json()

    if (data.done) {
        addMessage(data.message, "bot", "chat")
        setTimeout(closeBot, 1200)
        return
    }

    state = data.state
    addMessage(data.message, "bot", "chat")
    renderOptions(data.options)
    input.value = ""
}

function renderOptions(options) {
    const box = document.getElementById("options")
    box.innerHTML = ""

    if (!options) return

    options.forEach(opt => {
        const btn = document.createElement("button")
        btn.innerText = opt
        btn.onclick = () => send(opt)
        box.appendChild(btn)
    })
}

// ESC + click outside
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeBot()
})

document.getElementById("botModal").addEventListener("click", e => {
    if (!document.getElementById("chatbox").contains(e.target)) {
        closeBot()
    }
})

document.getElementById("prompt").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendQuery()
    }
})