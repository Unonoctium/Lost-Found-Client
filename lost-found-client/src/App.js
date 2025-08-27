import { useState } from 'react';
import PostLostItem from './PostLostItem';
import LostItemsList from './LostItemsList';

function App() {
  const [activeTab, setActiveTab] = useState('post');
  const [refreshSignal, setRefreshSignal] = useState(0); // increment to trigger list refresh

  const handlePost = () => setRefreshSignal(prev => prev + 1);

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Lost & Found</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('post')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'post' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'post' ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Post Lost Item
        </button>

        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'list' ? '#4CAF50' : '#f0f0f0',
            color: activeTab === 'list' ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Lost Items List
        </button>
      </div>

      <div>
        {activeTab === 'post' && <PostLostItem onPost={handlePost} />}
        {activeTab === 'list' && <LostItemsList refreshSignal={refreshSignal} />}
      </div>
    </div>
  );
}

export default App;
