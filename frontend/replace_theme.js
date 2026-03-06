import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Background and borders
    content = content.replace(/bg-gray-900/g, 'bg-surface');
    content = content.replace(/bg-gray-800/g, 'bg-surface-1');
    content = content.replace(/border-gray-700/g, 'border-border');
    content = content.replace(/border-gray-800/g, 'border-border');
    content = content.replace(/border-white\/10/g, 'border-border');
    content = content.replace(/bg-black\/50/g, 'bg-white/50');
    content = content.replace(/bg-black\/40/g, 'bg-white/40');

    // Text colors
    content = content.replace(/text-gray-100/g, 'text-text');
    content = content.replace(/text-gray-200/g, 'text-text');
    content = content.replace(/text-gray-300/g, 'text-text');
    content = content.replace(/text-gray-400/g, 'text-muted');
    content = content.replace(/text-gray-500/g, 'text-muted');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    }
}

traverseDir('./src');
console.log('Done.');
