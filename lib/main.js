#!/usr/bin/env node

var path = require('path'),
	fs = require('fs'),
	program = require('commander'),
	mkdirp = require('mkdirp');

exports.gruntfile = function () {

	var lib = path.join(__dirname, '../lib'),
		libGruntfiles = lib + '/gruntfiles',
		homedir = (process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR || lib),
		userGruntfiles = homedir + '/gruntfiles',

		list = function (val) {
			return val.split(',');
		},

		use = function (name, gruntfiles) {
			var gruntfile = gruntfiles + '/' + name,
				newGruntfile = process.cwd() + '/' + 'Gruntfile.js';

			fs.readFile(gruntfile, function (err, data) {
				if (err) {
					throw err;
				}
				fs.writeFile(newGruntfile, data, function (err) {
					if (err) {
						throw err;
					}
				});
			});
			return true;
		};

	// make sure we've got a ~/gruntfiles for caching gruntfiles
	mkdirp(userGruntfiles, function (err) {
		if (err) {
			throw err;
		}

		// now, let's do work
		program
			.version('1.0.2')
			.option('-l, --list', 'list saved gruntfiles found in ~/gruntfiles')
			.option('-s, --save [name]', 'save current gruntfile to ~/gruntfiles')
			.option('-u, --use [name]', 'use a gruntfile from ~/gruntfiles')
			.option('-d, --delete [name]', 'delete a gruntfile from ~/gruntfiles')
			.parse(process.argv);

		if (program.list) {
			fs.readdir(userGruntfiles, function (err, files) {
				if (err) {
					throw err;
				}
				if (files.length === 0) {
					console.log('default');
					return true;
				}
				for (var i in files) {
					console.log(files[i]);
				}
			});
			return true;
		}

		if (program.save) {
			var gruntfile = userGruntfiles + '/' + program.save;

			fs.readFile('Gruntfile.js', function (err, data) {
				if (err) {
					if (err.code === 'ENOENT') {
						console.log('Error: Gruntfile.js was not found.');
						return false;
					}
					throw err;
				}
				fs.writeFile(gruntfile, data, function (err) {
					if (err) {
						throw err;
					}
				});
			});
			return true;
		}

		if (program.use) {
			return use(program.use, userGruntfiles);
		}

		if (program.delete) {
			if (program.delete === 'default') {
				console.log('Error: Cannot delete the default gruntfile.');
				return false;
			}
			var gruntfile = userGruntfiles + '/' + program.delete;
			fs.unlink(gruntfile, function (err) {
				if (err) {
					throw err;
				}
			});
			return true;
		}

		// otherwise, use the default gruntfile to create a new Gruntfile.js
		var defaultGruntfile = userGruntfiles + '/default';
		fs.exists(defaultGruntfile, function (exists) {
			if (!exists) {
				var libDefaultGruntfile = libGruntfiles + '/default';
				fs.readFile(libDefaultGruntfile, function (err, data) {
					if (err) {
						throw err;
					}
					fs.writeFile(defaultGruntfile, data, function (err) {
						if (err) {
							throw err;
						}
						return use('default', userGruntfiles);
					});
				});
			} else {
				return use('default', userGruntfiles);
			}
		});

	});
};
