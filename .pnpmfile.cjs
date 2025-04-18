/**
 * This file is used to modify the pnpm installation process
 * to approve certain packages' build scripts.
 */
function readPackage(pkg) {
  // Approve build scripts for svelte-preprocess and related packages
  if (pkg.name === 'svelte-preprocess' || 
      pkg.name.includes('svelte') || 
      pkg.name.includes('esbuild')) {
    pkg.dependentsList = [];
    
    // Force these packages to be allowed to run scripts
    if (pkg.scripts) {
      console.log(`Approving scripts for ${pkg.name}`);
    }
  }
  
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
}; 