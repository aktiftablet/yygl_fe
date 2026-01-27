import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fetchTransactions, type Transaction, mockTransactions } from '../services/api';
import 'react-datepicker/dist/react-datepicker.css';

const TransactionList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination & Filter state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [fromDate, setFromDate] = useState<Date | null>(new Date(2026, 0, 1)); // Default to 01/01/2026
    const [toDate, setToDate] = useState<Date | null>(new Date()); // Default to today
    const [docNo, setDocNo] = useState<string>('');
    const [ref, setRef] = useState<string>('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Format dates to YYYY-MM-DD for API call
            const formattedFromDate = fromDate ? format(fromDate, 'yyyy-MM-dd') : '';
            const formattedToDate = toDate ? format(toDate, 'yyyy-MM-dd') : '';

            const result = await fetchTransactions(page, limit, formattedFromDate, formattedToDate, docNo, ref);
            if (result.success) {
                setTransactions(result.data);
            } else {
                setTransactions(mockTransactions);
                setError(t('list.error_load'));
            }
        } catch (err) {
            console.error(err);
            // For demonstration purposes, if the API fails (likely 404/500 if not running), load mock data
            setTransactions(mockTransactions);
            setError(t('list.error_load'));
        } finally {
            setLoading(false);
        }
    }, [page, limit, fromDate, toDate, docNo, ref, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on filter change
        loadData();
    };

    return (
        <div className="container">
            <header className="page-header">
                <h1>{t('list.title')}</h1>
                <p className="subtitle">{t('list.subtitle')}</p>
            </header>

            <section className="filters">
                <form onSubmit={handleFilterSubmit} className="filter-form">
                    <div className="filter-group">
                        <label htmlFor="from">{t('list.filter.from')}</label>
                        <DatePicker
                            id="from"
                            selected={fromDate}
                            onChange={(date: Date | null) => setFromDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="date-picker-input"
                            wrapperClassName="date-picker-wrapper"
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="to">{t('list.filter.to')}</label>
                        <DatePicker
                            id="to"
                            selected={toDate}
                            onChange={(date: Date | null) => setToDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="date-picker-input"
                            wrapperClassName="date-picker-wrapper"
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="doc_no">{t('list.filter.doc_no')}</label>
                        <input
                            type="text"
                            id="doc_no"
                            value={docNo}
                            onChange={(e) => setDocNo(e.target.value)}
                            placeholder={t('list.filter.placeholder_doc')}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="ref">{t('list.filter.ref')}</label>
                        <input
                            type="text"
                            id="ref"
                            value={ref}
                            onChange={(e) => setRef(e.target.value)}
                            placeholder={t('list.filter.placeholder_ref')}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">{t('list.filter.submit')}</button>
                </form>
            </section>

            {error && <div className="alert alert-warning">{error}</div>}

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('list.table.id')}</th>
                            <th>{t('list.table.doc_no')}</th>
                            <th>{t('list.table.date')}</th>
                            <th>{t('list.table.description')}</th>
                            <th>{t('list.table.amount')}</th>
                            <th>{t('list.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6}>{t('list.loading')}</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={6}>{t('list.no_data')}</td></tr>
                        ) : (
                            transactions.map((tItem) => (
                                <tr key={tItem.id}>
                                    <td>{tItem.id}</td>
                                    <td>{tItem.doc_no}</td>
                                    <td>{format(new Date(tItem.posting_date), 'dd/MM/yyyy HH:mm')}</td>
                                    <td>{tItem.description}</td>
                                    <td className="text-right">{tItem.debit_total}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => navigate(`/transactions/${tItem.id}`)}
                                        >
                                            {t('list.action.view')}
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
                    {t('list.pagination.prev')}
                </button>
                <span className="page-info">{t('list.pagination.info', { page })}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    className="btn btn-secondary"
                >
                    {t('list.pagination.next')}
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
