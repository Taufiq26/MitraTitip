---
name: MitraTitip
description: Aplikasi kasir (POS) yang cepat, ramah, dan andal untuk UMKM.
colors:
  primary: "oklch(0.85 0.08 180)"
  primary-foreground: "oklch(0.14 0.02 180)"
  neutral-bg: "oklch(0.985 0 0)"
  surface: "oklch(1 0 0)"
  text-main: "oklch(0.145 0 0)"
typography:
  headline:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  md: "10px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
---

# Design System: MitraTitip

## 1. Overview

**Creative North Star: "Asisten Toko yang Ramah & Rapi"**

Sistem desain ini merangkul estetika yang bersahabat (friendly) dan bersih tanpa mengorbankan sedikit pun kecepatan performa dan kemudahan penggunaan. Berbeda dengan aplikasi korporat yang kaku, MitraTitip terasa ringan berkat sentuhan warna pastel yang menenangkan. Antarmuka dirancang seringan mungkin agar pengguna awam (pemilik toko/kasir) merasa dibantu, bukan diintimidasi. Tidak ada animasi berat atau ornamen dekoratif yang memperlambat transisi antar halaman.

**Key Characteristics:**
- Ramah dan dapat diakses (accessible)
- Cepat, ringan, dan fungsional
- Bebas dari dekorasi yang berlebihan

## 2. Colors

Palet warna menggunakan pendekatan pastel yang lembut untuk kesan ramah, namun dengan kontras teks yang sangat tinggi (gelap) untuk memastikan keterbacaan maksimum.

### Primary
- **Pastel Teal** (oklch(0.85 0.08 180)): Digunakan untuk tombol aksi utama (checkout, tambah barang) dan status aktif. Warna pastel ini menenangkan dan tidak membuat mata lelah meski digunakan berjam-jam. Teks di atas warna ini harus menggunakan `primary-foreground` (gelap) bukan putih.

### Neutral
- **Off-White Background** (oklch(0.985 0 0)): Latar belakang aplikasi yang sangat bersih namun tidak menyilaukan.
- **Deep Ink Text** (oklch(0.145 0 0)): Warna teks utama (hampir hitam) untuk kontras maksimal.

### Named Rules
**The High-Contrast Pastel Rule.** Karena primary menggunakan warna pastel yang terang, teks di dalam tombol primary tidak boleh berwarna putih. Selalu gunakan teks berwarna gelap (ink/primary-foreground) di atas latar belakang pastel agar memenuhi standar aksesibilitas WCAG.

## 3. Typography

**Display Font:** System Sans (Geist / Inter / SF Pro)
**Body Font:** System Sans (Geist / Inter / SF Pro)

**Character:** Bersih, terstruktur, familiar, dan sangat mudah dibaca secara sekilas oleh pengguna awam dalam ritme kerja yang cepat.

### Hierarchy
- **Headline** (600, clamp(1.5rem, 3vw, 2rem), 1.2): Judul halaman (Dashboard, Transaksi Baru).
- **Title** (600, 1.125rem, 1.3): Judul kartu atau modal.
- **Body** (400, 1rem, 1.5): Teks konten utama dan deskripsi.
- **Label** (500, 0.875rem, normal): Label input form dan teks tombol.

### Named Rules
**The System First Rule.** Jangan memuat font kustom dari pihak ketiga jika tidak mutlak diperlukan. Kecepatan loading (performa) adalah prioritas. Font bawaan sistem operasi sudah cukup indah dan memastikan aplikasi memuat dengan instan.

## 4. Elevation

Elevasi menggunakan pendekatan **Berbayang Halus** (subtle shadows) untuk membantu pengguna awam mengenali batasan antar komponen tanpa terlihat berlebihan.

### Shadow Vocabulary
- **Ambient Low** (`box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)`): Bayangan standar untuk kartu komponen dan elemen interaktif agar tampak sedikit melayang dari latar.
- **Modal Float** (`box-shadow: 0 10px 25px rgba(0,0,0,0.1)`): Bayangan tebal dan lebar untuk modal/pop-up agar pemisahan fokus sangat jelas.

### Named Rules
**The Functional Shadow Rule.** Bayangan (shadows) digunakan murni untuk memperjelas hierarki dan memisahkan lapisan konten (seperti memisahkan modal dari halaman utama), bukan sekadar untuk gaya-gayaan.

## 5. Components

### Buttons
- **Shape:** Sedikit melengkung (10px radius).
- **Primary:** Background pastel teal dengan teks gelap (ink). Padding 8px 16px.
- **Hover / Focus:** Efek hover mengubah opacity atau slightly darken background secara instan (tanpa transisi animasi lambat).

### Cards / Containers
- **Corner Style:** 10px radius.
- **Background:** Putih bersih (Surface).
- **Shadow Strategy:** Ambient Low shadow.
- **Border:** Tipis (1px) dan sangat samar jika bayangan tidak cukup terlihat di monitor berkualitas rendah.

### Inputs / Fields
- **Style:** Border samar, background putih, radius 10px.
- **Focus:** Ring tebal berawarna primary pastel untuk menunjukkan elemen mana yang sedang aktif tanpa keraguan.

## 6. Do's and Don'ts

### Do:
- **Do** gunakan teks warna gelap (ink) di atas tombol berbackground pastel.
- **Do** pastikan transisi halaman terasa secepat kilat.
- **Do** gunakan bahasa yang familiar dan tidak teknis untuk label tombol.

### Don't:
- **Don't** gunakan desain kelas enterprise yang kaku, rumit, atau "over-decorated".
- **Don't** membuat alur aplikasi melambat karena animasi (hindari durasi transisi >200ms).
- **Don't** gunakan teks warna abu-abu muda berukuran kecil yang sulit dibaca kasir dalam keadaan terburu-buru.
