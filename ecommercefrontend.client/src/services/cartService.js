class CartService {
    // Get cart from localStorage
    static getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Save cart to localStorage
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Add item to cart
    static addToCart(product, quantity = 1) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: quantity,
                brand: product.brand
            });
        }

        this.saveCart(cart);
        return cart;
    }

    // Remove item from cart
    static removeFromCart(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
        return cart;
    }

    // Update quantity
    static updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            }
            item.quantity = quantity;
        }

        this.saveCart(cart);
        return cart;
    }

    // Clear cart
    static clearCart() {
        localStorage.removeItem('cart');
        return [];
    }

    // Get cart count
    static getCartCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart total
    static getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Check if product is in cart
    static isInCart(productId) {
        const cart = this.getCart();
        return cart.some(item => item.id === productId);
    }
}

export default CartService;