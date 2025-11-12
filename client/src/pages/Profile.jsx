import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const DEFAULT_INTERESTS = [
  "Technology", "Programming", "Design", "Lifestyle",
  "Travel", "Food", "Health", "Business", "Education"
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [prefs, setPrefs] = useState({ newsletter: false, digestFrequency: 'weekly' });
  const [loading, setLoading] = useState(true);
  const [savingInterests, setSavingInterests] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get('/auth/profile').then(res => {
      if (!mounted) return;
      const u = res.data.user;
      setUser(u);
      setSelected((u.interests || []).map(i => i.category));
      setPrefs(u.preferences || prefs);
    }).catch(console.error).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const toggleInterest = (cat) => {
    setSelected(prev => prev.includes(cat) ? prev.filter(p => p !== cat) : [...prev, cat]);
  };

  const saveInterests = async () => {
    try {
      setSavingInterests(true);
      const payload = selected.map(s => ({ category: s, score: 1 }));
      await api.put('/user/interests', { interests: payload });
      // refresh profile
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
    } catch (err) {
      console.error('Save interests failed', err);
    } finally {
      setSavingInterests(false);
    }
  };

  const savePrefs = async () => {
    try {
      setSavingPrefs(true);
      await api.put('/user/preferences', prefs);
      const res = await api.get('/auth/profile');
      setUser(res.data.user);
    } catch (err) {
      console.error('Save prefs failed', err);
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto py-12">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold">Profile</h3>
          <div className="mt-4">
            <div className="text-lg font-medium">{user?.username}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
            <p className="text-sm text-gray-600 mt-3">{user?.bio || 'No bio yet.'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
          <h3 className="text-xl font-semibold">Personalization</h3>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_INTERESTS.map(i => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1 rounded-full border ${selected.includes(i) ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700'}`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-3">
              <button onClick={saveInterests} disabled={savingInterests} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                {savingInterests ? 'Saving...' : 'Save interests'}
              </button>
              <button onClick={() => { setSelected([]); }} className="text-sm text-gray-500">Clear</button>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Digest</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={prefs.newsletter} onChange={(e) => setPrefs({...prefs, newsletter: e.target.checked})} />
                <span className="text-sm">Subscribe to newsletter</span>
              </label>

              <select value={prefs.digestFrequency} onChange={(e) => setPrefs({...prefs, digestFrequency: e.target.value})} className="border rounded-md p-1">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="none">None</option>
              </select>

              <button onClick={savePrefs} disabled={savingPrefs} className="bg-blue-600 text-white px-3 py-1 rounded-md">
                {savingPrefs ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;