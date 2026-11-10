<!-- Draft written by AI (status: draft, author: ai-placeholder). The teacher reviews it before real use. -->
# The starci/ folder in your project

The project is yours: any topic, language and structure. The `starci/` folder only tells StarCi how to run your project and where your evidence lives. There is no sample project.

## Init and run

```
starci-next init      # copies starci/ (project.yaml, e2e/, report.mjs) and suggests the CI workflow into your project
starci-next run       # runs your tests and sends the results from your machine to StarCi
```

`init` asks for the language (typescript, java, csharp, go), fills `project` and `language` in `starci/project.yaml`, and copies `starci/e2e/*.md` for the concepts you pick. You edit `test.command`, `start` and `endpoints` to match your project.

## In practice versus Proved

- **In practice** ("Đang luyện"): results from your machine (`starci-next run`) or a CI run GitHub did not attest. They show you whether you are right, but they are not evidence yet.
- **Proved** ("Đã chứng minh"): the results of a CI run attested by GitHub (OIDC) for the repository bound to the project, a server probe result, or the AI teacher reading your code. A concept counts once all its evidence groups are met.

A behaviour concept needs a test or an e2e flow, and a probe. A structure concept needs the AI to read the code you point to. Probes are StarCi's generic checks, aimed at the endpoint you declare in `project.yaml`; you cannot edit them.

## Tag a test with [concept]

Put the concept id in square brackets in the test name, for example `[idempotency]`. A test without a tag counts for no concept. A skipped test does not count.

Tests must write JUnit XML into `starci/reports/`. Commands:

| Language | Tagged test name | Command that writes JUnit XML |
| --- | --- | --- |
| TypeScript, `node:test` | `test("[idempotency] same key, same result", ...)` | `node --test --test-reporter=junit --test-reporter-destination=starci/reports/junit.xml` |
| TypeScript, vitest | `it("[idempotency] same key, same result", ...)` | `npx vitest run --reporter=junit --outputFile=starci/reports/junit.xml` |
| TypeScript, jest | `it("[idempotency] ...", ...)` | `npx jest --reporters=jest-junit` with `JEST_JUNIT_OUTPUT_FILE=starci/reports/junit.xml` |
| Java, JUnit 5 | `@DisplayName("[idempotency] same key, same result")` | `mvn test`, then copy `target/surefire-reports/TEST-*.xml` |
| C#, xUnit | `[Fact(DisplayName = "[idempotency] same key, same result")]` | `dotnet test --logger "junit;LogFilePath=starci/reports/junit.xml"` (package `JunitXml.TestLogger`) |
| Go | `t.Run("[idempotency] same key, same result", ...)` | `gotestsum --junitfile starci/reports/junit.xml -- ./...` |

One test may carry several tags: `[transactions-and-isolation] [idempotency]`.

## E2E flows

`starci/e2e/<concept>.md` is a hand-written scenario: setup, steps with the expected outcome, and the evidence you record. Templates exist for `request-response-lifecycle`, `health-probe-semantics`, `server-state-cache-lifecycle`, `transactions-and-isolation` and `idempotency`; for any other concept add a file named after the concept id.

## CI

Copy the template in `ci/` for your language to `.github/workflows/starci.yml`. In the GitHub repository settings create the secrets `STARCI_PROJECT_ID` and `STARCI_CI_SECRET` (StarCi shows the values when you bind the repository) and the variable `STARCI_API_URL`. Never write a secret value into the repository. The workflow has `id-token: write` so GitHub can attest the run.
