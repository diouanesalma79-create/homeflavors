<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Recipe;
use Illuminate\Support\Facades\File;

$targetDir = storage_path('app/public/recipes');
if (!File::exists($targetDir)) {
    File::makeDirectory($targetDir, 0755, true);
}

$sources = [
    realpath(__DIR__ . '/../frontend/src/assets/food'),
    realpath(__DIR__ . '/../frontend/src/assets/logo'),
    realpath(__DIR__ . '/../frontend/src/assets'), // Root assets
    $targetDir // Also sanitize what's already there
];

function sanitize($filename) {
    $info = pathinfo($filename);
    $name = strtolower(str_replace(' ', '-', $info['filename']));
    return $name . '.' . ($info['extension'] ?? '');
}

$mapping = [];

foreach ($sources as $source) {
    if (!$source || !File::exists($source)) continue;
    
    // Use File::files to get only files in the immediate directory (not recursive yet)
    $files = File::files($source);
    foreach ($files as $file) {
        $oldName = $file->getFilename();
        if (File::isDirectory($file->getRealPath())) continue;
        
        $newName = sanitize($oldName);
        
        $targetPath = $targetDir . '/' . $newName;
        
        // Copy to target with new name
        File::copy($file->getRealPath(), $targetPath);
        
        $mapping[$oldName] = $newName;
        echo "Processed: $oldName -> $newName\n";
    }
}

// Update Database
$recipes = Recipe::all();
foreach ($recipes as $recipe) {
    if ($recipe->image_url) {
        $pathInfo = pathinfo($recipe->image_url);
        $oldFilename = $pathInfo['basename'];
        
        $newFilename = $mapping[$oldFilename] ?? sanitize($oldFilename);
        
        $recipe->image_url = 'recipes/' . $newFilename;
        $recipe->save();
        echo "Updated DB: {$recipe->id} -> recipes/$newFilename\n";
    }
}

echo "Image centralization complete.\n";
