const fs = require("fs");
const { execSync } = require("child_process");

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

try {
  const { version, buildNumber } = getVersionAndBuildNumberFromGradle();

  const tagName = `v${version}`; // _b${buildNumber}`;

  execSync(`git tag ${tagName}`);
  execSync(`git push origin ${tagName}`);

  console.log(`Successfully created and pushed tag: ${tagName}`);
} catch (error) {
  console.error("Error creating and pushing git tag:", error);
}
