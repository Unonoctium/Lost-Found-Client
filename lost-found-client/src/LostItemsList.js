import { useEffect, useState } from 'react';
import axios from 'axios';

function LostItemsList({ refreshSignal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/lost-items');

      // handle array or wrapped object
      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else if (Array.isArray(res.data.items)) {
        setItems(res.data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Error fetching lost items:', err);
      setError('Failed to load lost items');
    } finally {
      setLoading(false);
    }
  };

  // fetch on mount or when refreshSignal changes
  useEffect(() => {
    fetchItems();
  }, [refreshSignal]);

  if (loading) return <p>Loading lost items...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Lost Items</h2>
      {items.length === 0 && <p>No lost items posted yet.</p>}
      {Array.isArray(items) && items.map(item => (
        <div
          key={item._id}
          style={{
            border: '1px solid #ccc',
            margin: '10px 0',
            padding: '10px',
            borderRadius: '5px',
            display: 'flex',
            gap: '15px',
            alignItems: 'flex-start'
          }}
        >
          <div>
            {item.image && (
              <img
                src={item.image.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`}
                alt={item.itemName}
                width="120"
                style={{ borderRadius: '5px' }}
              />
            )}
          </div>
          <div>
            <h3>{item.itemName}</h3>
            <p>{item.description}</p>
            <p><b>Location:</b> {item.location}</p>
            <p><b>Date:</b> {new Date(item.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LostItemsList;
