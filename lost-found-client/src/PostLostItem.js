import { useState } from 'react';
import axios from 'axios';

function PostLostItem({ onPost }) { // onPost callback to refresh list
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !description || !location || !date) return;

    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('date', date);
    if (image) formData.append('image', image);

    try {
      const res = await axios.post('http://localhost:5000/lost-items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 201) {
        alert(`✅ Item "${res.data.itemName}" posted successfully!`);

        // reset form
        setItemName('');
        setDescription('');
        setLocation('');
        setDate('');
        setImage(null);
        setPreview(null);

        // trigger list refresh
        if (onPost) onPost(res.data);
      } else {
        alert(`⚠️ Unexpected server response: ${res.status}`);
      }
    } catch (err) {
      console.error('Error posting item:', err.response || err);
      alert('❌ Error posting item');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Item Name" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required />
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" required />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {preview && <img src={preview} alt="Preview" width="150" style={{ marginTop: '10px', borderRadius: '5px' }} />}
      <button type="submit" style={{ padding: '10px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Post Lost Item
      </button>
    </form>
  );
}

export default PostLostItem;
