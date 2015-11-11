
var FileUtil = new function() {
	var FILE_TYPES = {
		BMP : {
			icon : 'img.png',
			typeDesc : 'Image'
		},
		JPG : {
			icon : 'img.png',
			typeDesc : 'Image'
		},
		PNG : {
			icon : 'img.png',
			typeDesc : 'Image'
		},
		GIF : {
			icon : 'img.png',
			typeDesc : 'Image'
		},
		TXT : {
			icon : 'txt.png',
			typeDesc : 'Text'
		},
		TXT : {
			icon : 'txt.png',
			typeDesc : 'Text'
		},
		PDF : {
			icon : 'pdf.png',
			typeDesc : 'PDF'
		},
		LSF : {
			icon : 'lsf.png',
			typeDesc : 'LSF'
		},
		RAR : {
			icon : 'rar.png',
			typeDesc : 'RAR'
		},
		ZIP : {
			icon : 'rar.png',
			typeDesc : 'ZIP'
		},
		TAR : {
			icon : 'rar.png',
			typeDesc : 'TAR'
		},
		GZ : {
			icon : 'rar.png',
			typeDesc : 'GZIP'
		}
	};

	this.detectFileType = function(fileName) {
		var fileType = {
			icon : 'file.png',
			typeDesc : ''
		};

		if (fileName.indexOf('.') != -1) {
			var ext = fileName.substring(fileName.lastIndexOf('.') + 1)
					.toUpperCase();
	
			var tmp = FILE_TYPES[ext];
			if (tmp) {
				fileType = tmp;
			} else if (fileName.match(/output.\d+/)) {
				fileType = {
					icon : 'output.png',
					typeDesc : 'Output'
				};
			} else {
				fileType = {
					icon : 'txt.png',
					typeDesc : ext
				};
			}
		}

		return fileType;
	};

    /**
     * transform file size into a string with an appropriate unit.
     * 
     * e.g. 582 -> '582B'
     * 
     * @param size {Number} file size
     * 
     * @return {String} pretty file size string
     */
    this.prettyFileSize = function(size) {
    	var prettyStr = '';

    	var ONE_KB = 1 << 10,
    		ONE_MB = 1 << 20,
    		ONE_GB = 1 << 30;

		if (size < ONE_KB) {
			prettyStr = size + 'B';
		} else if (size < ONE_MB) {
			// round to the nearest tenth, the same below
			prettyStr = Math.round(size * 10 / ONE_KB) / 10 + 'KB';
		} else if (size < ONE_GB) {
			prettyStr = Math.round(size * 10 / ONE_MB) / 10 + 'MB';
		} else {
			prettyStr = Math.round(size * 10 / ONE_GB) / 10 + 'GB';
		}

		return prettyStr;
    }
}();
