const Cart = {
  getCart() {
    return JSON.parse(localStorage.getItem('gamegel_cart') || '[]');
  },

  saveCart(cart) {
    localStorage.setItem('gamegel_cart', JSON.stringify(cart));
  },

  clearCart() {
    localStorage.removeItem('gamegel_cart');
  },

  isInCart(title) {
    return this.getCart().some(item => item.title === title);
  },

  getCartCount() {
    return this.getCart().length;
  },

  removeFromCart(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
  },

  addToCart(game) {
    if (this.isInCart(game.title)) {
      this.showToast('Already in cart!');
      return;
    }
    const cart = this.getCart();
    cart.push({
      title: game.title,
      price: game.price,
      image: game.image,
      addedAt: new Date().toISOString()
    });
    this.saveCart(cart);
    this.showToast('Added to cart!');
  },

  parsePrice(priceString) {
    if (!priceString) return 0;
    const lower = priceString.toLowerCase();
    if (lower.includes('free')) return 0;
    const match = priceString.match(/\$?([\d,]+\.?\d*)/);
    return match ? parseFloat(match[1].replace(',', '')) : 0;
  },

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + this.parsePrice(item.price), 0);
  },

  formatPrice(amount) {
    return '$' + amount.toFixed(2);
  },

  showToast(message) {
    const existing = document.querySelector('.cart-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  updateCartBadges() {
    const count = this.getCartCount();
    document.querySelectorAll('.cart-badge-count').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  getPurchased() {
    return JSON.parse(localStorage.getItem('gamegel_purchased') || '[]');
  },

  savePurchased(purchased) {
    localStorage.setItem('gamegel_purchased', JSON.stringify(purchased));
  },

  addToPurchased(cart) {
    const purchased = this.getPurchased();
    const orderNumber = 'GG-' + Math.floor(10000 + Math.random() * 90000);
    cart.forEach(item => {
      purchased.push({
        ...item,
        purchasedAt: new Date().toISOString(),
        orderNumber: orderNumber
      });
    });
    this.savePurchased(purchased);
    return orderNumber;
  },

  isPurchased(title) {
    return this.getPurchased().some(item => item.title === title);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Cart.updateCartBadges();
});
