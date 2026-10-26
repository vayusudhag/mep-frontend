import React from "react";

export default function ProfileImageSection({
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
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden mb-4">
      <div className="relative group w-full h-56 bg-stone-100">
        {bannerPreview ? (
          <img
            src={bannerPreview}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-stone-500 text-sm">
            No Banner Image
          </div>
        )}

        <button
          type="button"
          onClick={() => bannerInputRef.current?.click()}
          className="absolute inset-0 bg-black/40 text-white text-sm font-medium opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
        >
          {uploadingBanner ? "Uploading..." : "Edit Banner"}
        </button>

        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleBannerSelect}
        />
      </div>

      <div className="relative px-8 pb-8">
        <div className="absolute -top-16 left-8 group">
          <div className="relative w-32 h-32 rounded-full border-4 border-white bg-stone-100 overflow-hidden shadow-md">
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-stone-500 text-sm">
                No Image
              </div>
            )}

            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white text-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              {uploadingProfile ? "Uploading..." : "Edit"}
            </button>
          </div>

          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleProfileSelect}
          />
        </div>

        <div className="h-20" />
      </div>
    </div>
  );
}
