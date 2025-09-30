// run this script to create valid bcrypt hash for an admin password (avoid brypt compare issues)
// for admin creation purpose only
const bcrypt = require("bcrypt");

(async () => {
  // put the password u want to hash
  const password = "password";
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:", hash);
})();
