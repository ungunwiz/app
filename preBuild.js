const { exec } = require("child_process");
const { platform } = require("os");

function setPermissions(path) {
  exec(`chmod -R 755 ${path}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error setting permissions: ${error}`);
      return;
    }
    if (stderr) console.error(`stderr: ${stderr}`);
    console.log(`Permissions set for ${path}`);
  });
}

if (platform() !== "win32") {
  const path = "src/assets/gameAssets";
  setPermissions(path);
} else {
  console.log("Skipping permission set on Windows");
}
