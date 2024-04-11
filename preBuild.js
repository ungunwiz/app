const fs = require("fs");
const { exec } = require("child_process");
const { platform } = require("os");

function getVersionAndBuildNumberFromGradle() {
  const gradlePath = "./android/app/build.gradle";
  const gradleContent = fs.readFileSync(gradlePath, "utf8");
  const versionNameMatch = gradleContent.match(/versionName\s+"([^"]+)"/);
  const versionCodeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  return {
    version: versionNameMatch ? versionNameMatch[1] : "0.0.1",
    buildNumber: versionCodeMatch ? versionCodeMatch[1] : "0",
  };
}

function setVersionForWeb() {
  try {
    const { version, buildNumber } = getVersionAndBuildNumberFromGradle();
    const assetsPath = "./src/assets/version.json";
    const versionInfo = { version, buildNumber };

    fs.writeFileSync(assetsPath, JSON.stringify(versionInfo, null, 2));
    console.log(`Version info saved to ${assetsPath}`);
  } catch (error) {
    console.error("Error creating and pushing git tag:", error);
  }
}

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

setVersionForWeb();

if (platform() !== "win32") {
  const path = "src/assets/gameAssets";
  setPermissions(path);
} else {
  console.log("Skipping permission set on Windows");
}
