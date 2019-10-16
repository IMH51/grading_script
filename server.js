const express = require("express");
const { execSync } = require("child_process");
const app = express();
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

app.post("/", (req, res) => {
  // console.log(req.body);
  console.log("creating the repos folder");
  execSync(`rm -rf repos`);
  execSync(`mkdir repos`);
  req.body.forEach((url, index) => {
    let gitRepo = "";
    if (url.includes(".git")) {
      userName = url.split("/")[1];
      repoName = url.split("/")[2];
      gitRepo = `git@github.com:${userName}/${repoName}`;
    } else {
      userName = url.split("/")[3];
      repoName = url.split("/")[4];
      gitRepo = `git@github.com:${userName}/${repoName}.git`;
    }
    // attempt to clone repos?
    try {
      execSync(
        `git clone ${gitRepo} repos/${userName}`,
        (error, stderr, stdout) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`cloning ${gitRepo} into repos/${userName}`);
          console.error(`stderr: ${stderr}`);
        }
      );
    } catch (error) {
      console.error(`${userName} repo clone failed`);
    }
    // DELETE THEIR .git FILES

    try {
      console.log(`deleting the .git folder of ${userName}`);
      execSync(`rm -rf repos/${userName}/.git`);
      
      console.log(`opening folder for ${userName}`)
      execSync(`cd repos/${userName}/`)

      let userPort = port + index

      if (repoName.includes("module-1")) {

        console.log(`opening new terminal tab for ${userName}...`)
        execSync(`osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down'`)
        console.log(`setting up activerecord database...`)
        execSync('rake db:create && rake db:migrate && rake db:seed')
        console.log(`opening submission for ${userName}...`)
        execSync("code .")
        execSync(`ruby tools/console.rb`)

      } else if (repoName.includes("module-2")) {

        console.log(`setting up rails database...`)
        execSync('rails db:create && rails db:migrate && rails db:seed')
        console.log(`starting rails server on port ${userPort}...`)
        execSync(`rails s -p ${userPort}`)
        console.log(`opening submission for ${userName} on port ${userPort}...`)
        execSync(`open http://localhost:${userPort}`)

      } else if (repoName.includes("module-3")) {

        console.log(`opening the submission for ${userName}...`);
        execSync(`open index.html`);

      } else if (repoName.includes("module-4")) {

        console.log(`installing node packages...`)
        execSync('npm i')
        console.log(`opening the submission for ${userName} on port ${userPort}...`)
        execSync(`PORT=${userPort} react-scripts start`)

      } else {

        throw Error()

      }

      
    } catch (error) {
      console.error(`deleting or opening of files for ${userName} has failed`);
    }
    execSync("cd ../..")
  });

  console.log("ending process");
  res.json({ message: "k fanx bye" });
  process.exit();
});

app.listen(port, () => console.log(`listening on port ${port}!`));
