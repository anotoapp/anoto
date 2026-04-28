export default function StoreSettings() {
  return (
    <div className="p-4 fade-in">
      <header className="dashboard-header" style={{ marginBottom: '30px' }}>
        <h1>Configurações Gerais</h1>
        <p>Ajuste as preferências da plataforma, temas, métodos de pagamento etc.</p>
      </header>

      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '15px' }}>Em breve</h3>
        <p style={{ color: '#666' }}>Esta seção servirá para você configurar cores do tema, chaves de API, integrações de pagamento e outras configurações avançadas do seu sistema.</p>
        
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
          <p style={{ color: '#888', textAlign: 'center', fontSize: '0.9rem', margin: 0 }}>
            Área em construção 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
