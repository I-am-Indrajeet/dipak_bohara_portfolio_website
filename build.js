/**
 * Build Script – Minifies CSS, JS, and HTML for production
 * Run: npm run build
 */

const fs = require('fs');
const path = require('path');

async function build() {
    console.log('\n  🔨 Building for production...\n');

    const publicDir = path.join(__dirname, 'public');
    const distDir = path.join(__dirname, 'dist');

    // Create dist directory structure
    const dirs = ['dist', 'dist/css', 'dist/js', 'dist/images'];
    dirs.forEach(dir => {
        const fullDir = path.join(__dirname, dir);
        if (!fs.existsSync(fullDir)) {
            fs.mkdirSync(fullDir, { recursive: true });
        }
    });

    // ──── Minify CSS ────
    try {
        const CleanCSS = require('clean-css');
        const cssInput = fs.readFileSync(path.join(publicDir, 'css', 'style.css'), 'utf8');
        const cssOutput = new CleanCSS({
            level: 2,
            compatibility: '*'
        }).minify(cssInput);

        fs.writeFileSync(path.join(distDir, 'css', 'style.css'), cssOutput.styles);
        const cssReduction = ((1 - cssOutput.styles.length / cssInput.length) * 100).toFixed(1);
        console.log(`  ✅ CSS minified: ${cssReduction}% smaller`);
    } catch (e) {
        console.log(`  ⚠️  CSS minification skipped: ${e.message}`);
        // Fallback: copy as-is
        fs.copyFileSync(
            path.join(publicDir, 'css', 'style.css'),
            path.join(distDir, 'css', 'style.css')
        );
    }

    // ──── Minify JS ────
    try {
        const { minify } = require('terser');
        const jsInput = fs.readFileSync(path.join(publicDir, 'js', 'main.js'), 'utf8');
        const jsOutput = await minify(jsInput, {
            compress: {
                drop_console: false,
                passes: 2,
                dead_code: true,
                unused: true
            },
            mangle: true,
            output: { comments: false }
        });

        fs.writeFileSync(path.join(distDir, 'js', 'main.js'), jsOutput.code);
        const jsReduction = ((1 - jsOutput.code.length / jsInput.length) * 100).toFixed(1);
        console.log(`  ✅ JS minified:  ${jsReduction}% smaller`);
    } catch (e) {
        console.log(`  ⚠️  JS minification skipped: ${e.message}`);
        fs.copyFileSync(
            path.join(publicDir, 'js', 'main.js'),
            path.join(distDir, 'js', 'main.js')
        );
    }

    // ──── Minify HTML ────
    try {
        const { minify: minifyHTML } = require('html-minifier-terser');
        const htmlInput = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
        const htmlOutput = await minifyHTML(htmlInput, {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            sortAttributes: true,
            sortClassName: true
        });

        fs.writeFileSync(path.join(distDir, 'index.html'), htmlOutput);
        const htmlReduction = ((1 - htmlOutput.length / htmlInput.length) * 100).toFixed(1);
        console.log(`  ✅ HTML minified: ${htmlReduction}% smaller`);
    } catch (e) {
        console.log(`  ⚠️  HTML minification skipped: ${e.message}`);
        fs.copyFileSync(
            path.join(publicDir, 'index.html'),
            path.join(distDir, 'index.html')
        );
    }

    // ──── Copy images ────
    const imagesDir = path.join(publicDir, 'images');
    if (fs.existsSync(imagesDir)) {
        const images = fs.readdirSync(imagesDir);
        images.forEach(img => {
            fs.copyFileSync(
                path.join(imagesDir, img),
                path.join(distDir, 'images', img)
            );
        });
        console.log(`  ✅ Images copied: ${images.length} files`);
    }

    console.log('\n  🎉 Build complete! Output: ./dist/\n');
}

build().catch(console.error);
