# **Documentación de Implementación de reCAPTCHA Enterprise en GCP**

## **Objetivo**
Este documento detalla el proceso para crear e implementar **reCAPTCHA Enterprise** en Google Cloud Platform (GCP), con las configuraciones necesarias para que el servicio funcione con tu dominio. También cubre la creación de una cuenta de servicio y asignación de roles adecuados para gestionar reCAPTCHA Enterprise.

---
## **Requisitos Previos**

Antes de comenzar con la implementación de reCAPTCHA Enterprise, asegúrate de cumplir con los siguientes requisitos previos:

1. **Cuenta de Google Cloud**: Debes tener una cuenta de Google Cloud con permisos suficientes para crear proyectos y gestionar recursos.
2. **Facturación habilitada**: Asegúrate de que la facturación esté habilitada en tu cuenta de Google Cloud, ya que algunos servicios requieren una cuenta de facturación activa.
3. **Acceso a la consola de Google Cloud**: Debes tener acceso a la consola de Google Cloud para realizar configuraciones y verificar el estado de los recursos.

--- 
## **1. Creación del Proyecto en GCP**

### **Paso 1: Crear un nuevo proyecto**
Primero, crearemos un proyecto en Google Cloud llamado `sop-izipay`. Este será el contenedor de todos los recursos relacionados con reCAPTCHA.

```bash
gcloud projects create sop-izipay --name="SOP Izipay"
```

- **Nombre del Proyecto**: `sop-izipay`
- **Descripción**: Nombre del proyecto que será utilizado para el servicio de reCAPTCHA.

### **Paso 2: Configurar el proyecto por defecto**

A continuación, configuraremos este proyecto recién creado como el proyecto predeterminado para usar con los comandos de `gcloud`.

```bash
gcloud config set project sop-izipay
```

---

## **2. Habilitar la API de reCAPTCHA Enterprise**

### **Paso 1: Habilitar el servicio de reCAPTCHA Enterprise**
El siguiente paso es habilitar la API de reCAPTCHA Enterprise en el proyecto.

```bash
gcloud services enable recaptchaenterprise.googleapis.com --project=sop-izipay
```

---

## **3. Crear una Cuenta de Servicio para Gestionar reCAPTCHA**

### **Paso 1: Crear la cuenta de servicio**

La cuenta de servicio es necesaria para gestionar la API de reCAPTCHA Enterprise desde tu proyecto. Usaremos esta cuenta para autorizar la creación de claves de reCAPTCHA y para ejecutar otras operaciones.

```bash
gcloud iam service-accounts create recaptcha-service-account \
    --display-name="reCAPTCHA Service Account" \
    --project=sop-izipay
```

Este comando crea una cuenta de servicio llamada `recaptcha-service-account`.

### **Paso 2: Asignar roles adecuados a la cuenta de servicio**

Asignaremos roles a la cuenta de servicio para asegurarnos de que tenga los permisos necesarios para interactuar con la API de reCAPTCHA Enterprise.

#### Asignación de rol de `recaptchaenterprise.admin`

```bash
gcloud projects add-iam-policy-binding sop-izipay \
    --member="serviceAccount:recaptcha-service-account@sop-izipay.iam.gserviceaccount.com" \
    --role="roles/recaptchaenterprise.admin"
```

#### Asignación de rol de `recaptchaenterprise.agent`

```bash
gcloud projects add-iam-policy-binding sop-izipay \
    --member="serviceAccount:recaptcha-service-account@sop-izipay.iam.gserviceaccount.com" \
    --role="roles/recaptchaenterprise.agent"
```

- **roles/recaptchaenterprise.admin**: Permite la gestión total de recursos de reCAPTCHA.
- **roles/recaptchaenterprise.agent**: Permite acceder a los datos de reCAPTCHA, pero no modificarlos.

### **Paso 3: Verificar roles asignados**

Verifica que los roles se hayan asignado correctamente:

```bash
gcloud projects get-iam-policy sop-izipay \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:recaptcha-service-account@sop-izipay.iam.gserviceaccount.com"
```

---

## **4. Crear y Descargar Clave para la Cuenta de Servicio**

### **Paso 1: Crear una clave para la cuenta de servicio**

Para interactuar programáticamente con la API de reCAPTCHA Enterprise, es necesario generar una clave de autenticación para la cuenta de servicio creada.

```bash
gcloud iam service-accounts keys create ~/Downloads/recaptcha-service-account-key.json \
    --iam-account=recaptcha-service-account@sop-izipay.iam.gserviceaccount.com \
    --project=sop-izipay
```

Este comando descarga un archivo JSON con las credenciales necesarias para autenticar tu cuenta de servicio.

### **Paso 2: Verificar que la clave fue descargada correctamente**

Ve a la carpeta `Downloads` y verifica el archivo `recaptcha-service-account-key.json`:

```bash
cd Downloads/
cat recaptcha-service-account-key.json
cd ..
```

---

## **5. Crear una Clave de reCAPTCHA para el Proyecto**

### **Paso 1: Crear la clave de reCAPTCHA**

Ahora que hemos configurado el proyecto y la cuenta de servicio, el siguiente paso es crear una clave de reCAPTCHA para tu sitio web. Aquí utilizamos el tipo de integración `score`, que no muestra desafíos, pero analiza el riesgo de la solicitud.

```bash
gcloud recaptcha keys create --display-name="reCAPTCHA Key for Izipay" \
    --web --domains=demo.izipay.pe,localhost --integration-type=score \
    --project=sop-izipay
```

- **--domains=demo.izipay.pe,localhost**: Asegúrate de incluir todos los dominios que utilizarán reCAPTCHA (en este caso `demo.izipay.pe` y `localhost`).
- **--integration-type=score**: Define el tipo de integración, en este caso `score`, que evalúa el riesgo sin mostrar un desafío.

### **Paso 2: Verificar la clave creada**

Puedes verificar que la clave fue creada correctamente a través de la consola de Google Cloud o utilizando el siguiente comando para listar las claves:

```bash
gcloud recaptcha keys list --project=sop-izipay
```
## **6. Configuración de MFA en reCAPTCHA Enterprise**

### **Preparación**

1. Asegúrate de haber configurado **reCAPTCHA Enterprise** en tu proyecto de Google Cloud.

### **Verificación del Dominio del Remitente**

Para utilizar un dominio personalizado como remitente en la autenticación de varios factores (MFA), es necesario verificar el dominio en **Google Search Console**. Sigue estos pasos:

1. **Accede a Google Search Console**:
   - Ve a [Google Search Console](https://search.google.com/search-console) e inicia sesión con la cuenta de Google asociada a tu proyecto.

2. **Agregar el Dominio**:
   - En la página de inicio de Search Console, haz clic en **Agregar propiedad**.
   - Selecciona **Dominio** e ingresa el dominio completo (sin subdominios específicos), por ejemplo, `izipay.pe`.
   - Haz clic en **Continuar**.

3. **Verificar la Propiedad del Dominio**:
   - Selecciona la opción de **Registro DNS** y copia el código proporcionado (tipo `TXT`).
   - Accede a la configuración de DNS de tu dominio en tu proveedor (GoDaddy, Cloudflare, etc.).
   - Agrega un nuevo registro de tipo `TXT` con el código proporcionado en Google Search Console y guarda los cambios.

4. **Confirmar la Verificación en Google Search Console**:
   - En Search Console, haz clic en **Verificar**. La verificación puede tardar unos minutos o hasta 24 horas, según tu proveedor de DNS.
   - Una vez verificado, recibirás una confirmación de éxito.

5. **Finalizar la Configuración en reCAPTCHA Enterprise**:
   - Una vez verificado el dominio, continúa con los pasos de [Activación de la MFA en reCAPTCHA Enterprise](#activación-de-la-mfa-en-recaptcha-enterprise) para completar la configuración en la consola de Google Cloud.

### **Activación de la MFA en reCAPTCHA Enterprise**

1. Accede a la **Consola de Google Cloud** y dirígete a la página de **reCAPTCHA Enterprise**.
2. Selecciona tu proyecto.
3. Haz clic en **Configuración** (settings) y luego en **Autenticación de varios factores**.
4. En el cuadro de diálogo de configuración de MFA, habilita la opción de **verificación por correo electrónico**.
5. Introduce el **Nombre del remitente** y el **Correo electrónico del remitente** que se usará para enviar los códigos de verificación.

Con estos pasos, habrás configurado correctamente la autenticación de varios factores (MFA) en reCAPTCHA Enterprise, incluyendo la verificación del dominio del remitente en Google Search Console.
---
---

## **6. Buenas Prácticas**

A continuación, se detallan algunas buenas prácticas al trabajar con reCAPTCHA Enterprise en GCP:

1. **Control de acceso**:
   - Asegúrate de asignar roles mínimos necesarios a las cuentas de servicio para evitar el exceso de permisos.
   - Usa la cuenta de servicio exclusivamente para tareas relacionadas con reCAPTCHA Enterprise.

2. **Seguridad**:
   - **Protege las claves JSON**: Mantén el archivo de clave de la cuenta de servicio de forma segura. No lo compartas públicamente ni lo subas a repositorios.
   - Usa variables de entorno o secretos gestionados por herramientas de CI/CD para mantener las credenciales seguras.

3. **Monitoreo y Logs**:
   - Habilita la recopilación de logs para auditar las interacciones con la API de reCAPTCHA Enterprise. Esto te ayudará a identificar posibles problemas o uso no autorizado.

4. **Desarrollo y Pruebas**:
   - Utiliza dominios de prueba y ambientes controlados antes de desplegar a producción.
   - Configura un **entorno de pruebas** para evaluar la precisión y la efectividad de reCAPTCHA antes de su implementación final.


---

## **Resumen**

Este documento cubre todo el proceso de creación e implementación de **reCAPTCHA Enterprise** en un proyecto de Google Cloud Platform. Desde la creación del proyecto hasta la creación de una cuenta de servicio, asignación de roles, generación de claves y configuración de reCAPTCHA, se ha proporcionado una guía detallada para asegurar una implementación exitosa y segura.
