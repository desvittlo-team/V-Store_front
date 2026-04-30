// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/ProfilePage.css";

import EditProfileModal  from "../components/Profile/EditProfileModal";
import ProfileHeader     from "../components/Profile/ProfileHeader";
import ProfileSidebar    from "../components/Profile/ProfileSidebar";
import BadgesCard        from "../components/Profile/BadgesCard";
import GamesCard         from "../components/Profile/GamesCard";
import DiscussionsCard   from "../components/Profile/DiscussionsCard";
import CommentsCard      from "../components/Profile/CommentsCard";

const BASE_URL = "https://localhost:7059";

export default function ProfilePage({ user, setUser }) {
  const navigate   = useNavigate();
  const { id }     = useParams();

  const [profileData, setProfileData] = useState(null);
  const [friends,     setFriends]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isEditing,   setIsEditing]   = useState(false);
  const [activePage,  setActivePage]  = useState("main");

  const isOwnProfile = !id || (user && String(id) === String(user.id));

  useEffect(() => {
    if (!user?.token) { navigate("/login"); return; }
    const headers  = { Authorization: `Bearer ${user.token}` };
    const fetchUrl = id ? `${BASE_URL}/api/profile/${id}` : `${BASE_URL}/api/profile/me`;

    Promise.all([
      fetch(fetchUrl,                { headers }),
      fetch(`${BASE_URL}/api/users`, { headers }),
    ])
      .then(async ([pRes, uRes]) => {
        if (pRes.status === 401) { navigate("/login"); return; }
        setProfileData(pRes.ok ? await pRes.json() : null);
        setFriends(uRes.ok ? await uRes.json() : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate, id]);

useEffect(() => {
    const pageContent = document.querySelector('.page-content');
    if (!pageContent) return;
    const bgRaw = profileData?.user?.backgroundUrl;
    if (bgRaw) {
      const bgUrl = bgRaw.startsWith("http") 
        ? bgRaw 
        : `${BASE_URL}/items/${bgRaw}`;
      pageContent.style.backgroundImage     = `url(${bgUrl})`;
      pageContent.style.backgroundSize      = 'cover';
      pageContent.style.backgroundPosition  = 'center top';
      pageContent.style.backgroundAttachment = 'fixed';
    } else {
      pageContent.style.backgroundImage = '';
    }
    return () => { pageContent.style.backgroundImage = ''; };
  }, [profileData?.user?.backgroundUrl]);
  if (loading)            return <div className="profile-layout main-container"><h2 className="profile-system-msg loading">Завантаження...</h2></div>;
  if (!profileData?.user) return <div className="profile-layout main-container"><h2 className="profile-system-msg error">Профіль не знайдено</h2></div>;

  const { user: pUser, library = [] } = profileData;

  const avatarSrc = (() => {
      const photo = pUser.photo;
      if (!photo || photo === "User.png") return "/no-image.png";
      if (photo.startsWith("http"))       return photo;
      if (photo.startsWith("items/"))     return `${BASE_URL}/${photo}`;
      if (photo.startsWith("avatar_"))    return `${BASE_URL}/avatars/${photo}`;
      return `${BASE_URL}/avatars/${photo}`;
  })();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.token) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${BASE_URL}/api/profile/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(prev => ({ ...prev, user: { ...prev.user, photo: data.fileName } }));
        if (setUser) setUser(prev => ({ ...prev, photo: data.fileName }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSaved = (updatedUser) => {
    setProfileData(prev => ({ ...prev, user: { ...prev.user, ...updatedUser } }));
    if (setUser) setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <div className="profile-layout main-container">

      <ProfileHeader
        pUser={pUser}
        avatarSrc={avatarSrc}
        bannerUrl={pUser.bannerUrl?.startsWith("http") 
          ? pUser.bannerUrl 
          : pUser.bannerUrl ? `${BASE_URL}/items/${pUser.bannerUrl}` : null}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditing(true)}
        onAvatarUpload={handleAvatarUpload}
      />

      <div className="profile-body-grid">
        <div className="profile-main-col">
          {activePage === "main" && (
            <>
              {!pUser.hideBadges      && <BadgesCard />}
              {!pUser.hideGames       && <GamesCard library={library} />}
              {!pUser.hideDiscussions && <DiscussionsCard />}
              <CommentsCard pUser={pUser} avatarSrc={avatarSrc} />
            </>
          )}
          {activePage === "badges"      && <BadgesCard />}
          {activePage === "games"       && <GamesCard library={library} />}
          {activePage === "discussions" && <DiscussionsCard />}
        </div>

        <ProfileSidebar
          friends={friends}
          activePage={activePage}
          onPageChange={setActivePage}
          hideFriends={pUser.hideFriends}
        />
      </div>

      {isEditing && (
        <EditProfileModal
          user={user}
          profileData={profileData}
          onClose={() => setIsEditing(false)}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  );
}
