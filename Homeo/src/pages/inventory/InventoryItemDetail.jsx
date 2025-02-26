import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';

const InventoryItemDetail = () => {
  const { id } = useParams();
  
  const [item, setItem] = useState({
    name: '',
    description: '',
    manufacturer: '',
    unit: '',
    reorderLevel: 0,
    expiryDate: '',
    category: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BACKEND_URL + `/inventory-items/${id}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch inventory item');
        }
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load inventory item.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Inventory Item Details</h2>
          <div className="mb-4">
            <strong>Name: </strong>
            <span>{item.name}</span>
          </div>
          <div className="mb-4">
            <strong>Description: </strong>
            <span>{item.description}</span>
          </div>
          <div className="mb-4">
            <strong>Manufacturer: </strong>
            <span>{item.manufacturer}</span>
          </div>
          <div className="mb-4">
            <strong>Unit: </strong>
            <span>{item.unit}</span>
          </div>
          <div className="mb-4">
            <strong>Reorder Level: </strong>
            <span>{item.reorderLevel}</span>
          </div>
          <div className="mb-4">
            <strong>Expiry Date: </strong>
            <span>{item.expiryDate}</span>
          </div>
          {/* Optionally display category details if available */}
          {item.category && item.category.name && (
            <div className="mb-4">
              <strong>Category: </strong>
              <span>{item.category.name}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InventoryItemDetail;
