/* ===== MOTOFAN – Main JS ===== */

/* Navbar scroll effect */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* Active nav link on scroll */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observerNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => observerNav.observe(section));

/* Hamburger menu */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
  hamburger.classList.toggle('active');
});

/* Close mobile menu on link click */
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('active');
  });
});

/* Scroll reveal animations */
const revealElements = document.querySelectorAll(
  '.brand-card, .service-card, .feature-item, .fb-reason, .about-text, .about-timeline, .contact-card, .hours-card, .contact-map, .contact-form-wrap, .timeline-item'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

/* Staggered reveal for grids */
document.querySelectorAll('.brands-grid, .services-grid').forEach(grid => {
  const children = grid.querySelectorAll('.brand-card, .service-card');
  const gridObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        children.forEach((child, i) => {
          setTimeout(() => {
            child.classList.add('visible');
          }, i * 100);
        });
        gridObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  gridObserver.observe(grid);
});

// Formularz kontaktowy - obsługa wysyłania do serwera
window.handleForm = function(e) {
  e.preventDefault();
  
  const form = e.target;
  const btn = form.querySelector('#submitBtn');
  const successMsg = form.querySelector('#formSuccess');
  
  const formData = {
      name: form.querySelector('#fname').value,
      email: form.querySelector('#femail').value,
      subject: form.querySelector('#fsubject').value,
      message: form.querySelector('#fmessage').value
  };

  btn.disabled = true;
  btn.textContent = 'Wysyłanie...';
  
  // Wysłanie danych do naszego lokalnego serwera Node.js
  fetch('/api/contact', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
  })
  .then(res => res.json())
  .then(data => {
      btn.style.display = 'none';
      successMsg.style.display = 'block';
      successMsg.textContent = '✅ Dziękujemy! Twoja wiadomość została zapisana na serwerze.';
      form.reset();
  })
  .catch(err => {
      btn.disabled = false;
      btn.textContent = 'Wystąpił błąd, spróbuj ponownie';
      console.error(err);
  });
};

// Obsługa paska Ciasteczek
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        // Opóźnienie pokazania baneru dla lepszego efektu
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1500);
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.remove('show');
    });
});

/* Smooth scroll for all anchor links */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

