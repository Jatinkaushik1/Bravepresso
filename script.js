document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for Offline Support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed', err));
        });
    }

    // Add page-loaded class for fade-in effect
    document.body.classList.add('page-loaded');

    // Inject Scroll Progress Bar
    const scrollProgressContainer = document.createElement('div');
    scrollProgressContainer.className = 'scroll-progress-container';
    const scrollProgressBar = document.createElement('div');
    scrollProgressBar.className = 'scroll-progress-bar';
    scrollProgressContainer.appendChild(scrollProgressBar);
    document.body.prepend(scrollProgressContainer);

    // Update Scroll Progress
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollProgressBar.style.width = scrolled + "%";
    });

    // ==================== DOM ELEMENTS ====================
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartCount = document.getElementById('cartCount');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const startShopping = document.getElementById('startShopping');
    const backToTop = document.getElementById('backToTop');
    const toastContainer = document.getElementById('toastContainer');
    const viewAllCouponsBtn = document.getElementById('viewAllCouponsBtn');

    // These will be assigned after dynamic injection
    let profileModal, closeProfileModal, profileForm, loginModal, loginClose, trackModal, trackClose, ordersModal, ordersClose, ordersListContainer, wishlistModal, wishlistClose, wishlistListContainer, authForm, authTitle, authSubtitle, regNameGroup, authSubmit, modalSwitch, switchBtn, trackOrderIdInput, trackSubmitBtn, trackingStepperContainer;

    let currentPrice = 449;
    let currentName = 'BRAVE PRESSO — Dark Roast (100g)';
    const WHATSAPP_NUMBER = '919821846822';
    let cart = JSON.parse(localStorage.getItem('bravepresso_cart') || '[]');

    // ==================== PRELOADER ====================
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('fade-out');
                document.body.style.overflow = '';
            }, 1000); // Increased to 1000ms for premium animation feel
        });
    } else {
        document.body.style.overflow = '';
    }

    // ==================== SCROLL REVEAL ANIMATION ====================
    const revealItems = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing after reveal
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => revealObserver.observe(item));

    // ==================== HEADER SCROLL & PROGRESS RING ====================
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle ? circle.r.baseVal.value : 0;
    const circumference = radius * 2 * Math.PI;

    if (circle) {
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
    }

    function setProgress(percent) {
        if (!circle) return;
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;
    }

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 60);
            
            // Back to Top Visibility
            if (backToTop) {
                if (window.scrollY > 500) {
                    backToTop.classList.add('show');
                } else {
                    backToTop.classList.remove('show');
                }
            }

            // Scroll Progress
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            setProgress(scrollPercent);
        });
    }

    // ==================== MOBILE MENU ====================
    if (hamburger && navLinks) {
        // Prevent duplicate injection
        if (!navLinks.querySelector('.mobile-menu-header')) {
            const headerLi = document.createElement('li');
            headerLi.style.listStyle = 'none';
            headerLi.innerHTML = `
                <div class="mobile-menu-header">
                    <a href="./index.html" class="mobile-menu-logo">BRAVE PRESSO</a>
                    <button class="mobile-menu-close" aria-label="Close Menu">&times;</button>
                </div>
            `;
            navLinks.insertBefore(headerLi, navLinks.firstChild);
        }

        const mobileMenuClose = navLinks.querySelector('.mobile-menu-close');

        const openMobileMenu = () => {
            hamburger.classList.add('active');
            navLinks.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeMobileMenu = () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        };

        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', closeMobileMenu);
        }

        hamburger.addEventListener('click', () => {
            if (navLinks.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // ==================== VARIANT SELECTOR ====================
    const variantRadios = document.querySelectorAll('input[name="pack_size"]');
    const displayPrice = document.getElementById('displayPrice');
    const displayUnit = document.getElementById('displayUnit');
    const viewFrontImg = document.querySelector('#view-front img');
    const viewBackImg = document.querySelector('#view-back img');
    const thumbFrontImg = document.querySelector('.thumb[data-target="view-front"] img');
    const thumbBackImg = document.querySelector('.thumb[data-target="view-back"] img');

    if (variantRadios.length > 0) {
        variantRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                // Update UI styling
                document.querySelectorAll('.variant-option').forEach(opt => {
                    opt.classList.remove('active');
                    opt.style.background = 'transparent';
                    opt.style.borderColor = 'var(--glass-border)';
                    opt.querySelector('div:first-of-type').style.color = 'var(--cream)';
                });
                const parentLabel = e.target.closest('.variant-option');
                parentLabel.classList.add('active');
                parentLabel.style.background = 'rgba(198, 166, 100, 0.1)';
                parentLabel.style.borderColor = 'var(--gold)';
                parentLabel.querySelector('div:first-of-type').style.color = 'var(--gold)';

                // Update state
                currentPrice = parseInt(e.target.dataset.price);
                currentName = e.target.dataset.name;
                const isTrial = e.target.value === '24g';

                // Update Display
                if (displayPrice) displayPrice.innerText = currentPrice;
                if (displayUnit) displayUnit.innerText = isTrial ? '/ 24g jar' : '/ 100g pack';

                // Update Images
                if (viewFrontImg && thumbFrontImg) {
                    viewFrontImg.src = isTrial ? './trial-front.jpg' : './product.png';
                    thumbFrontImg.src = isTrial ? './trial-front.jpg' : './product.png';
                }
                if (viewBackImg && thumbBackImg) {
                    viewBackImg.src = isTrial ? './trial-back.jpg' : './product-back.png';
                    thumbBackImg.src = isTrial ? './trial-back.jpg' : './product-back.png';
                }

                syncCalculatorState();
            });
        });
    }

    // ==================== QUANTITY CALCULATOR (Shop pages only) ====================
    const quantityEl = document.getElementById('quantity');
    const totalEl = document.getElementById('total');
    const plusBtn = document.getElementById('plus');
    const minusBtn = document.getElementById('minus');
    let quantity = 1;

    const updateCalc = () => {
        if(quantityEl) quantityEl.innerText = quantity;
        if(totalEl) totalEl.innerText = (quantity * currentPrice).toLocaleString('en-IN');
        
        // Sync with cart if item exists
        const cartItem = cart.find(item => item.name === currentName);
        if (cartItem) {
            cartItem.qty = quantity;
            saveCart();
            updateCartUI();
        }

        // Update wishlist icon state
        const addToWishlistBtn = document.getElementById('addToWishlistBtn');
        if (addToWishlistBtn) {
            const wishlist = JSON.parse(localStorage.getItem('bp_wishlist') || '[]');
            const isWishlisted = wishlist.some(item => item.name === currentName);
            const icon = addToWishlistBtn.querySelector('i');
            if (isWishlisted) {
                icon.classList.replace('far', 'fas');
            } else {
                icon.classList.replace('fas', 'far');
            }
        }
    };

    if (quantityEl && totalEl && plusBtn && minusBtn) {
        plusBtn.addEventListener('click', () => { quantity++; updateCalc(); });
        minusBtn.addEventListener('click', () => { if (quantity > 1) { quantity--; updateCalc(); } });
    }

    function syncCalculatorState() {
        const cartItem = cart.find(item => item.name === currentName);
        const calculator = document.querySelector('.calculator');
        if (cartItem) {
            quantity = cartItem.qty;
            if (calculator) calculator.classList.add('visible');
        } else {
            quantity = 1;
            if (calculator) calculator.classList.remove('visible');
        }
        updateCalc();
    }

    // ==================== PRODUCT GALLERY ====================
    const thumbs = document.querySelectorAll('.thumb');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryMain = document.getElementById('galleryMain');

    function updateGallery(index) {
        thumbs.forEach(t => t.classList.remove('active'));
        galleryItems.forEach(g => g.classList.remove('active'));
        
        thumbs[index].classList.add('active');
        galleryItems[index].classList.add('active');
    }

    if (thumbs.length > 0) {
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                updateGallery(index);
            });
        });
    }

    // Swipe Support for Gallery
    if (galleryMain) {
        let touchStartX = 0;
        let touchEndX = 0;
        let currentIndex = 0;

        // Prevent default image drag
        galleryMain.querySelectorAll('img').forEach(img => {
            img.setAttribute('draggable', 'false');
        });

        galleryMain.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        galleryMain.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });

        // Mouse Drag Support for Desktop
        galleryMain.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent text selection and default drag
            touchStartX = e.clientX;
        });

        galleryMain.addEventListener('mouseup', (e) => {
            touchEndX = e.clientX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 30; // Lower threshold for easier swiping
            const diff = touchStartX - touchEndX;

            // Find current active index
            currentIndex = Array.from(galleryItems).findIndex(item => item.classList.contains('active'));

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe Left -> Next Image
                    let nextIndex = (currentIndex + 1) % galleryItems.length;
                    updateGallery(nextIndex);
                } else {
                    // Swipe Right -> Previous Image
                    let prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
                    updateGallery(prevIndex);
                }
            }
        }
    }

    // ==================== PROFILE SECTION ====================
    const menuProfile = document.getElementById('menuProfile');
    const mobileProfile = document.getElementById('mobileProfile');

    function openProfileModal() {
        document.getElementById('profileName').value = localStorage.getItem('userName') || 'Jatin Kaushik';
        document.getElementById('profileEmail').value = localStorage.getItem('userEmail') || 'user@example.com';
        document.getElementById('profilePhone').value = localStorage.getItem('userPhone') || '9876543210';
        
        // Load Address Fields
        if (document.getElementById('profileStreet')) document.getElementById('profileStreet').value = localStorage.getItem('userStreet') || '';
        if (document.getElementById('profileLocality')) document.getElementById('profileLocality').value = localStorage.getItem('userLocality') || '';
        if (document.getElementById('profileCity')) document.getElementById('profileCity').value = localStorage.getItem('userCity') || '';
        if (document.getElementById('profilePincode')) document.getElementById('profilePincode').value = localStorage.getItem('userPincode') || '';

        profileModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (userDropdownMenu) userDropdownMenu.classList.remove('show');
        // Close mobile menu if open
        if (navLinks) navLinks.classList.remove('open');
        if (hamburger) hamburger.classList.remove('active');
    }

    if (menuProfile) {
        menuProfile.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openProfileModal();
        });
    }

    if (mobileProfile) {
        mobileProfile.addEventListener('click', (e) => {
            e.preventDefault();
            openProfileModal();
        });
    }

    // Auto-login for demo
    document.body.classList.add('logged-in');

    // ==================== CART ====================
    function openCart() { cartSidebar.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeCart() { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; }
    function saveCart() { localStorage.setItem('bravepresso_cart', JSON.stringify(cart)); }

    let isCouponApplied = false;
    let activeDiscountRate = 0;
    let activeCouponCode = '';

    const COUPONS = {
        'FIRST10': 0.10, // 10%
        'REPEAT5': 0.05  // 5%
    };

    function updateCartUI() {
        const totalItems = cart.reduce((s, i) => s + i.qty, 0);
        const subtotal = cart.reduce((s, i) => s + (i.qty * i.price), 0);
        
        // Pulse animation for cart icons
        const animateBadge = (el) => {
            if (!el) return;
            el.classList.remove('badge-pop');
            void el.offsetWidth; // Trigger reflow
            el.classList.add('badge-pop');
        };

        if (cartCount) {
            cartCount.textContent = totalItems;
            animateBadge(cartCount);
        }
        
        // Update Mobile Bottom Nav Cart Badge
        const mobileCartBadge = document.querySelector('.cart-count-badge');
        if (mobileCartBadge) {
            mobileCartBadge.textContent = totalItems;
            animateBadge(mobileCartBadge);
        }

        // Pulse animation for cart buttons
        const cartIcons = [document.getElementById('cartBtn'), document.getElementById('mobileCartBtn')];
        cartIcons.forEach(btn => {
            if (btn) {
                btn.classList.remove('cart-pulse');
                void btn.offsetWidth;
                btn.classList.add('cart-pulse');
            }
        });

        if (cart.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'block';
            if (cartItems) cartItems.style.display = 'none';
            if (cartFooter) cartFooter.style.display = 'none';
            isCouponApplied = false; // Reset coupon if cart is empty
            activeDiscountRate = 0;
            activeCouponCode = '';
        } else {
            if (cartEmpty) cartEmpty.style.display = 'none';
            if (cartItems) {
                cartItems.style.display = 'block';
                cartItems.innerHTML = cart.map((item, i) => {
                    const itemImg = item.name.includes('24g') ? './trial-front.jpg' : './product.png';
                    return `
                        <div class="cart-item">
                            <div class="cart-item-img"><img src="${itemImg}" alt="${item.name}"></div>
                            <div class="cart-item-info">
                                <h4 style="font-size: 0.85rem; margin-bottom: 0.3rem;">${item.name}</h4>
                                <div class="cart-qty-selector" style="display: flex; align-items: center; gap: 0.6rem; margin: 0.5rem 0;">
                                    <button class="dec-qty" data-index="${i}" style="background: transparent; border: 1px solid rgba(198, 166, 100, 0.4); color: var(--cream); width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; font-size: 0.75rem;"><i class="fas fa-minus"></i></button>
                                    <span style="color: var(--cream); font-weight: bold; font-size: 0.85rem; min-width: 14px; text-align: center;">${item.qty}</span>
                                    <button class="inc-qty" data-index="${i}" style="background: transparent; border: 1px solid rgba(198, 166, 100, 0.4); color: var(--cream); width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; font-size: 0.75rem;"><i class="fas fa-plus"></i></button>
                                    <span style="color: var(--cream); opacity: 0.6; font-size: 0.8rem; margin-left: 4px;">× ₹${item.price}</span>
                                </div>
                                <button class="cart-item-remove" data-index="${i}"><i class="fas fa-trash"></i> Remove</button>
                            </div>
                            <div class="cart-item-price">₹${(item.qty * item.price).toLocaleString('en-IN')}</div>
                        </div>
                    `;
                }).join('');

                // Re-attach event listeners...
                attachCartListeners();
            }
            if (cartFooter) cartFooter.style.display = 'block';
            
            // Calculate Totals
            const discount = isCouponApplied ? Math.round(subtotal * activeDiscountRate) : 0;
            const grandTotal = subtotal - discount;

            const cartSubtotal = document.getElementById('cartSubtotal');
            const discountRow = document.getElementById('discountRow');
            const cartDiscount = document.getElementById('cartDiscount');
            
            if (cartSubtotal) cartSubtotal.textContent = '₹' + subtotal.toLocaleString('en-IN');
            
            if (discountRow && cartDiscount) {
                if (isCouponApplied) {
                    discountRow.style.display = 'flex';
                    cartDiscount.textContent = '-₹' + discount.toLocaleString('en-IN');
                } else {
                    discountRow.style.display = 'none';
                }
            }
            
            if (cartTotal) cartTotal.textContent = '₹' + grandTotal.toLocaleString('en-IN');
        }
    }

    function attachCartListeners() {
        document.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                if (cart[index].qty > 1) {
                    cart[index].qty--;
                    saveCart(); updateCartUI();
                } else {
                    cart.splice(index, 1);
                    saveCart(); updateCartUI();
                    showToast('Item removed from cart', 'info');
                }
            });
        });

        document.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                cart[index].qty++;
                saveCart(); updateCartUI();
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                cart.splice(index, 1);
                saveCart(); updateCartUI();
                showToast('Item removed from cart', 'info');
            });
        });
    }

    // Coupon Logic
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponInput');
    const couponMessage = document.getElementById('couponMessage');

    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value.trim().toUpperCase();
            if (COUPONS.hasOwnProperty(code)) {
                if (isCouponApplied && activeCouponCode === code) {
                    showToast('Coupon already applied!', 'info');
                    return;
                }
                isCouponApplied = true;
                activeCouponCode = code;
                activeDiscountRate = COUPONS[code];
                updateCartUI();
                const discountPercent = activeDiscountRate * 100;
                showToast(`Coupon ${code} applied! ${discountPercent}% Discount added.`, 'success');
                if (couponMessage) {
                    couponMessage.innerText = `Coupon ${code} applied successfully!`;
                    couponMessage.style.color = '#27ae60';
                    couponMessage.style.display = 'block';
                }
            } else {
                showToast('Invalid Coupon Code!', 'error');
                if (couponMessage) {
                    couponMessage.innerText = 'Invalid coupon code. Try FIRST10 or REPEAT5';
                    couponMessage.style.color = '#e74c3c';
                    couponMessage.style.display = 'block';
                }
            }
        });
    }

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (startShopping) startShopping.addEventListener('click', (e) => { closeCart(); });

    // Add to Cart
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const existing = cart.find(item => item.name === currentName);
            if (existing) { existing.qty += quantity; } else { cart.push({ name: currentName, qty: quantity, price: currentPrice }); }
            saveCart(); updateCartUI();
            
            // Auto-Open Cart Sidebar
            if (typeof openCart === 'function') openCart();
            
            // Cart Pulse Animation
            const cartBtn = document.getElementById('cartBtn');
            if (cartBtn) {
                cartBtn.classList.remove('pulse');
                void cartBtn.offsetWidth; // Trigger reflow
                cartBtn.classList.add('pulse');
                setTimeout(() => cartBtn.classList.remove('pulse'), 500);
            }

            // Button Success State
            const originalText = addToCartBtn.innerHTML;
            addToCartBtn.classList.add('added');
            addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
            
            setTimeout(() => {
                addToCartBtn.classList.remove('added');
                addToCartBtn.innerHTML = originalText;
            }, 2000);
            
            showToast(`${quantity} pack(s) added to cart!`, 'success');
            syncCalculatorState();
        });
    }

    // Wishlist Logic
    const addToWishlistBtn = document.getElementById('addToWishlistBtn');
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', () => {
            if (!currentUser) {
                showToast('Please login to add items to wishlist', 'info');
                loginModal.classList.add('open');
                document.body.style.overflow = 'hidden';
                return;
            }
            
            let wishlist = JSON.parse(localStorage.getItem('bp_wishlist') || '[]');
            const index = wishlist.findIndex(item => item.name === currentName);
            
            if (index !== -1) {
                wishlist.splice(index, 1);
                localStorage.setItem('bp_wishlist', JSON.stringify(wishlist));
                showToast('Removed from wishlist', 'info');
            } else {
                wishlist.push({ name: currentName, price: currentPrice });
                localStorage.setItem('bp_wishlist', JSON.stringify(wishlist));
                showToast('Added to wishlist! ❤️', 'success');
            }
            updateCalc();
        });
    }

    // Order Now flow
    const orderWhatsApp = document.getElementById('orderWhatsApp');
    if (orderWhatsApp) {
        orderWhatsApp.addEventListener('click', () => {
            if (cart.length === 0) {
                const existing = cart.find(item => item.name === currentName);
                if (existing) { existing.qty += quantity; } else { cart.push({ name: currentName, qty: quantity, price: currentPrice }); }
                saveCart(); updateCartUI();
            }
            const totalPrice = cart.reduce((s, i) => s + (i.qty * i.price), 0);
            openPaymentModal(totalPrice);
        });
    }

    // ==================== SECURE CHECKOUT & PAYMENT MODAL ====================
    const paymentModalHtml = `
        <div class="payment-modal" id="paymentModal">
            <div class="payment-modal-content" style="max-width: 500px;">
                <button class="payment-close" id="paymentClose">&times;</button>
                <div class="modal-header">
                    <h2><i class="fas fa-shield-alt"></i> Secure Checkout</h2>
                    <p>Enter delivery details and select payment</p>
                </div>
                
                <!-- Order Summary Section -->
                <div class="order-summary-box" style="background: rgba(198, 166, 100, 0.05); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem; text-align: left;">
                    <h4 id="toggleSummary" style="color: var(--gold); margin-bottom: 0; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none;">
                        <span style="display: flex; align-items: center; gap: 8px;"><i class="fas fa-shopping-cart"></i> Order Summary</span>
                        <i class="fas fa-chevron-up" id="summaryChevron"></i>
                    </h4>
                    <div id="summaryContent" style="transition: all 0.3s ease; overflow: hidden; margin-top: 1rem;">
                        <div id="checkoutItemsList" style="margin-bottom: 1rem; max-height: 120px; overflow-y: auto; font-size: 0.9rem; color: var(--cream);">
                            <!-- Items will be injected here -->
                        </div>
                        <div style="border-top: 1px solid rgba(198, 166, 100, 0.1); padding-top: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--cream); font-size: 0.9rem;">Total Amount:</span>
                            <strong id="paymentTotalAmt" style="color: var(--gold); font-size: 1.2rem;">₹0</strong>
                        </div>
                    </div>
                </div>

                <!-- Delivery Address Section -->
                <div class="checkout-address-form" style="text-align: left; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--gold); margin-bottom: 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-map-marker-alt"></i> Delivery Address
                    </h4>
                    <div class="form-group" style="margin-bottom: 0.8rem; position: relative;">
                        <input type="text" id="checkoutStreet" placeholder="House No. / Street / Area" class="checkout-input" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem; transition: 0.3s; cursor: pointer;">
                        <span style="color: #ff4d4d; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;">*</span>
                    </div>
                    <div class="form-group" style="margin-bottom: 0.8rem; position: relative;">
                        <input type="text" id="checkoutLocality" placeholder="Locality / Landmark" class="checkout-input" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem; transition: 0.3s; cursor: pointer;">
                        <span style="color: #ff4d4d; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;">*</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                        <div class="form-group" style="position: relative;">
                            <input type="text" id="checkoutCity" placeholder="City" class="checkout-input" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem; transition: 0.3s; cursor: pointer;">
                            <span style="color: #ff4d4d; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;">*</span>
                        </div>
                        <div class="form-group" style="position: relative;">
                            <input type="text" id="checkoutPincode" placeholder="Pincode" class="checkout-input" maxlength="6" pattern="[0-9]{6}" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem; transition: 0.3s; cursor: pointer;">
                            <span style="color: #ff4d4d; position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;">*</span>
                        </div>
                    </div>
                </div>

                <div class="payment-options">
                    <h4 style="color: var(--gold); margin-bottom: 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; text-align: left; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-credit-card"></i> Payment Method
                    </h4>
                    <button class="pay-btn" id="payUpi"><i class="fas fa-qrcode"></i> Pay via UPI</button>
                    <button class="pay-btn" id="payCard"><i class="fas fa-credit-card"></i> Pay via Card</button>
                    <button class="pay-btn" id="payNetBanking"><i class="fas fa-university"></i> Net Banking</button>
                    <button class="pay-btn" id="payCod"><i class="fas fa-truck"></i> Cash on Delivery (COD)</button>
                </div>
                <div class="payment-status" id="paymentStatus">
                    <i class="fas fa-check-circle"></i> Payment Successful!
                </div>
            </div>
        </div>
    `;
    if (!document.getElementById('paymentModal')) {
        document.body.insertAdjacentHTML('beforeend', paymentModalHtml);
    }

    const paymentModal = document.getElementById('paymentModal');
    const upiQRContainer = document.getElementById('upiQRContainer');
    const paymentStatus = document.getElementById('paymentStatus');

    function openPaymentModal(amount) {
        if (!paymentModal) return;
        const totalAmtEl = document.getElementById('paymentTotalAmt');
        if (totalAmtEl) totalAmtEl.innerText = '₹' + amount.toLocaleString('en-IN');
        
        // Populate order summary
        const checkoutItemsList = document.getElementById('checkoutItemsList');
        if (checkoutItemsList) {
            checkoutItemsList.innerHTML = cart.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; opacity: 0.8;">
                    <span>${item.name} × ${item.qty}</span>
                    <span>₹${(item.qty * item.price).toLocaleString('en-IN')}</span>
                </div>
            `).join('');
        }

        paymentModal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Pre-fill address from profile if available
        if (document.getElementById('checkoutStreet')) document.getElementById('checkoutStreet').value = localStorage.getItem('userStreet') || '';
        if (document.getElementById('checkoutLocality')) document.getElementById('checkoutLocality').value = localStorage.getItem('userLocality') || '';
        if (document.getElementById('checkoutCity')) document.getElementById('checkoutCity').value = localStorage.getItem('userCity') || '';
        if (document.getElementById('checkoutPincode')) document.getElementById('checkoutPincode').value = localStorage.getItem('userPincode') || '';
    }

    function closePaymentModal() {
        if (!paymentModal) return;
        paymentModal.classList.remove('open');
        document.body.style.overflow = '';
        // Reset modal state
        if (upiQRContainer) upiQRContainer.style.display = 'none';
        if (paymentStatus) paymentStatus.style.display = 'none';
        const options = document.querySelector('.payment-options');
        if (options) options.style.display = 'block';
    }

    function sendWhatsAppOrder(method) {
        const street = document.getElementById('checkoutStreet').value;
        const locality = document.getElementById('checkoutLocality').value;
        const city = document.getElementById('checkoutCity').value;
        const pincode = document.getElementById('checkoutPincode').value;
        const total = cart.reduce((s, i) => s + (i.qty * i.price), 0);

        // Add points on successful order (mock logic)
        if (currentUser) {
            const earnedPoints = Math.floor(total / 10); // 1 point for every 10 rupees spent
            currentUser.points = (currentUser.points || 0) + earnedPoints;
            localStorage.setItem('bp_user', JSON.stringify(currentUser));
            updateAuthHeader();
            showToast(`Order Placed! You earned ${earnedPoints} Brave Points! ☕`, 'success');
        }

        let message = `*New Order from BRAVE PRESSO*\n\n`;
        message += `*Items:*\n`;
        cart.forEach(item => {
            message += `- ${item.name} x ${item.qty} (₹${item.price * item.qty})\n`;
        });
        message += `\n*Total Amount:* ₹${total.toLocaleString('en-IN')}\n`;
        message += `*Payment Method:* ${method}\n\n`;
        message += `*Delivery Address:*\n`;
        message += `${street}, ${locality}, ${city} - ${pincode}\n\n`;
        message += `Please confirm my order.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = "919821846822"; 
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Clear cart and update UI before redirect
        cart = [];
        updateCartUI();
        if(cartSidebar) cartSidebar.classList.remove('open');
        if(cartOverlay) cartOverlay.classList.remove('open');
        
        window.open(whatsappUrl, '_blank');
    }

    // Payment Modal Event Delegation
    document.addEventListener('click', (e) => {
        const upiBtn = e.target.closest('#payUpi');
        const cardBtn = e.target.closest('#payCard');
        const nbBtn = e.target.closest('#payNetBanking');
        const codBtn = e.target.closest('#payCod');
        const closeBtn = e.target.closest('#paymentClose');
        const toggleBtn = e.target.closest('#toggleSummary');

        if (closeBtn) {
            closePaymentModal();
            return;
        }

        const anyPayBtn = upiBtn || cardBtn || nbBtn || codBtn;
        if (anyPayBtn) {
            const street = document.getElementById('checkoutStreet').value;
            const locality = document.getElementById('checkoutLocality').value;
            const city = document.getElementById('checkoutCity').value;
            const pincode = document.getElementById('checkoutPincode').value;

            if (!street || !locality || !city || !pincode) {
                showToast('Please enter your full delivery address including locality', 'info');
                return;
            }

            if (pincode.length !== 6 || isNaN(pincode)) {
                showToast('Please enter a valid 6-digit pincode', 'error');
                return;
            }
            
            let method = 'UPI';
            if (cardBtn) method = 'Card';
            else if (nbBtn) method = 'Net Banking';
            else if (codBtn) method = 'Cash on Delivery';

            showToast(`Redirecting to WhatsApp for ${method}...`, 'success');
            setTimeout(() => {
                sendWhatsAppOrder(method);
                closePaymentModal();
            }, 800);
        }

        // Toggle Order Summary
        if (toggleBtn) {
            const content = document.getElementById('summaryContent');
            const chevron = document.getElementById('summaryChevron');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                chevron.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                content.style.display = 'none';
                chevron.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                showToast('Your cart is empty!', 'info');
                return;
            }
            const totalPrice = cart.reduce((s, i) => s + (i.qty * i.price), 0);
            closeCart();
            openPaymentModal(totalPrice);
        });
    }

    // Close on outside click
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) closePaymentModal();
        });
    }

    updateCartUI();
    syncCalculatorState();

    // ==================== THEME TOGGLE LOGIC ====================
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('bravepresso_theme', isLight ? 'light' : 'dark');
            updateThemeIcon(isLight);
        });
    }

    function updateThemeIcon(isLight) {
        const icon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
        if (icon) {
            icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Initialize Theme
    const savedTheme = localStorage.getItem('bravepresso_theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon(true);
    } else {
        updateThemeIcon(false);
    }

    // ==================== CONTACT FORM ====================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('fullName');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            let valid = true;

            contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            if (name && !name.value.trim()) { name.classList.add('error'); valid = false; }
            if (email && (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))) { email.classList.add('error'); valid = false; }
            if (subject && !subject.value) { subject.classList.add('error'); valid = false; }
            if (message && !message.value.trim()) { message.classList.add('error'); valid = false; }

            if (!valid) { showToast('Please fill in all required fields correctly.', 'error'); return; }

            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'; }

            setTimeout(() => {
                showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
                contactForm.reset();
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message'; }
            }, 1500);
        });
    }

    // ==================== NEWSLETTER ====================
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input');
            if (!input.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                showToast('Please enter a valid email.', 'error'); return;
            }
            showToast('Thank you for subscribing! 🎉', 'success');
            createConfetti();
            input.value = '';
        });
    }

    // ==================== CONFETTI EFFECT ====================
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${Math.random() > 0.5 ? '#C6A664' : '#F5F5F5'};
                top: -10px;
                left: ${Math.random() * 100}vw;
                z-index: 100000;
                border-radius: 50%;
                pointer-events: none;
            `;
            document.body.appendChild(confetti);

            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 3000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            animation.onfinish = () => confetti.remove();
        }
    }

    // ==================== TOAST ====================
    function showToast(message, type = 'info') {
        if (!toastContainer) return;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(50px)'; setTimeout(() => toast.remove(), 400); }, 3500);
    }

    // ==================== SCROLL REVEAL & ACTIVE LINK HIGHLIGHT ====================
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    const revealAndHighlight = () => {
        const scrollY = window.pageYOffset;

        // Reveal logic
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 100) el.classList.add('active');
        });

        // Highlight logic
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active-scroll');
                    if (item.getAttribute('href').includes(sectionId)) {
                        item.classList.add('active-scroll');
                    }
                });
            }
        });
        
        // Default to Home if at top
        if (scrollY < 200) {
            navItems.forEach(item => {
                item.classList.remove('active-scroll');
                if (item.getAttribute('href') === './index.html' || item.getAttribute('href') === '#home') {
                    item.classList.add('active-scroll');
                }
            });
        }
    };
    window.addEventListener('scroll', revealAndHighlight);
    revealAndHighlight();

    // ==================== BACK TO TOP ====================
    if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ==================== SMOOTH SCROLL (same-page anchors only) ====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1) {
                const target = document.querySelector(href);
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
            }
        });
    });

    // ==================== COFFEE QUIZ LOGIC ====================
    const startQuizBtn = document.getElementById('startQuizBtn');
    const quizModal = document.getElementById('quizModal');
    const quizClose = document.getElementById('quizClose');
    const beginQuiz = document.getElementById('beginQuiz');
    const quizStart = document.getElementById('quizStart');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizResult = document.getElementById('quizResult');
    const questionText = document.getElementById('questionText');
    const questionOptions = document.getElementById('questionOptions');
    const quizProgress = document.querySelector('.quiz-progress');

    const questions = [
        {
            text: "How do you usually drink your coffee?",
            options: [
                { text: "Black & Bold", icon: "fa-mug-hot", weight: { dark: 2, instant: 1 } },
                { text: "With Milk & Sugar", icon: "fa-blender", weight: { dark: 1, instant: 2 } },
                { text: "Cold / Iced", icon: "fa-ice-cream", weight: { instant: 2, dark: 1 } }
            ]
        },
        {
            text: "What flavor notes do you prefer?",
            options: [
                { text: "Chocolatey & Nutty", icon: "fa-cookie", weight: { dark: 2, instant: 1 } },
                { text: "Fruity & Bright", icon: "fa-apple-whole", weight: { instant: 1, dark: 1 } },
                { text: "Strong & Smoky", icon: "fa-fire", weight: { dark: 2 } }
            ]
        },
        {
            text: "How much time do you have to brew?",
            options: [
                { text: "I love the ritual (5-10 mins)", icon: "fa-stopwatch-20", weight: { dark: 3 } },
                { text: "Quick & Easy (under 2 mins)", icon: "fa-bolt", weight: { instant: 3 } }
            ]
        }
    ];

    let currentQuestionIndex = 0;
    let quizScores = { dark: 0, instant: 0 };

    function showQuestion() {
        const q = questions[currentQuestionIndex];
        questionText.innerText = q.text;
        questionOptions.innerHTML = '';
        quizProgress.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';
            btn.innerHTML = `<i class="fas ${opt.icon}"></i> ${opt.text}`;
            btn.onclick = () => handleOptionClick(opt.weight);
            questionOptions.appendChild(btn);
        });
    }

    function handleOptionClick(weight) {
        for (const key in weight) {
            quizScores[key] += weight[key];
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        } else {
            showResult();
        }
    }

    function showResult() {
        quizQuestion.style.display = 'none';
        quizResult.style.display = 'block';

        const resultTitle = document.getElementById('resultTitle');
        const resultDesc = document.getElementById('resultDesc');
        const resultProductName = document.getElementById('resultProductName');
        const resultImg = document.getElementById('resultImg');

        if (quizScores.dark >= quizScores.instant) {
            resultTitle.innerText = "Dark Roast - The Classic Choice";
            resultDesc.innerText = "You appreciate the rich, bold ritual of a perfect pour-over or French press.";
            resultProductName.innerText = "BRAVE PRESSO — Dark Roast (100g)";
            resultImg.src = "./product.png";
        } else {
            resultTitle.innerText = "Instant Coffee - Pure Convenience";
            resultDesc.innerText = "You value speed and versatility without compromising on the premium Brave Presso taste.";
            resultProductName.innerText = "BRAVE PRESSO — Instant Coffee Trial";
            resultImg.src = "./product.png"; // Fallback to product.png since instant-coffee.png is missing
        }
    }

    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', () => {
            quizModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            quizStart.style.display = 'block';
            quizQuestion.style.display = 'none';
            quizResult.style.display = 'none';
            currentQuestionIndex = 0;
            quizScores = { dark: 0, instant: 0 };
        });
    }

    if (beginQuiz) {
        beginQuiz.addEventListener('click', () => {
            quizStart.style.display = 'none';
            quizQuestion.style.display = 'block';
            showQuestion();
        });
    }

    if (quizClose) {
        quizClose.addEventListener('click', () => {
            quizModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    const quizAddToCartBtn = document.getElementById('quizAddToCart');
    if (quizAddToCartBtn) {
        quizAddToCartBtn.addEventListener('click', () => {
            const isDark = quizScores.dark >= quizScores.instant;
            const name = isDark ? "BRAVE PRESSO — Dark Roast (100g)" : "BRAVE PRESSO — Instant Coffee Trial";
            const price = 449; // Default price
            addToCart(name, price);
            quizModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // ==================== ESCAPE KEY ====================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) {
                navLinks.classList.remove('open');
                document.body.style.overflow = '';
            }
            if (loginModal) loginModal.classList.remove('open');
            if (trackModal) trackModal.classList.remove('open');
            if (quizModal) {
                quizModal.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });

    // ==================== USER LOGIN & ORDER TRACKING SYSTEM ====================
    // Dynamically inject Modals & Mobile Nav
    const userModalsHtml = `
        <!-- Mobile Bottom Navigation -->
        <nav class="mobile-bottom-nav">
            <a href="./index.html" class="nav-item ${window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span>HOME</span>
            </a>
            <a href="./shop.html" class="nav-item ${window.location.pathname.endsWith('shop.html') ? 'active' : ''}" id="mobileShopBtn">
                <i class="fas fa-shopping-bag"></i>
                <span>STORE</span>
            </a>
            <a href="#" class="nav-item" id="mobileCartBtn">
                <div class="nav-icon-wrapper">
                    <i class="fas fa-shopping-basket"></i>
                    <span class="cart-count-badge">0</span>
                </div>
                <span>BAG</span>
            </a>
            <a href="#" class="nav-item" id="mobileUserBtn">
                <i class="fas fa-user"></i>
                <span>ACCOUNT</span>
            </a>
        </nav>

        <!-- Profile Modal -->
        <div id="profileModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="profileWelcomeTitle"><i class="fas fa-user-circle"></i> My Profile</h2>
                    <button class="close-modal" id="closeProfileModal">&times;</button>
                    <p id="profileWelcomeSubtitle">Update your account details below</p>
                </div>

                <!-- Loyalty Points Card -->
                <div class="loyalty-card" style="background: linear-gradient(135deg, rgba(198, 166, 100, 0.2) 0%, rgba(26, 15, 10, 0.8) 100%); border: 1px solid var(--gold); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.3); text-align: center;">
                    <div>
                        <span style="color: var(--gold); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; display: block; margin-bottom: 5px;">Brave Points Balance</span>
                        <div style="display: flex; align-items: baseline; gap: 8px; justify-content: center;">
                            <span id="userBravePoints" style="font-size: 2.5rem; font-weight: 800; color: var(--white); font-family: 'Playfair Display', serif;">0</span>
                            <span style="color: var(--cream); font-size: 1rem; opacity: 0.8;">Pts</span>
                        </div>
                        <p style="font-size: 0.8rem; color: var(--cream); margin-top: 6px; opacity: 0.9; font-weight: 500;">Wallet Value: ₹<span id="pointsCashValue">0</span></p>
                        <p style="font-size: 0.6rem; color: var(--gold); margin-top: 4px; opacity: 0.7; letter-spacing: 1px;">(Redeemable: 10 Pts = ₹1)</p>
                    </div>
                </div>
                <form id="profileForm">
                    <div class="form-group">
                        <label for="profileName">Full Name</label>
                        <div class="input-with-icon">
                            <i class="fas fa-user"></i>
                            <input type="text" id="profileName" placeholder="Enter your name" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profileEmail">Email Address</label>
                        <div class="input-with-icon">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="profileEmail" placeholder="example@mail.com" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.com$" title="Email must contain @ and end with .com">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="profilePhone">Phone Number</label>
                        <div class="input-with-icon">
                            <i class="fas fa-phone"></i>
                            <input type="tel" id="profilePhone" placeholder="10 digit phone number" required pattern="[0-9]{10}" maxlength="10" minlength="10" title="Phone number must be exactly 10 digits">
                        </div>
                    </div>
                    
                    <!-- Address Section -->
                    <div class="address-section" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(198, 166, 100, 0.1);">
                        <h4 style="color: var(--gold); margin-bottom: 1rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; text-align: left;">
                            <i class="fas fa-home"></i> Home Address
                        </h4>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <input type="text" id="profileStreet" placeholder="House No. / Street / Area" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <input type="text" id="profileLocality" placeholder="Locality / Landmark" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1rem;">
                            <input type="text" id="profileCity" placeholder="City" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem;">
                            <input type="text" id="profilePincode" placeholder="Pincode" maxlength="6" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.2); border-radius: 8px; padding: 0.8rem; color: var(--cream); font-size: 0.9rem;">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">Update Profile</button>
                </form>
            </div>
        </div>

        <!-- Login Modal -->
        <div class="user-modal" id="loginModal">
            <div class="user-modal-content">
                <button class="payment-close" id="loginClose">&times;</button>
                <h3 id="authTitle">Login to BRAVE PRESSO</h3>
                <p id="authSubtitle">Access exclusive coffee perks and track orders.</p>
                <form id="authForm">
                    <div class="form-group" id="regNameGroup" style="display: none;">
                        <label for="regName" class="modal-label">Full Name</label>
                        <input type="text" id="regName" placeholder="Enter your name" class="modal-input">
                    </div>
                    <div class="form-group">
                        <label for="authEmail" class="modal-label">Email Address</label>
                        <input type="email" id="authEmail" required placeholder="name@example.com" class="modal-input">
                    </div>
                    <div class="form-group">
                        <label for="authPassword" class="modal-label">Password</label>
                        <input type="password" id="authPassword" required placeholder="••••••••" class="modal-input">
                    </div>
                    <button class="pay-btn" id="authSubmit" type="submit"><i class="fas fa-sign-in-alt"></i> Login</button>
                </form>
                <div class="modal-switch" id="modalSwitch">
                    Don't have an account? <span id="switchBtn">Register here</span>
                </div>
            </div>
        </div>

        <!-- Track Order Modal -->
        <div class="user-modal" id="trackModal">
            <div class="user-modal-content" style="max-width: 480px;">
                <button class="payment-close" id="trackClose">&times;</button>
                <h3>Track Your Order</h3>
                <p>Enter your 6-digit Order ID to track dispatch status.</p>
                <div class="track-input-group">
                    <input type="text" id="trackOrderIdInput" placeholder="e.g. BP-1024" class="track-input">
                    <button class="pay-btn btn-track" id="trackSubmitBtn"><i class="fas fa-search"></i> Track</button>
                </div>
                <div id="trackingStepperContainer" style="display: none;">
                    <div class="stepper">
                        <div class="step completed">
                            <div class="step-circle"><i class="fas fa-check"></i></div>
                            <div class="step-title">Order Placed</div>
                            <div class="step-desc">Order confirmed via secure channel</div>
                        </div>
                        <div class="step completed">
                            <div class="step-circle"><i class="fas fa-check"></i></div>
                            <div class="step-title">Packed & Dispatched</div>
                            <div class="step-desc">Freshly roasted beans sealed in Melbourne pack</div>
                        </div>
                        <div class="step active">
                            <div class="step-circle">3</div>
                            <div class="step-title">In Transit</div>
                            <div class="step-desc">Saket Hub, New Delhi Hub</div>
                        </div>
                        <div class="step pending">
                            <div class="step-circle">4</div>
                            <div class="step-title">Out for Delivery</div>
                            <div class="step-desc">Delivery partner dispatched today</div>
                        </div>
                        <div class="step pending">
                            <div class="step-circle">5</div>
                            <div class="step-title">Delivered</div>
                            <div class="step-desc">Successfully reached destination</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- My Orders Modal -->
        <div class="user-modal" id="ordersModal">
            <div class="user-modal-content" style="max-width: 600px;">
                <button class="payment-close" id="ordersClose">&times;</button>
                <h3>My Orders</h3>
                <p>View your past orders, rate them, and download invoices.</p>
                <div id="ordersListContainer" style="margin-top: 1.5rem; text-align: left; max-height: 400px; overflow-y: auto;">
                    <!-- Orders will be injected here -->
                </div>
            </div>
        </div>

        <!-- Wishlist Modal -->
        <div class="user-modal" id="wishlistModal">
            <div class="user-modal-content" style="max-width: 500px;">
                <button class="payment-close" id="wishlistClose">&times;</button>
                <h3>My Wishlist</h3>
                <p>Products you've saved for later.</p>
                <div id="wishlistListContainer" style="margin-top: 1.5rem; text-align: left; max-height: 400px; overflow-y: auto;">
                    <!-- Wishlist items will be injected here -->
                    <p style="text-align: center; color: var(--cream); opacity: 0.6;">Your wishlist is empty.</p>
                </div>
            </div>
        </div>

        <!-- All Coupons Modal -->
        <div class="user-modal" id="allCouponsModal">
            <div class="user-modal-content coupons-modal-content" style="max-width: 480px;">
                <button class="payment-close" id="allCouponsClose">&times;</button>
                <h3><i class="fas fa-tags"></i> Available Offers</h3>
                <p>Use these codes at checkout to save on your favorite coffee!</p>
                <div class="coupons-list">
                    <div class="coupon-card">
                        <div class="coupon-info">
                            <h4>FIRST10</h4>
                            <p>10% OFF on your first order</p>
                        </div>
                        <button class="copy-coupon-btn" data-code="FIRST10">Copy</button>
                    </div>
                    <div class="coupon-card">
                        <div class="coupon-info">
                            <h4>REPEAT5</h4>
                            <p>5% OFF for our regular customers</p>
                        </div>
                        <button class="copy-coupon-btn" data-code="REPEAT5">Copy</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    if (document.body) {
        document.body.insertAdjacentHTML('beforeend', userModalsHtml);
    } else {
        window.addEventListener('load', () => {
            document.body.insertAdjacentHTML('beforeend', userModalsHtml);
        });
    }

    // Inject Inline Search Bar into Header
    const searchBarHtml = `
        <div class="search-bar-wrapper" id="searchBarWrapper">
            <div class="search-input-container">
                <input type="text" id="searchInput" placeholder="Search for coffee, recipes, or story...">
                <button class="search-close-btn" id="searchCloseBtn">&times;</button>
            </div>
            <div class="search-results-dropdown" id="searchResultsDropdown"></div>
        </div>
    `;
    if (header) {
        header.insertAdjacentHTML('beforeend', searchBarHtml);
    }

    const searchBarWrapper = document.getElementById('searchBarWrapper');
    const searchInput = document.getElementById('searchInput');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchResultsDropdown = document.getElementById('searchResultsDropdown');

    const allCouponsModal = document.getElementById('allCouponsModal');
    const allCouponsClose = document.getElementById('allCouponsClose');

    loginModal = document.getElementById('loginModal');
    loginClose = document.getElementById('loginClose');
    trackModal = document.getElementById('trackModal');
    trackClose = document.getElementById('trackClose');
    ordersModal = document.getElementById('ordersModal');
    ordersClose = document.getElementById('ordersClose');
    ordersListContainer = document.getElementById('ordersListContainer');
    wishlistModal = document.getElementById('wishlistModal');
    wishlistClose = document.getElementById('wishlistClose');
    wishlistListContainer = document.getElementById('wishlistListContainer');
    profileModal = document.getElementById('profileModal');
    closeProfileModal = document.getElementById('closeProfileModal');
    profileForm = document.getElementById('profileForm');
    authForm = document.getElementById('authForm');
    authTitle = document.getElementById('authTitle');
    authSubtitle = document.getElementById('authSubtitle');
    regNameGroup = document.getElementById('regNameGroup');
    authSubmit = document.getElementById('authSubmit');
    modalSwitch = document.getElementById('modalSwitch');
    switchBtn = document.getElementById('switchBtn');
    trackOrderIdInput = document.getElementById('trackOrderIdInput');
    trackSubmitBtn = document.getElementById('trackSubmitBtn');
    trackingStepperContainer = document.getElementById('trackingStepperContainer');

    // Mobile Bottom Nav Event Delegation
    document.addEventListener('click', (e) => {
        const cartBtn = e.target.closest('#mobileCartBtn');
        const userBtn = e.target.closest('#mobileUserBtn');
        const shopBtn = e.target.closest('#mobileShopBtn');

        if (cartBtn) {
            e.preventDefault();
            openCart();
        }

        if (userBtn) {
            e.preventDefault();
            if (currentUser) {
                openProfileModal();
            } else {
                loginModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        }

        if (shopBtn) {
            // No preventDefault needed, it's a link
        }
    });

    updateCartUI();

    // Search Trigger Logic
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            searchBarWrapper.classList.toggle('open');
            if (searchBarWrapper.classList.contains('open')) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
    }

    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', () => {
            searchBarWrapper.classList.remove('open');
            searchInput.value = '';
            searchResultsDropdown.style.display = 'none';
        });
    }

    // ==================== SEE ALL COUPONS LOGIC ====================
    if (viewAllCouponsBtn && allCouponsModal) {
        viewAllCouponsBtn.addEventListener('click', () => {
            allCouponsModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    }

    if (allCouponsClose) {
        allCouponsClose.addEventListener('click', () => {
            allCouponsModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Copy Coupon Logic
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-coupon-btn');
        if (copyBtn) {
            const code = copyBtn.dataset.code;
            navigator.clipboard.writeText(code).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'Copied!';
                copyBtn.classList.add('copied');
                showToast(`Coupon ${code} copied to clipboard!`, 'success');
                
                // Auto-fill input if it exists
                const couponInput = document.getElementById('couponInput');
                if (couponInput) {
                    couponInput.value = code;
                }

                setTimeout(() => {
                    copyBtn.innerText = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        }
    });

    // ==================== BREW CALCULATOR LOGIC ====================
    const ratioBtns = document.querySelectorAll('.ratio-btn');
    const brewCupsInput = document.getElementById('brewCups');
    const coffeeGramsEl = document.getElementById('coffeeGrams');
    const waterMlEl = document.getElementById('waterMl');
    const incCupsBtn = document.querySelector('.inc-cups');
    const decCupsBtn = document.querySelector('.dec-cups');

    let currentRatio = 15;

    function calculateBrew() {
        const cups = parseInt(brewCupsInput.value) || 1;
        const totalWater = cups * 250; // 1 cup = 250ml
        const coffeeGrams = Math.round(totalWater / currentRatio);

        // Animate values
        animateValue(coffeeGramsEl, parseInt(coffeeGramsEl.innerText), coffeeGrams, 500);
        animateValue(waterMlEl, parseInt(waterMlEl.innerText), totalWater, 500);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRatio = parseInt(btn.dataset.ratio);
            calculateBrew();
        });
    });

    if (incCupsBtn && decCupsBtn && brewCupsInput) {
        incCupsBtn.addEventListener('click', () => {
            if (brewCupsInput.value < 10) {
                brewCupsInput.value = parseInt(brewCupsInput.value) + 1;
                calculateBrew();
            }
        });

        decCupsBtn.addEventListener('click', () => {
            if (brewCupsInput.value > 1) {
                brewCupsInput.value = parseInt(brewCupsInput.value) - 1;
                calculateBrew();
            }
        });

        brewCupsInput.addEventListener('input', () => {
            if (brewCupsInput.value > 10) brewCupsInput.value = 10;
            if (brewCupsInput.value < 1) brewCupsInput.value = 1;
            calculateBrew();
        });
    }

    // ==================== SOCIAL PROOF ====================
    const socialProofPopup = document.createElement('div');
    socialProofPopup.className = 'social-proof-popup';
    document.body.appendChild(socialProofPopup);

    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Coorg', 'Wayanad'];
    const actions = ['just ordered Dark Roast!', 'added a trial pack to cart.', 'is currently brewing Brave Presso.', 'just subscribed for a monthly roast.'];

    function showSocialProof() {
        const location = locations[Math.floor(Math.random() * locations.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        socialProofPopup.innerHTML = `
            <div class="sp-icon"><i class="fas fa-shopping-cart"></i></div>
            <div class="sp-content">
                <p>Someone from <strong>${location}</strong> ${action}</p>
                <span>${Math.floor(Math.random() * 59) + 1} minutes ago</span>
            </div>
        `;
        
        socialProofPopup.classList.add('show');
        setTimeout(() => socialProofPopup.classList.remove('show'), 5000);
    }

    // Show only once after 10s (Desktop only check)
    setTimeout(() => {
        if (window.innerWidth > 1024) {
            showSocialProof();
        }
    }, 10000);

    // ==================== MAGNETIC BUTTONS ====================
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-full, .checkout-btn, .add-to-cart-btn');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ==================== VARIANT IMAGE CHANGE ====================
    const variantOptions = document.querySelectorAll('.variant-option');
    const mainProductImg = document.querySelector('.main-img');
    
    if (variantOptions.length > 0 && mainProductImg) {
        variantOptions.forEach(option => {
            option.addEventListener('click', () => {
                const variantType = option.querySelector('h3').innerText.toLowerCase();
                mainProductImg.style.opacity = '0';
                
                setTimeout(() => {
                    // Logic to change image source based on variant
                    if (variantType.includes('instant')) {
                        mainProductImg.src = './product.png'; // Fallback
                    } else {
                        mainProductImg.src = './product.png';
                    }
                    mainProductImg.style.opacity = '1';
                }, 300);
            });
        });
    }

    // ==================== CUSTOM CURSOR ====================
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const interactiveElements = document.querySelectorAll('a, button, .ratio-btn, .cup-btn, .variant-option, .thumb');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
    });

    // ==================== SMOOTH PARALLAX ====================
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroImage = document.querySelector('.hero');
        if (heroImage && window.innerWidth > 1024) {
            heroImage.style.backgroundPositionY = -(scrolled * 0.3) + 'px'; // Reduced intensity from 0.5 to 0.3
        }
    });

    // Real-time Search
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (query.length < 2) {
                searchResultsDropdown.style.display = 'none';
                return;
            }

            const items = [
                { title: 'Dark Roast Coffee (100g)', link: './shop.html' },
                { title: 'Instant Coffee Trial Pack', link: './shop.html' },
                { title: 'Corporate Gifting', link: './index.html#gifting' },
                { title: 'Our Brewing Recipes', link: './index.html#recipes' },
                { title: 'Our Story', link: './about.html' },
                { title: 'Customer Reviews', link: './reviews.html' },
                { title: 'Contact Support', link: './contact.html' },
                { title: 'Shipping Policy', link: './shipping.html' }
            ];

            const filtered = items.filter(item => item.title.toLowerCase().includes(query));

            if (filtered.length > 0) {
                searchResultsDropdown.innerHTML = filtered.map(item => `
                    <div class="search-result-item">
                        <a href="${item.link}">${item.title}</a>
                    </div>
                `).join('');
                searchResultsDropdown.style.display = 'block';
            } else {
                searchResultsDropdown.innerHTML = '<div class="search-result-item" style="color: var(--cream); opacity: 0.6;">No results found.</div>';
                searchResultsDropdown.style.display = 'block';
            }
        });
    }

    // Close search on escape or click outside
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchBarWrapper.classList.remove('open');
            searchResultsDropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchBarWrapper.contains(e.target) && !searchBtn.contains(e.target)) {
            searchBarWrapper.classList.remove('open');
            searchResultsDropdown.style.display = 'none';
        }
    });

    console.log('Brave Presso JS Loaded - v2');
    let isRegisterMode = false;

    // Switch between Login and Register Mode
    document.addEventListener('click', (e) => {
        const switchBtn = e.target.closest('#switchBtn');
        if (switchBtn) {
            isRegisterMode = !isRegisterMode;
            if (isRegisterMode) {
                authTitle.innerText = "Create Account";
                authSubtitle.innerText = "Register to unlock exclusive benefits.";
                regNameGroup.style.display = "block";
                authSubmit.innerHTML = '<i class="fas fa-user-plus"></i> Register';
                modalSwitch.innerHTML = 'Already have an account? <span id="switchBtn" style="color: var(--gold); cursor: pointer; text-decoration: underline;">Login here</span>';
            } else {
                authTitle.innerText = "Login to BRAVE PRESSO";
                authSubtitle.innerText = "Access exclusive coffee perks and track orders.";
                regNameGroup.style.display = "none";
                authSubmit.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                modalSwitch.innerHTML = 'Don\'t have an account? <span id="switchBtn" style="color: var(--gold); cursor: pointer; text-decoration: underline;">Register here</span>';
            }
        }
    });

    if (loginClose) loginClose.addEventListener('click', () => {
        loginModal.classList.remove('open');
        document.body.style.overflow = 'visible';
        setTimeout(() => document.body.style.overflow = '', 50);
    });
    if (trackClose) trackClose.addEventListener('click', () => {
        trackModal.classList.remove('open');
        document.body.style.overflow = '';
    });

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => {
            profileModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (e.target === loginModal) {
            loginModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (e.target === trackModal) {
            trackModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (e.target === ordersModal) {
            ordersModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (e.target === wishlistModal) {
            wishlistModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (e.target === quizModal) {
            quizModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    if (profileForm) {
        // Prevent non-numeric characters in phone field
        const phoneInput = document.getElementById('profilePhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
            });
        }

        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('profileName').value;
            const email = document.getElementById('profileEmail').value;
            const phone = document.getElementById('profilePhone').value;
            
            const street = document.getElementById('profileStreet').value;
            const locality = document.getElementById('profileLocality').value;
            const city = document.getElementById('profileCity').value;
            const pincode = document.getElementById('profilePincode').value;
            
            // Final validation check
            if (phone.length !== 10) {
                showToast('Phone number must be exactly 10 digits', 'error');
                return;
            }
            if (!email.includes('@') || !email.endsWith('.com')) {
                showToast('Email must contain @ and end with .com', 'error');
                return;
            }
            
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPhone', phone);
            
            localStorage.setItem('userStreet', street);
            localStorage.setItem('userLocality', locality);
            localStorage.setItem('userCity', city);
            localStorage.setItem('userPincode', pincode);
            
            // Update UI if needed
            const userLabel = document.getElementById('userBtnLabel');
            if (userLabel) userLabel.innerText = name.split(' ')[0];
            
            showToast('Profile updated successfully!', 'success');
            profileModal.classList.remove('open');
        });
    }

    // Dynamic Navigation Header setup - REMOVED dynamic injection since it is now in HTML
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    const userBtnLabel = document.getElementById('userBtnLabel');
    const mobileUserBtnLabel = document.getElementById('mobileUserBtnLabel');
    const menuLogin = document.getElementById('menuLogin');
    const menuWishlist = document.getElementById('menuWishlist');
    const menuMyOrders = document.getElementById('menuMyOrders');
    const menuTrackOrder = document.getElementById('menuTrackOrder');
    const menuLogout = document.getElementById('menuLogout');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');
    const mobileWishlist = document.getElementById('mobileWishlist');
    const mobileTrackOrder = document.getElementById('mobileTrackOrder');
    const mobileLogout = document.getElementById('mobileLogout');

    // Load active session
    let currentUser = JSON.parse(localStorage.getItem('bp_user'));
    function updateAuthHeader() {
        if (currentUser) {
            const firstName = currentUser.name.split(' ')[0];
            if (userBtnLabel) userBtnLabel.innerText = firstName;
            if (mobileUserBtnLabel) mobileUserBtnLabel.innerText = firstName;
            
            // Update Profile Welcome
            const welcomeTitle = document.getElementById('profileWelcomeTitle');
            const welcomeSubtitle = document.getElementById('profileWelcomeSubtitle');
            if (welcomeTitle) welcomeTitle.innerHTML = `<i class="fas fa-user-circle"></i> Welcome back, ${firstName}!`;
            if (welcomeSubtitle) welcomeSubtitle.innerText = "Check your coffee perks and manage account";

            // Update Points Display
            const pointsDisplay = document.getElementById('userBravePoints');
            const cashValueDisplay = document.getElementById('pointsCashValue');
            
            if (pointsDisplay) {
                const points = currentUser.points || 0;
                pointsDisplay.innerText = points;
                if (cashValueDisplay) {
                    const cashValue = (points / 10).toFixed(0);
                    cashValueDisplay.innerText = cashValue;
                }
            }

            if (menuLogin) menuLogin.style.display = 'none';
            if (menuWishlist) menuWishlist.style.display = 'block';
            if (menuMyOrders) menuMyOrders.style.display = 'block';
            if (menuLogout) menuLogout.style.display = 'block';
            if (mobileLogout) mobileLogout.style.display = 'flex';
            if (mobileProfile) mobileProfile.style.display = 'flex';
            if (mobileWishlist) mobileWishlist.style.display = 'flex';
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        } else {
            if (userBtnLabel) userBtnLabel.innerText = "Login";
            if (mobileUserBtnLabel) mobileUserBtnLabel.innerText = "Login";
            
            // Reset Profile Welcome
            const welcomeTitle = document.getElementById('profileWelcomeTitle');
            const welcomeSubtitle = document.getElementById('profileWelcomeSubtitle');
            if (welcomeTitle) welcomeTitle.innerHTML = `<i class="fas fa-user-circle"></i> My Profile`;
            if (welcomeSubtitle) welcomeSubtitle.innerText = "Update your account details below";

            if (menuLogin) menuLogin.style.display = 'block';
            if (menuWishlist) menuWishlist.style.display = 'none';
            if (menuMyOrders) menuMyOrders.style.display = 'none';
            if (menuLogout) menuLogout.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';
            if (mobileProfile) mobileProfile.style.display = 'none';
            if (mobileWishlist) mobileWishlist.style.display = 'none';
            if (mobileLoginBtn) mobileLoginBtn.style.display = 'flex';
        }
    }
    updateAuthHeader();

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-menu')) return;
            e.stopPropagation();
            if (userDropdownMenu) userDropdownMenu.classList.toggle('open');
        });
    }

    if (menuLogin) {
        menuLogin.addEventListener('click', () => {
            if (userDropdownMenu) userDropdownMenu.classList.remove('open');
            if (loginModal) {
                loginModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            if (!currentUser && loginModal) {
                loginModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('open');
        });
    }

    if (mobileTrackOrder) {
        mobileTrackOrder.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('open');
            if (trackingStepperContainer) trackingStepperContainer.style.display = 'none';
            if (trackOrderIdInput) trackOrderIdInput.value = '';
            if (trackModal) trackModal.classList.add('open');
        });
    }

    if (mobileWishlist) {
        mobileWishlist.addEventListener('click', () => {
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('open');
            loadWishlist();
            if (wishlistModal) wishlistModal.classList.add('open');
        });
    }

    if (mobileLogout) {
        mobileLogout.addEventListener('click', () => {
            localStorage.removeItem('bp_user');
            currentUser = null;
            updateAuthHeader();
            if (hamburger) hamburger.classList.remove('active');
            if (navLinks) navLinks.classList.remove('open');
            showToast('Logged out successfully.', 'info');
        });
    }

    // Close user dropdown menu when clicking anywhere
    document.addEventListener('click', () => {
        if(userDropdownMenu) userDropdownMenu.classList.remove('open');
    });

    if (ordersClose) ordersClose.addEventListener('click', () => {
        if (ordersModal) ordersModal.classList.remove('open');
        document.body.style.overflow = '';
    });
    if (wishlistClose) wishlistClose.addEventListener('click', () => {
        if (wishlistModal) wishlistModal.classList.remove('open');
        document.body.style.overflow = '';
    });

    if (menuMyOrders) {
        menuMyOrders.addEventListener('click', () => {
            if (userDropdownMenu) userDropdownMenu.classList.remove('open');
            loadUserOrders();
            if (ordersModal) {
                ordersModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (menuWishlist) {
        menuWishlist.addEventListener('click', () => {
            if (userDropdownMenu) userDropdownMenu.classList.remove('open');
            loadWishlist();
            if (wishlistModal) {
                wishlistModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    function loadWishlist() {
        if (!wishlistListContainer) return;
        let wishlist = JSON.parse(localStorage.getItem('bp_wishlist') || '[]');
        
        if (wishlist.length === 0) {
            wishlistListContainer.innerHTML = '<p style="text-align: center; color: var(--cream); opacity: 0.6;">Your wishlist is empty.</p>';
            return;
        }

        wishlistListContainer.innerHTML = wishlist.map((item, index) => `
            <div class="order-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.1); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
                <img src="${item.name.includes('24g') ? './trial-front.jpg' : './product.png'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.9rem; margin-bottom: 0.2rem;">${item.name}</h4>
                    <div style="color: var(--gold); font-weight: bold; font-size: 0.85rem;">₹${item.price}</div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="pay-btn move-to-cart" data-index="${index}" style="padding: 0.5rem; height: auto;"><i class="fas fa-cart-plus"></i></button>
                    <button class="pay-btn remove-wishlist" data-index="${index}" style="padding: 0.5rem; height: auto; background: rgba(231, 76, 60, 0.1); color: #e74c3c; border-color: rgba(231, 76, 60, 0.2);"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.move-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const item = wishlist[index];
                cart.push({ name: item.name, qty: 1, price: item.price });
                wishlist.splice(index, 1);
                localStorage.setItem('bp_wishlist', JSON.stringify(wishlist));
                saveCart(); updateCartUI(); loadWishlist();
                showToast('Moved to cart!', 'success');
            });
        });

        document.querySelectorAll('.remove-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                wishlist.splice(index, 1);
                localStorage.setItem('bp_wishlist', JSON.stringify(wishlist));
                loadWishlist();
                showToast('Removed from wishlist', 'info');
            });
        });
    }

    function loadUserOrders() {
        if (!ordersListContainer) return;
        
        const mockOrders = [
            { id: 'BP-1024', date: '2024-05-15', total: 449, items: 'Dark Roast (100g) × 1', status: 'Delivered', rating: 0 },
            { id: 'BP-1056', date: '2024-05-18', total: 898, items: 'Dark Roast (100g) × 2', status: 'In Transit', rating: 0 }
        ];

        ordersListContainer.innerHTML = mockOrders.map(order => `
            <div class="order-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(198, 166, 100, 0.1); border-radius: 10px; padding: 1.2rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                    <span style="color: var(--gold); font-weight: bold;">Order #${order.id}</span>
                    <span style="background: rgba(198, 166, 100, 0.1); color: var(--gold); font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 20px;">${order.status}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--cream); margin-bottom: 0.5rem;">Date: ${order.date}</div>
                <div style="font-size: 0.9rem; margin-bottom: 0.8rem;">${order.items}</div>
                
                <div class="rating-stars" style="margin-bottom: 1rem; display: flex; gap: 0.3rem;">
                    <span style="font-size: 0.8rem; color: var(--cream); margin-right: 0.5rem;">Rate:</span>
                    ${[1,2,3,4,5].map(star => `<i class="far fa-star star-rate" data-order="${order.id}" data-val="${star}" style="color: var(--gold); cursor: pointer;"></i>`).join('')}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem; gap: 0.5rem;">
                    <div style="font-weight: bold; color: var(--gold); flex: 1;">Total: ₹${order.total}</div>
                    <button class="pay-btn download-invoice" data-order-id="${order.id}" style="padding: 0.5rem 0.8rem; font-size: 0.75rem; height: auto;">
                        <i class="fas fa-file-download"></i> Invoice
                    </button>
                    <button class="pay-btn re-order-btn" data-order-id="${order.id}" style="padding: 0.5rem 0.8rem; font-size: 0.75rem; height: auto; background: rgba(198, 166, 100, 0.1); border-color: var(--gold);">
                        <i class="fas fa-redo"></i> Re-order
                    </button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.re-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                const order = mockOrders.find(o => o.id === orderId);
                // Simple re-order logic: add to cart
                if (order.items.includes('Dark Roast')) {
                    const name = 'BRAVE PRESSO — Dark Roast (100g)';
                    const price = 449;
                    const existing = cart.find(i => i.name === name);
                    if (existing) existing.qty += 1; else cart.push({ name, qty: 1, price });
                    saveCart(); updateCartUI();
                    showToast('Order items added to cart! ☕', 'success');
                    if (ordersModal) ordersModal.classList.remove('open');
                    document.body.style.overflow = '';
                    openCart();
                }
            });
        });

        document.querySelectorAll('.star-rate').forEach(star => {
            star.addEventListener('click', (e) => {
                const val = e.target.dataset.val;
                const parent = e.target.parentElement;
                const stars = parent.querySelectorAll('.star-rate');
                stars.forEach((s, i) => {
                    if (i < val) { s.classList.replace('far', 'fas'); }
                    else { s.classList.replace('fas', 'far'); }
                });
                showToast(`Rated ${val} stars! Thank you.`, 'success');
            });
        });

        document.querySelectorAll('.download-invoice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.dataset.orderId;
                const order = mockOrders.find(o => o.id === orderId);
                generateInvoice(order);
            });
        });
    }

    function generateInvoice(order) {
        const invoiceContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', sans-serif; color: #333; margin: 0; padding: 40px; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; line-height: 24px; color: #555; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C6A664; padding-bottom: 20px; margin-bottom: 20px; }
                    .logo { height: 60px; }
                    .invoice-details { text-align: right; }
                    .billed-to { margin-bottom: 40px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    .items-table th { background: #f9f9f9; padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
                    .total { text-align: right; font-size: 1.2rem; font-weight: bold; color: #C6A664; }
                    .footer { text-align: center; color: #888; font-size: 0.8rem; margin-top: 50px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div>
                            <img src="./lion-logo.png" class="logo" alt="Logo">
                            <h2 style="margin: 5px 0; color: #C6A664;">BRAVE PRESSO</h2>
                        </div>
                        <div class="invoice-details">
                            <h1 style="margin: 0; color: #333;">INVOICE</h1>
                            <p style="margin: 0;">Order ID: #${order.id}</p>
                            <p style="margin: 0;">Date: ${order.date}</p>
                        </div>
                    </div>

                    <div class="billed-to">
                        <h4 style="border-bottom: 1px solid #C6A664; padding-bottom: 5px; margin-bottom: 10px;">BILL TO:</h4>
                        <p style="margin: 0;"><strong>${currentUser ? currentUser.name : 'Guest User'}</strong></p>
                        <p style="margin: 0;">${currentUser ? currentUser.email : 'N/A'}</p>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${order.items}</td>
                                <td style="text-align: right;">₹${order.total}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="text-align: right; padding-top: 20px;"><strong>Grand Total:</strong></td>
                                <td class="total" style="padding-top: 20px;">₹${order.total}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="footer">
                        <p>This is a computer generated invoice.</p>
                        <p>Thank you for choosing <strong>BRAVE PRESSO</strong>! We hope you love your coffee.</p>
                        <p>Contact: hello@bravepresso.com | +91 98218 46822</p>
                    </div>
                    
                    <div class="no-print" style="margin-top: 30px; text-align: center;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #C6A664; color: white; border: none; border-radius: 5px; cursor: pointer;">Print / Save as PDF</button>
                    </div>
                </div>
            </body>
            </html>
        `;

        const win = window.open('', '_blank');
        win.document.write(invoiceContent);
        win.document.close();
        
        showToast(`Invoice for ${order.id} generated!`, 'success');
    }

    if (menuTrackOrder) {
        menuTrackOrder.addEventListener('click', () => {
            if (userDropdownMenu) userDropdownMenu.classList.remove('open');
            if (trackingStepperContainer) trackingStepperContainer.style.display = 'none';
            if (trackOrderIdInput) trackOrderIdInput.value = '';
            if (trackModal) trackModal.classList.add('open');
        });
    }

    if (menuLogout) {
        menuLogout.addEventListener('click', () => {
            localStorage.removeItem('bp_user');
            currentUser = null;
            updateAuthHeader();
            if (userDropdownMenu) userDropdownMenu.classList.remove('open');
            showToast('Logged out successfully.', 'info');
        });
    }

    // Auth submit handler
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('authEmail');
            const passwordInput = document.getElementById('authPassword');
            const regNameInput = document.getElementById('regName');

            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const name = (isRegisterMode && regNameInput) ? regNameInput.value.trim() : '';

            if (isRegisterMode && !name) {
                showToast('Please enter your name.', 'error');
                return;
            }

            if (authSubmit) {
                authSubmit.classList.add('processing');
                const originalHtml = authSubmit.innerHTML;
                authSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

                setTimeout(() => {
                    authSubmit.classList.remove('processing');
                    authSubmit.innerHTML = originalHtml;
                    if (loginModal) loginModal.classList.remove('open');
                    
                    // Force re-enable scroll
                    document.body.style.overflow = 'visible';
                    document.documentElement.style.overflow = 'visible';
                    setTimeout(() => {
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                    }, 100);

                    if (isRegisterMode) {
                        currentUser = { name, email, points: 100 };
                        localStorage.setItem('bp_user', JSON.stringify(currentUser));
                        showToast(`Registration Successful! 100 Brave Points added! 🎉`, 'success');
                    } else {
                        // For mock login, check if user already exists in localStorage or give default points
                        const existingUser = JSON.parse(localStorage.getItem('bp_user'));
                        if (existingUser && existingUser.email === email) {
                            currentUser = existingUser;
                        } else {
                            currentUser = { name: email.split('@')[0], email, points: 100 };
                        localStorage.setItem('bp_user', JSON.stringify(currentUser));
                        showToast('Welcome! 100 Brave Points (₹10) added! 🎉', 'success');
                        }
                    }
                    updateAuthHeader();
                    authForm.reset();
                }, 1500);
            }
        });
    }

    // Order Tracking search handler
    if (trackSubmitBtn) {
        trackSubmitBtn.addEventListener('click', () => {
            if (!trackOrderIdInput) return;
            const orderId = trackOrderIdInput.value.trim();
            if (!orderId) {
                showToast('Please enter an Order ID.', 'error');
                return;
            }

            trackSubmitBtn.classList.add('processing');
            const originalHtml = trackSubmitBtn.innerHTML;
            trackSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> searching...';

            setTimeout(() => {
                trackSubmitBtn.classList.remove('processing');
                trackSubmitBtn.innerHTML = originalHtml;
                if (trackingStepperContainer) trackingStepperContainer.style.display = 'block';
                showToast(`Order details loaded for ${orderId}!`, 'success');
            }, 1000);
        });
    }

    // Pincode Checker Logic
    const pincodeInput = document.getElementById('pincodeInput');
    const checkPincodeBtn = document.getElementById('checkPincodeBtn');
    const pincodeStatus = document.getElementById('pincodeStatus');

    if (checkPincodeBtn && pincodeInput && pincodeStatus) {
        checkPincodeBtn.addEventListener('click', () => {
            const pincode = pincodeInput.value.trim();
            
            // Validate 6 digits
            if (!/^\d{6}$/.test(pincode)) {
                pincodeStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid 6-digit pincode.';
                pincodeStatus.className = 'pincode-status error';
                return;
            }

            checkPincodeBtn.disabled = true;
            checkPincodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            pincodeStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
            pincodeStatus.className = 'pincode-status';

            setTimeout(() => {
                checkPincodeBtn.disabled = false;
                checkPincodeBtn.innerHTML = 'Check';
                
                // For demonstration, let's assume all pincodes starting with '1' are available
                // and others are subject to a mock check
                if (pincode.startsWith('0')) {
                    pincodeStatus.innerHTML = '<i class="fas fa-times-circle"></i> Sorry, delivery is not available for this location yet.';
                    pincodeStatus.className = 'pincode-status error';
                } else {
                    pincodeStatus.innerHTML = '<i class="fas fa-check-circle"></i> Great! Delivery is available for this pincode.';
                    pincodeStatus.className = 'pincode-status success';
                }
            }, 1000);
        });

        // Allow 'Enter' key to trigger check
        pincodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPincodeBtn.click();
            }
        });
    }

    // Newsletter Popup Logic
    const newsletterPopup = document.getElementById('newsletterPopup');
    const newsletterOverlay = document.getElementById('newsletterOverlay');
    const closeNewsletter = document.getElementById('closeNewsletter');
    const popupNewsletterForm = document.getElementById('popupNewsletterForm');

    if (newsletterPopup && newsletterOverlay && closeNewsletter) {
        // Show popup after 5 seconds if not shown before
        if (!localStorage.getItem('bp_newsletter_shown')) {
            setTimeout(() => {
                newsletterPopup.classList.add('show');
                newsletterOverlay.classList.add('show');
                document.body.style.overflow = 'hidden'; // Prevent scroll when popup is open
            }, 5000);
        }

        const hidePopup = () => {
            newsletterPopup.classList.remove('show');
            newsletterOverlay.classList.remove('show');
            document.body.style.overflow = '';
            localStorage.setItem('bp_newsletter_shown', 'true');
        };

        closeNewsletter.addEventListener('click', hidePopup);
        newsletterOverlay.addEventListener('click', hidePopup);

        if (popupNewsletterForm) {
            popupNewsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                showToast('Welcome to the Coffee Club! Check your email for the discount code. ☕', 'success');
                hidePopup();
            });
        }
    }

    // Enhanced Scroll Reveal
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const revealPoint = 150;

            if (elementTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Run once on load

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-num');
    const animateStats = () => {
        stats.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const count = parseInt(stat.innerText);
            const increment = target / 50; // Speed of counting

            if (count < target) {
                stat.innerText = Math.ceil(count + increment);
                setTimeout(animateStats, 30);
            } else {
                stat.innerText = target;
            }
        });
    };

    // Trigger stats animation when hero is visible
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateStats();
                observer.unobserve(heroSection);
            }
        }, { threshold: 0.5 });
        observer.observe(heroSection);
    }

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove('active');
                });
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
});

/* ==================== DARK / LIGHT MODE TOGGLE ==================== */
(function initTheme() {
    const saved = localStorage.getItem('bravepresso-theme');
    if (saved === 'light') document.body.classList.add('light-mode');
})();

document.addEventListener('DOMContentLoaded', function () {
    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');

    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
            localStorage.setItem('bravepresso-theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            if (themeIcon) { themeIcon.classList.remove('fa-sun'); themeIcon.classList.add('fa-moon'); }
            localStorage.setItem('bravepresso-theme', 'dark');
        }
    }

    // Apply correct icon on load
    if (document.body.classList.contains('light-mode')) {
        if (themeIcon) { themeIcon.classList.remove('fa-moon'); themeIcon.classList.add('fa-sun'); }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            applyTheme(!document.body.classList.contains('light-mode'));
        });
    }

    /* ==================== REVIEWS CAROUSEL ==================== */
    const carousel = document.getElementById('reviewsCarousel');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');
    const dotsContainer = document.getElementById('carouselDots');

    if (carousel) {
        const cards = carousel.querySelectorAll('.review-card');
        const cardWidth = 320 + 32; // card width + gap
        let autoSlideTimer;

        // Build dots
        if (dotsContainer) {
            cards.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
                dot.addEventListener('click', () => scrollToCard(i));
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots() {
            if (!dotsContainer) return;
            const idx = Math.round(carousel.scrollLeft / cardWidth);
            dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
                d.classList.toggle('active', i === idx);
            });
        }

        function scrollToCard(idx) {
            carousel.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
        }

        function scrollBy(dir) {
            const idx = Math.round(carousel.scrollLeft / cardWidth);
            const next = Math.min(Math.max(idx + dir, 0), cards.length - 1);
            scrollToCard(next);
            resetAutoSlide();
        }

        function resetAutoSlide() {
            clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(() => {
                const idx = Math.round(carousel.scrollLeft / cardWidth);
                scrollToCard(idx >= cards.length - 1 ? 0 : idx + 1);
            }, 4000);
        }

        if (prevBtn) prevBtn.addEventListener('click', () => scrollBy(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => scrollBy(1));
        carousel.addEventListener('scroll', updateDots, { passive: true });
        resetAutoSlide();
    }

    /* ==================== COFFEE QUIZ ==================== */
    const quizModal = document.getElementById('quizModal');
    const quizClose = document.getElementById('quizClose');
    const beginQuiz = document.getElementById('beginQuiz');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const quizStart = document.getElementById('quizStart');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizResult = document.getElementById('quizResult');
    const quizProgress = document.querySelector('.quiz-progress');

    const questions = [
        {
            text: 'How do you usually brew your coffee?',
            options: [
                { label: 'French Press', icon: 'fa-mug-hot', value: 'bold' },
                { label: 'Espresso / Moka', icon: 'fa-bolt', value: 'intense' },
                { label: 'Pour Over / Filter', icon: 'fa-wind', value: 'light' },
                { label: 'Instant', icon: 'fa-magic', value: 'instant' }
            ]
        },
        {
            text: 'What flavours do you love most?',
            options: [
                { label: 'Dark Chocolate', icon: 'fa-cookie-bite', value: 'bold' },
                { label: 'Fruity & Bright', icon: 'fa-apple-alt', value: 'light' },
                { label: 'Nutty & Caramel', icon: 'fa-seedling', value: 'bold' },
                { label: 'Smooth & Mild', icon: 'fa-leaf', value: 'instant' }
            ]
        },
        {
            text: 'What time do you drink coffee?',
            options: [
                { label: 'Early Morning', icon: 'fa-sun', value: 'intense' },
                { label: 'With Breakfast', icon: 'fa-bread-slice', value: 'bold' },
                { label: 'Afternoon Pick-me-up', icon: 'fa-cloud-sun', value: 'light' },
                { label: 'All Day!', icon: 'fa-clock', value: 'instant' }
            ]
        }
    ];

    const results = {
        bold: {
            title: 'Dark Roast Beans — Your Match!',
            desc: 'You love bold, rich coffee with deep chocolate and hazelnut notes. Brave Presso\'s signature Dark Roast is made for you.',
            product: 'BRAVE PRESSO — Dark Roast (100g)',
            price: '₹449',
            img: './product.png',
            priceVal: 449, packSize: '100g'
        },
        intense: {
            title: 'Dark Roast Beans — Your Match!',
            desc: 'You crave intensity! Our dark roast is perfect for espresso and Moka pot, delivering a thick, concentrated cup every time.',
            product: 'BRAVE PRESSO — Dark Roast (100g)',
            price: '₹449',
            img: './product.png',
            priceVal: 449, packSize: '100g'
        },
        light: {
            title: 'Dark Roast Beans — Your Match!',
            desc: 'Even pour-over lovers are wowed by the floral complexity in Brave Presso. Our beans reveal hidden notes at lower temperatures.',
            product: 'BRAVE PRESSO — Dark Roast (100g)',
            price: '₹449',
            img: './product.png',
            priceVal: 449, packSize: '100g'
        },
        instant: {
            title: 'Instant Coffee Jar — Your Match!',
            desc: 'You want quality without the fuss. Our 24g Glass Jar instant coffee gives you a full Brave Presso experience in 60 seconds.',
            product: 'BRAVE PRESSO — Instant Coffee Trial Pack (24g Glass Jar)',
            price: '₹149',
            img: './product.png',
            priceVal: 149, packSize: '24g'
        }
    };

    let answers = [];
    let currentQ = 0;

    function openQuiz() {
        if (quizModal) {
            quizModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            resetQuiz();
        }
    }

    function resetQuiz() {
        answers = []; currentQ = 0;
        if (quizStart) quizStart.style.display = 'block';
        if (quizQuestion) quizQuestion.style.display = 'none';
        if (quizResult) quizResult.style.display = 'none';
        if (quizProgress) quizProgress.style.width = '0%';
    }

    function showQuestion(idx) {
        if (quizStart) quizStart.style.display = 'none';
        if (quizResult) quizResult.style.display = 'none';
        if (quizQuestion) quizQuestion.style.display = 'block';
        const q = questions[idx];
        document.getElementById('questionText').textContent = q.text;
        const opts = document.getElementById('questionOptions');
        opts.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.innerHTML = `<i class="fas ${opt.icon}"></i>${opt.label}`;
            btn.addEventListener('click', () => {
                answers.push(opt.value);
                if (quizProgress) quizProgress.style.width = ((idx + 1) / questions.length * 100) + '%';
                if (idx + 1 < questions.length) {
                    showQuestion(idx + 1);
                } else {
                    showResult();
                }
            });
            opts.appendChild(btn);
        });
    }

    function showResult() {
        if (quizQuestion) quizQuestion.style.display = 'none';
        if (quizResult) quizResult.style.display = 'block';
        // Tally most common answer
        const tally = {};
        answers.forEach(a => tally[a] = (tally[a] || 0) + 1);
        const winner = Object.keys(tally).reduce((a, b) => tally[a] > tally[b] ? a : b);
        const res = results[winner] || results.bold;
        document.getElementById('resultTitle').textContent = res.title;
        document.getElementById('resultDesc').textContent = res.desc;
        document.getElementById('resultProductName').textContent = res.product;
        document.getElementById('resultPrice').textContent = res.price;
        document.getElementById('resultImg').src = res.img;
        // Store result for add-to-cart
        const addBtn = document.getElementById('quizAddToCart');
        if (addBtn) {
            addBtn.dataset.name = res.product;
            addBtn.dataset.price = res.priceVal;
            addBtn.dataset.pack = res.packSize;
        }
    }

    if (startQuizBtn) startQuizBtn.addEventListener('click', openQuiz);
    if (beginQuiz) beginQuiz.addEventListener('click', () => showQuestion(0));
    if (quizClose) quizClose.addEventListener('click', () => {
        if (quizModal) { quizModal.style.display = 'none'; document.body.style.overflow = ''; }
    });
    if (quizModal) quizModal.addEventListener('click', e => {
        if (e.target === quizModal) { quizModal.style.display = 'none'; document.body.style.overflow = ''; }
    });

    const quizAddBtn = document.getElementById('quizAddToCart');
    if (quizAddBtn) {
        quizAddBtn.addEventListener('click', function () {
            const name = this.dataset.name || 'BRAVE PRESSO — Dark Roast (100g)';
            const price = parseFloat(this.dataset.price || 449);
            if (typeof addToCart === 'function') {
                addToCart(name, price, 1);
            }
            if (quizModal) { quizModal.style.display = 'none'; document.body.style.overflow = ''; }
        });
    }

    /* ==================== FLOATING BEANS PARALLAX ==================== */
    const beansContainer = document.getElementById('floatingBeans');
    if (beansContainer) {
        const NUM_BEANS = 18;
        for (let i = 0; i < NUM_BEANS; i++) {
            const bean = document.createElement('div');
            bean.className = 'bean';
            bean.style.left = Math.random() * 100 + '%';
            bean.style.animationDuration = (8 + Math.random() * 12) + 's';
            bean.style.animationDelay = (Math.random() * 10) + 's';
            bean.style.width = (8 + Math.random() * 10) + 'px';
            bean.style.height = (12 + Math.random() * 14) + 'px';
            bean.style.opacity = (0.06 + Math.random() * 0.1).toString();
            beansContainer.appendChild(bean);
        }

        window.addEventListener('scroll', function () {
            const scrollY = window.scrollY;
            beansContainer.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
        }, { passive: true });
    }
});
