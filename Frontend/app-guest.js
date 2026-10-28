
let dataproduk = [];
const searchinput = document.getElementById('input-cari');

async function renderproduk() {
    try {
        const response = await fetch('http://localhost:3000/api/products');

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const dataProduk = await response.json();

        console.log("Data dari API:", dataProduk);

        // Simpan data produk untuk fitur pencarian
        dataproduk = dataProduk;

        tampilkanProduk(dataproduk);

    } catch (error) {
        console.error("Gagal mengambil data produk:", error);
    }
}

// Fungsi menampilkan produk
function tampilkanProduk(dataProduk) {
    const daftarProduk = document.getElementById('daftar-produk');

    if (!daftarProduk) {
        console.error("Elemen daftar-produk tidak ditemukan.");
        return;
    }

    daftarProduk.innerHTML = "";

    dataProduk.forEach(item => {
        const warnaStok = Number(item.stok) < 5
            ? "text-red-500"
            : "text-green-500";

        // Ambil langsung kelas warna dari database
        const warnaBadge = item.badge_color || "bg-blue-500";

        // Badge hanya ditampilkan jika produk memiliki teks badge
        const teksBadge = item.badge
            ? `
                <span class="absolute top-2 right-2 z-10
                    ${warnaBadge} text-white text-xs font-bold
                    px-3 py-1 rounded-full shadow-md">
                    ${item.badge}
                </span>
            `
            : "";

        daftarProduk.innerHTML += `
            <div class="bg-white rounded-xl shadow overflow-hidden">

                <!-- Gambar dan badge -->
                <div class="relative w-full h-48">
                    <img
                        src="${item.gambar || ''}"
                        alt="${item.nama_produk || ''}"
                        class="w-full h-full object-cover"
                    >

                    ${teksBadge}
                </div>

                <!-- Informasi produk -->
                <div class="p-5">

                    <span class="inline-block bg-yellow-400
                        text-gray-800 px-3 py-1 rounded-full
                        text-sm font-semibold">
                        ${item.nama_kategori || ''}
                    </span>

                    <h3 class="text-xl font-bold mt-2">
                        ${item.nama_produk || ''}
                    </h3>

                    <p class="text-gray-600 mt-2">
                        ${item.deskripsi_produk || ''}
                    </p>

                    <p class="text-blue-600 font-bold text-lg mt-2">
                        Rp${Number(item.harga || 0).toLocaleString('id-ID')}
                    </p>

                    <p class="${warnaStok} font-semibold mt-2">
                        Stok: ${item.stok ?? 0}
                    </p>

                    <p class="mt-2">
                        ⭐ ${item.rating ?? 0}
                        (${item.jumlah_ulasan ?? 0} ulasan)
                    </p>

                    <button
                        class="w-full mt-4 bg-blue-800
                        text-white py-2 rounded-full hover:bg-blue-700">
                        Detail Produk
                    </button>

                    <button
                        class="w-full mt-2 bg-orange-800
                        text-white py-2 rounded-full hover:bg-orange-700">
                        Tambah ke Keranjang
                    </button>

                </div>
            </div>
        `;
    });
}

// Fitur pencarian produk
if (searchinput) {
    searchinput.addEventListener('input', function(e) {
        const kataKunci = e.target.value.toLowerCase().trim();

        const produkfilter = dataproduk.filter(item =>
            (item.nama_produk || '')
                .toLowerCase()
                .includes(kataKunci)
        );

        tampilkanProduk(produkfilter);
    });
}

// Jalankan saat halaman dibuka
renderproduk();
