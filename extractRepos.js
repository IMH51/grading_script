const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const thingsToClick = document.querySelector(
  '#js--gradingContainer > li:nth-child(5) > div > div.module__body > div > div.flex-grid__item.flex-grid__item--grow-1 > div > ul'
)
const clickAble = [...thingsToClick.children]

console.log(`there are ${clickAble.length} students to grade`)

const grabLink = () => {
  const link = document.querySelector('#js--urlSubmission')
  return link ? link.innerText : undefined
}

const postLinks = links =>
  fetch('http://localhost:3000', {
    method: 'POST',
    body: JSON.stringify(links),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json())

const handleSubmissionLinks = links => {
  if (links.length < clickAble.length) {
    console.error(
      'something went bad - we do not have all the links, gonna try anyway'
    )
  }

  console.log(`posting ${links.length} links to server...`)
  postLinks(links).then(json =>
    console.log("posted. here's what the server has parsed:", json)
  )
}

async function main() {
  let submissionLinks = []
  clickAble
    .reduce((promise, studentClickable, i) => {
      return promise
        .then(() => studentClickable.click())
        .then(() => sleep(2000))
        .then(() => submissionLinks.push(grabLink()))
        .then(() => (submissionLinks = submissionLinks.filter(link => !!link)))
        .then(() =>
          console.log(
            `studentSubLink added, caputured links so far: ${submissionLinks.length}`
          )
        )
    }, Promise.resolve())
    .then(() => handleSubmissionLinks(submissionLinks))
}
main()
