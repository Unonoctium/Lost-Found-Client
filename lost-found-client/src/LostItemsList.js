import { useEffect, useState } from 'react';
import axios from 'axios';

function LostItemsList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/lost-items');
        setItems(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  return (
    <div>
      <h2>Lost Items</h2>
      {items.length === 0 && <p>No lost items posted yet.</p>}
      {items.map(item => (
        <div key={item._id} style={{
          border: '1px solid #ccc',
          margin: '10px 0',
          padding: '10px',
          borderRadius: '5px',
          display: 'flex',
          gap: '15px',
          alignItems: 'flex-start'
        }}>
          <div>
            {item.image && <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.itemName} width="120" style={{ borderRadius: '5px' }} />}
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
