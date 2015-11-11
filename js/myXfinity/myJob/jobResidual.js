$(function(){
	
	// listeners
    addJobDetailLoaderListener(function(){
        // after jobDetail load.
        document.title = jobDetail.jobName + " - 参差曲线";
        
		if (JobUtil.isTerminal(jobDetail.status)) {
			$('#autoRefreshJobResidualChartsBtn').addClass('hidden');
		} else {
			$('#autoRefreshJobResidualChartsBtn').removeClass('hidden');
		}
		
        // get resdual  of the job.
		// action
		$('#refreshJobResidualChartsBtn').click();
    });
	
	var timer;
	
		    
	
	var write = function(settings, data) {
		var so = new SWFObject("lib/amline/amline.swf", "_flash", "100%", "100%", "8", "#FFFFFF");
	    so.addVariable("path", "lib/amline/");
	    
	    so.addVariable("chart_settings", settings);
	    so.addVariable("chart_data", data);
	    
	    so.addParam("wmode", "opaque");
	    so.write("jobResidualCharts");
	    so = null;
	}
	
	// test sample
//	var settings = "<settings><data_type>csv</data_type><preloader_on_reload>true</preloader_on_reload><add_time_stamp>false</add_time_stamp><depth>20</depth><digits_after_decimal>0</digits_after_decimal><redraw>true</redraw><hide_bullets_count>30</hide_bullets_count><rescale_on_hide>false</rescale_on_hide><scientific_max>0</scientific_max><values><y_left><max>1</max></y_left></values><axes><y_left><logarithmic>true</logarithmic></y_left><x><tick_length>10</tick_length></x></axes><grid><x><approx_count>30</approx_count></x></grid><graphs><graph gid='0'><axis>left</axis><title>continuity</title></graph><graph gid='1'><axis>left</axis><title>x-velocity</title></graph><graph gid='2'><axis>left</axis><title>y-velocity</title></graph><graph gid='3'><axis>left</axis><title>z-velocity</title></graph><graph gid='4'><axis>left</axis><title>k</title></graph><graph gid='5'><axis>left</axis><title>epsilon</title></graph></graphs></settings>";
//	var data = "1;1.0000e+00;1.9893e+01;2.1673e+01;6.6069e-07;7.8184e+00;6.9000e+03";
//	write(settings, data);


	$('#refreshJobResidualChartsBtn').click(function(){
		if (typeof timer != 'undefined') {
			timer.stop();
			$('#autoRefreshJobResidualChartsBtn').html('自动刷新');
			$('#autoRefreshJobResidualChartsBtn').removeClass('active');
		}
		
		loadJobResidualCharts();
	});
	
	$('#autoRefreshJobResidualChartsBtn').click(function(){
		if ($('#autoRefreshJobResidualChartsBtn').hasClass('active')) {
			timer.stop();
			$('#autoRefreshJobResidualChartsBtn').html('自动刷新');
			return;
		}
		var leftSec = 30;
		$('#autoRefreshJobResidualChartsBtn').html(leftSec+'s后再次刷新');
		timer = $.timer(1000, function() {
			
			leftSec -= 1;
			
			if (leftSec == 0) {
				$('#autoRefreshJobResidualChartsBtn').html('正在刷新');
				loadJobResidualCharts();
				leftSec = 30;
			} else {
				$('#autoRefreshJobResidualChartsBtn').html(leftSec+'s后再次刷新');
			}
			
		}); 
		
		//first time
		loadJobResidualCharts();
	});
	
	var loadJobResidualCharts = function() {
//		alert('load job residual charts');
		jQuery.ajax({
	        url: "showJobGraphInfo.action",
	        contentType: "application/x-www-form-urlencoded; charset=utf-8",
	        data: {
	        	jobCode:jobDetail.jobCode,
	        	recordCount:50
//	        	sourceFile:sourceFile // TODO support cfx source file
	        		
	        },
	        type: 'post',
	        success: function(a, b, c){
				if (a.exception != null) {
					$('#noDataAlert').removeClass('hidden');
					$('#noDataAlert').html(a.exception);
				} else {
					var settings = c.responseJSON.jobGraphInfo.chartSettings;
					var data = c.responseJSON.jobGraphInfo.chartData;
					if (data == null || data == "" || settings == null || settings == "") {
			            $('#noDataAlert').removeClass('hidden');
			            return;
			        }
			
					write(settings, data);
				}
	            
	        },
	        error: function(){
	            
	        }
	    });
	}

	
	       
});
