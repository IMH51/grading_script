const express = require('express')
const { exec, execSync, spawn } = require('child_process')
const app = express()
const port = 3000
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())

const createReposDir = () => {
  console.log('creating the repos folder')
  execSync(`rm -rf repos`)
  execSync(`mkdir repos`)
}

const cloneRepo = url => {
  return new Promise(resolve => {
    let gitRepo = ''
    let userName = ''
    let repoName = ''
    if (url.includes('.git')) {
      userName = url.split('/')[1]
      repoName = url.split('/')[2]
      gitRepo = `git@github.com:${userName}/${repoName}`
    } else {
      userName = url.split('/')[3]
      repoName = url.split('/')[4]
      gitRepo = `git@github.com:${userName}/${repoName}.git`
    }
    console.log(`git clone ${gitRepo} repos/${userName}`)
    try {
      exec(
        `git clone ${gitRepo} repos/${userName}`,
        (error, stderr, stdout) => {
          if (error) {
            console.error(`exec error: ${error}`)
            resolve({ error })
            return
          }
          console.log(`cloning ${gitRepo} into repos/${userName}`)
          resolve({ userName, repoName })
        }
      )
    } catch (error) {
      console.error(`${userName} repo clone failed`, error)
      resolve({ error })
    }
  })
}

const moduleHandlers = {
  'module-1': ({ cwd, userName }) => {
    console.log(`opening new terminal tab for ${userName}...`)
    execSync(
      `osascript -e 'tell application "Terminal" to activate' -e 'tell application "System Events" to tell process "Terminal" to keystroke "t" using command down'`
    )
    console.log(`setting up activerecord database...`)
    execSync('bundle && rake db:create && rake db:migrate && rake db:seed', {
      cwd
    })
    console.log(`opening submission for ${userName}...`)
    execSync('code .', { cwd })
    execSync(`ruby tools/console.rb`, { cwd })
  },
  'module-2': ({ cwd, userName, userPort }) => {
    console.log(`setting up rails database...`)
    execSync('bundle && rails db:create && rails db:migrate && rails db:seed', {
      cwd
    })
    console.log(`starting rails server on port ${userPort}...`)
    spawn(`rails s -p ${userPort}`, { cwd })
    console.log(`opening submission for ${userName} on port ${userPort}...`)
    execSync(`open http://localhost:${userPort}`, { cwd })
  },
  'module-3': ({ cwd, userName }) => {
    console.log(`opening the submission for ${userName}...`)
    execSync(`open index.html`, { cwd })
  },
  'module-4': ({ cwd, userName, userPort }) => {
    console.log(`installing node packages...`)
    execSync('npm i', { cwd })
    console.log(`opening the submission for ${userName} on port ${userPort}...`)
    spawn(`PORT=${userPort} react-scripts start`, { cwd })
  }
}

const openSubmission = ({ userName, repoName }, index) => {
  try {
    const cwd = `repos/${userName}/`
    console.log(`opening folder for ${userName} at cwd: ${cwd}`)

    let userPort = port + index + 1

    Object.keys(moduleHandlers).forEach(modName => {
      if (repoName.includes(modName)) {
        moduleHandlers[modName]({ cwd, userName, userPort })
      }
    })
  } catch (error) {
    console.error(`opening submission for ${userName} has failed`, error)
  }
}

app.post('/', (req, res) => {
  createReposDir()

  console.log(`cloning all ${req.body.length} repos`)
  Promise.all(req.body.map(cloneRepo)).then(repos => {
    repos
      .filter(repoObject => {
        if (repoObject.error) {
          console.error(repoObject.error)
          return false
        }
        return true
      })
      .forEach(openSubmission)
    res.json({ message: 'k fanx bye' })
  })
})

app.listen(port, () => console.log(`listening on port ${port}!`))
