import { createHash } from "node:crypto";

interface VerifySignatureParams {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}

/**
 * Midtrans: signature_key = SHA512(order_id + status_code + gross_amount + server_key)
 * https://docs.midtrans.com/docs/https-notification-webhooks
 */
export function verifyMidtransSignature({
  orderId,
  statusCode,
  grossAmount,
  signatureKey,
}: VerifySignatureParams): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  const expected = createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return expected === signatureKey;
}
