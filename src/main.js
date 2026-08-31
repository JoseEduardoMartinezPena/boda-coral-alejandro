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
      dias: document.querySelector('[data-value="208"]'),
      horas: document.querySelector('[data-value="18"]'),
      minutos: document.querySelector('[data-value="1"]'),
      segundos: document.querySelector('[data-value="35"]'),
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
 * 2. BACK TO TOP BUTTON
 * Botón para volver al inicio de la página
 */
class BackToTop {
  constructor() {
    this.button = document.getElementById("backToTop");
    if (!this.button) return;

    window.addEventListener("scroll", () => this.toggleVisibility());
    this.button.addEventListener("click", () => this.scroll());
  }

  toggleVisibility() {
    if (window.scrollY > 300) {
      this.button.classList.add("visible");
    } else {
      this.button.classList.remove("visible");
    }
  }

  scroll() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
}

/**
 * 3. GALERÍA LIGHTBOX
 * Abre imágenes en modal cuando se hacen click
 */
class Gallery {
  constructor() {
    this.images = document.querySelectorAll(".galeria img");
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
 * 4. FORMULARIO RSVP - NETLIFY FORMS
 * Manejo de envío y mensajes de confirmación
 */
class RSVPForm {
  constructor() {
    this.form = document.querySelector('form[name="rsvp"]');
    if (!this.form) return;

    this.messageElement = document.getElementById("form-message");
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    // Netlify maneja el submit automáticamente
    // Aquí podemos agregar validación personalizada o UX mejorada

    const nombre = this.form.querySelector('input[name="nombre"]').value;
    const asistencia = this.form.querySelector(
      'input[name="asistencia"]:checked',
    ).value;

    // Mostrar confirmación (opcional, solo para UX)
    if (nombre && asistencia) {
      const mensaje =
        asistencia === "si"
          ? `¡Gracias ${nombre}, te esperamos! 💚`
          : `Entendemos ${nombre}, ¡los extrañaremos! 💔`;

      // Netlify enviará el formulario
      // setTimeout(() => {
      //   this.showMessage(mensaje, "success");
      // }, 500);
    }
  }

  showMessage(text, type) {
    this.messageElement.textContent = text;
    this.messageElement.className = `form-message form-message--${type}`;
    this.messageElement.style.display = "block";

    setTimeout(() => {
      this.messageElement.style.display = "none";
    }, 5000);
  }
}

/**
 * 5. SMOOTH SCROLL PARA LINKS INTERNOS
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
 * 6. ANIMACIONES EN SCROLL (Intersection Observer)
 */
class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.observerOptions,
    );

    this.init();
  }

  init() {
    const animatedElements = document.querySelectorAll(
      "section, .hotel-card, .restaurant-card, .lugar-card",
    );
    animatedElements.forEach((el) => {
      el.classList.add("fade-in");
      this.observer.observe(el);
    });
  }

  handleIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }
}

/**
 * 7. INICIALIZACIÓN GENERAL
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

  // Back to top
  try {
    new BackToTop();
    console.log("✅ Back to top activado");
  } catch (error) {
    console.error("❌ Error en back to top:", error);
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

  console.log("🎊 ¡Invitación lista para celebrar!");
}

// Iniciar
init();

/**
 * Export para testing (opcional)
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Countdown, BackToTop, Gallery, RSVPForm };
}
