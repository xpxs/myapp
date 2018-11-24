define(function(require) {
  var reqURL = function(url, params, success, error) { //异步ajax请求
      /*
       * success & error 回调函数
       * url 请求地址
       * params.data 请求参数
       * params.dataType 数据格式 默认json
       * params.type 请求类型 默认post
       */
      if (typeof params === 'object' && success && typeof success === 'function' && error && typeof error === 'function') {
        $.ajax({
            url: url,
            data: params,
            dataType: "json",
            type: "post"
          })
          .done(success)
          .fail(error)
      } else {
        BSmodel.alert('错误', "参数错误")
      }
    },
    reqIMG = function(url, params, success, error) {
      $.ajax({
        url: url,
        data: params,
        type: "post",
        processData:false,
        async:false,
        cache: false,
        contentType: false
      })
      .done(success)
      .fail(error)
    },
    preventDefault = function(id) { //取消默认点击事件
      /*
       * dom为页面点击元素ID名称
       */
      var submitBtn = document.getElementById(id);
      submitBtn.onclick = function(event) {
        var event = event || window.event;
        event.preventDefault(); // 兼容标准浏览器
        window.event.returnValue = false; // 兼容IE6~8
      };
    },
    vals = function(id) {
      /*
       * dom为页面点击元素ID名称
       */
      var parent = document.getElementById(id);
      var params = {}
      for (var i = 0; i < parent.length; i++) {
        if (parent.elements[i].name) {
          params[parent.elements[i].name] = parent.elements[i].value
        }
      }
      return params
    },
    BSmodel = {
      msg: function(content, obj) {
      	/*
         *content 内容
         *obj.time 延迟关闭时间
         *obj.callback 关闭后的回调
         */
        if (obj !== undefined) {
          obj.time = obj.time || 1000
          if (typeof obj.time !== "number") {
            obj.time = 1000
          }
        }else{
          var obj = {time:1000}
        }
      	var modelLen = $(".model").length;
        var myModal = 'myModal_' + (modelLen + 1);
        var myModalLabel = 'myModalLabel' + (modelLen + 1);
        var modelElem = '<div class="modal fade" id="' + myModal + '" tabindex="-1" role="dialog" aria-labelledby="' + myModalLabel + '" aria-hidden="true">' +
          '<div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-body">' +
          content +
          '</div></div></div></div>';
        $("#body").append(modelElem);
        var myModalDOM = $('#' + myModal);
        myModalDOM.modal({ show: true });
        setTimeout(function(){
        	myModalDOM.modal('hide')
        	if (obj && obj.callback && typeof obj.callback === 'function') { obj.callback() }
        }, obj.time); 
				myModalDOM.on('hidden.bs.modal', function(event) {
        	event.target.remove()
      	});
      },
      alert: function(title, content, success, close) {
        /*
         *success 确定成功回调
         *close 关闭按钮回调
         */
        var modelLen = $(".model").length;
        var myModal = 'myModal_' + (modelLen + 1);
        var myModalLabel = 'myModalLabel' + (modelLen + 1);
        var modelElem = '<div class="modal fade" id="' + myModal + '" tabindex="-1" role="dialog" aria-labelledby="' + myModalLabel + '" aria-hidden="true">' +
          '<div class="modal-dialog modal-sm"><div class="modal-content"><div class="modal-header"><button type="button" class="close">' +
          '&times;</button><h4 class="modal-title" id="' + myModalLabel + '">' + title + '</h4></div><div class="modal-body">' +
          content +
          '</div><div class="modal-footer"><button type="button" class="btn btn-primary btn-success-' + myModal + '">确定</button>' +
          '</div></div></div></div>';
        $("#body").append(modelElem);
        var myModalDOM = $('#' + myModal);
        myModalDOM.modal({ show: true });
        myModalDOM.find('.btn-success-' + myModal).on('click', function() {
          myModalDOM.modal('hide')
          if (success && typeof success === 'function') { success() }
        })
        myModalDOM.find('.close').on('click', function() {
          myModalDOM.modal('hide')
          if (close && typeof close === 'function') { close() }
        })
        myModalDOM.on('hidden.bs.modal', function(event) {
          event.target.remove()
        });
      },
      confirm: function(title, content, success, cancel, close) {
        /*
         *success 确定按钮回调
         *cancel 取消按钮回调
         *close 关闭按钮回调
         */
        var modelLen = $(".model").length;
        var myModal = 'myModal_' + (modelLen + 1);
        var myModalLabel = 'myModalLabel' + (modelLen + 1);
        var modelElem = '<div class="modal fade" id="' + myModal + '" tabindex="-1" role="dialog" aria-labelledby="' + myModalLabel + '" aria-hidden="true">' +
          '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close">' +
          '&times;</button><h4 class="modal-title" id="' + myModalLabel + '">' + title + '</h4></div><div class="modal-body">' +
          content +
          '</div><div class="modal-footer"><button type="button" class="btn btn-defalut btn-cancel-' + myModal + '">取消</button><button type="button" class="btn btn-primary btn-success-' + myModal + '">确定</button>' +
          '</div></div></div></div>';
        $("#body").append(modelElem);
        var myModalDOM = $('#' + myModal);
        myModalDOM.modal({ show: true });
        myModalDOM.find('.btn-success-' + myModal).on('click', function() {
          myModalDOM.modal('hide')
          if (success && typeof success === 'function') { success() }
        })
        myModalDOM.find('.btn-cancel-' + myModal).on('click', function() {
          myModalDOM.modal('hide')
          if (success && typeof success === 'function') { success() }
        })
        myModalDOM.find('.close').on('click', function() {
          myModalDOM.modal('hide')
          if (close && typeof close === 'function') { close() }
        })
        myModalDOM.on('hidden.bs.modal', function(event) {
          event.target.remove()
        });
      }
    }
  return {
    reqURL: reqURL,
    reqIMG: reqIMG,
    preventDefault: preventDefault,
    vals: vals,
    BSmodel: BSmodel,
  }
})