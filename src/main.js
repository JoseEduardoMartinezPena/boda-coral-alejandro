import "./styles/main.css";

/**
 * ============================================
 * INVITACIÓN DE BODA - CORAL & ALEJANDRO
 * JavaScript Principal
 * ============================================
 */

/**
 * 1. CONTADOR REGRESIVO
 * Calcula el tiempo hasta la boda (6 de marzo 2027)
 */
class Countdown {
  constructor() {
    this.targetDate = new Date("2027-03-06T17:00:00-06:00").getTime(); // Hora de ceremonia (UTC-6)
    this.elements = {
      dias: document.querySelector('[data-countdown="days"]'),
      horas: document.querySelector('[data-countdown="hours"]'),
      minutos: document.querySelector('[data-countdown="minutes"]'),
      segundos: document.querySelector('[data-countdown="seconds"]'),
    };
    this.init();
  }

  init() {
    this.update(); // Actualizar inmediatamente
    this.interval = setInterval(() => this.update(), 1000); // Actualizar cada segundo
  }

  update() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    if (distance < 0) {
      this.complete();
      return;
    }

    const dias = Math.floor(distance / (1000 * 60 * 60 * 24));
    const horas = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutos = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distance % (1000 * 60)) / 1000);

    this.updateElement(this.elements.dias, dias);
    this.updateElement(this.elements.horas, horas);
    this.updateElement(this.elements.minutos, minutos);
    this.updateElement(this.elements.segundos, segundos);
  }

  updateElement(element, value) {
    const formattedValue = String(value).padStart(2, "0");
    if (element && element.textContent !== formattedValue) {
      element.textContent = formattedValue;
      element.classList.add("updated");
      setTimeout(() => element.classList.remove("updated"), 600);
    }
  }

  complete() {
    clearInterval(this.interval);
    const contador = document.querySelector(".contador");
    if (contador) {
      contador.classList.add("contador--completed");
    }
  }
}

/**
 * 2. GALERÍA LIGHTBOX
 * Abre imágenes en modal cuando se hacen click
 */
class Gallery {
  constructor() {
    this.images = document.querySelectorAll("[data-lightbox]");
    this.currentIndex = 0;
    this.init();
  }

  init() {
    // Crear modal HTML
    this.createLightbox();

    // Event listeners
    this.images.forEach((img, index) => {
      img.addEventListener("click", () => this.open(index));
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (!this.lightbox || !this.lightbox.classList.contains("active")) return;

      if (e.key === "Escape") this.close();
      if (e.key === "ArrowLeft") this.prev();
      if (e.key === "ArrowRight") this.next();
    });
  }

  createLightbox() {
    this.lightbox = document.createElement("div");
    this.lightbox.className = "lightbox";
    this.lightbox.innerHTML = `
      <div class="lightbox__content">
        <img class="lightbox__image" src="" alt="" loading="lazy" />
        <button class="lightbox__close" aria-label="Cerrar galería">×</button>
        <button class="lightbox__nav lightbox__prev" aria-label="Imagen anterior">‹</button>
        <button class="lightbox__nav lightbox__next" aria-label="Siguiente imagen">›</button>
        <span class="lightbox__counter"></span>
      </div>
    `;

    document.body.appendChild(this.lightbox);

    // Event listeners del modal
    this.lightbox
      .querySelector(".lightbox__close")
      .addEventListener("click", () => this.close());
    this.lightbox
      .querySelector(".lightbox__prev")
      .addEventListener("click", () => this.prev());
    this.lightbox
      .querySelector(".lightbox__next")
      .addEventListener("click", () => this.next());
    this.lightbox.addEventListener("click", (e) => {
      if (e.target === this.lightbox) this.close();
    });
  }

  open(index) {
    this.currentIndex = index;
    const img = this.images[index];
    const lightboxImg = this.lightbox.querySelector(".lightbox__image");
    const counter = this.lightbox.querySelector(".lightbox__counter");

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    counter.textContent = `${index + 1} / ${this.images.length}`;

    this.lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.open(this.currentIndex);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.open(this.currentIndex);
  }
}

/**
 * 3. FORMULARIO RSVP - NETLIFY FORMS
 * Invitaciones Personalizadas
 */
class PersonalizedInvitation {
  constructor() {
    this.form = document.querySelector('form[name="rsvp"]');

    if (!this.form) return;

    this.nombreInput = this.form.querySelector('input[name="nombre"]');

    this.pasesInput = this.form.querySelector(
      'input[name="pases_disponibles"]',
    );

    this.idInput = this.form.querySelector('input[name="invitacion_id"]');

    this.submitButton = this.form.querySelector('button[type="submit"]');

    this.statusElement = document.getElementById("invitation-status");

    this.init();
  }

  async init() {
    this.lockForm();

    const params = new URLSearchParams(window.location.search);

    const token = params.get("i")?.trim();

    if (!token) {
      this.showError("Este enlace no contiene una invitación válida.");

      return;
    }

    try {
      const response = await fetch(
        `/api/invitacion?token=${encodeURIComponent(token)}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Invitación inválida: ${response.status}`);
      }

      const invitacion = await response.json();

      if (
        !invitacion.id ||
        !invitacion.nombre ||
        !Number.isInteger(invitacion.pases)
      ) {
        throw new Error("Datos de invitación incompletos.");
      }

      this.nombreInput.value = invitacion.nombre;

      this.pasesInput.value = invitacion.pases;

      this.idInput.value = invitacion.id;

      this.form.dataset.invitationReady = "true";

      this.submitButton.disabled = false;

      this.hideStatus();
    } catch (error) {
      console.error("Error cargando invitación:", error);

      this.showError(
        "No pudimos validar esta invitación. Verifica que estés usando el enlace correcto.",
      );
    }
  }

  lockForm() {
    delete this.form.dataset.invitationReady;

    this.submitButton.disabled = true;

    this.nombreInput.value = "";
    this.pasesInput.value = "";
    this.idInput.value = "";
  }

  showError(message) {
    this.lockForm();

    if (!this.statusElement) {
      console.error(message);
      return;
    }

    this.statusElement.textContent = message;

    this.statusElement.hidden = false;
  }

  hideStatus() {
    if (!this.statusElement) return;

    this.statusElement.hidden = true;
    this.statusElement.textContent = "";
  }
}

/**
 * Manejo de envío y mensajes de confirmación
 */
class RSVPForm {
  constructor() {
    this.form = document.querySelector('form[name="rsvp"]');
    if (!this.form) return;

    this.messageElement = document.getElementById("form-message");
    this.submitButton = this.form.querySelector('button[type="submit"]');

    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Error si enlace erroneo
    if (this.form.dataset.invitationReady !== "true") {
      this.showMessage("No pudimos validar tu invitación.", "error");

      return;
    }

    // Validación nativa del navegador
    if (!this.form.checkValidity()) {
      this.form.reportValidity();
      return;
    }

    const nombreInput = this.form.querySelector('input[name="nombre"]');

    const asistenciaInput = this.form.querySelector(
      'input[name="asistencia"]:checked',
    );

    const nombre = nombreInput.value.trim();
    const asistencia = asistenciaInput?.value;

    this.setSubmitting(true);

    try {
      const formData = new FormData(this.form);

      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const mensaje =
        asistencia === "si"
          ? `¡Gracias ${nombre}, te esperamos! 💚`
          : `Entendemos ${nombre}, ¡los extrañaremos! 💔`;

      this.showMessage(mensaje, "success");

      this.form.reset();
    } catch (error) {
      console.error("Error al enviar RSVP:", error);

      this.showMessage(
        "No pudimos enviar tu confirmación. Por favor intenta nuevamente.",
        "error",
      );
    } finally {
      this.setSubmitting(false);
    }
  }

  setSubmitting(isSubmitting) {
    this.submitButton.disabled = isSubmitting;

    this.submitButton.textContent = isSubmitting ? "Enviando..." : "Enviar";
  }

  showMessage(text, type) {
    this.messageElement.textContent = text;
    this.messageElement.className = `form-message form-message--${type}`;
    this.messageElement.hidden = false;

    setTimeout(() => {
      this.messageElement.hidden = true;
    }, 5000);
  }
}

/**
 * 4. SMOOTH SCROLL PARA LINKS INTERNOS
 */
class SmoothScroll {
  constructor() {
    this.links = document.querySelectorAll('a[href^="#"]');
    this.links.forEach((link) => {
      link.addEventListener("click", (e) => this.handleClick(e));
    });
  }

  handleClick(e) {
    const href = e.currentTarget.getAttribute("href");
    const target = document.querySelector(href);

    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * 5. ANIMACIONES EN SCROLL (Intersection Observer)
 */

class ScrollAnimations {
  constructor() {
    this.elements = document.querySelectorAll("[data-animate]");

    if (!this.elements.length) return;

    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (this.prefersReducedMotion) {
      this.showAll();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      },
    );

    this.init();
  }

  init() {
    this.elements.forEach((element) => {
      this.observer.observe(element);
    });
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      this.observer.unobserve(entry.target);
    });
  }

  showAll() {
    this.elements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }
}

/**
 * ANIMACIÓN COLLAGE TIPO STICKER
 * Activa la secuencia cuando el collage entra al viewport
 */
class StickerCollage {
  constructor() {
    this.collage = document.querySelector(
      "[data-sticker-collage]",
    );

    if (!this.collage) return;

    this.collage.classList.add("sticker-ready");

    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (this.prefersReducedMotion) {
      this.collage.classList.add("is-visible");
      return;
    }

    if (!("IntersectionObserver" in window)) {
      this.collage.classList.add("is-visible");
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.2,
      },
    );

    this.observer.observe(this.collage);
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      this.observer.unobserve(entry.target);
    });
  }
}

/**
 * 6. INICIALIZACIÓN GENERAL
 */
function init() {
  // Verificar que el DOM está listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeModules);
  } else {
    initializeModules();
  }
}

function initializeModules() {
  console.log("🎉 Inicializando módulos...");

  // Contador regresivo
  try {
    new Countdown();
    console.log("✅ Contador regresivo activado");
  } catch (error) {
    console.error("❌ Error en contador:", error);
  }

  // Galería
  try {
    const galery = document.querySelector(".galeria");
    if (galery) {
      new Gallery();
      console.log("✅ Galería lightbox activada");
    }
  } catch (error) {
    console.error("❌ Error en galería:", error);
  }

  // Validación de Enlace RSVP
  try {
    new PersonalizedInvitation();

    console.log("✅ Invitación personalizada activada");
  } catch (error) {
    console.error("❌ Error en invitación personalizada:", error);
  }

  // Formulario RSVP
  try {
    new RSVPForm();
    console.log("✅ Formulario RSVP activado");
  } catch (error) {
    console.error("❌ Error en formulario:", error);
  }

  // Smooth scroll
  try {
    new SmoothScroll();
    console.log("✅ Smooth scroll activado");
  } catch (error) {
    console.error("❌ Error en smooth scroll:", error);
  }

  // Animaciones en scroll
  try {
    new ScrollAnimations();
    console.log("✅ Animaciones en scroll activadas");
  } catch (error) {
    console.error("❌ Error en animaciones:", error);
  }

  // Collage animado
  try {
    new StickerCollage();
    console.log("✅ Collage tipo sticker activado");
  } catch (error) {
    console.error("❌ Error en collage tipo sticker:", error);
  }

  console.log("🎊 ¡Invitación lista para celebrar!");
}

// Iniciar
init();
