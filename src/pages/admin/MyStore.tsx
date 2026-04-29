import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Upload } from 'lucide-react';
import { optimizeImage } from '../../lib/image-optimizer';

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

export default function MyStore() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    loadStoreData();
  }, []);

  async function loadStoreData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();

      if (error) throw error;
      
      let parsedHours = defaultOpeningHours;
      if (data.opening_hours) {
        try {
          const parsed = typeof data.opening_hours === 'string' && data.opening_hours.startsWith('{') 
            ? JSON.parse(data.opening_hours) 
            : data.opening_hours;
          
          if (typeof parsed === 'object' && parsed.monday) {
            parsedHours = parsed;
          }
        } catch(e) {}
      }
      data.opening_hours = parsedHours;
      
      setStore(data);
    } catch (error) {
      console.error('Error loading store:', error);
    } finally {
      setLoading(false);
    }
  }

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
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
    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Erro ao subir imagem: ' + (error.message || 'Verifique se o bucket "store-assets" existe no Supabase.'));
    } finally {
      if (field === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
          is_open_manual: store.is_open_manual
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
      <header className="dashboard-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Minha Loja</h1>
          <p>Altere os dados visíveis para os seus clientes</p>
        </div>
        <a 
          href={`${window.location.origin}/${store.slug}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            padding: '10px 20px', 
            background: '#fff', 
            color: '#2962ff', 
            border: '2px solid #2962ff', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: '600',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Visualizar Loja
        </a>

        <div 
          onClick={() => setStore({ ...store, is_open_manual: !store.is_open_manual })}
          style={{ 
            padding: '10px 24px', 
            background: store.is_open_manual ? '#e8f5e9' : '#ffebee', 
            color: store.is_open_manual ? '#2e7d32' : '#d32f2f', 
            borderRadius: '8px', 
            fontWeight: '800',
            cursor: 'pointer',
            border: `2px solid ${store.is_open_manual ? '#2e7d32' : '#d32f2f'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: store.is_open_manual ? '#2e7d32' : '#d32f2f' }}></div>
          {store.is_open_manual ? 'LOJA ABERTA' : 'LOJA FECHADA'}
        </div>
      </header>

      <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        {/* Formulário de Edição */}
        <form onSubmit={handleSave} className="settings-form" style={{ flex: '1', maxWidth: '600px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Sua Logo</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0f0f0', overflow: 'hidden', border: '2px solid #ddd' }}>
                  {store.logo ? <img src={store.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                </div>
                <label className="secondary-action" style={{ padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px' }}>
                  {uploadingLogo ? 'Enviando...' : <><Upload size={14} style={{ display: 'inline', marginRight: '4px' }} /> Trocar Logo</>}
                  <input type="file" accept="image/*" onChange={e => uploadImage(e, 'logo')} disabled={uploadingLogo} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div className="form-group" style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Banner de Fundo</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '100%', height: '80px', borderRadius: '8px', backgroundColor: '#f0f0f0', overflow: 'hidden', border: '1px solid #ddd' }}>
                  {store.banner ? <img src={store.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                </div>
                <label className="secondary-action" style={{ padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px' }}>
                  {uploadingBanner ? 'Enviando...' : <><Upload size={14} style={{ display: 'inline', marginRight: '4px' }} /> Trocar Banner</>}
                  <input type="file" accept="image/*" onChange={e => uploadImage(e, 'banner')} disabled={uploadingBanner} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Link da sua loja (Slug)</label>
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
              placeholder="ex: minha-hamburgueria"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nome da Loja</label>
            <input 
              type="text" 
              value={store.name || ''} 
              onChange={e => setStore({...store, name: e.target.value})} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Endereço Completo</label>
            <input 
              type="text" 
              value={store.address || ''} 
              onChange={e => setStore({...store, address: e.target.value})} 
              placeholder="Rua, Número, Bairro, Cidade - UF"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>WhatsApp (Receber pedidos)</label>
            <input 
              type="text" 
              value={store.whatsapp_number || ''} 
              onChange={e => setStore({...store, whatsapp_number: e.target.value})} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Horário de Funcionamento</label>
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
              {daysOfWeek.map((day, index) => (
                <div key={day.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: index < daysOfWeek.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px', cursor: 'pointer', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={store.opening_hours?.[day.id]?.isOpen ?? true} 
                      onChange={e => {
                         const current = store.opening_hours || defaultOpeningHours;
                         setStore({...store, opening_hours: { ...current, [day.id]: { ...current[day.id], isOpen: e.target.checked } }})
                      }}
                      style={{ margin: 0, width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.95rem', color: store.opening_hours?.[day.id]?.isOpen ? '#333' : '#999' }}>{day.label}</span>
                  </label>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', height: '36px' }}>
                    {store.opening_hours?.[day.id]?.isOpen ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="time" 
                          value={store.opening_hours?.[day.id]?.open || '18:00'}
                          onChange={e => {
                             const current = store.opening_hours || defaultOpeningHours;
                             setStore({...store, opening_hours: { ...current, [day.id]: { ...current[day.id], open: e.target.value } }})
                          }}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
                        />
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>até</span>
                        <input 
                          type="time" 
                          value={store.opening_hours?.[day.id]?.close || '23:00'}
                          onChange={e => {
                             const current = store.opening_hours || defaultOpeningHours;
                             setStore({...store, opening_hours: { ...current, [day.id]: { ...current[day.id], close: e.target.value } }})
                          }}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#aaa', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '8px' }}>Fechado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Taxa de Entrega (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={store.delivery_fee || 0} 
                onChange={e => setStore({...store, delivery_fee: parseFloat(e.target.value)})} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Pedido Mínimo (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={store.min_order || 0} 
                onChange={e => setStore({...store, min_order: parseFloat(e.target.value)})} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            style={{ width: '100%', padding: '14px', background: '#2962ff', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar Loja'}
          </button>
        </form>

        {/* Live Preview (Simulador de Celular) */}
        <div style={{ flex: '0 0 350px', position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ marginBottom: '16px', fontWeight: '600', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Preview ao vivo</p>
          
          <div style={{ 
            width: '320px', 
            height: '640px', 
            background: '#000', 
            borderRadius: '40px', 
            padding: '12px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '8px solid #333',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Notch do iPhone */}
            <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '25px', background: '#000', borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px', zIndex: 10 }}></div>
            
            {/* Tela do App */}
            <div style={{ width: '100%', height: '100%', background: '#f5f5f5', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Banner Preview */}
              <div style={{ width: '100%', height: '140px', background: '#ddd', overflow: 'hidden', position: 'relative' }}>
                {store.banner ? (
                  <img src={store.banner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview Banner" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Sem Banner</div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))' }}></div>
              </div>

              {/* Header Preview */}
              <div style={{ padding: '0 16px', marginTop: '-40px', position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fff', margin: '0 auto', padding: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                    {store.logo ? <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview Logo" /> : null}
                  </div>
                </div>
                <h2 style={{ marginTop: '12px', marginBottom: '4px', fontSize: '1.2rem', fontWeight: '700' }}>{store.name || 'Nome da sua Loja'}</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{store.address || 'Seu endereço aqui'}</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <div style={{ padding: '6px 12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600' }}>Aberto agora</div>
                  <div style={{ padding: '6px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: '20px', fontSize: '0.7rem' }}>30-45 min</div>
                </div>
              </div>

              {/* Placeholder Categorias */}
              <div style={{ marginTop: '24px', padding: '0 16px' }}>
                <div style={{ display: 'flex', gap: '8px', overflow: 'hidden' }}>
                  <div style={{ flex: '0 0 80px', height: '30px', background: '#2962ff', borderRadius: '15px' }}></div>
                  <div style={{ flex: '0 0 80px', height: '30px', background: '#fff', borderRadius: '15px', border: '1px solid #ddd' }}></div>
                  <div style={{ flex: '0 0 80px', height: '30px', background: '#fff', borderRadius: '15px', border: '1px solid #ddd' }}></div>
                </div>
              </div>

              {/* Placeholder Produtos */}
              <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ height: '120px', background: '#fff', borderRadius: '12px' }}></div>
                <div style={{ height: '120px', background: '#fff', borderRadius: '12px' }}></div>
              </div>
            </div>
          </div>
          <p style={{ marginTop: '12px', fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>Isso é uma simulação de como seus<br/>clientes verão sua loja no celular.</p>
        </div>
      </div>
    </div>
  );
}
