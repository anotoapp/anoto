import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, Upload, Store as StoreIcon, Phone, Palette, Clock, Settings, Eye } from 'lucide-react';
import { optimizeImage } from '../../lib/image-optimizer';
import type { AdminContextType } from './AdminLayout';

const defaultOpeningHours = {
  monday: { isOpen: true, open: '18:00', close: '23:00' },
  tuesday: { isOpen: true, open: '18:00', close: '23:00' },
  wednesday: { isOpen: true, open: '18:00', close: '23:00' },
  thursday: { isOpen: true, open: '18:00', close: '23:00' },
  friday: { isOpen: true, open: '18:00', close: '23:00' },
  saturday: { isOpen: true, open: '18:00', close: '23:00' },
  sunday: { isOpen: true, open: '18:00', close: '23:00' }
};

const daysOfWeek = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' }
];

interface StoreData {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  address: string;
  logo: string;
  banner: string;
  delivery_fee: number;
  min_order: number;
  is_open_manual: boolean;
  opening_hours: typeof defaultOpeningHours;
  theme?: { primaryColor: string };
  whatsapp_api_url?: string;
  whatsapp_api_instance?: string;
  whatsapp_api_token?: string;
}

export default function MyStore() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
 
  const { store: contextStore } = useOutletContext<AdminContextType>();
 
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contextStore) {
        const data = { ...contextStore };
        let parsedHours = defaultOpeningHours;
        if (data.opening_hours) {
          try {
            const parsed = typeof data.opening_hours === 'string' && data.opening_hours.startsWith('{') 
              ? JSON.parse(data.opening_hours) 
              : data.opening_hours;
            
            if (typeof parsed === 'object' && parsed.monday) {
              parsedHours = parsed;
            }
          } catch {
            // fallback
          }
        }
        data.opening_hours = parsedHours;
        setStore(data as StoreData);
        setLoading(false);
      } else if (contextStore === null) {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [contextStore]);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
    if (!store) return;
    try {
      if (field === 'logo') setUploadingLogo(true);
      else setUploadingBanner(true);

      if (!e.target.files || e.target.files.length === 0) return;

      const originalFile = e.target.files[0];
      
      // Otimizar: Logo (800x800) | Banner (1200x600)
      const optimizedBlob = field === 'logo' 
        ? await optimizeImage(originalFile, 800, 800, 0.8)
        : await optimizeImage(originalFile, 1200, 600, 0.7);

      const fileName = `${field}-${Math.random()}.webp`;
      const filePath = `${store.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, optimizedBlob, {
          contentType: 'image/webp',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      setStore({ ...store, [field]: data.publicUrl });
    } catch (err) {
      const error = err as Error;
      const msg = error.message ? error.message : 'Verifique se o bucket "store-assets" existe no Supabase.';
      console.error('Upload error:', error);
      alert('Erro ao subir imagem: ' + msg);
    } finally {
      if (field === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: store.name,
          slug: store.slug,
          whatsapp_number: store.whatsapp_number,
          opening_hours: typeof store.opening_hours === 'object' ? JSON.stringify(store.opening_hours) : store.opening_hours,
          address: store.address,
          delivery_fee: store.delivery_fee,
          min_order: store.min_order,
          logo: store.logo,
          banner: store.banner,
          is_open_manual: store.is_open_manual,
          theme: store.theme ? JSON.stringify(store.theme) : null,
          whatsapp_api_url: store.whatsapp_api_url,
          whatsapp_api_instance: store.whatsapp_api_instance,
          whatsapp_api_token: store.whatsapp_api_token
        })
        .eq('id', store.id);

      if (error) throw error;
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving store:', error);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Carregando loja...</div>;
  if (!store) return <div className="p-4">Nenhuma loja encontrada para esta conta.</div>;

  return (
    <div className="store-settings fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="dashboard-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'sticky', top: '0', zIndex: 100 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Minha Loja</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Gerencie a identidade e configurações da sua marca</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a 
            href={`${window.location.origin}/${store.slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="secondary-action"
            style={{ 
              padding: '10px 16px', 
              borderRadius: '10px', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Eye size={18} /> Visualizar Loja
          </a>

          <div 
            onClick={() => setStore({ ...store, is_open_manual: !store.is_open_manual })}
            style={{ 
              padding: '10px 16px', 
              background: store.is_open_manual ? '#ecfdf5' : '#fef2f2', 
              color: store.is_open_manual ? '#059669' : '#dc2626', 
              borderRadius: '10px', 
              fontWeight: '700',
              cursor: 'pointer',
              border: `1px solid ${store.is_open_manual ? '#bbf7d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: store.is_open_manual ? '#059669' : '#dc2626' }}></div>
            {store.is_open_manual ? 'LOJA ABERTA' : 'LOJA FECHADA'}
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            style={{ 
              padding: '10px 24px', 
              background: 'var(--brand-red)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: '700', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
            }}
          >
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* CARD 1: Identidade da Loja */}
          <div className="settings-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                <StoreIcon size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Identidade da Loja</h3>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
              <div className="form-group" style={{ flex: '0 0 auto' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Sua Logo</label>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '20px', backgroundColor: '#f8fafc', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                    {store.logo ? <img src={store.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                  </div>
                  <label style={{ position: 'absolute', bottom: '-8px', right: '-8px', width: '32px', height: '32px', background: '#fff', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    {uploadingLogo ? '...' : <Upload size={14} color="#64748b" />}
                    <input type="file" accept="image/*" onChange={e => uploadImage(e, 'logo')} disabled={uploadingLogo} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Banner de Fundo</label>
                <div style={{ position: 'relative', width: '100%', height: '100px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '16px', backgroundColor: '#f8fafc', overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                    {store.banner ? <img src={store.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                  </div>
                  <label style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', color: '#475569', backdropFilter: 'blur(4px)', border: '1px solid #fff' }}>
                    <Upload size={12} /> {uploadingBanner ? 'Enviando...' : 'Trocar Banner'}
                    <input type="file" accept="image/*" onChange={e => uploadImage(e, 'banner')} disabled={uploadingBanner} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Nome da Loja</label>
                <input 
                  type="text" 
                  value={store.name || ''} 
                  onChange={e => setStore({...store, name: e.target.value})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Link da sua loja (Slug)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontSize: '0.9rem' }}>/</span>
                  <input 
                    type="text" 
                    value={store.slug || ''} 
                    onChange={e => {
                      const formattedSlug = e.target.value
                        .toLowerCase()
                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-");
                      setStore({...store, slug: formattedSlug});
                    }} 
                    style={{ width: '100%', padding: '12px 16px 12px 32px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', fontWeight: '600', color: '#2563eb' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Taxa de Entrega (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={store.delivery_fee || 0} 
                  onChange={e => setStore({...store, delivery_fee: parseFloat(e.target.value)})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Pedido Mínimo (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={store.min_order || 0} 
                  onChange={e => setStore({...store, min_order: parseFloat(e.target.value)})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem' }}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: Aparência e Cores */}
          <div className="settings-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: '#faf5ff', borderRadius: '8px', color: '#9333ea' }}>
                <Palette size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Aparência (White Label)</h3>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Cor Principal da Loja</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={store.theme?.primaryColor || '#FFB800'} 
                  onChange={e => setStore({...store, theme: { primaryColor: e.target.value }})} 
                  style={{ width: '60px', height: '60px', padding: '0', border: '4px solid #fff', borderRadius: '12px', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['#FFB800', '#2563eb', '#dc2626', '#059669', '#7c3aed', '#db2777'].map(color => (
                    <button 
                      key={color}
                      type="button"
                      onClick={() => setStore({...store, theme: { primaryColor: color }})}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: color, 
                        border: store.theme?.primaryColor === color ? '3px solid #fff' : 'none',
                        boxShadow: store.theme?.primaryColor === color ? '0 0 0 2px #2563eb' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>

                <div style={{ flex: 1, minWidth: '200px', padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto' }}>
                  Essa cor será usada nos botões, ícones e destaques do cardápio para o seu cliente final.
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Contato e Localização */}
          <div className="settings-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: '#fff7ed', borderRadius: '8px', color: '#ea580c' }}>
                <Phone size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Contato & Localização</h3>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>WhatsApp (Receber pedidos)</label>
              <input 
                type="text" 
                value={store.whatsapp_number || ''} 
                onChange={e => setStore({...store, whatsapp_number: e.target.value})} 
                placeholder="Ex: 5511999999999"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Endereço Completo</label>
              <input 
                type="text" 
                value={store.address || ''} 
                onChange={e => setStore({...store, address: e.target.value})} 
                placeholder="Rua, Número, Bairro, Cidade - UF"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
              />
            </div>
          </div>

          {/* CARD 4: Horários de Funcionamento */}
          <div className="settings-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}>
                <Clock size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Horário de Funcionamento</h3>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {daysOfWeek.map((day, index) => {
                const dayKey = day.id as keyof typeof defaultOpeningHours;
                const isOpen = store.opening_hours?.[dayKey]?.isOpen ?? true;
                return (
                <div key={day.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', background: index % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: index < daysOfWeek.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '160px', cursor: 'pointer', margin: 0 }}>
                    <div style={{ 
                      width: '40px', 
                      height: '22px', 
                      background: isOpen ? '#10b981' : '#cbd5e1', 
                      borderRadius: '11px', 
                      position: 'relative', 
                      transition: 'all 0.3s',
                      padding: '2px'
                    }}>
                      <div style={{ 
                        width: '18px', 
                        height: '18px', 
                        background: '#fff', 
                        borderRadius: '50%', 
                        position: 'absolute', 
                        left: isOpen ? '20px' : '2px',
                        transition: 'all 0.3s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                      <input 
                        type="checkbox" 
                        checked={isOpen} 
                        onChange={e => {
                           const current = store.opening_hours || defaultOpeningHours;
                           setStore({...store, opening_hours: { ...current, [dayKey]: { ...current[dayKey], isOpen: e.target.checked } }})
                        }}
                        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }}
                      />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: isOpen ? '#1e293b' : '#94a3b8' }}>{day.label}</span>
                  </label>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {isOpen ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="time" 
                          value={store.opening_hours?.[dayKey]?.open || '18:00'}
                          onChange={e => {
                             const current = store.opening_hours || defaultOpeningHours;
                             setStore({...store, opening_hours: { ...current, [dayKey]: { ...current[dayKey], open: e.target.value } }})
                          }}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        />
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>até</span>
                        <input 
                          type="time" 
                          value={store.opening_hours?.[dayKey]?.close || '23:00'}
                          onChange={e => {
                             const current = store.opening_hours || defaultOpeningHours;
                             setStore({...store, opening_hours: { ...current, [dayKey]: { ...current[dayKey], close: e.target.value } }})
                          }}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>Fechado</span>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* CARD 5: Integrações WhatsApp API */}
          <div className="settings-card" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: '#ecfdf5', borderRadius: '8px', color: '#059669' }}>
                <Settings size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Notificações WhatsApp (API)</h3>
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' }}>
                Configure a **Evolution API** ou **Z-API** para enviar mensagens automáticas de atualização de status para seus clientes.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>URL da API</label>
              <input 
                type="text" 
                placeholder="Ex: https://api.sua-evolution.com"
                value={store.whatsapp_api_url || ''} 
                onChange={e => setStore({...store, whatsapp_api_url: e.target.value})} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>Instância</label>
                <input 
                  type="text" 
                  value={store.whatsapp_api_instance || ''} 
                  onChange={e => setStore({...store, whatsapp_api_instance: e.target.value})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.85rem', color: '#64748b' }}>API Token</label>
                <input 
                  type="password" 
                  value={store.whatsapp_api_token || ''} 
                  onChange={e => setStore({...store, whatsapp_api_token: e.target.value})} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LIVE PREVIEW COLUMN */}
        <div style={{ position: 'sticky', top: '110px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Preview em tempo real</span>
          </div>
          
          <div style={{ 
            width: '100%', 
            maxWidth: '340px', 
            height: '680px', 
            background: '#0f172a', 
            borderRadius: '45px', 
            padding: '10px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '4px solid #334155',
            margin: '0 auto',
            position: 'relative'
          }}>
            {/* Notch */}
            <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '24px', background: '#0f172a', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px', zIndex: 20 }}></div>
            
            {/* Screen Content */}
            <div style={{ width: '100%', height: '100%', background: '#f8fafc', borderRadius: '35px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ height: '140px', background: '#e2e8f0', overflow: 'hidden', position: 'relative' }}>
                {store.banner && <img src={store.banner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))' }}></div>
              </div>

              <div style={{ padding: '0 20px', marginTop: '-40px', textAlign: 'center', zIndex: 5 }}>
                <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '24px', margin: '0 auto', padding: '4px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '20px', background: '#f1f5f9', overflow: 'hidden' }}>
                    {store.logo && <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </div>

                <h3 style={{ marginTop: '12px', marginBottom: '4px', fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{store.name || 'Sua Loja'}</h3>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{store.address || 'Seu endereço aqui'}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <div style={{ padding: '6px 12px', background: '#f0fdf4', color: '#16a34a', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '700' }}>Aberto agora</div>
                  <div style={{ padding: '6px 12px', background: '#fff', color: '#64748b', borderRadius: '20px', fontSize: '0.65rem', border: '1px solid #e2e8f0' }}>30-45 min</div>
                </div>

                {/* Categories Mockup */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 16px', background: store.theme?.primaryColor || '#2962ff', borderRadius: '12px', color: '#fff', fontSize: '0.7rem', fontWeight: '600' }}>Início</div>
                  <div style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b', fontSize: '0.7rem' }}>Burgers</div>
                  <div style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b', fontSize: '0.7rem' }}>Bebidas</div>
                </div>

                {/* Products Mockup */}
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', background: '#fff', padding: '10px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '12px' }}></div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ width: '80%', height: '10px', background: '#e2e8f0', borderRadius: '5px', marginBottom: '8px' }}></div>
                      <div style={{ width: '40%', height: '8px', background: '#f1f5f9', borderRadius: '4px' }}></div>
                      <div style={{ marginTop: '8px', fontWeight: '700', fontSize: '0.8rem', color: store.theme?.primaryColor || '#2962ff' }}>R$ 29,90</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
