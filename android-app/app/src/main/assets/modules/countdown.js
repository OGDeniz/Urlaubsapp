const pad = (n) => String(n).padStart(2, "0");

let timer = null;

export function startCountdown(tripDate) {
  if (!(tripDate instanceof Date)) return;
  if (timer) clearInterval(timer);

  const cdDays        = document.getElementById("cd-days");
  const cdHours       = document.getElementById("cd-hours");
  const cdMins        = document.getElementById("cd-mins");
  const cdSecs        = document.getElementById("cd-secs");
  const countdownNote = document.getElementById("countdown-note");

  function tick() {
    const now  = new Date();
    const diff = tripDate - now;

    if (isNaN(diff)) return;

    if (diff <= 0) {
      cdDays.textContent  = "00";
      cdHours.textContent = "00";
      cdMins.textContent  = "00";
      cdSecs.textContent  = "00";
      countdownNote.textContent = "Gute Reise! ✈️";
      clearInterval(timer);
      return;
    }

    const sec  = Math.floor(diff / 1000);
    const days  = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins  = Math.floor((sec % 3600) / 60);
    const secs  = sec % 60;

    cdDays.textContent  = pad(days);
    cdHours.textContent = pad(hours);
    cdMins.textContent  = pad(mins);
    cdSecs.textContent  = pad(secs);

    const dStr = tripDate.toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" });
    const tStr = tripDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    countdownNote.textContent = `Abreise am ${dStr} um ${tStr} Uhr`;
  }

  tick();
  timer = setInterval(tick, 1000);
}
