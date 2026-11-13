import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const campoBase =
    'w-full px-4 py-3 rounded-xl border bg-white text-base outline-none transition-colors';
const campoOk = 'border-negro/10 focus:border-rojoMarca';
const campoError = 'border-rojoMarca focus:border-rojoMarca bg-rojoMarca/[0.03]';

export default function Login() {
    const { login, isAuthenticated, authListo } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const destino = location.state?.from || '/';

    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [mostrarClave, setMostrarClave] = useState(false);
    const [erroresCampo, setErroresCampo] = useState({ usuario: '', password: '' });
    const [errorFormulario, setErrorFormulario] = useState('');
    const [enviando, setEnviando] = useState(false);

    if (!authListo) {
        return (
            <div className="min-h-screen bg-plomoSuave flex items-center justify-center">
                <p className="text-grisMarca text-base" role="status">Validando sesión...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={destino} replace />;
    }

    const validar = () => {
        const usuarioLimpio = usuario.trim();
        const siguientes = {
            usuario: usuarioLimpio ? '' : 'Ingresa tu usuario.',
            password: password ? '' : 'Ingresa tu contraseña.',
        };
        setErroresCampo(siguientes);
        return !siguientes.usuario && !siguientes.password;
    };

    const handleSubmit = async (evento) => {
        evento.preventDefault();
        setErrorFormulario('');

        if (!validar()) return;

        setEnviando(true);
        try {
            await login({ usuario, password });
            navigate(destino, { replace: true });
        } catch (err) {
            setErrorFormulario(err.message || 'No se pudo iniciar sesión.');
        } finally {
            setEnviando(false);
        }
    };

    // Enter no siempre dispara submit si hay otro <button> en el form (ojo de contraseña).
    const enviarConEnter = (evento) => {
        if (evento.key !== 'Enter') return;
        evento.preventDefault();
        if (enviando) return;
        evento.currentTarget.form?.requestSubmit();
    };

    return (
        <div className="min-h-screen bg-plomoSuave flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="card-panel overflow-hidden">
                    <div className="h-1 bg-rojoMarca" />
                    <div className="px-6 pt-8 pb-6 sm:px-8">
                        <img
                            src="/logo.png"
                            alt="Trajes El Buen Vestir"
                            className="mx-auto h-16 w-auto object-contain"
                        />
                        <h1 className="mt-6 text-center font-serif text-3xl font-bold text-negro">
                            Iniciar sesión
                        </h1>
                        <p className="mt-2 text-center text-[15px] text-grisMarca">
                            Acceso del personal al panel del taller
                        </p>

                        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                            <div>
                                <label htmlFor="login-usuario" className="block text-[15px] font-semibold text-negro mb-1.5">
                                    Usuario
                                </label>
                                <input
                                    id="login-usuario"
                                    type="text"
                                    name="usuario"
                                    autoComplete="username"
                                    value={usuario}
                                    onChange={(e) => {
                                        setUsuario(e.target.value);
                                        if (erroresCampo.usuario) {
                                            setErroresCampo((prev) => ({ ...prev, usuario: '' }));
                                        }
                                    }}
                                    onKeyDown={enviarConEnter}
                                    aria-invalid={Boolean(erroresCampo.usuario)}
                                    aria-describedby={erroresCampo.usuario ? 'login-usuario-error' : undefined}
                                    className={`${campoBase} ${erroresCampo.usuario ? campoError : campoOk}`}
                                    placeholder="Tu usuario"
                                />
                                {erroresCampo.usuario ? (
                                    <p id="login-usuario-error" className="mt-1.5 text-[14px] font-medium text-rojoMarca" role="alert">
                                        {erroresCampo.usuario}
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label htmlFor="login-password" className="block text-[15px] font-semibold text-negro mb-1.5">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={mostrarClave ? 'text' : 'password'}
                                        name="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (erroresCampo.password) {
                                                setErroresCampo((prev) => ({ ...prev, password: '' }));
                                            }
                                        }}
                                        onKeyDown={enviarConEnter}
                                        aria-invalid={Boolean(erroresCampo.password)}
                                        aria-describedby={erroresCampo.password ? 'login-password-error' : undefined}
                                        className={`${campoBase} pr-12 ${erroresCampo.password ? campoError : campoOk}`}
                                        placeholder="Tu contraseña"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setMostrarClave((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-grisMarca hover:text-negro transition"
                                        aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {mostrarClave ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {erroresCampo.password ? (
                                    <p id="login-password-error" className="mt-1.5 text-[14px] font-medium text-rojoMarca" role="alert">
                                        {erroresCampo.password}
                                    </p>
                                ) : null}
                            </div>

                            {errorFormulario ? (
                                <p className="text-[15px] font-medium text-rojoMarca" role="alert">{errorFormulario}</p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={enviando}
                                className="btn-marca w-full disabled:opacity-60"
                            >
                                <LogIn size={18} />
                                {enviando ? 'Ingresando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>
                </div>
                <p className="mt-4 text-center text-[14px] text-grisMarca">
                    Uso exclusivo del personal autorizado
                </p>
            </div>
        </div>
    );
}
