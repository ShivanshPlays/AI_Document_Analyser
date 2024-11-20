import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './slices/productsSlice';
import invoicesReducer from './slices/invoicesSlice';
import customersReducer from './slices/customersSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    invoices: invoicesReducer,
    customers: customersReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
