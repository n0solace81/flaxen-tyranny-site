/*
 * Client‑side logic for The Flaxen Tyranny landing page.
 * Handles store selection pop‑ups for Audible links, custom audio
 * player controls, and highlighting of active tracks.  The audio
 * player is designed to load metadata lazily and display accurate
 * durations once available.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Store selector toggle for Audible CTA
  const ctaButtons = document.querySelectorAll('.primary-cta');
  const storeSelectors = document.querySelectorAll('.store-selector');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Prevent default navigation; we want to open selector instead
      e.preventDefault();
      const container = btn.parentElement;
      const selector = container.querySelector('.store-selector');
      const isOpen = selector.classList.contains('open');
      // Close all selectors first
      storeSelectors.forEach(sel => sel.classList.remove('open'));
      if (!isOpen) {
        selector.classList.add('open');
      }
    });
  });
  // Close store selector on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cta-container')) {
      storeSelectors.forEach(sel => sel.classList.remove('open'));
    }
  });

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