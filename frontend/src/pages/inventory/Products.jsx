import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../../api';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const categoryBadge = {
  Electronics: 'badge-blue',
  Furniture: 'badge-purple',
  'Office Supplies': 'badge-gray',
  Software: 'badge-green',
  Hardware: 'badge-yellow',
  Services: 'badge-brand',
  Other: 'badge-gray',
};

const statusBadge = {
  active: 'badge-green',
  inactive: 'badge-red',
  discontinued: 'badge-gray',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin, canManage } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search, category: catFilter });
      setProducts(res.data.products);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, catFilter]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productAPI.delete(deleteTarget._id);
      toast.success('Product deleted successfully');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-100">{val}</p>
          <p className="text-xs text-slate-500 font-mono">{row.sku}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (val) => <span className={`badge ${categoryBadge[val] || 'badge-gray'}`}>{val}</span>,
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (val) => (
        <span className={`font-mono font-medium ${val <= 5 ? 'text-red-400' : val <= 10 ? 'text-amber-400' : 'text-slate-300'}`}>
          {val} {val <= 10 && val > 0 ? '⚠' : val === 0 ? '✗' : ''}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Unit Price',
      render: (val) => <span className="font-mono text-slate-300">${val?.toFixed(2)}</span>,
    },
    { key: 'supplier', label: 'Supplier', render: (val) => <span className="text-slate-400">{val}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <span className={statusBadge[val]}>{val}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => navigate(`/products/${row._id}/edit`)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/40 transition-all"
            >
              Edit
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

  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div className="space-y-5">
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">
            {products.length} products
            {lowStockCount > 0 && (
              <span className="ml-2 badge badge-red">{lowStockCount} low stock</span>
            )}
          </p>
        </div>
        {canManage && (
          <button onClick={() => navigate('/products/new')} className="btn-primary">
            <span>+</span> Add Product
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, SKU, supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input max-w-sm"
        />
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="form-select max-w-xs"
        >
          <option value="">All Categories</option>
          {['Electronics', 'Furniture', 'Office Supplies', 'Software', 'Hardware', 'Services', 'Other'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(search || catFilter) && (
          <button onClick={() => { setSearch(''); setCatFilter(''); }} className="btn-secondary">
            Clear
          </button>
        )}
      </div>

      <Table columns={columns} data={products} loading={loading} emptyMessage="No products found" />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete Product"
      />
    </div>
  );
}
