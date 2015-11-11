$(function(){

	// listeners
    addJobDetailLoaderListener(function(){
        // after jobDetail load.
        document.title = jobDetail.jobName + " - 屏幕输出";
        
        // get output of the job.
		// action
		$('#showScreenOutputEnd').click();
		
		if (!JobUtil.isTerminal(jobDetail.status)) {
			$('#autoRefreshButton').removeClass('hidden');
		}
    });
	
	// button event.
	$('#showScreenOutputHead').on('click', function(){
		$('#showScreenOutputEnd').removeClass('active');
		$('#showScreenOutputEndWithAuto').removeClass('active');
		if (typeof timer != 'undefined') {
			timer.stop();
		}
		$('#showScreenOutputEndWithAuto').html('尾100行(30s后自动刷新)');
		
		showScreenOutput(jobCode, 'head', 100);
	});
	
	
	$('#showScreenOutputEnd').on('click', function(){
		$('#showScreenOutputHead').removeClass('active');
		$('#showScreenOutputEndWithAuto').removeClass('active');
		if (typeof timer != 'undefined') {
			timer.stop();
		}
		$('#showScreenOutputEndWithAuto').html('尾100行(30s后自动刷新)');
		
		showScreenOutput(jobCode, 'end', 100);
	});
	
	var timer;
	
	$('#showScreenOutputEndWithAuto').on('click', function(){
		$('#showScreenOutputHead').removeClass('active');
		$('#showScreenOutputEnd').removeClass('active');
		
		if ($('#showScreenOutputEndWithAuto').hasClass('active')) {
			timer.stop();
			$('#showScreenOutputEndWithAuto').html('尾100行(30s后自动刷新)');
			return ;
		}
		var leftSec = 30;
		timer = $.timer(1000, function() {
			
			leftSec -= 1;
			
			if (leftSec == 0) {
				$('#showScreenOutputEndWithAuto').html('正在刷新');
				showScreenOutput(jobCode, 'end', 100, true);
				leftSec = 30;
			} else {
				$('#showScreenOutputEndWithAuto').html('尾100行('+leftSec+'s后自动刷新)');
			}
			
			
		}); 
		
		//first time
		showScreenOutput(jobCode, 'end', 100);
	});
	
	// function
	var showScreenOutput = function(jobCode, position, line, autorefresh) {
		if (autorefresh != true) {
			$('#output').html("加载中...");
		}
		
		jQuery.ajax({
            url: "getScreenOutput.action",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: {
                jobCode: jobCode,
				position: position,
				line : line
            },
            type: 'post',
            success: function(a, b, c){
				if (b == "success") {
					var content = a || '';
                    content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br/>');
                    $('#output').html(content);
				} else {
					var exception = c.responseJSON.exception;
	                if (exception) {
	                    Xfinity.message.alert("<b>提示：</b>获取作业屏幕输出失败!原因：" + exception);
	                }
				}
                
            },
            error: function(){
				Xfinity.message.alert("<b>提示：</b>获取作业屏幕输出失败!");
            }
        });
	}
	
})
