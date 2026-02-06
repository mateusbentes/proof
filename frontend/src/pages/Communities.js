import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';
import './Communities.css';

function Communities() {
  const { token } = useAuthStore();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isPrivate: false,
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await client.get('/communities');
      setCommunities(response.data);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Please log in to create a community');
      return;
    }

    try {
      const response = await client.post('/communities', formData);
      setCommunities([response.data, ...communities]);
      setFormData({
        name: '',
        slug: '',
        description: '',
        isPrivate: false,
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create community:', error);
      alert(error.response?.data?.error || 'Failed to create community');
    }
  };

  const handleJoinCommunity = async (communityId) => {
    if (!token) {
      alert('Please log in to join a community');
      return;
    }

    try {
      await client.post(`/communities/${communityId}/join`);
      alert('Joined community successfully!');
    } catch (error) {
      console.error('Failed to join community:', error);
      alert(error.response?.data?.error || 'Failed to join community');
    }
  };

  if (loading) {
    return <div className="loading">Loading communities...</div>;
  }

  return (
    <div className="communities-page">
      <div className="communities-header">
        <h1>Communities</h1>
        <p>Join niche communities for modding, free software, gaming, and more.</p>

        {token && (
          <button
            className="btn-create"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create Community'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="create-community-form">
          <h2>Create a New Community</h2>
          <form onSubmit={handleCreateCommunity}>
            <div className="form-group">
              <label htmlFor="name">Community Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g., Mount & Blade Modding"
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug (URL-friendly)</label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
                placeholder="e.g., mb-modding"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your community..."
                rows="4"
              />
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) =>
                  setFormData({ ...formData, isPrivate: e.target.checked })
                }
              />
              <label htmlFor="isPrivate">Private Community</label>
            </div>

            <button type="submit" className="btn-submit">
              Create Community
            </button>
          </form>
        </div>
      )}

      <div className="communities-grid">
        {communities.length === 0 ? (
          <p className="no-communities">
            No communities yet. Be the first to create one!
          </p>
        ) : (
          communities.map((community) => (
            <div key={community.id} className="community-card">
              <div className="community-icon">
                {community.icon_url ? (
                  <img src={community.icon_url} alt={community.name} />
                ) : (
                  <div className="icon-placeholder">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h3>{community.name}</h3>
              <p className="community-slug">/{community.slug}</p>
              <p className="community-description">{community.description}</p>

              <div className="community-meta">
                <span className="member-count">
                  {community.member_count || 0} members
                </span>
              </div>

              {token && (
                <button
                  className="btn-join"
                  onClick={() => handleJoinCommunity(community.id)}
                >
                  Join Community
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Communities;
