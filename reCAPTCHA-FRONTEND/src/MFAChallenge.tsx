// src/components/RecaptchaMFA.tsx

import React, { useCallback, useEffect, useState } from 'react';

interface RecaptchaMFAProps {
  keyId: string;
  containerId?: string;
}

const RecaptchaMFA: React.FC<RecaptchaMFAProps> = ({ keyId, containerId }) => {
  const [newToken, setNewToken] = useState<string | null>(null);
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationHandle, setVerificationHandle]= useState<any>(null)

  const initVerificationHandle = useCallback((keyId: string) => {
    return (window as any).grecaptcha.enterprise.eap.initTwoFactorVerificationHandle(keyId, newToken);
  }, [newToken]);
  useEffect(()=>{
    if(newToken){      
      // Call the challenge API.
verificationHandle.challengeAccount().then(
    (challengeResponse:any) => {
      if (challengeResponse.isSuccess()) {
       console.log("todo oka verificationHandle", challengeResponse.getVerdictToken())
      } else {
        console.log('error...')
      }
    });
}
  },[newToken])
  // Initialize verification handle.


  const handleChallenge = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const token = await (window as any).grecaptcha.enterprise.execute(keyId, 
            { action: 'login',twofactor:true });
    
          const verifyCaptchaResponse = await fetch('https://localhost:7037/verify-recaptcha', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });
    
          const result = await verifyCaptchaResponse.json();
          const requestToken = result.response.accountVerification.endpoints[0].requestToken;
          
    //   // Desafía al usuario con challengeAccount
    //   const response = await (window as any).grecaptcha.enterprise.challengeAccount(keyId, {
    //     'account-token': requestToken,
    //     // 'container': containerId,
    //   });
    setVerificationHandle((window as any).grecaptcha.enterprise.eap.initTwoFactorVerificationHandle(keyId, requestToken));

      setNewToken(requestToken);
    } catch (err) {
      setError('Error en el desafío MFA');
    } finally {
      setIsLoading(false);
    }
  };

const verifyPin = async () => {
    setIsLoading(true);
    setError(null);
    if (!newToken) {
        throw new Error('Token no encontrado.');
    }
    
    verificationHandle.verifyAccount(pin).then(
        (verifyResponse: any) => {
            if (verifyResponse.isSuccess()) {
                // Handle success: Send the result of `verifyResponse.getVerdictToken()`
                // to the backend in order to determine if the code was valid.
                console.log(verifyResponse);
                alert('¡MFA completado con éxito!');
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

  return (
    <div>
      <h2>Desafío MFA con reCAPTCHA</h2>
      <button onClick={handleChallenge} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Iniciar Desafío'}
      </button>

      {newToken && (
        <div id={containerId} style={{ marginTop: '20px' }}>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Ingrese el PIN recibido"
          />
          <button onClick={verifyPin} disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Verificar PIN'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default RecaptchaMFA;
