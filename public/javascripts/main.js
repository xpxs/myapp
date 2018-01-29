require.config({
  paths: {
    "jquery": "bower_components/jquery/dist/jquery.min",
    "j_validate": "plug-in/jquery-validation-1.14.0/dist/jquery.validate.min",
    "bootstrap": "bower_components/bootstrap/dist/js/bootstrap.min",
    "imageCenter": "lib/imageCenter",
    "$E": "lib/utils",
  },
  shim: {
    "j_validate": {
      deps: ["jquery"]
    },
    "bootstrap": {
      deps: ["jquery"]
    }
  }
});

require(['jquery', 'j_validate', 'bootstrap', 'imageCenter', '$E'], function($, jv, bs, imageCenter, $E) {
  var imageWrapList = document.querySelectorAll('.img');
  imageCenter(imageWrapList, 'wspectFill');
  var validInput = {
    rules: {
      name: {
        required: true,
        minlength: 2
      },
      password: {
        required: true,
        minlength: 5
      },
      password_repeat: {
        required: true,
        minlength: 5,
        equalTo: "#password"
      },
      email: {
        // required: true,
        email: true
      },
      // topic: {
      //     required: "#newsletter:checked",
      //     minlength: 2
      // },
      // agree: "required"
    },
    messages: {
      name: {
        required: "请输入用户名",
        minlength: "用户名必需由两个字母组成"
      },
      password: {
        required: "请输入密码",
        minlength: "密码长度不能小于 5 个字母"
      },
      password_repeat: {
        required: "请输入密码",
        minlength: "密码长度不能小于 5 个字母",
        equalTo: "两次密码输入不一致"
      },
      email: "请输入一个正确的邮箱",
      // agree: "请接受我们的声明",
      // topic: "请选择两个主题"
    }
  }
  var login_validInput = validInput;
  login_validInput.submitHandler = function(form) {
    var id = $(form).attr('id');
    var ps = $E.vals(id)
    $E.reqURL('/login', ps, function(res) {
      if (res.state) {
        $E.BSmodel.msg(res.msg, {
          callback: function() {
            location.href = '/'
          }
        })
      } else {
        $E.BSmodel.alert('错误', res.msg, function() {
          location.reload()
        })
      }
    }, function(error) {
      $E.BSmodel.alert('错误', '请求失败！', function() {
        location.reload()
      })
    })
  }
  var login_validator = $("#login_form").validate(login_validInput); //登录验证
  // debugger
  var reg_validInput = validInput;
  reg_validInput.submitHandler = function(form) {
    var id = $(form).attr('id');
    var ps = $E.vals(id)
    $E.reqURL('/reg', ps, function(res) {
      if (res.state) {
        $E.BSmodel.msg(res.msg, {
          callback: function() {
            location.href = '/'
          }
        })
      } else {
        $E.BSmodel.alert('错误', res.msg, function() {
          location.reload()
        })
      }
    }, function(error) {
      $E.BSmodel.alert('错误', '请求失败！', function() {
        location.reload()
      })
    })
  }
  var reg_validator = $("#reg_form").validate(reg_validInput); //注册验证
  $(".cancel").click(function() { //重置
    reg_validator.resetForm();
  });

  /** 个人中心修改图像和个性签名 **/
  var fileSelect = document.getElementById("fileSelect");
  var fileElem = document.getElementById("fileElem");
  $(fileSelect).click(function(){
  	fileElem.click();
  })
  $(fileElem).change(function(e) {
    // 判断上传文件类型
    var objFile = fileElem.value;
    var objType = objFile.substring(objFile.lastIndexOf(".")).toLowerCase();
    var formData = new FormData(document.forms.namedItem("userForm"));
    if (objType === ".png" || objType === ".gif" || objType === ".jpg") {
      $E.reqIMG('/uploadUserImg', formData, function(data) {
        $("#userImg").attr("src", data);
        $E.BSmodel.msg("上传成功")
      }, function(error) {
        $E.BSmodel.alert('错误', '请求失败！', function() {
          location.reload()
        })
      })
    } else {
      $E.BSmodel.alert("提示", "上传图片的格式不正确")
    }
  })
  var editorBtn = document.getElementById('editorBtn');
  var input = document.getElementById('autograph');
  $(editorBtn).click(function(e) {
    var inputVal = input.value;
    var that = e.target;
    if (that.textContent == "修改") {
      input.removeAttribute('disabled');
      input.focus();
      that.innerHTML = "保存";
    } else {
      that.innerHTML = "修改";
      input.setAttribute('disabled', 'true');
      $(input).change(function() {
        if (inputVal !== input.value) {
          $E.reqURL('/autograph', { value: input.value }, function(data) {
            $E.BSmodel.alert("提示", data)
            that.innerHTML = "修改";
            input.setAttribute('disabled', 'true');
          }, function(error) {
            $E.BSmodel.alert('错误', '请求失败！', function() {
              location.reload()
            })
          })
        }
      })
    }
  })
  /** 个人中心修改图像和个性签名 END **/
});