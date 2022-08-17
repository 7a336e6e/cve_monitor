# PoC for CVE monitor
Quick and 'dirty' way to monitor new CVE PoCs found on Github.
No VPS needed. No Threat Intelligence subscription required. No API keys. Pretty much as free as it gets.

>_might not satisfy all needs but it's better than nothing_


## What it does
It looks for new repositories that contain a `CVE-{current_year}-\d{4,7}` (e.g. `CVE-2022-12345`) in their title or description created on the day the script is running and checks against NIST Database if this is a valid CVE. If everything goes well it gets the CVE description and sends a message to Discord/Slack (or both) that it found a PoC for that CVE.


## Setup
1. Create new project on [Google Apps Script](https://script.google.com/home)
2. Copy and paste entire code.gs there
3. Create a new Spreadsheet somewhere in your drive
4. Create slack webhook
5. Create discord webhook
6. Add needed values in script
7. Let it rip (_add a time based execution and forget about it_)


## Downsides
It's not perfect. It was made in about 2h so I expect it might encounter issues in the future... have fun with it.


## The End
<p>Feel free to update/optimise/tweak it as you need. If I make any changes to it i'll update the repo, but it will most likely remain as is. </p>

<p>Give credit where credit is due: I took inspiration in this <a href="https://github.com/Kira-Pgr/Github-CVE-Listener">repo</a> from <a href="https://github.com/Kira-Pgr">Kira-PGR</a></p>

<p>Feel free to dm me on <a href="https://twitter.com/_z3nn">twitter</a> if you have issues setting it up</p>

