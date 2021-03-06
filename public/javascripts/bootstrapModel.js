(function ($, document) {
　　$.model={
      modelLen:$(".model").length,
      alert:function(title, content, btnText){
       var myModal = 'myModal_'+ (this.modelLen+1);
       var myModalLabel = 'myModalLabel'+ (this.modelLen+1);
       var modelElem = '<div class="modal fade" id="'+myModal+'" tabindex="-1" role="dialog" aria-labelledby="'+ myModalLabel +'" aria-hidden="true">'+
                 '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">'+
                     '&times;</button><h4 class="modal-title" id="'+myModalLabel+'">'+
                     title
                    +'</h4></div><div class="modal-body">'+
                    content
                   +'</div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>'+
                    '<button type="button" class="btn btn-primary">'+
                     btnText
                    +'</button></div></div></div></div>';
       $("#body").append(modelElem);
       $('#'+ myModal).modal({show: true})
       $('#'+ myModal).on('hidden.bs.modal', function (e) {
         e.target.remove()
       })
      }
    }
})(jQuery, document);