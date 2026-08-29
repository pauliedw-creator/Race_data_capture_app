# Lap Log — deploy notes

Five files, all relative paths. Drop them in the repo root (or any subfolder — scope is `./`, so it works either way).

```
index.html
sw.js
manifest.webmanifest
icon-192.png
icon-512.png
```

Settings → Pages → deploy from branch → root. HTTPS is required for the service worker; GitHub Pages gives you that.

## Install on the phone

1. Open the Pages URL in **Chrome on Android**.
2. Menu → **Install app** (or "Add to Home screen"). Take the install option, not the shortcut.
3. Open it once from the home-screen icon while online. The service worker caches everything on first load.
4. Turn on airplane mode and open it again. If it loads, offline is working.

Chrome on Android shares storage between the installed app and the browser tab on the same origin, so it doesn't matter which you launch — but use the icon, it's faster and hides the address bar.

## The four copies of the data

| Copy | Where | Survives |
|---|---|---|
| localStorage | browser store | app close, reboot |
| IndexedDB mirror | browser store | same, different failure modes |
| OPFS `lap-log.csv` | private file store | storage pressure better than the above |
| CSV in `/Download` | real file on the phone | the app being wiped or reinstalled |
| Google Sheet | remote | the phone being lost |

A CSV is written automatically on every lap save. **Android will ask once to allow multiple downloads — say yes.** If the notifications get annoying, Setup → auto-backup every 5 or 10 laps.

## Setting up a second phone

Nothing sensitive lives in the repo. Instead, on the configured phone:

Setup → Sheet sync → **Copy setup link for another phone**.

That produces a link like `…/index.html?u=<script url>&s=<secret>&p=<plan>`. Open it on the other device and it saves the sync settings and the lap plan, then wipes the parameters from the address bar and from history.

**The link contains the secret.** Keep it in a password manager or send it to yourself privately — never commit it, never put it in an issue, never screenshot it into a shared album.

If the secret ever leaks, change `SECRET` in the Apps Script, redeploy, and generate a fresh link.

## Recovery

Export tab → Recover:
- **From device store** — reads the OPFS copy.
- **From a CSV file** — pick any `lap-log-NN.csv` from Downloads, or one emailed to a spare phone.

Either one rebuilds the whole race: laps, times, fuel, symptoms, onsets. Recovered rows are marked unsynced so they'll re-push to the sheet, overwriting rather than duplicating.

## Updates

The service worker is **cache-first and pinned**. Pushing to the repo does nothing until someone taps Setup → Check for update and reloads. That's deliberate — a deploy must never swap the code mid-race.

To ship a new version: bump `CACHE` in `sw.js` and `APP_VERSION` in `index.html` (currently v1.1.0), push, then check for update.

## Before race day

- [ ] Install, load offline, confirm it opens in airplane mode
- [ ] Paste the lap plan (Setup)
- [ ] Set BareFuel's real values, or accept the `UNSET_PRODUCT` flag
- [ ] Sheet sync: Test connection, then push a real lap
- [ ] Record 10 fake laps, force-stop Chrome, reopen — log intact?
- [ ] Check `/Download` has the CSVs
- [ ] Wipe, then recover from a CSV — prove the recovery path works
- [ ] Lock the screen mid-lap and see what the clock does on unlock
- [ ] Printed Plan sheet in the crew box regardless
