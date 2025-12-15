'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

// Define types for Cart Item and Cart Context
export interface CartItem {
    productId: string;
    quantity: number;
    shopId: string;
    shopName: string;
    productName: string;
    price: number;
    imageUrl?: string;
    shopLogo?: string;
    shopPhone?: string;
    variantId?: string; // For future use if variants are added
    variantName?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;
    getShopGroupedItems: () => Record<string, CartItem[]>; // Returns items grouped by shopId
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const lastUpdateRef = useRef<string>('');

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('vallaroo_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart from local storage:', error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('vallaroo_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = useCallback((newItem: CartItem) => {
        const updateId = `${newItem.productId}-${Date.now()}`;

        setCartItems((prevItems) => {
            // Prevent double execution
            if (lastUpdateRef.current === updateId) {
                return prevItems;
            }

            lastUpdateRef.current = updateId;

            const existingItemIndex = prevItems.findIndex(
                (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
            );

            if (existingItemIndex > -1) {
                // Item exists, accumulate quantity
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantity += newItem.quantity;
                return newItems;
            } else {
                // Item does not exist, add it
                return [...prevItems, newItem];
            }
        });
    }, []);

    const removeFromCart = (productId: string, variantId?: string) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => !(item.productId === productId && item.variantId === variantId))
        );
    };

    const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
        if (quantity < 1) {
            removeFromCart(productId, variantId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.productId === productId && item.variantId === variantId
                    ? { ...item, quantity: quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const getShopGroupedItems = () => {
        const grouped: Record<string, CartItem[]> = {};
        cartItems.forEach((item) => {
            if (!grouped[item.shopId]) {
                grouped[item.shopId] = [];
            }
            grouped[item.shopId].push(item);
        });
        return grouped;
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartTotal,
                getCartItemCount,
                getShopGroupedItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
