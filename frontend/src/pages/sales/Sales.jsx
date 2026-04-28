import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI } from '../../api';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const paymentBadge = {
  pending: 'badge-yellow',
  paid: 'badge-green',
  failed: 'badge-red',
  refunded: 'badge-gray',
};

const orderBadge = {
  pending: 'badge-yellow',
  processing: 'badge-blue',
  shipped: 'badge-purple',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin, canManage } = useAuth();
  const navigate = useNavigate();

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await salesAPI.getAll({ search, paymentStatus: payFilter, orderStatus: orderFilter });
      setSales(res.data.sales);
    } catch {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, [search, payFilter, orderFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await salesAPI.delete(deleteTarget._id);
      toast.success('Sale deleted successfully');
      setDeleteTarget(null);
      fetchSales();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const totalRevenue = sales.filter((s) => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.totalAmount, 0);

  const columns = [
    {
      key: 'customerName',
      label: 'Customer',
      render: (val) => <span className="font-medium text-slate-100">{val}</span>,
    },
    {
      key: 'product',
      label: 'Product',
      render: (val) => (
        <div>
          <p className="text-slate-300">{val?.name}</p>
          <p className="text-xs text-slate-500 font-mono">{val?.sku}</p>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (val) => <span className="font-mono text-slate-300">{val}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (val) => <span className="font-mono font-medium text-slate-200">${val?.toFixed(2)}</span>,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (val) => <span className={paymentBadge[val]}>{val}</span>,
    },
    {
      key: 'orderStatus',
      label: 'Order',
      render: (val) => <span className={orderBadge[val]}>{val}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => <span className="text-slate-500">{new Date(val).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => navigate(`/sales/${row._id}/edit`)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/40 transition-all"
            >
              Update
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleteTarget(row)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/20 transition-all"
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Sales & Orders</h1>
          <p className="page-subtitle">
            {sales.length} orders · Revenue:{' '}
            <span className="text-emerald-400 font-medium">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        {canManage && (
          <button onClick={() => navigate('/sales/new')} className="btn-primary">
            <span>+</span> New Order
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input max-w-xs"
        />
        <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="form-select max-w-xs">
          <option value="">All Payment Status</option>
          {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="form-select max-w-xs">
          <option value="">All Order Status</option>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || payFilter || orderFilter) && (
          <button onClick={() => { setSearch(''); setPayFilter(''); setOrderFilter(''); }} className="btn-secondary">
            Clear
          </button>
        )}
      </div>

      <Table columns={columns} data={sales} loading={loading} emptyMessage="No sales orders found" />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Sale"
        message={`Delete order for "${deleteTarget?.customerName}"? This cannot be undone.`}
        confirmText="Delete Sale"
      />
    </div>
  );
}
