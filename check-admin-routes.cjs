#!/usr/bin/env node

/**
 * Admin Route Checker - Frontend/Backend Sync Status
 * 
 * This script checks which admin routes are implemented in the backend
 * but NOT yet implemented in this frontend repo.
 * 
 * Since admin routes are implemented in a separate admin repo,
 * this helps identify gaps and track implementation status.
 * 
 * Usage:
 *   node check-admin-routes.cjs [path-to-search]
 * 
 * Example:
 *   node check-admin-routes.cjs src/
 *   node check-admin-routes.cjs .
 */

const fs = require('fs');
const path = require('path');

// All admin routes available in the backend
const adminRoutes = {
  'Artworks Management': [
    '/admin/artworks',
    '/admin/artworks/get',
    '/admin/artworks/resolve',
    '/admin/artworks/assign',
  ],
  
  'Frames Management': [
    '/admin/frames',
    '/admin/frames/resolve',
  ],
  
  'Users Management': [
    '/admin/users',
    '/admin/users/get',
    '/admin/users/update-roles',
    '/admin/users/deactivate',
    '/admin/users/reactivate',
  ],
  
  'Orders Management': [
    '/admin/orders',
    '/admin/orders/get',
    '/admin/orders/update-status',
    '/admin/orders/reassign',
    '/admin/orders/cancel',
    '/admin/orders/refund',
  ],
  
  'Payments Management': [
    '/admin/payments',
    '/admin/payments/get',
    '/admin/payments/verify',
    '/admin/payments/refund',
  ],
  
  'Printshops Management': [
    '/admin/printshops',
    '/admin/printshops/get',
    '/admin/printshops/update-service-price',
    '/admin/printshops/service-add',
    '/admin/printshops/service-status',
  ],
  
  'Reports & Analytics': [
    '/admin/reports/sales-monthly',
  ],
  
  'Development Tools': [
    '/admin/dev/simulate-orders',
    '/admin/dev/add-services',
  ],
  
  'Signups & Artists': [
    '/admin/signups',
    '/admin/artists',
    '/admin/artists/get',
  ],
};

// Flatten all routes
const allAdminRoutes = Object.values(adminRoutes).flat();

// File extensions to search
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to skip
const skipDirs = ['node_modules', '.git', 'dist', 'build', '.vite', 'coverage', 'public'];

function searchDirectory(dir, results = {}) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory not found: ${dir}`);
    return results;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!skipDirs.includes(file)) {
        searchDirectory(filePath, results);
      }
    } else if (fileExtensions.some(ext => filePath.endsWith(ext))) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const route of allAdminRoutes) {
        const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`['"\`]${escapedRoute}|${escapedRoute}['"\`]`, 'g');
        
        if (regex.test(content)) {
          if (!results[route]) {
            results[route] = [];
          }
          const relativePath = path.relative(process.cwd(), filePath);
          results[route].push(relativePath);
        }
      }
    }
  }

  return results;
}

function main() {
  const searchPath = process.argv[2] || 'src';
  
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          ADMIN ROUTES - IMPLEMENTATION STATUS                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📂 Searching in: ${path.resolve(searchPath)}`);
  console.log(`📋 Total admin routes: ${allAdminRoutes.length}`);
  console.log('');

  const results = searchDirectory(searchPath);
  
  const implementedRoutes = Object.keys(results).sort();
  const missingRoutes = allAdminRoutes.filter(route => !results[route]);

  // Show status by category
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 STATUS BY CATEGORY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  Object.entries(adminRoutes).forEach(([category, routes]) => {
    const implemented = routes.filter(r => results[r]);
    const missing = routes.filter(r => !results[r]);
    const percentage = routes.length > 0 ? ((implemented.length / routes.length) * 100).toFixed(0) : 0;
    
    // Status indicator
    let status = '❌';
    if (percentage == 100) status = '✅';
    else if (percentage > 0) status = '🔶';
    
    console.log(`${status} ${category}: ${implemented.length}/${routes.length} (${percentage}%)`);
    
    if (missing.length > 0) {
      console.log('   Missing routes:');
      missing.forEach(route => {
        console.log(`      ✗ ${route}`);
      });
    }
    console.log('');
  });

  // Implemented routes detail
  if (implementedRoutes.length > 0) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ IMPLEMENTED ADMIN ROUTES (${implementedRoutes.length})`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    implementedRoutes.forEach(route => {
      console.log(`✓ ${route}`);
      results[route].forEach(file => {
        console.log(`  └─ ${file}`);
      });
      console.log('');
    });
  }

  // Missing routes summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`⚠️  MISSING ADMIN ROUTES (${missingRoutes.length})`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (missingRoutes.length > 0) {
    console.log('These routes are available in the backend but NOT implemented');
    console.log('in this frontend repo. They may be in a separate admin repo.\n');
    
    missingRoutes.sort().forEach(route => {
      console.log(`  ✗ ${route}`);
    });
    console.log('');
  } else {
    console.log('🎉 All admin routes are implemented!\n');
  }

  // Final summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📈 OVERALL SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const totalPercentage = ((implementedRoutes.length / allAdminRoutes.length) * 100).toFixed(1);
  
  console.log(`Total Admin Routes: ${allAdminRoutes.length}`);
  console.log(`Implemented: ${implementedRoutes.length} (${totalPercentage}%)`);
  console.log(`Missing: ${missingRoutes.length}`);
  
  if (implementedRoutes.length === 0) {
    console.log('\n💡 TIP: Admin routes are likely implemented in a separate admin repository.');
    console.log('   This is common for separating admin and user-facing interfaces.');
  } else if (missingRoutes.length > 0) {
    console.log(`\n⚡ Next Steps:`);
    console.log('   1. Check if these routes are in a separate admin repo');
    console.log('   2. Decide which routes need to be added to this repo');
    console.log('   3. Create service files in src/services/ for missing routes');
    console.log('   4. Add admin UI components as needed');
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

main();
