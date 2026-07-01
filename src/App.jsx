import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotifikasiProvider } from './context/NotifikasiContext';
import { NotifikasiToast } from './components/ui/Notifikasi';
import { NotifikasiKiosAlert } from './components/ui/NotifikasiKios';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Produk from './pages/Produk';
import ProdukDetail from './pages/ProdukDetail';
import Dokter from './pages/Dokter';
import DokterDetail from './pages/DokterDetail';
import Grooming from './pages/Grooming';
import GroomingDetail from './pages/GroomingDetail';
import Peta from './pages/Peta';
import Register from './pages/Register';
import Login from './pages/Login';
import Keranjang from './pages/Keranjang';
import PaymentPage from './pages/PaymentPage';

// Akun (pembeli)
import AkunDashboard from './pages/akun/Dashboard';
import AkunPesanan from './pages/akun/Pesanan';
import AkunChat from './pages/akun/Chat';
import AkunHewan from './pages/akun/Hewan';
import DaftarKios from './pages/akun/DaftarKios';
import DaftarDokter from './pages/akun/DaftarDokter';
import DaftarGrooming from './pages/akun/DaftarGrooming';

// Kios (owner)
import KiosDashboard from './pages/kios/Dashboard';
import KiosProduk from './pages/kios/Produk';
import KiosPesanan from './pages/kios/Pesanan';
import KiosChat from './pages/kios/Chat';
import KiosAnalitik from './pages/kios/Analitik';

// Dokter portal
import DokterDashboard from './pages/dokter-portal/Dashboard';
import DokterJadwal from './pages/dokter-portal/Jadwal';
import DokterJanji from './pages/dokter-portal/Janji';
import DokterChat from './pages/dokter-portal/Chat';

// Grooming portal
import GroomingDashboard from './pages/grooming-portal/Dashboard';
import GroomingBooking from './pages/grooming-portal/Booking';
import GroomingChat from './pages/grooming-portal/Chat';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminPengguna from './pages/admin/Pengguna';
import AdminKios from './pages/admin/Kios';
import AdminKomisi from './pages/admin/Komisi';
import AdminLaporan from './pages/admin/Laporan';
import AdminGuard from './components/layout/AdminGuard';
import AuthLoadingGuard from './components/layout/AuthLoadingGuard';

// Layout wrapper for pages with nav + footer
function PageLayout({ children, noFooter = false }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: 70 }}>
        {children}
      </main>
      {!noFooter && <Footer />}
      <NotifikasiToast />
    </>
  );
}

// Dashboard layout (no footer, sidebar-based)
function DashLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: 70, background: 'var(--bg-primary)' }}>
        {children}
      </main>
      <NotifikasiToast />
      <NotifikasiKiosAlert />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotifikasiProvider>
          <AuthLoadingGuard>
          <Routes>
            {/* Public */}
            <Route path="/" element={<PageLayout><Home /></PageLayout>} />
            <Route path="/produk" element={<PageLayout><Produk /></PageLayout>} />
            <Route path="/produk/detail/:id" element={<PageLayout><ProdukDetail /></PageLayout>} />
            <Route path="/produk/:kategori" element={<PageLayout><Produk /></PageLayout>} />
            <Route path="/dokter" element={<PageLayout><Dokter /></PageLayout>} />
            <Route path="/dokter/:id" element={<PageLayout><DokterDetail /></PageLayout>} />
            <Route path="/grooming" element={<PageLayout><Grooming /></PageLayout>} />
            <Route path="/grooming/:id" element={<PageLayout><GroomingDetail /></PageLayout>} />
            <Route path="/peta" element={<PageLayout><Peta /></PageLayout>} />
            <Route path="/keranjang" element={<PageLayout><Keranjang /></PageLayout>} />
            <Route path="/payment/:id" element={<PageLayout><PaymentPage /></PageLayout>} />
            <Route path="/masuk" element={<PageLayout noFooter><Login /></PageLayout>} />
            <Route path="/daftar" element={<PageLayout noFooter><Register /></PageLayout>} />

            {/* Akun pembeli */}
            <Route path="/akun" element={<DashLayout><AkunDashboard /></DashLayout>} />
            <Route path="/akun/pesanan" element={<DashLayout><AkunPesanan /></DashLayout>} />
            <Route path="/akun/chat" element={<DashLayout><AkunChat /></DashLayout>} />
            <Route path="/akun/hewan" element={<DashLayout><AkunHewan /></DashLayout>} />
            <Route path="/akun/daftar-kios" element={<DashLayout><DaftarKios /></DashLayout>} />
            <Route path="/akun/daftar-dokter" element={<DashLayout><DaftarDokter /></DashLayout>} />
            <Route path="/akun/daftar-grooming" element={<DashLayout><DaftarGrooming /></DashLayout>} />

            {/* Kios owner */}
            <Route path="/kios" element={<DashLayout><KiosDashboard /></DashLayout>} />
            <Route path="/kios/produk" element={<DashLayout><KiosProduk /></DashLayout>} />
            <Route path="/kios/pesanan" element={<DashLayout><KiosPesanan /></DashLayout>} />
            <Route path="/kios/chat" element={<DashLayout><KiosChat /></DashLayout>} />
            <Route path="/kios/analitik" element={<DashLayout><KiosAnalitik /></DashLayout>} />

            {/* Dokter */}
            <Route path="/portal-dokter" element={<DashLayout><DokterDashboard /></DashLayout>} />
            <Route path="/portal-dokter/jadwal" element={<DashLayout><DokterJadwal /></DashLayout>} />
            <Route path="/portal-dokter/janji" element={<DashLayout><DokterJanji /></DashLayout>} />
            <Route path="/portal-dokter/chat" element={<DashLayout><DokterChat /></DashLayout>} />

            {/* Grooming */}
            <Route path="/portal-grooming" element={<DashLayout><GroomingDashboard /></DashLayout>} />
            <Route path="/portal-grooming/booking" element={<DashLayout><GroomingBooking /></DashLayout>} />
            <Route path="/portal-grooming/chat" element={<DashLayout><GroomingChat /></DashLayout>} />

            {/* Admin — hanya bisa diakses oleh user dengan peran 'admin' */}
            <Route path="/admin" element={<DashLayout><AdminGuard><AdminDashboard /></AdminGuard></DashLayout>} />
            <Route path="/admin/pengguna" element={<DashLayout><AdminGuard><AdminPengguna /></AdminGuard></DashLayout>} />
            <Route path="/admin/kios" element={<DashLayout><AdminGuard><AdminKios /></AdminGuard></DashLayout>} />
            <Route path="/admin/komisi" element={<DashLayout><AdminGuard><AdminKomisi /></AdminGuard></DashLayout>} />
            <Route path="/admin/laporan" element={<DashLayout><AdminGuard><AdminLaporan /></AdminGuard></DashLayout>} />
          </Routes>
          </AuthLoadingGuard>
        </NotifikasiProvider>
      </CartProvider>
    </AuthProvider>
  );
}
