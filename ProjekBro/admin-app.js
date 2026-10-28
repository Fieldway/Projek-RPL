
const API_URL = "http://localhost:3000/api";

// Elemen HTML
const tombolTambah = document.getElementById("btn-tambah-produk");
const tabelBody = document.getElementById("tabel-produk-body");
const inputCari = document.getElementById("cari-produk");
const selectKategori = document.getElementById("kategori-produk");

// Penyimpanan data dari API
let semuaProduk = [];

// Navigasi ke form tambah produk
if (tombolTambah) {
    tombolTambah.addEventListener("click", () => {
        window.location.href = "produk-form.html";
    });
}

// Menghitung dan memperbarui angka ringkasan di dashboard
function updateRingkasanDashboard(dataProduk) {
    const totalProdukElem = document.getElementById("total-produk");
    const totalStokElem = document.getElementById("total-stok");
    const containerProdukMenipis = document.getElementById("produk-menipis");

    // 1. Hitung Total Jenis Produk
    if (totalProdukElem) {
        totalProdukElem.textContent = dataProduk.length;
    }

    // 2. Hitung Total Stok (Jumlahkan seluruh stok produk)
    if (totalStokElem) {
        const totalStok = dataProduk.reduce((acc, item) => acc + (Number(item.stok) || 0), 0);
        totalStokElem.textContent = totalStok.toLocaleString("id-ID");
    }

    // 3. (Opsional) Tampilkan Produk Hampir Habis (stok < 5)
    if (containerProdukMenipis) {
        const produkMenipis = dataProduk.filter(item => (Number(item.stok) || 0) < 5);
        produkMenipis.sort((a, b) => (Number(a.stok) || 0) - (Number(b.stok) || 0));
        const duaTerendah = produkMenipis.slice(0, 2);
        
        if (duaTerendah.length === 0) {
            containerProdukMenipis.innerHTML = `<div class="py-3 text-slate-500">Semua stok produk mencukupi.</div>`;
        } else {
            containerProdukMenipis.innerHTML = duaTerendah.map(item => `
                <div class="flex justify-between items-center py-3 hover:bg-slate-50 px-2 rounded-lg">
                    <span class="font-medium text-slate-900">${item.nama_produk || "-"}</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Sisa ${item.stok}
                    </span>
                </div>
            `).join("");
        }
    }
}

// Mengambil semua produk
async function loadProduk() {
    try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error(`Gagal mengambil produk: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Format data produk bukan array.");
        }

        semuaProduk = data;

        console.log("Data produk:", semuaProduk);
        tampilkanProduk(semuaProduk);
        
        // --- TAMBAHKAN BARIS INI ---
        updateRingkasanDashboard(semuaProduk);

    } catch (error) {
        console.error("Gagal memuat produk:", error);

        if (tabelBody) {
            tabelBody.innerHTML = `
                <tr>
                    <td colspan="8"
                        class="px-5 py-10 text-center text-red-500">
                        Gagal memuat produk. Periksa server dan API.
                    </td>
                </tr>`;
        }
    }
}

// Mengambil kategori untuk dropdown filter
async function loadKategoriFilter() {
    if (!selectKategori) return;

    try {
        const response = await fetch(`${API_URL}/kategori`);

        if (!response.ok) {
            throw new Error(`Gagal mengambil kategori: HTTP ${response.status}`);
        }

        const kategori = await response.json();

        selectKategori.innerHTML =
            '<option value="">Semua Kategori</option>';

        kategori.forEach((item) => {
            const option = document.createElement("option");

            option.value = item.id_kategori;
            option.textContent = item.nama_kategori;

            selectKategori.appendChild(option);
        });

        console.log("Kategori filter berhasil dimuat:", kategori);
    } catch (error) {
        console.error("Gagal memuat kategori filter:", error);
    }
}

// Search dan filter kategori
function filterProduk() {
    const kataKunci = inputCari
        ? inputCari.value.trim().toLowerCase()
        : "";

    const idKategori = selectKategori
        ? selectKategori.value
        : "";

    const hasilFilter = semuaProduk.filter((produk) => {
        const namaProduk = String(produk.nama_produk || "").toLowerCase();

        const cocokNama = namaProduk.includes(kataKunci);

        // Cocokkan ID kategori; gunakan nama kategori sebagai alternatif
        const cocokKategori =
            idKategori === "" ||
            String(produk.id_kategori) === idKategori ||
            (
                produk.id_kategori == null &&
                String(produk.nama_kategori || "") ===
                selectKategori.options[selectKategori.selectedIndex].text
            );

        return cocokNama && cocokKategori;
    });

    tampilkanProduk(hasilFilter);
}

// Menampilkan produk ke tabel
function tampilkanProduk(dataProduk) {
    if (!tabelBody) {
        console.error('Elemen dengan ID "tabel-produk-body" tidak ditemukan.');
        return;
    }

    if (dataProduk.length === 0) {
        tabelBody.innerHTML = `
            <tr>
                <td colspan="8"
                    class="px-5 py-10 text-center text-gray-500">
                    Produk tidak ditemukan.
                </td>
            </tr>`;
        return;
    }

    tabelBody.innerHTML = dataProduk.map((item, index) => {
        const stok = Number(item.stok) || 0;
        const status = stok > 0 ? "Aktif" : "Habis";
        const warnaStatus = stok > 0
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700";

        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-5 py-4">${index + 1}</td>

                <td class="px-5 py-4">
                    <img
                        src="${item.gambar || ""}"
                        alt="${item.nama_produk || "Produk"}"
                        class="w-12 h-12 object-cover rounded"
                        onerror="this.style.display='none'">
                </td>

                <td class="px-5 py-4 font-medium">
                    ${item.nama_produk || "-"}
                </td>

                <td class="px-5 py-4">
                    ${item.nama_kategori || "-"}
                </td>

                <td class="px-5 py-4">
                    Rp${Number(item.harga || 0).toLocaleString("id-ID")}
                </td>

                <td class="px-5 py-4">${stok}</td>

                <td class="px-5 py-4">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${warnaStatus}">
                        ${status}
                    </span>
                </td>

                <td class="px-5 py-4 whitespace-nowrap">
                    <button
                        type="button"
                        class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                        data-aksi="edit"
                        data-id="${item.id_produk ?? ""}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                        data-aksi="hapus"
                        data-id="${item.id_produk ?? ""}">
                        Hapus
                    </button>
                </td>
            </tr>`;
    }).join("");
}

// Jalankan filter setiap kali pengguna berinteraksi
if (inputCari) {
    inputCari.addEventListener("input", filterProduk);
}

if (selectKategori) {
    selectKategori.addEventListener("change", filterProduk);
}

// Menangani klik tombol Aksi (Edit & Hapus) pada tabel produk
if (tabelBody) {
    tabelBody.addEventListener("click", async (e) => {
        const tombol = e.target.closest("button");
        if (!tombol) return;

        const aksi = tombol.getAttribute("data-aksi");
        const id = tombol.getAttribute("data-id");

        if (!aksi || !id) return;

        // Logika Tombol Hapus
        if (aksi === "hapus") {
            const konfirmasi = confirm("Apakah Anda yakin ingin menghapus produk ini?");
            if (!konfirmasi) return;

            try {
                const response = await fetch(`${API_URL}/products/${id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Gagal menghapus produk dari server.");
                }

                alert("Produk berhasil dihapus!");
                loadProduk(); // Muat ulang data tabel setelah dihapus
            } catch (error) {
                console.error("Error:", error);
                alert("Terjadi kesalahan saat menghapus produk.");
            }
        }

        // Logika Tombol Edit
        if (aksi === "edit") {
            // Arahkan ke halaman form dengan membawa parameter ID produk di URL
            window.location.href = `produk-form.html?id=${id}`;
        }
    });
}

// Muat data saat halaman dibuka
loadProduk();
loadKategoriFilter();
