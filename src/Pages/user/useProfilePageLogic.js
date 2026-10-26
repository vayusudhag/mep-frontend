import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyTeam } from "../../services/teams";
import api, { changePasswordAPI } from "../../services/auth/index";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default function useProfilePageLogic() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const bannerObjectUrlRef = useRef(null);
  const profileObjectUrlRef = useRef(null);
  const [bannerPreview, setBannerPreview] = useState(user?.bannerUrl || null);
  const [profilePreview, setProfilePreview] = useState(user?.profileUrl || null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  useEffect(() => {
    setBannerPreview(user?.bannerUrl || null);
    setProfilePreview(user?.profileUrl || null);
  }, [user?.bannerUrl, user?.profileUrl]);

  useEffect(() => {
    return () => {
      if (bannerObjectUrlRef.current) {
        URL.revokeObjectURL(bannerObjectUrlRef.current);
      }
      if (profileObjectUrlRef.current) {
        URL.revokeObjectURL(profileObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamResponse = await getMyTeam();
        if (teamResponse) {
          setTeam(teamResponse);
        } else {
          setTeam(null);
        }
      } catch (err) {
        console.error("Failed to fetch team", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setMessage("New passwords don't match");
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters long");
      return;
    }

    setChangingPassword(true);
    setMessage("");

    try {
      await changePasswordAPI({
        currentPassword: changePasswordData.currentPassword,
        newPassword: changePasswordData.newPassword,
      });

      setMessage("Password changed successfully!");
      setChangePasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
    } catch (err) {
      console.error("Failed to change password", err);
      setMessage(err.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login");
    }
  };

  const validateImage = (file) => {
    if (!file) return "No image selected";
    if (!file.type?.startsWith("image/")) return "Only image files are allowed";
    if (file.size > MAX_IMAGE_SIZE) return "Image size must be less than 2MB";
    return null;
  };

  const handleBannerSelect = async (event) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const imageError = validateImage(file);
    if (imageError) {
      setMessage(imageError);
      return;
    }

    if (bannerObjectUrlRef.current) {
      URL.revokeObjectURL(bannerObjectUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    bannerObjectUrlRef.current = previewUrl;
    setBannerPreview(previewUrl);

    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.patch("/api/auth/banner-image", formData);
      setBannerPreview(res.data?.bannerUrl || previewUrl);
      if (res.data?.bannerUrl && bannerObjectUrlRef.current) {
        URL.revokeObjectURL(bannerObjectUrlRef.current);
        bannerObjectUrlRef.current = null;
      }
      setMessage("Banner image updated successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update banner image");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleProfileSelect = async (event) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const imageError = validateImage(file);
    if (imageError) {
      setMessage(imageError);
      return;
    }

    if (profileObjectUrlRef.current) {
      URL.revokeObjectURL(profileObjectUrlRef.current);
    }
    const previewUrl = URL.createObjectURL(file);
    profileObjectUrlRef.current = previewUrl;
    setProfilePreview(previewUrl);

    try {
      setUploadingProfile(true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.patch("/api/auth/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfilePreview(res.data?.profileUrl || res.data?.profileImage || previewUrl);
      if ((res.data?.profileUrl || res.data?.profileImage) && profileObjectUrlRef.current) {
        URL.revokeObjectURL(profileObjectUrlRef.current);
        profileObjectUrlRef.current = null;
      }
      setMessage("Profile image updated successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile image");
    } finally {
      setUploadingProfile(false);
    }
  };

  return {
    user,
    navigate,
    team,
    loading,
    changePasswordData,
    setChangePasswordData,
    changingPassword,
    message,
    showChangePassword,
    setShowChangePassword,
    handleChangePassword,
    handleLogout,
    profileInputRef,
    bannerInputRef,
    bannerPreview,
    profilePreview,
    uploadingBanner,
    uploadingProfile,
    handleBannerSelect,
    handleProfileSelect,
  };
}
