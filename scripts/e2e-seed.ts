// Test-only DB seeding helper for Playwright E2E specs (tests/e2e/*.spec.ts).
//
// Playwright's own module loader can't import "@/lib/prisma" directly: the
// Prisma-generated client (lib/generated/prisma/client.ts) relies on
// `import.meta.url` and only runs correctly as real ESM, which conflicts with
// how Playwright's esbuild-based loader evaluates spec files. Running this
// script as a separate `tsx` process sidesteps that. Never imported by
// application code.

try {
  process.loadEnvFile();
} catch {
  // .env is optional — CI environments provide these vars directly.
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

type CreateUserArgs = { name: string; email: string; password: string };
type DeleteUserArgs = { email: string };
type CreateResetTokenArgs = { userId: string; expired?: boolean };

async function main() {
  // Dynamic import: `process.loadEnvFile()` above must run before
  // "../lib/prisma" is evaluated (it reads DATABASE_URL at module scope), and
  // static imports are hoisted above all other top-level code in ESM.
  const { generateResetToken, hashPassword } = await import("../lib/auth/password");
  const { prisma } = await import("../lib/prisma");

  const command = process.argv[2];
  const raw = await readStdin();
  const args = raw ? JSON.parse(raw) : {};

  try {
    switch (command) {
      case "create-user": {
        const { name, email, password } = args as CreateUserArgs;
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({ data: { name, email, passwordHash } });
        process.stdout.write(JSON.stringify({ id: user.id }));
        break;
      }

      case "delete-user": {
        const { email } = args as DeleteUserArgs;
        await prisma.user.delete({ where: { email } }).catch(() => undefined);
        process.stdout.write(JSON.stringify({ ok: true }));
        break;
      }

      case "create-reset-token": {
        const { userId, expired } = args as CreateResetTokenArgs;
        const generated = generateResetToken();
        const expiresAt = expired ? new Date(Date.now() - 60_000) : generated.expiresAt;
        await prisma.passwordResetToken.create({
          data: { tokenHash: generated.tokenHash, userId, expiresAt },
        });
        process.stdout.write(JSON.stringify({ token: generated.token }));
        break;
      }

      default:
        throw new Error(`Unknown e2e-seed command: ${command}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
