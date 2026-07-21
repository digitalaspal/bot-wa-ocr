const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Tesseract = require('tesseract.js');

// Inisialisasi Bot WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Menampilkan QR Code di log/terminal
client.on('qr', (qr) => {
    console.log('SCAN QR CODE INI DI WHATSAPP ANDA:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot WhatsApp siap digunakan!');
});

// Memproses pesan masuk
client.on('message', async (msg) => {
    // Cek apakah pesan berupa gambar/foto
    if (msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();
            
            // Konversi gambar ke buffer
            const imageBuffer = Buffer.from(media.data, 'base64');

            // Proses OCR untuk membaca teks dari foto
            const { data: { text } } = await Tesseract.recognize(imageBuffer, 'ind');

          // Regex baru: Mengizinkan angka dengan spasi, strip (-), atau titik di antaranya
const regexNomor = /(\+?62|0)[\s\.-]?8[0-9]{1,4}([\s\.-]?[0-9]{3,4}){2,3}/g;

const matches = text.match(regexNomor);

if (matches && matches.length > 0) {
    // Menghapus semua karakter selain angka (spasi, strip, tanda +)
    let nomorBersih = matches[0].replace(/[^0-9]/g, '');

    // Jika berawalan '62', ubah menjadi '0' agar formatnya rapi
    if (nomorBersih.startsWith('62')) {
        nomorBersih = '0' + nomorBersih.slice(2);
    }
                
                // Balas pesan dengan nomor yang terekstrak
                msg.reply(nomorBersih);
            }
        } catch (error) {
            console.error('Gagal memproses gambar:', error);
        }
    }
});

client.initialize();
