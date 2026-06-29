import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Laptops from './pages/Laptops';
import Desktops from './pages/Desktops';
import Printers from './pages/Printers';
import LedTv from './pages/LedTv';
import Accessories from './pages/Accessories';
import Contact from './pages/Contact';
import Warranty from './pages/Warranty';
import Downloads from './pages/Downloads';
import Faq from './pages/Faq';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import Portfolio from './pages/Portfolio';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="laptops" element={<Laptops />} />
          <Route path="desktops" element={<Desktops />} />
          <Route path="printers" element={<Printers />} />
          <Route path="led-tv" element={<LedTv />} />
          <Route path="accessories" element={<Accessories />} />
          <Route path="contact" element={<Contact />} />
          <Route path="warranty" element={<Warranty />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="faq" element={<Faq />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="account" element={<Account />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
