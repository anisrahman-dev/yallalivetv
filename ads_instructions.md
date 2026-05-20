# 📢 Yalla Live - Ads Integration & Control Instructions

This file documents the exact HTML structure and scripts for the advertisement placements on Yalla Live. Currently, **all advertisements are 100% disabled** by wrapping them in clean HTML comments (`<!-- ... -->`) and setting script tags to `type="text/plain"` to prevent any network loads or background scripts.

Follow the instructions below to easily **Enable** or **Disable** any of the ad slots.

---

## 🌓 How to Control the Ads

To toggle any of the ad units, search for the corresponding keyword in `home.html` and follow these quick edits:

### 1. The Gutter Skyscraper Ads (Left & Right Sides)
These are horizontal side-by-side skyscraper banner ad frames designed specifically for wide viewports.

*   **To Enable**:
    1. Search for the section labeled `<!-- 🚫 TEMPORARILY DISABLED: Gutter Skyscraper Ads (Left & Right Sides)` in `home.html` (approx. line 62).
    2. Remove the outer comment wrapper `<!--` at the start and `-->` at the very end of the block.
    3. Make sure to change `type="text/plain"` back to `type="text/javascript"` inside all four `<script>` tags in this block so the browser executes them.
*   **To Disable**:
    1. Wrap the entire container from `<div class="hidden min-[1360px]:flex...` to the closing `</div>` tags in standard `<!--` and `-->` comments.
    2. Change the `type` attribute on all script tags within the block to `type="text/plain"` to halt all background scripts and tracking queries.

---

### 2. The Bottom Match Section Ad Banner
This is the dynamic native ad banner displayed directly underneath the match list for both mobile and web visitors.

*   **To Enable**:
    1. Search for the section labeled `<!-- 🚫 TEMPORARILY DISABLED: Bottom Match Section Ad Banner` in `home.html` (approx. line 228).
    2. Remove the outer comment wrapper `<!--` and `-->`.
    3. Change `type="text/plain"` on the `<script>` tag back to `type="text/javascript"`.
*   **To Disable**:
    1. Wrap the container starting with `<div class="w-full flex...` in comments.
    2. Set `type="text/plain"` on the `<script>` tag.

---

## 💻 Exact Backup Code Structures

If the ad blocks in `home.html` are ever lost or deleted, you can copy-paste these exact code patterns back into your files:

### 📄 Left & Right Skyscraper Ads Code Block
Place this directly after the opening `<body>` tag:

```html
    <!-- Left Sidebar Skyscraper Ads (Visible next to main content on desktops) -->
    <div class="hidden min-[1360px]:flex absolute left-4 top-[180px] z-40 gap-3 items-start select-none">
      <!-- Left Skyscraper 1 (Always visible on desktop viewports >= 1360px) -->
      <div class="w-[160px] h-[600px] bg-slate-100 dark:bg-slate-800/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
        <span class="absolute top-1 left-2 text-[9px] font-bold text-slate-400/50 uppercase tracking-widest pointer-events-none">Advertisement</span>
        <script type="text/javascript">
          atOptions = {
            'key' : 'ec2e4b0a2aa3fcac5cb428225d0ad9a1',
            'format' : 'iframe',
            'height' : 600,
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/ec2e4b0a2aa3fcac5cb428225d0ad9a1/invoke.js"></script>
      </div>
      
      <!-- Left Skyscraper 2 (Only visible side-by-side on ultra-wide screens >= 1700px) -->
      <div class="hidden min-[1700px]:flex w-[160px] h-[600px] bg-slate-100 dark:bg-slate-800/20 rounded-xl overflow-hidden shadow-inner items-center justify-center relative">
        <span class="absolute top-1 left-2 text-[9px] font-bold text-slate-400/50 uppercase tracking-widest pointer-events-none">Advertisement</span>
        <script type="text/javascript">
          atOptions = {
            'key' : 'ec2e4b0a2aa3fcac5cb428225d0ad9a1',
            'format' : 'iframe',
            'height' : 600,
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/ec2e4b0a2aa3fcac5cb428225d0ad9a1/invoke.js"></script>
      </div>
    </div>

    <!-- Right Sidebar Skyscraper Ads (Visible next to main content on desktops) -->
    <div class="hidden min-[1360px]:flex absolute right-4 top-[180px] z-40 gap-3 items-start select-none">
      <!-- Right Skyscraper 2 (Only visible side-by-side on ultra-wide screens >= 1700px Closer to the content) -->
      <div class="hidden min-[1700px]:flex w-[160px] h-[600px] bg-slate-100 dark:bg-slate-800/20 rounded-xl overflow-hidden shadow-inner items-center justify-center relative">
        <span class="absolute top-1 left-2 text-[9px] font-bold text-slate-400/50 uppercase tracking-widest pointer-events-none">Advertisement</span>
        <script type="text/javascript">
          atOptions = {
            'key' : 'ec2e4b0a2aa3fcac5cb428225d0ad9a1',
            'format' : 'iframe',
            'height' : 600,
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/ec2e4b0a2aa3fcac5cb428225d0ad9a1/invoke.js"></script>
      </div>

      <!-- Right Skyscraper 1 (Always visible on desktop viewports >= 1360px) -->
      <div class="w-[160px] h-[600px] bg-slate-100 dark:bg-slate-800/20 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
        <span class="absolute top-1 left-2 text-[9px] font-bold text-slate-400/50 uppercase tracking-widest pointer-events-none">Advertisement</span>
        <script type="text/javascript">
          atOptions = {
            'key' : 'ec2e4b0a2aa3fcac5cb428225d0ad9a1',
            'format' : 'iframe',
            'height' : 600,
            'width' : 160,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/ec2e4b0a2aa3fcac5cb428225d0ad9a1/invoke.js"></script>
      </div>
    </div>
```

### 📄 Bottom Match Section Ad Code Block
Place this directly after the `#matches-container` element:

```html
        <!-- Bottom Match Section Ad Banner (Visible on Both Mobile & Web View) -->
        <div class="w-full flex justify-center py-6 mt-6 border-t border-gray-100 dark:border-slate-800/40">
          <div class="flex flex-col items-center justify-center w-full">
            <script async="async" data-cfasync="false" src="https://pl29500312.effectivecpmnetwork.com/53ad722048fcb45c6570dc61ee07464f/invoke.js"></script>
            <div id="container-53ad722048fcb45c6570dc61ee07464f" class="w-full max-w-full flex justify-center"></div>
          </div>
        </div>
```
