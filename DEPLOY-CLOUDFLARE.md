# Deploying Subscribulator to Cloudflare (with subscribulator.eu from GoDaddy)

**Short answer: yes, Subscribulator is a perfect fit for Cloudflare.** `npm run build` produces a plain static site (HTML, CSS, JavaScript and images in `dist/`). There's no server, database or API: everything a visitor enters stays in their own browser. Cloudflare serves static sites like this from its global network for free, with HTTPS and DNS handled for you.

This guide uses **Cloudflare Workers with static assets**, which is what Cloudflare recommends for new sites, and walks through connecting **subscribulator.eu**, which is registered at GoDaddy.

> **The plan in one picture**
>
> ```text
> GoDaddy                       Cloudflare
> ───────                       ──────────
> keeps the registration   ──►  runs the DNS for subscribulator.eu
> (you renew it there)          and serves the site from its edge
> ```
>
> The domain stays registered (and renewed) at GoDaddy. You only point its nameservers at Cloudflare, then attach it to the site.

> **TL;DR**
>
> 1. GitHub: create an empty `subscribulator` repository, then drag in the contents of `~/subscribulator-github/1-upload-first` (with hidden files shown), then `2-upload-second`.
> 2. Cloudflare: **Workers & Pages > Create application > Import a repository** > `subscribulator` > build command `npm run build` > **Save and Deploy** (site goes live on a `workers.dev` address).
> 3. Cloudflare: **Domains > Onboard a domain** > `subscribulator.eu` > Free plan > delete GoDaddy's parking records.
> 4. GoDaddy: **Domain > DNS > Nameservers > I'll use my own nameservers** > paste Cloudflare's two nameservers.
> 5. Cloudflare: **Workers & Pages > subscribulator > Settings > Domains & Routes > Add > Custom Domain** > `subscribulator.eu`.
>
> Skipping GitHub? Replace steps 1 and 2 with `npx wrangler login`, then `npm run deploy`.

---

## Contents

1. [What's already set up](#whats-already-set-up)
2. [Before you start](#before-you-start)
3. [Step 1: Your Ko-fi link](#step-1-your-ko-fi-link-already-done)
4. [Step 2: Test the production build locally](#step-2-test-the-production-build-locally-optional)
5. [Step 3: Deploy](#step-3-deploy-pick-one)
   - [Option A: automatic deploys from GitHub](#option-a-automatic-deploys-from-github-recommended)
   - [Option B: one command from your Mac](#option-b-one-command-from-your-mac-no-github)
6. [Step 4: Move subscribulator.eu's DNS from GoDaddy to Cloudflare](#step-4-move-subscribulatoreus-dns-from-godaddy-to-cloudflare)
7. [Step 5: Attach subscribulator.eu to the site](#step-5-attach-subscribulatoreu-to-the-site)
8. [Step 6: Recommended settings](#step-6-recommended-settings)
9. [Updating and rolling back](#updating-and-rolling-back)
10. [What it costs](#what-it-costs)
11. [Troubleshooting](#troubleshooting)

---

## What's already set up

The project already contains everything Cloudflare needs:

| File | What it does |
| --- | --- |
| `wrangler.jsonc` | Tells Cloudflare to publish the `dist/` folder as a static site called `subscribulator`. |
| `public/_headers` | Adds security headers, caches the fingerprinted files in `/assets` for a year, and keeps the `*.workers.dev` copy out of search results. |
| `.node-version` | Pins Node 24. Cloudflare's build servers read this file too. |
| `package.json` | `npm run deploy` (build and publish) and `npm run preview:cloudflare` (test locally in Cloudflare's runtime). Wrangler, Cloudflare's CLI, is pinned as a dev dependency. `allowScripts` approves the install steps of `esbuild` and `workerd`, which npm 11 otherwise skips with a warning. |
| `src/config.ts` | Holds your Ko-fi link, `https://ko-fi.com/anpaorach`, used by the "Keep Subscribulator going" section. |
| `index.html`, `public/` | Page title and description, link previews (`og-image.jpg`, shown when someone shares subscribulator.eu), and home-screen icons with a web app manifest. |
| Git | The folder is a Git repository on the `main` branch with every file staged, in case you push from Terminal instead of uploading. `node_modules`, `dist` and `.wrangler` are ignored. |

---

## Before you start

- **A Cloudflare account** (free): [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up). Verify your email address.
- **Your GoDaddy login**, for the account that owns subscribulator.eu.
- **Node 24** on your Mac. fnm picks it up automatically from `.node-version` when you `cd` into the project. Check with `node -v`.
- **A GitHub account**, for automatic deploys (Option A).

---

## Step 1: Your Ko-fi link (already done)

`src/config.ts` already points the support section at your page:

```ts
const kofi = (import.meta.env.VITE_KOFI_URL ?? 'https://ko-fi.com/anpaorach').trim()
```

It shows up as the "Keep Subscribulator going" card above the footer, and as a link in the footer itself. To change it, edit the link in that line and deploy again: it's baked in when the site is built. You can also override it without touching code by adding a `VITE_KOFI_URL` build variable in Cloudflare (**Settings > Build > Build variables and secrets**). The link must start with `https://ko-fi.com/`; an empty value hides the section.

---

## Step 2: Test the production build locally (optional)

```bash
npm run preview:cloudflare
```

This builds the site and serves `dist/` with Wrangler at [http://localhost:8787](http://localhost:8787), using the same routing and headers as production. Press `Ctrl+C` to stop it.

---

## Step 3: Deploy (pick one)

Deploy first and check the site on its free `workers.dev` address. You can do the domain steps while it's live, or in the same sitting.

### Option A: Automatic deploys from GitHub (recommended)

Every change to `main` on GitHub goes live automatically, and other branches get their own preview links.

1. **Create an empty repository.** Go to [github.com/new](https://github.com/new), name it `subscribulator`, and choose **Private** (or **Public** to share the code). Leave the README, `.gitignore` and licence options off, because the project has its own. Select **Create repository**.

2. **Drag the code in.** GitHub's uploader takes at most 100 files at a time and the project has 129, so it goes up in two batches. `~/subscribulator-github` has them ready: a copy of the project without `node_modules`, `dist` and the other local-only folders, split into `1-upload-first` (85 files) and `2-upload-second` (the 44 logos).

   1. On the new repository's page, select **uploading an existing file**.
   2. In Finder, open `~/subscribulator-github/1-upload-first` and press **⌘⇧.** (Command-Shift-full stop) to show hidden files. `.gitignore`, `.node-version` and `.oxlintrc.json` appear greyed out; they belong in the upload.
   3. Press **⌘A** to select everything, drag it onto the GitHub page, wait for the file list to finish loading, then select **Commit changes**.
   4. On the repository's main page, select **Add file > Upload files**.
   5. Open `~/subscribulator-github/2-upload-second`, drag the `src` folder inside it onto the page, and select **Commit changes**. GitHub adds the logos to the existing `src/assets/logos`.

   Drag what's *inside* each folder, not the folder itself; otherwise everything lands one level down, in a folder called `1-upload-first` on GitHub. Upload both batches before connecting Cloudflare, because the build needs the logos. If a `.DS_Store` file shows up in the selection, it's Finder's view settings and harmless; ⌘-click it to leave it out.

   Commits made on github.com are credited to your GitHub account, so there's no Git name or email to set up.

   <details>
   <summary>Prefer Terminal or GitHub Desktop?</summary>

   `~/subscribulator` is already a Git repository on `main` with every file staged. Your Mac's global Git identity is your work address, so set a name and email for this repository only (no `--global`), commit, and push with the GitHub CLI:

   ```bash
   cd ~/subscribulator
   git config user.name "Your Name"
   git config user.email "you@example.com"
   git commit -m "Subscribulator 1.0"
   gh auth login
   gh repo create subscribulator --private --source=. --remote=origin --push
   ```

   For `gh auth login`, choose **GitHub.com**, **HTTPS**, **Yes** to authenticating Git with your GitHub credentials, then **Login with a web browser**. To keep your personal email private, use the no-reply address from [github.com/settings/emails](https://github.com/settings/emails). With [GitHub Desktop](https://desktop.github.com): **File > Add Local Repository** > `~/subscribulator`, commit, then **Publish repository**.

   </details>

3. **Create the Worker from the repository.** In the [Cloudflare dashboard](https://dash.cloudflare.com):
   1. Go to **Workers & Pages** and select **Create application**.
   2. Next to **Import a repository**, select **Get started**.
   3. Connect your GitHub account. This installs Cloudflare's GitHub app; you can limit it to just the `subscribulator` repository.
   4. Select the `subscribulator` repository.
   5. Fill in the settings:

      | Setting | Value |
      | --- | --- |
      | Project name | `subscribulator` (must match `name` in `wrangler.jsonc`) |
      | Build command | `npm run build` |
      | Deploy command | `npx wrangler deploy` (the default) |
      | Root directory | `/` (the default) |

   6. Select **Save and Deploy**.

4. **Watch the first build.** Open the Worker, go to **Deployments**, then **View build history**. After about a minute the site is live at `https://subscribulator.<your-subdomain>.workers.dev`. If your account doesn't have a `workers.dev` subdomain yet, Cloudflare asks you to pick one (for example `david`). It's account-wide and you only choose it once.

From now on:

- Every commit to `main` deploys to production, whether it's an upload or edit on github.com or a `git push`.
- Commits to other branches create a **Preview** with its own URL, posted as a comment on the pull request.
- Cloudflare installs dependencies itself, uses Node 24 (from `.node-version`) and the Wrangler version pinned in `package.json`.

### Option B: One command from your Mac (no GitHub)

1. **Log in to Cloudflare** (one-time):

   ```bash
   cd ~/subscribulator
   npx wrangler login
   ```

   Your browser opens; select **Allow**. Check it worked with `npx wrangler whoami`.

2. **Deploy:**

   ```bash
   npm run deploy
   ```

   This runs the typecheck and production build, then uploads `dist/`. If your account doesn't have a `workers.dev` subdomain yet, Wrangler asks you to pick one.

3. **Open the URL** printed at the end, for example:

   ```text
   https://subscribulator.<your-subdomain>.workers.dev
   ```

To publish changes later, run `npm run deploy` again. You can still connect GitHub later: open the Worker, go to **Settings > Builds**, and select **Connect**.

---

## Step 4: Move subscribulator.eu's DNS from GoDaddy to Cloudflare

To attach a domain to a Cloudflare site, Cloudflare has to run the domain's DNS. For a domain registered at GoDaddy, that means swapping GoDaddy's nameservers for Cloudflare's. The registration itself stays at GoDaddy: Cloudflare Registrar doesn't currently handle `.eu` domains, so you keep renewing it at GoDaddy.

**Where things stand today** (checked on 27 September 2026):

- subscribulator.eu uses GoDaddy's nameservers, `ns37.domaincontrol.com` and `ns38.domaincontrol.com`.
- It points at GoDaddy's parking addresses, with no email set up.
- **DNSSEC is off** (there's no DS record at the .eu registry), so you can skip the "turn off DNSSEC" step Cloudflare warns about.

> **Ignore GoDaddy's "Connect your domain to your website" button** (the one suggesting `parrotcube.site`) and the "Create a website or store" prompts. They'd point the domain at a GoDaddy site instead.

### 4.1 Add the domain to Cloudflare

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Domains** and select **Onboard a domain**.
2. Enter `subscribulator.eu` (no `www`), keep the option to **scan for DNS records**, and select **Continue**.
3. Choose the **Free** plan and continue.

### 4.2 Delete the records Cloudflare copies from GoDaddy

Cloudflare's scan copies GoDaddy's existing records. On subscribulator.eu those are just GoDaddy's defaults, and they'd get in the way of attaching the site, so delete them on the **Review DNS records** screen (or later under **DNS > Records**):

| Type | Name | Content | What it is | Action |
| --- | --- | --- | --- | --- |
| `A` | `subscribulator.eu` | `15.197.148.33` | GoDaddy parking page | **Delete** |
| `A` | `subscribulator.eu` | `3.33.130.190` | GoDaddy parking page | **Delete** |
| `CNAME` | `www` | `subscribulator.eu` | GoDaddy's default `www` alias | **Delete** |
| `CNAME` | `_domainconnect` | `_domainconnect.gd.domaincontrol.com` | GoDaddy's one-click setup helper | Delete (harmless, but no longer used) |

Leave the list empty and select **Continue**. Step 5 recreates the records you need. You don't have email on the domain, so there are no `MX` records to keep; if you add email later, you'll add its records in Cloudflare.

### 4.3 Change the nameservers at GoDaddy

Cloudflare now shows two nameservers, such as `ada.ns.cloudflare.com` and `rob.ns.cloudflare.com` (yours will differ). Keep that tab open and copy them.

1. Sign in to GoDaddy. From the subscribulator.eu dashboard (the page in your screenshot), select **Domain** in the left menu, or **Manage Domain** under **Quick Links**. From elsewhere, go to your [Domain Portfolio](https://dcc.godaddy.com/control/portfolio) and select **subscribulator.eu**.
2. Select **DNS**, then the **Nameservers** tab.
3. Select **Change Nameservers**, then **I'll use my own nameservers**.
4. Replace `ns37.domaincontrol.com` and `ns38.domaincontrol.com` with your two Cloudflare nameservers, **exactly** as shown in Cloudflare.
5. Select **Save**. GoDaddy warns that changing nameservers can break existing website or email connections; that's expected here, so select **Continue**.
6. If the domain has GoDaddy's **Domain Protection**, it asks you to verify with a code from your authenticator app, SMS or email.

Afterwards GoDaddy's DNS page says your DNS is managed elsewhere. That's correct: from now on you edit DNS records in Cloudflare.

### 4.4 Wait for Cloudflare to go Active

1. Back in Cloudflare, select **Check nameservers now** if it's offered.
2. Wait for the email saying subscribulator.eu is active on Cloudflare. It's often within an hour, but can take up to 24 to 48 hours. Its status on the **Domains** page changes from **Pending** to **Active**.

To check progress yourself from Terminal:

```bash
whois -h whois.eu subscribulator.eu | grep -A3 "Name servers"   # what the .eu registry has
dig ns subscribulator.eu @1.1.1.1 +short                          # what the internet sees
dig ns subscribulator.eu @8.8.8.8 +short
```

Both `dig` commands should list your two `*.ns.cloudflare.com` nameservers. Before the change they show `ns37.domaincontrol.com` and `ns38.domaincontrol.com`.

---

## Step 5: Attach subscribulator.eu to the site

Do this once Cloudflare shows the domain as **Active**.

### Add the Custom Domain

1. Go to **Workers & Pages** and select **subscribulator**.
2. Go to **Settings > Domains & Routes** and select **Add > Custom Domain**.
3. Enter `subscribulator.eu` and select **Add Custom Domain**.

Cloudflare creates the DNS record and issues the HTTPS certificate for you, usually within a few minutes. Then open **https://subscribulator.eu**.

> If Cloudflare says the hostname already has a record, a GoDaddy record from Step 4.2 survived. Delete it under **DNS > Records** and try again.

### Make www.subscribulator.eu work too

A Custom Domain matches one exact hostname, so `www` needs its own setup. Pick one:

- **Redirect `www` to the bare domain (recommended):**
  1. Go to **DNS > Records** and add a record: type `A`, name `www`, IPv4 address `192.0.2.0`, proxy status **Proxied** (orange cloud). That address is a placeholder: Cloudflare intercepts the traffic before it gets there.
  2. Go to **Rules**, create a rule from the **Redirect from WWW to root** template, and deploy it.
- **Or serve both:** add `www.subscribulator.eu` as a second Custom Domain on the Worker.

### Or keep it in code (optional)

Instead of the dashboard, you can declare the domains in `wrangler.jsonc` and redeploy. The zone must already be **Active**:

```jsonc
{
  // ...existing settings...
  "routes": [
    { "pattern": "subscribulator.eu", "custom_domain": true },
    { "pattern": "www.subscribulator.eu", "custom_domain": true }
  ]
}
```

---

## Step 6: Recommended settings

- **Force HTTPS:** in Cloudflare, open subscribulator.eu, go to **SSL/TLS > Edge Certificates** and turn on **Always Use HTTPS**. Once everything has worked for a while, consider **HSTS** on the same page.
- **Switch DNSSEC on** (optional, recommended): in Cloudflare go to **DNS > Settings** and enable **DNSSEC**. Cloudflare then shows a DS record; add it at GoDaddy (**Domain > DNS > DNSSEC**). Only do this after the domain is Active.
- **Keep GoDaddy renewing the domain:** make sure **auto-renew** is on for subscribulator.eu in GoDaddy, and check the renewal price, since first-year offers often renew higher. If the registration lapses, the site goes offline no matter what Cloudflare does.
- **Retire the `workers.dev` address** (optional): the `_headers` file already stops search engines indexing it. To switch it off completely, go to **Settings > Domains & Routes** and disable `workers.dev`, or add `"workers_dev": false` to `wrangler.jsonc`.
- **Analytics** (optional): Cloudflare Web Analytics is free and doesn't use cookies. If you turn it on, soften the footer's "Your data never leaves this browser" line, since page views would then be counted.

---

## Updating and rolling back

**To publish a change:**

- Option A (GitHub): on github.com, open the folder the file lives in, select **Add file > Upload files** and drag in the changed file, or edit it in place with the pencil icon. Each commit redeploys. From Terminal, commit and `git push`.
- Option B (from your Mac): `npm run deploy`

**To roll back:** open **Workers & Pages > subscribulator > Deployments**, find the previous version and select **Rollback**. Or from the terminal:

```bash
npx wrangler rollback
```

---

## What it costs

| Item | Cost |
| --- | --- |
| Hosting on the Workers Free plan | **Free.** Requests for static files are free and unlimited, and storing them costs nothing. |
| Cloudflare DNS, HTTPS certificate, CDN | Free |
| subscribulator.eu | Your yearly renewal at GoDaddy. Nothing extra for using Cloudflare. |

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| subscribulator.eu still shows a GoDaddy parking page | The nameserver change hasn't gone through yet. Check with the `dig`/`whois` commands in [Step 4.4](#44-wait-for-cloudflare-to-go-active), and make sure the GoDaddy parking `A` records were deleted in Cloudflare. |
| Cloudflare stuck on "Pending Nameserver Update" | In GoDaddy, check the nameservers match Cloudflare's two exactly (no typos, no extra GoDaddy ones left). Then use **Check nameservers now** in Cloudflare. |
| GoDaddy asks for a verification code | That's Domain Protection. Use your authenticator app, SMS or the email code GoDaddy sends. |
| Custom Domain can't be added | Delete any existing record for that exact hostname under **DNS > Records**, then try again. |
| `www` doesn't load | Add the proxied `www` DNS record and the redirect rule from [Step 5](#make-wwwsubscribulatoreu-work-too). |
| GitHub won't take the upload because there are too many files | Use the two folders in `~/subscribulator-github`, not the project folder itself, which also holds thousands of files in `node_modules`. Each batch must be 100 files or fewer. |
| Everything landed inside a `1-upload-first` folder on GitHub | The folder was dragged instead of what's inside it. The repository is new, so the quickest fix is to delete it (**Settings > General > Delete this repository**), create it again and drag the folder's contents. |
| Cloudflare build fails with "Could not resolve" and a `src/assets/logos/…` path | The second batch (the logos) hasn't been uploaded. Upload it as in [Option A](#option-a-automatic-deploys-from-github-recommended) and Cloudflare rebuilds automatically. |
| The first commit shows your work email | Before pushing, set the repository's name and email as in [Option A](#option-a-automatic-deploys-from-github-recommended), then run `git commit --amend --reset-author --no-edit`. |
| `git push` asks for a username and password | GitHub doesn't accept account passwords for Git. Run `gh auth login` and answer **Yes** to authenticating Git with your GitHub credentials, then push again. |
| Git build fails with a Worker name mismatch | The project name in the dashboard must be exactly `subscribulator`, matching `name` in `wrangler.jsonc`. |
| Git build fails on the Node version | `.node-version` probably didn't get uploaded (Finder hides it until you press ⌘⇧.). Upload it, or add the build variable `NODE_VERSION` = `24` under **Settings > Build > Build variables and secrets**. |
| "Could not find assets directory" | The site hasn't been built. Use `npm run deploy` (which builds first), or make sure the build command is `npm run build`. |
| Ko-fi section missing on the live site | Check the link in `src/config.ts` starts with `https://ko-fi.com/`. If you added a `VITE_KOFI_URL` build variable in Cloudflare, it overrides that link, so check it too. Redeploy after changing either. |
| My saved stack isn't on subscribulator.eu | Browsers keep saved data per website, so stacks saved on `localhost` or `workers.dev` don't carry over. Use **Settings > Export** on the old address and **Import** on the new one. |
