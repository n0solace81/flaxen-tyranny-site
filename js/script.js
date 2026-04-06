/*
 * Client‑side logic for The Flaxen Tyranny landing page.
 * Handles regional link assignment, custom audio player controls and
 * highlighting active tracks.  The audio player is designed to load
 * metadata lazily and display accurate durations once available.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Region detection for Audible, Kindle and Paperback links
  const audibleLinks = {
    uk: 'https://www.audible.co.uk/pd/B0CM79DP7H',
    us: 'https://www.audible.com/pd/B0CM71JQYY'
  };
  const bookLinks = {
    uk: 'https://www.amazon.co.uk/dp/B0BVL1C9ZF',
    us: 'https://www.amazon.com/dp/B0BVL1C9ZF'
  };

  function detectRegion() {
    const lang = (navigator.language || '').toLowerCase();
    if (lang.startsWith('en-gb')) return 'uk';
    if (lang.startsWith('en-us')) return 'us';
    return null;
  }

  const region = detectRegion();
  const primaryCtas = [
    document.getElementById('primary-cta-top'),
    document.getElementById('primary-cta-bottom')
  ];
  if (region && audibleLinks[region]) {
    primaryCtas.forEach(el => {
      el.href = audibleLinks[region];
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  } else {
    // default fallback: link to Audible homepage; you may implement a region selector here
    primaryCtas.forEach(el => {
      el.href = 'https://www.audible.com/';
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  const kindleBtn = document.getElementById('kindle-button');
  const paperbackBtn = document.getElementById('paperback-button');
  if (region && bookLinks[region]) {
    kindleBtn.href = bookLinks[region];
    paperbackBtn.href = bookLinks[region];
  } else {
    // fallback to generic Amazon (US) listing
    kindleBtn.href = 'https://www.amazon.com/dp/B0BVL1C9ZF';
    paperbackBtn.href = 'https://www.amazon.com/dp/B0BVL1C9ZF';
  }
  kindleBtn.setAttribute('target', '_blank');
  kindleBtn.setAttribute('rel', 'noopener noreferrer');
  paperbackBtn.setAttribute('target', '_blank');
  paperbackBtn.setAttribute('rel', 'noopener noreferrer');

  // Audio player functionality
  const tracks = document.querySelectorAll('.audio-section .track');
  let currentAudio = null;

  tracks.forEach(track => {
    const button = track.querySelector('.play-pause');
    const audio = track.querySelector('audio');
    const progressContainer = track.querySelector('.progress-container');
    const progressBar = track.querySelector('.progress-bar');
    const currentTimeElem = track.querySelector('.current');
    const durationElem = track.querySelector('.duration');

    // Update duration when metadata loads
    audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(audio.duration)) {
        durationElem.textContent = formatTime(audio.duration);
      }
    });

    // Update progress bar and current time
    audio.addEventListener('timeupdate', () => {
      updateProgress(audio, progressBar, currentTimeElem);
    });

    // Reset when audio ends
    audio.addEventListener('ended', () => {
      pauseAudio(audio);
      audio.currentTime = 0;
      updateProgress(audio, progressBar, currentTimeElem);
    });

    // Play/pause toggle
    button.addEventListener('click', () => {
      if (audio.paused) {
        // pause any current audio
        if (currentAudio && currentAudio !== audio) {
          pauseAudio(currentAudio);
        }
        playAudio(audio);
      } else {
        pauseAudio(audio);
      }
    });

    // Seek on click
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percent = offsetX / rect.width;
      if (!isNaN(audio.duration)) {
        audio.currentTime = percent * audio.duration;
      }
    });
  });

  function playAudio(audio) {
    currentAudio = audio;
    audio.play();
    updateButtonStates();
  }

  function pauseAudio(audio) {
    audio.pause();
    updateButtonStates();
  }

  function updateButtonStates() {
    tracks.forEach(track => {
      const btn = track.querySelector('.play-pause');
      const audioEl = track.querySelector('audio');
      if (audioEl.paused) {
        btn.textContent = '▶';
        btn.setAttribute('aria-label', 'Play');
        track.classList.remove('active');
      } else {
        btn.textContent = '❚❚';
        btn.setAttribute('aria-label', 'Pause');
        track.classList.add('active');
      }
    });
  }

  function updateProgress(audio, progressBar, timeElem) {
    if (isNaN(audio.duration)) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + '%';
    timeElem.textContent = formatTime(audio.currentTime);
  }

  function formatTime(sec) {
    const minutes = Math.floor(sec / 60) || 0;
    const seconds = Math.floor(sec % 60) || 0;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
});