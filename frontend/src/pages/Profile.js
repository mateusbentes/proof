import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';
import './Profile.css';

function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    avatarPrompt: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [generatingAvatar, setGeneratingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const response = await client.get(`/users/${user.id}`);
      setProfile(response.data);
      setFormData({
        displayName: response.data.profile?.display_name || '',
        bio: response.data.profile?.bio || '',
        location: response.data.profile?.location || '',
        website: response.data.profile?.website || '',
        avatarPrompt: response.data.profile?.avatar_prompt || '',
      });
      setAvatarUrl(response.data.profile?.avatar_url || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      await client.put(`/users/${user.id}/profile`, formData);
      setEditing(false);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleGenerateAvatar = async () => {
    if (!formData.avatarPrompt.trim()) {
      alert('Please enter an avatar prompt');
      return;
    }

    setGeneratingAvatar(true);

    try {
      const response = await client.post(`/users/${user.id}/avatar`, {
        prompt: formData.avatarPrompt,
      });
      setAvatarUrl(response.data.avatarUrl);
      alert('Avatar generated successfully!');
    } catch (error) {
      console.error('Failed to generate avatar:', error);
      alert('Failed to generate avatar');
    } finally {
      setGeneratingAvatar(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Failed to load profile</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-section">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user.username} className="avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="user-info">
            <h1>{formData.displayName || user.username}</h1>
            <p className="username">@{user.username}</p>
            <p className="email">{user.email}</p>
            {profile.profile?.bio && <p className="bio">{profile.profile.bio}</p>}
          </div>
        </div>

        {!editing ? (
          <div className="profile-view">
            <div className="profile-section">
              <h2>Profile Information</h2>
              <div className="info-grid">
                {formData.displayName && (
                  <div className="info-item">
                    <label>Display Name</label>
                    <p>{formData.displayName}</p>
                  </div>
                )}
                {formData.location && (
                  <div className="info-item">
                    <label>Location</label>
                    <p>{formData.location}</p>
                  </div>
                )}
                {formData.website && (
                  <div className="info-item">
                    <label>Website</label>
                    <a href={formData.website} target="_blank" rel="noopener noreferrer">
                      {formData.website}
                    </a>
                  </div>
                )}
                {formData.bio && (
                  <div className="info-item full-width">
                    <label>Bio</label>
                    <p>{formData.bio}</p>
                  </div>
                )}
              </div>
            </div>

            <button className="btn-edit" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="profile-edit">
            <div className="form-section">
              <h2>Edit Profile</h2>

              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Your display name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Your location"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Avatar</h2>
              <div className="form-group">
                <label htmlFor="avatarPrompt">Avatar Prompt</label>
                <textarea
                  id="avatarPrompt"
                  name="avatarPrompt"
                  value={formData.avatarPrompt}
                  onChange={handleInputChange}
                  placeholder="e.g., 'a modder's hat with a Linux logo'"
                  rows="3"
                />
              </div>

              <button
                type="button"
                className="btn-generate"
                onClick={handleGenerateAvatar}
                disabled={generatingAvatar}
              >
                {generatingAvatar ? 'Generating...' : 'Generate Avatar'}
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                Save Changes
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;
