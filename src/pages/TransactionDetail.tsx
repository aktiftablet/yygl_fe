import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchTransactionDetail, type TransactionDetail as ITransactionDetail, mockTransactions } from '../services/api';
import { format } from 'date-fns';

const TransactionDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<ITransactionDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const loadDetail = async () => {
            setLoading(true);
            try {
                const result = await fetchTransactionDetail(Number(id));
                if (result.success) {
                    setData(result.data);
                } else {
                    // Fallback for demo
                    const mockDoc = mockTransactions.find(t => t.id === Number(id));
                    if (mockDoc) {
                        setData({
                            document: mockDoc,
                            items: [
                                {
                                    line_no: 1,
                                    account_code: "PAYER",
                                    amount: "1000.00",
                                    dc_indicator: "D",
                                    currency: "TRY",
                                    user_id: 123,
                                    description: "Total payment debit from payer"
                                }
                            ]
                        });
                        setError('Failed to fetch details. Showing mock data.');
                    } else {
                        setError('Failed to fetch details');
                    }
                }
            } catch (err) {
                console.error(err);
                // Mock fallback for demo if API doesn't exist
                const mockDoc = mockTransactions.find(t => t.id === Number(id));
                if (mockDoc) {
                    setData({
                        document: mockDoc,
                        items: [
                            {
                                line_no: 1,
                                account_code: "PAYER",
                                amount: "1000.00",
                                dc_indicator: "D",
                                currency: "TRY",
                                user_id: 123,
                                description: "Total payment debit from payer"
                            }
                        ]
                    });
                } else {
                    setError('Cannot load transaction details.');
                }
            } finally {
                setLoading(false);
            }
        };

        loadDetail();
    }, [id]);

    if (loading) return <div className="container">Loading...</div>;
    if (error && !data) return <div className="container"><div className="alert alert-error">{error}</div><button className="btn" onClick={() => navigate(-1)}>Back</button></div>;
    if (!data) return <div className="container">Not found</div>;

    const { document, items } = data;

    return (
        <div className="container">
            <button className="btn btn-link mb-4" onClick={() => navigate('/transactions')}>&larr; Back to List</button>

            <header className="trans-header">
                <div className="trans-title">
                    <h1>Transaction #{document.doc_no}</h1>
                    <span className="badge">{document.reversal ? 'Reversed' : 'Active'}</span>
                </div>
                <div className="trans-meta">
                    <p><strong>Date:</strong> {format(new Date(document.posting_date), 'PPP HH:mm')}</p>
                    <p><strong>Ref:</strong> {document.ref}</p>
                    <p><strong>Total:</strong> {document.debit_total} TRY</p>
                </div>
            </header>

            <div className="card">
                <h3>Description</h3>
                <p>{document.description}</p>
            </div>

            <div className="card">
                <h3>Accounting Items</h3>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Line</th>
                                <th>Account</th>
                                <th>D/C</th>
                                <th>Amount</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.line_no}>
                                    <td>{item.line_no}</td>
                                    <td><span className="code">{item.account_code}</span></td>
                                    <td>
                                        <span className={`badge ${item.dc_indicator === 'D' ? 'badge-debit' : 'badge-credit'}`}>
                                            {item.dc_indicator}
                                        </span>
                                    </td>
                                    <td className="text-right font-mono">{item.amount} {item.currency}</td>
                                    <td>{item.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetail;
