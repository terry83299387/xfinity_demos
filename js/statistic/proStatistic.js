//data sets
var proByMonthData;
var proByUserData;
var proBySoftData;
var PROJECT_IS_STARTED = "2";
var PROJECT_IS_END = "4";
//about color
var done_color = '#90ED7D';
var exit_color = '#FFFF00';
var terminated_color = '#7CB5EC';
var failed_color = '#F7A35C';
var hour_color = '#7F35A6';
var gray_bg = '#EEF2EA';

var statusTooltip = {
	    "1": "待审批",
	    "2": "进行中",
	    "3": "未开始",
	    "4": "结束",
	    "5": "注销"
	};

var statusIcon = {
	    "1": "fa-fw -o-notch -upload fa fa-2x fa-cog fa-spin text-success",
	    "2": "fa-fw -o-notch -upload fa fa-2x fa-clock-o fa-spin text-success",
	    "3": "fa-fw -o-notch -upload fa fa-2x fa-angle-double-up text-success",
	    "4": "fa-fw -o-notch -upload fa fa-2x fa-spin text-success fa-spinner",
	    "5": "fa-fw -o-notch -upload fa fa-2x fa-warning text-danger"
	};

//get data and draw chart
/*
$(function(){
    $.ajax({
        type:   "post",
        url:    "proStatistic.action",
        contentType:    "application/x-www-form-urlencoded; charset=utf-8",
        data:   {
        	proCode   : proCode
        },
        success: function(a, b, c){
            var tmp = c.responseJSON.result;
            eval('proData='+tmp);
            proChart(proData);
        }
    });
});


function proChart(proData) {

    // Build the chart
    $('#pro_user_chart').highcharts({
    	chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: true,
            type: 'pie'
        },
        title: {
            text: title
        },
        tooltip: {
            useHTML: true,
            pointFormat: '<table><tr><td>占比: </td><td  style="text-align:right"><b>{point.percentage:.1f}%</b></td></tr><tr><td>用时：</td><td  style="text-align:right"><b>{point.y}</b></td></tr></table>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true
                },
                showInLegend: true
            }
        },
        series: [{
            name: "Projects",
            colorByPoint: true,
            data: proData
        }]
    });
}
*/


//
//added by lliang
//date:2015-09-09
//
function proStatisticBasic(proCode){
	$.ajax({
		type:   "post",
        url:    "proStatisticBasic.action",
        contentType:    "application/x-www-form-urlencoded; charset=utf-8",
        data:   {
        	proCode   : proCode
        },
        success: function(a,b,c){
        	var tmp = c.responseJSON.result;
        	if((!tmp)||(tmp=="null")){//no data
        		$("#proInfo,#dataShow").addClass("hidden");
        		$("#noData").removeClass("hidden");
        	}
        	else{
        		var bas = tmp.split(',');
        		$("#proName").text(bas[0]);
        		var status = bas[1];
        		$("#startTime").text(bas[2]);
        		$("#endTime").text(bas[3]);
        		
        		
        		var tooltipMessage = statusTooltip[status];
    		//	statusE.attr("title", tooltipMessage);
    			var newClass = statusIcon[status];
          	    $("#statusIco").addClass(newClass);
          	    $("#proStatus").text(tooltipMessage);
        		//already obtain useful data,then do further proStatistic
          	    //and only the status is "进行中" or "结束" ,then to do it.
          	    if((status == PROJECT_IS_STARTED)||(status == PROJECT_IS_END)){
          	    	$("#projectInfo").removeClass("hidden");
          	    	$("#softNum").text(bas[4]);
            		$("#userNum").text(bas[5]);
            		$("#jobNum").text(bas[6]);
            		$("#cpuTime").text(bas[7]);
            		if(bas[8] == "null") {
            			$("#isGoing").hide();
            		} else {
            			$("#goingDays").text(bas[8]);
            		}
            		$("#controlBtn").removeClass("hidden");
          	    	proStatisticByMonth(proCode);
        		if(roleCode!="sub-user"){//sub-user is not necessary to do proStatisticByUser.
        			proStatisticByUser(proCode);
        		}
        		proStatisticBySoft(proCode);
          	    }
          	    else{
          	    	$("#projectInfo").addClass("hidden");
          	    	$("#noData").removeClass("hidden").text("该项目无相关数据，您可以点击查看其它项目");
          	    }
        		
        	}
        }
	});
}

function proStatisticByMonth(proCode){
	$.ajax({
		type:	"post",
		url:	"proStatisticByMonth.action",
		contentType:    "application/x-www-form-urlencoded; charset=utf-8",
        data:   {
        	proCode   : proCode
        },
        success: function(a,b,c){
        	var tmp = c.responseJSON.result;
			eval('proByMonthData=' + tmp);
			timingChart(proByMonthData);
        }
	});
}

function proStatisticByUser(proCode){
	$.ajax({
		type : "post",
		url : "proStatisticByUser.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			proCode   : proCode
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			eval('proByUserData=' + tmp);
			userChart(proByUserData);
		}
	});
}

function proStatisticBySoft(proCode){
	$.ajax({
		type : "post",
		url : "proStatisticBySoft.action",
		contentType : "application/x-www-form-urlencoded; charset=utf-8",
		data : {
			proCode   : proCode
		},
		success : function(a, b, c) {
			var tmp = c.responseJSON.result;
			eval('proBySoftData=' + tmp);
			softwareChart(proBySoftData);
		}
	});
}

//timing_chart
var max_show = 7;
function timingChart(proByMonthData) {
	if ((!proByMonthData)||(proByMonthData=="null")) {
		$('#monthChart').text($("#noData").text());
		return;
	}
	//draw chart
	var len = proByMonthData.month;
	$('#monthChart').highcharts({
		chart : {
			zoomType : 'xy',
			backgroundColor : gray_bg
		},
		title : {
			text : '<b>按提交作业日期统计</b>'
		},
		scrollbar : {
			enabled : len > (max_show + 1)
		},
		xAxis : [ {
			categories : proByMonthData.month,
			crosshair : true
		} ],
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
				margin:20,
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			},
			labels : {
				format : '{value}',
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			}
		}, { // Secondary yAxis
			min:0,
			startOnTick: false,
			labels : {
				format : '{value}h',
				style : {
					color : hour_color
				}
			},
			title : {
				text : '用时',
				style : {
					color : hour_color
				}
			},
			opposite : true
		} ],
		tooltip : {
			shared : true,
			useHTML : true,
			formatter : function() {
				var s = '<b>' + this.x + '</b><table>';
				var flag = 0;
				$.each(this.points, function() {
					if (this.series.name != '用时') {
						if (flag === 0) {
							s += '<tr>';
							s += '<td>总作业数：</td>' + '<td style="text-align:right"><b>' + this.point.stackTotal + '</b></td>';
							s += '</tr>';
							flag = 1;
						}
					} else {
						s += '<tr>';
						s += '<td>' + this.series.name + ': </td>' + '<td style="text-align:right"><b>' + this.y + 'h' + '</b></td>';
						s += '</tr>';
					}
				});
				s += '</table>';
				return s;
			}
		},
		legend : {
			layout : 'vertical',
			align : 'right',
			x : -100,
			verticalAlign : 'top',
			y : 80,
			floating : true,
			backgroundColor : (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderColor : '#CCC',
			borderWidth : 1,
			shadow : true
		},
		plotOptions : {
			column : {
				stacking : 'normal',
				dataLabels : {
					enabled : true,
					color : (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
					style : {
						textShadow : '0 0 3px black'
					}
				}
			}
		},
		series : [ {
			name : '作业数',
			color : done_color,
			type : 'column',
			yAxis : 0,
			data : proByMonthData.jobNum,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'column',
			data : proByMonthData.cpuTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' 小时'
			},
			stack : "numOfHours"
		} ]
	});
}

//user_chart
var max_users = 7;
function userChart(proByUserData) {
	if ((!proByUserData)||(proByUserData=="null")) {
		$('#userChart').text($("#noData").text());
		return;
	}
	var len = proByUserData.userList.length;
	$('#userChart').highcharts({
		chart : {
			zoomType : 'xy',
		},
		title : {
			text : '<b>按用户统计</b>',
			x : -20
		//center
		},
		scrollbar : {
			enabled : len > (max_users + 1)
		},
		xAxis : {
			max : (len > (max_users + 1) ? (max_users + 1) : len) - 1,
			min : 0,
			categories : proByUserData.userList,
			crosshair : true
		},
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
				margin:20,
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			},
			labels : {
				format : '{value}',
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			}
		}, { // Secondary yAxis
			min:0,
			startOnTick: false,
			labels : {
				format : '{value}h',
				style : {
					color : hour_color
				}
			},
			title : {
				text : '用时',
				style : {
					color : hour_color
				}
			},
			opposite : true
		} ],
		tooltip : {
			shared : true,
			useHTML : true,
			formatter : function() {
				var s = '<b>' + this.x + '</b><table>';
				var flag = 0;
				$.each(this.points, function() {
					if (this.series.name != '用时') {
						if (flag === 0) {
							s += '<tr>';
							s += '<td>总作业数：</td>' + '<td style="text-align:right"><b>' + this.point.stackTotal + '</b></td>';
							s += '</tr>';
							flag = 1;
						}
					} else {
						s += '<tr>';
						s += '<td>' + this.series.name + ': </td>' + '<td style="text-align:right"><b>' + this.y + 'h' + '</b></td>';
						s += '</tr>';
					}
				});
				s += '</table>';
				return s;
			}
		},
		legend : {
			layout : 'vertical',
			align : 'right',
			x : -100,
			verticalAlign : 'top',
			y : 20,
			floating : true,
			backgroundColor : (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderColor : '#CCC',
			borderWidth : 1,
			shadow : true
		},
		plotOptions : {
			column : {
				stacking : 'normal',
				dataLabels : {
					enabled : true,
					color : (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
					style : {
						textShadow : '0 0 3px black'
					}
				}
			}
		},
		series : [ {
			name : '作业数',
			type : 'column',
			yAxis : 0,
			data : proByUserData.jobNum,
			color : done_color,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'column',
			data : proByUserData.cpuTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' 小时'
			},
			stack : "numOfHours"
		} ]
	});
}

//software_chart
var max_softwares = 7;
function softwareChart(proBySoftData) {
	if ((!proBySoftData)||(proBySoftData=="null")) {
		$('#softChart').text($("#noData").text());
		return;
	}
	var len = proBySoftData.softList.length;
	$('#softChart').highcharts({
		chart : {
			zoomType : 'xy',
			backgroundColor : gray_bg
		},
		title : {
			text : '<b>按使用软件统计</b>',
			x : -20
		//center
		},
		scrollbar : {
			enabled : len > (max_softwares + 1)
		},
		xAxis : {
			useHTML : true,
			max : (len > (max_softwares + 1) ? (max_softwares + 1) : len) - 1,
			min : 0,
			categories : proBySoftData.softList,
			crosshair : true,
			labels : {
				rotation : 320
			//旋转30°
			}
		},
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
				margin:20,
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			},
			labels : {
				format : '{value}',
				style : {
					color : Highcharts.getOptions().colors[0]
				}
			}
		}, { // Secondary yAxis
			min:0,
			startOnTick: false,
			labels : {
				format : '{value}h',
				style : {
					color : hour_color
				}
			},
			title : {
				text : '用时',
				style : {
					color : hour_color
				}
			},
			opposite : true
		} ],
		tooltip : {
			shared : true,
			useHTML : true,
			formatter : function() {
				var s = '<b>' + this.x + '</b><table>';
				var flag = 0;
				$.each(this.points, function() {
					if (this.series.name != '用时') {
						if (flag === 0) {
							s += '<tr>';
							s += '<td>总作业数：</td>' + '<td style="text-align:right"><b>' + this.point.stackTotal + '</b></td>';
							s += '</tr>';
							flag = 1;
						}
					} else {
						s += '<tr>';
						s += '<td>' + this.series.name + ': </td>' + '<td style="text-align:right"><b>' + this.y + 'h' + '</b></td>';
						s += '</tr>';
					}
				});
				s += '</table></a>';
				return s;
			}
		},
		legend : {
			layout : 'vertical',
			align : 'right',
			x : -100,
			verticalAlign : 'top',
			y : 20,
			floating : true,
			backgroundColor : (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
			borderColor : '#CCC',
			borderWidth : 1,
			shadow : true
		},
		plotOptions : {
			column : {
				stacking : 'normal',
				dataLabels : {
					enabled : true,
					color : (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
					style : {
						textShadow : '0 0 3px black'
					}
				}
			}
		},
		series : [ {
			name : '作业数',
			type : 'column',
			yAxis : 0,
			data : proBySoftData.jobNum,
			color : done_color,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'column',
			data : proBySoftData.cpuTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' h'
			},
			stack : "numOfHours"
		} ]
	});
}

function naviTo(toId) {
	$('body,html').animate({
		scrollTop : $('#' + toId).offset().top
	}, 400);
}


//when document is ready,DO
$(document).ready(function(){
	proStatisticBasic(proCode);
});
