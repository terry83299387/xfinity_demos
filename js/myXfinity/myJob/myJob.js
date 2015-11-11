var data = {
    isTop: true
}; // request job list parameter.
var jobListTotalSize;

var statusIcon = {
    "submitting": "fa-fw -o-notch -upload fa fa-2x fa-cog fa-spin text-success",
    "active": "fa-fw -o-notch -upload fa fa-2x fa-clock-o fa-spin text-success",
    "pending": "fa-fw -o-notch -upload fa fa-2x fa-spin text-success fa-spinner",
    "staging-in": "fa-fw -o-notch -upload fa fa-2x text-success fa-angle-up",
    "staged-in": "fa-fw -o-notch -upload fa fa-2x fa-angle-double-up text-success",
    "queuing": "fa-fw -o-notch -upload fa fa-2x fa-cog fa-spin text-success",
    "staging-out": "fa-fw -o-notch -upload fa fa-2x fa-angle-down text-success",
    "staged-out": "fa-fw -o-notch -upload fa fa-2x fa-angle-double-down text-success",
    "failed": "fa-fw -o-notch -upload fa fa-2x fa-warning text-danger",
    "exit": "fa-fw -o-notch -upload fa fa-2x fa-minus-circle text-warning",
    "terminating": "fa-fw -o-notch -upload fa fa-2x fa-circle-o-notch fa-spin text-warning",
    "terminated": "fa-fw -o-notch -upload fa fa-2x fa-circle text-warning"
};

var statusTooltip = {
    "submitting": "由于资源限额，作业正在Xfinity排队等待提交",
    "active": "作业正在计算",
    "pending": "作业正在提交",
    "staging-in": "正在准备输入文件",
    "staged-in": "输入文件准备完成",
    "queuing": "由于集群资源限制，作业正在排队",
    "staging-out": "正在将结果文件回传（如果没有指定回传，则该状态会很快结束）",
    "staged-out": "已经完成结果文件回传（如果没有指定，则不会回传任何文件）",
    "failed": "作业失败，失败详情请查看作业详细信息",
    "exit": "作业进入退出状态",
    "terminating": "作业正在终止",
    "terminated": "作业进入终止态"
};

var gridt, jobStatusSet = {
    pending: '#000',
    queuing: '#30f',
    active: '#30f',
    suspend: '#ff0',
    executed: '#000',
    failed: '#f00',
    done: '#000',
    terminating: '#000',
    terminated: '#ccc',
    'undefined': '#000'
};

var detailJob = function(jobCode){
    Xfinity.Util.post('jsp/myXfinity/myJob/jobDetail.jsp', {
        jobCode: jobCode
    });
}

var deleteJob = function(jobCode, jobName){
    $('#deleteJobName').html(jobName)
    $('#deleteJobModalDiv').modal('show');
    $('#deleteJobSureBtn').html('确定');
    $('#deleteJobSureBtn').removeClass('disabled');
    // 确认
    
    $('#deleteJobSureBtn').click(function(){
        $('#deleteJobSureBtn').html('正在删除...');
        $('#deleteJobSureBtn').addClass('disabled');
        var isDeleteWorkdir =  $('#isDeleteWorkdirDiv').is(':checked');
        // ajax request
        jQuery.ajax({
            url: "hideJob.action",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: {
                jobCode: jobCode,
				isDeleteWorkdir : isDeleteWorkdir
            },
            success: function(a, b, c){
                var exception = c.responseJSON.exception;
                if (exception) {
                    Xfinity.message.alert("<b>提示：</b>删除作业失败!原因：" + exception);
                }
                else {
                    $('#' + jobCode).remove();
                }
                $('#deleteJobModalDiv').modal('hide');
            },
            error: function(a, b, c){
                $('#deleteJobModalDiv').modal('hide');
                Xfinity.message.alert("<b>提示：</b>删除作业失败!");
            }
        });
        // failed : show error
        $('#deleteJobSureBtn').unbind('click');
    });
    
}


var initSearchPanel = function(){

    // cluster list -- search
    jQuery.ajax({
        url: "listJobCountByCluster.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>失败!原因：" + exception);
            }
            else {
            
                // add all cluster tag.
                var clusterLi = $("#clusterLi").clone(true);
                clusterLi.removeClass('hidden').addClass('active');
                clusterLi.attr('id', "searchByCluster_all");
                clusterLi.find("a").prepend("全部");
                clusterLi.find("a").attr("onclick", "javascript:searchByCluster('all')");
                
                clusterLi.appendTo("#search_clusterList");
                clusterLi.show();
                
                
                var jrList = a.jrList;
                for (var i = 0; i < jrList.length; i++) {
                    var clusterLi = $("#clusterLi").clone(true);
                    var jr = jrList[i];
                    clusterLi.removeClass('hidden');
                    clusterLi.attr('id', "searchByCluster_" + jr.clusterCode);
                    clusterLi.find("a").prepend(jr.clusterName);
                    clusterLi.find("a").attr("onclick", "javascript:searchByCluster('" + jr.clusterCode + "')");
                    
                    clusterLi.appendTo("#search_clusterList");
                    clusterLi.show();
                };
                
                            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>失败!");
        }
    });
    
    // app list -- search
    jQuery.ajax({
        url: "listJobCountByApp.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>失败!原因：" + exception);
            }
            else {
            
                var appLi = $("#appLi").clone(true);
                appLi.removeClass('hidden').addClass('active');
                appLi.attr('id', "searchByApp_all");
                appLi.find("a").prepend("全部");
                appLi.find("a").attr("onclick", "javascript:searchByApp('all')");
                appLi.appendTo("#search_appList");
                appLi.show();
                
                
                var jrList = a.jrList;
                for (var i = 0; i < jrList.length; i++) {
                    var appLi = $("#appLi").clone(true);
                    var jr = jrList[i];
                    appLi.removeClass('hidden');
                    appLi.attr('id', "searchByApp_" + jr.appCode);
                    appLi.find("a").prepend(jr.appName);
                    appLi.find("a").attr("onclick", "javascript:searchByApp('" + jr.appCode + "')");
                    
                    appLi.appendTo("#search_appList");
                    appLi.show();
                };
                
                            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>失败!");
        }
    });
}

var searchTime = function(tag){

    var oldTag = data.time;
    
    if (typeof oldTag == 'undefined' || oldTag == null) {
        $('#searchTime_all').removeClass('active');
    }
    else {
        $('#searchTime' + oldTag).removeClass('active');
    }
    
    $('#searchTime' + tag).addClass('active');
    
    if (tag != oldTag) {
    
        if (tag == '_all') {
            delete data.time
        }
        else {
            data.time = tag;
        }
        
        initJobTable();
    }
    
}

var searchByCluster = function(tag){


    var oldTag = data.clusterCode;
    
    if (typeof oldTag == 'undefined' || oldTag == null) {
        $('#searchByCluster_all').removeClass('active');
    }
    else {
        $('#searchByCluster_' + oldTag).removeClass('active');
    }
    
    $('#searchByCluster_' + tag).addClass('active');
    
    if (tag != oldTag) {
    
        if (tag == 'all') {
            delete data.clusterCode
        }
        else {
            data.clusterCode = tag;
        }
        
        initJobTable();
    }
    
}

var searchByApp = function(tag){

    var oldTag = data.appCode;
    
    if (typeof oldTag == 'undefined' || oldTag == null) {
        $('#searchByApp_all').removeClass('active');
    }
    else {
        $('#searchByApp_' + oldTag).removeClass('active');
    }
    
    $('#searchByApp_' + tag).addClass('active');
    
    if (tag != oldTag) {
    
        if (tag == 'all') {
            delete data.appCode
        }
        else {
            data.appCode = tag;
        }
        
        initJobTable();
    }
    
}

var initJobTable = function(start, limit){
    var firstTr = $("#row").clone(true);
    $("#table-body").find("tr").remove();
    firstTr.appendTo("#table-body");
    
    if (typeof start == 'undefined') {
        start = 0;
    }
    data.start = start;
    
    if (typeof limit != 'undefined' &&
    data.limit == null) {
        data.limit = limit;
    }
    
    jQuery.ajax({
        url: "showJobList.action",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: data,
        success: function(a, b, c){
            var exception = c.responseJSON.exception;
            if (exception) {
                Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception);
            }
            else {
				jobListTotalSize = a.totalSize;
				if (jobListTotalSize <= 0) {
					$('#noJobTip').removeClass('hidden');
					$('#table').addClass('hidden');
					
				} else {
					$('#noJobTip').addClass('hidden');
					$('#table').removeClass('hidden');
					addJobRow(c.responseJSON.jobList);
                
	                $.turnPageBar.init({
	                    reload: initJobTable,
	                    sum: jobListTotalSize,
	                    start: start + 1,
	                    size: Xfinity.Util.pageSize
	                });
				}
            }
        },
        error: function(){
            Xfinity.message.alert("<b>提示：</b>获取列表失败!原因：" + exception);
        }
    });
}

var addJobRow = function(jobList){
    var num = -1;
    var firstTr = $("#row");
    
    var showDescription = false;
    var showUserName = false;
    
    $.each(jobList, function(index, content){
        num++;
        var newRow;
        newRow = firstTr.clone(true).attr("id", content.jobCode);
        newRow.find("a[id='modify-link']").attr("href", "jsp/myXfinity/myJob/jobDetail.jsp?jobCode=" + content.jobCode);
        newRow.find("span[id='jobName']").html(content.jobName);
        
        if (content.localJobId != null) {
            newRow.find("span[id='info_after_code']").html(content.clusterName + " : " +
            content.localJobId);
        }
        else {
            newRow.find("span[id='info_after_code']").html(content.clusterName);
        }
        
        newRow.find("td[id='submitTime']").html(Xfinity.Util.formatTime(content.submitTime));
        
        newRow.find("td[id='description']").html(content.description);
        if (typeof content.description != "undefined" &&
        content.description != null &&
        content.description != "") {
            showDescription = true;
        }
        newRow.find("td[id='userName']").html(content.userName);
        if (content.userName != currentUserName) {
            showUserName = true;
        }
        
        var statusE = newRow.find("i[id='status']");
        
        var status = content.status;
        newRow.find("td[id='jobStatus']").html('<span style="color:' + jobStatusSet[status] + '">' + JobUtil.status2humanReadable(status) + '</span>');
        
        var tooltipMessage = statusTooltip[status];
        statusE.attr("title", tooltipMessage);
        
        var newClass = statusIcon[status];
        statusE.removeClass().addClass(newClass);
        
        function showButton(status){
            if (JobUtil.isTerminal(status)) {
                $('#' + content.jobCode +
                ' #removeBtn').removeClass('hidden');
                $('#' + content.jobCode +
                ' #removeBtn').attr("onclick", "javascript:deleteJob('" +
                content.jobCode +
                "', '" +
                content.jobName +
                "');");
            }
            else {
                $('#' +
                content.jobCode +
                ' #terminateBtn').removeClass('hidden');
                $('#' +
                content.jobCode +
                ' #terminateBtn').attr("onclick", "javascript:JobUtil.terminateJob('" +
                content.jobCode +
                "', '" +
                content.jobName +
                "')");
            }
        }
        
        newRow.find("td[id='jobNameTd']").bind('mouseenter', function(){
            switch (roleCode) {
                case "group-admin":
                    showButton(status);
                    break;
                case "sub-user":
                    if (currentUserName == content.userName) {
                        showButton(status);
                    }
                    break;
                case "publisher":
                    showButton(status);
                    break;
                case "supporter":
                    if (currentUserName == content.userName) {
                        showButton(status);
                    }
                    break;
            }
        });
        
        newRow.find("td[id='jobNameTd']").bind('mouseleave', function(){
            $('#' + content.jobCode + ' #removeBtn').addClass('hidden');
            $('#' + content.jobCode + ' #terminateBtn').addClass('hidden');
        });
        
        newRow.appendTo("#table-body");
        newRow.show();
        
    });
    
    var jobThWidth = 6;
    var submitTimeThWidth = 4;
    
    if (showDescription == true) {
        $('.descriptionTd').removeClass('hidden');
        $('#descriptionTh').removeClass('hidden');
        jobThWidth = jobThWidth - 1;
        submitTimeThWidth = submitTimeThWidth - 1;
    }
    else {
        $('#descriptionTh').addClass('hidden');
        $('.descriptionTd').addClass('hidden');
    }
    
    if (showUserName == true) {
        $('#userTh').removeClass('hidden');
        $('.userNameTd').removeClass('hidden');
        jobThWidth = jobThWidth - 1;
    }
    else {
        $('#userTh').addClass('hidden');
        $('.userNameTd').addClass('hidden');
    }
    
    $('#jobTh').removeClass().addClass('col-md-' + jobThWidth);
    $('#submitTimeTh').removeClass().addClass('col-md-' + submitTimeThWidth);
    
    firstTr.hide();
};

var initPageBar = function(){
    $.turnPageBar.init({
        reload: initJobTable,
        sum: jobListTotalSize,
        fresh: true,
        cur: 1,
        start: 1,
        to: Xfinity.Util.pageSize,
        size: Xfinity.Util.pageSize
    });
}

$(function(){
    // tooltip
    Xfinity.Util.showTooltip();
    
    // 页面动态效果
    $('#searchBtn').click(function(){
        if ($('#searchPanel').hasClass('hidden')) {
            $('#searchPanel').removeClass('hidden');
            $('#searchBtn').addClass('active');
        }
        else {
            $('#searchPanel').addClass('hidden');
            $('#searchBtn').removeClass('active');
        }
    });
    
    $('#isTopBtn').click(function(){
        if ($('#isTopBtn').hasClass('active')) {
            // untop all finish job.
            data.isTop = false;
            initJobTable();
            $('#isTopBtn').removeClass('active');
        }
        else {
            // top all unfinish job
            data.isTop = true;
            initJobTable();
            $('#isTopBtn').addClass('active');
        }
    });
    
    // 页面动态效果 done
    
    initJobTable();
    
    initSearchPanel();
    
    
    $("#refreshTable").click(function(){
        initJobTable(data.start, data.limit);
    });
    
})
