import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import UsersList from './pages/UsersList';
import OrdersList from './pages/OrdersList';
import PaymentsList from './pages/PaymentsList';
import PrintShopsList from './pages/PrintShopsList';
import ArtworksList from './pages/ArtworksList';
import Reports from './pages/Reports';
import SignupsList from './pages/SignupsList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/payments" element={<PaymentsList />} />
        <Route path="/printshops" element={<PrintShopsList />} />
        <Route path="/artworks" element={<ArtworksList />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/signups" element={<SignupsList />} />
      </Routes>
    </Router>
  );
}

export default App;

