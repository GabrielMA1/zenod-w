param(
  [string]$SourcePath = (Join-Path $PSScriptRoot '..\assets\images\brand\zeno-symbol-white-transparent-bg.png'),
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\assets\images\brand')
)

Add-Type -AssemblyName System.Drawing

function Get-AlphaBounds {
  param([System.Drawing.Bitmap]$Bitmap)
  $rectangle = [System.Drawing.Rectangle]::new(0, 0, $Bitmap.Width, $Bitmap.Height)
  $data = $Bitmap.LockBits($rectangle, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $byteCount = [Math]::Abs($data.Stride) * $data.Height
    $pixels = [byte[]]::new($byteCount)
    [Runtime.InteropServices.Marshal]::Copy($data.Scan0, $pixels, 0, $byteCount)
    $minX = $Bitmap.Width
    $minY = $Bitmap.Height
    $maxX = -1
    $maxY = -1
    for ($y = 0; $y -lt $Bitmap.Height; $y++) {
      $row = $y * [Math]::Abs($data.Stride)
      for ($x = 0; $x -lt $Bitmap.Width; $x++) {
        if ($pixels[$row + ($x * 4) + 3] -gt 8) {
          if ($x -lt $minX) { $minX = $x }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($y -gt $maxY) { $maxY = $y }
        }
      }
    }
    if ($maxX -lt 0) { throw 'The source image has no visible pixels.' }
    return [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
  }
  finally {
    $Bitmap.UnlockBits($data)
  }
}

function Save-ZenoIcon {
  param(
    [System.Drawing.Image]$Source,
    [System.Drawing.Rectangle]$SourceBounds,
    [int]$Size,
    [double]$SafeWidth,
    [string]$FileName
  )
  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(255, 9, 12, 15))
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $targetWidth = [int][Math]::Round($Size * $SafeWidth)
      $targetHeight = [int][Math]::Round($targetWidth * $SourceBounds.Height / $SourceBounds.Width)
      $target = [System.Drawing.Rectangle]::new([int](($Size - $targetWidth) / 2), [int](($Size - $targetHeight) / 2), $targetWidth, $targetHeight)
      $graphics.DrawImage($Source, $target, $SourceBounds, [System.Drawing.GraphicsUnit]::Pixel)
    }
    finally {
      $graphics.Dispose()
    }
    $destination = Join-Path $OutputDirectory $FileName
    $bitmap.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $bitmap.Dispose()
  }
}

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $SourcePath))
try {
  $bounds = Get-AlphaBounds -Bitmap $source
  Save-ZenoIcon -Source $source -SourceBounds $bounds -Size 16 -SafeWidth 0.88 -FileName 'favicon-16.png'
  Save-ZenoIcon -Source $source -SourceBounds $bounds -Size 32 -SafeWidth 0.84 -FileName 'favicon-32.png'
  Save-ZenoIcon -Source $source -SourceBounds $bounds -Size 180 -SafeWidth 0.74 -FileName 'apple-touch-icon-180.png'
  Save-ZenoIcon -Source $source -SourceBounds $bounds -Size 192 -SafeWidth 0.74 -FileName 'icon-192.png'
  Save-ZenoIcon -Source $source -SourceBounds $bounds -Size 512 -SafeWidth 0.74 -FileName 'icon-512.png'
  Save-ZenoIcon -Source $source -SourceBounds $bounds -Size 512 -SafeWidth 0.58 -FileName 'icon-maskable-512.png'
  Write-Host "Generated optimized ZENO icon derivatives from alpha bounds $bounds."
}
finally {
  $source.Dispose()
}
