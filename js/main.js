"use strict";

/* ========================================
   TIMER
======================================== */

const TIMER_DURATION = 15 * 60;
const TIMER_STORAGE_KEY = "landing_timer_started_at";

const timer = document.querySelector("#timer");
const timerMinutes = document.querySelector("#timer-minutes");
const timerSeconds = document.querySelector("#timer-seconds");

const stickyTimer = document.querySelector("[data-sticky-timer]");
const ctaButtons = document.querySelectorAll("[data-cta]");

let timerInterval = null;

function getTimerStartTime() {
  const storedTime = localStorage.getItem(TIMER_STORAGE_KEY);

  if (storedTime) {
    const parsedTime = Number(storedTime);

    if (!Number.isNaN(parsedTime)) {
      return parsedTime;
    }
  }

  const currentTime = Date.now();

  localStorage.setItem(
    TIMER_STORAGE_KEY,
    String(currentTime)
  );

  return currentTime;
}

let timerStartTime = getTimerStartTime();

function updateTimer() {
  const currentTime = Date.now();

  const elapsedSeconds = Math.floor(
    (currentTime - timerStartTime) / 1000
  );

  const remainingSeconds = Math.max(
    TIMER_DURATION - elapsedSeconds,
    0
  );

  const minutes = Math.floor(
    remainingSeconds / 60
  );

  const seconds = remainingSeconds % 60;

  if (timerMinutes) {
    timerMinutes.textContent = String(minutes).padStart(2, "0");
  }

  if (timerSeconds) {
    timerSeconds.textContent = String(seconds).padStart(2, "0");
  }

  if (stickyTimer) {
    stickyTimer.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  if (remainingSeconds === 0) {
    ctaButtons.forEach((button) => {
      button.textContent = "Последний шанс";
    });

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
}

function restartTimer() {
  timerStartTime = Date.now();

  localStorage.setItem(
    TIMER_STORAGE_KEY,
    String(timerStartTime)
  );

  ctaButtons.forEach((button) => {
    button.textContent = "Начать сейчас";
  });

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  updateTimer();

  timerInterval = setInterval(
    updateTimer,
    1000
  );
}

if (timer) {
  timer.addEventListener(
    "click",
    restartTimer
  );
}

updateTimer();

timerInterval = setInterval(
  updateTimer,
  1000
);


/* ========================================
   STICKY CTA
======================================== */

const stickyCta = document.querySelector(
  "[data-sticky-cta]"
);

const heroSection = document.querySelector(
  ".hero"
);

function handleStickyCta() {
  if (!stickyCta || !heroSection) {
    return;
  }

  const heroBottom =
    heroSection.getBoundingClientRect().bottom;

  if (heroBottom < 0) {
    stickyCta.classList.add("is-visible");
  } else {
    stickyCta.classList.remove("is-visible");
  }
}

window.addEventListener(
  "scroll",
  handleStickyCta,
  { passive: true }
);

handleStickyCta();


/* ========================================
   REVIEWS SLIDER
======================================== */

const sliderTrack = document.querySelector(
  "[data-slider-track]"
);

const sliderPrev = document.querySelector(
  "[data-slider-prev]"
);

const sliderNext = document.querySelector(
  "[data-slider-next]"
);

const sliderDots = document.querySelector(
  "[data-slider-dots]"
);

const reviewCards = document.querySelectorAll(
  ".review-card"
);

let currentSlide = 0;

function getSlidesPerView() {
  if (window.innerWidth >= 1024) {
    return 3;
  }

  if (window.innerWidth >= 768) {
    return 2;
  }

  return 1;
}

function getMaxSlide() {
  const slidesPerView = getSlidesPerView();

  return Math.max(
    reviewCards.length - slidesPerView,
    0
  );
}

function updateSlider() {
  if (!sliderTrack) {
    return;
  }

  const slidesPerView = getSlidesPerView();

  currentSlide = Math.min(
    currentSlide,
    getMaxSlide()
  );

  const offset =
    currentSlide * (100 / slidesPerView);

  sliderTrack.style.transform =
    `translateX(-${offset}%)`;

  updateSliderDots();
}

function createSliderDots() {
  if (!sliderDots) {
    return;
  }

  sliderDots.innerHTML = "";

  const dotsCount =
    getMaxSlide() + 1;

  for (
    let index = 0;
    index < dotsCount;
    index += 1
  ) {
    const dot =
      document.createElement("button");

    dot.type = "button";
    dot.className = "reviews__dot";

    dot.setAttribute(
      "aria-label",
      `Показать отзыв ${index + 1}`
    );

    dot.addEventListener(
      "click",
      () => {
        currentSlide = index;
        updateSlider();
      }
    );

    sliderDots.appendChild(dot);
  }

  updateSliderDots();
}

function updateSliderDots() {
  if (!sliderDots) {
    return;
  }

  const dots =
    sliderDots.querySelectorAll(
      ".reviews__dot"
    );

  dots.forEach((dot, index) => {
    dot.classList.toggle(
      "is-active",
      index === currentSlide
    );
  });
}

sliderNext?.addEventListener(
  "click",
  () => {
    if (currentSlide < getMaxSlide()) {
      currentSlide += 1;
      updateSlider();
    }
  }
);

sliderPrev?.addEventListener(
  "click",
  () => {
    if (currentSlide > 0) {
      currentSlide -= 1;
      updateSlider();
    }
  }
);

createSliderDots();

window.addEventListener(
  "resize",
  () => {
    createSliderDots();
    updateSlider();
  }
);


/* ========================================
   TOUCH SWIPE
======================================== */

let touchStartX = 0;
let touchEndX = 0;

sliderTrack?.addEventListener(
  "touchstart",
  (event) => {
    touchStartX =
      event.changedTouches[0].screenX;
  },
  { passive: true }
);

sliderTrack?.addEventListener(
  "touchend",
  (event) => {
    touchEndX =
      event.changedTouches[0].screenX;

    const difference =
      touchStartX - touchEndX;

    if (Math.abs(difference) < 50) {
      return;
    }

    if (difference > 0) {
      if (currentSlide < getMaxSlide()) {
        currentSlide += 1;
      }
    } else if (currentSlide > 0) {
      currentSlide -= 1;
    }

    updateSlider();
  },
  { passive: true }
);


/* ========================================
   FAQ
======================================== */

const faqItems = document.querySelectorAll(
  ".faq-item"
);

faqItems.forEach((item) => {
  const button =
    item.querySelector(
      ".faq-item__question"
    );

  button?.addEventListener(
    "click",
    () => {
      const isOpen =
        item.classList.contains("is-open");

      faqItems.forEach((faqItem) => {
        faqItem.classList.remove("is-open");

        const faqButton =
          faqItem.querySelector(
            ".faq-item__question"
          );

        faqButton?.setAttribute(
          "aria-expanded",
          "false"
        );
      });

      if (!isOpen) {
        item.classList.add("is-open");

        button?.setAttribute(
          "aria-expanded",
          "true"
        );
      }
    }
  );
});


/* ========================================
   FORM
======================================== */

const leadForm =
  document.querySelector("#leadForm");

const formSteps =
  document.querySelectorAll(
    "[data-form-step]"
  );

const nextStepButton =
  document.querySelector(
    "[data-next-step]"
  );

const prevStepButton =
  document.querySelector(
    "[data-prev-step]"
  );

const phoneInput =
  document.querySelector("#phone");

const agreementInput =
  document.querySelector("#agreement");

let currentFormStep = 1;

/* ========================================
   PHONE INPUT
======================================== */

const phoneInputInstance =
  phoneInput && window.intlTelInput
    ? window.intlTelInput(phoneInput, {
        initialCountry: "ua",
        separateDialCode: false,
        useFullscreenPopup: false,
        utilsScript:
          "https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js"
      })
    : null;

phoneInput?.addEventListener(
  "input",
  () => {
    clearError("phone");
  }
);


/* ========================================
   FORM STEPS
======================================== */

function showFormStep(step) {
  currentFormStep = step;

  formSteps.forEach((formStep) => {
    const stepNumber =
      Number(formStep.dataset.formStep);

    formStep.classList.toggle(
      "is-active",
      stepNumber === step
    );
  });
}


/* ========================================
   FORM ERRORS
======================================== */

function setError(fieldName, message) {
  const field =
    document.querySelector(
      `[name="${fieldName}"]`
    );

  const error =
    document.querySelector(
      `[data-error="${fieldName}"]`
    );

  field?.classList.add("is-error");

  if (error) {
    error.textContent = message;
  }
}

function clearError(fieldName) {
  const field =
    document.querySelector(
      `[name="${fieldName}"]`
    );

  const error =
    document.querySelector(
      `[data-error="${fieldName}"]`
    );

  field?.classList.remove("is-error");

  if (error) {
    error.textContent = "";
  }
}


/* ========================================
   VALIDATE STEP 1
======================================== */

function validateStepOne() {
  let isValid = true;

  const nameInput =
    document.querySelector("#name");

  const emailInput =
    document.querySelector("#email");

  const name =
    nameInput?.value.trim() ?? "";

  const email =
    emailInput?.value.trim() ?? "";

  if (name.length < 2) {
    setError(
      "name",
      "Введите имя"
    );

    isValid = false;
  } else {
    clearError("name");
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    setError(
      "email",
      "Введите корректный email"
    );

    isValid = false;
  } else {
    clearError("email");
  }

  return isValid;
}


/* ========================================
   VALIDATE STEP 2
======================================== */
function validateStepTwo() {
  let isValid = true;

  if (!phoneInputInstance) {
    setError(
      "phone",
      "Не удалось загрузить проверку номера"
    );

    isValid = false;
  } else if (!phoneInputInstance.isValidNumber()) {
    setError(
      "phone",
      "Введите корректный номер телефона"
    );

    isValid = false;
  } else {
    clearError("phone");
  }

  if (!agreementInput?.checked) {
    const error =
      document.querySelector(
        '[data-error="agreement"]'
      );

    if (error) {
      error.textContent =
        "Необходимо ваше согласие";
    }

    isValid = false;
  } else {
    const error =
      document.querySelector(
        '[data-error="agreement"]'
      );

    if (error) {
      error.textContent = "";
    }
  }

  return isValid;
}


/* ========================================
   NEXT / PREVIOUS STEP
======================================== */

nextStepButton?.addEventListener(
  "click",
  () => {
    if (validateStepOne()) {
      showFormStep(2);
    }
  }
);

prevStepButton?.addEventListener(
  "click",
  () => {
    showFormStep(1);
  }
);


/* ========================================
   FORM SUBMIT
======================================== */

const successModal =
  document.querySelector(
    "#successModal"
  );

leadForm?.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    if (!validateStepTwo()) {
      return;
    }

    /*
      Получаем номер в международном формате.

      Например:
      +380671234567
    */

    const phone =
      phoneInputInstance?.getNumber();

    /*
      Здесь вместо setTimeout
      подключается реальный API / CRM / backend.
    */

    const submitButton =
      leadForm.querySelector(
        'button[type="submit"]'
      );

    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent =
        "Отправка...";
    }

    await new Promise(
      (resolve) => {
        setTimeout(
          resolve,
          700
        );
      }
    );

    console.log("Phone:", phone);

    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent =
        "Отправить заявку";
    }

    /*
      Очищаем форму.
    */

    leadForm.reset();

    /*
      Возвращаем Украину
      как выбранную страну.
    */

    if (phoneInputInstance) {
      phoneInputInstance.setCountry("ua");
    }

    /*
      Возвращаемся на первый шаг.
    */

    showFormStep(1);

    /*
      Показываем модальное окно.
    */

    openModal();
  }
);


/* ========================================
   MODAL
======================================== */

function openModal() {
  if (!successModal) {
    return;
  }

  successModal.classList.add(
    "is-open"
  );

  successModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow =
    "hidden";
}

function closeModal() {
  if (!successModal) {
    return;
  }

  successModal.classList.remove(
    "is-open"
  );

  successModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow =
    "";
}

successModal?.addEventListener(
  "click",
  (event) => {
    const target =
      event.target;

    if (
      target instanceof HTMLElement &&
      target.hasAttribute(
        "data-modal-close"
      )
    ) {
      closeModal();
    }
  }
);

document.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Escape" &&
      successModal?.classList.contains(
        "is-open"
      )
    ) {
      closeModal();
    }
  }
);