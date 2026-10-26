const normalizeMobileInput = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export function validateRegister({ username, mobileNumber, password }) {
  const normalizedMobile = normalizeMobileInput(mobileNumber);
  const errors = {
    username: "",
    mobileNumber: "",
    password: "",
  };

  let isValid = true;

  // Name validation
  if (!username || !username.trim()) {
    errors.username = "Name cannot be empty.";
    isValid = false;
  } else if (username.trim().length < 3) {
    errors.username = "Name must be at least 3 characters.";
    isValid = false;
  }

  // Mobile validation
  if (!mobileNumber || !String(mobileNumber).trim()) {
    errors.mobileNumber = "Mobile number is required.";
    isValid = false;
  } else if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
    errors.mobileNumber = "Enter a valid 10-digit number.";
    isValid = false;
  }

  // Password validation
  if (!password) {
    errors.password = "Password is required.";
    isValid = false;
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
    isValid = false;
  }

  return { isValid, errors };
}

export function validateLogin({ mobileNumber, password }) {
  const normalizedMobile = normalizeMobileInput(mobileNumber);
  const errors = {
    mobileNumber: "",
    password: "",
  };

  let isValid = true;

  if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
    errors.mobileNumber = "Enter a valid 10-digit mobile number";
    isValid = false;
  }

  if (!password) {
    errors.password = "Password is required";
    isValid = false;
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
    isValid = false;
  }

  return { isValid, errors };
}
