import { configureStore } from '@reduxjs/toolkit';
import cartItems from './cartSlice';

const store = configureStore({
  reducer: {
    cartItems,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;