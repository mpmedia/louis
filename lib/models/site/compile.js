var async = require('async');
var colors = require('colors');
var rimraf = require('rimraf');
var fs = require('fs');
var ncp = require('ncp').ncp;
var path = require('path');

var IndexPage = require('../indexPage');


function setupCompile(Site) {
    
    Site.prototype.cleanupDestination = function cleanupSiteDestination(force, callback) {
        if (force) {
            var outputPath = this.path('site');
            
            return rimraf(outputPath, function(err) {
                if (err) return callback(err);
                
                fs.mkdir(outputPath, callback);
            });
        }
        
        callback();
    };
    
    Site.prototype.copyStatics = function copyStatics(callback) {
        var outputPath = this.path('site');
        var inputPath = this.path('theme/static');
        
        this.emit('willCompileStatics', this);
        
        var _this = this;
        
        ncp(
            inputPath, 
            outputPath, 
            {
                clobber: true,
                filter: function(name) {
                    name = path.basename(name);
                    return (!name.match(/^\./));
                }
            },
            function(err) {
                _this.emit('didCompileStatics', this);
                callback(err);
            }
        );
    };
    
    Site.prototype.renderPages = function renderSitePages(callback) {
        this.pageArchive.deploy(callback);
    };
    
    Site.prototype.renderPosts = function renderSitePosts(callback) {
        this.postArchive.deploy(callback);
    };
    
    Site.prototype.renderSpecials = function renderSpecials(callback) {
        var _this = this;
        
        async.parallel(
            [
                function(callback) {
                    _this.indexPage.deploy(callback);
                },
                function(callback) {
                    _this.emit('willDeployFeed');
                    
                    _this.feed.deploy(function(err) {
                        _this.emit('didDeployFeed');
                        
                        callback(err);
                    });
                }
            ],
        
            callback
        );
    };
    
    Site.prototype.compile = function compileSite(force, callback) {
        var _this = this;
        
        this.emit('willCompile', this);
        
        async.series(
            [
                function(callback) {
                    _this.cleanupDestination(force, callback)
                },
                this.copyStatics.bind(this),
                this.renderPages.bind(this),
                this.renderPosts.bind(this),
                this.renderSpecials.bind(this),
            ],
        
            function(err) {
                if (!err) {
                    _this.pageArchive.saveCache();
                    _this.postArchive.saveCache();
                }

                _this.emit('didCompile', this);
        
                callback(err);
            }
        );
    }
    
}

module.exports = setupCompile;