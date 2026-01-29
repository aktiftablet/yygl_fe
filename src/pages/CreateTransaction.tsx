import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';
import { saveTransaction, type SaveTransactionRequest } from '../services/api';

const CreateTransaction = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<Date>(new Date());

    const [formData, setFormData] = useState<SaveTransactionRequest>({
        amount: 0,
        payer_id: 0,
        reciever_id: 0,
        pym_facilitator: '',
        commision: 0,
        kdv: 20,
        stopaj: 0,
        timestamp: new Date().toISOString(),
        call_id: crypto.randomUUID(),
    });

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setStartDate(date);
            setFormData(prev => ({
                ...prev,
                timestamp: date.toISOString()
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: any = value;

        if (type === 'number') {
            finalValue = Number(value);
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await saveTransaction(formData);
            setSuccessMessage(t('create.success_message'));
            setTimeout(() => navigate('/transactions'), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || t('create.error_save'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header className="page-header">
                <h1>{t('create.title')}</h1>
                <p className="subtitle">{t('create.subtitle')}</p>
            </header>

            <div className="form-container">
                {error && <div className="alert alert-error">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="card-form">
                    <div className="form-group">
                        <label htmlFor="amount">{t('create.form.amount')}</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-row form-row-2">
                        <div className="form-group">
                            <label htmlFor="payer_id">{t('create.form.payer_id')}</label>
                            <input
                                type="number"
                                id="payer_id"
                                name="payer_id"
                                value={formData.payer_id}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reciever_id">{t('create.form.receiver_id')}</label>
                            <input
                                type="number"
                                id="reciever_id"
                                name="reciever_id"
                                value={formData.reciever_id}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="pym_facilitator">{t('create.form.facilitator')}</label>
                        <input
                            type="text"
                            id="pym_facilitator"
                            name="pym_facilitator"
                            value={formData.pym_facilitator}
                            onChange={handleChange}
                            required
                            className="form-control"
                            placeholder={t('create.form.facilitator_placeholder')}
                        />
                    </div>

                    <div className="form-row form-row-3">
                        <div className="form-group">
                            <label htmlFor="commision">{t('create.form.commission')}</label>
                            <input
                                type="number"
                                id="commision"
                                name="commision"
                                value={formData.commision}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="kdv">{t('create.form.kdv')}</label>
                            <input
                                type="number"
                                id="kdv"
                                name="kdv"
                                value={formData.kdv}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1"
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stopaj">{t('create.form.stopaj')}</label>
                            <input
                                type="number"
                                id="stopaj"
                                name="stopaj"
                                value={formData.stopaj}
                                onChange={handleChange}
                                required
                                min="0"
                                step="1"
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="timestamp">{t('create.form.timestamp')}</label>
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            showTimeSelect
                            dateFormat="Pp"
                            className="form-control"
                            wrapperClassName="date-picker-wrapper"
                        />
                        <small className="form-hint">{t('create.form.selected_date', { date: formData.timestamp })}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="call_id">{t('create.form.call_id')}</label>
                        <input
                            type="text"
                            id="call_id"
                            name="call_id"
                            value={formData.call_id}
                            onChange={handleChange}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/transactions')} className="btn btn-secondary">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? t('create.saving') : t('create.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTransaction;
