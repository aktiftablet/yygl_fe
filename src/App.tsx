import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TransactionList from './pages/TransactionList';
import TransactionDetail from './pages/TransactionDetail';


function App() {
  return (
    <Router>
      <div className="app-layout">
        <nav className="main-nav">
          <div className="nav-brand">YYGL Reports</div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/transactions" replace />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
