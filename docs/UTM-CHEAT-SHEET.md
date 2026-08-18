# UTM Cheat Sheet — PLACES

Copy-paste ready URLs for every channel PLACES uses to drive traffic. Every link that goes ANYWHERE outside places-egy.com should have UTMs so we can measure which channels actually bring leads.

**Rule:** never share a plain `https://places-egy.com/…` link publicly. Always tag it.

---

## Quick reference — the 5 parameters

| Parameter | What it means | Example |
|---|---|---|
| `utm_source` | Where the click came from (the platform) | `instagram`, `google`, `whatsapp` |
| `utm_medium` | The channel type | `social`, `email`, `cpc`, `chat`, `gbp` |
| `utm_campaign` | The specific campaign / initiative | `august_launch`, `story_market_report`, `bio` |
| `utm_content` | Which specific creative (optional) | `story_slide_2`, `carousel_v1` |
| `utm_term` | Keyword (optional — mostly paid search) | `office_new_cairo` |

**Naming rules:**
- All lowercase
- Words separated by `_` (underscore), not spaces or dashes
- Keep it short + greppable — you'll be filtering by these in the dashboard

---

## Ready-to-paste URLs by channel

### Google Business Profile (once, then leave alone)
Your "Website" button in your GBP listing. Every organic Google-Maps click flows through this.
```
https://places-egy.com/?utm_source=google&utm_medium=gbp&utm_campaign=business_profile
```

### Instagram bio link (once, update if you swap the promoted page)
```
https://places-egy.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio
```

### Instagram Story link sticker (change per story)
```
https://places-egy.com/?utm_source=instagram&utm_medium=story&utm_campaign=STORY_NAME
```
Example: `utm_campaign=market_report_launch` or `utm_campaign=solana_east_tour`.

### Instagram post caption / DM (per post)
```
https://places-egy.com/?utm_source=instagram&utm_medium=social&utm_campaign=post_YYYYMMDD
```
Example: `utm_campaign=post_20260818`.

### WhatsApp — general outreach
```
https://places-egy.com/?utm_source=whatsapp&utm_medium=chat&utm_campaign=outreach
```

### WhatsApp — sharing a specific listing
Best practice: link to the LISTING page, not the homepage.
```
https://places-egy.com/listings/123-mivida-tower?utm_source=whatsapp&utm_medium=chat&utm_campaign=outreach
```

### WhatsApp — broadcast blast
```
https://places-egy.com/?utm_source=whatsapp&utm_medium=broadcast&utm_campaign=CAMPAIGN_NAME
```
Example: `utm_campaign=august_new_listings`.

### LinkedIn — organic post
```
https://places-egy.com/?utm_source=linkedin&utm_medium=social&utm_campaign=post_YYYYMMDD
```

### LinkedIn — company page bio
```
https://places-egy.com/?utm_source=linkedin&utm_medium=social&utm_campaign=company_bio
```

### Email newsletter (when we launch it)
```
https://places-egy.com/?utm_source=newsletter&utm_medium=email&utm_campaign=EDITION_NAME
```
Example: `utm_campaign=august_2026_market_report`.

### Cold email (individual outreach from admin@places-egy.com)
```
https://places-egy.com/?utm_source=email&utm_medium=cold&utm_campaign=outreach
```

### Meta ads (Facebook/Instagram paid)
```
https://places-egy.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=CAMPAIGN_NAME
```

### Google Ads
Google Ads has auto-tagging via `gclid` — you don't NEED UTMs, but adding them makes the reports cleaner.
```
https://places-egy.com/?utm_source=google&utm_medium=cpc&utm_campaign=CAMPAIGN_NAME
```

### TikTok organic post
```
https://places-egy.com/?utm_source=tiktok&utm_medium=social&utm_campaign=post_YYYYMMDD
```

### Print QR code (business card, flyer, event banner)
```
https://places-egy.com/?utm_source=qr&utm_medium=print&utm_campaign=PRINT_ITEM
```
Example: `utm_campaign=business_card` or `utm_campaign=cityscape_expo_2026`.

### Partner / referral link
```
https://places-egy.com/?utm_source=PARTNER_NAME&utm_medium=referral&utm_campaign=partnership
```
Example: `utm_source=jll` if JLL links to us in a report.

---

## How to see the results

1. Go to **[places-egy.com/dashboard](https://places-egy.com/dashboard) → Leads tab**
2. Every lead row now shows a colored **source pill** (INSTAGRAM, WHATSAPP, GOOGLE, etc.)
3. **Source filter dropdown** at the top-right → filter to a specific channel to see just those leads
4. **"Direct"** = a lead who didn't come through any tagged link (typed the URL, clicked an untagged share, etc.)

---

## Rules of thumb

**Do:**
- Tag every outbound link, every time. It costs 5 seconds; missed attribution costs weeks of guessing.
- Reuse existing `utm_source` values (google, instagram, whatsapp, linkedin, newsletter, email). Don't invent new ones like "IG" or "insta" — they'll show as separate rows in the dashboard and you'll lose data continuity.
- Change `utm_campaign` per initiative. That's where you'll see WHICH story or WHICH email actually drove leads.

**Don't:**
- UTM-tag internal navigation links (menu items, footer links, buttons on your own site). UTMs are for INBOUND traffic only.
- Put spaces or capitals in parameters — `utm_campaign=Summer Launch` becomes `utm_campaign=Summer%20Launch` in the URL and confuses reports.
- Forget the `?` before the first UTM and `&` between subsequent ones. Bad: `?utm_source=google?utm_medium=gbp`. Good: `?utm_source=google&utm_medium=gbp`.

---

## When you'll get real signal

- **After ~2 weeks** of consistent tagging, you'll see which channels lead the pack.
- **After ~1 month**, you can start killing channels that don't convert.
- **After ~3 months**, you have enough data to run controlled experiments (e.g. same offer via Instagram vs WhatsApp).

Until then, treat single-lead attribution as directional, not conclusive.
