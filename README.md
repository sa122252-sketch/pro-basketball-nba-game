# 🏀 NBA 2K Style Basketball Game

A fully-featured 2-player basketball game with realistic gameplay mechanics, mobile support, and arcade-style action!

## 🎮 Play Now

The game is **live** and accessible at the current sandbox URL. For permanent hosting, see deployment options below.

## ✨ Features

### 🏟️ Gameplay
- **2-Player Local Multiplayer** - Compete head-to-head
- **First to 50 Points Wins** - Fast-paced competitive action
- **Realistic Basketball Court** - NBA-styled court with proper dimensions
- **Advanced Shooting Mechanics** - Distance-based accuracy and shot arcs
- **Defense System** - Steal attempts and collision physics
- **24-Second Shot Clock** - Authentic NBA rules
- **Game Quarters** - 4 quarters of 12 minutes each (plus overtime)
- **Comprehensive Stats** - Field Goal %, 3-Point %, Steals tracking

### 📱 Mobile Support
- **Fully Responsive** - Works on all devices
- **Touch Controls** - Virtual joysticks and buttons for mobile
- **Optimized UI** - Adapts to different screen sizes
- **Native App Feel** - Can be added to home screen (PWA-ready)

### 🎨 Visual Polish
- **Dynamic HUD** - Live scores, stats, timer, and shot clock
- **Smooth Animations** - Fluid player movement and ball physics
- **Color-Coded Players** - Blue (Player 1) vs Red (Player 2)
- **Visual Feedback** - Shot clock warnings, possession indicators
- **Winner Modal** - Celebration screen with final statistics

## 🎮 Controls

### Desktop Controls

#### Player 1 (Blue 🔵)
- **W/A/S/D** - Move (Up/Left/Down/Right)
- **SPACE** - Shoot (with ball) / Steal (on defense)
- **SHIFT** - Sprint

#### Player 2 (Red 🔴)
- **Arrow Keys (↑←↓→)** - Move in all directions
- **ENTER** - Shoot (with ball) / Steal (on defense)
- **RIGHT SHIFT** - Sprint

#### General
- **ESC** - Pause game

### Mobile Controls

#### Touch Controls (Auto-detected on mobile devices)
- **Virtual Joystick (Left)** - Player 1 movement
- **Virtual Joystick (Right)** - Player 2 movement
- **Shoot Button** - Shoot or steal
- **Sprint Button** - Move faster

## 🚀 Deployment Options

### Option 1: GitHub Pages (Free)
1. Push code to GitHub repository
2. Go to repository Settings → Pages
3. Select branch and deploy
4. Access at: `https://yourusername.github.io/repo-name`

```bash
git remote add origin https://github.com/yourusername/nba-game.git
git push -u origin main
```

### Option 2: Netlify (Free)
1. Sign up at [netlify.com](https://netlify.com)
2. Connect your Git repository or drag & drop folder
3. Deploy automatically
4. Get custom subdomain: `your-game.netlify.app`
5. Optional: Add custom domain

**Deploy via Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Option 3: Vercel (Free)
1. Sign up at [vercel.com](https://vercel.com)
2. Import Git repository
3. Deploy with one click
4. Get subdomain: `your-game.vercel.app`
5. Optional: Add custom domain

**Deploy via Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 4: Cloudflare Pages (Free)
1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect Git repository
3. Configure build settings (none needed - static site)
4. Deploy automatically on push
5. Free custom domain support

### Option 5: Traditional Web Hosting
Upload files via FTP to any web host:
- Upload `index.html`, `style.css`, `game.js`, `README.md`
- Ensure files are in public_html or www folder
- Access via your domain

## 📦 Files Structure

```
/
├── index.html      # Main HTML file
├── style.css       # All styles and responsive design
├── game.js         # Game logic and controls
└── README.md       # This file
```

## 🔧 Installation & Local Development

### Run Locally

**Option 1: Python HTTP Server**
```bash
python3 -m http.server 8000
# Visit: http://localhost:8000
```

**Option 2: Node.js HTTP Server**
```bash
npx http-server -p 8000
# Visit: http://localhost:8000
```

**Option 3: PHP Built-in Server**
```bash
php -S localhost:8000
# Visit: http://localhost:8000
```

## 🌐 Custom Domain Setup

### Free Domain Options
- **Freenom** - Free .tk, .ml, .ga domains
- **Subdomain services** - afraid.org, noip.com

### Paid Domain (Recommended)
1. Purchase domain from:
   - Namecheap ($8-12/year)
   - Google Domains ($12/year)
   - Cloudflare Registrar (at-cost)

2. Point DNS to hosting provider:
   - Netlify: Add CNAME record
   - Vercel: Add A record
   - Cloudflare Pages: Automatic DNS setup

### Example DNS Configuration (Netlify)
```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: [Netlify IP - check docs]
```

## 📱 Mobile App Options

### Progressive Web App (PWA)
The game is PWA-ready! Users can:
1. Open in mobile browser
2. Tap "Add to Home Screen"
3. Use like a native app

### Convert to Native App

**Option 1: Capacitor (Recommended)**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
npx cap open android
```

**Option 2: Cordova**
```bash
npm install -g cordova
cordova create nba-game
cordova platform add android
cordova build android
```

**Option 3: React Native WebView**
Wrap game in React Native app with WebView component

**Option 4: Ionic Framework**
```bash
npm install -g @ionic/cli
ionic start nba-game blank
# Add game files to www folder
ionic capacitor add android
ionic capacitor run android
```

## 🎯 Game Rules

1. **Objective**: First player to reach 50 points wins
2. **Scoring**:
   - 2 points for shots inside the three-point line
   - 3 points for shots beyond the three-point line
3. **Shot Clock**: You have 24 seconds to shoot
4. **Quarters**: Game consists of 4 quarters (12 minutes each)
5. **Overtime**: If tied after regulation, game continues
6. **Steals**: Get close to opponent to attempt stealing the ball
7. **Accuracy**: Closer shots have higher success rate

## 🔊 Browser Compatibility

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ Opera

## 🎨 Customization

### Change Winning Score
Edit `game.js` line 25:
```javascript
winningScore: 50  // Change to any number
```

### Change Quarter Duration
Edit `game.js` line 24:
```javascript
quarterDuration: 720  // In seconds (720 = 12 minutes)
```

### Change Shot Clock
Edit `game.js` line 23:
```javascript
shotClockDuration: 24  // In seconds
```

### Change Player Colors
Edit `game.js` lines 48 & 65:
```javascript
color: '#4169e1'  // Player 1 color (blue)
color: '#dc143c'  // Player 2 color (red)
```

## 🐛 Troubleshooting

### Game Not Loading
- Clear browser cache
- Try different browser
- Check browser console for errors

### Touch Controls Not Working
- Ensure you're on mobile device or enable mobile view
- Disable browser zoom
- Try different browser

### Audio Not Playing
- Check browser audio permissions
- Unmute device
- Some browsers require user interaction first

## 📈 Future Enhancements

Potential features to add:
- [ ] AI opponent (single player mode)
- [ ] Online multiplayer
- [ ] Tournament mode
- [ ] Player customization
- [ ] Multiple courts/themes
- [ ] Power-ups and special moves
- [ ] Replay system
- [ ] Leaderboards
- [ ] Sound effects library
- [ ] Background music

## 📄 License

This is a free, open-source game. Feel free to modify and distribute.

## 🤝 Contributing

Want to improve the game? Feel free to fork and submit pull requests!

## 📞 Support

For issues or questions about deployment, please refer to the hosting provider's documentation:
- [GitHub Pages Docs](https://docs.github.com/pages)
- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)

---

**Enjoy the game!** 🏀🔥

Made with ❤️ by GenSpark AI
