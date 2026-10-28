const API_URL = 'http://localhost:3000/api';

// Cek apakah ada parameter 'id' di URL (contoh: produk-form.html?id=3)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Mengambil kategori dari backend
async function loadKategori() {
    const selectKategori = document.getElementById('kategori-produk');
    try {
        const response = await fetch(`${API_URL}/kategori`);
        if (!response.ok) {
            throw new Error('Gagal mengambil data kategori');
        }
        const dataKategori = await response.json();
        
        // Bersihkan opsi lama (biar tidak duplikat jika dipanggil ulang)
        selectKategori.innerHTML = '<option value="">Pilih Kategori</option>';

        dataKategori.forEach((kategori) => {
            const option = document.createElement('option');
            option.value = kategori.id_kategori;
            option.textContent = kategori.nama_kategori;
            selectKategori.appendChild(option);
        });
        console.log('Kategori berhasil dimuat:', dataKategori);

        // Jika mode edit, muat data produk setelah kategori siap agar select terpilih dengan benar
        if (productId) {
            ubahKeModeEdit();
        }
    } catch (error) {
        console.error('Error mengambil kategori:', error);
        selectKategori.innerHTML = '<option value="">Gagal memuat kategori</option>';
    }
}

// Fungsi untuk mengubah tampilan & mengambil data produk saat mode Edit
async function ubahKeModeEdit() {
    // Ubah judul halaman/form
    const judulHalaman = document.querySelector('h1');
    const subJudul = document.querySelector('h1 + p');
    if (judulHalaman) judulHalaman.textContent = 'Edit Produk';
    if (subJudul) subJudul.textContent = 'Perbarui informasi produk toko.';

    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Gagal mengambil data produk');
        
        const dataProduk = await response.json();
        // Cari produk berdasarkan id_produk yang cocok dengan URL
        const produk = dataProduk.find(item => String(item.id_produk) === String(productId));

        if (produk) {
            // Masukkan data lama ke dalam input form
            document.getElementById('nama-produk').value = produk.nama_produk || '';
            document.getElementById('kategori-produk').value = produk.id_kategori || '';
            document.getElementById('harga-produk').value = produk.harga || '';
            document.getElementById('stok-produk').value = produk.stok || '';
            document.getElementById('gambar-produk').value = produk.gambar || '';
            document.getElementById('rating-produk').value = produk.rating || '';
            document.getElementById('deskripsi-produk').value = produk.deskripsi_produk || '';
        } else {
            alert('Produk tidak ditemukan!');
        }
    } catch (error) {
        console.error('Error memuat data untuk diedit:', error);
        alert('Gagal memuat data produk.');
    }
}

// Menangani pengiriman data form (Bisa untuk Tambah POST maupun Edit PUT)
document.getElementById('form-tambah-produk').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Mengambil nilai dari input form
    const dataProduk = {
        nama_produk: document.getElementById('nama-produk').value,
        id_kategori: parseInt(document.getElementById('kategori-produk').value),
        harga: parseFloat(document.getElementById('harga-produk').value),
        stok: parseInt(document.getElementById('stok-produk').value),
        gambar: document.getElementById('gambar-produk').value,
        rating: parseFloat(document.getElementById('rating-produk').value),
        deskripsi_produk: document.getElementById('deskripsi-produk').value
    };

    try {
        let response;
        if (productId) {
            // Jika ada ID di URL, gunakan method PUT untuk mengupdate
            response = await fetch(`${API_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataProduk)
            });
        } else {
            // Jika tidak ada ID, gunakan method POST untuk tambah baru
            response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataProduk)
            });
        }

        if (response.ok) {
            alert(productId ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!');
            window.location.href = 'produk.html'; // Sesuaikan kembali ke halaman tabel produk Anda
        } else {
            const result = await response.json();
            alert('Gagal menyimpan produk: ' + (result.error || result.message || 'Terjadi kesalahan server'));
        }
    } catch (error) {
        console.error('Error mengirim data produk:', error);
        alert('Gagal terhubung ke server');
    }
});

// Jalankan saat halaman dibuka (mulai dengan memuat kategori dulu)
loadKategori();