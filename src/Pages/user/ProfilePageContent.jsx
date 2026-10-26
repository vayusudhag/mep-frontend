import React from "react";
import PersonalInfoSection from "./PersonalInfoSection";
import SecuritySection from "./SecuritySection";
import TeamSection from "./TeamSection";

export default function ProfilePageContent(props) {
  const {
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
  } = props;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf6ee] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6ee] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 bg-stone-50">
            <h1 className="text-2xl font-serif font-medium text-stone-800">
              My Profile
            </h1>
          </div>

          <div className="p-6 space-y-8">
            <PersonalInfoSection
              user={user}
              bannerPreview={bannerPreview}
              profilePreview={profilePreview}
              uploadingBanner={uploadingBanner}
              uploadingProfile={uploadingProfile}
              bannerInputRef={bannerInputRef}
              profileInputRef={profileInputRef}
              handleBannerSelect={handleBannerSelect}
              handleProfileSelect={handleProfileSelect}
            />

            <SecuritySection
              showChangePassword={showChangePassword}
              setShowChangePassword={setShowChangePassword}
              handleChangePassword={handleChangePassword}
              changePasswordData={changePasswordData}
              setChangePasswordData={setChangePasswordData}
              changingPassword={changingPassword}
            />

            <TeamSection
              team={team}
              navigate={navigate}
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.includes("success")
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-red-50 text-red-800 border border-red-100"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
