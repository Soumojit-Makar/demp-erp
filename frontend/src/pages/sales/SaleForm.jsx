import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { salesAPI, productAPI } from '../../api';
import toast from 'react-hot-toast';

const EMPTY = {
  customerName: '',
  product: '',
  quantity: 1,
  paymentStatus: 'pending',
  orderStatus: 'pending',
};

export default function SaleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productAPI.getAll({ status: 'active' });
        setProducts(res.data.products);
      } catch {
        toast.error('Failed to load products');
      }
    };
    loadProducts();
  }, []);

  // Load sale if editing
  useEffect(() => {
    if (!isEdit) return;
    const loadSale = async () => {
      try {
        const res = await salesAPI.getOne(id);
        const s = res.data.sale;
        setForm({
          customerName: s.customerName,
          product: s.product?._id || '',
          quantity: s.quantity,
          paymentStatus: s.paymentStatus,
          orderStatus: s.orderStatus,
        });
      } catch {
        toast.error('Failed to load sale');
        navigate('/sales');
      } finally {
        setFetching(false);
      }
    };
    loadSale();
  }, [id]);

  // Update selected product info when product changes
  useEffect(() => {
    if (form.product && products.length) {
      const p = products.find((p) => p._id === form.product);
      setSelectedProduct(p || null);
    } else {
      setSelectedProduct(null);
    }
  }, [form.product, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName.trim()) return toast.error('Customer name is required');
    if (!form.product) return toast.error('Please select a product');
    if (form.quantity < 1) return toast.error('Quantity must be at least 1');

    setLoading(true);
    try {
      if (isEdit) {
        await salesAPI.update(id, {
          paymentStatus: form.paymentStatus,
          orderStatus: form.orderStatus,
        });
        toast.success('Sale updated successfully');
      } else {
        await salesAPI.create(form);
        toast.success('Sale created successfully');
      }
      navigate('/sales');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const estimatedTotal = selectedProduct
    ? (selectedProduct.price * Number(form.quantity)).toFixed(2)
    : '0.00';

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Update Sale Status' : 'Create New Order'}</h1>
        <p className="page-subtitle">
          {isEdit ? 'Update payment and order status' : 'Create a new sales order'}
        </p>
      </div>

      <div className="glass-card border border-slate-700/60 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Name */}
          <div>
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Enter customer or company name"
              className="form-input"
              disabled={isEdit}
            />
          </div>

          {/* Product Selection */}
          <div>
            <label className="form-label">Product *</label>
            <select
              name="product"
              value={form.product}
              onChange={handleChange}
              className="form-select"
              disabled={isEdit}
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ${p.price} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          {/* Product Info Banner */}
          {selectedProduct && !isEdit && (
            <div className="bg-brand-600/10 border border-brand-500/20 rounded-lg p-3 text-sm">
              <div className="flex flex-wrap gap-4 text-slate-300">
                <span>
                  <span className="text-slate-500">SKU:</span>{' '}
                  <span className="font-mono text-xs">{selectedProduct.sku}</span>
                </span>
                <span>
                  <span className="text-slate-500">Price:</span>{' '}
                  <span className="font-medium">${selectedProduct.price}</span>
                </span>
                <span>
                  <span className="text-slate-500">Available:</span>{' '}
                  <span className={selectedProduct.stock < 10 ? 'text-amber-400' : 'text-emerald-400'}>
                    {selectedProduct.stock} units
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="form-label">Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min={1}
              max={selectedProduct?.stock || undefined}
              className="form-input"
              disabled={isEdit}
            />
            {selectedProduct && !isEdit && (
              <p className="text-xs text-slate-500 mt-1">
                Max available: {selectedProduct.stock}
              </p>
            )}
          </div>

          {/* Estimated Total */}
          {!isEdit && (
            <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-slate-400">Estimated Total</span>
              <span className="font-display text-lg font-bold text-white">${estimatedTotal}</span>
            </div>
          )}

          {/* Payment & Order Status (editable in both create and edit) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Payment Status</label>
              <select
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
                className="form-select"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="form-label">Order Status</label>
              <select
                name="orderStatus"
                value={form.orderStatus}
                onChange={handleChange}
                className="form-select"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {isEdit ? 'Update Sale' : 'Create Order'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/sales')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
