# Sistema de Auditoría y Compliance

## Resumen

Este sistema implementa registro de auditoría exhaustivo para cumplir con los requisitos de:
- **RouteOne** - Plataforma de financiamiento automotriz
- **DealerTrack** - Sistema de gestión de concesionarios
- **GLBA** (Gramm-Leach-Bliley Act) - Protección de información financiera
- **OFAC** (Office of Foreign Assets Control) - Sanciones económicas

## Arquitectura

### Componentes

1. **@AuditLog Decorator** - Marca endpoints que requieren auditoría
2. **AuditLogInterceptor** - Intercepta requests y crea logs automáticamente
3. **AuditLog Model** - Tabla de PostgreSQL para almacenar registros
4. **AuditModule** - Módulo global que aplica auditoría a toda la aplicación

## Uso

### Decorar Endpoints

```typescript
@Get(':id')
@AuditLog({
  action: 'read',           // Tipo de operación
  resource: 'buyer',        // Recurso afectado
  level: 'high',            // Nivel de criticidad
  pii: true,                // Contiene PII
  compliance: ['routeone', 'glba']  // Regulaciones aplicables
})
async findOne(@Param('id') id: string) {
  // ...
}
```

### Niveles de Auditoría

- **low**: Operaciones de lectura no sensibles
- **medium**: Creación/actualización de datos
- **high**: Acceso a datos sensibles, eliminaciones
- **critical**: Operaciones con alto impacto (exports, cambios masivos)

### Acciones Auditables

- **create**: Creación de registros
- **read**: Lectura de datos
- **update**: Actualización de registros
- **delete**: Eliminación de registros
- **access**: Acceso a archivos/recursos privados
- **export**: Exportación de datos

## Datos Registrados

Cada operación auditable registra:

### Información del Usuario
- `userId`: UUID del usuario (si está autenticado)
- `userEmail`: Email del usuario
- `ipAddress`: Dirección IP de origen
- `userAgent`: Navegador/cliente utilizado

### Información de la Operación
- `action`: Tipo de acción (create, read, update, delete, etc.)
- `resource`: Tipo de recurso (buyer, deal, vehicle, media)
- `resourceId`: ID del recurso específico
- `method`: Método HTTP (GET, POST, PUT, DELETE)
- `url`: URL completa del endpoint

### IDs de Recursos Relacionados
- `buyerId`: ID del comprador (si aplica)
- `vehicleId`: ID del vehículo (si aplica)
- `dealId`: ID del deal (si aplica)

### Resultado
- `status`: success o failure
- `duration`: Tiempo de ejecución en ms
- `errorMessage`: Mensaje de error (si falló)
- `errorCode`: Código HTTP de error

### Clasificación de Seguridad
- `level`: Criticidad de la operación
- `pii`: Boolean indicando si involucra PII
- `compliance`: Array de regulaciones aplicables

### Metadata
- `metadata`: JSON con datos adicionales (params, query, etc.)

## Requisitos de Compliance

### RouteOne
- **Requisito**: Registro de todas las operaciones CRUD en datos de financiamiento
- **Implementación**: Decoradores @AuditLog en todos los endpoints de Buyer y Deal
- **Retención**: Mínimo 7 años

### DealerTrack
- **Requisito**: Auditoría de acceso a información del cliente
- **Implementación**: Logs de nivel 'high' con PII=true
- **Alertas**: Logs críticos enviados a sistema de monitoreo

### GLBA (Gramm-Leach-Bliley Act)
- **Requisito**: Protección y auditoría de información financiera personal
- **Implementación**:
  - Flag `pii: true` en operaciones con datos personales
  - Logs de acceso a SSN, información financiera, documentos
  - IP tracking y user identification

### OFAC
- **Requisito**: Registro de verificaciones contra listas de sanciones
- **Implementación**: Auditoría en creación/actualización de Buyers
- **Compliance tag**: 'ofac' en metadata

## Queries de Auditoría

### Buscar accesos a un buyer específico
```sql
SELECT * FROM audit_logs
WHERE buyer_id = 'uuid-del-buyer'
ORDER BY created_at DESC;
```

### Buscar operaciones fallidas
```sql
SELECT * FROM audit_logs
WHERE status = 'failure'
ORDER BY created_at DESC
LIMIT 100;
```

### Buscar accesos desde IP específica
```sql
SELECT * FROM audit_logs
WHERE ip_address = '192.168.1.1'
ORDER BY created_at DESC;
```

### Buscar operaciones críticas con PII
```sql
SELECT * FROM audit_logs
WHERE level = 'critical' AND pii = true
ORDER BY created_at DESC;
```

### Reporte de actividad por usuario
```sql
SELECT
  user_email,
  action,
  resource,
  COUNT(*) as total_operations,
  COUNT(CASE WHEN status = 'failure' THEN 1 END) as failed_operations
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_email, action, resource
ORDER BY total_operations DESC;
```

## Índices de Performance

La tabla `audit_logs` tiene índices optimizados para queries comunes:

- `userId` - Búsquedas por usuario
- `buyerId`, `vehicleId`, `dealId` - Búsquedas por recurso
- `action`, `resource` - Búsquedas por tipo de operación
- `status`, `level`, `pii` - Filtros de clasificación
- `createdAt` - Búsquedas por rango de fechas
- `ipAddress` - Investigación de seguridad

## Integración con Sistemas Externos

### Splunk / ELK / Datadog
Los logs críticos (level='critical' o pii=true) se envían automáticamente a:
- Console log (formato JSON estructurado)
- Sistema de archivos (/var/log/app/audit.log)
- SIEM externo (configurar via environment)

### Alertas Automáticas
Configurar alertas para:
- Múltiples intentos fallidos desde misma IP
- Acceso a recursos de buyers fuera de horario laboral
- Eliminaciones masivas
- Cambios en datos de compliance (OFAC flags)

## Retención de Datos

### Política de Retención
- **Logs operacionales (level=low/medium)**: 90 días
- **Logs de seguridad (level=high)**: 2 años
- **Logs críticos (level=critical o pii=true)**: 7 años (compliance RouteOne)

### Archivado
Script automático para archivar logs antiguos a S3/Glacier:
```bash
npm run audit:archive
```

## Seguridad

### Datos Sensibles
- **NO** se registra el body completo de requests (solo keys)
- **NO** se registran passwords o tokens
- **SÍ** se registran IDs de recursos accedidos
- **SÍ** se registra metadata de contexto (IP, user-agent)

### Acceso a Logs
- Solo usuarios con rol `ADMIN` o `COMPLIANCE_OFFICER`
- Logs de auditoría son **read-only** (no se pueden editar)
- Acceso a logs también es auditado

## Mantenimiento

### Verificar Funcionamiento
```bash
# Ver logs recientes
psql -d htownautos -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;"

# Ver estadísticas
psql -d htownautos -c "
SELECT
  action,
  resource,
  COUNT(*) as total,
  COUNT(CASE WHEN status='failure' THEN 1 END) as failures
FROM audit_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY action, resource;
"
```

### Limpiar Logs Antiguos
```bash
# Eliminar logs operacionales > 90 días
psql -d htownautos -c "
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '90 days'
AND level IN ('low', 'medium')
AND pii = false;
"
```

## Troubleshooting

### Los logs no se están creando
1. Verificar que AuditModule está importado en AppModule
2. Verificar que el decorator @AuditLog está presente
3. Revisar logs de aplicación por errores del interceptor

### Performance Issues
1. Verificar índices en la tabla audit_logs
2. Considerar archivado de logs antiguos
3. Implementar batching de writes (actualmente síncrono)

### Falta información en logs
1. Verificar que el usuario está autenticado (userId puede ser null)
2. Verificar metadata JSON para información adicional
3. Logs de errores pueden tener menos información

## Roadmap

### Próximas Mejoras
- [ ] Dashboard de auditoría en tiempo real
- [ ] Alertas automáticas vía email/Slack
- [ ] Exportación de reportes de compliance
- [ ] Integración con sistemas DMS (DealerTrack, CDK)
- [ ] Machine learning para detección de anomalías
- [ ] Firma digital de logs (blockchain/hash chain)
