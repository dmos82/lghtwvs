# Customization Guide - LGHTWVS

## Quick Tweaks

### 1. Change Zoom Speed

**File**: `script.js` (line ~25)

```javascript
zoomMultiplier: 15, // Change this number
```

- **Smaller numbers** (5-10) = slower, more gradual zoom
- **Larger numbers** (20-40) = faster, more dramatic zoom
- **Recommended**: 12-18 for smooth feel

### 2. Change When Overlay Appears

**File**: `script.js` (lines ~175, ~215)

```javascript
if (progress > 0.7) {  // Change 0.7 to a different value
    this.elements.heroOverlay.classList.add('visible');
}
```

- **0.5** = Appears halfway through zoom
- **0.7** = Appears near end (default)
- **0.9** = Appears almost completely zoomed

### 3. Change Colors & Styling

**File**: `styles.css`

```css
/* Accent color (currently neon green) */
color: #0f0;  /* Change to #ff00ff, #00ccff, #ffff00, etc. */

/* Shadow/glow */
text-shadow: 0 2px 10px rgba(0, 255, 0, 0.5);  /* Change RGB values */

/* Border color */
border-color: #0f0;

/* Hover effect */
box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);  /* Adjust alpha for intensity */
```

### 4. Change Font

**File**: `styles.css` (line ~12)

```css
font-family: 'Helvetica Neue', Arial, sans-serif;
/* Change to: 'Georgia', 'Courier', 'Comic Sans MS', etc. */
```

### 5. Change Text Content

**File**: `index.html`

```html
<!-- Hero Section -->
<h1>DAVID MORIN</h1>  <!-- Change to your name -->
<p class="subtitle">LIGHT WAVES</p>  <!-- Change to your title -->
<a href="#" class="cta-button">LISTEN NOW</a>  <!-- Change button text -->

<!-- Info Section Cards -->
<h2>MUSIC</h2>  <!-- Change category -->
<a href="#">Stream Now</a>  <!-- Change link text -->
```

---

## Advanced Customization

### Adding More Sections

1. **Create new image folder**:
   ```
   LGHTWVS/
   └── SECTION_NAME/
       ├── image_1.JPG
       ├── image_2.JPG
       └── ...
   ```

2. **Add to HTML** (`index.html`):
   ```html
   <section class="zoom-section section-name" id="sectionName"
            data-start-image="1" data-end-image="12" data-folder="SECTION_NAME">
       <div class="zoom-viewport">
           <div class="zoom-layer" id="sectionLayer">
               <img id="sectionImage" src="SECTION_NAME/image_1.JPG" alt="Section image">
           </div>
       </div>
       <div class="zoom-overlay section-overlay" id="sectionOverlay">
           <!-- Your content here -->
       </div>
   </section>
   ```

3. **Update JavaScript** (`script.js`):
   ```javascript
   // In calculateScrollHeight():
   const imagesCount = 11 + 7 + 12; // Add new section count

   // In update() method, add else-if:
   else if (totalProgress < newThreshold) {
       this.state.currentSection = 'section_name';
       const sectionProgress = (totalProgress - previousThreshold) / (newThreshold - previousThreshold);
       this.updateSectionNameSection(sectionProgress);
   }

   // Add new update method:
   updateSectionNameSection(progress) {
       // Copy pattern from updateHeroSection or updateInfoSection
   }
   ```

### Adjusting Image Count Per Section

**File**: `script.js`

Find section update methods and change image count:

```javascript
// HERO section - change 11 to your count
const imageIndex = Math.min(11, Math.max(1, Math.ceil(progress * 11)));

// INFO section - change 7 to your count
const imageIndex = Math.min(7, Math.max(1, Math.ceil(progress * 7)));
```

### Custom Cursor Effects

**File**: `styles.css` (add at end):

```css
body {
    cursor: url('custom-cursor.png'), auto;
}

a, button, .interactive {
    cursor: pointer;
}
```

### Custom Animations

**File**: `styles.css`

```css
@keyframes customFadeIn {
    from {
        opacity: 0;
        transform: rotate(180deg) scale(0.5);
    }
    to {
        opacity: 1;
        transform: rotate(0deg) scale(1);
    }
}

.overlay-content {
    animation: customFadeIn 1.2s ease-out forwards;
}
```

### Add Audio/Music Player

**File**: `index.html` (in overlay content):

```html
<div class="overlay-content">
    <audio id="audioPlayer" controls>
        <source src="music.mp3" type="audio/mpeg">
    </audio>
</div>
```

**File**: `styles.css` (add styling):

```css
audio {
    width: 100%;
    margin: 1rem 0;
    filter: invert(1);
}
```

### Responsive Adjustments

**File**: `styles.css` (update media queries):

```css
@media (max-width: 768px) {
    .hero-overlay .overlay-content h1 {
        font-size: 2rem;  /* Adjust for smaller screens */
    }

    .info-grid {
        grid-template-columns: 1fr;  /* Stack cards vertically */
    }
}
```

---

## Performance Optimization

### Optimize Images

```bash
# Compress JPGs (from command line)
jpegoptim --max=85 *.JPG

# Convert to WebP for better compression
cwebp input.jpg -o output.webp

# Resize large images
convert image.JPG -resize 2560x1920 image_small.JPG
```

### Enable Caching

**File**: `netlify.toml` (already configured, but can adjust):

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"  # Change 3600 (1 hour) to longer
```

### Reduce JavaScript

Remove debug mode in production:

```javascript
// In script.js, at the end:
window.zoomScroll.disableDebug();
```

Or in HTML before closing `</body>`:

```html
<script>
    if (window.zoomScroll) {
        window.zoomScroll.disableDebug();
    }
</script>
```

---

## Troubleshooting Custom Changes

### Images Not Loading After Changes

1. Check image paths in console (Ctrl+Shift+J)
2. Verify folder names match exactly (case-sensitive)
3. Ensure images are actually in the folders
4. Try clearing browser cache (Ctrl+Shift+Delete)

### Zoom Effect Broken

1. Check `calculateScrollHeight()` has correct image counts
2. Verify `updateSectionName()` methods exist for all sections
3. Look for JavaScript errors in console
4. Try resetting to original `script.js` and making smaller changes

### Text Not Centered

1. Ensure overlays have `display: flex;`
2. Check parent containers have proper height
3. Verify `align-items: center; justify-content: center;`

### Colors Not Applying

1. Check CSS specificity (more specific selectors override)
2. Use `!important` as last resort: `color: #ff0000 !important;`
3. Verify hex color format: `#RRGGBB` (6 digits)
4. Clear CSS cache: Ctrl+Shift+R (hard refresh)

---

## Quick Color Palettes

Copy-paste these color schemes:

### Cyberpunk (default)
```css
Accent: #0f0
Background: #000
Text: #fff
Shadow: rgba(0, 255, 0, 0.5)
```

### Synthwave
```css
Accent: #ff006e
Background: #0a0e27
Text: #e0aaff
Shadow: rgba(255, 0, 110, 0.5)
```

### Ocean
```css
Accent: #00d9ff
Background: #001a33
Text: #ffffff
Shadow: rgba(0, 217, 255, 0.5)
```

### Sunset
```css
Accent: #ff9500
Background: #1a1a2e
Text: #f5f5f5
Shadow: rgba(255, 149, 0, 0.5)
```

### Minimal
```css
Accent: #333
Background: #fff
Text: #000
Shadow: rgba(0, 0, 0, 0.2)
```

---

## Deployment After Changes

```bash
# Commit changes
cd /Users/davidjmorin/LGHTWVS
git add .
git commit -m "Customized website styling and content"

# Push to GitHub (if using GitHub)
git push origin main

# Netlify auto-deploys on push!
```

---

## Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Changes not showing | Clear cache (Ctrl+Shift+Delete) and hard refresh (Ctrl+Shift+R) |
| Zoom too fast/slow | Adjust `zoomMultiplier` in script.js |
| Overlay timing off | Adjust `progress > 0.X` threshold in script.js |
| Images blurry | Ensure images are high resolution (4K+) |
| Mobile looks broken | Check responsive media queries in CSS |
| Audio not playing | Check audio file path and format |

---

**Have fun customizing! 🎨**
