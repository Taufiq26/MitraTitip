interface VerificationEmailParams {
  adminName: string;
  tenantName: string;
  verifyUrl: string;
}

export function verificationEmailHtml({ adminName, tenantName, verifyUrl }: VerificationEmailParams): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin-bottom: 4px;">Verifikasi email Anda</h2>
      <p>Halo ${adminName},</p>
      <p>Terima kasih telah mendaftarkan <strong>${tenantName}</strong> di MitraTitip. Klik tombol di bawah untuk memverifikasi email Anda dan mulai menggunakan akun.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background: #111827; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verifikasi Email</a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">Jika tombol tidak berfungsi, salin tautan ini ke browser Anda:<br>${verifyUrl}</p>
      <p style="color: #6b7280; font-size: 14px;">Tautan berlaku 24 jam. Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
    </div>
  `.trim();
}
