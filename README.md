# DCALL - Decentralized Contact Directory

![DCALL Logo](/img/icon-192.png)

[DCALL](https://dcall.hns.to/hackbase) is a decentralized contact directory application that leverages Handshake domains to fetch and manage contact information stored in DNS TXT records. It allows users to save, update, and organize contacts with support for various communication platforms and cryptocurrency wallets. The application is designed to be user-friendly, privacy-focused, and compatible with both [Handshake](https://handshake.org) (HNS) and ICANN domains.

## Features

- **Light/Dark Mode**: Toggle between light and dark themes for a comfortable user experience.
- **Export/Import Contact Lists**: Backup your contacts to a JSON file (`dcall-contacts-backup.json`) and restore them as needed.
- **Clear All Data**: A dedicated button to wipe all stored contacts and data (with confirmation).
- **Auto-Update on Import**: Contacts are automatically updated with the latest TXT records when imported.
- **Update All Contacts**: Refresh all contacts to fetch the latest TXT records with a single click.
- **Auto-Fetching Input Field**: Enter a domain to automatically fetch TXT records; the input field lights up green when valid data is found. *(Note: Sometimes, adding a space after the domain is required to trigger fetching.)*
- **HNS & ICANN Compatibility**: Supports both Handshake (HNS) and traditional ICANN domains.
- **Subdomain-Specific Contact Lists**: Maintain separate contact lists for different subdomains (e.g., work.dcall, friends.dcall, sidechicks.dcall).
- **Progressive Web App (PWA)**: Save DCALL as an app on mobile or desktop for offline access.
- **Shareable Contact Links**: Share your contact info easily using URLs like [https://dcall/hackbase](https://dcall/hackbase) or [https://dcall.hns.to/hackbase](https://dcall.hns.to/hackbase), which autofill the input field in DCALL.

## Data Storage

### Storage Mechanism
DCALL stores contact data and timestamps in the browser's `localStorage` using the keys `dcall-contacts` (for contact data) and `dcall-last-update` (for the last update timestamp).

### Storage Location
Data is stored in SQLite databases in the `leveldb` folder or as `.localstorage` files, depending on the browser:

#### Windows
- **Chrome**: `C:\Users\<Username>\AppData\Local\Google\Chrome\User Data\Default\Local Storage`
- **Brave**: `C:\Users\<Username>\AppData\Local\BraveSoftware\Brave-Browser\User Data\Default\Local Storage`
- **Firefox**: `C:\Users\<Username>\AppData\Roaming\Mozilla\Firefox\Profiles\<profile>\storage\webappsstore.sqlite`
- **Opera**: `C:\Users\<Username>\AppData\Local\Opera Software\Opera Stable\pstorage`

#### macOS
- **Chrome**: `~/Library/Application Support/Google/Chrome/Default/Local Storage`
- **Brave**: `~/Library/Application Support/BraveSoftware/Brave-Browser/Default/Local Storage`
- **Firefox**: `~/Library/Application Support/Firefox/Profiles/<profile>/storage/webappsstore.sqlite`
- **Opera**: `~/Library/Application Support/com.operasoftware.Opera/pstorage`

#### Linux
- **Chrome**: `~/.config/google-chrome/Default/Local Storage`
- **Brave**: `~/.config/BraveSoftware/Brave-Browser/Default/Local Storage`
- **Firefox**: `~/.mozilla/firefox/<profile>/storage/webappsstore.sqlite`
- **Opera**: `~/.config/opera/pstorage`

### Notes
- **Device & Browser Specific**: Contact lists are stored locally in the browser, making them specific to the device and browser used. Use the export/import feature to transfer contacts across devices or browsers.
- **Storage Limit**: In Brave, Chrome, and Firefox, the storage limit for `localStorage` is approximately 10 MB (around 5 million characters in UCS-2 encoding). Opera also defaults to 10 MB but allows users to set unlimited storage for specific domains.

## Supported TXT Record Prefixes

DCALL fetches DNS TXT records for a given domain and processes records with the following prefixes (not all dprofile protocol prefixes are supported):

### Communication Platforms
- `tel:`: Telephone number
- `pfp:`: Profile picture URL
- `wa:`: WhatsApp
- `tg:`: Telegram
- `x:`: X platform handle
- `url:`: Website URL
- `link:`: Alternative link (deprecated, will be replaced by `url:`)
- `tb:`: Thunderbolt username
- `onion:`: Tor onion address
- `sn:`: Signal
- `mail:`: Email address
- `gh:`: GitHub handle
- `ig:`: Instagram handle
- `fb:`: Facebook handle
- `yt:`: YouTube handle
- `rumble:`: Rumble handle
- `ens:`: Ethereum Name Service
- `nostr:`: Nostr protocol
- `pk:`: Public key or similar identifier
- `matrix:`: Matrix protocol handle
- `sx:`: SimpleX chat
- `bsky:`: Bluesky handle

### Supported Wallets
- `btc:`: Bitcoin address
- `ln:`: Lightning Network address
- `hns:`: Handshake address
- `eth:`: Ethereum address
- `xmr:`: Monero address
- `zec:`: Zcash address
- `bat:`: Basic Attention Token address
