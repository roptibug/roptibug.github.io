/**
 * @rbug.common
 * 1. XMLHttpRequest Interceptor (Request[0].finish 처리)
 * 2. 각 공통 컴포넌트 기본 실행(rbug.component.js 참고, 사용법은 개발가이드-백오피스.html 확인)
 */
(function(XHR){
	'use strict';
	/**
	 * @XMLHttpRequest.open
	 * ajax request 요청 카운트를 구한다. (비동기일때 로딩이 스타트된다.)
	 */
	var open = XHR.prototype.open;
    var requestCount = 0
    XHR.prototype.open = function(method, url, async, user, pass){
    	if(async){
    		rbug.loading.start();
    	}
    	requestCount++;
        this._url = url;
        open.call(this, method, url, async, user, pass);
    }
    /**
	 * @XMLHttpRequest.send
	 * 요청된 Request[0].finish() 후 응답 카운트 및 상태를 확인한다.
	 * 요청에 맞게 응답을 모두했을 경우 로딩을 끝낸다.
	 */
    var send = XHR.prototype.send;
    var responseCount = 0;
    XHR.prototype.send = function(data){
        var self = this;
        var oldOnReadyStateChange;
        var url = this._url;
        function onReadyStateChange(){
        	if(self.readyState == 4){
        		responseCount++;
        		if(requestCount == responseCount){
        			if(self.status == 600){
                    	rbug.alert.open({
            				target : 'error',
            				message : '세션이 만료되었습니다.',
            				callback : function(){
            					var response = $.parseJSON(self.response);
            					location.href = response.loginPageUrl + '?returnUrl=' 
            							+ location.pathname + (location.search && encodeURIComponent(location.search) || '');
            				}
            			});
                	} else if(self.status != 200 && self.status != 0){
        				var message = '처리 중 오류가 발생했습니다.';
        				try {
        					var response = $.parseJSON(self.response);
                    		message = response.message || message;
						} catch (e) {}
                    	rbug.alert.open({
            				target : 'error',
            				message : message
            			});
                    }
        			rbug.loading.stop();
        		}
        	}
        	if(url.indexOf('.json') > 0){ //ie7 에서 테스트로 사용하는 static폴더내 '.json' 파일이 동기로 간주됨
        		rbug.loading.stop();
        	}
            if(oldOnReadyStateChange){ //ie7,8를 위한 조건
                oldOnReadyStateChange();
            }
        }
        if(this.addEventListener){
            this.addEventListener('readystatechange', onReadyStateChange, false);
        }else{
            oldOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = onReadyStateChange;
        }
        send.call(this, data);
    }
})(XMLHttpRequest);

$(function(){
	'use strict';
	//달력선택레이어(공통 - commonDatePicker 별도  클래스 선언가능)
	rbug.datePicker({
		element : $('span.commonDatePicker'),
		callback : function(e){}
	});
	//말풍선 (tooltip)
	rbug.help({
		element : $('span.rbugHelp')
	});
	//색상표
	rbug.helpColor({
		element : $('span.rbugHelpColor'), //(필수)버튼
		inputElement : $('div.helpColorInput'),
		target : $('.targetColor'),
		callback : function(){}
	});
	//test
	rbug.test({
		element : $('#guide'),
		close : $('#guide .close')
	});
	//탑,좌측메뉴(즐겨찾기)
	rbug.menu({
		element : $('div#menu')
	});
	//textarea,input 등등 byte체크
	rbug.byteChecker({
		element : $('.byteChecker')
	});
	//textarea,input 등등 글자수 체크
	rbug.lengthChecker({
		element : $('.lengthChecker')
	});
	//toggle slide
	rbug.slide({
		element : $('b.rbugSlide')
	});
	//브라우져 hack.css
	if(rbug.browser.ie7){
		$('body').addClass('ie7')
	}
	//table 정렬
	var tdSizeAuto = function(){
		$('.colT').each(function(){
			if($(this).find('tr:eq(0)').length == 0){
				return;
			}
			var width = $(this).width(),
				thWidth = $(this).find('tr:eq(0) th').width(),
				td = $(this).find('tr:eq(0) td:eq(0)'),
				tdLen = $(this).find('tr:eq(0)')[0].childElementCount/2;
			if(tdLen == 2){
				td.width(((width -	(thWidth * tdLen))/2)-80);
			}
		});
	}
	//menu scroll height
	var menuScrollResize = function(){
		$('#menu .scroll').height($(window).height() - 45);
	}
	//window resize
	$(window).resize(function(){
		menuScrollResize();
		tdSizeAuto();
	});
	tdSizeAuto();
	//valid 를 이용한 mask
	$('input,textarea').each(function(){
		if($(this).attr('data-valid')){
			try {
				var valid = '[{' + $(this).attr('data-valid') + '}]';
				valid = eval(valid.replace( /[;]/gi,','))[0];
				if (!$(this).attr('maxlength') && valid.maxlength){
					$(this).attr('maxlength', valid.maxlength);
				}
				if(valid.number || valid.digit){
					var num = 'NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN';
					if(valid.maxlength){
						num = num.substring(0,valid.maxlength);
					}
					$(this).mask(num, {
						translation: {
					        'N': {
						        pattern: (valid.number) ? /[0-9.-]/ : /[0-9]/,
						        fallback: ''
					        },
					        placeholder: ''
					    }
					});
				}
			} catch (e) {
				console.error($(this).attr('data-valid') + ' - valid write error!');
			}
		}
	});

	// form내의 reset버튼 클릭시 초기화
	// hidden까지 초기화하면 안되는 화면이 있어서 각자 구현
//	$("form span.button>button[type=reset]").click(function(){
//		$(this).closest('form').clearForm(true);
//	});
});