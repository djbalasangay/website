// main.js - all JS in one file
document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     MENU & MOBILE TOGGLE
  ========================= */
  (function() {
    const hamburgers = document.querySelectorAll('.hamburger');
    hamburgers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const menu = document.querySelector('.mobile-menu');
        if (!menu) return;
        const isShown = menu.style.display === 'flex';
        menu.style.display = isShown ? 'none' : 'flex';
        menu.setAttribute('aria-hidden', String(!isShown));
        if (e.currentTarget) e.currentTarget.setAttribute('aria-expanded', String(!isShown));
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (ev) => {
      const menu = document.querySelector('.mobile-menu');
      if (!menu) return;
      const hb = ev.target.closest('.hamburger');
      if (hb) return;
      if (!ev.target.closest('.mobile-menu')) {
        menu.style.display = 'none';
        menu.setAttribute('aria-hidden', 'true');
        hamburgers.forEach(h => h.setAttribute('aria-expanded', 'false'));
      }
    });

    // highlight current page link
    document.querySelectorAll('.nav-link, .nav-right a').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const current = location.pathname.split('/').pop() || 'index.html';
      if (href === current || (href === 'index.html' && current === '')) a.classList.add('active-link');
    });
  })();

  /* =========================
     SLIDER WITH DOTS & TOUCH
  ========================= */
  (function() {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const dotsContainer = document.getElementById('mainDots') || document.querySelector('.slider-dots');
    let idx = 0, timer;

    // create dots
    slides.forEach((s,i) => {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i===0 ? ' active':'');
      dot.addEventListener('click', () => show(i));
      dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

    function show(i) {
      slides.forEach(s=>s.classList.remove('active'));
      dots.forEach(d=>d.classList.remove('active'));
      slides[i].classList.add('active');
      dots[i].classList.add('active');
      idx = i;
    }

    function next() {
      show((idx+1) % slides.length);
    }

    timer = setInterval(next, 4000);

    // touch support
    let startX = 0;
    slider.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    slider.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if(Math.abs(diff) > 40) diff > 0 ? next() : show((idx-1+slides.length)%slides.length);
    });
  })();

  /* =========================
     STATS ANIMATION
  ========================= */
  (function() {
    const nums = document.querySelectorAll('.stat-num');
    if(!nums.length) return;

    function animate(el) {
      const target = +el.dataset.target || 0;
      const duration = 1400;
      let start = 0;
      const step = Math.max(1, Math.round(target / (duration/20)));
      const t = setInterval(() => {
        start += step;
        if(start >= target){ el.textContent = target; clearInterval(t); }
        else el.textContent = start;
      }, 20);
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          nums.forEach(n => animate(n));
          obs.disconnect();
        }
      });
    }, {threshold:0.3});

    obs.observe(document.querySelector('.stats-section'));
  })();

  /* =========================
     TESTIMONIALS SLIDER
  ========================= */
  (function() {
    const cards = document.querySelectorAll('.testi-card');
    if(!cards.length) return;
    let i=0;
    setInterval(() => {
      cards.forEach(c=>c.classList.remove('active'));
      cards[i%cards.length].classList.add('active');
      i++;
    }, 3600);
  })();

  /* =========================
     COURSES FILTER
  ========================= */
  (function() {
    const buttons = document.querySelectorAll('.filter-btn');
    const grid = document.getElementById('coursesGrid');
    if(!buttons.length || !grid) return;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        grid.querySelectorAll('.course-card').forEach(card => {
          card.style.display = (f==='all' || card.dataset.type===f) ? '' : 'none';
        });
      });
    });
  })();

  /* =========================
     GALLERY & LIGHTBOX
  ========================= */
  (function() {
    const imgs = document.querySelectorAll('.gallery-grid img.lazy');
    imgs.forEach(img => {
      const src = img.dataset.src;
      if(src) img.src = src;
      img.classList.remove('lazy');
    });

    const galleryImgs = document.querySelectorAll('.gallery-grid img');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbClose = document.getElementById('lbClose');

    galleryImgs.forEach(img => {
      img.addEventListener('click', () => {
        lbImg.src = img.src;
        lightbox.classList.remove('hidden');
      });
    });

    if(lbClose) lbClose.addEventListener('click', () => lightbox.classList.add('hidden'));
    if(lightbox) lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) lightbox.classList.add('hidden');
    });

    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden'))
        lightbox.classList.add('hidden');
    });
  })();

  /* =========================
     NEWS RENDER + LOCAL STORAGE
  ========================= */
  (function() {
    const LS = 'lyceum_news_v2';
    const defaultNews = [
      {id:1, title:'Lyceum High Shines at TASSAA 2025', summary:'Champions in Volleyball (Girls), Badminton (B&G), Table Tennis (B&G) and cultural awards.', category:'Sports', date:new Date().toISOString()},
      {id:2, title:'Delegates at PCNE XI', summary:'Lyceum delegates joined PCNE XI to renew mission and evangelization.', category:'Evangelization', date:new Date().toISOString()},
      {id:3, title:'Free PhilHealth Konsulta', summary:'Community health outreach and free eye check-ups.', category:'Outreach', date:new Date().toISOString()}
    ];

    function load(){ 
      try { 
        const raw = localStorage.getItem(LS);
        return raw ? JSON.parse(raw) : defaultNews;
      } catch(e){ localStorage.removeItem(LS); return defaultNews; } 
    }
    function save(arr){ localStorage.setItem(LS, JSON.stringify(arr)); }
    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

    function renderList(targetEl, filter='all'){
      const arr = load().slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
      targetEl.innerHTML = '';
      arr.filter(it => filter==='all' || it.category===filter).forEach(item => {
        const art = document.createElement('article');
        art.className = 'news-card';
        art.innerHTML = `<h3>${escapeHtml(item.title)}</h3>
                         <p>${escapeHtml(item.summary)}</p>
                         <p class="muted small">${escapeHtml(item.category)} • ${new Date(item.date).toLocaleString()}</p>`;
        targetEl.appendChild(art);
      });
    }

    const indexList = document.getElementById('newsList');
    if(indexList) renderList(indexList);

    const newsGrid = document.getElementById('newsGrid');
    if(newsGrid){
      renderList(newsGrid);
      document.querySelectorAll('.news-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.news-filter').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderList(newsGrid, btn.dataset.filter);
        });
      });
    }

    const addForm = document.getElementById('addNewsForm');
    if(addForm){
      addForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('nTitle').value.trim();
        const summary = document.getElementById('nSummary').value.trim();
        const category = document.getElementById('nCategory').value || 'General';
        if(!title || !summary) return alert('Please fill title and summary.');
        const arr = load();
        arr.push({id:Date.now(), title, summary, category, date: new Date().toISOString()});
        save(arr);
        if(indexList) renderList(indexList);
        addForm.reset();
        const det = document.getElementById('adminAdd'); if(det) det.open = false;
      });
    }

    const clearBtn = document.getElementById('clearNews');
    if(clearBtn) clearBtn.addEventListener('click', () => {
      if(confirm('Clear local news?')){
        localStorage.removeItem(LS);
        if(indexList) renderList(indexList);
        if(newsGrid) renderList(newsGrid);
      }
    });

    // auto-rotate last to top every 12s
    setInterval(() => {
      const arr = load();
      if(arr.length>1){
        const last = arr.pop();
        last.date = new Date().toISOString();
        arr.unshift(last);
        save(arr);
        if(indexList) renderList(indexList);
        if(newsGrid) renderList(newsGrid);
      }
    }, 12000);
  })();

  /* =========================
     SMOOTH SCROLL ANCHORS
  ========================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth'});
      const navLinks = document.getElementById('nav-links');
      if(navLinks && navLinks.classList.contains('active')) navLinks.classList.remove('active');
    });
  });

});
