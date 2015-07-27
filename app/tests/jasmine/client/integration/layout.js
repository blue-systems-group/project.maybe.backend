describe("home", function(){
  describe("template", function(){
    it("shows 'Maybe Backend!' heading", function(){
      expect($('#title').text()).toEqual('Maybe Backend!');
    });
  });
});
