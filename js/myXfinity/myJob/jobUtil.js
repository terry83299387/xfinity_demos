var JobUtil = {
    isTerminal: function(jobStatus){
        if (jobStatus == "done" ||
        jobStatus == "failed" ||
        jobStatus == "exit" ||
        jobStatus == "terminated") {
            return true;
        }
        
        return false;
        
    },
    
    terminateJob: function(jobCode, jobName){
        $('#terminateJobName').html(jobName)
        $('#terminateJobModalDiv').modal('show');
        $('#terminateJobSureBtn').html('确定');
        $('#terminateJobSureBtn').removeClass('disabled');
        // 确认
        
        $('#terminateJobSureBtn').click(function(){
            $('#terminateJobSureBtn').html('正在终止...');
            $('#terminateJobSureBtn').addClass('disabled');
            
            // ajax request
            jQuery.ajax({
                url: "terminateJob.action",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                data: {
                    jobCode: jobCode
                },
                success: function(a, b, c){
                    var exception = c.responseJSON.exception;
                    if (exception) {
                        Xfinity.message.alert("<b>提示：</b>终止作业失败!原因：" + exception);
                    }
                    $('#terminateJobModalDiv').modal('hide');
                    
                },
                error: function(){
                    $('#terminateJobModalDiv').modal('hide');
                    Xfinity.message.alert("<b>提示：</b>终止作业失败!原因：" + exception);
                }
            });
            // failed : show error
            
            $('#terminateJobSureBtn').unbind('click');
        });
    },
	
	status2humanReadable : function(status) {
		var message;
		switch(status) {
			case "submitting":
				message = "在Xfinity排队"
				break;
			case "pending":
				message = "正在提交"
				break;
			case "queuing":
				message = "在集群排队"
				break;
			case "active":
				message = "运行中"
				break;
			case "exit":
				message = "退出"
				break;
			case "done":
				message = "正常结束"
				break;
			case "failed":
				message = "失败"
				break;
			case "terminating":
				message = "正在终止"
				break;
			case "terminated":
				message = "已终止"
				break;
			default:
			    message = status
			    break;
		}

		return message;
	},
	
	openCMD : function(record) {
		var appStarter = PluginManager.getAppStarter();
			appStarter.setParameter("clientKey", record.clientKey);
			if (window.location.hostname == 'localhost') { // debug
				appStarter.setParameter("server", '192.168.120.220');
			} else {
				appStarter.setParameter("server", window.location.hostname);
			}
			appStarter.setParameter("username", record.username);
			appStarter.setParameter("password", record.password);
			appStarter.setParameter("initCd", record.initCd);
			appStarter.setParameter("port", record.port);
			appStarter.setParameter("call", "kitty.exe");
			var mess = appStarter.startLocalProgram();
			if (mess) {
				addCookie("localCMDAppPath", "",24*365);
				Xfinity.message.alert(mess);
			}
	}
    
}
