var colors = require('colors');

var Site = require('../models/site');
var Error = require('../models/error');

var update = {
    
    description : 'Updates a site, generating all out-of-date pages and saving them to the /site directory',
    
    execute : function executeCompile() {
        console.log();
        console.log('    Analyzing...'.green);
                
        var site = new Site(process.cwd());

        site.load();
        site.analyze(function(err) {
            
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

                site.compile(function(err) {
                    if (err) throw err;
                
                    console.log();
                    console.log('    Compilation complete.'.green);
                    console.log();
                });
            }
        });      
        
    }
    
};

module.exports = update;