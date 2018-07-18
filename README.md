# Review Tool

## Summary

This is a tool I wrote a while ago to make the process of posting p4 changelists to rbt easier. It will...
* Find all SWPBL changelists
* List them out
* Allow you to pick one
* Post to reviewboard, filling out the reviewboard fields as best as it can
* Add the reviewboard link to the p4 changelist description

## Installation

```bash
npm install
npm install -g
npm link
review
```

## FAQ

Q: Why aren't my changelists showing up?
A: Make sure that you have the SWPBL at the beginning of the description in the form of SWPBL-XXXXX

Q: I keep saying "yes", but nothing happens!
A: Make sure you are in a p4 workspace directory!