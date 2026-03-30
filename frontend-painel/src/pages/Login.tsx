import Logo from '../components/Logo';
import './Login.css';

export default function Login() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <Logo imgClassName="h-20 w-auto" />
        </div>
        
        <div className="login-header">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Painel Administrativo</p>
        </div>
        
        <form className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              className="form-input"
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <input 
              id="password"
              type="password" 
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="login-button"
          >
            Entrar
          </button>
        </form>
        
        <div className="login-footer">
          <p>Primeira vez? Entre em contato com o administrador</p>
        </div>
      </div>
    </div>
  );
}
