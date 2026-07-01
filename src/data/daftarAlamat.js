// ============================================================
// Daftar Alamat & Daerah Indonesia
// Digunakan untuk fitur autocomplete pada input alamat kios
// ============================================================

export const DAFTAR_KOTA = [
  'Makassar', 'Jakarta', 'Surabaya', 'Bandung', 'Medan',
  'Semarang', 'Yogyakarta', 'Palembang', 'Tangerang', 'Depok',
  'Bekasi', 'Bogor', 'Malang', 'Denpasar', 'Balikpapan',
  'Samarinda', 'Banjarmasin', 'Pontianak', 'Manado', 'Pekanbaru',
  'Batam', 'Padang', 'Jambi', 'Bengkulu', 'Lampung',
  'Kupang', 'Ambon', 'Jayapura', 'Mataram', 'Kendari',
  'Gorontalo', 'Palu', 'Mamuju',
];

// Daftar daerah/jalan per kota
export const DAFTAR_ALAMAT = {
  Makassar: [
    'Jl. Urip Sumoharjo', 'Jl. A. P. Pettarani', 'Jl. Sultan Alauddin',
    'Jl. Perintis Kemerdekaan', 'Jl. Rappocini Raya', 'Jl. Hertasning',
    'Jl. Pengayoman', 'Jl. Boulevard', 'Jl. Sam Ratulangi',
    'Jl. Veteran Selatan', 'Jl. Veteran Utara', 'Jl. Ahmad Yani',
    'Jl. Mappanyukki', 'Jl. Cendrawasih', 'Jl. Ibu Ruswo',
    'Jl. Kakatua', 'Jl. Sungai Saddang', 'Jl. Sulawesi',
    'Jl. Maccini Raya', 'Jl. Tamalate', 'Jl. Dg. Tata',
    'Jl. Poros Malino', 'Jl. Toddopuli Raya', 'Jl. Abd. Dg. Sirua',
    'Jl. Talasalapang', 'Jl. Dg. Tata II', 'Jl. Mallengkeri',
    'Jl. Racing Centre', 'Jl. Bumi Tamalanrea', 'Jl. Kompleks Unhas',
    'Jl. Karunrung Raya', 'Jl. Sungai Limboto', 'Jl. Nusantara',
    'Jl. Gunung Bawakaraeng', 'Jl. Gunung Latimojong', 'Jl. Gunung Lompobattang',
    'Jl. Gunung Merapi', 'Jl. Penghibur', 'Jl. Pasar Ikan',
    'Jl. Somba Opu', 'Jl. Pantai Losari', 'Jl. Kijang',
    'Kel. Rappocini', 'Kel. Kassi-Kassi', 'Kel. Gunung Sari',
    'Kel. Batua', 'Kel. Tamalate', 'Kel. Mannuruki',
    'Kel. Tammua', 'Kel. Maccini', 'Kel. Pampang',
    'Kel. Panaikang', 'Kel. Manggala', 'Kel. Antang',
    'Kec. Rappocini', 'Kec. Tamalanrea', 'Kec. Biringkanaya',
    'Kec. Manggala', 'Kec. Panakkukang', 'Kec. Makassar',
    'Kec. Ujung Pandang', 'Kec. Wajo', 'Kec. Bontoala',
    'Kec. Ujung Tanah', 'Kec. Tallo', 'Kec. Mamajang',
    'Kec. Mariso', 'Kec. Tamalate', 'Perumahan Tamalate Indah',
    'Perumahan Antang Raya', 'Perumahan Bumi Tamalanrea Permai',
    'Perumahan Bumi Permata Sudiang', 'Perumahan Griya Cendana',
    'Kawasan Industri Makassar (KIMA)', 'Pelabuhan Soekarno Hatta',
    'Bandara Internasional Sultan Hasanuddin', 'Mal Ratu Indah',
    'Trans Studio Makassar', 'Pantai Losari', 'Fort Rotterdam',
  ],
  Jakarta: [
    'Jl. Sudirman', 'Jl. Thamrin', 'Jl. Gatot Subroto', 'Jl. Kuningan',
    'Jl. Rasuna Said', 'Jl. HR Rasuna Said', 'Jl. Casablanca',
    'Jl. MT Haryono', 'Jl. Hayam Wuruk', 'Jl. Gajah Mada',
    'Jl. Mangga Dua', 'Jl. Otista', 'Jl. Kalimalang',
    'Jl. Raya Bogor', 'Jl. Raya Bekasi', 'Jl. Cikini',
    'Jl. Kemang Raya', 'Jl. Fatmawati', 'Jl. Radio Dalam',
    'Jl. Panjang', 'Jl. Kebon Jeruk', 'Jl. Daan Mogot',
    'Kec. Gambir', 'Kec. Menteng', 'Kec. Tanah Abang',
    'Kec. Senen', 'Kec. Cempaka Putih', 'Kec. Kemayoran',
    'Kec. Sawah Besar', 'Kec. Johar Baru', 'Kec. Matraman',
    'Kec. Pulo Gadung', 'Kec. Jatinegara', 'Kec. Cakung',
    'Kec. Duren Sawit', 'Kec. Kramat Jati', 'Kec. Pasar Rebo',
    'Kec. Ciracas', 'Kec. Cipayung', 'Kec. Tebet',
    'Kec. Setiabudi', 'Kec. Mampang Prapatan', 'Kec. Pasar Minggu',
    'Kec. Jagakarsa', 'Kec. Pesanggrahan', 'Kec. Cilandak',
    'Kec. Kebayoran Lama', 'Kec. Kebayoran Baru', 'Kec. Grogol',
    'Kec. Palmerah', 'Kec. Kali Deres', 'Kec. Cengkareng',
    'Kec. Tambora', 'Kec. Taman Sari', 'Kec. Penjaringan',
    'Kec. Pademangan', 'Kec. Koja', 'Kec. Tanjung Priok',
    'Kec. Cilincing', 'Kec. Kelapa Gading', 'Kec. Pulo Gadung',
    'Kel. Menteng', 'Kel. Cikini', 'Kel. Gondangdia',
    'Kel. Pegangsaan', 'Kel. Cempaka Baru', 'Kel. Kemayoran',
  ],
  Surabaya: [
    'Jl. Darmo', 'Jl. Raya Darmo', 'Jl. Ahmad Yani',
    'Jl. Gubeng', 'Jl. Pemuda', 'Jl. Basuki Rahmat',
    'Jl. Embong Malang', 'Jl. Tunjungan', 'Jl. Diponegoro',
    'Jl. Mayjend Sungkono', 'Jl. Mayjen HR Muhammad',
    'Jl. Raya Menganti', 'Jl. Raya Jemursari',
    'Jl. Ketintang', 'Jl. Jenderal Sudirman',
    'Kec. Gubeng', 'Kec. Genteng', 'Kec. Tambaksari',
    'Kec. Simokerto', 'Kec. Semampir', 'Kec. Kenjeran',
    'Kec. Mulyorejo', 'Kec. Sukolilo', 'Kec. Rungkut',
    'Kec. Gunung Anyar', 'Kec. Tenggilis Mejoyo',
    'Kec. Wonocolo', 'Kec. Wiyung', 'Kec. Gayungan',
    'Kec. Dukuh Pakis', 'Kec. Sawahan', 'Kec. Wonokromo',
    'Kec. Karangpilang', 'Kec. Jambangan', 'Kec. Lakarsantri',
    'Kec. Benowo', 'Kec. Pakal', 'Kec. Sambikerep',
    'Kec. Tandes', 'Kec. Sukomanunggal', 'Kec. Asemrowo',
    'Kec. Krembangan', 'Kec. Bubutan', 'Kec. Tegalsari',
    'Kec. Pabean Cantian', 'Kec. Bulak',
  ],
  Bandung: [
    'Jl. Asia Afrika', 'Jl. Ir. H. Juanda', 'Jl. Riau',
    'Jl. Sudirman', 'Jl. Diponegoro', 'Jl. Pasteur',
    'Jl. Soekarno Hatta', 'Jl. Dago', 'Jl. Cihampelas',
    'Jl. Braga', 'Jl. Setiabudhi', 'Jl. Cipaganti',
    'Jl. Setiabudi', 'Jl. Cibeunying', 'Jl. Buah Batu',
    'Jl. Kiaracondong', 'Jl. Antapani', 'Jl. Cicaheum',
    'Kec. Bandung Wetan', 'Kec. Sumur Bandung', 'Kec. Cibeunying Kidul',
    'Kec. Cibeunying Kaler', 'Kec. Coblong', 'Kec. Cicendo',
    'Kec. Andir', 'Kec. Astanaanyar', 'Kec. Bojongloa Kaler',
    'Kec. Babakan Ciparay', 'Kec. Bandung Kulon', 'Kec. Buahbatu',
    'Kec. Rancasari', 'Kec. Gedebage', 'Kec. Cibiru',
    'Kec. Panyileukan', 'Kec. Ujungberung', 'Kec. Arcamanik',
    'Kec. Antapani', 'Kec. Mandalajati', 'Kec. Kiaracondong',
    'Kec. Batununggal', 'Kec. Regol', 'Kec. Lengkong',
    'Kec. Bandung Kidul', 'Kec. Sukasari', 'Kec. Sukajadi',
  ],
  Medan: [
    'Jl. Gatot Subroto', 'Jl. Yos Sudarso', 'Jl. Imam Bonjol',
    'Jl. Diponegoro', 'Jl. Sutomo', 'Jl. Sisingamangaraja',
    'Jl. Veteran', 'Jl. A. Yani', 'Jl. Zainul Arifin',
    'Jl. Sei Batang Hari', 'Jl. Monginsidi', 'Jl. Jenderal Sudirman',
    'Kec. Medan Kota', 'Kec. Medan Baru', 'Kec. Medan Polonia',
    'Kec. Medan Maimun', 'Kec. Medan Sunggal', 'Kec. Medan Petisah',
    'Kec. Medan Barat', 'Kec. Medan Helvetia', 'Kec. Medan Selayang',
    'Kec. Medan Tuntungan', 'Kec. Medan Johor', 'Kec. Medan Amplas',
    'Kec. Medan Denai', 'Kec. Medan Area', 'Kec. Medan Kota',
    'Kec. Medan Labuhan', 'Kec. Medan Marelan', 'Kec. Medan Belawan',
    'Kec. Medan Timur', 'Kec. Medan Perjuangan', 'Kec. Medan Tembung',
    'Kec. Medan Deli', 'Kec. Percut Sei Tuan',
  ],
  Yogyakarta: [
    'Jl. Malioboro', 'Jl. Solo', 'Jl. Ahmad Dahlan',
    'Jl. Sudirman', 'Jl. Urip Sumoharjo', 'Jl. Magelang',
    'Jl. Kaliurang', 'Jl. Gejayan', 'Jl. Laksda Adisucipto',
    'Jl. Parangtritis', 'Jl. Bantul', 'Jl. Wates',
    'Kec. Gondokusuman', 'Kec. Mergangsan', 'Kec. Umbulharjo',
    'Kec. Kotagede', 'Kec. Danurejan', 'Kec. Gedongtengen',
    'Kec. Gondomanan', 'Kec. Ngampilan', 'Kec. Wirobrajan',
    'Kec. Mantrijeron', 'Kec. Kraton', 'Kec. Pakualaman',
    'Kec. Jetis', 'Kec. Tegalrejo',
  ],
  Semarang: [
    'Jl. Pandanaran', 'Jl. Pemuda', 'Jl. Sudirman',
    'Jl. Diponegoro', 'Jl. A. Yani', 'Jl. MT Haryono',
    'Jl. Siliwangi', 'Jl. Majapahit', 'Jl. Perintis Kemerdekaan',
    'Jl. Karangayu', 'Jl. Kaligawe', 'Jl. Brigjend Sudiarto',
    'Kec. Semarang Barat', 'Kec. Semarang Utara', 'Kec. Semarang Timur',
    'Kec. Semarang Selatan', 'Kec. Semarang Tengah', 'Kec. Gayamsari',
    'Kec. Genuk', 'Kec. Pedurungan', 'Kec. Tembalang',
    'Kec. Banyumanik', 'Kec. Gajahmungkur', 'Kec. Candisari',
    'Kec. Gunungpati', 'Kec. Mijen', 'Kec. Ngaliyan',
    'Kec. Tugu', 'Kec. Grobogan',
  ],
};

// Mengambil semua nama jalan/daerah dari semua kota
export const getAllAlamat = () => {
  const all = [];
  Object.entries(DAFTAR_ALAMAT).forEach(([kota, daftar]) => {
    daftar.forEach(item => {
      all.push({ label: item, kota });
    });
  });
  return all;
};

// Filter berdasarkan kota dan query pencarian
export const cariAlamat = (query, kota = null) => {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const allItems = getAllAlamat();
  return allItems
    .filter(item => {
      const matchQuery = item.label.toLowerCase().includes(q);
      const matchKota = !kota || item.kota.toLowerCase() === kota.toLowerCase();
      return matchQuery && matchKota;
    })
    .slice(0, 10); // Maksimal 10 hasil
};
