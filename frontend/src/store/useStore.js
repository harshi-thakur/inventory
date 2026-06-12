import { create } from 'zustand'
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCustomers, createCustomer, deleteCustomer,
  getOrders, getOrder, createOrder, deleteOrder,
} from '../services/api'

// ── Data Transformation Functions ────────────────────────────────────────────

/** Transform backend product to frontend format */
function normalizeProduct(p) {
  return {
    ...p,
    quantity: p.stock_quantity, // Backend: stock_quantity → Frontend: quantity
  }
}

/** Transform backend customer to frontend format */
function normalizeCustomer(c) {
  return {
    ...c,
    phone:c.phone_number,
    name: c.full_name, // Backend: full_name → Frontend: name
  }
}

/** Transform backend order to frontend format */
function normalizeOrder(o) {
  const customer = o.customer ? normalizeCustomer(o.customer) : null
  return {
    ...o,
    customerId: o.customer_id,
    customerName: customer?.name,
    customerEmail: customer?.email,
    customerPhone: customer?.phone,
    customer,
    amount: o.total_amount,
    total: o.total_amount, // Both names for compatibility
    totalAmount: o.total_amount,
    date: o.created_at,
    createdAt: o.created_at,
  }
}

/** Transform backend order detail to frontend format */
function normalizeOrderDetail(o) {
  const customer = o.customer ? normalizeCustomer(o.customer) : null
  return {
    ...o,
    customerId: o.customer_id,
    customerName: customer?.name,
    customerEmail: customer?.email,
    customerPhone: customer?.phone,
    customer,
    amount: o.total_amount,
    total: o.total_amount,
    totalAmount: o.total_amount,
    date: o.created_at,
    createdAt: o.created_at,
    items: (o.order_items || []).map((item) => ({
      ...item,
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      price: item.unit_price, // Alias for compatibility
      productName: item.product?.name,
    })),
    orderItems: (o.order_items || []).map((item) => ({
      ...item,
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      price: item.unit_price,
      productName: item.product?.name,
    })),
  }
}

// ── Zustand Store ───────────────────────────────────────────────────────────

const useStore = create((set, get) => ({
  // ── Products ────────────────────────────────────────────────────────────────
  products: [],
  productsLoading: false,
  productsError: null,

  fetchProducts: async () => {
    set({ productsLoading: true, productsError: null })
    try {
      const { data } = await getProducts()
      set({ products: data.map(normalizeProduct), productsLoading: false })
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to load products'
      set({ productsError: errorMessage, productsLoading: false })
    }
  },

  addProduct: async (payload) => {
    // Transform frontend format to backend format
    const backendPayload = {
      name: payload.name,
      sku: payload.sku,
      price: payload.price,
      stock_quantity: payload.stock_quantity || payload.quantity,
    }
    const { data } = await createProduct(backendPayload)
    const normalized = normalizeProduct(data)
    set((s) => ({ products: [...s.products, normalized] }))
    return normalized
  },

  editProduct: async (id, payload) => {
    // Transform frontend format to backend format
    const backendPayload = {
      name: payload.name,
      sku: payload.sku,
      price: payload.price,
      stock_quantity: payload.stock_quantity || payload.quantity,
    }
    const { data } = await updateProduct(id, backendPayload)
    const normalized = normalizeProduct(data)
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? normalized : p)),
    }))
    return normalized
  },

  removeProduct: async (id) => {
    await deleteProduct(id)
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }))
  },

  // ── Customers ───────────────────────────────────────────────────────────────
  customers: [],
  customersLoading: false,
  customersError: null,

  fetchCustomers: async () => {
    set({ customersLoading: true, customersError: null })
    try {
      const { data } = await getCustomers()
      set({ customers: data.map(normalizeCustomer), customersLoading: false })
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to load customers'
      set({ customersError: errorMessage, customersLoading: false })
    }
  },

  addCustomer: async (payload) => {
    // Transform frontend format to backend format
    const backendPayload = {
      full_name: payload.name || payload.full_name,
      email: payload.email,
      phone_number: payload.phone || payload.phone_number,
    }
    const { data } = await createCustomer(backendPayload)
    const normalized = normalizeCustomer(data)
    set((s) => ({ customers: [...s.customers, normalized] }))
    return normalized
  },

  removeCustomer: async (id) => {
    await deleteCustomer(id)
    set((s) => ({ customers: s.customers.filter((c) => c.id !== id) }))
  },

  // ── Orders ──────────────────────────────────────────────────────────────────
  orders: [],
  ordersLoading: false,
  ordersError: null,

  fetchOrders: async () => {
    set({ ordersLoading: true, ordersError: null })
    try {
      const { data } = await getOrders()
      set({ orders: data.map(normalizeOrder), ordersLoading: false })
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to load orders'
      set({ ordersError: errorMessage, ordersLoading: false })
    }
  },

  fetchOrder: async (id) => {
    const { data } = await getOrder(id)
    return normalizeOrderDetail(data)
  },

  addOrder: async (payload) => {
    // Transform frontend format to backend format
    const backendPayload = {
      customer_id: payload.customerId || payload.customer_id,
      items: (payload.items || []).map((item) => ({
        product_id: item.productId || item.product_id,
        quantity: item.quantity,
      })),
    }
    const { data } = await createOrder(backendPayload)
    const normalized = normalizeOrder(data)
    set((s) => ({ orders: [...s.orders, normalized] }))
    return normalized
  },

  removeOrder: async (id) => {
    await deleteOrder(id)
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }))
  },
}))

export default useStore
