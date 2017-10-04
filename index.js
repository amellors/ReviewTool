#!/usr/bin/env node

var exec = require('child_process').exec;
var P4 = require("p4-oo");
var prompt = require('prompt');
var colors = require('colors')

var p4 = new P4();

var command = "changes";
command += " -c " + process.env.P4CLIENT;
command += " -u " + process.env.P4USER;
command += " -s " + "pending"

p4.runCommand("changes -c " + process.env.P4CLIENT + " -u " + process.env.P4USER + " -s pending", function(err, res) {
  issues = res.split('\n');
  issues.pop();
  issues = issues.map(parseIssue).filter(t => t.story.length > 10);
  selectIssue(issues);
})


function selectIssue(issues) {
  strs = issues.map(issueToString);
  console.log(colors.magenta("List of open issues:"));
  console.log(colors.blue(strs.reduce((a, c, i) => a + "[" + i + "]\t" + c + '\n', "")));

  prompt.message = "";
  prompt.start();
  prompt.get(['issue'], function(err, result) {
    if (!result.issue) result.issue = 0;
    if (result.issue > issues.length - 1) return;

    describeIssue(issues[result.issue]);
  })
}

function describeIssue(issue) {
  p4.runCommand("describe " + issue.cl, function (err, res) {
    console.log(colors.grey(res));
    console.log(colors.blue('Submit for review?'));
    reviewIssue(issue);
  })
}

function reviewIssue(issue) {
  prompt.message = "";
  prompt.start();
  prompt.get(['y/n'], function(err, result) {
    if (result['y/n'] == 'y') {
      execStr = "rbt post -o --branch trunk --target-groups ControllerDevs --bugs-closed " + issue.story + " " + issue.cl;
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
  return {
    priority: 0,
    cl: issue.match(/\b\d{6}\b/g),
    story: "SWPBL-" + issue.match(/\b\d{5}\b/g),
    date: issue.split(' ')[3],
    desc: issue.split('\'')[1],
    numFiles: 0
  }
}