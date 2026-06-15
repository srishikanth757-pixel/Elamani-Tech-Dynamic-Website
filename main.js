/* ============================================================
   ELAMANI TECH — Production-Ready UI + Three.js Robot
   Complete rewrite with:
   - Delayed robot intro matching SVG loader proportions exactly
   - Smart scroll fast-forward for frame sections
   - Frame-rate independent animations via delta time
   - Proper Three.js disposal pipeline
   ============================================================ */

// ============================================================
// 1. LOADER — Progress-aware, fades out when first section loads
// ============================================================
var loaderProgressFill = document.getElementById('loader-progress-fill');
var loaderProgressText = document.getElementById('loader-progress-text');

function updateLoaderProgress(percent) {
  if (loaderProgressFill) loaderProgressFill.style.width = percent + '%';
  if (loaderProgressText) loaderProgressText.textContent = 'Loading... ' + Math.round(percent) + '%';
}

function dismissLoader() {
  var loader = document.getElementById('loader');
  if (loader && !loader.classList.contains('hidden')) {
    updateLoaderProgress(100);
    setTimeout(function() {
      loader.classList.add('hidden');
    }, 400);
  }
}
// Safety: always hide after 6s even if images fail
setTimeout(dismissLoader, 6000);

// ============================================================
// 2. HEADER SCROLL BEHAVIOR + SCROLL PROGRESS BAR
// ============================================================
var header = document.getElementById('main-header');
var scrollProgressBar = document.getElementById('scroll-progress');

var navScrollTimeout;

window.addEventListener('scroll', function() {
  if (header) {
    // Keep it solid based on scroll (optional now that it's mostly solid)
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Hide while actively scrolling, but don't hide if at the very top
    if (window.scrollY > 100) {
      header.classList.add('nav-hidden');
    }
    
    clearTimeout(navScrollTimeout);
    navScrollTimeout = setTimeout(function() {
      header.classList.remove('nav-hidden');
    }, 400);
  }
  
  // Scroll progress bar
  var scrollTop = window.scrollY;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgressBar) scrollProgressBar.style.width = scrollPercent + '%';
});

// ============================================================
// 3. MOBILE NAV TOGGLE
// ============================================================
var navToggle = document.getElementById('nav-toggle');
var navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', function() {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

var allNavLinks = navLinks.querySelectorAll('.nav-link');
for (var i = 0; i < allNavLinks.length; i++) {
  allNavLinks[i].addEventListener('click', function() {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
}

// ============================================================
// 4. SMOOTH SCROLL FOR NAV LINKS
// ============================================================
var anchors = document.querySelectorAll('a[href^="#"]');
for (var i = 0; i < anchors.length; i++) {
  anchors[i].addEventListener('click', function(e) {
    e.preventDefault();
    var targetId = this.getAttribute('href');
    var target = document.querySelector(targetId);
    if (target) {
      var headerOffset = 72;
      var elementPosition = target.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  });
}

// ============================================================
// 5. SCROLL REVEAL ANIMATIONS
// ============================================================
(function setupScrollReveal() {
  var revealElements = document.querySelectorAll(
    '.section-header, .about-content, .about-stats, ' +
    '.challenge-card, .founder-profile, .founder-content, ' +
    '.product-card, .revenue-streams, .market-opportunity, ' +
    '.trust-card, .footer-cta'
  );

  for (var i = 0; i < revealElements.length; i++) {
    revealElements[i].classList.add('reveal');
    var parent = revealElements[i].parentElement;
    if (parent) {
      var siblings = parent.querySelectorAll('.reveal');
      for (var j = 0; j < siblings.length; j++) {
        if (siblings[j] === revealElements[i] && j > 0 && j <= 5) {
          revealElements[i].classList.add('reveal-delay-' + j);
        }
      }
    }
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      for (var k = 0; k < entries.length; k++) {
        if (entries[k].isIntersecting) {
          entries[k].target.classList.add('visible');
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    for (var m = 0; m < revealElements.length; m++) {
      observer.observe(revealElements[m]);
    }
  } else {
    for (var n = 0; n < revealElements.length; n++) {
      revealElements[n].classList.add('visible');
    }
  }
})();

// ============================================================
// 6. STAT COUNTER ANIMATION
// ============================================================
(function animateCounters() {
  if (!('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        var el = entries[i].target;
        var value = el.querySelector('.metric-value');
        if (value && !value.dataset.animated) {
          value.dataset.animated = 'true';
          var text = value.textContent;
          var numMatch = text.match(/[\d.]+/);
          if (numMatch) {
            var finalNum = parseFloat(numMatch[0]);
            var prefix = text.substring(0, text.indexOf(numMatch[0]));
            var suffix = text.substring(text.indexOf(numMatch[0]) + numMatch[0].length);
            var current = 0;
            var step = finalNum / 40;
            var interval = setInterval(function() {
              current += step;
              if (current >= finalNum) {
                current = finalNum;
                clearInterval(interval);
              }
              value.textContent = prefix + (Number.isInteger(finalNum) ? Math.round(current) : current.toFixed(1)) + suffix;
            }, 30);
          }
        }
      }
    }
  }, { threshold: 0.5 });

  var metricCards = document.querySelectorAll('.metric-card');
  for (var j = 0; j < metricCards.length; j++) {
    observer.observe(metricCards[j]);
  }
})();

// ============================================================
// 7. SCROLL SEQUENCE ANIMATION (with Smart Fast-Forward)
// ============================================================
(function initScrollSequence() {
  var canvas = document.getElementById('seq-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  
  // High DPI Canvas Support
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Data State
  var sections = document.querySelectorAll('.seq-section');
  var sequenceData = [];
  var imageCache = {};
  
  sections.forEach(function(sec) {
    var folder = sec.getAttribute('data-folder');
    var maxFrames = parseInt(sec.getAttribute('data-frames'), 10);
    var isScrub = sec.getAttribute('data-scrub') === 'true';
    sequenceData.push({
      element: sec,
      folder: folder,
      maxFrames: maxFrames,
      isLoaded: false,
      contentRevealed: false,
      isScrub: isScrub
    });
  });

  function getImagePath(folder, frame) {
    var padded = String(frame).padStart(5, '0');
    return 'Section_wise/' + folder + '/' + padded + '.png';
  }

  // Smart preload with progress tracking
  var activePreloads = {};
  
  function preloadImages(folderIndex) {
    if (folderIndex >= sequenceData.length) return;
    var data = sequenceData[folderIndex];
    if (data.isLoaded) return;
    if (activePreloads[folderIndex]) return;
    
    activePreloads[folderIndex] = true;
    var loadedCount = 0;
    
    for (var i = 1; i <= data.maxFrames; i++) {
      var img = new Image();
      var path = getImagePath(data.folder, i);
      img.src = path;
      imageCache[path] = img;
      
      img.onload = function() {
        loadedCount++;
        
        // Report progress for first section to loader UI
        if (folderIndex === 0 && typeof updateLoaderProgress === 'function') {
          updateLoaderProgress((loadedCount / data.maxFrames) * 100);
        }
        
        if (loadedCount === data.maxFrames) {
          data.isLoaded = true;
          if (folderIndex === 0) {
            renderFrame(sequenceData[0], 1);
            // Dismiss loader once first section images are fully loaded
            if (typeof dismissLoader === 'function') dismissLoader();
          }
        }
      };
      
      img.onerror = function() {
        loadedCount++;
        if (folderIndex === 0 && typeof updateLoaderProgress === 'function') {
          updateLoaderProgress((loadedCount / data.maxFrames) * 100);
        }
        if (loadedCount === data.maxFrames) {
          data.isLoaded = true;
          if (folderIndex === 0 && typeof dismissLoader === 'function') dismissLoader();
        }
      };
    }
  }
  
  preloadImages(0);
  
  var currentSectionIndex = -1;
  var targetFrame = 1;
  var currentLerpFrame = 1;
  var lastDrawnFrame = -1;
  var previousImage = null;
  var crossfadeProgress = 1.0;
  var lerpLoopActive = false;
  
  // Track scroll velocity for fast-forward detection
  var lastScrollY = window.scrollY;
  var scrollVelocity = 0;
  var lastScrollTime = performance.now();
  
  function renderFrame(secData, frameIndex) {
    var path = getImagePath(secData.folder, frameIndex);
    var img = imageCache[path];
    if (img && img.complete && img.naturalWidth !== 0) {
      
      function getMetrics(image) {
        var canvasRatio = canvas.width / canvas.height;
        var imgRatio = image.width / image.height;
        var drawWidth, drawHeight, offsetX, offsetY;
        
        // COVER: fill the entire canvas
        if (canvasRatio > imgRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }
        return {w: drawWidth, h: drawHeight, x: offsetX, y: offsetY};
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (crossfadeProgress < 1.0 && previousImage) {
        var easeP = Math.sin((crossfadeProgress * Math.PI) / 2);
        
        var p = getMetrics(previousImage);
        ctx.globalAlpha = 1.0 - easeP;
        ctx.drawImage(previousImage, p.x, p.y, p.w, p.h);
        
        var c = getMetrics(img);
        ctx.globalAlpha = easeP;
        ctx.drawImage(img, c.x, c.y, c.w, c.h);
        
        ctx.globalAlpha = 1.0;
        crossfadeProgress += 0.04;
      } else {
        var m = getMetrics(img);
        ctx.drawImage(img, m.x, m.y, m.w, m.h);
        previousImage = img;
      }
    }
  }

  function updateScroll() {
    var wh = window.innerHeight;
    var now = performance.now();
    
    // Calculate scroll velocity (pixels per ms)
    var dt = now - lastScrollTime;
    if (dt > 0) {
      scrollVelocity = Math.abs(window.scrollY - lastScrollY) / dt;
    }
    lastScrollY = window.scrollY;
    lastScrollTime = now;
    
    var activeSecIndex = 0;
    var maxVisibleHeight = 0;
    
    for (var i = 0; i < sequenceData.length; i++) {
      var sec = sequenceData[i].element;
      var rect = sec.getBoundingClientRect();
      
      var visibleTop = Math.max(0, rect.top);
      var visibleBottom = Math.min(wh, rect.bottom);
      var visibleHeight = Math.max(0, visibleBottom - visibleTop);
      
      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        activeSecIndex = i;
      }
    }
    
    // Lazy load next section if near
    if (activeSecIndex + 1 < sequenceData.length) {
      preloadImages(activeSecIndex + 1);
    }
    
    var secData = sequenceData[activeSecIndex];
    
    // Lerp Target Calculation
    if (currentSectionIndex !== activeSecIndex) {
      currentSectionIndex = activeSecIndex;
      window.dispatchEvent(new CustomEvent('sectionChange', { detail: { index: activeSecIndex } }));
      
      if (previousImage) {
        crossfadeProgress = 0.0;
      }
      
      // Immediately calculate the target for the new section and snap the lerp frame
      var initRect = secData.element.getBoundingClientRect();
      var initScrub = wh * 3;
      var initProgress = Math.max(0, Math.min(1, (0 - initRect.top) / initScrub));
      targetFrame = Math.max(1, initProgress * secData.maxFrames);
      currentLerpFrame = targetFrame;
    }
    
    var rect = secData.element.getBoundingClientRect();
    // The total section is 400vh. The first 200vh of scroll drives the animation to 100%.
    // The remaining scroll distance brings the container into view over the frozen frame.
    var scrubDistance = wh * 2; 
    
    var progress = (0 - rect.top) / scrubDistance;
    progress = Math.max(0, Math.min(1, progress));
    
    targetFrame = Math.max(1, progress * secData.maxFrames);
  }

  // ──── LERP ANIMATION ENGINE ────
  function lerpEngine() {
    if (currentSectionIndex === -1) {
      requestAnimationFrame(lerpEngine);
      return;
    }
    
    var secData = sequenceData[currentSectionIndex];
    
    // Smoothly ease currentLerpFrame towards targetFrame
    currentLerpFrame += (targetFrame - currentLerpFrame) * 0.1;
    var frameToDraw = Math.round(currentLerpFrame);
    if (frameToDraw > secData.maxFrames) frameToDraw = secData.maxFrames;
    if (frameToDraw < 1) frameToDraw = 1;
    
    // Only re-render if the frame changed or if we are crossfading
    if (frameToDraw !== lastDrawnFrame || crossfadeProgress < 1.0) {
      renderFrame(secData, frameToDraw);
      lastDrawnFrame = frameToDraw;
    }
    
    requestAnimationFrame(lerpEngine);
  }
  
  lerpEngine();

  window.addEventListener('scroll', function() {
    requestAnimationFrame(updateScroll);
  });
  
  setTimeout(updateScroll, 100);
})();

// ============================================================
// 8. THEME SWITCHER LOGIC
// ============================================================
(function setupThemeSwitcher() {
  var themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  themeToggleBtn.addEventListener('click', function() {
    var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  });
})();

// ============================================================
// 9. INTERACTIVE 3D ROBOT — Matches SVG Loader Exactly
// ============================================================
(function initInteractiveRobot() {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. Robot disabled.');
    return;
  }
  
  var container = document.getElementById('robot-container');
  var menu = document.getElementById('robot-menu');
  if (!container) return;
  
  // ─── Scene Pipeline ───
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 14);
  
  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(200, 200);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);
  
  // ─── Groups ───
  var headGroup = new THREE.Group();
  var bodyGroup = new THREE.Group();
  var robotGroup = new THREE.Group();
  robotGroup.add(headGroup);
  robotGroup.add(bodyGroup);
  scene.add(robotGroup);
  
  // ─── Materials ───
  // These precisely match the SVG loader's color scheme:
  // - Body = currentColor (text-primary) 
  // - Eyes/Smile = bg-primary (cutout color)
  // - Antenna bulb + Wheels = accent blue
  
  var casingMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xf8fafc,       // Matches currentColor in dark mode
    metalness: 0.15,
    roughness: 0.7,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4
  });
  
  var accentMat = new THREE.MeshStandardMaterial({ 
    color: 0x0ea5e9,       // Matches var(--accent)
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.6
  });
  
  // Eyes: dark on light body (matching bg-primary cutouts in SVG)
  var eyeMat = new THREE.MeshBasicMaterial({ color: 0x06090a });
  
  var neckMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.8,
    metalness: 0.1
  });
  
  // ─── Dynamic Theme Colors ───
  function updateThemeColors() {
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (theme === 'light') {
      // Light theme → dark robot body (invert)
      casingMat.color.setHex(0x1e293b);
      neckMat.color.setHex(0x1e293b);
      eyeMat.color.setHex(0xf8fafc);
    } else {
      // Dark theme → light robot body
      casingMat.color.setHex(0xf8fafc);
      neckMat.color.setHex(0xf8fafc);
      eyeMat.color.setHex(0x06090a);
    }
  }
  updateThemeColors();
  window.addEventListener('themeChanged', updateThemeColors);
  
  // ──────────────────────────────────────────
  // BUILD ROBOT — Proportions from SVG loader
  // SVG viewBox is 100x100. We'll use a scale factor of 0.08 
  // so SVG unit 50 → world 4.0, etc. Origin at center of head.
  // ──────────────────────────────────────────
  var S = 0.08; // Scale factor: SVG units → Three.js world units
  
  // ─── HEAD ───
  // SVG: rect x=25, y=20, w=50, h=40, rx=10
  // Center of head rect: (50, 40). Width=50*S=4, Height=40*S=3.2
  var headW = 50 * S;   // 4.0
  var headH = 40 * S;   // 3.2
  var headD = 2.5;      // Depth (not in SVG, artistic choice)
  var headRx = 10 * S;  // 0.8 corner radius → we'll round via segments
  
  // Use RoundedBoxGeometry approach: BoxGeometry with beveled edges
  var headGeo = new THREE.BoxGeometry(headW, headH, headD, 4, 4, 4);
  var head = new THREE.Mesh(headGeo, casingMat);
  head.position.set(0, 0, 0); // Head is origin
  headGroup.add(head);
  
  // ─── EYES ───
  // SVG: Left eye cx=38, cy=35, r=5  → offset from head center (50,40): (-12, -5)
  // SVG: Right eye cx=62, cy=35, r=5 → offset: (+12, -5)
  var eyeR = 5 * S; // 0.4
  var eyeGeo = new THREE.SphereGeometry(eyeR, 16, 16);
  
  var leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-12 * S, 5 * S, headD / 2 + 0.01); // Front face
  headGroup.add(leftEye);
  
  var rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(12 * S, 5 * S, headD / 2 + 0.01);
  headGroup.add(rightEye);
  
  // ─── SMILE ───
  // SVG: path M 40 48 Q 50 55 60 48 → centered at (50, ~51), width 20
  // Offset from head center: (0, -11)   → y = -11*S = -0.88
  var smileGeo = new THREE.TorusGeometry(10 * S, 0.06, 8, 24, Math.PI);
  var smile = new THREE.Mesh(smileGeo, eyeMat);
  smile.rotation.z = Math.PI;        // Flip to be a smile (concave up)
  smile.position.set(0, -8 * S, headD / 2 + 0.01);
  headGroup.add(smile);
  
  // ─── ANTENNA LINE ───
  // SVG: line x1=50,y1=20 → x2=50,y2=10, stroke-width=4
  // Top of head is at y_center + headH/2 = 0 + 1.6. Line goes from y=20 to y=10
  // Offset from head center: (0, +20) to (0, +30)  → length = 10*S = 0.8
  var antH = 10 * S;
  var antLineGeo = new THREE.CylinderGeometry(2 * S, 2 * S, antH, 8);
  var antLine = new THREE.Mesh(antLineGeo, neckMat);
  antLine.position.set(0, headH / 2 + antH / 2, 0);
  headGroup.add(antLine);
  
  // ─── ANTENNA BULB ───
  // SVG: circle cx=50, cy=8, r=4 → top of antenna
  var bulbR = 4 * S; // 0.32
  var antBulbGeo = new THREE.SphereGeometry(bulbR, 16, 16);
  var antBulb = new THREE.Mesh(antBulbGeo, accentMat);
  antBulb.position.set(0, headH / 2 + antH + bulbR * 0.5, 0);
  headGroup.add(antBulb);
  
  // ─── NECK ───
  // SVG: rect x=45, y=60, w=10, h=5  → center offset from head center (50,40): (0, -20 to -25)
  var neckW = 10 * S;  // 0.8
  var neckH = 5 * S;   // 0.4
  var neckGeo = new THREE.BoxGeometry(neckW, neckH, neckW);
  var neck = new THREE.Mesh(neckGeo, neckMat);
  neck.position.set(0, -headH / 2 - neckH / 2, 0);
  headGroup.add(neck);
  
  // ─── TORSO ───
  // SVG: rect x=35, y=65, w=30, h=25, rx=5 → center (50, 77.5)
  // Offset from head center: (0, -37.5)
  var torsoW = 30 * S; // 2.4
  var torsoH = 25 * S; // 2.0
  var torsoD = 1.8;
  var torsoGeo = new THREE.BoxGeometry(torsoW, torsoH, torsoD, 2, 2, 2);
  var torso = new THREE.Mesh(torsoGeo, casingMat);
  torso.position.set(0, -(headH / 2 + neckH + torsoH / 2), 0);
  bodyGroup.add(torso);
  
  // ─── WHEELS ───
  // SVG: Left cx=35, cy=90, r=6  → offset from head center: (-15, -50)
  // SVG: Right cx=65, cy=90, r=6 → offset: (+15, -50)
  var wheelR = 6 * S; // 0.48
  var wheelD = 4 * S;  // 0.32 depth
  var wheelGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelD, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  
  var wheelY = -(headH / 2 + neckH + torsoH + wheelR * 0.2);
  
  var leftWheel = new THREE.Mesh(wheelGeo, accentMat);
  leftWheel.position.set(-15 * S, wheelY, 0);
  bodyGroup.add(leftWheel);
  
  var rightWheel = new THREE.Mesh(wheelGeo, accentMat);
  rightWheel.position.set(15 * S, wheelY, 0);
  bodyGroup.add(rightWheel);
  
  // Center the entire robot vertically in the canvas
  robotGroup.position.y = 1.0;
  
  // ─── Studio Lighting ───
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  var keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(4, 6, 8);
  scene.add(keyLight);
  
  var fillLight = new THREE.DirectionalLight(0x0ea5e9, 0.4);
  fillLight.position.set(-6, 2, 4);
  scene.add(fillLight);
  
  var rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(0, -2, -6);
  scene.add(rimLight);
  
  // ─── Interaction State ───
  var targetRotationX = 0;
  var targetRotationY = 0;
  var isMenuOpen = false;
  
  // ─── Idle Animation State ───
  var lastMouseMoveTime = 0;
  var isBlinking = false;
  var blinkTimer = 0;
  var nextBlinkTime = 3 + Math.random() * 4; // Random blink interval 3-7s
  var nextTiltTime = 8 + Math.random() * 6;  // Random head tilt 8-14s
  var idleTiltX = 0;
  var idleTiltZ = 0;
  
  // Mouse tracking
  window.addEventListener('mousemove', function(event) {
    var nx = (event.clientX / window.innerWidth) * 2 - 1;
    var ny = -(event.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = nx * 0.7;
    targetRotationX = ny * 0.35;
    lastMouseMoveTime = performance.now();
  });
  
  // ─── Delayed Introduction ───
  // Robot starts completely hidden, then gracefully rises in after 3.5s
  // (aligned with loader dismissal at 3s + a small buffer)
  var targetVis = 0;
  var currentVis = 0;
  
  setTimeout(function() {
    targetVis = 1;
  }, 3500);
  
  // ─── Hide on Scroll, Show When Stopped ───
  var scrollTimeout;
  window.addEventListener('scroll', function() {
    targetVis = 0;
    container.classList.add('scrolling');
    
    // Close menu while scrolling
    if (isMenuOpen) {
      isMenuOpen = false;
      if (menu) menu.classList.remove('active');
    }
    
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      targetVis = 1;
      container.classList.remove('scrolling');
    }, 400);
  });
  
  // ─── Click → Toggle Quick Menu ───
  renderer.domElement.addEventListener('pointerdown', function(e) {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
    if (menu) {
      menu.classList.toggle('active', isMenuOpen);
    }
    // Click bounce
    headGroup.position.z = -0.4;
  });
  
  // Close menu on outside click
  document.addEventListener('pointerdown', function(event) {
    if (isMenuOpen && !container.contains(event.target)) {
      isMenuOpen = false;
      if (menu) menu.classList.remove('active');
    }
  });
  
  // ─── Animation Loop (delta-time driven) ───
  var clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
    var time = clock.getElapsedTime();
    
    // Smooth visibility lerp (used for intro + scroll hide)
    var visLerp = 1 - Math.pow(0.005, delta);
    currentVis += (targetVis - currentVis) * visLerp;
    
    // Creative transition: scale down, drop, and gentle spiral
    var easedVis = currentVis * currentVis * (3 - 2 * currentVis); // smoothstep
    robotGroup.scale.setScalar(0.3 + easedVis * 0.7);
    robotGroup.position.y = 1.0 + Math.sin(time * 1.8) * 0.15 - (1 - easedVis) * 6;
    robotGroup.rotation.z = (1 - easedVis) * Math.PI * 0.8;
    
    // Click bump recovery
    headGroup.position.z += (0 - headGroup.position.z) * 5 * delta;
    
    // Smooth head tracking (frame-rate independent)
    var trackLerp = 1 - Math.pow(0.003, delta);
    headGroup.rotation.y += (targetRotationY + idleTiltZ * 0.3 - headGroup.rotation.y) * trackLerp;
    headGroup.rotation.x += (targetRotationX + idleTiltX * 0.15 - headGroup.rotation.x) * trackLerp;
    
    // Subtle body follow
    bodyGroup.rotation.y += (targetRotationY * 0.25 - bodyGroup.rotation.y) * trackLerp;
    
    // ─── Idle Animations (when mouse hasn't moved for 3s) ───
    var mouseIdleMs = performance.now() - lastMouseMoveTime;
    
    if (mouseIdleMs > 3000) {
      // Blinking
      blinkTimer += delta;
      if (blinkTimer > nextBlinkTime && !isBlinking) {
        isBlinking = true;
        // Squash eyes vertically to simulate a blink
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
        setTimeout(function() {
          leftEye.scale.y = 1;
          rightEye.scale.y = 1;
          isBlinking = false;
          blinkTimer = 0;
          nextBlinkTime = 2 + Math.random() * 4;
        }, 150);
      }
      
      // Curious head tilt
      if (time % (nextTiltTime) < 0.05) {
        idleTiltX = (Math.random() - 0.5) * 2;
        idleTiltZ = (Math.random() - 0.5) * 2;
        nextTiltTime = 6 + Math.random() * 8;
      }
    } else {
      // Reset idle state when mouse is active
      blinkTimer = 0;
      idleTiltX += (0 - idleTiltX) * trackLerp;
      idleTiltZ += (0 - idleTiltZ) * trackLerp;
    }
    
    // Gentle antenna glow pulse
    accentMat.emissiveIntensity = 0.6 + Math.sin(time * 2.5) * 0.3;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // ─── Cleanup on page unload (prevent memory leaks) ───
  window.addEventListener('beforeunload', function() {
    scene.traverse(function(child) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(function(m) { m.dispose(); });
        } else {
          child.material.dispose();
        }
      }
    });
    renderer.dispose();
  });
})();

// ============================================================
// 10. FLOATING PARTICLE BACKGROUND
// ============================================================
(function initParticles() {
  var canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  
  var particles = [];
  var PARTICLE_COUNT = 60;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
  
  // Create particles
  for (var i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1
    });
  }
  
  var mouseX = -1000;
  var mouseY = -1000;
  
  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var isDark = (document.documentElement.getAttribute('data-theme') || 'dark') === 'dark';
    var dotColor = isDark ? '255, 255, 255' : '15, 23, 42';
    var lineColor = isDark ? '14, 165, 233' : '14, 165, 233';
    
    // Update and draw particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      
      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + dotColor + ', ' + p.alpha + ')';
      ctx.fill();
      
      // Draw lines to nearby particles
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var dx = p.x - p2.x;
        var dy = p.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          var lineAlpha = (1 - dist / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(' + lineColor + ', ' + lineAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      
      // Mouse repulsion — particles gently flee the cursor
      var mdx = p.x - mouseX;
      var mdy = p.y - mouseY;
      var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < 100 && mDist > 0) {
        var force = (100 - mDist) / 100 * 0.5;
        p.x += (mdx / mDist) * force;
        p.y += (mdy / mDist) * force;
      }
    }
    
    requestAnimationFrame(drawParticles);
  }
  
  drawParticles();
})();

// ============================================================
// 11. AUDIO MANAGEMENT SYSTEM
// ============================================================
(function initAudioSystem() {
  var audioToggle = document.getElementById('audio-toggle');
  if (!audioToggle) return;
  
  var isAudioEnabled = true;
  audioToggle.classList.add('playing');
  var currentPlayingIndex = -1;
  var audioElements = [];
  var FADE_TIME = 800; // ms
  
  // Initialize up to 6 audio objects
  for (var i = 1; i <= 6; i++) {
    var audio = new Audio('Section_wise/audio/' + i + '.mp3');
    audio.loop = true;
    audio.volume = 0; // start muted for fade-in
    audioElements.push(audio);
  }
  
  function fadeAudio(audio, targetVolume, duration) {
    if (!audio) return;
    var startVol = audio.volume;
    var startTime = performance.now();
    
    function fadeStep(time) {
      var elapsed = time - startTime;
      var progress = Math.min(elapsed / duration, 1);
      audio.volume = startVol + (targetVolume - startVol) * progress;
      if (progress < 1) {
        requestAnimationFrame(fadeStep);
      } else if (targetVolume === 0) {
        audio.pause();
      }
    }
    
    if (targetVolume > 0 && audio.paused) {
      // Browsers block play() without interaction. We wrap in try-catch.
      var playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(function(error) {
          console.warn("Audio play blocked:", error);
          // Do NOT disable the audio UI state! Keep it 'true'.
          // The unlockAudioOnInteraction listener will naturally start it.
        });
      }
    }
    requestAnimationFrame(fadeStep);
  }
  
  audioToggle.addEventListener('click', function() {
    isAudioEnabled = !isAudioEnabled;
    audioToggle.classList.toggle('playing', isAudioEnabled);
    
    if (isAudioEnabled && currentPlayingIndex !== -1 && audioElements[currentPlayingIndex]) {
      fadeAudio(audioElements[currentPlayingIndex], 0.6, FADE_TIME);
    } else {
      // Pause all
      audioElements.forEach(function(aud) {
        if (!aud.paused) fadeAudio(aud, 0, FADE_TIME);
      });
    }
  });
  
  window.addEventListener('sectionChange', function(e) {
    var newIndex = e.detail.index;
    if (newIndex >= audioElements.length) newIndex = audioElements.length - 1;
    
    if (currentPlayingIndex === newIndex) return;
    
    // Fade out old
    if (currentPlayingIndex !== -1 && audioElements[currentPlayingIndex]) {
      fadeAudio(audioElements[currentPlayingIndex], 0, FADE_TIME);
    }
    
    currentPlayingIndex = newIndex;
    
    // Fade in new if enabled
    if (isAudioEnabled && audioElements[currentPlayingIndex]) {
      fadeAudio(audioElements[currentPlayingIndex], 0.6, FADE_TIME);
    }
  });

  // Browser Autoplay Policy Workaround:
  // Play the audio on the first user interaction (scroll, click, touch, keydown)
  var hasInteracted = false;
  function unlockAudioOnInteraction() {
    if (hasInteracted) return;
    hasInteracted = true;
    
    if (isAudioEnabled && currentPlayingIndex !== -1 && audioElements[currentPlayingIndex]) {
      var aud = audioElements[currentPlayingIndex];
      if (aud.paused) {
        aud.play().catch(function(){}); // silently fail if still blocked
      }
    }
    
    window.removeEventListener('scroll', unlockAudioOnInteraction);
    window.removeEventListener('click', unlockAudioOnInteraction);
    window.removeEventListener('touchstart', unlockAudioOnInteraction);
    window.removeEventListener('keydown', unlockAudioOnInteraction);
  }
  
  window.addEventListener('scroll', unlockAudioOnInteraction, { once: true });
  window.addEventListener('click', unlockAudioOnInteraction, { once: true });
  window.addEventListener('touchstart', unlockAudioOnInteraction, { once: true });
  window.addEventListener('keydown', unlockAudioOnInteraction, { once: true });
  
})();

