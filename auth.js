/* =========================================================
   SSNT — SUPABASE AUTH & REGISTRATION
   Handles:
   1. Saving the registration form to the "registrations" table
   2. Email one-time-code login (Supabase Auth OTP)
   3. Checking whether the logged-in email has a confirmed
      payment, and unlocking the matching solution
========================================================= */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       REGISTRATION -> SAVE TO DB
    ========================== */
    const registerForm = document.getElementById("registerForm");
    const registerStatus = document.getElementById("registerStatus");

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!registerForm.checkValidity()) {
                registerForm.reportValidity();
                registerStatus.classList.add("error");
                registerStatus.textContent = "Please fill in every field before registering.";
                return;
            }

            const submitBtn = registerForm.querySelector(".register-submit");
            submitBtn.disabled = true;

            const payload = {
                name: document.getElementById("regName").value.trim(),
                email: document.getElementById("regEmail").value.trim().toLowerCase(),
                phone: document.getElementById("regPhone").value.trim(),
                location: document.getElementById("regLocation").value.trim(),
                occupation: document.getElementById("regOccupation").value.trim(),
                solution: document.getElementById("regSolution").value,
                role: document.getElementById("regRole").value
            };

            registerStatus.classList.remove("error");
            registerStatus.textContent = "Saving your registration…";

            // upsert on email so re-registering (e.g. choosing a different
            // solution) updates the same row instead of creating duplicates
            const { error } = await supabaseClient
                .from("registrations")
                .upsert(payload, { onConflict: "email" });

            submitBtn.disabled = false;

            if (error) {
                registerStatus.classList.add("error");
                registerStatus.textContent =
                    "Something went wrong saving your registration. Please try again.";
                console.error(error);
                return;
            }

            registerStatus.textContent =
                "Registered! Complete payment for your solution, then log in below to access it.";

            const loginEmailInput = document.getElementById("loginEmail");
            if (loginEmailInput) loginEmailInput.value = payload.email;
        });
    }

    /* =========================
       LOGIN — EMAIL ONE-TIME CODE
    ========================== */
    const loginEmailStep = document.getElementById("loginEmailStep");
    const loginOtpStep = document.getElementById("loginOtpStep");
    const loginEmailInput = document.getElementById("loginEmail");
    const loginOtpInput = document.getElementById("loginOtp");
    const sendCodeBtn = document.getElementById("sendCodeBtn");
    const verifyCodeBtn = document.getElementById("verifyCodeBtn");
    const loginStatus = document.getElementById("loginStatus");
    const accessResult = document.getElementById("accessResult");

    let pendingEmail = "";

    if (sendCodeBtn) {
        sendCodeBtn.addEventListener("click", async () => {
            const email = loginEmailInput.value.trim().toLowerCase();

            if (!email) {
                loginStatus.classList.add("error");
                loginStatus.textContent = "Enter your email first.";
                return;
            }

            sendCodeBtn.disabled = true;
            loginStatus.classList.remove("error");
            loginStatus.textContent = "Sending your one-time code…";

            const { error } = await supabaseClient.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: true }
            });

            sendCodeBtn.disabled = false;

            if (error) {
                loginStatus.classList.add("error");
                loginStatus.textContent = "Couldn't send the code. Please try again.";
                console.error(error);
                return;
            }

            pendingEmail = email;
            loginStatus.textContent = "Code sent — check your email.";
            loginEmailStep.classList.add("hidden");
            loginOtpStep.classList.remove("hidden");
        });
    }

    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener("click", async () => {
            const token = loginOtpInput.value.trim();

            if (!token) {
                loginStatus.classList.add("error");
                loginStatus.textContent = "Enter the code from your email.";
                return;
            }

            verifyCodeBtn.disabled = true;
            loginStatus.classList.remove("error");
            loginStatus.textContent = "Verifying…";

            const { error } = await supabaseClient.auth.verifyOtp({
                email: pendingEmail,
                token,
                type: "email"
            });

            verifyCodeBtn.disabled = false;

            if (error) {
                loginStatus.classList.add("error");
                loginStatus.textContent = "That code didn't work. Please try again.";
                console.error(error);
                return;
            }

            loginStatus.textContent = "Logged in — checking your access…";
            await checkAccessAndShowResult(pendingEmail);
        });
    }

    /* =========================
       CHECK PAYMENT + UNLOCK
    ========================== */
    async function checkAccessAndShowResult(email) {
        const { data, error } = await supabaseClient
            .from("registrations")
            .select("solution, paid")
            .eq("email", email)
            .maybeSingle();

        accessResult.classList.remove("hidden");

        if (error || !data) {
            accessResult.textContent =
                "We couldn't find a registration for this email. Please register above first.";
            return;
        }

        if (!data.paid) {
            accessResult.textContent =
                "We don't see a confirmed payment yet for your solution. If you paid by " +
                "bank transfer, message us your proof of payment on WhatsApp and we'll unlock it.";
            return;
        }

        accessResult.textContent = `You're in! Your access to "${data.solution}" is unlocked.`;
        // TODO: once each solution has its own page/content, redirect or
        // reveal it here, e.g. window.location.href = `/solutions/${data.solution}.html`;
    }

    /* =========================
       RESTORE SESSION ON RELOAD
    ========================== */
    supabaseClient.auth.getSession().then(({ data }) => {
        const email = data?.session?.user?.email;
        if (email) {
            loginEmailStep.classList.add("hidden");
            checkAccessAndShowResult(email);
        }
    });
});
