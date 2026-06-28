<template>
  <div class="row">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Tarif per km (Rp)</label>
              <input
                v-model="form.base_fare"
                type="number"
                min="0"
                class="form-control text-end"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Berlaku Mulai</label>
              <input
                v-model="form.berlaku_mulai"
                type="date"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Minimum Kilometer</label>
              <input
                v-model="form.min_km"
                type="number"
                min="0"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Maksimum Kilometer</label>
              <input
                v-model="form.max_km"
                type="number"
                min="0"
                class="form-control"
              />
            </div>
          </div>
        </div>
        <div class="card-footer">
          <div class="d-flex gap-2">
            <button
              class="btn btn-primary"
              @click="simpanSetting"
              :disabled="submitting"
            >
              {{ submitting ? "Menyimpan..." : "Simpan" }}
            </button>
            <button class="btn btn-outline-primary" @click="goBack()">
              Kembali
            </button>
          </div>
        </div>
        <div v-if="error" class="alert alert-danger mx-3 mb-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ title: "Setting Tunjangan Transport", middleware: "auth" });
useSeoMeta({ title: "Setting Tunjangan Transport" });
useSession();

const { get, put } = useApi();
const { goBack } = useGoBack();

const submitting = ref(false);
const error = ref("");

const form = reactive({
  base_fare: "",
  berlaku_mulai: "",
  min_km: 5,
  max_km: 25,
});

async function simpanSetting() {
  if (!form.base_fare || !form.berlaku_mulai)
    return alert("Tarif dan berlaku mulai wajib diisi");
  submitting.value = true;
  error.value = "";
  try {
    await put("/tunjangan/setting", form);
    alert("Setting berhasil disimpan");
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  try {
    const res = (await get) < any > "/tunjangan/setting";
    if (res.data) {
      Object.assign(form, {
        base_fare: res.data.base_fare,
        berlaku_mulai: res.data.berlaku_mulai
          ? res.data.berlaku_mulai.split("T")[0]
          : "",
        min_km: res.data.min_km || 5,
        max_km: res.data.max_km || 25,
      });
    }
  } catch {}
});
</script>
