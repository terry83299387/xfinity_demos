var jobDetail;

var listeners = new Array();

var terminateJob = function(){
    JobUtil.terminateJob(jobDetail.jobCode, jobDetail.jobName);
}

// load job detail
var loadJobDetail = function(){
    jQuery.ajax({
        url: "showJobDetail.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
            jobCode: jobCode
        },
        type: 'post',
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>获取作业详细信息失败!原因：" + exception);
            }
            else {
                jobDetail = c.responseJSON.jobDetail;
                $('#jobName').html(jobDetail.jobName);
                showJobDetail(c.responseJSON.jobDetail);
                
                for (f in listeners) {
                    listeners[f]();
                }
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取作业详细信息失败!原因：" + exception);
        }
    });
}

var hasResidualChart = function(category){
    if (category.indexOf("fluent") == -1 &&
    category.indexOf("starccm") == -1 &&
    category.indexOf("starcd") == -1 &&
    category.indexOf("cfx") == -1) {
        return false;
    }
    return true;
}

var handleButton = function(jobDetail){

    function handleButtonByJob(jobDetail){
		
		$('#showFileList').removeClass('hidden');
		$('#showOutput').removeClass('hidden');
		
        if (!JobUtil.isTerminal(jobDetail.status)) {
            $('#terminateJobBtn').removeClass('hidden');
        }
        else {
            $('#terminateJobBtn').addClass('hidden');
        }
        
        if (hasResidualChart(jobDetail.softwareCategory)) {
            $('#jobResidualBtn').removeClass('hidden');
        }
        
//        if (groupType != 1) { // not scientific
//            $('#commandBtn').removeClass('hidden');
//        }
        showCommand();
        // TODO remoteDesktopBtn
    }
    
    switch (roleCode) {
        case "group-admin":
            handleButtonByJob(jobDetail);
            break;
        case "sub-user":
            if (currentUserName == jobDetail.userName) {
                handleButtonByJob(jobDetail);
            }
            break;
        case "publisher":
            handleButtonByJob(jobDetail);
            break;
        case "supporter":
            if (currentUserName == jobDetail.userName) {
                handleButtonByJob(jobDetail);
            }
            break;
    }
}

// 刷新页面元素

var showJobDetail = function(jobDetail){
    handleButton(jobDetail);
    
    var jobDetailInfo = "";
    
    if (jobDetail.localJobId != null) {
        jobDetailInfo += jobDetail.clusterName + ": " + jobDetail.localJobId;
    }
    else {
        jobDetailInfo += jobDetail.clusterName;
    }
    
    jobDetailInfo += "<br>作业状态: " + JobUtil.status2humanReadable(jobDetail.status) + "<span id='jobRealStatus' class='hidden'>  - <font color='red'></font><i id='jobRealStatusHelp' data-placement='right' data-toggle='tooltip' title='' class='-o-notch -upload fa fa-question-circle text-success'></i></span>";
    jobDetailInfo += "<span id='jobEndTime' class='hidden'></span>";
    jobDetailInfo += "<span id='jobQueueInfo' class='hidden'><br>在主机排队原因: <font color='red'></font><i id='jobRealQueueInfo' data-placement='right' data-toggle='tooltip' title='' class='-circle -o-notch -upload fa fa-info-circle fa-lg text-success'></i></span>";
	
    switch (jobDetail.status) {
        case "queuing":
            showJobQueueInfo(jobDetail.jobCode);
            break;
        case "active":
            showJobRealStatusInfo(jobDetail.jobCode);
            if (jobDetail.softwareCategory == "dyna") {
                showJobEndTime(jobDetail.jobCode);
            }
            break;
    }
    
    if (jobDetail.cpuNum > 0) {
        jobDetailInfo += "<br>核数:" + jobDetail.cpuNum + "核";
    }
    
    if (jobDetail.cpuTime >= 0) {
        jobDetailInfo += "<br>CPU机时:" + jobDetail.cpuTime + "秒";
    }
    
    if (jobDetail.errorMsg != null) {
        jobDetailInfo += "<br>失败原因:<font color='red'>" + jobDetail.errorMsg + "</font>";
    }
	
	if (jobDetail.queueInfoInXfinity != null) {
        jobDetailInfo += "<br>在Xfinity排队原因:<font color='red'>" + jobDetail.queueInfoInXfinity + "</font>";
    }
    
    $('#jobDetail').html(jobDetailInfo);
    
    
    var jobDetailTimeLine = "";
    
    if (jobDetail.lsfDispatchTime > 0) {
        jobDetailTimeLine += Xfinity.Util.formatTime(jobDetail.lsfDispatchTime) + " 作业开始执行";
    }
    
    if (jobDetail.lsfEndTime > 0) {
        jobDetailTimeLine += "<br>" + Xfinity.Util.formatTime(jobDetail.lsfEndTime) + " 作业计算完成";
    }
    
    $('#jobDetailTimeLine').html(jobDetailTimeLine);
    
    // refresh more info
    var moreInfo = "";
    moreInfo += '项目:' + jobDetail.projectName;
    moreInfo += '<br>队列:' + jobDetail.queueName;
    moreInfo += '<br>工作目录:' + jobDetail.jobWorkDir;
    moreInfo += '<br>用户:' + jobDetail.userName;
    moreInfo += '<br>应用:' + jobDetail.appName;
    
    $('#moreInfo').html(moreInfo);
}



// 加载工作目录
var showFileListInWorkdir = function(){
    Xfinity.Util.post('jsp/myXfinity/myJob/jobDetail.jsp?jobCode=' + jobCode);
}

var showOutput = function(){
    Xfinity.Util.post('jsp/myXfinity/myJob/jobOutput.jsp?jobCode=' + jobCode);
}

var showJobResidual = function(){
    Xfinity.Util.post('jsp/myXfinity/myJob/jobResidual.jsp?jobCode=' + jobCode);
}

var showRemoteDesktop = function(){

}

var cluster;
var showCommand = function() {
	// get cluster info
	jQuery.ajax({
        url: "showCmdClusterInfo.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
			projectCode : jobDetail.proCode,
            clusterCode: jobDetail.clusterCode
        },
        type: 'post',
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
               $('#commandBtn').addClass('hidden');
            }
            else {
                cluster = c.responseJSON.cluster;
				$('#commandBtn').removeClass('hidden');
            }
        },
        error: function(){
            
        }
    });
}

var openCommand = function(){
	JobUtil.openCMD({
		clientKey:cluster.clientKey,
		username:cluster.hostUserName,
		password:cluster.pwd,
		initCd: jobDetail.jobWorkDir,
		port:cluster.cmdPort
	});
}

var addJobDetailLoaderListener = function(fun){
    listeners.push(fun);
}

var showJobQueueInfo = function(jobCode){
    jQuery.ajax({
        url: "showJobQueueInfo.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
            jobCode: jobCode
        },
        type: 'post',
        success: function(a, b, c){
            var jobQueueInfo = a.jobQueueInfo;
            var jobRealQueueInfo = a.jobRealQueueInfo;
            
            if (jobQueueInfo != null && jobQueueInfo != "") {
                $('#jobQueueInfo').removeClass('hidden');
                $('#jobQueueInfo font').html(jobQueueInfo);
                if (jobRealQueueInfo != null && jobRealQueueInfo != "") {
                    $('#jobRealQueueInfo').removeClass('hidden');
                    $('#jobRealQueueInfo').attr('title', jobRealQueueInfo);
                }
            }
        },
        error: function(){
        }
    });
}

var showJobRealStatusInfo = function(jobCode){
    jQuery.ajax({
        url: "showJobRealStatusInfo.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
            jobCode: jobCode
        },
        type: 'post',
        success: function(a, b, c){
            var jobRealStatusInfo = a.jobRealStatusInfo;
            var jobRealStatusHelp = a.jobRealStatusHelp;
            
            if (jobRealStatusInfo != null && jobRealStatusInfo != "") {
                $('#jobRealStatus').removeClass('hidden');
                $('#jobRealStatus font').html(jobRealStatusInfo);
                $('#jobRealStatusHelp').attr('title', jobRealStatusHelp);
            }
        },
        error: function(){
        }
    });
}

var showJobEndTime = function(jobCode){
    jQuery.ajax({
        url: "showJobEndTime.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: {
            jobCode: jobCode
        },
        type: 'post',
        success: function(a, b, c){
            var jobEndTime = a.jobEndTime;
            if (jobEndTime != null && jobEndTime != "" && jobEndTime > 0) {
                $('#jobEndTime').html("<br>预计结束时间: <font color='red'>" + jobEndTime + "秒</font>");
                $('#jobEndTime').removeClass('hidden');
            }
        },
        error: function(){
        }
    });
}


$(function(){

    Xfinity.Util.showTooltip();
    
    // 页面动态效果
    $('#moreBtn').click(function(){
        var moreInfo = $('#moreInfo');
        if (moreInfo.hasClass('hidden')) {
            moreInfo.removeClass('hidden');
        }
        else {
            moreInfo.addClass('hidden');
        }
    });
    
    // 页面动态效果 done
    
    
    // 页面按钮done
    
    
    loadJobDetail();
});
