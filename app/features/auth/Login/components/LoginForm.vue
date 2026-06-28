<template>
  <form @submit.prevent="handleLogin">
    <div class="mb-2">
      <input
        v-model="form.username"
        type="text"
        class="form-control py-3 border-0 bg-light text-dark"
        placeholder="Username / Email / No. HP"
        required
      />
    </div>

    <div class="mb-2">
      <input
        v-model="form.password"
        type="password"
        class="form-control py-3 border-0 bg-light text-dark"
        placeholder="Password"
        required
      />
    </div>

    <div class="mb-2">
      <label class="form-check">
        <input
          v-model="form.remember"
          type="checkbox"
          class="form-check-input"
        />
        <span class="form-check-label">Remember Me</span>
      </label>
    </div>

    <div class="mb-2">
      <div
        class="g-recaptcha"
        :data-sitekey="siteKey"
        data-callback="recaptchaCallback"
      ></div>
    </div>

    <div class="d-grid mt-4">
      <button
        class="btn btn-primary text-uppercase shadow py-3"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? "Memproses..." : "Masuk" }}
      </button>
    </div>

    <div v-if="error" class="alert alert-danger mt-3 mb-0">{{ error }}</div>
  </form>
</template>

<script setup>
const config = useRuntimeConfig();
const { login } = useAuth();
const router = useRouter();

const siteKey = config.public.recaptchaSiteKey;
const loading = ref(false);
const error = ref("");

const form = reactive({
  username: "",
  password: "",
  remember: false,
});

useHead({
  script: [
    {
      src: "https://www.google.com/recaptcha/api.js",
      async: true,
      defer: true,
    },
  ],
});

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    const captchaToken = window.grecaptcha
      ? window.grecaptcha.getResponse()
      : "";

    if (!captchaToken) {
      throw new Error("Silakan centang reCAPTCHA terlebih dahulu.");
    }

    await login(form.username, form.password, form.remember, captchaToken);
    router.push("/");
  } catch (err) {
    error.value = err.message || "Login gagal";
  } finally {
    loading.value = false;
  }
}
</script>
