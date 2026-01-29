import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TransactionList from './pages/TransactionList';
import TransactionDetail from './pages/TransactionDetail';
import CreateTransaction from './pages/CreateTransaction';


function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="app-layout">
        <nav className="main-nav">
          <div className="nav-brand">{t('app.title')}</div>
          <div className="nav-links" style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
            <Link to="/transactions" style={{ color: 'white', textDecoration: 'none' }}>{t('app.nav.transactions')}</Link>
            <Link to="/transactions/new" style={{ color: 'white', textDecoration: 'none' }}>{t('app.nav.new_transaction')}</Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/transactions" replace />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/transactions/new" element={<CreateTransaction />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
