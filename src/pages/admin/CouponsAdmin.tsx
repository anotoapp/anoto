import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { AdminContextType } from './AdminLayout';
import { Ticket, Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import './Admin.css';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { store } = useOutletContext<AdminContextType>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!store?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setMinOrderValue(0);
    setMaxUses('');
    setExpiresAt('');
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id);
      setCode(coupon.code);
      setDiscountType(coupon.discount_type);
      setDiscountValue(coupon.discount_value);
      setMinOrderValue(coupon.min_order_value);
      setMaxUses(coupon.max_uses || '');
      setExpiresAt(coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;

    try {
      const payload = {
        store_id: store.id,
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        min_order_value: minOrderValue,
        max_uses: maxUses === '' ? null : Number(maxUses),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
      };

      if (editingId) {
        await supabase.from('coupons').update(payload).eq('id', editingId);
      } else {
        await supabase.from('coupons').insert(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar cupom', error);
      alert('Erro ao salvar cupom');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom?')) {
      await supabase.from('coupons').delete().eq('id', id);
      loadData();
    }
  };

  if (loading) return <div className="p-4">Carregando cupons...</div>;

  return (
    <div className="fade-in">
      <header className="dashboard-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Cupons de Desconto</h1>
          <p>Crie promoções para atrair e reter mais clientes</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ padding: '12px 24px', background: 'var(--brand-red)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <Plus size={20} /> Novo Cupom
        </button>
      </header>

      <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {coupons.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <Ticket size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>Nenhum cupom criado</h3>
            <p>Clique em "Novo Cupom" para criar sua primeira promoção.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>Código</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>Desconto</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>Usos</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px', color: '#475569', fontWeight: '600', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', color: '#0f172a' }}>{coupon.code}</td>
                  <td style={{ padding: '16px', color: '#334155' }}>
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value.toFixed(2)}`}
                    <br/><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mínimo: R$ {coupon.min_order_value.toFixed(2)}</span>
                  </td>
                  <td style={{ padding: '16px', color: '#334155' }}>
                    {coupon.current_uses} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                      style={{ background: coupon.is_active ? '#dcfce7' : '#f1f5f9', color: coupon.is_active ? '#166534' : '#64748b', border: 'none', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      {coupon.is_active ? <><CheckCircle size={14}/> Ativo</> : <><XCircle size={14}/> Inativo</>}
                    </button>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button onClick={() => openModal(coupon)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginRight: '16px' }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(coupon.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="drawer-overlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 1100, background: 'rgba(0,0,0,0.5)' }}>
          <div className="drawer-content open" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', margin: 'auto', borderRadius: '24px', height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{editingId ? 'Editar Cupom' : 'Novo Cupom'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={20} color="#64748b"/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Código do Cupom</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required placeholder="Ex: PRIMEIRA10" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }} />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tipo de Desconto</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Valor</label>
                  <input type="number" step="0.01" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value))} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Valor Mínimo do Pedido (R$)</label>
                <input type="number" step="0.01" value={minOrderValue} onChange={e => setMinOrderValue(parseFloat(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Limite de Usos (Deixe vazio p/ Ilimitado)</label>
                  <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value ? Number(e.target.value) : '')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Válido até (Opcional)</label>
                  <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--brand-red)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>Salvar Cupom</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
