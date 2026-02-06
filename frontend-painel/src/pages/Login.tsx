export default function Login() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--black)'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px',
        background: 'var(--darker)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <h1 style={{ color: 'var(--gold)', marginBottom: '10px' }}>Login</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Painel Administrativo</p>
        
        <form>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px' }}>Email</label>
            <input 
              type="email" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: 'var(--black)', 
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text)', fontSize: '14px' }}>Senha</label>
            <input 
              type="password" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: 'var(--black)', 
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                outline: 'none'
              }}
            />
          </div>
          
          <button 
            type="submit"
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: 'var(--gold)', 
              color: 'var(--black)',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
