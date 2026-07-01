import { createContext, useContext, useState, useEffect } from 'react';
import { hitungBeratTotal, hitungOngkir, generateKodePesanan } from '../data/mockData';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('petplace_cart');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const saveCart = (newItems) => {
    setItems(newItems);
    localStorage.setItem('petplace_cart', JSON.stringify(newItems));
  };

  const tambah = (produk, jumlah = 1) => {
    const existing = items.find(i => i.id === produk.id);
    if (existing) {
      saveCart(items.map(i => i.id === produk.id ? { ...i, jumlah: i.jumlah + jumlah } : i));
    } else {
      saveCart([...items, { ...produk, jumlah }]);
    }
  };

  const kurang = (id) => {
    const existing = items.find(i => i.id === id);
    if (existing?.jumlah <= 1) {
      hapus(id);
    } else {
      saveCart(items.map(i => i.id === id ? { ...i, jumlah: i.jumlah - 1 } : i));
    }
  };

  const hapus = (id) => saveCart(items.filter(i => i.id !== id));

  const hapusBanyak = (ids) => {
    const idList = Array.isArray(ids) ? ids : Array.from(ids);
    saveCart(items.filter(i => !idList.includes(i.id)));
  };

  const kosongkan = () => saveCart([]);

  const totalItem = items.reduce((s, i) => s + i.jumlah, 0);
  const totalBerat = hitungBeratTotal(items);
  const totalHarga = items.reduce((s, i) => s + ((i.hargaDiskon || i.harga) * i.jumlah), 0);
  const ongkir = hitungOngkir(totalBerat);
  const totalBayar = totalHarga + ongkir;

  const buatPesanan = (alamat, metodeBayar, user) => {
    const kode = generateKodePesanan();
    const pesanan = {
      id: Date.now(),
      kode,
      pembeli: user?.nama || user?.email || 'Pembeli',
      idPembeli: user?.id,
      items: items.map(i => ({
        ...i,
        idKios: i.idKios,
        namaKios: i.namaKios,
        nama: i.nama,
        jumlah: i.jumlah,
        harga: i.hargaDiskon || i.harga,
        foto: i.foto,
      })),
      alamat,
      metodeBayar,
      totalBerat,
      totalHarga,
      ongkir,
      totalBayar,
      status: 'menunggu_pembayaran',
      createdAt: new Date().toISOString(),
    };
    const riwayat = JSON.parse(localStorage.getItem('petplace_pesanan') || '[]');
    riwayat.push(pesanan);
    localStorage.setItem('petplace_pesanan', JSON.stringify(riwayat));
    kosongkan();
    return pesanan;
  };

  return (
    <CartContext.Provider value={{ items, tambah, kurang, hapus, hapusBanyak, kosongkan, totalItem, totalBerat, totalHarga, ongkir, totalBayar, buatPesanan }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
