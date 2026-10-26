import React from "react";

export default function SecuritySection({
  showChangePassword,
  setShowChangePassword,
  handleChangePassword,
  changePasswordData,
  setChangePasswordData,
  changingPassword,
}) {
  return (
    <div className="border-b border-stone-200 pb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-medium text-stone-800">
          Security
        </h2>
        <button
          onClick={() => setShowChangePassword(!showChangePassword)}
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
        >
          {showChangePassword ? "Cancel" : "Change Password"}
        </button>
      </div>

      {showChangePassword && (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Current Password
            </label>
            <input
              type="password"
              required
              value={changePasswordData.currentPassword}
              onChange={(event) =>
                setChangePasswordData((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-stone-200 rounded-md shadow-sm focus:outline-none focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              New Password
            </label>
            <input
              type="password"
              required
              minLength="6"
              value={changePasswordData.newPassword}
              onChange={(event) =>
                setChangePasswordData((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-stone-200 rounded-md shadow-sm focus:outline-none focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={changePasswordData.confirmPassword}
              onChange={(event) =>
                setChangePasswordData((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              className="mt-1 block w-full px-3 py-2 border border-stone-200 rounded-md shadow-sm focus:outline-none focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {changingPassword ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
