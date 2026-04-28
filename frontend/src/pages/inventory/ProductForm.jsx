import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Furniture', 'Office Supplies', 'Software', 'Hardware', 'Services', 'Other'];
const STATUSES = ['active', 'inactive', 'discontinued'];

const defaultForm = {
  name: '', sku: '', category: 'Electronics',
  stock: '', price: '', supplier: '', status: 'active',
};

export default function ProductForm() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      productAPI.getOne(id)
        .then((res) => {
          const p = res.data.product;
          setForm({
            name: p.name, sku: p.sku, category: p.category,
            stock: p.stock, price: p.price, supplier: p.supplier, status: p.status,
          });
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['name', 'sku', 'category', 'stock', 'price', 'supplier'];
    for (const field of required) {
      if (form[field] === '' || form[field] === undefined) return toast.error(`Please fill in ${field}`);
    }
    setLoading(true);
    try {
      if (isEdit) {
        await productAPI.update(id, form);
        toast.success('Product updated successfully');
      } else {
        await productAPI.create(form);
        toast.success('Product added successfully');
      }
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="page-header">
        <button onClick={() => navigate('/products')} className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-3 flex items-center gap-1">
          ← Back to Inventory
        </button>
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update product information' : 'Fill in the details to add a new product'}</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Product Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Dell XPS 15 Laptop" className="form-input" />
          </div>
          <div>
            <label className="form-label">SKU *</label>
            <input name="sku" value={form.sku} onChange={handleChange} placeholder="DELL-XPS-15" className="form-input uppercase" />
          </div>
          <div>
            <label className="form-label">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="form-select">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Supplier *</label>
            <input name="supplier" value={form.supplier} onChange={handleChange} placeholder="Dell Technologies" className="form-input" />
          </div>
          <div>
            <label className="form-label">Stock Quantity *</label>
            <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="100" className="form-input" min="0" />
          </div>
          <div>
            <label className="form-label">Unit Price ($) *</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="999.99" className="form-input" min="0" step="0.01" />
          </div>
          <div>
            <label className="form-label">Status *</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-select">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : isEdit ? 'Update Product' : 'Add Product'}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
