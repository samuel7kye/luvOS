function initDvdPlayer() {
  const audio = document.querySelector('#dvd-audio')
  const expand = document.querySelector('#dvd-expand')
  const panel = document.querySelector('#dvd-panel')
  const title = document.querySelector('#dvd-track')
  const state = document.querySelector('#dvd-state')
  const clock = document.querySelector('#dvd-clock')
  const previous = document.querySelector('#dvd-prev')
  const play = document.querySelector('#dvd-play')
  const next = document.querySelector('#dvd-next')
  const playIcon = play.querySelector('use')
  const queue = document.querySelector('#dvd-queue')
  const position = document.querySelector('#dvd-position')
  const volume = document.querySelector('#dvd-volume')
  const notice = document.querySelector('#dvd-notice')
  const importButton = document.querySelector('#dvd-import')
  const files = document.querySelector('#dvd-files')
  document.querySelector('#dvd-reference').href = historia.playlist

  let tracks = []
  let current = 0
  let importedUrls = []
  let playAttempt = 0

  function setExpanded(isExpanded) {
    const label = isExpanded ? 'Recolher player' : 'Expandir player'
    panel.hidden = !isExpanded
    expand.setAttribute('aria-expanded', String(isExpanded))
    expand.setAttribute('aria-label', label)
    expand.title = label
  }

  function showNotice(message) {
    notice.textContent = message
    if (message) setExpanded(true)
  }

  function updateTransport() {
    const playing = !audio.paused && !audio.ended && !audio.error
    const label = playing ? 'Pausar' : 'Tocar'
    play.setAttribute('aria-label', label)
    play.title = label
    playIcon.setAttribute('href', playing ? '#i-pause' : '#i-play')
    if (tracks.length) {
      state.textContent = audio.error ? 'ERRO' : playing ? 'TOCANDO' : 'EM PAUSA'
    }
  }

  function updatePosition() {
    const seconds = Math.floor(audio.currentTime)
    const duration = audio.duration
    clock.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
    position.disabled = !Number.isFinite(duration) || duration <= 0
    position.max = position.disabled ? 1 : duration
    position.value = seconds
  }

  async function startPlayback() {
    const attempt = ++playAttempt
    try {
      await audio.play()
    } catch (error) {
      if (attempt === playAttempt && error.name !== 'AbortError' && !audio.error) {
        showNotice('Toque em ▶ para iniciar a reprodução.')
      }
    }
  }

  function selectTrack(index, shouldPlay) {
    const track = tracks[index]
    playAttempt++
    current = index
    queue.value = String(index)
    title.textContent = track.label
    title.title = track.label
    showNotice('')
    audio.src = track.src
    updatePosition()
    updateTransport()
    if (shouldPlay) startPlayback()
  }

  function changeTrack(step, shouldPlay) {
    if (!tracks.length) return
    selectTrack((current + step + tracks.length) % tracks.length, shouldPlay)
  }

  function setQueue(newTracks) {
    tracks = newTracks
    if (!tracks.length) return
    queue.replaceChildren(...tracks.map((track, index) => new Option(track.label, index)))
    queue.disabled = previous.disabled = next.disabled = tracks.length < 2
    selectTrack(0, false)
  }

  expand.addEventListener('click', () => setExpanded(panel.hidden))
  play.addEventListener('click', () => {
    if (!tracks.length) {
      setExpanded(true)
      importButton.focus()
    } else if (audio.paused || audio.ended) {
      startPlayback()
    } else {
      playAttempt++
      audio.pause()
    }
  })
  previous.addEventListener('click', () => changeTrack(-1, !audio.paused))
  next.addEventListener('click', () => changeTrack(1, !audio.paused))
  queue.addEventListener('change', () => selectTrack(Number(queue.value), !audio.paused))
  position.addEventListener('input', () => { audio.currentTime = Number(position.value) })
  volume.addEventListener('input', () => { audio.volume = Number(volume.value) / 100 })
  audio.volume = Number(volume.value) / 100

  for (const event of ['play', 'playing', 'pause', 'emptied']) {
    audio.addEventListener(event, updateTransport)
  }
  for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'emptied']) {
    audio.addEventListener(event, updatePosition)
  }
  audio.addEventListener('ended', () => changeTrack(1, true))
  audio.addEventListener('error', () => {
    updateTransport()
    if (tracks.length) showNotice('Faixa indisponível. Escolha outra faixa ou selecione outro arquivo.')
  })

  importButton.addEventListener('click', () => files.click())
  files.addEventListener('change', () => {
    const selected = [...files.files]
    if (!selected.length) return

    const oldUrls = importedUrls
    importedUrls = selected.map((file) => URL.createObjectURL(file))
    audio.pause()
    setQueue(selected.map((file, index) => ({
      label: file.name.replace(/\.[^.]+$/, ''),
      src: importedUrls[index],
    })))
    oldUrls.forEach((url) => URL.revokeObjectURL(url))
    files.value = ''
  })

  setQueue(historia.musicas.map((track) => ({
    label: [track.titulo, track.artista].filter(Boolean).join(' · ') || track.arquivo,
    src: 'musicas/' + encodeURIComponent(track.arquivo),
  })))
}

initDvdPlayer()
