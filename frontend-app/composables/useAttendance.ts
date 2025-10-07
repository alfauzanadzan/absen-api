import { useAuth } from "@/composables/useAuth";

export const useAttendance = () => {
  const { user, loadUser } = useAuth();
  const message = ref<string | null>(null);

  const apiBase = useRuntimeConfig().public.apiBase || "http://localhost:3000";

  // ✅ Check-in
  const checkIn = async (qrValue: string) => {
    await loadUser();
    if (!user.value?.id) {
      message.value = "⚠️ User belum login";
      return;
    }

    try {
      const body = {
        userId: user.value.id,
        role: user.value.role, // PEKERJA, KAPROG, dll
        qrValue,
      };

      const res = await $fetch(`${apiBase}/attendance/checkin`, {
        method: "POST",
        body,
      });

      message.value = res ? "✅ Check-in berhasil" : "✅ Check-in selesai";
    } catch (err: any) {
      console.error("Check-in error:", err);
      message.value = `❌ Gagal check-in: ${err?.data?.message || err.message || err}`;
    }
  };

  // ✅ Check-out
  const checkOut = async (qrValue: string) => {
    await loadUser();
    if (!user.value?.id) {
      message.value = "⚠️ User belum login";
      return;
    }

    try {
      const body = {
        userId: user.value.id,
        qrValue,
      };

      const res = await $fetch(`${apiBase}/attendance/checkout`, {
        method: "POST",
        body,
      });

      message.value = res ? "✅ Check-out berhasil" : "✅ Check-out selesai";
    } catch (err: any) {
      console.error("Check-out error:", err);
      message.value = `❌ Gagal check-out: ${err?.data?.message || err.message || err}`;
    }
  };

  return { message, checkIn, checkOut };
};
