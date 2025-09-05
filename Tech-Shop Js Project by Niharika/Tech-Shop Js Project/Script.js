document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "ts_cart";
  let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

  const badge = document.getElementById("cart-count");
  const summaryCountEl = document.getElementById("cart-count-summary");
  const cartItemsContainer = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const emptyCartEl = document.getElementById("empty-cart");

  // ----------------- 🎯 Tooltip init -----------------
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(
    (el) =>
      new bootstrap.Tooltip(el, {
        customClass: "custom-tooltip", // ✅ custom style
      })
  );

  // ----------------- 🎯 Featured Products Carousel -----------------
  const track = document.getElementById("carouselTrack");
  if (track) {
    const items = Array.from(track.children);
    const indicatorContainer = document.querySelector(".featured-indicators");

    items.forEach((_, i) => {
      const dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      indicatorContainer.appendChild(dot);
    });

    const dots = Array.from(indicatorContainer.children);
    let currentIndex = 0;

    function updateIndicators(index) {
      dots.forEach((dot) => dot.classList.remove("active"));
      dots[index].classList.add("active");
    }

    setInterval(() => {
      const first = items.shift();
      items.push(first);
      track.innerHTML = "";
      items.forEach((item) => track.appendChild(item));
      currentIndex = (currentIndex + 1) % items.length;
      updateIndicators(currentIndex);
    }, 2000);
  }

  // ----------------- 🎯 Footer text -----------------
  const footerMap = {
    w1: "Tech-Shop",
    w2: "Subscribe to our Email alerts to receive early discount offers, and new products info",
    m1: "Help",
    k1: "Policies",
  };
  Object.entries(footerMap).forEach(
    ([id, text]) => (document.getElementById(id).innerHTML = text)
  );

  // ----------------- 🎯 Product Filtering -----------------
  const filterButtons = document.querySelectorAll(".button-container button");
  const products = document.querySelectorAll(".custom-col");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) =>
        btn.classList.remove("active", "button_fist_prod")
      );
      button.classList.add("active", "button_fist_prod");

      const category = button.textContent.trim().toLowerCase();
      products.forEach((product) => {
        product.style.display =
          category === "all" || product.dataset.category === category
            ? "block"
            : "none";
      });
    });
  });

  // ----------------- 🛒 Cart Helpers -----------------
  function updateCartBadgeAndSummary() {
    const uniqueCount = cart.length;
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    if (badge) {
      badge.style.display = uniqueCount > 0 ? "inline-block" : "none";
      badge.textContent = uniqueCount;
    }
    if (summaryCountEl) {
      summaryCountEl.textContent = `${totalQty} item${
        totalQty !== 1 ? "s" : ""
      }`;
    }
  }

  function renderCart() {
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = "";
      let discountedTotal = 0;
      let originalTotal = 0;

      cart.forEach((item, index) => {
        const price = Number(item.price);
        const oldPrice = Number(item.oldPrice) || price;

        discountedTotal += price * item.qty;
        originalTotal += oldPrice * item.qty;

        const row = document.createElement("div");
        row.className =
          "cart-item d-flex align-items-center justify-content-between border-bottom py-3";

        row.innerHTML = `
        <div class="d-flex align-items-center">
          <img src="${item.img}" alt="${
          item.name
        }" width="90" class="me-3 rounded">
          <div class="cart-details">
            <h6>${item.name}</h6>
            <div class="price">
              <span class="current">₹${price.toLocaleString("en-IN")}</span>
              <span class="original">₹${oldPrice.toLocaleString("en-IN")}</span>
            </div>
            <div class="cart-actions">
              <button class="minus-btn" data-index="${index}">−</button>
              <span class="qty">${item.qty}</span>
              <button class="plus-btn" data-index="${index}">+</button>
            </div>
          </div>
        </div>
        <div>
          <button class="remove-btn" data-index="${index}" 
            data-bs-toggle="tooltip" data-bs-placement="bottom" title="Remove Item">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
        cartItemsContainer.appendChild(row);
      });

      const discount = originalTotal - discountedTotal;
      const discountEl = document.querySelector(".discount");

      if (subtotalEl)
        subtotalEl.textContent = `₹${originalTotal.toLocaleString("en-IN")}`;
      if (totalEl)
        totalEl.textContent = `₹${discountedTotal.toLocaleString("en-IN")}`;
      if (discountEl)
        discountEl.textContent = `-₹${discount.toLocaleString("en-IN")}`;
    }

    // ✅ Toggle Empty Cart & Order Summary
    const orderSummaryEl = document.getElementById("order-summary");

    if (cart.length === 0) {
      if (emptyCartEl) emptyCartEl.style.display = "flex";
      if (cartItemsContainer) cartItemsContainer.style.display = "none";
      if (orderSummaryEl) orderSummaryEl.style.display = "none"; // hide summary
    } else {
      if (emptyCartEl) emptyCartEl.style.display = "none";
      if (cartItemsContainer) cartItemsContainer.style.display = "block";
      if (orderSummaryEl) orderSummaryEl.style.display = "block"; // show summary
    }

    // Persist and update counters
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadgeAndSummary();
  }

  function animateCart() {
    if (!badge) return;
    badge.classList.add("cart-bounce");
    setTimeout(() => badge.classList.remove("cart-bounce"), 500);
  }

  // ----------------- 🛒 Add to Cart Buttons -----------------
  document.querySelectorAll(".add-to-cart").forEach((button, index) => {
    button.addEventListener("click", function () {
      const id = this.dataset.id || index;
      const name = this.dataset.name;
      const price = parseInt(
        (this.dataset.price || "0").replace(/[^\d]/g, ""),
        10
      );
      const oldPrice =
        parseInt((this.dataset.oldprice || "").replace(/[^\d]/g, ""), 10) ||
        price;
      const img = this.dataset.image;

      const existing = cart.find((item) => String(item.id) === String(id));
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, name, price, oldPrice, img, qty: 1 });
      }

      renderCart();

      // ✅ Re-init tooltips for dynamic trash icons
      [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(
        (el) =>
          new bootstrap.Tooltip(el, {
            customClass: "custom-tooltip",
          })
      );

      this.textContent = "Added ";
      this.classList.add("added-btn", "bg-success", "text-white");
      this.disabled = true;

      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
        this.classList.remove("added-btn", "bg-success", "text-white");
        this.disabled = false;
      }, 1200);

      animateCart();
    });
  });

  // ----------------- 🛒 Cart Quantity & Remove -----------------
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const idx =
        e.target.dataset.index ||
        e.target.closest(".remove-btn")?.dataset.index;
      if (idx === undefined) return;

      if (e.target.classList.contains("minus-btn")) {
        if (cart[idx].qty > 1) cart[idx].qty--;
        else cart.splice(idx, 1);
      }
      if (e.target.classList.contains("plus-btn")) cart[idx].qty++;
      if (e.target.closest(".remove-btn")) cart.splice(idx, 1);

      renderCart();
    });
  }

  // ----------------- 🚀 Initial Render -----------------
  renderCart();
});
