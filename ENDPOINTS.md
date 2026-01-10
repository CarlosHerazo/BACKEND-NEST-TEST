# 📡 API Endpoints - E-commerce Backend

**Base URL:** `https://nest-back.testbydevelopment.space/api/v1`

---

## 🛍️ Productos

### `GET /products`
Lista todos los productos.

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Camiseta Nike",
    "description": "Camiseta deportiva de algodón premium",
    "imgUrl": "https://example.com/shirt.jpg",
    "price": 59.99,
    "stock": 100,
    "category": "Clothing",
    "rating": 4.8,
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:00.000Z"
  }
]
```

### `GET /products/:id`
Obtiene un producto por ID.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Nike",
  "description": "Camiseta deportiva de algodón premium",
  "imgUrl": "https://example.com/shirt.jpg",
  "price": 59.99,
  "stock": 100,
  "category": "Clothing",
  "rating": 4.8,
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

### `POST /products`
Crea un nuevo producto.

**Request:**
```json
{
  "name": "Camiseta Nike",
  "description": "Camiseta deportiva de algodón premium",
  "imgUrl": "https://example.com/shirt.jpg",
  "price": 59.99,
  "stock": 100,
  "category": "Clothing",
  "rating": 4.8
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Nike",
  "description": "Camiseta deportiva de algodón premium",
  "imgUrl": "https://example.com/shirt.jpg",
  "price": 59.99,
  "stock": 100,
  "category": "Clothing",
  "rating": 4.8,
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

### `PATCH /products/:id`
Actualiza un producto (todos los campos son opcionales).

**Request:**
```json
{
  "price": 49.99,
  "stock": 150,
  "rating": 4.9
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Nike",
  "description": "Camiseta deportiva de algodón premium",
  "imgUrl": "https://example.com/shirt.jpg",
  "price": 49.99,
  "stock": 150,
  "category": "Clothing",
  "rating": 4.9,
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T14:30:00.000Z"
}
```

---

## 👥 Clientes

### `GET /customers`
Lista todos los clientes (o filtra por email con query param `?email=`).

**Response:**
```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "email": "juan@example.com",
    "fullName": "Juan Pérez",
    "phone": "+573001234567",
    "address": "Calle 123 #45-67",
    "city": "Bogotá",
    "country": "Colombia",
    "postalCode": "110111",
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-10T10:00:00.000Z"
  }
]
```

### `GET /customers/:id`
Obtiene un cliente por ID.

**Response:**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "email": "juan@example.com",
  "fullName": "Juan Pérez",
  "phone": "+573001234567",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "country": "Colombia",
  "postalCode": "110111",
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T10:00:00.000Z"
}
```

### `POST /customers`
Crea un nuevo cliente.

**Request:**
```json
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

**Response:**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "email": "juan@example.com",
  "fullName": "Juan Pérez",
  "phone": "+573001234567",
  "address": "Calle 123 #45-67",
  "city": "Bogotá",
  "country": "Colombia",
  "postalCode": "110111",
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T10:00:00.000Z"
}
```

### `PUT /customers/:id`
Actualiza un cliente (todos los campos son opcionales).

**Request:**
```json
{
  "phone": "+573009876543",
  "address": "Carrera 45 #67-89"
}
```

**Response:**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "email": "juan@example.com",
  "fullName": "Juan Pérez",
  "phone": "+573009876543",
  "address": "Carrera 45 #67-89",
  "city": "Bogotá",
  "country": "Colombia",
  "postalCode": "110111",
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-10T15:00:00.000Z"
}
```

### `DELETE /customers/:id`
Elimina un cliente.

**Response:** `204 No Content`

---

## 💳 Pagos

### `POST /wompi/tokenize-card`
Tokeniza una tarjeta de crédito/débito para usar en pagos.

**Request:**
```json
{
  "number": "4242424242424242",
  "cvc": "123",
  "exp_month": "12",
  "exp_year": "2028",
  "card_holder": "Juan Perez"
}
```

**Response:**
```json
{
  "status": "CREATED",
  "data": {
    "id": "tok_stagtest_22907_4e4ffcC38Cc4ef4ccacC83C384Cf3C44",
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

### `GET /wompi/acceptance-tokens`
Obtiene los tokens de aceptación de términos de Wompi.

**Response:**
```json
{
  "presigned_acceptance": {
    "acceptance_token": "eyJhbGciOiJIUzI1NiJ9...",
    "permalink": "https://wompi.co/acceptance-of-terms",
    "type": "END_USER_POLICY"
  },
  "presigned_personal_data_auth": {
    "acceptance_token": "eyJhbGciOiJIUzI1NiJ9...",
    "permalink": "https://wompi.co/personal-data-authorization",
    "type": "PERSONAL_DATA_AUTH"
  }
}
```

### `POST /payments/process`
Procesa un pago completo (obtiene acceptance token, crea pago, verifica estado, crea delivery).

**Request:**
```json
{
  "amountInCents": 50000,
  "currency": "COP",
  "customerEmail": "juan@example.com",
  "paymentMethod": {
    "type": "CARD",
    "token": "tok_stagtest_22907_4e4ffcC38Cc4ef4ccacC83C384Cf3C44",
    "installments": 1
  },
  "customerData": {
    "phoneNumber": "+573001234567",
    "fullName": "Juan Perez"
  },
  "shippingAddress": {
    "addressLine1": "Calle 123 #45-67",
    "city": "Bogotá",
    "region": "Cundinamarca",
    "country": "CO"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "reference": "TXN-1704834567890",
    "status": "APPROVED",
    "amountInCents": 50000,
    "currency": "COP",
    "wompiTransactionId": "1234-1668097329-99999",
    "customerId": "650e8400-e29b-41d4-a716-446655440001",
    "customerEmail": "juan@example.com",
    "redirectUrl": null,
    "paymentLinkId": null,
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-10T12:00:32.000Z"
  },
  "delivery": {
    "id": "850e8400-e29b-41d4-a716-446655440003",
    "transactionId": "750e8400-e29b-41d4-a716-446655440002",
    "customerName": "Juan Perez",
    "customerPhone": "+573001234567",
    "address": {
      "addressLine1": "Calle 123 #45-67",
      "city": "Bogotá",
      "region": "Cundinamarca",
      "country": "CO"
    },
    "status": "PENDING",
    "trackingNumber": null,
    "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z",
    "actualDeliveryDate": null,
    "notes": null,
    "createdAt": "2024-01-10T12:00:32.000Z",
    "updatedAt": "2024-01-10T12:00:32.000Z"
  },
  "message": "Pago procesado exitosamente. Entrega creada automáticamente."
}
```

### `GET /payments/status/:wompiTransactionId`
Verifica el estado de un pago con reintentos automáticos.

**Response:**
```json
{
  "success": true,
  "status": "APPROVED",
  "paymentId": "1234-1668097329-99999",
  "details": "Pago aprobado por Wompi",
  "message": "Estado del pago verificado exitosamente"
}
```

---

## 💰 Transacciones

### `GET /transactions/:id`
Obtiene una transacción por ID.

**Response:**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440002",
  "reference": "TXN-1704834567890",
  "status": "APPROVED",
  "amountInCents": 50000,
  "currency": "COP",
  "wompiTransactionId": "1234-1668097329-99999",
  "customerId": "650e8400-e29b-41d4-a716-446655440001",
  "customerEmail": "juan@example.com",
  "customerFullName": "Juan Perez",
  "customerPhoneNumber": "+573001234567",
  "paymentMethod": {
    "type": "CARD",
    "installments": 1
  },
  "shippingAddress": {
    "addressLine1": "Calle 123 #45-67",
    "city": "Bogotá",
    "region": "Cundinamarca",
    "country": "CO"
  },
  "redirectUrl": null,
  "paymentLinkId": null,
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:32.000Z"
}
```

### `PATCH /transactions/:id`
Actualiza el estado de una transacción.

**Request:**
```json
{
  "status": "APPROVED",
  "wompiTransactionId": "1234-1668097329-99999"
}
```

**Response:**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440002",
  "reference": "TXN-1704834567890",
  "status": "APPROVED",
  "amountInCents": 50000,
  "currency": "COP",
  "wompiTransactionId": "1234-1668097329-99999",
  "customerId": "650e8400-e29b-41d4-a716-446655440001",
  "customerEmail": "juan@example.com",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:32.000Z"
}
```

---

## 📦 Entregas

### `POST /deliveries`
Crea una nueva entrega.

**Request:**
```json
{
  "transactionId": "750e8400-e29b-41d4-a716-446655440002",
  "customerName": "Juan Perez",
  "customerPhone": "+573001234567",
  "address": {
    "addressLine1": "Calle 123 #45-67",
    "addressLine2": "Apto 301",
    "city": "Bogotá",
    "region": "Cundinamarca",
    "country": "CO",
    "postalCode": "110111"
  },
  "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z",
  "notes": "Entregar en portería"
}
```

**Response:**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440003",
  "transactionId": "750e8400-e29b-41d4-a716-446655440002",
  "customerName": "Juan Perez",
  "customerPhone": "+573001234567",
  "address": {
    "addressLine1": "Calle 123 #45-67",
    "addressLine2": "Apto 301",
    "city": "Bogotá",
    "region": "Cundinamarca",
    "country": "CO",
    "postalCode": "110111"
  },
  "status": "PENDING",
  "trackingNumber": null,
  "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z",
  "actualDeliveryDate": null,
  "notes": "Entregar en portería",
  "createdAt": "2024-01-10T12:00:32.000Z",
  "updatedAt": "2024-01-10T12:00:32.000Z"
}
```

### `GET /deliveries/:id`
Obtiene una entrega por ID.

**Response:**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440003",
  "transactionId": "750e8400-e29b-41d4-a716-446655440002",
  "customerName": "Juan Perez",
  "customerPhone": "+573001234567",
  "address": {
    "addressLine1": "Calle 123 #45-67",
    "city": "Bogotá",
    "region": "Cundinamarca",
    "country": "CO"
  },
  "status": "PENDING",
  "trackingNumber": null,
  "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z",
  "actualDeliveryDate": null,
  "notes": null,
  "createdAt": "2024-01-10T12:00:32.000Z",
  "updatedAt": "2024-01-10T12:00:32.000Z"
}
```

### `GET /deliveries/transaction/:transactionId`
Obtiene la entrega asociada a una transacción.

**Response:**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440003",
  "transactionId": "750e8400-e29b-41d4-a716-446655440002",
  "customerName": "Juan Perez",
  "customerPhone": "+573001234567",
  "address": {
    "addressLine1": "Calle 123 #45-67",
    "city": "Bogotá",
    "region": "Cundinamarca",
    "country": "CO"
  },
  "status": "PENDING",
  "trackingNumber": null,
  "estimatedDeliveryDate": "2024-01-15T00:00:00.000Z",
  "actualDeliveryDate": null,
  "notes": null,
  "createdAt": "2024-01-10T12:00:32.000Z",
  "updatedAt": "2024-01-10T12:00:32.000Z"
}
```

---

## 🔔 Webhook (Wompi)

### `POST /webhooks/wompi`
Recibe eventos de Wompi (pagos aprobados, rechazados, etc).

**Request:**
```json
{
  "event": "transaction.updated",
  "data": {
    "transaction": {
      "id": "1234-1668097329-99999",
      "amount_in_cents": 50000,
      "status": "APPROVED",
      "reference": "TXN-1704834567890"
    }
  },
  "sent_at": "2024-01-10T12:00:30.000Z"
}
```

**Response:** `200 OK`

---

## 📊 Estados

### Estados de Transacción
- `PENDING`: Pago iniciado
- `APPROVED`: Pago aprobado ✅
- `DECLINED`: Pago rechazado ❌
- `VOIDED`: Pago anulado
- `ERROR`: Error en el proceso

### Estados de Entrega
- `PENDING`: Entrega pendiente
- `PROCESSING`: En proceso
- `SHIPPED`: Enviado
- `IN_TRANSIT`: En tránsito
- `DELIVERED`: Entregado ✅
- `FAILED`: Entrega fallida

---

## 🧪 Tarjetas de Prueba (Sandbox)

| Número | CVC | Resultado |
|--------|-----|-----------|
| 4242424242424242 | 123 | APPROVED ✅ |
| 4111111111111111 | 321 | DECLINED ❌ |
| 4000000000000002 | 456 | ERROR |
