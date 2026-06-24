export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(value);
}

export const telegramTemplates = {
  welcome(): string {
    return `<b>Bot SmartSchedule aktif!</b> 🎉\n\nBot ini akan mengirimkan notifikasi otomatis untuk:\n✅ Jadwal baru yang ditambahkan\n🔔 Pengingat deadline yang mendekat\n\nUntuk menautkan akun, buka halaman <b>Profil</b> di SmartSchedule lalu klik tombol <b>"Mulai bot Telegram"</b>.`;
  },
  help(): string {
    return `Hai! 👋 Saya adalah bot pengingat <b>SmartSchedule</b>.\n\nSaya akan otomatis mengirimkan notifikasi saat:\n• Ada jadwal baru ditambahkan\n• Deadline sudah mendekat\n\nKetik /start untuk melihat info bot ini.`;
  },
  scheduleCreated(title: string, deadline: Date): string {
    return `<b>Jadwal baru ditambahkan</b> ✅\n\n<b>Judul:</b> ${escapeHtml(title)}\n<b>Deadline:</b> ${escapeHtml(formatDate(deadline))}\n\nSmartSchedule akan membantu mengingatkanmu.`;
  },
  deadlineReminder(title: string, deadline: Date, timeRemaining: string): string {
    return `<b>Pengingat jadwal</b> 🔔\n\n<b>Judul:</b> ${escapeHtml(title)}\n<b>Deadline:</b> ${escapeHtml(formatDate(deadline))}\n<b>Sisa waktu:</b> ${escapeHtml(timeRemaining)}\n\nSegera selesaikan atau perbarui status tugasmu di SmartSchedule.`;
  },
  test(requestedBy: string): string {
    return `<b>Notifikasi uji SmartSchedule</b> 🧪\n\nPengiriman diminta oleh administrator <b>${escapeHtml(requestedBy)}</b>. Konfigurasi Telegram berfungsi.`;
  },
  linked(username: string): string {
    return `<b>Bot berhasil diaktifkan!</b> ✅\n\nHalo, <b>${escapeHtml(username)}</b>. Chat ini sekarang terhubung dengan akun SmartSchedule kamu.\n\nKamu akan menerima notifikasi otomatis saat:\n• Ada jadwal baru ditambahkan\n• Deadline sudah mendekat`;
  },
};
