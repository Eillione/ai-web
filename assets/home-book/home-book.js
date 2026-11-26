(function () {
  "use strict";

  const experience = document.querySelector("[data-home-book-experience]");
  if (!experience || experience.dataset.initialized === "true") return;
  experience.dataset.initialized = "true";

  const motion = window.gsap;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = experience.querySelector("[data-book-loader]");
  const loaderBar = experience.querySelector("[data-book-loader-bar]");
  const loaderValue = experience.querySelector("[data-book-loader-value]");
  const mosaic = experience.querySelector("[data-book-mosaic]");
  const stage = experience.querySelector("[data-book-stage]");
  const video = experience.querySelector("[data-book-video]");
  const cameraVideo = experience.querySelector("[data-camera-video]");
  const videoCutout = experience.querySelector("[data-book-video-cutout]");
  const notebookFinal = experience.querySelector("[data-book-notebook-final]");
  const pageNodes = Array.from(experience.querySelectorAll("[data-book-page]"));
  const pages = new Map(pageNodes.map((node) => [node.dataset.bookPage, node]));
  // The opening film resolves into the first browsable spread: the cart page.
  // Intro remains in the loop as the supplied personal-profile composition.
  const pageOrder = ["cart", "intro", "objects"];
  let activePage = "cart";
  let introReady = false;
  let objectScene = null;
  let objectSceneLoading = null;
  let introVisual = video;
  let pageTurnCleanupTimer = 0;

  function enableVideoFallback() {
    experience.classList.add("video-cutout-fallback");
    introVisual = video;
  }

  document.body.classList.add("home-book-active", "home-book-in-view");

  function makeMosaic() {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 48; index += 1) {
      const tile = document.createElement("span");
      tile.style.setProperty("--tile-index", index);
      fragment.appendChild(tile);
    }
    mosaic.appendChild(fragment);
  }

  function setLoadingValue(value) {
    const rounded = Math.max(0, Math.min(100, Math.round(value)));
    loaderValue.textContent = String(rounded).padStart(2, "0");
    loaderBar.style.transform = `scaleX(${rounded / 100})`;
  }

  function initializeGameLoader() {
    const pixel = loader?.querySelector("[data-game-pixel]");
    let audioContext = null;
    const tones = { up: 520, right: 660, down: 390, left: 440, a: 880, b: 260, start: 1040 };

    function playTone(name) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioContext ||= new AudioContext();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = name === "b" ? "square" : "triangle";
      oscillator.frequency.setValueAtTime(tones[name] || 620, audioContext.currentTime);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.11);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.12);
    }

    loader?.querySelectorAll("[data-game-control]").forEach((button) => {
      button.addEventListener("pointerdown", () => {
        const action = button.dataset.gameControl;
        playTone(action);
        loader.classList.remove("game-action-up", "game-action-right", "game-action-down", "game-action-left", "game-action-a", "game-action-b", "game-action-start");
        void loader.offsetWidth;
        loader.classList.add(`game-action-${action}`);
        if (pixel) pixel.textContent = action === "a" ? "★" : action === "b" ? "♥" : "Welcome";
      });
    });
  }

  async function waitForCartArtwork() {
    const cart = pages.get("cart");
    const artwork = Array.from(cart?.querySelectorAll(".cart-layout-reference, .cart-basket") || []);
    let timer;
    await Promise.race([
      Promise.allSettled(artwork.map((image) => image.decode?.())),
      new Promise((resolve) => { timer = window.setTimeout(resolve, 800); }),
    ]);
    window.clearTimeout(timer);
  }

  function initializeVideoCutout() {
    if (!video || !videoCutout) return null;
    // Chromium blocks local file videos from being uploaded to a WebGL texture.
    // The portfolio is commonly previewed directly from index.html, so use the
    // visible video layer in that mode instead of leaving the intro blank.
    if (window.location.protocol === "file:") return null;
    const gl = videoCutout.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return null;

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      precision highp float;
      uniform sampler2D u_video;
      varying vec2 v_uv;

      float roundedBookMask(vec2 uv) {
        vec2 center = vec2(0.505, 0.505);
        vec2 halfSize = vec2(0.342, 0.342);
        float radius = 0.035;
        vec2 q = abs(uv - center) - halfSize + radius;
        float distanceToBox = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
        return 1.0 - smoothstep(-0.012, 0.022, distanceToBox);
      }

      void main() {
        vec3 color = texture2D(u_video, v_uv).rgb;
        float maximum = max(color.r, max(color.g, color.b));
        float minimum = min(color.r, min(color.g, color.b));
        float chroma = maximum - minimum;
        float saturation = chroma / max(maximum, 0.001);
        float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));

        float redOverGreen = smoothstep(0.012, 0.105, color.r - color.g);
        float greenOverBlue = smoothstep(-0.018, 0.082, color.g - color.b);
        float warmRange = redOverGreen * greenOverBlue;
        float tanRange = smoothstep(0.055, 0.22, saturation)
          * smoothstep(0.10, 0.30, luminance)
          * (1.0 - smoothstep(0.88, 0.99, luminance));
        float preservePaper = (1.0 - smoothstep(0.075, 0.17, saturation))
          * smoothstep(0.58, 0.86, luminance);
        float preserveRed = smoothstep(0.22, 0.42, color.r - color.g);
        float wood = warmRange * tanRange * (1.0 - preservePaper) * (1.0 - preserveRed);

        float matte = roundedBookMask(v_uv);
        float alpha = matte * (1.0 - smoothstep(0.16, 0.78, wood));
        alpha *= smoothstep(0.015, 0.055, alpha);

        float spill = wood * 0.12;
        vec3 neutral = vec3(luminance);
        color = mix(color, neutral, spill);
        gl_FragColor = vec4(color, alpha);
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

    const position = gl.getAttribLocation(program, "a_position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.clearColor(0, 0, 0, 0);
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_video"), 0);

    function resize() {
      const rect = videoCutout.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(2, Math.min(1600, Math.round(rect.width * pixelRatio)));
      const height = Math.max(2, Math.min(900, Math.round(rect.height * pixelRatio)));
      if (videoCutout.width !== width || videoCutout.height !== height) {
        videoCutout.width = width;
        videoCutout.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    let renderingDisabled = false;

    function render() {
      if (!videoCutout.isConnected || renderingDisabled) return;
      resize();
      if (video.readyState >= 2 && video.videoWidth) {
        try {
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          videoCutout.dataset.frameReady = "true";
        } catch (error) {
          renderingDisabled = true;
          enableVideoFallback();
          return;
        }
      }
      window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);
    return { resize };
  }

  function markIntroReady() {
    if (introReady) return;
    introReady = true;
    experience.classList.add("is-intro-ready");
    if (video) video.pause();
    notebookFinal?.setAttribute("aria-hidden", "false");

    if (!motion || prefersReducedMotion) {
      if (introVisual) introVisual.style.visibility = "hidden";
      if (notebookFinal) {
        notebookFinal.style.opacity = "1";
        notebookFinal.style.visibility = "visible";
      }
      goToPage("cart", 1);
      return;
    }

    // Keep the intro composition ready for the later page, but move directly
    // from the full-frame film to the cart spread on first load.
    motion.set(notebookFinal, { autoAlpha: 1 });
    motion.timeline({ defaults: { ease: "power2.inOut" } })
      .to(introVisual, { autoAlpha: 0, duration: 0.42 })
      .add(() => goToPage("cart", 1), "-=0.08");
  }

  function startIntroVideo() {
    if (!video || prefersReducedMotion) {
      markIntroReady();
      return;
    }
    if (video.readyState === 0) video.load();
    try {
      video.currentTime = 0;
    } catch (error) {
      // A few local-file video implementations reject seeking before metadata.
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        enableVideoFallback();
        window.setTimeout(markIntroReady, 2200);
      });
    }
    video.addEventListener("playing", () => {
      window.setTimeout(() => {
        if (!videoCutout?.dataset.frameReady) enableVideoFallback();
      }, 900);
    }, { once: true });
    video.addEventListener("error", () => {
      enableVideoFallback();
      window.setTimeout(markIntroReady, 900);
    }, { once: true });
    video.addEventListener("ended", markIntroReady, { once: true });
    window.setTimeout(() => {
      if (!introReady && video.readyState < 2) {
        enableVideoFallback();
        markIntroReady();
      }
    }, 5200);
  }

  function revealExperience() {
    mosaic.hidden = true;
    experience.classList.add("is-revealed");
  }

  async function boot() {
    revealExperience();
    initializeGameLoader();
    setLoadingValue(4);
    await waitForCartArtwork();
    setLoadingValue(100);
    introReady = true;
    experience.classList.add("is-intro-ready");
    activePage = "cart";
    setPageAccessibility("cart");
    experience.dataset.page = "cart";
    animateCartEntrance();
    window.dispatchEvent(new CustomEvent("homearchive:ready"));
    loader.classList.add("is-complete");
    window.setTimeout(() => {
      loader.hidden = true;
    }, prefersReducedMotion ? 80 : 620);
  }

  function setPageAccessibility(name) {
    pageNodes.forEach((page) => {
      const isActive = page.dataset.bookPage === name;
      page.classList.toggle("is-active", isActive);
      page.setAttribute("aria-hidden", isActive ? "false" : "true");
      if (!isActive) page.setAttribute("inert", "");
      else page.removeAttribute("inert");
    });
  }

  function makePageTurnSnapshot(page, direction) {
    const snapshot = page.cloneNode(true);
    snapshot.classList.add("book-page-turn-snapshot");
    snapshot.classList.remove("is-active");
    snapshot.removeAttribute("data-book-page");
    snapshot.setAttribute("aria-hidden", "true");
    snapshot.setAttribute("inert", "");
    snapshot.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    const sourceCanvases = page.querySelectorAll("canvas");
    snapshot.querySelectorAll("canvas").forEach((node, index) => {
      const source = sourceCanvases[index];
      if (source && source.width && source.height) {
        node.width = source.width;
        node.height = source.height;
        try {
          node.getContext("2d")?.drawImage(source, 0, 0, source.width, source.height);
        } catch (_) {}
      }
      node.setAttribute("aria-hidden", "true");
    });
    snapshot.querySelectorAll("video").forEach((node) => {
      node.pause?.();
      node.setAttribute("aria-hidden", "true");
    });
    snapshot.dataset.turnDirection = direction > 0 ? "forward" : "backward";
    return snapshot;
  }

  function createPageTurnLayer(previous, next, direction) {
    const turn = document.createElement("div");
    turn.className = `book-page-turn-leaf book-page-turn-leaf--${direction > 0 ? "forward" : "backward"}`;
    turn.setAttribute("aria-hidden", "true");

    const front = document.createElement("div");
    front.className = "book-page-turn-leaf__face book-page-turn-leaf__face--front";
    front.appendChild(makePageTurnSnapshot(previous, direction));

    const back = document.createElement("div");
    back.className = "book-page-turn-leaf__face book-page-turn-leaf__face--back";
    back.appendChild(makePageTurnSnapshot(next, direction));

    const edge = document.createElement("span");
    edge.className = "book-page-turn-leaf__edge";
    const curl = document.createElement("span");
    curl.className = "book-page-turn-leaf__curl";
    const holes = document.createElement("span");
    holes.className = "book-page-turn-leaf__holes";
    turn.append(front, back, curl, holes, edge);

    const shadow = document.createElement("div");
    shadow.className = `book-page-turn-shadow book-page-turn-shadow--${direction > 0 ? "forward" : "backward"}`;
    shadow.setAttribute("aria-hidden", "true");

    stage.append(shadow, turn);
    return { turn, shadow };
  }

  function goToPage(name, direction = 1) {
    if (!pages.has(name) || name === activePage) return;
    if (activePage === "intro" && !introReady) markIntroReady();
    const previous = pages.get(activePage);
    const next = pages.get(name);
    if (document.activeElement instanceof HTMLElement && previous.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    const oldName = activePage;
    activePage = name;

    next.classList.add("is-active");
    next.removeAttribute("inert");
    next.setAttribute("aria-hidden", "false");

    if (!motion || prefersReducedMotion) {
      setPageAccessibility(name);
    } else {
      motion.killTweensOf([previous, next]);
      stage?.classList.add("is-page-turning");
      stage?.querySelectorAll(".book-page-turn-leaf, .book-page-turn-shadow").forEach((node) => node.remove());
      const { turn, shadow } = createPageTurnLayer(previous, next, direction);
      const frontFace = turn.querySelector(".book-page-turn-leaf__face--front");
      const backFace = turn.querySelector(".book-page-turn-leaf__face--back");
      const fixedHalf = direction > 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)";
      const rotation = direction > 0 ? -180 : 180;
      motion.set(previous, { clipPath: fixedHalf, autoAlpha: 1, zIndex: 4 });
      motion.set(next, { autoAlpha: 1, zIndex: 2 });
      motion.set(turn, {
        rotationY: 0,
        scaleX: 1,
        transformPerspective: 40000,
        "--turn-curl": "1.5%",
        "--turn-edge-inset": "0%",
        "--turn-shade": 0.08,
      });
      motion.set(shadow, { autoAlpha: 0, scaleX: 0.08, xPercent: 0 });
      frontFace.style.opacity = "1";
      frontFace.style.visibility = "visible";
      backFace.style.opacity = "0";
      backFace.style.visibility = "hidden";
      let turnCleaned = false;
      const finishTurn = () => {
        if (turnCleaned) return;
        turnCleaned = true;
        window.clearTimeout(pageTurnCleanupTimer);
        turn.remove();
        shadow.remove();
        setPageAccessibility(name);
        stage?.classList.remove("is-page-turning");
        motion.set([previous, next], { clearProps: "transform,filter,zIndex,opacity,visibility,clipPath" });
      };
      const timeline = motion.timeline({
        onComplete: finishTurn,
        onInterrupt: finishTurn,
      });
      timeline
        .to(turn, {
          rotationY: rotation * 0.37,
          scaleX: 0.92,
          "--turn-curl": "20%",
          "--turn-edge-inset": "1.5%",
          "--turn-shade": 0.68,
          duration: 0.28,
          ease: "sine.inOut",
        }, 0)
        .to(shadow, { autoAlpha: 0.28, scaleX: 0.86, duration: 0.28, ease: "sine.inOut" }, 0)
        .call(() => {
          frontFace.style.opacity = "0";
          frontFace.style.visibility = "hidden";
          backFace.style.opacity = "1";
          backFace.style.visibility = "visible";
        }, null, 0.335)
        .to(turn, {
          rotationY: rotation * 0.63,
          scaleX: 0.92,
          "--turn-curl": "20%",
          "--turn-shade": 0.68,
          duration: 0.12,
          ease: "sine.inOut",
        }, 0.28)
        .to(shadow, { autoAlpha: 0.28, scaleX: 1, duration: 0.12, ease: "sine.inOut" }, 0.28)
        .to(turn, {
          rotationY: rotation,
          scaleX: 1,
          "--turn-curl": "1.5%",
          "--turn-edge-inset": "0%",
          "--turn-shade": 0.08,
          duration: 0.28,
          ease: "power2.out",
        }, 0.4)
        .to(shadow, { autoAlpha: 0, scaleX: 0.12, duration: 0.28, ease: "sine.out" }, 0.4)
        .to(previous, { autoAlpha: 0, duration: 0.04, ease: "none" }, 0.64);
      pageTurnCleanupTimer = window.setTimeout(finishTurn, 900);
    }

    experience.dataset.page = name;
    if (name === "cart") animateCartEntrance();
    if (name === "objects") void prepareObjectScene();
    if (oldName === "objects" && name !== "objects") {
      stopCameraVideo();
      closeObjectDialog();
    }
  }

  experience.querySelectorAll("[data-book-next]").forEach((button) => {
    button.addEventListener("click", () => goToPage(button.dataset.bookNext, 1));
  });
  experience.querySelectorAll("[data-book-prev]").forEach((button) => {
    button.addEventListener("click", () => goToPage(button.dataset.bookPrev, -1));
  });

  function initializePageSwipe() {
    if (!stage) return;
    let gesture = null;
    const interactiveSelector = 'a, button, [role="button"], dialog, [data-draggable-item], [data-object-focus], .book-id-card-motion';

    stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(interactiveSelector)) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
      stage.classList.add("is-page-dragging");
      stage.setPointerCapture?.(event.pointerId);
    });

    const finish = (event) => {
      if (!gesture || gesture.id !== event.pointerId) return;
      const deltaX = event.clientX - gesture.x;
      const deltaY = event.clientY - gesture.y;
      gesture = null;
      stage.classList.remove("is-page-dragging");
      if (Math.abs(deltaX) < 64 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;
      const currentIndex = pageOrder.indexOf(activePage);
      const direction = deltaX < 0 ? 1 : -1;
      const nextIndex = (currentIndex + direction + pageOrder.length) % pageOrder.length;
      goToPage(pageOrder[nextIndex], direction);
    };

    stage.addEventListener("pointerup", finish);
    stage.addEventListener("pointercancel", () => {
      gesture = null;
      stage.classList.remove("is-page-dragging");
    });
  }

  function animateCartEntrance() {
    const items = Array.from(experience.querySelectorAll("[data-draggable-item]"));
    if (!motion || prefersReducedMotion) return;
    motion.fromTo(items, { opacity: 0, scale: 0.72 }, {
      opacity: 1,
      scale: 1,
      duration: 0.9,
      stagger: 0.07,
      ease: "back.out(1.45)",
      clearProps: "opacity,scale",
    });
  }

  function stopCameraVideo() {
    if (!cameraVideo?.hasAttribute("src")) return;
    cameraVideo.pause();
    cameraVideo.removeAttribute("src");
    cameraVideo.load();
  }

  function initializeCameraVideo() {
    if (!cameraVideo) return;
    const cameraScreen = cameraVideo.closest(".object-camera__screen");
    const videoSources = [cameraVideo.dataset.cameraPrimarySrc, cameraVideo.dataset.cameraSecondarySrc].filter(Boolean);
    let videoIndex = 0;

    const playCurrentVideo = () => {
      const source = videoSources[videoIndex];
      if (!source) return;
      if (cameraVideo.getAttribute("src") !== source) cameraVideo.src = source;
      cameraVideo.play().catch(() => {});
    };

    experience.querySelectorAll("[data-camera-action]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.cameraAction;
        if (action === "switch" && videoSources.length > 1) {
          videoIndex = (videoIndex + 1) % videoSources.length;
          playCurrentVideo();
        } else if (action === "pause") {
          cameraVideo.pause();
        } else if (action === "toggle") {
          if (cameraVideo.paused) playCurrentVideo();
          else cameraVideo.pause();
        }
      });
    });

    cameraScreen?.addEventListener("click", (event) => {
      event.preventDefault();
      playCurrentVideo();
    });
    cameraScreen?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      playCurrentVideo();
    });
    window.addEventListener("hashchange", () => {
      if (location.hash && location.hash !== "#home") stopCameraVideo();
    });
  }

  function initializeDragging() {
    const cartStage = experience.querySelector("[data-cart-stage]");
    if (!cartStage) return;
    let topZ = 20;
    experience.querySelectorAll("[data-draggable-item]").forEach((item) => {
      let drag = null;
      const scheduleWiggle = () => {
        window.setTimeout(() => {
          if (!item.classList.contains("is-dragging")) {
            item.style.setProperty("--wiggle-x", `${(Math.random() * 10 - 5).toFixed(1)}px`);
            item.style.setProperty("--wiggle-y", `${(Math.random() * 8 - 4).toFixed(1)}px`);
            item.style.setProperty("--wiggle-r", `${(Math.random() * 5 - 2.5).toFixed(1)}deg`);
            item.classList.add("is-wiggling");
            window.setTimeout(() => {
              item.classList.remove("is-wiggling");
              item.style.setProperty("--wiggle-x", "0px");
              item.style.setProperty("--wiggle-y", "0px");
              item.style.setProperty("--wiggle-r", "0deg");
              scheduleWiggle();
            }, 500 + Math.random() * 1000);
          } else {
            scheduleWiggle();
          }
        }, 1100 + Math.random() * 4200);
      };
      scheduleWiggle();
      item.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        const itemRect = item.getBoundingClientRect();
        const stageRect = cartStage.getBoundingClientRect();
        drag = {
          startX: event.clientX,
          startY: event.clientY,
          x: Number(item.dataset.dragX || 0),
          y: Number(item.dataset.dragY || 0),
          minX: stageRect.left - itemRect.left + Number(item.dataset.dragX || 0),
          maxX: stageRect.right - itemRect.right + Number(item.dataset.dragX || 0),
          minY: stageRect.top - itemRect.top + Number(item.dataset.dragY || 0),
          maxY: stageRect.bottom - itemRect.bottom + Number(item.dataset.dragY || 0),
        };
        item.style.zIndex = String(++topZ);
        item.classList.add("is-dragging");
        item.classList.remove("is-wiggling");
        item.style.setProperty("--wiggle-x", "0px");
        item.style.setProperty("--wiggle-y", "0px");
        item.style.setProperty("--wiggle-r", "0deg");
        item.setPointerCapture(event.pointerId);
      });
      item.addEventListener("pointermove", (event) => {
        if (!drag) return;
        const x = Math.max(drag.minX, Math.min(drag.maxX, drag.x + event.clientX - drag.startX));
        const y = Math.max(drag.minY, Math.min(drag.maxY, drag.y + event.clientY - drag.startY));
        item.dataset.dragX = String(x);
        item.dataset.dragY = String(y);
        item.style.setProperty("--drag-x", `${x}px`);
        item.style.setProperty("--drag-y", `${y}px`);
      });
      const finish = () => {
        drag = null;
        item.classList.remove("is-dragging");
      };
      item.addEventListener("pointerup", finish);
      item.addEventListener("pointercancel", finish);
    });
  }

  const dialog = experience.querySelector("[data-book-object-dialog]");
  const dialogContent = experience.querySelector("[data-book-dialog-content]");
  const objectContent = {
    about: {
      kicker: "01 / ABOUT",
      title: "在产品逻辑与视觉情绪之间",
      body: "我是沈婕薇 lvy，产品经理 / 自由设计师。八年儿童品牌工作经验（2019-2026），深耕纺织品类-儿童背包，文具等项目，熟悉布料及工艺结构以及供应链，近3年为跨境儿童玩具开发品牌工作，持续关注人群消费、市场趋势、展览与现代艺术。",
      actions: [{ label: "进入关于我", href: "#about" }],
    },
    skills: {
      kicker: "02 / SKILLS",
      title: "研究、设计与落地",
      body: "NPDP国际产品经理认证（pmp协会），AI项目管理师认证。产品规划、市场分析、供应链协作、CorelDRAW、Photoshop、Illustrator，以及 Codex / GPT 协作工作流。",
      actions: [{ label: "关于我", href: "#about" }],
    },
    work: {
      kicker: "03 / WORK",
      title: "从系统到具体物件",
      body: "涵盖儿童产品开发、纺织类产品、品牌视觉与研究文章。每个板块都保留项目逻辑、过程证据与最终展示。",
      actions: [{ label: "跨境产品开发", href: "#product-dev" }, { label: "纺织箱包设计", href: "#textile-design" }],
    },
    contact: {
      kicker: "04 / CONTACT",
      title: "让想法开始发生",
      body: "产品合作、自由设计与有趣的想法，都欢迎来信。Wechat：Eillioness · Business call：17859381562",
      actions: [{ label: "写邮件", href: "mailto:eillione@foxmail.com" }, { label: "联系方式", href: "#contact" }],
    },
  };

  function openObjectDialog(key) {
    const data = objectContent[key];
    if (!data || !dialog || !dialogContent) return;
    dialogContent.innerHTML = `<p>${data.kicker}</p><h2>${data.title}</h2><div>${data.body}</div><nav>${data.actions.map((action) => `<a href="${action.href}">${action.label} ↗</a>`).join("")}</nav>`;
    if (!dialog.open) dialog.showModal();
    dialog.dataset.object = key;
    requestAnimationFrame(() => dialog.classList.add("is-open"));
  }

  function closeObjectDialog() {
    if (!dialog?.open) return;
    dialog.classList.remove("is-open");
    window.setTimeout(() => {
      if (dialog.open) dialog.close();
    }, prefersReducedMotion ? 0 : 320);
    objectScene?.resetCamera();
  }

  experience.querySelector("[data-book-dialog-close]")?.addEventListener("click", closeObjectDialog);
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeObjectDialog();
  });
  dialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeObjectDialog();
  });

  async function prepareObjectScene() {
    if (!objectScene && !objectSceneLoading) {
      objectSceneLoading = (async () => {
        if (!window.THREE) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "assets/vendor/three-r149.min.js";
            script.onload = resolve;
            script.onerror = () => {
              script.remove();
              reject(new Error("Three.js could not be loaded"));
            };
            document.head.append(script);
          });
        }
        objectScene = createObjectScene(window.THREE);
      })().catch(() => {
        // The object's HTML navigation and camera remain available without WebGL.
      }).finally(() => { objectSceneLoading = null; });
    }
    await objectSceneLoading;
    if (activePage !== "objects" || !objectScene) return;
    objectScene.resize();
    objectScene.resetCamera(true);
  }

  function createObjectScene(THREE) {
    const canvas = experience.querySelector("[data-book-object-canvas]");
    if (!canvas || !THREE) return null;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    const homeCamera = new THREE.Vector3(0, 0.25, 8.4);
    const lookTarget = new THREE.Vector3(0, 0, 0);
    camera.position.copy(homeCamera);
    camera.lookAt(lookTarget);

    scene.add(new THREE.HemisphereLight(0xfffbef, 0x4b5361, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.1);
    key.position.set(-4, 6, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb9dfff, 2.2);
    rim.position.set(5, -2, 5);
    scene.add(rim);

    const chrome = new THREE.MeshPhysicalMaterial({ color: 0xd8dadb, metalness: 0.72, roughness: 0.2, clearcoat: 0.65, clearcoatRoughness: 0.12 });
    const darkChrome = new THREE.MeshPhysicalMaterial({ color: 0x777b82, metalness: 0.82, roughness: 0.28 });
    const paper = new THREE.MeshStandardMaterial({ color: 0xf7f2e7, roughness: 0.83, metalness: 0.02 });
    const burgundy = new THREE.MeshStandardMaterial({ color: 0x842b37, roughness: 0.48 });
    const green = new THREE.MeshStandardMaterial({ color: 0x70b984, roughness: 0.52 });
    const blue = new THREE.MeshStandardMaterial({ color: 0x65afd4, roughness: 0.46 });
    const pink = new THREE.MeshStandardMaterial({ color: 0xd980b0, roughness: 0.5 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xc49c49, metalness: 0.48, roughness: 0.3 });
    const carriers = [];
    const pickables = [];
    const focusGroups = new Map();

    function makeTube(points, radius = 0.018, material = chrome, closed = false) {
      const vectors = points.map((point) => new THREE.Vector3(point[0], point[1], point[2] || 0));
      const curve = vectors.length === 2 ? new THREE.LineCurve3(vectors[0], vectors[1]) : new THREE.CatmullRomCurve3(vectors, closed, "centripetal", 0.25);
      return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(8, vectors.length * 7), radius, 8, closed), material);
    }

    function roundedRectPoints(width, height, z = 0) {
      const x = width / 2;
      const y = height / 2;
      const inset = Math.min(width, height) * 0.12;
      return [[-x + inset, -y, z], [x - inset, -y, z], [x, -y + inset, z], [x, y - inset, z], [x - inset, y, z], [-x + inset, y, z], [-x, y - inset, z], [-x, -y + inset, z]];
    }

    function createCarrier() {
      const group = new THREE.Group();
      group.add(makeTube(roundedRectPoints(2.45, 1.72, 0), 0.028, chrome, true));
      group.add(makeTube(roundedRectPoints(2.08, 1.38, 0.025), 0.018, darkChrome, true));
      [-0.62, -0.31, 0, 0.31, 0.62].forEach((x) => group.add(makeTube([[x, -0.68, 0.04], [x, 0.68, 0.04]], 0.014, chrome)));
      [-0.44, -0.22, 0, 0.22, 0.44].forEach((y) => group.add(makeTube([[-1.02, y, 0.055], [1.02, y, 0.055]], 0.014, chrome)));
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.24, 1.5), new THREE.MeshBasicMaterial({ color: 0xd7d2c7, transparent: true, opacity: 0.22, depthWrite: false }));
      shadow.position.z = -0.04;
      group.add(shadow);
      return group;
    }

    function addObject(keyName, position, buildObject) {
      const carrier = createCarrier();
      carrier.position.set(position[0], position[1], position[2]);
      carrier.scale.setScalar(0.62);
      carrier.userData.focusKey = keyName;
      const object = buildObject();
      object.position.z = 0.22;
      object.userData.focusKey = keyName;
      carrier.add(object);
      carrier.traverse((child) => {
        child.userData.focusKey = keyName;
        if (child.isMesh) pickables.push(child);
      });
      carriers.push(carrier);
      focusGroups.set(keyName, carrier);
      scene.add(carrier);
    }

    addObject("about", [-1.65, 1.15, 0], () => {
      const group = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.07, 16, 64), gold);
      group.add(ring);
      const portrait = new THREE.Mesh(new THREE.SphereGeometry(0.36, 36, 24), new THREE.MeshPhysicalMaterial({ color: 0xc78978, roughness: 0.43, clearcoat: 0.2 }));
      portrait.scale.set(0.78, 1.05, 0.28);
      portrait.position.z = 0.05;
      group.add(portrait);
      const pin = makeTube([[-0.55, -0.52, 0], [0.55, 0.52, 0]], 0.018, chrome);
      pin.position.z = -0.04;
      group.add(pin);
      return group;
    });

    addObject("skills", [1.65, 1.15, 0], () => {
      const group = new THREE.Group();
      const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.25, 12), green);
      pencil.rotation.z = -0.62;
      group.add(pencil);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 12), gold);
      tip.position.set(0.37, 0.51, 0);
      tip.rotation.z = -0.62;
      group.add(tip);
      const blocks = [-0.35, 0, 0.35].map((x, index) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3 + index * 0.12, 0.26), [blue, pink, burgundy][index]);
        mesh.position.set(x, -0.28, 0.03);
        group.add(mesh);
        return mesh;
      });
      return group;
    });

    addObject("work", [-1.65, -1.15, 0], () => {
      const group = new THREE.Group();
      const bookA = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.62, 0.16), burgundy);
      bookA.rotation.z = 0.14;
      group.add(bookA);
      const bookB = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.56, 0.16), blue);
      bookB.position.set(0.14, 0.18, 0.18);
      bookB.rotation.z = -0.09;
      group.add(bookB);
      const product = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.32), paper);
      product.position.set(-0.34, 0.18, 0.34);
      group.add(product);
      return group;
    });

    addObject("contact", [1.65, -1.15, 0], () => {
      const group = new THREE.Group();
      const envelope = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.12), paper);
      group.add(envelope);
      const flapGeometry = new THREE.BufferGeometry();
      flapGeometry.setAttribute("position", new THREE.Float32BufferAttribute([-0.56,0.34,0.08, 0.56,0.34,0.08, 0,-0.12,0.15], 3));
      flapGeometry.setIndex([0,1,2]);
      flapGeometry.computeVertexNormals();
      const flap = new THREE.Mesh(flapGeometry, pink);
      group.add(flap);
      const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32), burgundy);
      seal.rotation.x = Math.PI / 2;
      seal.position.set(0, -0.12, 0.18);
      group.add(seal);
      return group;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let focusedKey = null;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function pick(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(pickables, false)[0]?.object?.userData?.focusKey || null;
    }

    function focusObject(keyName) {
      const group = focusGroups.get(keyName);
      if (!group) return;
      focusedKey = keyName;
      const target = new THREE.Vector3();
      group.getWorldPosition(target);
      const destination = new THREE.Vector3(target.x, target.y, 4.35);
      if (!motion || prefersReducedMotion) {
        camera.position.copy(destination);
        lookTarget.copy(target);
        camera.lookAt(lookTarget);
        openObjectDialog(keyName);
        return;
      }
      motion.to(camera.position, { x: destination.x, y: destination.y, z: destination.z, duration: 0.86, ease: "power3.inOut" });
      motion.to(lookTarget, { x: target.x, y: target.y, z: target.z, duration: 0.86, ease: "power3.inOut", onUpdate: () => camera.lookAt(lookTarget), onComplete: () => openObjectDialog(keyName) });
      motion.to(group.rotation, { z: group.rotation.z + 0.07, duration: 0.8, ease: "power2.inOut", yoyo: true, repeat: 1 });
    }

    function resetCamera(immediate = false) {
      focusedKey = null;
      const duration = immediate || prefersReducedMotion ? 0 : 0.7;
      if (!motion || !duration) {
        camera.position.copy(homeCamera);
        lookTarget.set(0,0,0);
        camera.lookAt(lookTarget);
      } else {
        motion.to(camera.position, { x: homeCamera.x, y: homeCamera.y, z: homeCamera.z, duration, ease: "power3.inOut" });
        motion.to(lookTarget, { x: 0, y: 0, z: 0, duration, ease: "power3.inOut", onUpdate: () => camera.lookAt(lookTarget) });
      }
    }

    canvas.addEventListener("pointermove", (event) => {
      const keyName = pick(event);
      canvas.style.cursor = keyName ? "zoom-in" : "default";
    });
    canvas.addEventListener("click", (event) => {
      const keyName = pick(event);
      if (keyName) focusObject(keyName);
    });
    experience.querySelectorAll("[data-object-focus]").forEach((button) => {
      button.addEventListener("mouseenter", () => {
        const group = focusGroups.get(button.dataset.objectFocus);
        if (group && !focusedKey && motion) motion.to(group.position, { z: 0.18, duration: 0.3, ease: "power2.out" });
      });
      button.addEventListener("mouseleave", () => {
        const group = focusGroups.get(button.dataset.objectFocus);
        if (group && !focusedKey && motion) motion.to(group.position, { z: 0, duration: 0.35, ease: "power2.out" });
      });
      button.addEventListener("click", () => focusObject(button.dataset.objectFocus));
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas.parentElement);
    resize();

    let last = performance.now();
    function render(now) {
      const delta = Math.min(40, now - last);
      last = now;
      if (activePage === "objects") {
        carriers.forEach((carrier, index) => {
          if (!focusedKey) {
            carrier.rotation.z = Math.sin(now * 0.00045 + index * 1.7) * 0.015;
            carrier.position.z += (Math.sin(now * 0.001 + index) * 0.028 - carrier.position.z) * Math.min(1, delta * 0.003);
          }
        });
        renderer.render(scene, camera);
      }
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    return { resize, focusObject, resetCamera };
  }

  initializeDragging();
  initializePageSwipe();
  initializeCameraVideo();

  function initializeNotebookEffects() {
    if (!notebookFinal) return;
    const reset = () => {
      notebookFinal.style.setProperty("--notebook-x", "50%");
      notebookFinal.style.setProperty("--notebook-y", "50%");
      notebookFinal.style.setProperty("--notebook-shift-x", "0px");
      notebookFinal.style.setProperty("--notebook-shift-y", "0px");
    };
    reset();
    notebookFinal.addEventListener("pointermove", (event) => {
      if (!introReady || event.pointerType === "touch") return;
      const rect = notebookFinal.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      notebookFinal.style.setProperty("--notebook-x", `${(x * 100).toFixed(2)}%`);
      notebookFinal.style.setProperty("--notebook-y", `${(y * 100).toFixed(2)}%`);
      notebookFinal.style.setProperty("--notebook-shift-x", `${((x - 0.5) * 18).toFixed(2)}px`);
      notebookFinal.style.setProperty("--notebook-shift-y", `${((y - 0.5) * 18).toFixed(2)}px`);
    }, { passive: true });
    notebookFinal.addEventListener("pointerleave", reset);
  }

  initializeNotebookEffects();

  function initializeIdCardTilt() {
    const card = experience.querySelector(".book-id-card-motion");
    if (!card || prefersReducedMotion) return;
    const reset = () => {
      card.style.setProperty("--card-rx", "0deg");
      card.style.setProperty("--card-ry", "0deg");
    };
    reset();
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--card-rx", `${(-y * 10).toFixed(2)}deg`);
      card.style.setProperty("--card-ry", `${(x * 13).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", reset);
  }

  initializeIdCardTilt();

  function initializeContactReveal() {
    const contact = document.querySelector("#contact");
    if (!contact) return;
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      contact.classList.add("is-contact-visible");
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => contact.classList.toggle("is-contact-visible", entry.isIntersecting));
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    observer.observe(contact);
  }

  initializeContactReveal();

  function updateHeaderVisibility() {
    const rect = experience.getBoundingClientRect();
    document.body.classList.toggle("home-book-in-view", rect.bottom > window.innerHeight * 0.42 && rect.top < window.innerHeight * 0.58);
  }
  window.addEventListener("scroll", updateHeaderVisibility, { passive: true });
  window.addEventListener("resize", updateHeaderVisibility, { passive: true });

  boot();
})();
