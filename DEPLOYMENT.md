# 🚀 How to Publish to GitHub Pages

Follow these simple steps to get your Windows 11 Web Desktop live on the internet!

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** button in the top right corner
3. Select **"New repository"**
4. Name it: `windows11-web-desktop`
5. Make it **Public**
6. **DO NOT** initialize with README (we already have one)
7. Click **"Create repository"**

## Step 2: Push Your Code to GitHub

Open PowerShell or Command Prompt in the project folder and run these commands:

```powershell
# Navigate to the project folder (if not already there)
cd C:\Users\Krwutarth\.gemini\antigravity\scratch\windows11-web-desktop

# Add your GitHub repository as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/windows11-web-desktop.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR-USERNAME` with your actual GitHub username!

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub: `https://github.com/YOUR-USERNAME/windows11-web-desktop`
2. Click on **"Settings"** tab (top right)
3. Scroll down and click **"Pages"** in the left sidebar
4. Under **"Source"**, select **"main"** branch
5. Keep the folder as **"/ (root)"**
6. Click **"Save"**

## Step 4: Get Your Live URL

After a few minutes, your site will be live at:

```
https://YOUR-USERNAME.github.io/windows11-web-desktop
```

You'll see a green success message in the Pages settings with your URL!

## 🎉 That's It!

Your Windows 11 Web Desktop is now live and accessible from anywhere!

---

## Alternative: Quick Deploy with GitHub CLI

If you have GitHub CLI installed:

```powershell
# Login to GitHub
gh auth login

# Create repository and push
gh repo create windows11-web-desktop --public --source=. --remote=origin --push

# Enable GitHub Pages
gh api repos/YOUR-USERNAME/windows11-web-desktop/pages -X POST -f source[branch]=main -f source[path]=/
```

---

## 📱 Share Your Link!

Once published, you can:
- Share the URL with anyone
- Access it from any device
- Bookmark it on your phone/tablet
- Use it in fullscreen mode for the best experience

## 🔧 Troubleshooting

**If you get authentication errors:**
1. Use a Personal Access Token instead of password
2. Go to GitHub Settings → Developer settings → Personal access tokens
3. Generate a new token with `repo` permissions
4. Use the token as your password when pushing

**If the page doesn't load:**
1. Wait 2-3 minutes after enabling Pages
2. Check the Actions tab for deployment status
3. Make sure the repository is Public

---

Need help? The files are ready in:
`C:\Users\Krwutarth\.gemini\antigravity\scratch\windows11-web-desktop\`
