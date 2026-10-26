const FRIENDLY_MESSAGE_MAP = {
  "Team must have at least 5 active members":
    "Your team needs at least 5 active members before registering.",
  "No approved team found":
    "Only approved teams can register for events.",
  "Team already registered for this event":
    "Your team has already registered for this event.",
  "Registration closed for this event":
    "Registration is closed for this event.",
  "At least 5 team members are required":
    "Please select at least 5 team members.",
  "At least one entry is required": "Please add at least one bull entry.",
  "At least one bull must be selected": "Please select at least one bull.",
  "One or more borrowed bulls are already used in this event":
    "This borrowed bull is already used by another team in this event. Please choose a different bull.",
  "Duplicate bull usage across entries is not allowed":
    "The same bull cannot be used in multiple entries.",
};

export const getUserFriendlyErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const backendMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  if (!backendMessage) return fallback;
  if (FRIENDLY_MESSAGE_MAP[backendMessage]) {
    return FRIENDLY_MESSAGE_MAP[backendMessage];
  }

  if (
    backendMessage === "Network Error" ||
    backendMessage.toLowerCase().includes("failed to fetch")
  ) {
    return "Unable to reach server. Please check your internet connection and try again.";
  }

  return backendMessage;
};
