$("#target").click(function(){ 
 
 $.ajax({ 
      type:'get', 
      url:'/URLToTriggerGetRequestHandler', 
      cache:false, 
      async:'asynchronous', 
      dataType:'json', 
      success: function(data) { 
        console.log(JSON.stringify(data)) 
      }, 
      error: function(request, status, error) { 
        console.log("Error: " + error) 
      } 
   }); 
}); 