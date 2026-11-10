const { test, before, after } = require("node:test")
const assert = require("node:assert/strict")
const { createServer, state } = require("../server")

let server
let base
before(async () => {
    server = createServer()
    await new Promise((resolve) => server.listen(0, resolve))
    base = `http://127.0.0.1:${server.address().port}`
})
after(() => server.close())

const post = (path, body, headers = {}) =>
    fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) })

test("[transactions-and-isolation] two buyers, one last item: exactly one checkout succeeds", async () => {
    const results = await Promise.all([post("/orders/checkout", { item: "last-book" }), post("/orders/checkout", { item: "last-book" })])
    const statuses = results.map((r) => r.status).sort()
    assert.deepEqual(statuses, [201, 409])
    assert.equal(state.stock, 0)
    assert.equal(state.orders.length, 1)
})

test("[idempotency] the same Idempotency-Key returns the same payment and charges once", async () => {
    const first = await post("/payments", { orderId: "o-1", amount: 1000 }, { "idempotency-key": "k-1" })
    const second = await post("/payments", { orderId: "o-1", amount: 1000 }, { "idempotency-key": "k-1" })
    assert.equal(first.status, 201)
    assert.equal(second.status, 200)
    assert.deepEqual(await second.json(), await first.json())
    assert.equal(state.payments.size, 1)
})

test("[idempotency] the same key with another body is refused", async () => {
    const res = await post("/payments", { orderId: "o-1", amount: 9999 }, { "idempotency-key": "k-1" })
    assert.equal(res.status, 422)
})

test("health answers ok (no concept tag, counts for nothing)", async () => {
    const res = await fetch(`${base}/health`)
    assert.equal(res.status, 200)
})
