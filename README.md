# 🛍️ E-commerce Backend API

<div align="center">

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

**API RESTful completa para e-commerce con integración de pagos Wompi**

[🚀 Inicio Rápido](#-inicio-rápido) • [📚 Documentación](#-documentación-interactiva) • [🏗️ Arquitectura](#️-arquitectura) • [💳 Flujo de Pago](#-flujo-completo-de-pago-con-wompi)

</div>

---

## 🌐 API en Producción

🚀 **URL Base:** [https://nest-back.testbydevelopment.space/api/v1](https://nest-back.testbydevelopment.space/api/v1)

📚 **Documentación Interactiva:**
- **Scalar UI:** [https://nest-back.testbydevelopment.space/api/reference](https://nest-back.testbydevelopment.space/api/reference)
- **Swagger:** [https://nest-back.testbydevelopment.space/api/docs](https://nest-back.testbydevelopment.space/api/docs)

📡 **Endpoints Principales:**
- Productos: `GET /api/v1/products`
- Clientes: `GET /api/v1/customers`
- Pagos: `POST /api/v1/payments/process`
- Info de tokenización: `POST /api/v1/payments/tokenize` (⚠️ La tokenización se hace desde el frontend)

---

## ✨ Características

- ✅ **CRUD Completo** de Productos, Clientes, Transacciones y Entregas
- 💳 **Integración con Wompi** para procesar pagos con tarjetas (tokenización segura desde frontend)
- 🔄 **Sistema de Reintentos Inteligente** con backoff exponencial para verificación de pagos
- 📦 **Gestión Automática de Inventario** - descuento de stock cuando un pago es aprobado
- 🚚 **Creación Automática de Entregas** cuando un pago es aprobado
- 📖 **Documentación Automática** con Swagger y Scalar UI
- 🐳 **Docker Ready** con PostgreSQL incluido
- 🏗️ **Arquitectura Hexagonal** (Clean Architecture)
---

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado) 🐳

```bash
# 1. Clonar el repositorio
git clone <tu-repo>
cd backend

# 2. Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env con tus credenciales de Wompi

# 3. Levantar los contenedores
docker-compose up -d

# 4. Ver los logs
docker-compose logs -f nestjs

# ✅ La API estará disponible en http://localhost:3000/api/v1
```

### Opción 2: Desarrollo Local 💻

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita el archivo .env

# 3. Levantar PostgreSQL (o usa Docker)
docker-compose up -d postgres

# 4. Iniciar la aplicación
npm run start:dev

# ✅ La API estará disponible en http://localhost:3000/api/v1
```

---

## 📚 Documentación Interactiva

Una vez que la API esté corriendo, accede a la documentación:

| Interfaz | URL | Descripción |
|----------|-----|-------------|
| 🎨 **Scalar** | http://localhost:3000/api/reference | Interfaz moderna y elegante |
| 📄 **Swagger** | http://localhost:3000/api/docs | Interfaz clásica de OpenAPI |

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           NestJS + TypeScript           │
├─────────────────────────────────────────┤
│  TypeORM + PostgreSQL (Prod)            │
│  Class Validator + Class Transformer    │
│  Axios (Wompi Integration)              │
│  Swagger + Scalar (Docs)                │
└─────────────────────────────────────────┘
```

### Arquitectura Hexagonal

```
src/
├── modules/
│   ├── products/
│   │   ├── domain/              # 🎯 Entidades, Value Objects, Interfaces
│   │   ├── application/         # 💼 Use Cases (Lógica de negocio)
│   │   │   ├── use-cases/
│   │   │   ├── dtos/
│   │   │   └── services/
│   │   └── infrastructure/      # 🔌 Controllers, Repositories, DB
│   │       ├── controllers/
│   │       └── persistence/
│   │
│   ├── customers/               # 👥 Gestión de clientes
│   ├── transactions/            # 💰 Transacciones de pago
│   ├── payments/                # 💳 Integración con Wompi
│   └── deliveries/              # 📦 Sistema de entregas
│
├── shared/                      # 🛠️ Utilidades compartidas
│   ├── domain/
│   │   └── result.ts           # Patrón Result para manejo de errores
│   └── infrastructure/
│       └── filters/            # Filtros globales de excepciones
│
└── config/                      # ⚙️ Configuración
    ├── app.config.ts
    ├── database.config.ts
    └── wompi.config.ts
```

**Beneficios de esta arquitectura:**
- 🔄 Fácil de testear (mocking de repositorios)
- 🔌 Desacoplada de frameworks externos
- 📈 Escalable y mantenible
- 🎯 Lógica de negocio en el dominio

---

## 💳 Flujo Completo de Pago con Wompi

### Diagrama de Secuencia

```
┌──────────┐      ┌─────────┐      ┌────────────┐      ┌───────┐
│ Frontend │      │   API   │      │ Wompi API  │      │  DB   │
└────┬─────┘      └────┬────┘      └─────┬──────┘      └───┬───┘
     │                 │                  │                 │
     │ 1. Tokenizar tarjeta DIRECTAMENTE desde Frontend    │
     │                 │                  │                 │
     │ POST https://production.wompi.co/v1/tokens/cards    │
     ├──────────────────────────────────>│                 │
     │                 │                  │                 │
     │<───────────────────────────────────┤                 │
     │ {token: "tok_prod_xxx"}            │                 │
     │                 │                  │                 │
     │ 2. POST /payments/process          │                 │
     │    (con card token generado)       │                 │
     ├────────────────>│                  │                 │
     │                 │                  │                 │
     │                 │ Obtener acceptance token           │
     │                 ├─────────────────>│                 │
     │                 │<─────────────────┤                 │
     │                 │                  │                 │
     │                 │ Crear Transaction│                 │
     │                 ├─────────────────────────────────> │
     │                 │                  │                 │
     │                 │ Crear pago en Wompi                │
     │                 │ (con acceptance + card token)      │
     │                 ├─────────────────>│                 │
     │                 │<─────────────────┤                 │
     │                 │ {id, status}     │                 │
     │                 │                  │                 │
     │                 │ 🔄 Verificar estado (max 5 intentos)│
     │                 │ ⏱️  2s → 4s → 8s → 16s → 32s      │
     │                 ├─────────────────>│                 │
     │                 │ GET /status      │                 │
     │                 │<─────────────────┤                 │
     │                 │ {status: APPROVED}                 │
     │                 │                  │                 │
     │                 │ Actualizar Transaction             │
     │                 ├─────────────────────────────────> │
     │                 │                  │                 │
     │                 │ ✅ Si APPROVED:  │                 │
     │                 │ Crear Delivery   │                 │
     │                 ├─────────────────────────────────> │
     │                 │                  │                 │
     │<────────────────┤                  │                 │
     │  {transaction, delivery, status}   │                 │
     │                 │                  │                 │

⚠️  IMPORTANTE: La tokenización de tarjetas se hace DIRECTAMENTE desde el frontend
    llamando a la API de Wompi. NUNCA envíes datos de tarjeta al backend.
```

### Paso a Paso Detallado

#### 💳 **Paso 1: Tokenizar Tarjeta (DESDE EL FRONTEND)**

> ⚠️ **IMPORTANTE:** La tokenización de tarjetas debe hacerse **DIRECTAMENTE desde el frontend** llamando a la API de Wompi. **NUNCA envíes datos de tarjeta al backend** por razones de seguridad y cumplimiento PCI DSS.

**Desde el frontend (JavaScript/React/Vue/etc):**

```javascript
// Se obtiene la clave pública desde las variables de entorno
const wompiPublicKey = process.env.WOMPI_PUBLIC_KEY;
const tokenizationUrl = 'https://production.wompi.co/v1/tokens/cards';

// Se tokeniza la tarjeta DIRECTAMENTE con Wompi desde el frontend
const tokenResponse = await fetch(tokenizationUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${wompiPublicKey}`
  },
  body: JSON.stringify({
    number: '4242424242424242',
    cvc: '123',
    exp_month: '12',
    exp_year: '28',
    card_holder: 'Juan Perez'
  })
});

const tokenData = await tokenResponse.json();
console.log('Token generado:', tokenData.data.id);
```

**Respuesta de Wompi:**
```json
{
  "status": "CREATED",
  "data": {
    "id": "tok_prod_22907_4e4ffcC38Cc4ef4ccacC83C384Cf3C44",
    "created_at": "2024-01-10T12:00:00.000Z",
    "brand": "VISA",
    "name": "VISA-4242",
    "last_four": "4242",
    "bin": "424242",
    "exp_year": "28",
    "exp_month": "12",
    "card_holder": "Juan Perez",
    "expires_at": "2024-01-10T12:15:00.000Z"
  }
}
```

> **Nota:**
> - Este token expira en 15 minutos, úsalo inmediatamente en el siguiente paso
> - Los datos de la tarjeta **NUNCA** pasan por tu backend
> - Solo el token generado se enviará a tu backend para procesar el pago

#### 🚀 **Paso 2: Procesar el Pago (DESDE TU BACKEND)**

Ahora el frontend envía el **token generado** (NO los datos de tarjeta) a tu backend junto con los datos del pago. **El endpoint `/payments/process` hace todo automáticamente:**
- ✅ Obtiene el acceptance token de Wompi
- ✅ Crea la transacción en Wompi usando el token
- ✅ Verifica el estado con reintentos automáticos
- ✅ Actualiza la transacción en la BD
- ✅ Crea la entrega si el pago es aprobado

**Desde el frontend:**

```javascript
// Se procesa el pago enviando SOLO el token (no los datos de tarjeta)
const paymentResponse = await fetch('http://localhost:3000/api/v1/payments/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerId: '312ba225-0ed6-4cab-93a1-d182ee95e8a4',
    amountInCents: 50000,
    currency: 'COP',
    customerEmail: 'juan@example.com',
    customerFullName: 'Juan Perez',
    customerPhoneNumber: '+573001234567',
    paymentMethod: {
      type: 'CARD',
      token: tokenData.data.id, // Token generado en el paso 1
      installments: 1
    },
    shippingAddress: {
      addressLine1: 'Calle 123 #45-67',
      city: 'Bogotá',
      region: 'Cundinamarca',
      country: 'CO',
      phoneNumber: '+573001234567'
    },
    products: [
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2
      },
      {
        productId: '660e8400-e29b-41d4-a716-446655440001',
        quantity: 1
      }
    ]
  })
});

const result = await paymentResponse.json();
```

> **Importante:**
> - Solo se envía el **token**, NO los datos de la tarjeta
> - NO es necesario enviar el `acceptanceToken` manualmente, el backend lo obtiene automáticamente
> - Se debe incluir el array `products` con los productos a comprar. El stock se descuenta automáticamente cuando el pago es aprobado

**Respuesta Exitosa:**
```json
{
  "success": true,
  "transaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "reference": "TXN-1704834567890",
    "status": "APPROVED",
    "amountInCents": 50000,
    "currency": "COP",
    "wompiTransactionId": "1234-1668097329-99999",
    "customerId": "customer-123",
    "customerEmail": "juan@example.com"
  },
  "delivery": {
    "id": "delivery-123",
    "status": "PENDING",
    "trackingNumber": null,
    "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z"
  },
  "message": "Pago procesado exitosamente. Entrega creada automáticamente."
}
```

**Proceso interno del endpoint `/payments/process`:**

1. 🎫 Se obtiene automáticamente el acceptance token de Wompi
2. 💾 Se crea la transacción en la base de datos local
3. 💳 Se envía el pago a Wompi con el acceptance token y el card token
4. 🔄 Sistema de reintentos automático para verificar el estado:
   - Intento 1: Espera 2 segundos → Consulta estado en Wompi
   - Intento 2: Espera 4 segundos → Consulta estado en Wompi
   - Intento 3: Espera 8 segundos → Consulta estado en Wompi
   - Intento 4: Espera 16 segundos → Consulta estado en Wompi
   - Intento 5: Espera 32 segundos → Consulta estado en Wompi
5. ✅ Se actualiza el estado de la transacción en la BD
6. 📦 Si el pago es APROBADO:
   - Se descuenta el stock de los productos comprados automáticamente
   - Se crea automáticamente una entrega
7. 📧 Se retorna la transacción con el delivery y el estado final

> **Nota:** Todo este flujo sucede en una sola llamada al endpoint.

#### 🔍 **Paso 3: Consultar Estado de Transacción (Opcional)**

```bash
GET http://localhost:3000/api/v1/transactions/550e8400-e29b-41d4-a716-446655440000
```

**Respuesta:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "reference": "TXN-1704834567890",
  "status": "APPROVED",
  "amountInCents": 50000,
  "currency": "COP",
  "wompiTransactionId": "1234-1668097329-99999",
  "redirectUrl": "https://sandbox.wompi.co/v1/payment-links/xxxxx",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:32.000Z"
}
```

---

## 📡 Endpoints de la API

### 🛍️ Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/products` | Listar todos los productos |
| `GET` | `/api/v1/products/:id` | Obtener producto por ID |
| `POST` | `/api/v1/products` | Crear nuevo producto |
| `PATCH` | `/api/v1/products/:id` | Actualizar producto |

**Ejemplo:**
```bash
POST /api/v1/products
{
  "name": "Camiseta Nike",
  "description": "Camiseta deportiva de algodón",
  "imgUrl": "https://example.com/shirt.jpg",
  "price": 59.99,
  "stock": 100
}
```

### 👥 Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/customers` | Listar todos los clientes |
| `GET` | `/api/v1/customers/:id` | Obtener cliente por ID |
| `POST` | `/api/v1/customers` | Crear nuevo cliente |
| `PUT` | `/api/v1/customers/:id` | Actualizar cliente |
| `DELETE` | `/api/v1/customers/:id` | Eliminar cliente |

**Ejemplo:**
```bash
POST /api/v1/customers
{
  "email": "juan@example.com",
  "fullName": "Juan Pérez",
  "phone": "+573001234567",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "country": "Colombia",
  "postalCode": "110111"
}
```

### 💰 Transacciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/transactions/:id` | Obtener transacción por ID |
| `PATCH` | `/api/v1/transactions/:reference` | Actualizar estado de transacción |

### 💳 Pagos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/payments/tokenize` | ⚠️ **Obtener info para tokenizar** (la tokenización se hace desde el frontend directamente con Wompi) |
| `POST` | `/api/v1/payments/process` | Procesar pago completo con token (obtiene acceptance, crea pago, verifica estado, crea delivery) |
| `GET` | `/api/v1/payments/status/:wompiTransactionId` | Verificar estado de pago con Wompi |
| `GET` | `/api/v1/payments/acceptance-token` | Obtener token de aceptación de Wompi |

> ⚠️ **IMPORTANTE:** La tokenización de tarjetas debe hacerse **desde el frontend** llamando directamente a la API de Wompi. Ver [Paso 1](#-paso-1-tokenizar-tarjeta-desde-el-frontend) para más detalles.

### 📦 Entregas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/v1/deliveries` | Crear nueva entrega |
| `GET` | `/api/v1/deliveries/:id` | Obtener entrega por ID |
| `GET` | `/api/v1/deliveries/transaction/:transactionId` | Obtener entrega por transacción |

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# ============================================
# DOCKER ENVIRONMENT CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
BASE_URL=http://localhost:3000

# ============================================
# DATABASE (PostgreSQL en Docker)
# ============================================
DB_TYPE=postgres
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce_db
DB_SYNCHRONIZE=true
DB_LOGGING=false

# ============================================
# WOMPI API (Sandbox)
# ============================================
WOMPI_BASE_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_stagtest_xxxxx
WOMPI_PRIVATE_KEY=prv_stagtest_xxxxx
WOMPI_EVENTS_KEY=stagtest_events_xxxxx
WOMPI_INTEGRITY_KEY=stagtest_integrity_xxxxx

# ============================================
# BUSINESS CONFIGURATION
# ============================================
BASE_FEE=1000
DELIVERY_FEE=5000
```

---

## 🐳 Docker

### Arquitectura de Contenedores

```
┌─────────────────────────────────────┐
│     Docker Compose                  │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   NestJS     │  │ PostgreSQL  │ │
│  │   App        │──│   DB        │ │
│  │ Port: 3000   │  │ Port: 5432  │ │
│  └──────────────┘  └─────────────┘ │
│                                     │
│  Network: app-network               │
│  Volume: postgres_data              │
└─────────────────────────────────────┘
```

### Comandos Docker Esenciales

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f nestjs

# Reconstruir después de cambios en el código
docker-compose up -d --build

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (limpia la BD)
docker-compose down -v

# Acceder al contenedor de la app
docker-compose exec nestjs sh

# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d ecommerce_db

# Ver estado de los contenedores
docker-compose ps

# Reiniciar solo la app
docker-compose restart nestjs
```

### Health Checks

Los contenedores incluyen verificaciones de salud:

- **PostgreSQL**: Verifica cada 10s que acepte conexiones
- **NestJS**: Verifica cada 30s que responda en `/api/v1`

```bash
# Ver el estado de salud
docker-compose ps
```

---

## 🧪 Testing

El proyecto incluye **70+ tests unitarios** con cobertura completa.

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e
```

### Estructura de Tests

```
src/
└── modules/
    ├── products/
    │   └── application/use-cases/
    │       ├── create-product.use-case.spec.ts
    │       ├── get-product-by-id.use-case.spec.ts
    │       ├── get-all-products.use-case.spec.ts
    │       └── update-product.use-case.spec.ts
    ├── customers/
    │   ├── application/use-cases/*.spec.ts
    │   └── domain/value-objects/*.spec.ts
    ├── transactions/
    │   └── application/use-cases/*.spec.ts
    └── deliveries/
        └── application/use-cases/*.spec.ts
```

**Resultado esperado:**
```
Test Suites: 13 passed, 13 total
Tests:       70 passed, 70 total
Snapshots:   0 total
Time:        4.194 s
```

---

## 🛠️ Scripts de Desarrollo

```bash
# Desarrollo
npm run start:dev          # Modo desarrollo con hot-reload
npm run start:debug        # Modo debug

# Producción
npm run build              # Compilar TypeScript
npm run start:prod         # Ejecutar versión compilada

# Calidad de Código
npm run lint               # Ejecutar ESLint
npm run format             # Formatear con Prettier
npm test                   # Ejecutar tests
npm run test:cov           # Tests con cobertura
```

---

## 📊 Modelo de Datos

### Diagrama de Entidades

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│  Customer   │         │   Transaction   │         │  Delivery   │
├─────────────┤         ├─────────────────┤         ├─────────────┤
│ id          │────┐    │ id              │    ┌────│ id          │
│ email       │    │    │ customerId      │    │    │ transactionId│
│ fullName    │    └───→│ customerEmail   │←───┘    │ customerName│
│ phone       │         │ amountInCents   │         │ address     │
│ address     │         │ currency        │         │ status      │
│ city        │         │ status          │         │ trackingNo  │
│ country     │         │ reference       │         │ estimatedAt │
│ postalCode  │         │ wompiTxnId      │         │ deliveredAt │
│ createdAt   │         │ redirectUrl     │         │ createdAt   │
│ updatedAt   │         │ createdAt       │         │ updatedAt   │
└─────────────┘         │ updatedAt       │         └─────────────┘
                        └─────────────────┘

┌─────────────┐
│   Product   │
├─────────────┤
│ id          │
│ name        │
│ description │
│ imgUrl      │
│ price       │
│ stock       │
│ createdAt   │
│ updatedAt   │
└─────────────┘
```

### Estados de Transacción

```typescript
enum TransactionStatus {
  PENDING = 'PENDING',        // Pago iniciado
  APPROVED = 'APPROVED',      // Pago aprobado ✅
  DECLINED = 'DECLINED',      // Pago rechazado ❌
  VOIDED = 'VOIDED',         // Pago anulado
  ERROR = 'ERROR'            // Error en el proceso
}
```


---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verifica que PostgreSQL esté corriendo
docker-compose ps

# Revisa los logs de PostgreSQL
docker-compose logs postgres

# Reinicia PostgreSQL
docker-compose restart postgres
```

### Error: "Port 3000 already in use"

```bash
# Encuentra el proceso usando el puerto
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Cambia el puerto en .env
PORT=3001
```

### Tests Fallan

```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install

# Limpia caché de Jest
npm test -- --clearCache
```

---

## 📝 Patrón Result

El proyecto usa el patrón **Result** para manejo de errores funcional sin excepciones:

```typescript
// En los Use Cases
const result = await createProductUseCase.execute(dto);

// En los Controllers
return result.match(
  (product) => product,           // Success
  (error) => { throw error; }     // Failure
);
```

**Beneficios:**
- ✅ Errores explícitos en el tipo de retorno
- ✅ No hay excepciones ocultas
- ✅ Fácil de testear
- ✅ Composición de operaciones

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

## 📚 Recursos Adicionales

- 📖 [Documentación de NestJS](https://docs.nestjs.com/)
- 🗄️ [Documentación de TypeORM](https://typeorm.io/)
- 💳 [API de Wompi](https://docs.wompi.co/)
- 🐳 [Documentación de Docker](https://docs.docker.com/)
- 🏗️ [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<div align="center">

**Hecho con ❤️ usando NestJS y TypeScript**

⭐ Si este proyecto te fue útil, considera darle una estrella

</div>
