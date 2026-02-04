const grades = ["10", "11", "12"];
const sections = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
let rooms = [];
let currentRoomName = null;

// 1. Inisialisasi Data
function init() {
  rooms = [];
  grades.forEach((grade) => {
    sections.forEach((sec) => {
      rooms.push({ name: grade + sec, bookings: [] });
    });
  });
  updateApp();
  setInterval(updateApp, 10000); // Cek setiap 10 detik
}

// 2. Fungsi Pembaruan Otomatis
function updateApp() {
  const now = new Date();
  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  document.getElementById("current-time-display").innerText = currentTime;

  rooms.forEach((room) => {
    // FITUR: Hapus jadwal yang sudah lewat (Selesai < Jam Sekarang)
    room.bookings = room.bookings.filter((b) => b.end > currentTime);
  });

  displayRooms(currentTime);
}

// 3. Menampilkan Grid
function displayRooms(currentTime) {
  const roomGrid = document.getElementById("room-grid");
  roomGrid.innerHTML = "";

  rooms.forEach((room) => {
    // Cek apakah ada booking aktif di kelas spesifik ini
    const active = room.bookings.find(
      (b) => currentTime >= b.start && currentTime <= b.end,
    );

    const card = document.createElement("div");
    card.className = "room-card";
    card.onclick = () => openDetail(room.name);
    card.innerHTML = `
            <strong>${room.name}</strong>
            <span class="status-badge ${active ? "occupied" : "available"}">
                ${active ? "DIPAKAI" : "KOSONG"}
            </span>
        `;
    roomGrid.appendChild(card);
  });
}

// 4. Booking System (Anti-Tabrakan & Terklasifikasi)
function submitBooking() {
  const user = document.getElementById("booking-user").value;
  const activity = document.getElementById("booking-activity").value;
  const start = document.getElementById("start-time").value;
  const end = document.getElementById("end-time").value;

  if (!user || !activity || !start || !end) return alert("Isi semua data!");
  if (start >= end) return alert("Waktu tidak valid!");

  // Cari kelas yang sedang dibuka saja
  const room = rooms.find((r) => r.name === currentRoomName);

  // LOGIKA KLASIFIKASI: Hanya cek tabrakan di array 'bookings' milik kelas ini saja
  const isConflict = room.bookings.some((b) => start < b.end && end > b.start);

  if (isConflict) {
    alert("Gagal! Ruangan ini sudah dibooking pada jam tersebut.");
  } else {
    room.bookings.push({ user, activity, start, end });
    alert(`Booking Kelas ${currentRoomName} Berhasil!`);
    closeDetail();
    updateApp();
  }
}

function openDetail(name) {
  currentRoomName = name;
  const room = rooms.find((r) => r.name === name);
  document.getElementById("list-section").classList.add("hidden");
  document.getElementById("detail-section").classList.remove("hidden");
  document.getElementById("detail-room-name").innerText = "Ruang " + name;

  const list = document.getElementById("usage-list");
  list.innerHTML = room.bookings.length
    ? ""
    : "<li>Tidak ada jadwal aktif.</li>";
  room.bookings
    .sort((a, b) => a.start.localeCompare(b.start))
    .forEach((b) => {
      list.innerHTML += `<li>[${b.start}-${b.end}] ${b.activity} oleh ${b.user}</li>`;
    });
}

function closeDetail() {
  document.getElementById("list-section").classList.remove("hidden");
  document.getElementById("detail-section").classList.add("hidden");
}

function filterRooms() {
  const term = document.getElementById("searchRoom").value.toUpperCase();
  const filtered = rooms.filter((r) => r.name.includes(term));
  // Re-render grid sederhana untuk filter
  const grid = document.getElementById("room-grid");
  grid.innerHTML = "";
  const now = document.getElementById("current-time-display").innerText;
  filtered.forEach((room) => {
    const active = room.bookings.find((b) => now >= b.start && now <= b.end);
    grid.innerHTML += `<div class="room-card" onclick="openDetail('${room.name}')">
            <strong>${room.name}</strong>
            <span class="status-badge ${active ? "occupied" : "available"}">${active ? "DIPAKAI" : "KOSONG"}</span>
        </div>`;
  });
}

window.onload = init;
