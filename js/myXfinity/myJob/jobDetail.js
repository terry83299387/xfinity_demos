
$(function(){
    addJobDetailLoaderListener(function(){
        // after jobDetail load.
        
        function loadFileList(){
            jQuery.ajax({
                url: "jsp/myXfinity/myFile/fileList.jsp",
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                data: {
                    filePath: jobDetail.jobWorkDir,
                    clusterCode: jobDetail.clusterCode
                },
                success: function(a, b, c){
                    $('#jobWorkdirFileList').html(a);
                },
                error: function(){
                
                }
            });
        }
        
        switch (roleCode) {
            case "group-admin":
                loadFileList();
                break;
            case "sub-user":
                if (currentUserName == jobDetail.userName) {
                    loadFileList();
                }
                break;
            case "publisher":
                loadFileList();
                break;
            case "supporter":
                if (currentUserName == jobDetail.userName) {
                    loadFileList();
                }
                break;
        }
        
		document.title = jobDetail.jobName + " - 详细信息"
    });
    
});
