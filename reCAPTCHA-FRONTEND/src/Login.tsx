// src/components/Login.tsx

import React, { useState } from 'react';

interface LoginProps {
    onChallenge: (username: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onChallenge }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Aquí puedes agregar la lógica para manejar el login
            // Por ejemplo, hacer una solicitud a tu API de autenticación
            console.log('Logging in with', { username, password });
            // Simulación de éxito
            onChallenge(username, password);
        } catch (err) {
            setError('Error en el login');
            setIsLoading(false);
        }
    };
    const validateEmail = (email: string) => {
        const regex = /^[a-zA-Z0-9._%+-]+@(izipay\.pe|izipay\.com)$/;
        return regex.test(email);
    };
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email = e.target.value;
        setUsername(email);
        if (!validateEmail(email)) {
            setEmailError('El correo electrónico debe tener el dominio @izipay.pe o @izipay.com');
        } else {
            setEmailError(null);
        }
    };
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <div className='img-center'>
                <div className='container-logo'>
                    <div className='log-izipay'>
                        <img src="https://iziweb001b.s3.amazonaws.com/webresources/img/logo.png" alt="Logo"
                            style={{ width: '100px' }} />
                    </div>

                    <div className='container-form'>
                        <div className='center-form'>
                            <h2 >Iniciar Sesión</h2>
                            <form onSubmit={handleLogin}>
                                <div className='flex'>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={handleEmailChange}
                                        placeholder="Correo electrónico"
                                        required
                                        style={{ marginBottom: '10px', padding: '10px', width: '100%' }}
                                    />
                                </div>
                                <div className='flex'>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Contraseña"
                                        required
                                        style={{ marginBottom: '20px', padding: '10px', width: '100%' }}
                                    />
                                </div>
                                <div className='flex'>
                                    {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                                    </div>
                                <button className='btn-logo' type="submit" disabled={isLoading} >
                                    {isLoading ? 'Cargando...' : 'Ingresar'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;