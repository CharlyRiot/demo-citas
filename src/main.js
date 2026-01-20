import './style.css'

const app = document.querySelector('#app')

const state = {
  role: 'cliente',
  selectedDate: null,
  selectedSlotId: null,
  notice: null,
  blocks: [],
  lastBooking: null,
  notifications: [],
  now: new Date(),
  selectedServiceId: 'corte-hombre',
  showLimits: false,
  showCancel: null,
  session: {
    loggedIn: false,
    name: '',
    email: '',
    role: 'cliente',
  },
  clientDraft: {
    name: '',
    email: '',
  },
  cancellations: [],
  lastClientEmail: '',
  demoGuide: {
    active: false,
    step: 1,
  },
  audioMuted: false,
}

const businessRules = {
  blockMinutes: 30,
  startHour: 9,
  endHour: 18,
  maxPerClient: 1,
}

const contactPhone = '+52 55 1234 5678'

const STORAGE_KEY = 'demo-citas-state-v1'
const AUDIO_SRC = '/jazzrelax.mp3'

const bgAudio = new Audio(AUDIO_SRC)
bgAudio.loop = true
bgAudio.preload = 'auto'
bgAudio.volume = 0.35
bgAudio.muted = state.audioMuted

let audioStarted = false
const startBackgroundAudio = () => {
  if (state.audioMuted) return
  if (audioStarted) return
  bgAudio
    .play()
    .then(() => {
      audioStarted = true
    })
    .catch(() => {})
}

const services = [
  { id: 'corte-hombre', name: 'Corte de cabello hombre', minDuration: 30 },
  { id: 'corte-mujer', name: 'Corte de cabello mujer (simple)', minDuration: 40 },
  { id: 'corte-diseno', name: 'Corte + diseno + estilo', minDuration: 50 },
  { id: 'afeitado', name: 'Afeitado tradicional con toalla caliente', minDuration: 30 },
  { id: 'barba-basico', name: 'Perfilado de barba basico', minDuration: 15 },
  { id: 'tinte-raiz', name: 'Tinte raiz', minDuration: 60 },
  { id: 'peinado-social', name: 'Peinado social', minDuration: 45 },
  { id: 'manicure-simple', name: 'Manicure simple', minDuration: 30 },
]

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
})

const longDateFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const buildDateList = (days = 7) => {
  const today = new Date()
  return Array.from({ length: days }, (_, index) => {
    const next = new Date(today)
    next.setDate(today.getDate() + index)
    const iso = next.toISOString().split('T')[0]
    return {
      iso,
      label: dateFormatter.format(next),
    }
  })
}

const buildTimes = () => {
  const times = []
  for (let hour = businessRules.startHour; hour < businessRules.endHour; hour += 1) {
    for (let minutes = 0; minutes < 60; minutes += businessRules.blockMinutes) {
      const date = new Date()
      date.setHours(hour, minutes, 0, 0)
      times.push({
        value: `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        label: timeFormatter.format(date),
      })
    }
  }
  return times
}

const timeOptions = buildTimes()
const dateOptions = buildDateList()
state.selectedDate = dateOptions[0].iso

const formatSlot = (slot) => `${slot.date} ${slot.time}`

const focusDemoStep = (step) => {
  const targets = {
    1: '#login-form input[name="name"]',
    2: '.slot-grid',
    3: '#client-booking-form input[name="name"]',
    4: '#client-booking-form select[name="service"]',
    5: '#client-booking-form button[type="submit"]',
  }
  const selector = targets[step]
  if (!selector) return
  window.requestAnimationFrame(() => {
    const element = document.querySelector(selector)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (typeof element.focus === 'function') {
      element.focus()
    }
  })
}

const saveState = () => {
  const payload = {
    role: state.role,
    selectedDate: state.selectedDate,
    selectedServiceId: state.selectedServiceId,
    blocks: state.blocks,
    lastBooking: state.lastBooking,
    notifications: state.notifications,
    session: state.session,
    clientDraft: state.clientDraft,
    cancellations: state.cancellations,
    lastClientEmail: state.lastClientEmail,
    demoGuide: state.demoGuide,
    audioMuted: state.audioMuted,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

const loadState = () => {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  try {
    const payload = JSON.parse(raw)
    state.role = payload.role ?? state.role
    state.selectedDate = payload.selectedDate ?? state.selectedDate
    state.selectedServiceId = payload.selectedServiceId ?? state.selectedServiceId
    state.blocks = Array.isArray(payload.blocks) ? payload.blocks : state.blocks
    state.lastBooking = payload.lastBooking ?? state.lastBooking
    state.notifications = Array.isArray(payload.notifications)
      ? payload.notifications
      : state.notifications
    state.session = payload.session ?? state.session
    state.clientDraft = payload.clientDraft ?? state.clientDraft
    state.cancellations = Array.isArray(payload.cancellations)
      ? payload.cancellations
      : state.cancellations
    state.lastClientEmail = payload.lastClientEmail ?? state.lastClientEmail
    state.demoGuide = payload.demoGuide ?? state.demoGuide
    state.audioMuted = payload.audioMuted ?? state.audioMuted
    if (!dateOptions.some((option) => option.iso === state.selectedDate)) {
      state.selectedDate = dateOptions[0].iso
    }
    state.role = state.session.loggedIn ? state.session.role : state.role
    bgAudio.muted = state.audioMuted
    return true
  } catch (error) {
    return false
  }
}

const resetState = () => {
  state.role = 'cliente'
  state.selectedDate = dateOptions[0].iso
  state.selectedSlotId = null
  state.notice = null
  state.blocks = []
  state.lastBooking = null
  state.notifications = []
  state.now = new Date()
  state.selectedServiceId = 'corte-hombre'
  state.showLimits = false
  state.session = {
    loggedIn: false,
    name: '',
    email: '',
    role: 'cliente',
  }
  state.clientDraft = {
    name: '',
    email: '',
  }
  state.cancellations = []
  state.lastClientEmail = ''
  state.demoGuide = { active: false, step: 1 }
  state.audioMuted = false
  bgAudio.muted = state.audioMuted
}

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

const formatTodayLabel = (date) => {
  const parts = longDateFormatter.formatToParts(date)
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  return `${capitalize(weekday)} ${day} de ${capitalize(month)}`
}

const formatTimeAmPm = (date) => {
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = hours >= 12 ? 'pm' : 'am'
  hours %= 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes} ${suffix}`
}

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000)

const formatTimeRange = (slot, duration) => {
  const [year, month, day] = slot.date.split('-').map(Number)
  const [hour, minute] = slot.time.split(':').map(Number)
  const start = new Date(year, month - 1, day, hour, minute)
  const end = addMinutes(start, duration)
  return `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
}

const formatLongSlot = (slot) => {
  const [year, month, day] = slot.date.split('-').map(Number)
  const [hour, minute] = slot.time.split(':').map(Number)
  const date = new Date(year, month - 1, day, hour, minute)
  const dateText = longDateFormatter.format(date)
  const timeText = timeFormatter.format(date)
  return `${dateText} a las ${timeText}`
}

const isPastSlot = (slot) => {
  const now = new Date()
  const todayIso = now.toISOString().split('T')[0]
  if (slot.date !== todayIso) return false
  const [hour, minute] = slot.time.split(':').map(Number)
  const slotDate = new Date(now)
  slotDate.setHours(hour, minute, 0, 0)
  return slotDate <= now
}

const getSlotsForDate = (date) => state.blocks.filter((slot) => slot.date === date)

const getAvailableSlots = (date) =>
  getSlotsForDate(date).filter((slot) => slot.status === 'available')

const createCode = () =>
  `CITA-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

const setNotice = (message, tone = 'info') => {
  state.notice = { message, tone }
  render()
  window.clearTimeout(state.noticeTimeout)
  state.noticeTimeout = window.setTimeout(() => {
    state.notice = null
    render()
  }, 6500)
}

const saveClientDraftFromDOM = () => {
  const form = document.querySelector('#client-booking-form')
  if (!form) return
  const nameInput = form.querySelector('input[name="name"]')
  const emailInput = form.querySelector('input[name="email"]')
  state.clientDraft = {
    name: nameInput?.value ?? state.clientDraft.name,
    email: emailInput?.value ?? state.clientDraft.email,
  }
  saveState()
}

const bookSlot = (slotId, client, service) => {
  const slot = state.blocks.find((item) => item.id === slotId)
  if (!slot || slot.status !== 'available' || isPastSlot(slot)) {
    setNotice('Ese bloque ya no esta disponible.', 'warning')
    return null
  }

  const blocksNeeded = Math.ceil(service.minDuration / businessRules.blockMinutes)
  const startIndex = timeOptions.findIndex((option) => option.value === slot.time)
  if (startIndex === -1) {
    setNotice('No se encontro el horario solicitado.', 'warning')
    return null
  }

  const slotsToBook = []
  for (let i = 0; i < blocksNeeded; i += 1) {
    const timeOption = timeOptions[startIndex + i]
    if (!timeOption) {
      setNotice('El servicio excede el horario disponible.', 'warning')
      return null
    }
    const targetSlot = state.blocks.find(
      (item) => item.date === slot.date && item.time === timeOption.value
    )
    if (!targetSlot || targetSlot.status !== 'available' || isPastSlot(targetSlot)) {
      setNotice('No hay bloques consecutivos suficientes para este servicio.', 'warning')
      return null
    }
    slotsToBook.push(targetSlot)
  }

  const code = createCode()
  slotsToBook.forEach((item) => {
    item.status = 'booked'
    item.client = client
    item.code = code
    item.service = {
      id: service.id,
      name: service.name,
      duration: service.minDuration,
    }
  })

  state.lastBooking = {
    code,
    slot: slotsToBook[0],
    client,
    service,
  }
  state.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'whatsapp',
    message: `Nueva cita ${formatLongSlot(slotsToBook[0])} (${client.name}).`,
    createdAt: new Date().toISOString(),
  })
  saveState()
  return code
}

const cancelByCode = (code) => {
  const slots = state.blocks.filter((item) => item.code === code)
  if (!slots.length) return false
  slots.forEach((slot) => {
    slot.status = 'available'
    slot.client = null
    slot.code = null
    slot.service = null
  })
  if (state.lastBooking?.code === code) {
    state.lastBooking = null
  }
  saveState()
  return true
}

const addBlocks = (date, startTime, count) => {
  const startIndex = timeOptions.findIndex((option) => option.value === startTime)
  if (startIndex === -1) return 0
  let created = 0
  for (let i = 0; i < count; i += 1) {
    const time = timeOptions[startIndex + i]
    if (!time) break
    const exists = state.blocks.some(
      (slot) => slot.date === date && slot.time === time.value
    )
    if (exists) continue
    state.blocks.push({
      id: `slot-${Date.now()}-${i}`,
      date,
      time: time.value,
      status: 'available',
      client: null,
      code: null,
    })
    created += 1
  }
  return created
}

const buildStats = (date) => {
  const slots = getSlotsForDate(date)
  return {
    total: slots.length,
    available: slots.filter((slot) => slot.status === 'available').length,
    booked: slots.filter((slot) => slot.status === 'booked').length,
  }
}

const createDailyBlocks = (date) => {
  let created = 0
  timeOptions.forEach((time) => {
    const exists = state.blocks.some((slot) => slot.date === date && slot.time === time.value)
    if (exists) return
    state.blocks.push({
      id: `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date,
      time: time.value,
      status: 'available',
      client: null,
      code: null,
    })
    created += 1
  })
  return created
}

const removeDayBlocks = (date) => {
  const before = state.blocks.length
  const removedIds = new Set(
    state.blocks.filter((slot) => slot.date === date).map((slot) => slot.id)
  )
  state.blocks = state.blocks.filter((slot) => slot.date !== date)
  if (removedIds.has(state.selectedSlotId)) {
    state.selectedSlotId = null
  }
  saveState()
  return before - state.blocks.length
}

const removeSlot = (slotId) => {
  const before = state.blocks.length
  state.blocks = state.blocks.filter((slot) => slot.id !== slotId)
  if (state.selectedSlotId === slotId) {
    state.selectedSlotId = null
  }
  saveState()
  return before !== state.blocks.length
}

const render = () => {
  const stats = buildStats(state.selectedDate)
  const slots = getSlotsForDate(state.selectedDate)
  const availableSlots = getAvailableSlots(state.selectedDate)
  const demoStep = state.demoGuide.active ? state.demoGuide.step : null
  const demoStepText =
    {
      1: 'Inicia sesion demo con cualquier nombre y correo.',
      2: 'Elige un horario disponible.',
      3: 'Completa nombre y correo.',
      4: 'Selecciona el servicio.',
      5: 'Confirma la cita.',
    }[demoStep] ?? ''
  const audioLabel = state.audioMuted ? 'Activar audio' : 'Silenciar audio'
  const selectedSlot = state.selectedSlotId
    ? state.blocks.find((slot) => slot.id === state.selectedSlotId)
    : null
  if (state.selectedSlotId && !selectedSlot) {
    state.selectedSlotId = null
  }
  const selectedService =
    services.find((service) => service.id === state.selectedServiceId) ?? services[0]
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000
  const clientEmail = state.lastClientEmail || state.session.email
  const clientCancellations = state.cancellations
    .filter((item) => {
      const byEmail = clientEmail && item.email === clientEmail
      const byCode = state.lastBooking?.code && item.code === state.lastBooking.code
      return byEmail || byCode
    })
    .filter((item) => !item.dismissedAt)
    .filter((item) => new Date(item.createdAt).getTime() >= cutoffTime)
  const todayLabel = formatTodayLabel(state.now)
  const nowLabel = formatTimeAmPm(state.now)
  const styleCards = [
    {
      name: 'Fade clasico',
      tag: 'Cabello',
      image: '/styles/fade-clasico.jpg',
      accent: '#2a9d8f',
    },
    {
      name: 'Barba sculpt',
      tag: 'Barba',
      image: '/styles/barba-sculpt.jpg',
      accent: '#6d6875',
    },
    {
      name: 'Crop urbano',
      tag: 'Cabello',
      image: '/styles/crop-urbano.jpg',
      accent: '#e76f51',
    },
    {
      name: 'Perfilado premium',
      tag: 'Barba',
      image: '/styles/perfilado-premium.jpg',
      accent: '#283618',
    },
  ]
  const carouselItems = [...styleCards, ...styleCards]

  app.innerHTML = `
    <div class="app">
      <div class="banner">Datos simulados &bull; Demo portfolio</div>
      <header class="hero">
        <div class="hero-text">
          <span class="pill">Demo</span>
          <h1>Sistema de Citas Inteligente</h1>
          <p>
            Agenda sin empalmes con disponibilidad en tiempo real, confirmaciones rapidas y
            cancelaciones controladas.
          </p>
          <div class="hero-impact">
            <div>
              <strong>0 empalmes</strong>
              <span>Bloques consecutivos validados</span>
            </div>
            <div>
              <strong>60s</strong>
              <span>Reserva + cancelacion guiada</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>Notificaciones activas en demo</span>
            </div>
          </div>
          <div class="hero-actions">
            ${
              state.session.loggedIn
                ? `
            <div class="session-chip">
              Sesion demo: <strong>${state.session.role}</strong>
            </div>
            <button class="btn ghost" type="button" data-action="logout">Cerrar sesion</button>
            `
                : `
            <form id="login-form" class="login-form">
              <input type="text" name="name" placeholder="Nombre" required />
              <input type="email" name="email" placeholder="Correo" required />
              <select name="role" required>
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </select>
              <button class="btn primary" type="submit">Iniciar sesion demo</button>
            </form>
            `
            }
          </div>
          <div class="hero-cta">
            <button class="btn primary" type="button" data-action="start-demo">
              Probar flujo en 60s
            </button>
            <button class="btn ghost" type="button" data-action="toggle-audio">
              ${audioLabel}
            </button>
            <span class="muted">Listo en 3 pasos.</span>
          </div>
          <button class="link-button" type="button" data-modal="limits">
            Ver limitaciones tecnicas
          </button>
          <div class="hero-foot">
            Demo 100% web. Sin PWA, sin instalacion, sin modo offline.
          </div>
        </div>
        <div class="hero-card">
          ${
            state.role === 'cliente'
              ? `
          <h3>Disponibilidad de hoy</h3>
          <p>
            Tenemos <strong>${stats.available}</strong> horarios disponibles. Elige el de tu
            preferencia.
          </p>
          <div class="style-carousel" aria-label="Estilos de corte y barba">
            <div class="style-track">
              ${carouselItems
                .map(
                  (style) => `
                <div class="style-card" style="--card-image: url('${style.image}'); --card-accent: ${style.accent}">
                  <span>${style.tag}</span>
                  <strong>${style.name}</strong>
                </div>`
                )
                .join('')}
            </div>
          </div>
          `
              : `
          <h3>Estado de hoy</h3>
          <div class="stat-grid">
            <div>
              <span>${stats.total}</span>
              <small>Bloques</small>
            </div>
            <div>
              <span>${stats.available}</span>
              <small>Disponibles</small>
            </div>
            <div>
              <span>${stats.booked}</span>
              <small>Confirmadas</small>
            </div>
          </div>
          <p>
            Zona horaria local. Duracion de bloque: ${businessRules.blockMinutes} minutos.
          </p>
          `
          }
        </div>
      </header>

      <section class="toolbar">
        <div class="role-toggle">
          <button class="chip ${state.role === 'cliente' ? 'active' : ''}" data-role="cliente">
            Vista cliente
          </button>
          <button class="chip ${state.role === 'admin' ? 'active' : ''}" data-role="admin">
            Vista admin
          </button>
        </div>
        <div class="date-picker">
          ${dateOptions
            .map(
              (date) => `
              <button class="date-btn ${state.selectedDate === date.iso ? 'active' : ''}"
                data-date="${date.iso}">
                <span>${date.label}</span>
              </button>`
            )
            .join('')}
        </div>
      </section>

      ${
        state.demoGuide.active
          ? `
      <div class="demo-banner">
        <strong>Paso ${demoStep} de 5</strong>
        <span>${demoStepText}</span>
      </div>
      `
          : ''
      }

      ${state.notice ? `<div class="notice ${state.notice.tone}">${state.notice.message}</div>` : ''}

      <main class="dashboard" id="demo">
        <div class="panel calendar ${demoStep === 2 ? 'demo-focus' : ''}">
          <div class="panel-head">
            <h2>Disponibilidad</h2>
            <p>${stats.available} disponibles de ${stats.total}</p>
          </div>
          ${
            state.role === 'cliente' && clientCancellations.length
              ? `
          <div class="notice-stack">
            <h3>Notificaciones</h3>
            ${clientCancellations
              .map(
                (item) => `
              <div class="notice warning">
                Tu servicio de <strong>${item.service}</strong> fue cancelado por
                <strong>${item.reasonLabel}</strong>. Si crees que hubo un error,
                contacta directamente a la sucursal ${contactPhone}.
                <button class="btn ghost" type="button" data-dismiss="${
                  item.id
                }">Ok</button>
              </div>`
              )
              .join('')}
          </div>
          `
              : state.role === 'cliente'
                ? `
          <div class="notice-stack">
            <h3>Como probar notificaciones</h3>
            <div class="notice info">
              1) Reserva como cliente. 2) Cambia a admin y cancela. 3) Vuelve a cliente.
            </div>
          </div>
          `
              : ''
          }
          <div class="now-banner">
            <span id="today-label">Hoy es ${todayLabel}.</span>
            <span id="time-label">Son las ${nowLabel}.</span>
          </div>
          <div class="slot-grid">
            ${
              slots.length
                ? slots
                    .map((slot) => {
                      const isSelected = slot.id === state.selectedSlotId
                      const isBooked = slot.status === 'booked'
                      const isPast = isPastSlot(slot)
                      return `
                        <button
                          class="slot ${isBooked ? 'booked' : 'available'} ${
                        isSelected ? 'selected' : ''
                      }"
                          data-slot="${slot.id}"
                          ${isBooked || isPast ? 'disabled' : ''}
                        >
                          <span>${slot.time}</span>
                          <small>${
                            isBooked ? 'Reservado' : isPast ? 'Expirado' : 'Libre'
                          }</small>
                        </button>`
                    })
                    .join('')
                : `<div class="empty">No hay bloques creados para esta fecha.</div>`
            }
          </div>
        </div>

        <div class="panel actions">
          ${
            state.role === 'cliente'
              ? `
            <div class="panel-head">
              <h2>Reserva rapida</h2>
              <p>Selecciona un bloque disponible y confirma tus datos.</p>
            </div>
            <form id="client-booking-form" class="form ${
              demoStep && demoStep >= 3 ? 'demo-focus' : ''
            }">
              <label>
                Nombre completo
                <input type="text" name="name" placeholder="Ej. Sofia Perez" value="${state.clientDraft.name}" required />
              </label>
              <label>
                Correo
                <input type="email" name="email" placeholder="sofia@email.com" value="${state.clientDraft.email}" required />
              </label>
              <label class="${demoStep === 4 ? 'demo-focus' : ''}">
                Servicio
                <select name="service" required>
                  ${services
                    .map(
                      (service) => `
                    <option value="${service.id}" ${
                        service.id === state.selectedServiceId ? 'selected' : ''
                      }>
                      ${service.name} (${service.minDuration} min)
                    </option>`
                    )
                    .join('')}
                </select>
              </label>
              <label>
                Bloque seleccionado
                <input type="text" name="slot" value="${
                  selectedSlot
                    ? formatTimeRange(selectedSlot, selectedService.minDuration)
                    : 'Sin seleccionar'
                }" readonly />
                  </label>
              <button class="btn primary" type="submit" ${
                !state.selectedSlotId ? 'disabled' : ''
              } ${demoStep === 5 ? 'demo-focus' : ''}>
                Confirmar cita
              </button>
            </form>
            ${
              state.lastBooking
                ? `
            <div class="info-card">
              <h3>Tu codigo de cancelacion</h3>
              <p><strong>${state.lastBooking.code}</strong></p>
              <p class="muted">${state.lastBooking.service.name}</p>
            </div>
            `
                : ''
            }
            <div class="info-card">
              <h3>Cancelar con codigo</h3>
              <form id="cancel-form" class="inline-form">
                <input type="text" name="code" placeholder="CITA-XXXX" required />
                <button class="btn ghost" type="submit">Cancelar</button>
              </form>
            </div>
          `
              : `
            <div class="panel-head">
              <h2>Panel admin</h2>
              <p>Define bloques de atencion y gestiona cambios.</p>
            </div>
            <form id="admin-create-form" class="form">
              <label>
                Fecha
                <input type="date" name="date" value="${state.selectedDate}" required />
              </label>
              <label>
                Hora inicio
                <select name="time" required>
                  ${timeOptions
                    .map(
                      (option) => `
                    <option value="${option.value}">${option.label}</option>`
                    )
                    .join('')}
                </select>
              </label>
              <label>
                <span class="label-row">
                  Numero de bloques
                  <button class="help" type="button" data-popover="blocks">?</button>
                </span>
                <div class="popover" data-popover-content="blocks" role="dialog" aria-hidden="true">
                  <strong>Numero de bloques</strong>
                  <p>
                    Define cuantos bloques consecutivos se crean desde la “Hora inicio”
                    seleccionada en el panel admin.
                  </p>
                  <p>
                    Ejemplo: si eliges fecha 2026-01-20, hora inicio 10:00 y numero de bloques = 3,
                    se crean 10:00, 10:30 y 11:00 (porque cada bloque es de 30 minutos).
                  </p>
                  <p>
                    Si ya existe alguno de esos horarios, ese se salta y solo se crean los que no
                    existan.
                  </p>
                </div>
                <select name="count" required>
                  ${[1, 2, 3, 4, 5, 6]
                    .map((count) => `<option value="${count}">${count}</option>`)
                    .join('')}
                </select>
              </label>
              <button class="btn primary" type="submit">Agregar bloques</button>
            </form>
            <div class="info-card">
              <h3>Acciones del dia</h3>
              <div class="inline-actions">
                <button class="btn ghost" type="button" data-action="generate-day">
                  Generar horario completo
                </button>
                <button class="btn ghost" type="button" data-action="close-day">
                  Cerrar dia
                </button>
                <button class="btn ghost" type="button" data-action="reset-demo">
                  Reiniciar demo
                </button>
              </div>
            </div>
            <div class="info-card">
              <h3>Cancelacion con codigo</h3>
              <form id="cancel-form" class="inline-form">
                <input type="text" name="code" placeholder="CITA-XXXX" required />
                <button class="btn ghost" type="submit">Cancelar</button>
              </form>
            </div>
            <div class="list highlight-card">
              <h3>Reservas activas</h3>
              <p class="muted">
                Tip: cancela una reserva para generar la notificacion al cliente.
              </p>
              ${
                slots.filter((slot) => slot.status === 'booked').length
                  ? Array.from(
                      slots
                        .filter((slot) => slot.status === 'booked')
                        .reduce((map, slot) => {
                          const code = slot.code ?? slot.id
                          if (!map.has(code)) {
                            map.set(code, slot)
                          }
                          return map
                        }, new Map())
                        .values()
                    )
                      .map(
                        (slot) => `
                      <div class="list-item">
                        <div>
                          <strong>${slot.time}</strong>
                          <span>${slot.client?.name ?? 'Cliente demo'}</span>
                          <span>${slot.service?.name ?? 'Servicio'}</span>
                        </div>
                        <div class="list-actions">
                          <small>Codigo: ${slot.code}</small>
                          <button class="btn ghost" type="button" data-cancel="${slot.code}">
                            Cancelar
                          </button>
                        </div>
                      </div>`
                      )
                      .join('')
                  : `<p class="empty">No hay reservas confirmadas aun.</p>`
              }
            </div>
            <div class="list">
              <h3>Bloques del dia</h3>
              ${
                slots.length
                  ? slots
                      .map(
                        (slot) => `
                      <div class="list-item">
                        <div>
                          <strong>${slot.time}</strong>
                          <span>${slot.status === 'booked' ? 'Reservado' : 'Disponible'}</span>
                        </div>
                        <button class="btn ghost" type="button" data-remove="${
                          slot.id
                        }">Eliminar</button>
                      </div>`
                      )
                      .join('')
                  : `<p class="empty">No hay bloques creados para esta fecha.</p>`
              }
            </div>
            <div class="list">
              <h3>Notificaciones simuladas</h3>
              ${
                state.notifications.length
                  ? state.notifications
                      .slice(0, 4)
                      .map(
                        (item) => `
                      <div class="list-item">
                        <div>
                          <strong>WhatsApp</strong>
                          <span>${item.message}</span>
                        </div>
                        <small>Simulada</small>
                      </div>`
                      )
                      .join('')
                  : `<p class="empty">Sin notificaciones aun.</p>`
              }
            </div>
          `
          }
        </div>
      </main>

      <footer class="footer">
        <span>Demo portfolio &bull; Flujo real con datos simulados.</span>
        <span>Zona local &bull; Limite: ${businessRules.maxPerClient} cita por cliente/dia.</span>
      </footer>
    </div>

    ${
      state.showLimits
        ? `
      <div class="modal-backdrop" data-modal="close">
        <div class="modal" role="dialog" aria-modal="true" aria-label="Limitaciones tecnicas">
          <div class="modal-head">
            <h3>Limitaciones tecnicas (demo)</h3>
            <button class="icon-button" type="button" data-modal="close">Cerrar</button>
          </div>
          <div class="modal-body">
            <p><strong>Lo que no hace hoy</strong></p>
            <ul>
              <li>Sin registro/login real ni verificacion de identidad.</li>
              <li>Sin pagos, recordatorios automatizados ni notificaciones reales.</li>
              <li>Sin integracion con Google Calendar o CRM.</li>
              <li>Sin control avanzado de permisos por rol.</li>
              <li>Sin PWA, instalacion ni modo offline.</li>
            </ul>
            <p><strong>Lo que podria hacer en produccion</strong></p>
            <ul>
              <li>Auth con roles, perfil de clientes y agenda por sucursal.</li>
              <li>Pagos en linea, politicas de cancelacion y reembolsos.</li>
              <li>Recordatorios por WhatsApp/SMS/email con historial.</li>
              <li>Sincronizacion con calendarios externos.</li>
              <li>Analytics de demanda, no-show y ocupacion.</li>
            </ul>
          </div>
        </div>
      </div>
    `
        : ''
    }

    ${
      state.showCancel
        ? `
      <div class="modal-backdrop" data-modal="close-cancel">
        <div class="modal" role="dialog" aria-modal="true" aria-label="Cancelar reserva">
          <div class="modal-head">
            <h3>Cancelar reserva</h3>
            <button class="icon-button" type="button" data-modal="close-cancel">Cerrar</button>
          </div>
          <div class="modal-body">
            <p>Esta accion libera los bloques de la cita.</p>
            <form id="admin-cancel-form" class="form">
              <input type="hidden" name="code" value="${state.showCancel.code}" />
              <label>
                Motivo de cancelacion
                <select name="reason" required>
                  <option value="">Selecciona un motivo</option>
                  <option value="cliente-no-asiste">Cliente no asistio</option>
                  <option value="cliente-solicita">Cliente solicito cancelar</option>
                  <option value="ajuste-agenda">Ajuste de agenda</option>
                  <option value="otro">Otro</option>
                </select>
              </label>
              <button class="btn primary" type="submit">Confirmar cancelacion</button>
            </form>
          </div>
        </div>
      </div>
    `
        : ''
    }
  `
}

const handleClick = (event) => {
  saveClientDraftFromDOM()

  const modalTarget = event.target.closest('[data-modal]')
  if (modalTarget) {
    const action = modalTarget.dataset.modal
    if (action === 'limits') {
      state.showLimits = true
      render()
      return
    }
    if (action === 'close') {
      state.showLimits = false
      render()
      return
    }
    if (action === 'close-cancel') {
      if (event.target.classList.contains('modal-backdrop')) {
        state.showCancel = null
        render()
      }
      return
    }
  }

  const cancelTarget = event.target.closest('[data-cancel]')
  if (cancelTarget) {
    if (state.role !== 'admin') {
      setNotice('Solo el admin puede cancelar reservas.', 'warning')
      return
    }
    state.showCancel = { code: cancelTarget.dataset.cancel }
    render()
    return
  }

  const helpTarget = event.target.closest('[data-popover]')
  if (helpTarget) {
    const id = helpTarget.dataset.popover
    const popover = document.querySelector(`[data-popover-content="${id}"]`)
    if (popover) {
      const isOpen = popover.getAttribute('aria-hidden') === 'false'
      document.querySelectorAll('.popover').forEach((item) => {
        item.setAttribute('aria-hidden', 'true')
      })
      popover.setAttribute('aria-hidden', isOpen ? 'true' : 'false')
    }
    return
  }

  const actionTarget = event.target.closest('[data-action]')
  if (actionTarget) {
    const action = actionTarget.dataset.action
    if (action === 'start-demo') {
      state.demoGuide.active = true
      if (!state.session.loggedIn) {
        state.demoGuide.step = 1
        render()
        focusDemoStep(1)
        return
      }
      if (state.session.role !== 'cliente') {
        state.session.role = 'cliente'
        state.role = 'cliente'
      }
      state.demoGuide.step = 2
      saveState()
      render()
      focusDemoStep(2)
      return
    }
    if (action === 'toggle-audio') {
      state.audioMuted = !state.audioMuted
      bgAudio.muted = state.audioMuted
      if (!state.audioMuted) {
        startBackgroundAudio()
      }
      saveState()
      render()
      return
    }
    if (action === 'logout') {
      state.session = {
        loggedIn: false,
        name: '',
        email: '',
        role: 'cliente',
      }
      state.role = 'cliente'
      saveState()
      render()
      return
    }
    if (state.role !== 'admin') {
      setNotice('Solo el admin puede realizar esta accion.', 'warning')
      return
    }
    if (action === 'generate-day') {
      const created = createDailyBlocks(state.selectedDate)
      setNotice(`Se crearon ${created} bloques nuevos para el dia.`, 'success')
    }
    if (action === 'close-day') {
      const removed = removeDayBlocks(state.selectedDate)
      setNotice(`Se eliminaron ${removed} bloques del dia.`, 'warning')
    }
    if (action === 'reset-demo') {
      window.localStorage.removeItem(STORAGE_KEY)
      resetState()
      seedBlocks()
      setNotice('Demo reiniciada.', 'success')
      render()
      return
    }
    saveState()
    render()
    return
  }

  const dismissTarget = event.target.closest('[data-dismiss]')
  if (dismissTarget) {
    const id = dismissTarget.dataset.dismiss
    const item = state.cancellations.find((entry) => entry.id === id)
    if (item) {
      item.dismissedAt = new Date().toISOString()
      saveState()
      render()
    }
    return
  }

  const removeTarget = event.target.closest('[data-remove]')
  if (removeTarget) {
    if (state.role !== 'admin') {
      setNotice('Solo el admin puede realizar esta accion.', 'warning')
      return
    }
    const slotId = removeTarget.dataset.remove
    if (removeSlot(slotId)) {
      setNotice('Bloque eliminado.', 'success')
    }
    render()
    return
  }

  const roleTarget = event.target.closest('[data-role]')
  if (roleTarget) {
    if (!state.session.loggedIn) {
      setNotice('Inicia sesion demo para cambiar de vista.', 'warning')
      return
    }
    state.role = roleTarget.dataset.role
    state.session.role = state.role
    saveState()
    render()
    return
  }

  const dateTarget = event.target.closest('[data-date]')
  if (dateTarget) {
    state.selectedDate = dateTarget.dataset.date
    state.selectedSlotId = null
    saveState()
    render()
    return
  }

  const slotTarget = event.target.closest('[data-slot]')
  if (slotTarget) {
    const slotId = slotTarget.dataset.slot
    const slot = state.blocks.find((item) => item.id === slotId)
    if (slot && slot.status === 'available') {
      state.selectedSlotId = slotId
      render()
      if (state.demoGuide.active && state.demoGuide.step < 3) {
        state.demoGuide.step = 3
        saveState()
        render()
        focusDemoStep(3)
      }
    }
  }
}

const handleChange = (event) => {
  if (!state.demoGuide.active) return
  const serviceSelect = event.target.closest('#client-booking-form select[name="service"]')
  if (serviceSelect && state.demoGuide.step < 4) {
    state.demoGuide.step = 4
    saveState()
    render()
    focusDemoStep(4)
  }
}

const handleFocus = (event) => {
  if (!state.demoGuide.active) return
  const clientForm = event.target.closest('#client-booking-form')
  if (clientForm && state.demoGuide.step < 3) {
    state.demoGuide.step = 3
    saveState()
    render()
    focusDemoStep(3)
  }
}

const handleSubmit = (event) => {
  event.preventDefault()
  const form = event.target

  if (form.id === 'login-form') {
    const formData = new FormData(form)
    state.session = {
      loggedIn: true,
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      role: formData.get('role'),
    }
    state.role = state.session.role
    if (state.demoGuide.active) {
      state.demoGuide.step = 2
    }
    saveState()
    render()
    if (state.demoGuide.active) {
      focusDemoStep(2)
    }
    return
  }

  if (form.id === 'client-booking-form') {
    if (!state.session.loggedIn || state.role !== 'cliente') {
      setNotice('Inicia sesion como cliente para reservar.', 'warning')
      return
    }
    if (!state.selectedSlotId) {
      setNotice('Selecciona un bloque disponible.', 'warning')
      return
    }
    const formData = new FormData(form)
    const name = formData.get('name').trim()
    const email = formData.get('email').trim()
    const serviceId = formData.get('service')
    const service = services.find((item) => item.id === serviceId) ?? services[0]
    state.selectedServiceId = service.id
    state.lastClientEmail = email
    const activeBookings = state.blocks.filter(
      (slot) => slot.client?.email === email && slot.status === 'booked'
    )
    if (activeBookings.length >= businessRules.maxPerClient) {
      setNotice('Este correo ya tiene una reserva activa.', 'warning')
      return
    }
    if (state.demoGuide.active && state.demoGuide.step < 5) {
      state.demoGuide.step = 5
      render()
    }
    const code = bookSlot(state.selectedSlotId, { name, email }, service)
    state.selectedSlotId = null
    form.reset()
    if (code) {
      state.clientDraft = { name: '', email: '' }
      saveState()
      setNotice(`Reserva confirmada. Tu codigo es ${code}. Aviso enviado al barbero.`, 'success')
      if (state.demoGuide.active) {
        state.demoGuide.active = false
        saveState()
        render()
      }
    }
    return
  }

  if (form.id === 'admin-create-form') {
    if (!state.session.loggedIn || state.role !== 'admin') {
      setNotice('Inicia sesion como admin para crear bloques.', 'warning')
      return
    }
    const formData = new FormData(form)
    const date = formData.get('date')
    const time = formData.get('time')
    const count = Number(formData.get('count'))
    const created = addBlocks(date, time, count)
    setNotice(`Se agregaron ${created} bloques nuevos.`, 'success')
    saveState()
    render()
    return
  }

  if (form.id === 'cancel-form') {
    const formData = new FormData(form)
    const code = formData.get('code').trim().toUpperCase()
    if (cancelByCode(code)) {
      setNotice('Cancelacion realizada. El bloque vuelve a estar disponible.', 'success')
    } else {
      setNotice('Codigo no encontrado.', 'warning')
    }
    form.reset()
  }

  if (form.id === 'admin-cancel-form') {
    if (!state.session.loggedIn || state.role !== 'admin') {
      setNotice('Inicia sesion como admin para cancelar.', 'warning')
      return
    }
    const formData = new FormData(form)
    const code = formData.get('code').trim().toUpperCase()
    const reason = formData.get('reason')
    const reasonLabel =
      {
        'cliente-no-asiste': 'Cliente no asistio',
        'cliente-solicita': 'Cliente solicito cancelar',
        'ajuste-agenda': 'Ajuste de agenda',
        otro: 'Otro',
      }[reason] ?? 'Otro'
    if (!reason) {
      setNotice('Selecciona un motivo de cancelacion.', 'warning')
      return
    }
    const canceledSlots = state.blocks.filter((slot) => slot.code === code)
    const canceledSlot = canceledSlots[0]
    const canceledEmail = canceledSlot?.client?.email
    const canceledService = canceledSlot?.service?.name ?? 'Servicio'
    if (cancelByCode(code)) {
      if (canceledEmail) {
        state.cancellations.unshift({
          id: `cancel-${Date.now()}`,
          code,
          email: canceledEmail,
          service: canceledService,
          reason,
          reasonLabel,
          createdAt: new Date().toISOString(),
          dismissedAt: null,
        })
        saveState()
      }
      setNotice('Reserva cancelada por admin.', 'success')
    } else {
      setNotice('Codigo no encontrado.', 'warning')
    }
    state.showCancel = null
    render()
  }
}

const seedBlocks = () => {
  dateOptions.slice(0, 3).forEach((date) => {
    createDailyBlocks(date.iso)
  })
  const tomorrow = dateOptions[1]?.iso
  if (tomorrow) {
    const firstSlots = getAvailableSlots(tomorrow).slice(0, 2)
    firstSlots.forEach((slot, index) => {
      bookSlot(
        slot.id,
        {
          name: index === 0 ? 'Mariana Lopez' : 'Luis Vargas',
          email: index === 0 ? 'mariana@demo.com' : 'luis@demo.com',
        },
        services[index % services.length]
      )
    })
  }
  saveState()
}

if (!loadState()) {
  seedBlocks()
}
render()
startBackgroundAudio()

app.addEventListener('click', handleClick)
app.addEventListener('submit', handleSubmit)
app.addEventListener('change', handleChange)
app.addEventListener('focusin', handleFocus)
window.addEventListener('pointerdown', startBackgroundAudio, { once: true })

window.setInterval(() => {
  state.now = new Date()
  const todayLabel = document.querySelector('#today-label')
  const timeLabel = document.querySelector('#time-label')
  if (todayLabel) {
    todayLabel.textContent = `Hoy es ${formatTodayLabel(state.now)}.`
  }
  if (timeLabel) {
    timeLabel.textContent = `Son las ${formatTimeAmPm(state.now)}.`
  }
}, 60000)
