import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTransactions, type Transaction, mockTransactions } from '../services/api';
import { format } from 'date-fns';

const TransactionList = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination & Filter state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchTransactions(page, limit, fromDate, toDate);
            if (result.success) {
                setTransactions(result.data);
            } else {
                setTransactions(mockTransactions);
                setError('Failed to fetch data. Showing mock data.');
            }
        } catch (err) {
            console.error(err);
            // For demonstration purposes, if the API fails (likely 404/500 if not running), load mock data
            setTransactions(mockTransactions);
            setError('Cannot connect to API. Showing mock data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, limit]); // fromDate/toDate controlled by manual submit usually better for UX, or debounce

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on filter change
        loadData();
    };

    return (
        <div className="container">
            <header className="page-header">
                <h1>Transaction Report</h1>
                <p className="subtitle">General Ledger Transactions</p>
            </header>

            <section className="filters">
                <form onSubmit={handleFilterSubmit} className="filter-form">
                    <div className="filter-group">
                        <label htmlFor="from">From Date</label>
                        <input
                            type="date"
                            id="from"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="to">To Date</label>
                        <input
                            type="date"
                            id="to"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Filter</button>
                </form>
            </section>

            {error && <div className="alert alert-warning">{error}</div>}

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Doc No</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>Loading...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={6}>No transactions found.</td></tr>
                        ) : (
                            transactions.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td>{t.doc_no}</td>
                                    <td>{format(new Date(t.posting_date), 'yyyy-MM-dd HH:mm')}</td>
                                    <td>{t.description}</td>
                                    <td className="text-right">{t.debit_total}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => navigate(`/transactions/${t.id}`)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="btn btn-secondary"
                >
                    Previous
                </button>
                <span className="page-info">Page {page}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-secondary"
                >
                    Next
                </button>

                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="limit-select"
                >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
        </div>
    );
};

export default TransactionList;
