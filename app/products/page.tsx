"use client"
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchProducts } from '@/redux/slices/productsSlice';
import { useEffect } from 'react';
import { ProductCLient } from './components/client';
import { Toaster } from 'react-hot-toast';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <Toaster/>
      <ProductCLient data={products}/>
      {/* <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul> */}
    </div>
  );
}
