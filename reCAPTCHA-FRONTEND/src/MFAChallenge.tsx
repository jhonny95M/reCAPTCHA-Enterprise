// src/components/RecaptchaMFA.tsx

import React, { useCallback, useEffect, useState } from 'react';
import Login from './Login';

interface RecaptchaMFAProps {
  keyId: string;
  containerId?: string;
}

const RecaptchaMFA: React.FC<RecaptchaMFAProps> = ({ keyId, containerId }) => {
  const [requestToken, setRequestToken] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationHandle, setVerificationHandle] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(true);
  const [email,setEmail] = useState<string>('');//solo para almacenarlo, se puede cambiar el flujo
  useEffect(() => {
    if (requestToken) {
      // Call the challenge API.
      verificationHandle.challengeAccount().then(
        (challengeResponse: any) => {
          if (challengeResponse.isSuccess()) {
            console.log("todo oka verificationHandle")
          } else {
            console.log('error...')
          }
        });
    }
  }, [requestToken])


  const handleChallenge = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await (window as any).grecaptcha.enterprise.execute(keyId,
        { action: 'login', twofactor: true });

      const verifyCaptchaResponse = await fetch('https://localhost:7037/v1/VerifyReCaptchaByUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenReCaptcha:token, userName:username, password }),
      });

      const result = await verifyCaptchaResponse.json();
      const requestToken = result.response.accountVerification.endpoints[0].requestToken;

      //   // Desafía al usuario con challengeAccount
      //   const response = await (window as any).grecaptcha.enterprise.challengeAccount(keyId, {
      //     'account-token': requestToken,
      //     // 'container': containerId,
      //   });
      setVerificationHandle((window as any).grecaptcha.enterprise.eap.initTwoFactorVerificationHandle(keyId, requestToken));

      setRequestToken(requestToken);
      setShowLogin(false);
      setEmail(username);
    } catch (err) {
      setError('Error en el desafío MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = async () => {
    setIsLoading(true);
    setError(null);
    if (!requestToken) {
      throw new Error('Token no encontrado.');
    }

    verificationHandle.verifyAccount(pin).then(
      (verifyResponse: any) => {
        if (verifyResponse.isSuccess()) {
          // Handle success: Send the result of `verifyResponse.getVerdictToken()`
          // to the backend in order to determine if the code was valid.
          const verdictToken = verifyResponse.getVerdictToken();

      // Enviar `verdictToken` al backend para su validación adicional
      fetch('https://localhost:7073/v1/verify-verdict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verdictToken, emailAddress:email }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.isValid) {
            console.log("Código validado exitosamente en el backend.");
            // Lógica adicional de éxito: redirigir al usuario o mostrar un mensaje de éxito
            alert('!La verificación de PIN junto Backend se verifico satisfactoriamente¡')
          } else {
            console.log("Código inválido según la verificación del backend.");
            // Lógica en caso de código inválido: mostrar un mensaje de error al usuario
          }
        })
        .catch((backendError) => {
          setError('PIN incorrecto, intenta de nuevo.');
          console.error("Error al enviar el token al backend:", backendError);
          // Manejo de error: notificar al usuario sobre un problema en la verificación del token
        });
        } else {
          // Handle API failure
          setError('PIN incorrecto, intenta de nuevo.');
        }
        setIsLoading(false);
      },
      (error: any) => {
        // Handle other errors
        console.log(error);
        setError('Error en la verificación del PIN.');
        setIsLoading(false);
      }
    );
  };
  const handleBackToLogin = () => {
    setRequestToken(null);
    setShowLogin(true);
    setPin('');
    setError(null);
  }
  return (
    <div>
      {showLogin ? (
        <Login onChallenge={handleChallenge} />
      ) : (
        <div id={containerId} style={{ marginTop: '20px', display:'flex', justifyContent:'center' }}>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Ingrese el PIN recibido"
            style={{ padding: '10px', width: '200px' }}
          />
          <button className='btn-back-logo' onClick={verifyPin} disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Verificar PIN'}
          </button>
          <button  className='btn-back' onClick={handleBackToLogin} >
            <span className='center-back'>
          <span className='login-back'>
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.99226 16.4933C12.2637 16.4933 15.7894 12.9676 15.7894 8.70368C15.7894 4.43973 12.2562 0.914062 7.98472 0.914062C3.72077 0.914062 0.202637 4.43973 0.202637 8.70368C0.202637 12.9676 3.72831 16.4933 7.99226 16.4933ZM7.99226 14.9414C4.53439 14.9414 1.7696 12.1616 1.7696 8.70368C1.7696 5.24581 4.53439 2.47349 7.98472 2.47349C11.4426 2.47349 14.2224 5.24581 14.23 8.70368C14.2375 12.1616 11.4501 14.9414 7.99226 14.9414ZM4.10498 8.70368C4.10498 8.91462 4.18785 9.08036 4.35359 9.24609L6.90744 11.7623C7.03551 11.8828 7.18617 11.9506 7.36698 11.9506C7.72105 11.9506 7.97719 11.6794 7.97719 11.3253C7.97719 11.137 7.90186 10.9788 7.78132 10.8658L6.86223 9.99191L6.01848 9.3139L7.56285 9.3817H11.2392C11.6234 9.3817 11.8946 9.08789 11.8946 8.70368C11.8946 8.31194 11.6234 8.02567 11.2392 8.02567H7.56285L6.02602 8.101L6.86977 7.41546L7.78132 6.54157C7.89432 6.42857 7.97719 6.27037 7.97719 6.08203C7.97719 5.72796 7.72105 5.46429 7.36698 5.46429C7.18617 5.46429 7.03551 5.52455 6.90744 5.64509L4.35359 8.16881C4.18032 8.33454 4.10498 8.50028 4.10498 8.70368Z" fill="#ff4240"/>
</svg>
</span>Regresar al Login
</span>
          </button>
        </div>
      )}
      <div className='flex' style={{justifyContent:'center'}}>
      {error && <p style={{ color: 'red', justifySelf:'center' }}>{error}</p>}
      </div>
    </div>
  );
};

export default RecaptchaMFA;
