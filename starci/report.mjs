// Gửi kết quả test lên webhook CI của StarCi. File nháp do AI viết; chạy bằng: node starci/report.mjs
// Đọc JUnit XML, lấy test có [concept] trong tên, ký HMAC-SHA256 và POST tới /webhooks/project-ci.
// Biến môi trường (chỉ tên, giá trị nằm trong secret của GitHub): STARCI_API_URL, STARCI_PROJECT_ID, STARCI_CI_SECRET.
import { createHmac } from "node:crypto"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const env = (name) => {
    const value = process.env[name]
    if (!value) throw new Error(`Thiếu biến môi trường ${name}`)
    return value
}
const decode = (text) =>
    text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&")
const reportsOf = (dir) =>
    readdirSync(dir).flatMap((name) => {
        const full = join(dir, name)
        return statSync(full).isDirectory() ? reportsOf(full) : name.endsWith(".xml") ? [full] : []
    })

const dir = process.argv[2] ?? "starci/reports"
const byTest = new Map()
if (!existsSync(dir)) {
    console.error(`StarCi CI: không có thư mục report ${dir}: bước test chưa ghi JUnit XML`)
    process.exit(1)
}
for (const file of reportsOf(dir)) {
    const xml = readFileSync(file, "utf8")
    for (const match of xml.matchAll(/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)) {
        const name = decode(/\bname="([^"]*)"/.exec(match[1])?.[1] ?? "")
        const inner = match[3] ?? ""
        const skipped = /<skipped\b/.test(inner)
        const passed = !skipped && !/<(failure|error)\b/.test(inner)
        for (const tag of name.matchAll(/\[([a-z0-9-]+)\]/g)) {
            if (skipped) continue
            const key = `${tag[1]}\u0000${name}`
            byTest.set(key, (byTest.get(key) ?? true) && passed)
        }
    }
}
const results = [...byTest].map(([key, passed]) => {
    const [concept, ref] = key.split("\u0000")
    return { concept, slot: "test", ref: ref.slice(0, 300), passed }
})
const body = Buffer.from(
    JSON.stringify({
        runId: `${process.env.GITHUB_RUN_ID ?? Date.now()}-${process.env.GITHUB_RUN_ATTEMPT ?? "1"}`,
        commit: (process.env.GITHUB_SHA ?? "").toLowerCase(),
        passed: results.every((result) => result.passed),
        results,
    }),
)
const timestamp = String(Date.now())
const signature =
    "sha256=" + createHmac("sha256", env("STARCI_CI_SECRET")).update(timestamp).update(".").update(body).digest("hex")
const headers = {
    "content-type": "application/json",
    "x-starci-project": env("STARCI_PROJECT_ID"),
    "x-starci-timestamp": timestamp,
    "x-starci-signature": signature,
}
// Token OIDC của GitHub Actions (cần `permissions: id-token: write`): có token thì lần chạy được coi là đã chứng thực.
if (process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
    const audience = encodeURIComponent(env("STARCI_API_URL"))
    const answer = await fetch(`${process.env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${audience}`, {
        headers: { authorization: `Bearer ${process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
    })
    if (answer.ok) headers["x-starci-oidc"] = (await answer.json()).value
}
const reply = await fetch(`${env("STARCI_API_URL").replace(/\/$/, "")}/webhooks/project-ci`, { method: "POST", headers, body })
console.log(`StarCi CI: ${results.length} kết quả, HTTP ${reply.status}`)
if (!reply.ok) process.exit(1)
