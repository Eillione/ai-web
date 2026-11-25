(function () {
  "use strict";

  const THREE = window.THREE;
  const canvas = document.querySelector("#review-canvas");
  const params = new URLSearchParams(location.search);
  const view = params.get("view") || "top";
  const transparent = params.get("alpha") === "1";
  document.querySelector("#review-label").textContent = `procedural basket · ${view}`;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: transparent, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0xf1eee5, transparent ? 0 : 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const cameraViews = {
    top: [0, 0, 15.2],
    orbitLeft: [-7.2, -5.6, 10.2],
    orbitRight: [7.2, -5.2, 9.8],
  };
  camera.position.fromArray(cameraViews[view] || cameraViews.top);
  camera.lookAt(0, 0, -0.25);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x303845, 2.15));
  const key = new THREE.DirectionalLight(0xffffff, 4.2);
  key.position.set(-4, 7, 9);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb9dcff, 2.6);
  rim.position.set(6, -3, 5);
  scene.add(rim);

  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xd6d9dd, metalness: 0.9, roughness: 0.18, clearcoat: 0.7, clearcoatRoughness: 0.1 });
  const darkChrome = new THREE.MeshPhysicalMaterial({ color: 0x747a82, metalness: 0.92, roughness: 0.24, clearcoat: 0.45 });
  const satin = new THREE.MeshPhysicalMaterial({ color: 0xe9e9e7, metalness: 0.72, roughness: 0.28, clearcoat: 0.82 });

  function makeTube(points, radius, material, closed) {
    const vectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2] || 0));
    const curve = vectors.length === 2
      ? new THREE.LineCurve3(vectors[0], vectors[1])
      : new THREE.CatmullRomCurve3(vectors, Boolean(closed), "centripetal", 0.18);
    return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(16, vectors.length * 8), radius, 10, Boolean(closed)), material);
  }

  function roundedRect(width, height, z, radiusScale) {
    const x = width / 2;
    const y = height / 2;
    const r = Math.min(width, height) * radiusScale;
    const points = [];
    const corners = [
      [x - r, -y + r, -Math.PI / 2, 0],
      [x - r, y - r, 0, Math.PI / 2],
      [-x + r, y - r, Math.PI / 2, Math.PI],
      [-x + r, -y + r, Math.PI, Math.PI * 1.5],
    ];
    corners.forEach(([cx, cy, start, end]) => {
      for (let index = 0; index <= 5; index += 1) {
        const angle = start + (end - start) * (index / 5);
        points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, z]);
      }
    });
    return points;
  }

  const basket = new THREE.Group();
  basket.scale.x = 0.95;
  basket.rotation.z = 0;
  scene.add(basket);

  basket.add(makeTube(roundedRect(4.25, 5.9, 0.34, 0.09), 0.075, chrome, true));
  basket.add(makeTube(roundedRect(3.68, 5.18, -0.38, 0.11), 0.045, darkChrome, true));
  basket.add(makeTube(roundedRect(2.7, 3.95, -0.55, 0.12), 0.045, chrome, true));

  const verticalXs = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5];
  verticalXs.forEach((x) => {
    const baseX = x * 0.76;
    basket.add(makeTube([[x, -2.8, 0.34], [baseX, -2.04, -0.48], [baseX, 2.04, -0.48], [x, 2.8, 0.34]], 0.037, chrome));
  });

  const horizontalYs = [-2.05, -1.55, -1.05, -0.52, 0, 0.52, 1.05, 1.55, 2.05];
  horizontalYs.forEach((y) => {
    const baseY = y * 0.82;
    basket.add(makeTube([[-2.22, y, 0.34], [-1.34, baseY, -0.48], [1.34, baseY, -0.48], [2.22, y, 0.34]], 0.037, chrome));
  });

  function handle(y) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.7, 24), satin);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, y, 0.42);
    basket.add(bar);
    [-1.46, 1.46].forEach((x) => {
      const hinge = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 10, 28, Math.PI * 1.7), darkChrome);
      hinge.position.set(x, y, 0.22);
      hinge.rotation.z = x < 0 ? 0.2 : Math.PI + 0.2;
      basket.add(hinge);
    });
  }
  handle(2.78);
  handle(-2.78);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.ShadowMaterial({ color: 0x5d5b56, opacity: 0.13 })
  );
  ground.position.z = -0.72;
  scene.add(ground);

  function resize() {
    const width = innerWidth;
    const height = innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  function render(now) {
    basket.rotation.z = Math.sin(now * 0.00035) * 0.008;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
