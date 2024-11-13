# Documentación Técnica: Implementación de reCAPTCHA Enterprise con MFA en React

Esta guía proporciona un paso a paso detallado para implementar reCAPTCHA Enterprise con autenticación multifactor (MFA) en una aplicación React.

## Paso 1: Crear el Proyecto en React

Crear un nuevo proyecto React:

```tsx
npx create-react-app recaptcha-mfa-app
cd recaptcha-mfa-app
```

Instalar dependencias necesarias (si es necesario):

```tsx
npm install
```

## Paso 2: Configurar el Script de reCAPTCHA

Crear el componente principal `App.tsx`:

```tsx
import { useEffect } from 'react';
import './App.css';
import RecaptchaMFA from './MFAChallenge';

function App() {
  const siteKey = 'YOUR_SITE_KEY_HERE';

  useEffect(() => {
    const loadReCaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
      document.body.appendChild(script);
    };
    loadReCaptchaScript();
  }, [siteKey]);

  return (
    <div className="App">
      <h1 className='title-app'>Integración de <span className='app-recaptcha'>reCAPTCHA</span> y <span className='app-mfa'>MFA</span></h1>
      <RecaptchaMFA keyId={siteKey} />
    </div>
  );
}

export default App;
```

**Explicación**:
- `useEffect`: Se utiliza para cargar el script de reCAPTCHA cuando el componente se monta.
- `loadReCaptchaScript`: Función que crea y agrega el script de reCAPTCHA al documento.
- `siteKey`: Clave del sitio proporcionada por Google reCAPTCHA.

## Paso 3: Crear el Componente de Desafío MFA

Crear el componente `MFAChallenge.tsx`:

```tsx
import React, { useEffect, useState } from 'react';
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
  const [verificationHandle, setVerificationHandle] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState<string>(''); // solo para almacenarlo, se puede cambiar el flujo

  useEffect(() => {
    if (requestToken) {
      verificationHandle.challengeAccount().then((challengeResponse: any) => {
        if (challengeResponse.isSuccess()) {
          console.log("todo oka verificationHandle");
        } else {
          console.log('error...');
        }
      });
    }
  }, [requestToken]);

  const handleChallenge = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await (window as any).grecaptcha.enterprise.execute(keyId, { action: 'login', twofactor: true });
      const verifyCaptchaResponse = await fetch('https://localhost:7037/v1/VerifyReCaptchaByUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenReCaptcha: token, userName: username, password }),
      });
      const result = await verifyCaptchaResponse.json();
      const requestToken = result.response.accountVerification.endpoints[0].requestToken;
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
    if (!requestToken) throw new Error('Token no encontrado.');

    verificationHandle.verifyAccount(pin).then(
      (verifyResponse: any) => {
        if (verifyResponse.isSuccess()) {
          const verdictToken = verifyResponse.getVerdictToken();
          fetch('https://localhost:7073/v1/verify-verdict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verdictToken, emailAddress: email }),
          })
          .then((response) => response.json())
          .then((data) => {
            if (data.isValid) {
              console.log("Código validado exitosamente en el backend.");
              alert('¡La verificación de PIN junto Backend se verificó satisfactoriamente!');
            } else {
              console.log("Código inválido según la verificación del backend.");
            }
          })
          .catch((backendError) => {
            setError('PIN incorrecto, intenta de nuevo.');
            console.error("Error al enviar el token al backend:", backendError);
          });
        } else {
          setError('PIN incorrecto, intenta de nuevo.');
        }
        setIsLoading(false);
      },
      (error: any) => {
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
  };

  return (
    <div>
      {showLogin ? (
        <Login onChallenge={handleChallenge} />
      ) : (
        <div id={containerId} style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
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
          <button className='btn-back' onClick={handleBackToLogin}>
            <span className='center-back'>
              <span className='login-back'>
                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="..." fill="#ff4240" />
                </svg>
              </span>
              Regresar al Login
            </span>
          </button>
        </div>
      )}
      <div className='flex' style={{ justifyContent: 'center' }}>
        {error && <p style={{ color: 'red', justifySelf: 'center' }}>{error}</p>}
      </div>
    </div>
  );
};

export default RecaptchaMFA;
```

**Explicación**:
- `useEffect`: Monitorea cambios en `requestToken` y ejecuta el desafío de cuenta cuando `requestToken` está disponible.
- `handleChallenge`: Función que maneja el desafío MFA.
  - Ejecuta reCAPTCHA con `grecaptcha.enterprise.execute`.
  - Envía el token de reCAPTCHA al backend para verificación.
  - Extrae `requestToken` de la respuesta del backend y lo almacena en el estado.
- `verifyPin`: Función que verifica el PIN ingresado por el usuario.
  - Envía el `verdictToken` al backend para validación adicional.
  - Maneja la respuesta del backend y muestra mensajes de éxito o error.
- `handleBackToLogin`: Función que reinicia el estado para volver a la pantalla de login.

## Paso 4: Integrar el Componente en la Aplicación

Integrar el componente `RecaptchaMFA` en `App.tsx`:

```tsx
import { useEffect } from 'react';
import './App.css';
import RecaptchaMFA from './MFAChallenge';

function App() {
  const siteKey = 'YOUR_SITE_KEY_HERE';

  useEffect(() => {
    const loadReCaptchaScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
      document.body.appendChild(script);
    };
    loadReCaptchaScript();
  }, [siteKey]);

  return (
    <div className="App">
      <h1 className='title-app'>Integración de <span className='app-recaptcha'>reCAPTCHA</span> y <span className='app-mfa'>MFA</span></h1>
      <RecaptchaMFA keyId={siteKey} />
    </div>
  );
}

export default App;
```

**Explicación**:
- El componente `RecaptchaMFA` se integra en el componente principal `App`.
- Se pasa la `siteKey` como prop al componente `RecaptchaMFA`.

## Conclusión

Siguiendo estos pasos, puedes implementar reCAPTCHA Enterprise con autenticación multifactor (MFA) en una aplicación React. Esta integración proporciona una capa adicional de seguridad, ayudando a proteger la aplicación contra accesos no autorizados.

# Documentación Técnica: Implementación de reCAPTCHA Enterprise en una API con ASP.NET Core

Esta guía proporciona un paso a paso detallado para implementar reCAPTCHA Enterprise en una API utilizando ASP.NET Core. Está diseñada para que un programador con poca experiencia pueda entender y homologar el código en sus proyectos.

## Paso 1: Crear el Proyecto en ASP.NET Core

Abre una terminal y navega al directorio donde deseas crear tu proyecto.

Ejecuta el siguiente comando para crear un nuevo proyecto de API:

<tsx>
dotnet new webapi -o RecaptchaEnterpriseApi
cd RecaptchaEnterpriseApi
</tsx>

## Paso 2: Configurar Dependencias

Abre el archivo `RecaptchaEnterpriseApi.csproj` y asegúrate de que las siguientes dependencias estén presentes:

<tsx>
<ItemGroup>
  <PackageReference Include="Google.Cloud.RecaptchaEnterprise.V1" Version="1.3.0" />
  <PackageReference Include="Microsoft.Extensions.Configuration" Version="6.0.0" />
  <PackageReference Include="Microsoft.Extensions.Configuration.EnvironmentVariables" Version="6.0.0" />
</ItemGroup>
</tsx>

Ejecuta el siguiente comando para instalar las dependencias:

<tsx>
dotnet restore
</tsx>

## Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto y agrega la siguiente línea:

<tsx>
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
</tsx>

Reemplaza `path/to/your/credentials.json` con la ruta real a tu archivo de credenciales de Google.

## Paso 4: Configurar `appsettings.json`

Abre el archivo `appsettings.json` y agrega la configuración de reCAPTCHA:

<tsx>
{
  "RecaptchaSettings": {
    "ProjectId": "YOUR_PROJECT_ID",
    "SiteKey": "YOUR_SITE_KEY"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
</tsx>

Reemplaza los valores con los datos correspondientes a tu proyecto de reCAPTCHA.

## Paso 5: Configurar el Proyecto

Abre el archivo `Program.cs` y reemplázalo con el siguiente código:

<tsx>
using Google.Cloud.RecaptchaEnterprise.V1;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Configuración de reCAPTCHA desde el archivo de configuración
var recaptchaSettings = builder.Configuration.GetSection("RecaptchaSettings");
string projectId = recaptchaSettings["ProjectId"];
string siteKey = recaptchaSettings["SiteKey"];

builder.Services.AddControllers();
builder.Services.AddSingleton(new RecaptchaEnterpriseServiceClientBuilder { ProjectId = projectId }.Build());

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.MapPost("/verify-recaptcha", async (RecaptchaEnterpriseServiceClient recaptchaClient, string token) =>
{
    var eventToCheck = new Event { Token = token };
    var assessment = await recaptchaClient.CreateAssessmentAsync(new CreateAssessmentRequest
    {
        Assessment = new Assessment { Event = eventToCheck },
        ProjectName = new Google.Api.Gax.ResourceNames.ProjectName(projectId)
    });
    
    return assessment.TokenProperties.Valid ? Results.Ok("Verificación exitosa") : Results.BadRequest("Token inválido");
});

app.Run();
</tsx>

## Paso 6: Ejecutar la API

Ejecuta el siguiente comando para iniciar la API:

<tsx>
dotnet run
</tsx>

La API estará disponible en `https://localhost:5001` (o `http://localhost:5000` para HTTP).

## Conclusión

Siguiendo estos pasos, puedes implementar reCAPTCHA Enterprise en una API utilizando ASP.NET Core. Esta integración proporciona una capa adicional de seguridad, ayudando a proteger la aplicación contra accesos no autorizados.

