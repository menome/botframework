module.exports.swaggerDef = {
  "/test": {
    "x-swagger-router-controller": "test",
    "get": {
      "tags": [
        "Test"
      ],
      "responses": {
        "200": {
          "description": "Success"
        },
        "default": {
          "description": "Error"
        }
      }
    }
  }
}

module.exports.get = function(req,res) {
  res.send("Hella") 
}