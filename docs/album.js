const themeToggle = document.querySelector('.theme-toggle')
const pageTheme = document.querySelector('meta[name="theme-color"]')

function setTheme(theme) {
  const dark = theme === 'dark'
  document.documentElement.dataset.theme = theme
  pageTheme.content = dark ? '#211832' : '#fbe2ed'
  themeToggle.setAttribute('aria-pressed', String(dark))
  themeToggle.setAttribute('aria-label', dark ? 'Ativar o modo claro' : 'Ativar o modo escuro')
  themeToggle.querySelector('span').textContent = dark ? 'Modo claro' : 'Modo escuro'
  themeToggle.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon')
  try { localStorage.setItem('nos-dois-tema', theme) } catch { /* A página também funciona sem armazenamento. */ }
}

try {
  if (localStorage.getItem('nos-dois-tema') === 'dark') setTheme('dark')
} catch { /* O tema claro é o padrão. */ }

themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')
})

const timerStart = new Date(historia.inicio).getTime()
const timerDigits = [...document.querySelectorAll('[data-time]')]
function updateTimer() {
  const seconds = Math.max(0, Math.floor((Date.now() - timerStart) / 1000))
  const units = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60]
  timerDigits.forEach((digit, index) => {
    digit.textContent = String(units[index]).padStart(index === 0 ? 3 : 2, '0')
  })
}
updateTimer()
window.setInterval(updateTimer, 1000)

const photoDialog = document.querySelector('#photo-dialog')
const albumPhoto = document.querySelector('#album-photo')
const photoCaption = document.querySelector('#photo-caption')
const prevPhoto = document.querySelector('#photo-prev')
const nextPhoto = document.querySelector('#photo-next')
let openPhotos = []
let photoIndex = 0

function imagePath(file) {
  return 'images/' + encodeURIComponent(file)
}

function showPhoto(index) {
  photoIndex = (index + openPhotos.length) % openPhotos.length
  const photo = openPhotos[photoIndex]
  albumPhoto.src = imagePath(photo.arquivo)
  albumPhoto.alt = photo.nome || 'Foto do álbum'
  photoCaption.textContent = photo.nome
    ? photo.nome + (openPhotos.length > 1 ? ' · ' + (photoIndex + 1) + ' / ' + openPhotos.length : '')
    : 'Foto ' + (photoIndex + 1) + ' de ' + openPhotos.length
}

function openAlbum(title, photos, index = 0) {
  openPhotos = photos
  document.querySelector('#photo-title').textContent = title
  prevPhoto.disabled = nextPhoto.disabled = photos.length < 2
  showPhoto(index)
  photoDialog.showModal()
}

prevPhoto.addEventListener('click', () => showPhoto(photoIndex - 1))
nextPhoto.addEventListener('click', () => showPhoto(photoIndex + 1))
photoDialog.addEventListener('keydown', (event) => {
  if (openPhotos.length < 2) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1))
  }
})

// O conteúdo é editado em historia.js. Os textos entram no DOM como texto simples.
const chapterList = document.querySelector('#chapter-list')
historia.capitulos.forEach((chapter) => {
  const isGame = chapter.estilo === 'together'
  const card = document.createElement('li')
  card.className = 'chapter chapter-' + chapter.estilo
  card.innerHTML = `
    <article>
      <button class="chapter-photo" type="button">
        <span class="cover-image"><img src="" alt="" loading="lazy" decoding="async"></span>
        <span class="cover-caption"></span>
        <span class="photo-expand" aria-hidden="true"><svg class="icon"><use href="#i-expand"/></svg></span>
      </button>
      <div class="chapter-copy">
        <p class="chapter-date"><time></time></p>
        <h3></h3>
      </div>
    </article>`
  const button = card.querySelector('.chapter-photo')
  button.classList.add(isGame ? 'game-cover' : 'polaroid')
  button.setAttribute('aria-label', 'Abrir fotos de ' + chapter.titulo)
  card.querySelector('img').src = imagePath(chapter.fotos[0])
  card.querySelector('.cover-caption').textContent = chapter.legenda ?? ''
  card.querySelector('time').textContent = chapter.data
  card.querySelector('h3').textContent = chapter.titulo
  if (chapter.piada) {
    const joke = document.createElement('p')
    joke.className = 'chapter-joke'
    joke.textContent = chapter.piada
    card.querySelector('.chapter-copy').append(joke)
  }
  if (isGame) {
    button.insertAdjacentHTML('afterbegin', `
      <span class="game-spine" aria-hidden="true">
        <img src="assets/playstation.svg" alt="">
        <span>PlayStation</span>
        <small>△ ○ × □</small>
      </span>`)
  }
  const photos = chapter.fotos.map((arquivo) => ({ arquivo }))
  if (chapter.estilo === 'pregnancy') {
    const pair = document.createElement('div')
    pair.className = 'polaroid-pair'
    button.replaceWith(pair)
    photos.forEach((photo, index) => {
      const print = button.cloneNode(true)
      print.querySelector('img').src = imagePath(photo.arquivo)
      print.setAttribute('aria-label', 'Ampliar foto ' + (index + 1) + ' da gravidez')
      print.addEventListener('click', () => openAlbum(chapter.titulo, photos, index))
      pair.append(print)
    })
  } else {
    button.addEventListener('click', () => openAlbum(chapter.titulo, photos))
  }
  chapterList.append(card)
})

const loosePhotos = [{ arquivo: 'Eu.png', nome: 'eu.png' }, ...historia.fotosSoltas.slice(0, 5)]
for (let index = loosePhotos.length - 1; index > 0; index--) {
  const swap = Math.floor(Math.random() * (index + 1))
  const photo = loosePhotos[index]
  loosePhotos[index] = loosePhotos[swap]
  loosePhotos[swap] = photo
}

const looseAlbum = [...loosePhotos, ...historia.fotosSoltas.slice(5)]
document.querySelectorAll('[data-loose-photo]').forEach((slot, index) => {
  const photo = loosePhotos[index]
  if (!photo) return
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'xp-photo'
  button.setAttribute('aria-label', 'Ampliar ' + photo.nome)
  button.style.setProperty('--photo-offset-x', (Math.random() * 10 - 5) + 'px')
  button.style.setProperty('--photo-offset-y', (Math.random() * 10 - 5) + 'px')
  button.style.setProperty('--tilt-offset', (Math.random() * 8 - 4) + 'deg')
  button.innerHTML = '<span class="xp-bar"><span></span><i aria-hidden="true">▣</i></span><img alt="" loading="lazy" decoding="async">'
  button.querySelector('.xp-bar span').textContent = photo.nome
  button.querySelector('img').src = imagePath(photo.arquivo)
  button.addEventListener('click', () => openAlbum('Fotos soltas', looseAlbum, index))
  makeDraggable(button)
  slot.append(button)
})

function makeDraggable(photo) {
  let gesture = null
  let dragged = false
  photo.title = 'Arraste para mover ou clique para ampliar'
  photo.querySelector('img').draggable = false

  photo.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return
    dragged = false
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY }
    photo.setPointerCapture(event.pointerId)
  })

  photo.addEventListener('pointermove', (event) => {
    if (gesture?.id !== event.pointerId) return
    const dx = event.clientX - gesture.x
    const dy = event.clientY - gesture.y
    if (!dragged && Math.hypot(dx, dy) < 6) return

    if (!dragged) {
      const bounds = photo.getBoundingClientRect()
      const width = photo.offsetWidth
      const height = photo.offsetHeight
      const styles = getComputedStyle(photo)
      const parent = photo.parentElement
      const hadFocus = document.activeElement === photo
      gesture.width = width
      gesture.height = height
      gesture.left = bounds.left + (bounds.width - width) / 2
      gesture.top = bounds.top + (bounds.height - height) / 2
      photo.style.setProperty('--photo-width', width + 'px')
      for (const property of ['--tilt', '--tape-left', '--tape-angle']) {
        photo.style.setProperty(property, styles.getPropertyValue(property))
      }

      if (parent.classList.contains('loose-photo')) {
        parent.style.minHeight = parent.offsetHeight + 'px'
        parent.classList.add('photo-slot-vacant')
      }

      // Move the card outside its original section so its frame and tape can cross the page freely.
      document.body.append(photo)
      photo.classList.add('placed-photo', 'is-dragging')
      photo.setPointerCapture(event.pointerId)
      if (hadFocus) photo.focus({ preventScroll: true })
      dragged = true
    }

    const left = Math.max(8, Math.min(gesture.left + dx, document.documentElement.clientWidth - gesture.width - 8))
    const top = Math.max(8, Math.min(gesture.top + dy, window.innerHeight - gesture.height - 8))
    photo.style.setProperty('--photo-left', left + window.scrollX + 'px')
    photo.style.setProperty('--photo-top', top + window.scrollY + 'px')
  })

  const endDrag = (event) => {
    if (gesture?.id !== event.pointerId) return
    gesture = null
    photo.classList.remove('is-dragging')
  }
  photo.addEventListener('pointerup', endDrag)
  photo.addEventListener('pointercancel', endDrag)
  photo.addEventListener('click', (event) => {
    if (!dragged || event.detail === 0) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }, true)
}

photoDialog.querySelector('[data-close]').addEventListener('click', () => photoDialog.close())
photoDialog.addEventListener('click', (event) => {
  if (event.target !== photoDialog) return
  const bounds = photoDialog.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close()
})
