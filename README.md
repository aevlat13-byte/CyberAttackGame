# Infected: OS Under Attack

A static, browser-based educational game for Year 9 students. The game simulates a Windows-like desktop and challenges players to match security responses to common malware threats.

## ✅ How to run locally

1. Clone or download this repository.
2. Open `index.html` in a modern web browser.

No build tools or dependencies are required.

## 🚀 GitHub Pages deployment

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder, then click **Save**.
5. Wait for the Pages URL to appear, then open the link.

## 🎓 Teacher notes (lesson-ready)

**Learning goals**
- Recognise common cyber threats (phishing, adware, ransomware, brute force, botnet traffic).
- Match appropriate defensive actions to each threat.
- Explain why a defence works and how to prevent future attacks.

**How to use in class**
- Run the game on student laptops (1280x720 and smaller screens work well).
- Ask students to keep a short log of each threat and their chosen defence.
- Use the end-of-game Detective Rank to discuss improvement.

**Differentiation tips**
- Easy mode shows stronger hints and smaller health penalties.
- Standard mode reduces hints for more challenge.
- Pair students and ask them to justify their choices aloud.

**Safety notes**
- All domains and organizations are fictional (e.g., example[dot]com).
- No real phishing links are included.

## 🧩 Threats and best responses

| Threat | Best defence | Why it works |
| --- | --- | --- |
| Phishing | Report & Delete / Staff training | Removes the email and helps people spot fakes. |
| Adware | Anti-malware scan / Update software | Removes unwanted apps and closes vulnerabilities. |
| Ransomware | Restore from backup / Disconnect network | Recovers files and stops spread. |
| Brute force | Turn on 2FA / Change password | Blocks guessing attacks. |
| Botnet traffic | Firewall rule / Disconnect network | Blocks unusual outbound traffic. |

## 🛡️ Game loop summary

1. Calm phase on the desktop.
2. Threat appears (email, pop-up, lock screen, or alert).
3. Player responds in Security Centre.
4. Feedback explains why the defence is right or wrong.
5. After 6 waves, the system is either secured or compromised.
