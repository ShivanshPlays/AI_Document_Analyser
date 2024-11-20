"use client"
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { fetchInvoices } from '@/redux/slices/invoicesSlice';
import { InvoiceCLient } from './components/client';

export default function InvoicesPage() {
  const dispatch = useAppDispatch();
  const { invoices, loading, error } = useAppSelector((state) => state.invoices);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Toaster/>
      <InvoiceCLient data={invoices}/>
      {/* <ul>
        {Invoices.map((Invoice) => (
          <li key={Invoice.id}>{Invoice.name}</li>
        ))}
      </ul> */}
    </div>
  );
}
