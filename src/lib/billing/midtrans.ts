interface CreateSnapTransactionParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}

interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
}

function midtransBaseUrl(): string {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  return isProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
}

export async function createSnapTransaction({
  orderId,
  amount,
  customerName,
  customerEmail,
}: CreateSnapTransactionParams): Promise<SnapTransactionResult> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error("Midtrans belum dikonfigurasi (MIDTRANS_SERVER_KEY)");
  }

  const response = await fetch(`${midtransBaseUrl()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: amount },
      customer_details: { first_name: customerName, email: customerEmail },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Gagal membuat transaksi Midtrans (${response.status}): ${body}`);
  }

  const json = (await response.json()) as { token: string; redirect_url: string };
  return { token: json.token, redirectUrl: json.redirect_url };
}
