/* =========================================================
   SHINE Refresh - script.js
   No dependencies. ~80 lines.
   ========================================================= */

(function () {
  'use strict';

  /* --- Sticky nav background on scroll -------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 80) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile nav toggle ---------------------------- */
  const navToggle = document.querySelector('.nav__toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
  }

  /* --- Mobile sticky CTA via IntersectionObserver -- */
  const hero = document.querySelector('.hero');
  const mobileCta = document.querySelector('.mobile-cta');
  if (hero && mobileCta) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mobileCta.classList.remove('visible');
            document.body.classList.remove('mobile-cta-visible');
          } else {
            mobileCta.classList.add('visible');
            document.body.classList.add('mobile-cta-visible');
          }
        });
      },
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    );
    io.observe(hero);

    /* Swap the sticky button to the family signup while The SHINE Experience is on screen */
    const familiesSection = document.getElementById('experience');
    const hostsBtn = mobileCta.querySelector('[data-mobile-cta="hosts"]');
    const familiesBtn = mobileCta.querySelector('[data-mobile-cta="families"]');
    if (familiesSection && hostsBtn && familiesBtn) {
      const familyIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            hostsBtn.hidden = entry.isIntersecting;
            familiesBtn.hidden = !entry.isIntersecting;
          });
        },
        { rootMargin: '-30% 0px -30% 0px', threshold: 0 }
      );
      familyIO.observe(familiesSection);
    }
  }

  /* --- FAQ tabs (For Hosts / For Families) ---------- */
  const faqTabs = Array.from(document.querySelectorAll('.faq-tabs__tab'));
  if (faqTabs.length) {
    const selectTab = (tab, focus) => {
      faqTabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', selected ? 'true' : 'false');
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    };
    faqTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => selectTab(tab, false));
      tab.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = faqTabs[(i + 1) % faqTabs.length];
        else if (e.key === 'ArrowLeft') next = faqTabs[(i - 1 + faqTabs.length) % faqTabs.length];
        else if (e.key === 'Home') next = faqTabs[0];
        else if (e.key === 'End') next = faqTabs[faqTabs.length - 1];
        if (next) { e.preventDefault(); selectTab(next, true); }
      });
    });
  }

  /* --- Video facade (play/pause/seek/volume/CC) ----- */
  const videoFacade = document.querySelector('.video__facade');
  if (videoFacade) {
    const progress = videoFacade.querySelector('.video__progress');
    const seekEl = videoFacade.querySelector('.video__seek');
    const currentTimeEl = videoFacade.querySelector('.video__time--current');
    const durationEl = videoFacade.querySelector('.video__time--duration');
    const muteBtn = videoFacade.querySelector('.video__mute');
    const volumeEl = videoFacade.querySelector('.video__volume');
    const ccBtn = videoFacade.querySelector('.video__cc');
    const id = videoFacade.dataset.youtubeId || 'dQw4w9WgXcQ';
    const title = videoFacade.dataset.videoTitle || 'SHINE: A Musical Theatre Creation Intensive';
    let iframe = null;
    let isPlaying = false;
    let duration = 0;
    let currentTime = 0;
    let pollId = null;
    let playbackBaseTime = 0;     // currentTime at last play()/seek
    let playbackStartedAt = 0;   // performance.now() at last play()/seek
    let captionsOn = false;
    let listeningAck = false;
    let listeningStartedAt = 0;

    const sendCommand = (func, args = []) => {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    };

    const sendEvent = (event) => {
      if (!iframe || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(JSON.stringify({ event }), '*');
    };

    const formatTime = (s) => {
      s = Math.max(0, Math.floor(s || 0));
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return m + ':' + (sec < 10 ? '0' + sec : sec);
    };

    const setPlaying = (state) => {
      isPlaying = state;
      videoFacade.classList.toggle('is-playing', state);
    };

    const updateSeekUI = () => {
      if (duration > 0) {
        seekEl.value = ((currentTime / duration) * 100).toFixed(2);
        seekEl.max = 100;
      }
      // When duration is unknown, leave seekEl.value at whatever the user dragged.
      currentTimeEl.textContent = formatTime(currentTime);
      durationEl.textContent = formatTime(duration);
    };

    const ensureIframe = () => {
      if (iframe) return iframe;
      Array.from(videoFacade.children).forEach((child) => {
        if (child !== progress && child.tagName !== 'IFRAME') {
          child.style.display = 'none';
        }
      });
      iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&controls=0&disablekb=1`;
      iframe.title = title;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      videoFacade.appendChild(iframe);
      progress.hidden = false;
      // Establish two-way communication: send {event:'listening'} and resend
      // until YouTube replies with a 'listening' event or sends initialDelivery.
      const startListening = () => {
        sendEvent('listening');
        listeningStartedAt = performance.now();
      };
      startListening();
      const listeningRetry = setInterval(() => {
        if (listeningAck || performance.now() - listeningStartedAt > 5000) {
          clearInterval(listeningRetry);
          return;
        }
        sendEvent('listening');
      }, 250);
      // YouTube's iframe takes a moment to be ready to respond. Retry
      // getDuration over several ticks so we always catch it.
      const queryPlayer = () => {
        sendCommand('getDuration');
        sendCommand('getCurrentTime');
        sendCommand('getVolume');
      };
      const queryCaptions = () => {
        sendCommand('loadModule', ['captions']);
        sendCommand('getOption', ['captions', 'tracklist']);
        sendCommand('setOption', ['captions', 'track', {}]);
      };
      setTimeout(queryPlayer, 300);
      setTimeout(queryCaptions, 600);
      setTimeout(queryPlayer, 1200);
      setTimeout(queryPlayer, 2500);
      return iframe;
    };

    const play = () => {
      if (!iframe) ensureIframe();
      else sendCommand('playVideo');
      setPlaying(true);
      startPolling();
      showControls();
    };

    const pause = () => {
      if (iframe) sendCommand('pauseVideo');
      setPlaying(false);
      stopPolling();
      // Controls stay visible while paused (no auto-hide timer running).
      clearTimeout(hideControlsTimer);
      videoFacade.classList.add('controls-visible');
    };

    const toggle = () => {
      if (isPlaying) pause();
      else play();
    };

    const poll = () => {
      if (!iframe) return;
      sendCommand('getCurrentTime');
    };
    /* Local time ticker: estimates currentTime between YouTube API responses
       so the seek bar moves smoothly even if postMessage replies are slow. */
    const tickLocal = () => {
      if (!isPlaying) return;
      const elapsed = (performance.now() - playbackStartedAt) / 1000;
      const est = Math.min(playbackBaseTime + elapsed, duration || 1e9);
      currentTime = est;
      updateSeekUI();
    };
    const startPolling = () => {
      if (pollId) return;
      playbackBaseTime = currentTime;
      playbackStartedAt = performance.now();
      pollId = setInterval(() => {
        if (isPlaying) {
          poll();
          tickLocal();
        }
      }, 200);
    };
    const stopPolling = () => {
      if (pollId) { clearInterval(pollId); pollId = null; }
    };

    const resetPlaybackBase = () => {
      playbackBaseTime = currentTime;
      playbackStartedAt = performance.now();
    };

    seekEl.addEventListener('input', () => {
      const pct = parseFloat(seekEl.value);
      const t = duration > 0 ? (pct / 100) * duration : pct;
      sendCommand('seekTo', [t, true]);
      currentTime = t;
      resetPlaybackBase();
    });

    volumeEl.addEventListener('input', () => {
      const v = parseInt(volumeEl.value, 10);
      sendCommand('setVolume', [v]);
      const muted = v === 0;
      videoFacade.classList.toggle('is-muted', muted);
      muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    });

    muteBtn.addEventListener('click', () => {
      const currentlyMuted = videoFacade.classList.contains('is-muted');
      if (currentlyMuted) {
        sendCommand('unMute');
        videoFacade.classList.remove('is-muted');
        muteBtn.setAttribute('aria-pressed', 'false');
        muteBtn.setAttribute('aria-label', 'Mute');
        if (parseInt(volumeEl.value, 10) === 0) volumeEl.value = 50;
        sendCommand('setVolume', [parseInt(volumeEl.value, 10)]);
      } else {
        sendCommand('mute');
        videoFacade.classList.add('is-muted');
        muteBtn.setAttribute('aria-pressed', 'true');
        muteBtn.setAttribute('aria-label', 'Unmute');
      }
    });

    const applyCaptions = (on) => {
      captionsOn = on;
      if (on) {
        sendCommand('loadModule', ['captions']);
        sendCommand('setOption', ['captions', 'track', { languageCode: 'en' }]);
      } else {
        sendCommand('setOption', ['captions', 'track', {}]);
      }
      ccBtn.classList.toggle('is-active', on);
      ccBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };

    ccBtn.addEventListener('click', () => applyCaptions(!captionsOn));

    /* --- Auto-hide the bottom controls after 3s of inactivity --- */
    let hideControlsTimer = null;
    const showControls = () => {
      videoFacade.classList.add('controls-visible');
      clearTimeout(hideControlsTimer);
      if (isPlaying) {
        hideControlsTimer = setTimeout(() => {
          videoFacade.classList.remove('controls-visible');
        }, 2000);
      }
    };
    ['mousemove', 'mouseenter', 'touchstart', 'touchmove', 'focus'].forEach((evt) => {
      videoFacade.addEventListener(evt, showControls, { passive: true });
    });

    videoFacade.addEventListener('click', (e) => {
      if (e.target.closest('.video__progress')) return;
      toggle();
    });

    document.addEventListener('keydown', (e) => {
      if (!videoFacade.classList.contains('is-playing')) return;
      if (e.key === 'Escape') { e.preventDefault(); pause(); }
      if (e.key === ' ' && document.activeElement === videoFacade) { e.preventDefault(); toggle(); }
      if (e.key === 'ArrowLeft' && duration) {
        sendCommand('seekTo', [Math.max(0, currentTime - 5), true]);
      }
      if (e.key === 'ArrowRight' && duration) {
        sendCommand('seekTo', [Math.min(duration, currentTime + 5), true]);
      }
    });

    window.addEventListener('message', (e) => {
      if (!iframe) return;
      let data;
      try { data = JSON.parse(e.data); } catch (_) { return; }
      if (!data || !['initialDelivery', 'infoDelivery', 'onStateChange', 'listening'].includes(data.event)) return;
      if (data.event === 'listening') { listeningAck = true; return; }
      const info = data.info || data;
      if (typeof info.playerState === 'number') {
        // 1 = playing, 2 = paused, 0 = ended, 3 = buffering, 5 = cued
        if (info.playerState === 1) { setPlaying(true); startPolling(); applyCaptions(false); }
        else if (info.playerState === 2 || info.playerState === 0) { setPlaying(false); stopPolling(); }
      }
      if (typeof info.currentTime === 'number') { currentTime = info.currentTime; updateSeekUI(); resetPlaybackBase(); }
      if (typeof info.duration === 'number') { duration = info.duration; updateSeekUI(); }
      if (typeof info.volume === 'number') {
        volumeEl.value = info.volume;
        const muted = info.muted === true || info.volume === 0;
        videoFacade.classList.toggle('is-muted', muted);
        muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
        muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
      }
      // YouTube can return the tracklist as an array on info or as a nested
      // option object. Handle both shapes; default to keeping the button visible.
      let tracklist = null;
      if (Array.isArray(info.captionsTracklist)) {
        tracklist = info.captionsTracklist;
      } else if (info.options && Array.isArray(info.options.captionsTracklist)) {
        tracklist = info.options.captionsTracklist;
      } else if (Array.isArray(info.tracklist)) {
        tracklist = info.tracklist;
      }
      if (tracklist !== null) {
        ccBtn.hidden = tracklist.length === 0;
      }
    });
  }

  /* --- Gallery lightbox ------------------------------ */
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.querySelector('.lightbox');
  if (galleryItems.length && lightbox) {
    const lbImg = lightbox.querySelector('.lightbox__img');
    const btnPrev = lightbox.querySelector('.lightbox__btn--prev');
    const btnNext = lightbox.querySelector('.lightbox__btn--next');
    const btnClose = lightbox.querySelector('.lightbox__close');
    let idx = 0;

    const sources = galleryItems.map((el) => ({
      src: el.querySelector('img').getAttribute('data-full') || el.querySelector('img').src,
      alt: el.querySelector('img').alt,
    }));

    const open = (i) => {
      idx = i;
      lbImg.src = sources[i].src;
      lbImg.alt = sources[i].alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };
    const prev = () => open((idx - 1 + sources.length) % sources.length);
    const next = () => open((idx + 1) % sources.length);

    galleryItems.forEach((el, i) => el.addEventListener('click', () => open(i)));
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
    btnClose.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    });
  }

  /* --- Forms: host inquiry + family interest -------------
     Submitted to Netlify Forms (see data-netlify on each <form>).
     Netlify detects the forms at deploy time and accepts an
     urlencoded POST to "/" carrying the hidden form-name field.
     When previewing locally (file:// or localhost) there is no
     Netlify endpoint, so we fall back to a pre-filled email. */
  const LEAD_EMAIL = 'brian@feinlineacademy.com';
  const SUBJECTS = {
    'host-inquiry': 'New SHINE host inquiry',
    'family-interest': 'SHINE family interest signup',
  };

  const isLocalPreview = () =>
    location.protocol === 'file:' ||
    /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  const validate = (form) => {
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.style.borderColor = bad ? '#e88a8a' : '';
      if (bad) ok = false;
    });
    return ok;
  };

  const mailtoFallback = (form) => {
    const data = new FormData(form);
    const subject = SUBJECTS[data.get('form-name')] || 'SHINE inquiry';
    const lines = [];
    data.forEach((v, k) => {
      if (k === 'form-name' || k === 'bot-field' || !String(v).trim()) return;
      lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ': ' + v);
    });
    window.location.href = 'mailto:' + LEAD_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  };

  const submitLead = async (form) => {
    if (isLocalPreview()) { mailtoFallback(form); return true; }
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  };

  const showError = (form, msg) => {
    let err = form.querySelector('.form__error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form__error';
      form.appendChild(err);
    }
    err.textContent = msg;
  };

  const inquiryForm = document.getElementById('inquiry-form');
  const inquirySuccess = document.getElementById('inquiry-success');
  if (inquiryForm && inquirySuccess) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(inquiryForm)) return;
      const btn = inquiryForm.querySelector('[type="submit"]');
      btn.disabled = true;
      const ok = await submitLead(inquiryForm);
      btn.disabled = false;
      if (!ok) {
        showError(inquiryForm, 'Something went wrong. Please email ' + LEAD_EMAIL + ' directly.');
        return;
      }
      inquiryForm.hidden = true;
      inquirySuccess.classList.add('is-open');
      inquirySuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  const familyForm = document.getElementById('family-form');
  if (familyForm) {
    familyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(familyForm)) return;
      const btn = familyForm.querySelector('[type="submit"]');
      btn.disabled = true;
      const ok = await submitLead(familyForm);
      btn.disabled = false;
      if (!ok) {
        showError(familyForm, 'Something went wrong. Please email ' + LEAD_EMAIL + ' directly.');
        return;
      }
      familyForm.querySelector('.families__form-row').hidden = true;
      familyForm.querySelector('.families__success').hidden = false;
    });
  }

  /* --- Scroll reveal (respects reduced motion) ---------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.section__head, .outcome, .step, .split__col, .case__inner, .brian, .families__story, .families__card, .families__signup, .program, .faq-tabs, .final-cta .container > *'
    );
    targets.forEach((el) => el.classList.add('reveal'));
    document.documentElement.classList.add('js-reveal');
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el) => revealIO.observe(el));
  }

  /* --- Smooth scroll with sticky nav offset (fallback) - */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      document.body.classList.remove('nav-open');
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
