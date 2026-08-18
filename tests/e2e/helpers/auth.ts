import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import type { BrowserContext, Page } from "@playwright/test";
import { decode } from "next-auth/jwt";

// Matches @auth/core's default cookie name for the JWT session strategy over
// plain HTTP (no `__Secure-` prefix, which only applies behind HTTPS).
export const SESSION_COOKIE_NAME = "authjs.session-token";

export const DEFAULT_TEST_PASSWORD = "Senha123";

export type TestUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

// Seeding/cleanup runs in a separate `tsx` process (scripts/e2e-seed.ts)
// instead of importing "@/lib/prisma" here directly: the Prisma-generated
// client relies on `import.meta.url` and only runs as real ESM, which
// conflicts with Playwright's own esbuild-based spec loader.
function runSeedScript<T>(command: string, args: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", "scripts/e2e-seed.ts", command], {
      cwd: process.cwd(),
      shell: process.platform === "win32",
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`e2e-seed ${command} failed (exit ${code}): ${stderr || stdout}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout) as T);
      } catch {
        reject(new Error(`e2e-seed ${command} returned invalid JSON: ${stdout}`));
      }
    });

    child.stdin.write(JSON.stringify(args));
    child.stdin.end();
  });
}

export async function createTestUser(
  overrides: Partial<{ name: string; password: string }> = {}
): Promise<TestUser> {
  const name = overrides.name ?? "Pessoa de Teste";
  const password = overrides.password ?? DEFAULT_TEST_PASSWORD;
  const email = `e2e-${randomUUID()}@example.com`;

  const { id } = await runSeedScript<{ id: string }>("create-user", { name, email, password });

  return { id, name, email, password };
}

export async function deleteTestUserByEmail(email: string): Promise<void> {
  await runSeedScript("delete-user", { email });
}

export async function createValidResetToken(userId: string): Promise<string> {
  const { token } = await runSeedScript<{ token: string }>("create-reset-token", {
    userId,
    expired: false,
  });
  return token;
}

export async function createExpiredResetToken(userId: string): Promise<string> {
  const { token } = await runSeedScript<{ token: string }>("create-reset-token", {
    userId,
    expired: true,
  });
  return token;
}

export async function loginViaUi(
  page: Page,
  user: Pick<TestUser, "email" | "password">,
  options: { rememberMe?: boolean } = {}
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(user.email);
  await page.getByLabel("Senha").fill(user.password);

  if (options.rememberMe) {
    await page.getByLabel("Lembrar de mim").check();
  }

  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("/");
}

export async function getSessionCookieValue(context: BrowserContext): Promise<string> {
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name === SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    throw new Error("Session cookie not found after login.");
  }

  return sessionCookie.value;
}

export async function decodeSessionCookie(
  rawToken: string
): Promise<{ expiresAt?: number } | null> {
  return decode({
    token: rawToken,
    secret: process.env.AUTH_SECRET as string,
    salt: SESSION_COOKIE_NAME,
  });
}
