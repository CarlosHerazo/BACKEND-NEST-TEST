# Sistema de Reintentos de Pago

Este documento explica cómo funciona el sistema de verificación de estado de pagos con reintentos automáticos.

## Características

### 1. Verificación Automática en `POST /api/v1/payments/process`

Cuando procesas un pago, el sistema automáticamente verifica el estado con Wompi:

```bash
curl -X POST http://localhost:3000/api/v1/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "123e4567-e89b-12d3-a456-426614174000",
    "customerEmail": "cliente@ejemplo.com",
    "amountInCents": 50000,
    "customerFullName": "Juan Pérez",
    "customerPhoneNumber": "3001234567",
    "shippingAddress": "Calle 123 #45-67",
    "paymentMethod": {
      "type": "CARD",
      "token": "tok_stagtest_...",
      "installments": 1
    }
  }'
```

**Respuesta:**
```json
{
  "transactionId": "913d293c-98d3-43d2-b74c-09ef767b1f35",
  "wompiTransactionId": "15113-1768060515-95120",
  "reference": "ORDER-1768060515-ABC123",
  "status": "APPROVED",
  "redirectUrl": null,
  "paymentLinkId": null,
  "info": {
    "message": "Payment processed successfully",
    "nextStep": "Payment approved and completed"
  },
  "createdAt": "2026-01-10T15:55:15.000Z"
}
```

**Proceso interno:**
1. Crea la transacción en Wompi
2. Espera 2 segundos
3. Verifica el estado (intento 1)
4. Si está `PENDING`, espera 4 segundos
5. Verifica el estado (intento 2)
6. Si está `PENDING`, espera 8 segundos
7. Verifica el estado (intento 3)
8. Si está `PENDING`, espera 16 segundos
9. Verifica el estado (intento 4)
10. Retorna el último estado obtenido

### 2. Verificación Manual con `GET /api/v1/payments/status/:wompiTransactionId`

Si necesitas verificar el estado de un pago específico:

```bash
curl http://localhost:3000/api/v1/payments/status/15113-1768060515-95120
```

**Respuesta:**
```json
{
  "success": true,
  "status": "APPROVED",
  "paymentId": "15113-1768060515-95120",
  "details": "{\"id\":\"15113-1768060515-95120\",\"status\":\"APPROVED\",\"amount_in_cents\":50000}",
  "message": "Payment status is APPROVED"
}
```

Este endpoint también usa el sistema de reintentos (5 intentos con backoff exponencial).

## Configuración del Sistema de Reintentos

### Parámetros por Defecto

En `PaymentStatusCheckerService`:

```typescript
async checkPaymentStatusWithRetry(
  paymentId: string,
  maxRetries: number = 5,           // Número de intentos
  initialDelayMs: number = 2000,    // Delay inicial: 2 segundos
  useExponentialBackoff: boolean = true  // Usar backoff exponencial
)
```

### Backoff Exponencial

Los intervalos entre intentos son:
- Intento 1: inmediato
- Intento 2: después de 2s
- Intento 3: después de 4s
- Intento 4: después de 8s
- Intento 5: después de 16s

**Tiempo total máximo:** ~30 segundos

### Detención Temprana

El sistema se detiene automáticamente si detecta un estado final:
- `APPROVED` ✅
- `DECLINED` ❌
- `VOIDED` 🚫
- `ERROR` ⚠️

Solo continúa reintentando si el estado es `PENDING`.

## Logs del Sistema

Durante el procesamiento verás logs como:

```
[PaymentStatusCheckerService] Checking payment status (attempt 1/5)
[PaymentStatusCheckerService] Checking payment status for: 15113-1768060515-95120
[WompiApiClient] Checking payment status for transaction: 15113-1768060515-95120
[WompiApiClient] Payment status retrieved: PENDING
[PaymentStatusCheckerService] Payment 15113-1768060515-95120 status: PENDING -> PENDING
[PaymentStatusCheckerService] Payment still PENDING. Waiting 2000ms before next check...
[PaymentStatusCheckerService] Checking payment status (attempt 2/5)
...
[PaymentStatusCheckerService] Payment status resolved to APPROVED after 3 attempt(s)
```

## Casos de Uso

### 1. Pago Aprobado Rápidamente

Si Wompi procesa el pago en menos de 2 segundos, el primer intento retornará `APPROVED`:

```
Intento 1 (0s): PENDING
Espera 2s
Intento 2 (2s): APPROVED ← Se detiene aquí
Total: ~2 segundos
```

### 2. Pago que Tarda 10 Segundos

```
Intento 1 (0s): PENDING
Espera 2s
Intento 2 (2s): PENDING
Espera 4s
Intento 3 (6s): PENDING
Espera 8s
Intento 4 (14s): APPROVED ← Se detiene aquí
Total: ~14 segundos
```

### 3. Pago que Nunca se Procesa (Sandbox)

```
Intento 1 (0s): PENDING
Espera 2s
Intento 2 (2s): PENDING
Espera 4s
Intento 3 (6s): PENDING
Espera 8s
Intento 4 (14s): PENDING
Espera 16s
Intento 5 (30s): PENDING ← Retorna PENDING
Total: ~30 segundos
```

En este caso, puedes:
- Esperar el webhook de Wompi
- Consultar manualmente después con `GET /api/v1/payments/status/:id`
- Verificar en la BD con `GET /api/v1/transactions/:id`

## Ambiente Sandbox vs Producción

### Sandbox (Testing)

En el ambiente de pruebas de Wompi:
- Los pagos **pueden quedarse en PENDING indefinidamente**
- Wompi puede no procesarlos automáticamente
- Es normal que después de 5 intentos siga en `PENDING`
- Puedes simular webhooks manualmente

### Producción

En producción con credenciales reales:
- Los pagos se procesan en segundos/minutos
- El sistema de reintentos capturará el estado final en la mayoría de casos
- Los webhooks llegarán automáticamente

## Personalizar los Reintentos

Si quieres cambiar el comportamiento, edita [payment.controller.ts](src/modules/payments/infrastructure/controllers/payment.controller.ts#L256-L260):

```typescript
const statusCheck = await this.paymentStatusChecker.checkPaymentStatusWithRetry(
  transaction.wompiTransactionId,
  10,    // ← Cambia a 10 intentos
  1000,  // ← Delay inicial de 1 segundo
  true,  // ← Mantén el backoff exponencial
);
```

## Diagrama de Flujo

```
┌─────────────────────────────────────┐
│  POST /api/v1/payments/process      │
└──────────────┬──────────────────────┘
               │
               ▼
       ┌───────────────┐
       │ Crear en Wompi│
       └───────┬───────┘
               │
               ▼
       ┌─────────────────────┐
       │ Iniciar Reintentos  │
       └──────────┬──────────┘
                  │
        ┌─────────▼─────────┐
        │ ¿Estado Final?    │
        │ (APPROVED/etc)    │
        └─────┬──────┬──────┘
          Sí │      │ No
             │      │
             │      ▼
             │   ┌──────────────┐
             │   │ Esperar      │
             │   │ (exponencial)│
             │   └──────┬───────┘
             │          │
             │    ┌─────▼─────┐
             │    │¿Max tries?│
             │    └─┬────────┬┘
             │   No │        │ Sí
             │      │        │
             │      ▼        ▼
             │   (Loop)   (Return PENDING)
             │
             ▼
    ┌────────────────────┐
    │ Actualizar BD      │
    │ Crear Delivery     │
    │ (si APPROVED)      │
    └─────────┬──────────┘
              │
              ▼
       ┌──────────────┐
       │ Respuesta    │
       └──────────────┘
```

## Monitoreo y Debugging

### Ver logs en tiempo real (Docker)

```bash
docker-compose logs -f app
```

### Verificar estado en la base de datos

```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U postgres -d ecommerce_db

# Consultar transacciones
SELECT id, reference, status, wompi_transaction_id, created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 10;
```

### Probar con curl

```bash
# 1. Procesar pago
RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/payments/process \
  -H "Content-Type: application/json" \
  -d '{ ... }')

# 2. Extraer wompiTransactionId
WOMPI_ID=$(echo $RESPONSE | jq -r '.wompiTransactionId')

# 3. Verificar estado manualmente
curl http://localhost:3000/api/v1/payments/status/$WOMPI_ID
```

## Mejores Prácticas

1. **Confia en el sistema de reintentos**: En la mayoría de casos, obtendrás el estado final en la primera llamada
2. **Usa el webhook como backup**: Configura el webhook para capturar actualizaciones tardías
3. **Monitorea los logs**: Los logs te dirán exactamente cuántos intentos se hicieron
4. **En sandbox, sé paciente**: Los pagos pueden quedarse en PENDING indefinidamente
5. **En producción, espera respuestas rápidas**: Los pagos reales se procesan en segundos
