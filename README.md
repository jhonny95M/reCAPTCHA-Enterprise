# Documentación: Implementación MFA con reCAPTCHA Enterprise

Esta guía detalla cómo implementar un desafío de autenticación multifactor (MFA) utilizando reCAPTCHA Enterprise en una aplicación web. El objetivo es desafiar al usuario para realizar una verificación adicional en el caso de que la evaluación determine la necesidad de mayor seguridad.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de reCAPTCHA Enterprise](#configuración-de-recaptcha-enterprise)
   - [Crear el Proyecto en Google Cloud](#1-crear-el-proyecto-en-google-cloud)
   - [Configurar reCAPTCHA Enterprise](#2-configurar-recaptcha-enterprise)
   - [Integración del Script de reCAPTCHA Enterprise](#3-integración-del-script-de-recaptcha-enterprise)
   - [Visualización de la Cuota del Servicio](#4-visualización-de-la-cuota-del-servicio)
   - [Documentación Oficial del Servicio reCAPTCHA](#5-documentación-oficial-del-servicio-recaptcha)
   - [Configuración de la Autenticación de Varios Factores (MFA)](#6-configuración-de-la-autenticación-de-varios-factores-mfa)
   - [Configuración del Backend para la Verificación del Captcha](#7-configuración-del-backend-para-la-verificación-del-captcha)
3. [Implementación en React y C#](#implementación-en-react-y-c)
4. [Adaptación para Otros Lenguajes](#adaptación-para-otros-lenguajes)
5. [Recursos y Enlaces Útiles](#recursos-y-enlaces-útiles)
---

## Requisitos previos


### 1. Acceso a Google Cloud Platform
 con permisos para gestionar y configurar reCAPTCHA Enterprise.
### 2. Llaves de reCAPTCHA Enterprise
 obtenidas en el panel de configuración de reCAPTCHA Enterprise en Google Cloud.
### 3. Configuración en Google Cloud
Para configurar reCAPTCHA Enterprise en Google Cloud, sigue estos pasos formales y detallados:

1. ***Acceder al Servicio de Seguridad:***

- Ve al servicio de 'Seguridad' en Google Cloud a través del siguiente enlace: [Google Cloud Security](https://console.cloud.google.com/security/recaptcha?hl=es-419&project=unified-sensor-148719).
2. ***Navegar a reCAPTCHA:***

- En el menú de navegación, busca la opción 'reCAPTCHA' y selecciónala.
3. ***Crear una Clave de reCAPTCHA:***

- Selecciona el botón 'Crear clave'.
- Especifica un nombre para la clave y el dominio de la aplicación web. Para un entorno de desarrollo, se recomienda usar 'localhost'.
- Una vez creada la clave, se generará un 'ID' que se usará en la aplicación web.
4. ***Seguir los Pasos de Integración:***

- Después de crear la clave, se mostrará una pantalla con los pasos para la integración.
- Agregar reCAPTCHA al Sitio Web: Sigue el ejemplo proporcionado para agregar reCAPTCHA al sitio web.
- Verificar el Token de reCAPTCHA: Implementa la verificación del token en el backend.
- Revisar la Configuración: Asegúrate de revisar y verificar que todo esté configurado correctamente.
Para más detalles y documentación oficial del servicio reCAPTCHA, visita el siguiente enlace:
### 4. Creación de Cuenta de Servicio
Para configurar reCAPTCHA Enterprise en tu backend, es necesario crear una cuenta de servicio en Google Cloud. Sigue estos pasos:

1. **Crear una Cuenta de Servicio:**

- Accede a la consola de Google Cloud y navega a la sección de IAM & Admin.
- Selecciona Cuentas de servicio y haz clic en Crear cuenta de servicio.
2. **Paso 1: Nombre y ID de la Cuenta de Servicio:***

- Proporciona un nombre y un ID para la cuenta de servicio. Este paso es obligatorio.
3. **Paso 2: Asignar un Rol:**

- Asigna el rol de reCAPTCHA a la cuenta de servicio. Este paso es obligatorio.
4. **Paso 3: Opcional:**

- Este paso es opcional y puedes omitirlo si no necesitas configuraciones adicionales.
5. **Generar y Descargar la Clave:**

- Una vez creada la cuenta de servicio, aparecerán unos tabs en la parte superior.
- Selecciona la opción Claves.
- Haz clic en Agregar clave y selecciona Crear clave nueva en formato JSON.
- Descarga el archivo JSON, ya que se usará para la configuración en el backend.

[Configuración de reCAPTCHA en Google Cloud](https://console.cloud.google.com/security/recaptcha?hl=es-419&project=unified-sensor-148719)

## Configuración de reCAPTCHA Enterprise

### 1. Crear el Proyecto en Google Cloud
   - Accede a [Google Cloud Console](https://console.cloud.google.com/).
   - Crea un proyecto o selecciona uno existente.

### 2. Configurar reCAPTCHA Enterprise
   - En el menú de navegación, ve a **reCAPTCHA Enterprise**.
   - Configura un **sitio web** y obtén las claves necesarias:
     - **SITE_ID**: ID de la clave de reCAPTCHA configurada.
     - **Secret Key** (para el backend en caso de verificaciones).

### 3. Integración del Script de reCAPTCHA Enterprise
   Agrega el script de reCAPTCHA en el HTML de tu proyecto web. Este script habilita la capacidad de iniciar y verificar desafíos de MFA desde el frontend.

   ```html
   <!-- Archivo HTML principal de la aplicación -->
   <script src="https://www.recaptcha.net/recaptcha/enterprise.js" async defer></script>
   ```

### 4. Visualización de la Cuota del Servicio
   Para visualizar la cuota del servicio de reCAPTCHA Enterprise, accede al siguiente enlace:
   - [Cuota de reCAPTCHA Enterprise](https://console.cloud.google.com/apis/api/recaptchaenterprise.googleapis.com/quotas?hl=es&project=unified-sensor-148719)
   - [Precios de reCAPTCHA Enterprise](https://cloud.google.com/security/products/recaptcha?hl=es-419#pricing)

   En este enlace, podrás ver el uso actual y los límites de la cuota para tu proyecto en Google Cloud.

### 5. Documentación Oficial del Servicio reCAPTCHA
   Para más detalles y documentación oficial del servicio reCAPTCHA, visita el siguiente enlace:
   - [Documentación Oficial de reCAPTCHA](https://cloud.google.com/recaptcha-enterprise/docs)
   - [Flujo de reCAPTCHA](https://cloud.google.com/recaptcha/docs/overview?hl=es-419)
### 6. Configuración de la Autenticación de Varios Factores (MFA)

Para configurar la autenticación de varios factores (MFA) con reCAPTCHA Enterprise, sigue estos pasos:

1. **Requisitos Previos**:
   - La MFA está sujeta a las "Condiciones de las Ofertas de Fase Previa a la DG" y puede tener asistencia limitada.
   - La MFA está disponible solo para claves basadas en puntuaciones y no es compatible con los SDK de iOS y Android.
   - Existen cuotas estrictas para la MFA. Si necesitas aumentar los límites de cuota, comunícate con el equipo de asistencia de reCAPTCHA Enterprise.

2. **Flujo de Trabajo de la MFA**:
   - Instrumenta el flujo de trabajo fundamental en tu sitio web.
   - Crea una evaluación con el token generado y los parámetros de la MFA para obtener un `requestToken`.
   - Activa un desafío de MFA con el `requestToken` (solo se admite el correo electrónico).
   - Verifica el PIN ingresado por el usuario final en tu sitio web.
   - Crea una nueva evaluación con el token de verificación.

3. **Configuración en Google Cloud**:
   - En la consola de Google Cloud, ve a la página de reCAPTCHA Enterprise.
   - En el panel de Autenticación de Varios Factores, haz clic en Configurar.
   - Habilita la verificación por correo electrónico y proporciona el nombre y correo electrónico del remitente.
   - [Mas detalles](https://console.cloud.google.com/security/recaptcha/settings?hl=es-419&project=unified-sensor-148719)

4. **Implementación en tu Sitio Web**:
   - Agrega un parámetro `twofactor` a la función `execute()` de reCAPTCHA Enterprise.
   - Crea una evaluación con el token generado.
   - Activa un desafío de MFA con una llamada a `challengeAccount()`.
   - Verifica el PIN ingresado por el usuario final.

Para más detalles y documentación oficial del servicio reCAPTCHA, visita el siguiente enlace:
- [Configuración de la Autenticación de Varios Factores](https://cloud.google.com/recaptcha/docs/integrate-account-verification?hl=es-419)

### 7. Configuración del Backend para la Verificación del Captcha

Para configurar tu backend y verificar el captcha utilizando las bibliotecas cliente de reCAPTCHA Enterprise, sigue estos pasos:

1. **Instalación de Bibliotecas Cliente**:
   Las bibliotecas cliente de reCAPTCHA Enterprise facilitan el acceso a las APIs de Google Cloud mediante un lenguaje admitido. Puedes usar estas bibliotecas para reducir significativamente la cantidad de código que debes escribir.

   - **C#**:
     Para instalar la biblioteca cliente en un proyecto C#, usa el siguiente comando:
     ```bash
     dotnet add package Google.Cloud.RecaptchaEnterprise.V1
     ```

2. **Configuración del Backend**:
   Una vez instalada la biblioteca cliente, puedes configurar tu backend para verificar el captcha. Aquí tienes un ejemplo en C#:

   ```csharp
   using Google.Cloud.RecaptchaEnterprise.V1;
   using System;

   public class RecaptchaService
   {
       private readonly RecaptchaEnterpriseServiceClient _client;
       private readonly string _projectId;

       public RecaptchaService(string projectId)
       {
           _client = RecaptchaEnterpriseServiceClient.Create();
           _projectId = projectId;
       }

       public bool VerifyToken(string token)
       {
           var request = new AnnotateAssessmentRequest
           {
               Name = AssessmentName.FromProjectAssessment(_projectId, token),
               Annotation = AnnotateAssessmentRequest.Types.Annotation.Legitimate
           };

           var response = _client.AnnotateAssessment(request);
           return response.Annotation == AnnotateAssessmentRequest.Types.Annotation.Legitimate;
       }
   }
   ```
   Para más detalles sobre cómo usar las bibliotecas cliente de reCAPTCHA Enterprise, visita el siguiente enlace:

- [Bibliotecas Cliente de reCAPTCHA Enterprise](https://cloud.google.com/recaptcha/docs/libraries?hl=es-419#client-libraries-install-csharp)

### Implementación en React y C#
[Incluir detalles específicos sobre cómo implementar en React y C#, si es necesario.]

### Adaptación para Otros Lenguajes
[Incluir detalles sobre cómo adaptar la implementación para otros lenguajes de programación, si es necesario.]

### Recursos y Enlaces Útiles
- [Google Cloud Console](https://console.cloud.google.com/welcome?project=unified-sensor-148719)
- [Documentación de reCAPTCHA](https://cloud.google.com/recaptcha/docs?hl=es-419)
- [Precios de reCAPTCHA Enterprise](https://cloud.google.com/security/products/recaptcha?hl=es-419#pricing)

### Notas:

- Asegúrate de personalizar la sección de **Implementación en React y C#** y **Adaptación para Otros Lenguajes** según sea necesario para proporcionar instrucciones específicas.
- Revisa los enlaces y asegúrate de que estén actualizados y sean relevantes para tu g
