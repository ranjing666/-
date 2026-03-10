$ErrorActionPreference = "Stop"

function Get-GitHubToken {
  $credential = @"
protocol=https
host=github.com

"@ | git credential fill

  $passwordLine = $credential | Select-String "^password="
  if (-not $passwordLine) {
    throw "GitHub token not found. Please authenticate GitHub first."
  }

  return $passwordLine.Line.Substring(9)
}

function Get-RepositoryInfo {
  $remoteUrl = git remote get-url origin

  if ($remoteUrl -match "^https://github\.com/(?<owner>[^/]+)/(?<repo>.+?)(\.git)?$") {
    return @{
      owner = $Matches.owner
      repo = $Matches.repo
    }
  }

  if ($remoteUrl -match "^git@github\.com:(?<owner>[^/]+)/(?<repo>.+?)(\.git)?$") {
    return @{
      owner = $Matches.owner
      repo = $Matches.repo
    }
  }

  throw "Unsupported GitHub remote URL: $remoteUrl"
}

function Invoke-GitHubJson {
  param(
    [string]$Method,
    [string]$Uri,
    [hashtable]$Headers,
    [object]$Body = $null
  )

  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers
  }

  return Invoke-RestMethod `
    -Method $Method `
    -Uri $Uri `
    -Headers $Headers `
    -Body ($Body | ConvertTo-Json -Depth 20) `
    -ContentType "application/json"
}

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

$package = Get-Content (Join-Path $root "package.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$version = $package.version
$productName = $package.build.productName
$tagName = "v$version"
$releaseName = $tagName

$distDir = Join-Path $root "dist"
$installerName = "$productName Setup $version.exe"
$assets = @(
  (Join-Path $distDir $installerName),
  (Join-Path $distDir "$installerName.blockmap"),
  (Join-Path $distDir "latest.yml")
) | Where-Object { Test-Path $_ }

if (-not (Test-Path (Join-Path $distDir $installerName))) {
  throw "Installer not found: $(Join-Path $distDir $installerName)"
}

$repoInfo = Get-RepositoryInfo
$token = Get-GitHubToken
$headers = @{
  Authorization = "Bearer $token"
  Accept = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

$releaseBody = @"
Automated release for version $version.

Assets included:
- Windows installer
- Blockmap metadata
- latest.yml
"@

$releaseApi = "https://api.github.com/repos/$($repoInfo.owner)/$($repoInfo.repo)/releases/tags/$tagName"
$createApi = "https://api.github.com/repos/$($repoInfo.owner)/$($repoInfo.repo)/releases"

try {
  $release = Invoke-GitHubJson -Method Get -Uri $releaseApi -Headers $headers
} catch {
  if ($_.Exception.Response.StatusCode.value__ -ne 404) {
    throw
  }

  $release = Invoke-GitHubJson -Method Post -Uri $createApi -Headers $headers -Body @{
    tag_name = $tagName
    target_commitish = "main"
    name = $releaseName
    body = $releaseBody
    draft = $false
    prerelease = $false
  }
}

$uploadUrl = $release.upload_url -replace "\{\?name,label\}", ""

foreach ($assetPath in $assets) {
  $assetName = Split-Path $assetPath -Leaf
  $encodedAssetName = [Uri]::EscapeDataString($assetName)
  $assetUploadUrl = "${uploadUrl}?name=$encodedAssetName"
  $existing = @($release.assets) | Where-Object { $_.name -eq $assetName }
  foreach ($asset in $existing) {
    Invoke-RestMethod `
      -Method Delete `
      -Uri "https://api.github.com/repos/$($repoInfo.owner)/$($repoInfo.repo)/releases/assets/$($asset.id)" `
      -Headers $headers | Out-Null
  }

  $uploadHeaders = @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "Content-Type" = "application/octet-stream"
  }

  Invoke-RestMethod `
    -Method Post `
    -Uri $assetUploadUrl `
    -Headers $uploadHeaders `
    -InFile $assetPath | Out-Null
}

$releaseUrl = $release.html_url
Write-Output "Release published: $releaseUrl"
