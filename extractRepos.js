// https://learn.co/admin/assignments/2496

try {
  submissionLinks.length === 0;
} catch {
  submissionLinks = [];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const thingsToClick = document.querySelector(
  "#js--gradingContainer > li:nth-child(5) > div > div.module__body > div > div.flex-grid__item.flex-grid__item--grow-1 > div > ul"
);

const config = {
  numStudents: thingsToClick.querySelectorAll(
    ".module.module--flush.module--buffer-large"
  ).length
};

console.log(`there are ${config.numStudents} students to grade`);

const clickAble = Array.from(thingsToClick.children);

function grabLink() {
  const studentSubLink = document.querySelector("#js--urlSubmission");
  submissionLinks.push(studentSubLink.innerText);
  console.log("studentSubLink added, caputured links:", submissionLinks.length);
}

async function main() {
  for (let i = 0; i < config.numStudents; i++) {
    // await sleep(2000);
    clickAble[i].click();
    await sleep(2000);
    grabLink();
  }

  if (submissionLinks.length < config.numStudents) {
    console.error("something went bad - we do not have all the links");
  } else {
    console.log("posting", submissionLinks.length, "links to server...");
    fetch("http://localhost:3000", {
      method: "POST",
      body: JSON.stringify(submissionLinks),
      headers: { "Content-Type": "application/json" }
    }).then(data =>
      data
        .json()
        .then(json =>
          console.log("posted. here's what the server has parsed: ", json)
        )
    );
  }
}

// send to a simple nodejs server on localhost
// node server opens all in browser
// manually clone repos to computer with studebt names
// run grading script on each of them

main();
