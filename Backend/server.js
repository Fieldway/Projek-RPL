const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint to get all products
app.get('/api/products', async (req, res) => {
    //mengembalikan data array products dalam format JSON
    try {
        const result = await pool.query('select p.*, k.* from produk p, kategori k where p.id_kategori = k.id_kategori order by p.id_produk desc');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Gagal mengambil data produk'
        })
    };
    }) 

app.post('/api/products', async (req, res) => {
    try {
        const {
            nama_produk,
            id_kategori,
            harga,
            stok,
            status = "Aktif",
            rating = 0,
            jumlah_ulasan = 0,
            badge = null,
            badge_color = null,
            gambar = null,
            deskripsi_produk = ''
        } = req.body;

        const result = await pool.query(
            `INSERT INTO produk
            (nama_produk, id_kategori, harga, stok, status,
             rating, jumlah_ulasan, badge, badge_color, gambar,
             deskripsi_produk)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                nama_produk,
                id_kategori,
                harga,
                stok,
                status,
                rating,
                jumlah_ulasan,
                badge,
                badge_color,
                gambar,
                deskripsi_produk
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Gagal menambahkan produk:", error);
        res.status(500).json({ error: "Gagal menambahkan produk" });
    }
});

// Endpoint to get all categories
app.get('/api/kategori', async (req, res) => {
    try {
        const result = await pool.query(`select * from kategori order by id_kategori ASC`);
        res.json(result.rows);
    } catch (error) {
        console.error("error pada:", error);
        res.status(500).json({
            error: 'Gagal mengambil data kategori'
        })
    }
})

// Endpoint untuk mengupdate data produk (Edit)
app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nama_produk,
            id_kategori,
            harga,
            stok,
            status = "Aktif",
            rating = 0,
            jumlah_ulasan = 0,
            badge = null,
            badge_color = null,
            gambar = null,
            deskripsi_produk = ''
        } = req.body;

        const result = await pool.query(
            `UPDATE produk SET
                nama_produk = $1,
                id_kategori = $2,
                harga = $3,
                stok = $4,
                status = $5,
                rating = $6,
                jumlah_ulasan = $7,
                badge = $8,
                badge_color = $9,
                gambar = $10,
                deskripsi_produk = $11
            WHERE id_produk = $12
            RETURNING *`,
            [
                nama_produk,
                id_kategori,
                harga,
                stok,
                status,
                rating,
                jumlah_ulasan,
                badge,
                badge_color,
                gambar,
                deskripsi_produk,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produk tidak ditemukan" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Gagal memperbarui produk:", error);
        res.status(500).json({ error: "Gagal memperbarui produk" });
    }
});

// Endpoint untuk menghapus produk (Hapus)
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM produk WHERE id_produk = $1 RETURNING *;', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produk tidak ditemukan' });
        }

        res.json({ message: 'Produk berhasil dihapus', produk: result.rows[0] });
    } catch (error) {
        console.error("Error SQL (Delete):", error.message);
        res.status(500).json({ error: error.message });
    }
});

//jalankan server pada port 3000
app.listen(3000, () => {
    console.log(`Server Tokoku Aktif!`);
    console.log(`Cek api di: http://localhost:3000`);
})
