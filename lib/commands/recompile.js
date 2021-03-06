var colors = require('colors');

var Site = require('../models/site');
var Error = require('../models/error');

var recompile = {
    
    description : 'Recompiles a site, regenerating all documents and saving them to the /site directory',
    
    execute : function executeRecompile() {
        console.log();
        console.log('    Analyzing...'.green);
                
        var site = new Site(process.cwd());
        
        site.on('willCompilePage', function(page) {
            console.log(('      - Analyzing ' + page + '...').green);
        });

        site.on('willDeployPage', function(page) {
            console.log(('      - Rendering ' + page + '...').green);
        });
        
        site.on('willCompileArchive', function(archive) {
            console.log(('      - Analyzing ' + archive.type.singular + ' archive...').green);
        });

        site.on('willDeployArchive', function(archive) {
            console.log(('      - Rendering ' + archive.type.singular + ' archive...').green);
        });
        
        site.on('willCompileFeed', function(site) {
            console.log('      - Analyzing RSS feed...'.green);
        });
        
        site.on('willDeployFeed', function(site) {
            console.log('      - Rendering RSS feed...'.green);
        });
        
        site.on('willCompileStatics', function(site) {
            console.log('      - Copying static assets...'.green);
        });

        site.load();
        site.analyze(true, function(err) {            
            if (err) throw err;
            
            if (site.hasErrors) {
                console.log();
                
                site.printAnalysis();
                
                throw new Error('Correct the errors above before compiling again.');
            }
            
            if (site.documentsToUpdate === 0) {
                console.log('    All documents are up to date.'.green);
                console.log();
            } else {
                console.log();
                console.log('    Compiling...'.green);

                site.compile(true, function(err) {
                    if (err) throw err;
                
                    console.log();
                    console.log('    Compilation complete.'.green);
                    console.log();
                });
            }
        });      
        
    }
    
};

module.exports = recompile;