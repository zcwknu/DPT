// Digital Palpation Technologies — newsletter form
// ---------------------------------------------------------------------------
// Paste the deployed Google Apps Script Web App URL between the quotes below.
// (See README.md → "Newsletter signup" for the one-time setup.)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpKGNje7Wpdbt5OWeGBkrjU7v2OxrpMFxM018dVUVjM3_MdRa6f_rTOyt1W9gex4FH/exec";
// ---------------------------------------------------------------------------

(function () {
  "use strict";

  // Year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var form = document.getElementById("newsletter-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var btn = form.querySelector(".btn");
  var btnLabel = form.querySelector(".btn__label");
  var defaultLabel = btnLabel ? btnLabel.textContent : "Sign me up";

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg || "";
    status.classList.remove("is-success", "is-error");
    if (kind === "success") status.classList.add("is-success");
    if (kind === "error") status.classList.add("is-error");
  }

  function setLoading(loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle("is-loading", loading);
    if (btnLabel) btnLabel.textContent = loading ? "Sending…" : defaultLabel;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var data = new FormData(form);
    var firstName = (data.get("firstName") || "").toString().trim();
    var lastName = (data.get("lastName") || "").toString().trim();
    var email = (data.get("email") || "").toString().trim();

    if (!firstName || !lastName || !email) {
      setStatus("Please fill in all three fields.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("That email doesn't look right — mind double-checking?", "error");
      return;
    }

    if (!APPS_SCRIPT_URL) {
      setStatus(
        "Newsletter endpoint not configured yet. (Owner: see README.md.)",
        "error"
      );
      return;
    }

    setLoading(true);
    setStatus("");

    // Build a simple URL-encoded body so the Apps Script doesn't trigger a CORS preflight.
    var body = new URLSearchParams({
      firstName: firstName,
      lastName: lastName,
      email: email,
      source: "dpt-landing",
      ts: new Date().toISOString(),
    }).toString();

    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script web apps don't return CORS headers; we treat it as fire-and-forget
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    })
      .then(function () {
        form.reset();
        setStatus(
          "You're in — thanks! We'll be in touch (sparingly, we promise).",
          "success"
        );
      })
      .catch(function () {
        setStatus(
          "Hmm, something went wrong. Please try again or email us directly.",
          "error"
        );
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
