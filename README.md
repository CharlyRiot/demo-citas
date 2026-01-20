# Sistema de Citas Inteligente

Producto real. Agenda sin empalmes, en tiempo real.

## Propuesta de valor

Reduce errores de agenda y evita empalmes con disponibilidad en tiempo real, confirmaciones rapidas y cancelaciones controladas.

## Usuario objetivo y caso de uso

- Negocios con alta rotacion de citas: consultorios, barberias, estudios, talleres.
- Personal que hoy agenda por WhatsApp o telefono y sufre empalmes.
- Necesitan claridad de disponibilidad y control de cambios.

## Problema

- Reservas con empalmes.
- Cancelaciones desordenadas.
- Falta de visibilidad inmediata del calendario.

## Solucion

- Bloques disponibles en tiempo real.
- Cancelacion con codigo.
- Panel admin para gestionar agenda y reglas por dia.

## Resultado (meta)

- 0 empalmes.
- Confirmacion en 2 minutos.

Nota: este resultado es una meta esperada para la demo, no un KPI verificado.

## Como probar la demo (flujo visible)

- Demo: https://demo-citas.tu-dominio.com
- Landing: https://demo-citas.tu-dominio.com/landing
- Repo: https://github.com/tu-usuario/demo-citas
- Video corto: https://www.loom.com/share/tu-video

### Flujo rapido

1) Inicia sesion demo (cliente o admin) con nombre y correo cualquiera.
2) Cliente reserva un bloque disponible.
3) Cambia a admin y cancela la reserva con codigo y motivo.
4) Vuelve a cliente y aparece la notificacion de cancelacion.

## Reglas de negocio (demo)

- Duracion base de bloque: 30 minutos.
- Servicios con duraciones variables (30/60/90). Un servicio de 60 ocupa 2 bloques consecutivos.
- Horario de atencion: 09:00 a 18:00 (zona local, ej. America/Mexico_City).
- Limite de reservas por cliente: 1 por dia.
- Cancelaciones permitidas hasta 2 horas antes. (demo sin validacion de horario)
- Zonas horarias: se asume horario local del negocio.

Reglas para administracion y reserva

- Admin define el catalogo de servicios con su duracion (y opcionalmente buffer entre citas).
- Admin puede ajustar la duracion por servicio sin reconfigurar todo el calendario.
- Cliente debe elegir el servicio al agendar; la duracion se calcula automaticamente.

Ejemplo

- Corte de cabello: 30 min (1 bloque).
- Corte + barba: 60 min (2 bloques consecutivos).

## Pantallas previstas

- Landing con descripcion y boton de acceso.
- Calendario de disponibilidad (cliente).
- Reserva y confirmacion.
- Cancelacion con codigo.
- Panel admin (bloques, reglas, lista de citas, citas proximas).

## Alcance de la demo

- Datos simulados pero flujo real.
- Dos roles: admin y cliente.
- Validaciones basicas para evitar dobles reservas.
- Notificaciones simuladas (sin envio real).

### Limitaciones tecnicas

Alcance actual

Demo 100% web (sin PWA, sin instalacion, sin offline).
Orientada a mostrar el flujo principal y la logica del producto.
Login simulado sin verificacion real; la demo prioriza el flujo y usa cancelacion por codigo.
En produccion se exigiria autenticacion, limites por usuario y validaciones extra.

Potencial futuro

Puede convertirse en PWA instalable si el proyecto lo requiere.
Soporte offline y funcionalidades nativas bajo una fase posterior.

## Estado de implementacion

- [ ] Landing publica
- [x] Auth demo (admin/cliente)
- [x] Calendario de disponibilidad
- [x] Reserva y confirmacion
- [x] Cancelacion con codigo
- [x] Panel admin
- [ ] Reglas de Firestore

## Stack

- Frontend: Vite + JavaScript
- Estado: memoria + localStorage
- Backend: no aplica (demo 100% cliente)

## Arquitectura (demo)

- UI en Vite + JavaScript con estado en memoria y persistencia local.
- Reserva valida bloques consecutivos segun duracion de servicio.
- Simulacion de notificaciones al admin al confirmar cita.
- Avisos al cliente cuando el admin cancela.
- Separacion de vistas cliente/admin con login demo y cambio de rol.

## Checklist de pruebas rapidas

1) Inicia sesion demo como cliente y reserva un bloque.
2) Cambia a admin y cancela la reserva con motivo.
3) Vuelve a cliente y valida la notificacion.
4) Genera horario completo o cierra el dia y valida el calendario.

## Proximos pasos

- Definir estructura de colecciones.
- Reemplazar login demo por auth real.
- Integrar notificaciones reales (WhatsApp/SMS/email).
