"use client"
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCustomers } from '@/redux/slices/customersSlice';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { CustomerCLient } from './components/client';

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const { customers, loading, error } = useAppSelector((state) => state.customers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Toaster/>
      <CustomerCLient data={customers}/>
      {/* <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul> */}
    </div>
  );
}
