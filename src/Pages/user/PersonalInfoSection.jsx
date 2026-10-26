import React from "react";
import ProfileImageSection from "./ProfileImageSection";

export default function PersonalInfoSection({
  user,
  bannerPreview,
  profilePreview,
  uploadingBanner,
  uploadingProfile,
  bannerInputRef,
  profileInputRef,
  handleBannerSelect,
  handleProfileSelect,
}) {
  return (
    <div className="border-b border-stone-200 pb-6">
      <h2 className="text-xl font-serif font-medium text-stone-800 mb-4">
        Personal Information
      </h2>
      <ProfileImageSection
        bannerPreview={bannerPreview}
        profilePreview={profilePreview}
        uploadingBanner={uploadingBanner}
        uploadingProfile={uploadingProfile}
        bannerInputRef={bannerInputRef}
        profileInputRef={profileInputRef}
        handleBannerSelect={handleBannerSelect}
        handleProfileSelect={handleProfileSelect}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Username
          </label>
          <p className="mt-1 text-sm text-stone-800 bg-stone-50 px-3 py-2 rounded-md border border-stone-200">
            {user?.username}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Mobile Number
          </label>
          <p className="mt-1 text-sm text-stone-800 bg-stone-50 px-3 py-2 rounded-md border border-stone-200">
            {user?.mobileNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
