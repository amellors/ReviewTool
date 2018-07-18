#!/usr/bin/env node
var exec = require('child_process').exec;
var P4 = require("p4-oo");
var prompt = require('prompt');
var colors = require('colors')

var p4 = new P4();

var branch = "content-ux";

p4.runCommand("changes -c " + process.env.P4CLIENT + " -u " + process.env.P4USER + " -s pending", function(err, res) {
  issues = res.split('\n');
  issues.pop();

  issues = issues.map(parseIssue);
  issues = issues.filter(t => t.index != -1);
  selectIssue(issues);
})

function selectIssue(issues) {
  strs = issues.map(issueToString);
  console.log(colors.magenta("List of open issues:"));
  console.log(colors.blue(strs.reduce((a, c, i) => a + "[" + i + "]\t" + c + '\n', "")));

  prompt.message = "";
  prompt.start();
  if (issues.length == 0) {
    return;
  } else if (issues.length == 1) {
    describeIssue(issues[0]);
  } else {
      prompt.get(['issue'], function(err, result) {
        if (err) {
          console.log(colors.red("Not reviewing anything? Fine :("))
          process.exit(1)
        }
        if (!result.issue) result.issue = 0;
        if (result.issue > issues.length - 1) return;
        describeIssue(issues[result.issue]);
      })
  }
}

function describeIssue(issue) {
  p4.runCommand("describe " + issue.cl, function (err, res) {
    console.log(colors.grey(res));
    console.log(colors.blue('Submit for review?'));
    var txt = res.match(/\/depot\/branches\/[a-z]+/);
    var branch;
    try {
    	branch = txt[0].split('/');
    	branch = branch[branch.length - 1];
    } catch (e) {
    	branch = "content-ux"
    }
    if(branch == "musx") branch = "content-ux";
    reviewIssue(issue);
  })
}

function reviewIssue(issue) {
  prompt.message = "";
  prompt.start();
  prompt.get(['y/n'], function(err, result) {
    if (result['y/n'] == 'y') {
      execStr = "rbt post -s -o --branch " + branch + " --target-groups ControllerDevs,PINT-Content --bugs-closed " + issue.story + " " + issue.cl;
      exec(execStr);
    }
  });
}

function issueToString(issue) {
    str = issue.story + '\t';
    str += "CL-" + issue.cl + '\t';
    str += issue.date + '\t';
    str += issue.desc + '\t';
    return str;
}

function parseIssue(issue) {
  const issueSplit = issue.split(" ");
  const i = issueSplit.findIndex(a=>a.startsWith("\'SWPBL"));
  let story = "";

  return {
    priority: 0,
    cl: issueSplit[1],
    story: i===-1 ? "" : issueSplit[i].substr(1,issueSplit[i].length-1),
    date: issue.split(' ')[3],
    desc: issue.split('\'')[1],
    numFiles: 0,
    index: i
  }
}