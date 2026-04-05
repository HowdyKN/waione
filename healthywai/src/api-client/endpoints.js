// API endpoint definitions

export const endpoints = {
  // Auth endpoints
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    phoneRequest: '/auth/phone/request',
    phoneVerify: '/auth/phone/verify',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    google: '/auth/google',
    googleCallback: '/auth/google/callback',
    apple: '/auth/apple',
    appleCallback: '/auth/apple/callback',
    facebook: '/auth/facebook',
    facebookCallback: '/auth/facebook/callback'
  },
  
  // Resource endpoints (template - extend as needed)
  resources: {
    list: '/resources',
    get: (id) => `/resources/${id}`,
    create: '/resources',
    update: (id) => `/resources/${id}`,
    delete: (id) => `/resources/${id}`
  },

  products: {
    list: '/products'
  },

  orders: {
    list: '/orders',
    create: '/orders',
    detail: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}`
  }
};

export default endpoints;


