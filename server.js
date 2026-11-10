// A tiny orders and payments API for the StarCi project demo (a learner's own project, not a StarCi sample).
const http = require("node:http")

const state = { stock: 1, orders: [], payments: new Map() }

const read = (req) =>
    new Promise((resolve) => {
        let raw = ""
        req.on("data", (chunk) => (raw += chunk))
        req.on("end", () => {
            try {
                resolve(raw ? JSON.parse(raw) : {})
            } catch {
                resolve(null)
            }
        })
    })

const send = (res, status, body) => {
    res.writeHead(status, { "content-type": "application/json" })
    res.end(JSON.stringify(body))
}

const createServer = () => {
    state.stock = 1
    state.orders = []
    state.payments = new Map()
    return http.createServer(async (req, res) => {
        if (req.method === "GET" && req.url === "/health") return send(res, 200, { ok: true })
        const body = await read(req)
        if (body === null) return send(res, 400, { error: "invalid json" })
        if (req.method === "POST" && req.url === "/orders/checkout") {
            // The check and the decrement happen in one synchronous step, so two buyers can never both take the last item.
            if (state.stock < 1) return send(res, 409, { error: "sold out" })
            state.stock -= 1
            const order = { id: `o-${state.orders.length + 1}`, item: body.item ?? "last-book" }
            state.orders.push(order)
            return send(res, 201, order)
        }
        if (req.method === "POST" && req.url === "/payments") {
            const key = req.headers["idempotency-key"]
            if (!key) return send(res, 400, { error: "Idempotency-Key required" })
            const fingerprint = JSON.stringify(body)
            const seen = state.payments.get(key)
            if (seen) {
                if (seen.fingerprint !== fingerprint) return send(res, 422, { error: "key reused with another body" })
                return send(res, 200, seen.payment)
            }
            const payment = { id: `p-${state.payments.size + 1}`, amount: body.amount }
            state.payments.set(key, { fingerprint, payment })
            return send(res, 201, payment)
        }
        return send(res, 404, { error: "not found" })
    })
}

module.exports = { createServer, state }
if (require.main === module) createServer().listen(3000)
