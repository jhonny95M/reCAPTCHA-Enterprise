# **Documentación de Implementación de reCAPTCHA Enterprise en GCP**

## **Objetivo**
Este documento detalla el proceso para crear e implementar **reCAPTCHA Enterprise** en Google Cloud Platform (GCP), con las configuraciones necesarias para que el servicio funcione con tu dominio. También cubre la creación de una cuenta de servicio y asignación de roles adecuados para gestionar reCAPTCHA Enterprise.

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
