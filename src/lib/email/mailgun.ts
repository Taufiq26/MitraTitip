interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const MAILGUN_API_BASE = "https://api.mailgun.net/v3";

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    throw new Error("Mailgun belum dikonfigurasi (MAILGUN_API_KEY/MAILGUN_DOMAIN)");
  }

  const from = process.env.MAILGUN_FROM ?? `MitraTitip <no-reply@${domain}>`;

  const form = new FormData();
  form.set("from", from);
  form.set("to", to);
  form.set("subject", subject);
  form.set("html", html);

  const response = await fetch(`${MAILGUN_API_BASE}/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gagal mengirim email via Mailgun (${response.status}): ${body}`);
  }
}
