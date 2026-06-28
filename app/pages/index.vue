<script setup>
definePageMeta({
  title: "Dashboard",
  middleware: "auth",
});

useSeoMeta({ title: "Dashboard" });

import {
  IconUsers,
  IconHourglassEmpty,
  IconFileDescription,
  IconBackpack,
} from "@tabler/icons-vue";

const { get } = useApi();
const { user } = useAuth();
useSession();

const dashboardData = ref(null);
const loading = ref(true);

const getRoleName = (roleId) => {
  const r = Number(roleId);
  if (r === 1) return "Superadmin";
  if (r === 2) return "Manager HRD";
  if (r === 3) return "Admin HRD";
  return "Pegawai";
};

onMounted(async () => {
  // === TRACE DEBUG UTAMA (Cek ini di Console Browser Anda / F12) ===
  console.log(
    "%c=== TRACE DASHBOARD START ===",
    "background: #222; color: #bada55; font-size: 14px;",
  );
  console.log("Isi Objek User:", user.value);
  console.log("Tipe Data id_role:", typeof user.value?.id_role);
  console.log("Nilai id_role:", user.value?.id_role);

  // Gunakan Number() untuk mengantisipasi jika id_role dikirim sebagai string "2"
  const currentUserRole = user.value?.id_role
    ? Number(user.value.id_role)
    : null;
  console.log(
    "Evaluasi Nilai Role (Setelah Dikonversi Ke Number):",
    currentUserRole,
  );

  if (currentUserRole === 2) {
    console.log(
      "%c[SUCCESS] Masuk kondisi Manager HRD. Mulai fetch data...",
      "color: green; font-weight: bold;",
    );
    try {
      const res = await get("/dashboard");
      console.log("Respon Kasar API dari Backend:", res);

      if (res && res.data) {
        dashboardData.value = res.data;
      } else {
        dashboardData.value = res;
      }

      console.log("Hasil akhir data yang diikat ke Vue:", dashboardData.value);
    } catch (err) {
      console.error("[ERROR] Gagal hit API /dashboard:", err);
    } finally {
      loading.value = false;
    }
  } else {
    console.log(
      `%c[BYPASS] Dilewati karena role ID adalah ${currentUserRole} (Bukan Manager HRD)`,
      "color: orange;",
    );
    loading.value = false;
  }
  console.log(
    "%c=== TRACE DASHBOARD END ===",
    "background: #222; color: #bada55; font-size: 14px;",
  );
});

const statistikData = computed(() => dashboardData.value?.statistik || {});

const statusPegawaiSeries = computed(() => {
  const s = statistikData.value;
  return [Number(s.kontrak || 0), Number(s.tetap || 0), Number(s.magang || 0)];
});

const genderPegawaiSeries = computed(() => {
  const s = statistikData.value;
  return [Number(s.pria || 0), Number(s.wanita || 0)];
});

const statusPegawaiOptions = {
  chart: { type: "donut", height: 200 },
  labels: ["PKWT", "PKWTT", "Magang"],
  colors: [
    "rgba(84, 128, 199, 1)",
    "rgba(43, 80, 142, 1)",
    "rgba(254, 126, 0, 1)",
  ],
  legend: { position: "bottom" },
  dataLabels: { enabled: true },
};

const genderPegawaiOptions = {
  chart: { type: "donut", height: 200 },
  labels: ["Laki-laki", "Perempuan"],
  colors: ["rgba(43, 80, 142, 1)", "rgba(254, 126, 0, 1)"],
  legend: { position: "bottom" },
  dataLabels: { enabled: true },
};

const totalStatistik = computed(() => {
  const s = statistikData.value;
  return [
    {
      title: "Total Pegawai",
      value: s.totalPegawai || 0,
      backgroundColor: "linear-gradient(180deg, #549CE3 0%, #4A7BB2 100%)",
    },
    {
      title: "Total Pegawai Kontrak",
      value: s.kontrak || 0,
      backgroundColor: "linear-gradient(180deg, #EACE5C 0%, #D4A94D 100%)",
    },
    {
      title: "Total Pegawai Tetap",
      value: s.tetap || 0,
      backgroundColor: "linear-gradient(180deg, #20BF91 0%, #1DA17D 100%)",
    },
    {
      title: "Peserta Magang",
      value: s.magang || 0,
      backgroundColor: "linear-gradient(180deg, #F48968 0%, #CD795D 100%)",
    },
  ];
});
</script>

<template>
  <div>
    <!-- LOADING STATE -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <div class="mt-2 text-secondary">Memuat Halaman...</div>
    </div>

    <div v-else>
      <!-- TAMPILAN JIKA ROLE: SUPERADMIN (1) ATAU ADMIN HRD (3) -->
      <div
        v-if="user?.id_role === 1 || user?.id_role === 3"
        class="card p-4 text-center shadow-sm"
      >
        <div class="card-body">
          <img
            src="@/assets/images/greeting-img.svg"
            alt="Welcome"
            class="img-fluid mb-3"
            style="max-width: 200px"
          />
          <h2 class="text-dark">
            Selamat Datang {{ user?.nama }} - {{ getRoleName(user?.id_role) }}
          </h2>
          <p class="text-muted">
            Anda masuk ke dalam sistem kendali manajemen kepegawaian.
          </p>
        </div>
      </div>

      <!-- TAMPILAN JIKA ROLE: MANAGER HRD (2) -->
      <div v-else-if="user?.id_role === 2" class="row g-3">
        <div class="col-md-3">
          <div class="card bg-dark h-100 position-relative">
            <div class="card-body">
              <div class="text-center">
                <img
                  src="@/assets/images/greeting-img.svg"
                  alt=""
                  class="img-fluid mb-4"
                />
              </div>
              <h3 class="card-title text-white">
                Selamat Datang, {{ user?.nama }}
              </h3>
              <p class="text-white fw-lighter fst-italic">
                "Fokuskan tujuan yang ingin didapat, jangan biarkan faktor lain
                menghalangi tujuan Anda"
              </p>
            </div>
          </div>
        </div>

        <div class="col-md-9">
          <div class="row g-3">
            <!-- WIDGET STATISTIK -->
            <div class="col-12">
              <div class="card">
                <div class="card-body">
                  <div class="row g-3">
                    <div
                      class="col-md-6 col-lg-3"
                      v-for="(item, index) in totalStatistik"
                      :key="index"
                    >
                      <div class="row align-items-center">
                        <div class="col-auto">
                          <div
                            class="d-flex rounded-circle"
                            :style="{
                              width: '56px',
                              height: '56px',
                              background: item.backgroundColor,
                            }"
                          >
                            <IconUsers
                              v-if="index === 0"
                              :stroke="2"
                              class="m-auto text-white"
                            />
                            <IconHourglassEmpty
                              v-else-if="index === 1"
                              :stroke="2"
                              class="m-auto text-white"
                            />
                            <IconFileDescription
                              v-else-if="index === 2"
                              :stroke="2"
                              class="m-auto text-white"
                            />
                            <IconBackpack
                              v-else
                              :stroke="2"
                              class="m-auto text-white"
                            />
                          </div>
                        </div>
                        <div class="col">
                          <h3 class="fs-2 mb-1">{{ item.value }}</h3>
                          <p class="text-secondary fw-light mb-0">
                            {{ item.title }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CHART STATUS KONTRAK -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h3 class="card-title">
                    Total Pegawai Berdasarkan Status Kontrak
                  </h3>
                  <ClientOnly>
                    <apexchart
                      type="donut"
                      height="200"
                      :options="statusPegawaiOptions"
                      :series="statusPegawaiSeries"
                    />
                  </ClientOnly>
                </div>
              </div>
            </div>

            <!-- CHART GENDER -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-body">
                  <h3 class="card-title">Total Pegawai Berdasarkan Gender</h3>
                  <ClientOnly>
                    <apexchart
                      type="donut"
                      height="200"
                      :options="genderPegawaiOptions"
                      :series="genderPegawaiSeries"
                    />
                  </ClientOnly>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TABEL 5 PEGAWAI TERBARU -->
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Data Pegawai Terbaru</h3>
            </div>
            <div class="table-responsive card-body p-0">
              <table class="table table-vcenter table-striped card-table">
                <thead>
                  <tr>
                    <th class="w-1">No</th>
                    <th>NIP</th>
                    <th>Nama Lengkap</th>
                    <th>Tanggal Masuk</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in dashboardData?.pegawaiTerbaru || []"
                    :key="item.id"
                  >
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>{{ item.nip }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-1">
                        <img
                          :src="
                            item.foto
                              ? `/images/pegawai/${item.foto}`
                              : '/favicon.png'
                          "
                          alt=""
                          style="width: 32px; height: 32px"
                          class="rounded-pill"
                        />
                        <p class="mb-0">{{ item.nama }}</p>
                      </div>
                    </td>
                    <td>
                      {{
                        item.tanggal_masuk
                          ? new Date(item.tanggal_masuk).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"
                      }}
                    </td>
                    <td>{{ item.status }}</td>
                    <td>
                      <NuxtLink
                        :to="`/pegawai/${item.id}`"
                        class="btn btn-primary btn-sm"
                        >Detail</NuxtLink
                      >
                    </td>
                  </tr>
                  <tr v-if="!dashboardData?.pegawaiTerbaru?.length">
                    <td colspan="6" class="text-center text-muted py-3">
                      Tidak ada data pegawai terbaru.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
