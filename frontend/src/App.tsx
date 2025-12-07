import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="event/:id" element={<EventDetail />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment/:orderId" element={<Payment />} />
          <Route path="ticket/:orderId" element={<Ticket />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
