import json
import subprocess

package_json = json.load(open("package.json"))

new_version = package_json["buildVersion"] + 1
version = package_json["version"]
version = ".".join(version.split(".")[:-1] + [str(new_version)])

package_json["buildVersion"] = new_version
package_json["version"] = version

with open("package.json", "w") as package_file:
    json.dump(package_json, package_file, indent=2)
    package_file.write("\n")

subprocess.run(["bash", "sync_version_ios.sh"], check=True)
