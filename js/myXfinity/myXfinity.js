//data sets
var byUserData;
var bySoftwareData;

//about color
var done_color = '#90ED7D';
var exit_color = '#FFFF00';
var terminated_color = '#7CB5EC';
var failed_color = '#F7A35C';
var hour_color = '#7F35A6';
var gray_bg = '#EEF2EA';

//software_chart
var max_softwares = 9;
function softwareChart(bySoftwareData, active) {
	if (bySoftwareData === null) {
		$('#appTip').removeClass('hidden');
		return;
	}
	$("#appUseInfo").removeClass("hidden");
	var len = active ? bySoftwareData.softNameAc.length : bySoftwareData.softName.length;
	$('#appUseInfo').highcharts({
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
			categories : active ? bySoftwareData.softNameAc : bySoftwareData.softName,
			crosshair : true,
			labels : {
				rotation : 320
			//旋转30°
			}
		},
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
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
			name : '总作业数',
			type : 'column',
			yAxis : 0,
			data : active ? bySoftwareData.jobNumAc : bySoftwareData.jobNum,
			color : done_color,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'line',
			data : active ? bySoftwareData.jobTimeAc : bySoftwareData.jobTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' h'
			},
			stack : "numOfHours"
		} ]
	});
}
//user_chart
var max_users = 7;
function userChart(byUserData, active) {
	if (byUserData === null) {
		$('#userTip').removeClass('hidden');
		return;
	}
	$("#userUseInfo").removeClass("hidden");
	var len = active ? byUserData.combinedNameAc.length : byUserData.combinedName.length;
	$('#userUseInfo').highcharts({
		chart : {
			zoomType : 'xy',
			backgroundColor : gray_bg
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
			categories : active ? byUserData.combinedNameAc : byUserData.combinedName,
			crosshair : true
		},
		yAxis : [ { // Primary yAxis
			title : {
				text : '作业数',
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
			name : 'Done',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.doneNumAc : byUserData.doneNum,
			color : done_color,
			stack : "numOfJobs"
		}, {
			name : 'Exit',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.exitNumAc : byUserData.exitNum,
			color : exit_color,
			stack : "numOfJobs"
		}, {
			name : 'Failed',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.failedNumAc : byUserData.failedNum,
			color : failed_color,
			stack : "numOfJobs"
		}, {
			name : 'Terminated',
			type : 'column',
			yAxis : 0,
			data : active ? byUserData.terminatedNumAc : byUserData.terminatedNum,
			color : terminated_color,
			stack : "numOfJobs"
		}, {
			name : '用时',
			type : 'line',
			data : active ? byUserData.jobTimeAc : byUserData.jobTime,
			color : hour_color,
			yAxis : 1,
			tooltip : {
				valueSuffix : ' 小时'
			},
			stack : "numOfHours"
		} ]
	});
}

$(document).ready(function(){
	if((roleCode=="group-admin")||(roleCode=="publisher")){
		$.ajax({
			type : "post",
			url : "groupStatisticBySoft.action",
			contentType : "application/x-www-form-urlencoded; charset=utf-8",
			data : {
				groupCode : groupCode,
				fromDate : fromDate,
				toDate : toDate
			},
			success : function(a, b, c) {
				var tmp = c.responseJSON.result;
				eval('bySoftwareData=' + tmp);
				softwareChart(bySoftwareData, true);
			}
		});
		$.ajax({
			type : "post",
			url : "groupStatisticByUser.action",
			contentType : "application/x-www-form-urlencoded; charset=utf-8",
			data : {
				groupCode : groupCode,
				fromDate : fromDate,
				toDate : toDate
			},
			success : function(a, b, c) {
				var tmp = c.responseJSON.result;
				eval('byUserData=' + tmp);
				userChart(byUserData, true);
			}
		});
	}
	if(roleCode=="sub-user"){
		$.ajax({
			type : "post",
			url : "userStatisticBySoft.action",
			contentType : "application/x-www-form-urlencoded; charset=utf-8",
			data : {
				userCode : userCode,
				fromDate : fromDate,
				toDate : toDate
			},
			success : function(a, b, c) {
				var tmp = c.responseJSON.result;
				eval('bySoftwareData=' + tmp);
				softwareChart(bySoftwareData, true);
			}
		});
	}
});