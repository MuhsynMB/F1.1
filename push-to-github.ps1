# Push Soko Chain to GitHub
# Run this script after creating the repository on GitHub.com

Write-Host "🚀 Pushing Soko Chain to GitHub..." -ForegroundColor Green

# Check if repository exists
git ls-remote origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repository exists, pushing code..." -ForegroundColor Green
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "📱 Repository URL: https://github.com/MuhsynMB/soko-chain" -ForegroundColor Cyan
        Write-Host "🔍 You can view your project at the URL above" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Push failed. Check your GitHub credentials and try again." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Repository not found. Please create it on GitHub first:" -ForegroundColor Red
    Write-Host "   1. Go to https://github.com/new" -ForegroundColor Yellow
    Write-Host "   2. Repository name: soko-chain" -ForegroundColor Yellow
    Write-Host "   3. Make it public" -ForegroundColor Yellow
    Write-Host "   4. DON'T initialize with README" -ForegroundColor Yellow
    Write-Host "   5. Click 'Create repository'" -ForegroundColor Yellow
    Write-Host "   6. Run this script again" -ForegroundColor Yellow
}
