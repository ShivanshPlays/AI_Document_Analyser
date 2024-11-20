import { getAllInvoices } from "@/actions/Invoice";
import { Invoice } from "@prisma/client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface InvoicesState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  loading: false,
  error: null,
};

export const fetchInvoices = createAsyncThunk<Invoice[]>(
  'invoices/fetch',
  async () => {
    const invoices = await getAllInvoices(); // Call the server action
    return invoices;
  }
);
const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchInvoices.fulfilled,
        (state, action: PayloadAction<Invoice[]>) => {
          state.loading = false;
          state.invoices = action.payload;
        }
      )
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch invoices";
      });
  },
});

export default invoicesSlice.reducer;
