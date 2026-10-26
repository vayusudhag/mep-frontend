import React from "react";
import useProfilePageLogic from "./user/useProfilePageLogic";
import ProfilePageContent from "./user/ProfilePageContent";

const ProfilePage = () => {
  const profileProps = useProfilePageLogic();
  return <ProfilePageContent {...profileProps} />;
};

export default ProfilePage;
