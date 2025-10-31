const axios = require("axios");
const crypto = require("crypto");

async function isPasswordPwned(password) {
  const sha1 = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const url = `https://api.pwnedpasswords.com/range/${prefix}`;
  const response = await axios.get(url);
  const lines = response.data.split("\n");

  for (const line of lines) {
    const [hashSuffix, count] = line.split(":");
    if (hashSuffix === suffix) {
      return true; 
    }
  }

  return false; 
}

module.exports = { isPasswordPwned };
